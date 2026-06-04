// app.js — all logic for the Lunchbox PWA. Vanilla JS, no build step.
// Data lives in localStorage so the app works fully offline (planes, cruises).

'use strict';

const STORE_KEY = 'lunchbox.v1';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---------- State ----------
// Shape: { items:[..], plan:{Mon:{lunch:[],snack:[]}}, checked:{ing:true},
//          favorites:{id:true}, rotation:{category:idx} }
let state = load();

// ensure every key exists (older saves + imported backups may be missing newer ones)
function normalize(s) {
  if (!s || !Array.isArray(s.items)) s = { items: SEED_ITEMS.map(clone) };
  s.favorites = s.favorites || {};
  s.rotation = s.rotation || {};
  s.checked = s.checked || {};
  s.plan = s.plan || {};
  s.tried = s.tried || {};          // foods explored: id -> true
  s.templates = s.templates || [];  // saved week templates
  s.settings = s.settings || { theme: 'light' };
  s.shoppingExtra = s.shoppingExtra || {}; // ad-hoc shopping items: ingredient -> [source labels]
  s.draft = (s.draft && Array.isArray(s.draft.lunch)) ? s.draft : { lunch: [], snack: [] };
  return s;
}
function load() {
  let s = null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) s = JSON.parse(raw);
  } catch (e) { /* corrupt store — fall through to seed */ }
  return normalize(s);
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) {
    if (/quota/i.test((e && (e.name + e.message)) || '')) {
      try { toast('⚠️ Storage full — remove some food photos or export a backup.'); } catch (_) {}
    }
  }
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }

// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const cat = (key) => CATEGORIES.find(c => c.key === key) || { emoji: '🍽️', label: key, color: '#ccc' };
const itemById = (id) => state.items.find(i => i.id === id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const seedFlagged = (it) => (it.allergens || []).some(a => SEED_FLAG_ALLERGENS.includes(a));
// small inline badges shown under a food's name
function badges(it) {
  let b = '';
  if (it.recipe) b += '<span class="pill recipe" title="Make-ahead recipe">📖 recipe</span>';
  if (it.cold) b += '<span class="pill cold" title="Perishable — pack an ice pack">❄️ keep cold</span>';
  (it.allergens || []).forEach(a => {
    const seed = SEED_FLAG_ALLERGENS.includes(a);
    b += `<span class="pill ${seed ? 'seedflag' : 'allergen'}">${seed ? '⚠ ' : ''}${esc(a)}</span>`;
  });
  return b;
}
// a food's thumbnail: its photo if set, else the category emoji
const itemThumb = (it) => it.photo ? `<img class="item-photo" src="${esc(it.photo)}" alt="">` : cat(it.category).emoji;

let activeView = 'builder';
let builderDraft = state.draft;  // the box being packed (two slots); restored from storage
function saveDraft() { state.draft = builderDraft; save(); }
let activeSlot = 'lunch';                      // which slot the "+" buttons add to
let libraryFilter = 'all';
let librarySearch = '';

// Toddler serving-size hints by category (AAP; ~1 Tbsp per year of age starting point).
const PORTIONS = {
  protein: '~1 oz / 2 Tbsp',
  fruit:   '~2 Tbsp–¼ cup',
  veg:     '~2 Tbsp (1 Tbsp/yr)',
  grain:   '~¼–½ slice / 4 Tbsp',
  dairy:   '~½ cup milk · ⅓ cup yogurt · ½ oz cheese',
  snack:   'small handful',
};
const portionHint = (it) => it.portion || PORTIONS[it.category] || '';
const portionLine = (it) => portionHint(it) ? `<div class="portion">🍽️ toddler serving: ${esc(portionHint(it))}</div>` : '';

// Normalize a day's plan to {lunch, snack} (older saves were a flat array = lunch).
function planFor(d) {
  const p = state.plan[d];
  if (!p) return { lunch: [], snack: [] };
  return Array.isArray(p) ? { lunch: p, snack: [] } : { lunch: p.lunch || [], snack: p.snack || [] };
}
const dayCount = (d) => { const p = planFor(d); return p.lunch.length + p.snack.length; };

// ---------- Favorites + quick-fill (the bento "rotation formula") ----------
const isFav = (id) => !!state.favorites[id];
function toggleFav(id) {
  if (state.favorites[id]) delete state.favorites[id]; else state.favorites[id] = true;
  save();
}
// pick the next item in a category, rotating so variety builds over days.
// Prefers favorites in that category; falls back to all items in it.
function rotatePick(category, used) {
  const ok = (i) => i.category === category && !seedFlagged(i); // skip seed-flagged (e.g. hummus) in auto-fill
  let pool = state.items.filter(i => ok(i) && isFav(i.id));
  if (!pool.length) pool = state.items.filter(ok);
  pool = pool.filter(i => !used.has(i.id));
  if (!pool.length) return null;
  const idx = (state.rotation[category] || 0) % pool.length;
  state.rotation[category] = (state.rotation[category] || 0) + 1;
  return pool[idx].id;
}
// Build a balanced lunch (protein+grain+fruit+veg+dairy) and a snack, rotating each time.
function quickFill() {
  const used = new Set();
  const lunch = [];
  ['protein', 'grain', 'fruit', 'veg', 'dairy'].forEach(c => {
    const id = rotatePick(c, used);
    if (id) { lunch.push(id); used.add(id); }
  });
  // snack: a favorite/any snack, else a fruit
  let snackId = rotatePick('snack', used) || rotatePick('fruit', used);
  const snack = snackId ? [snackId] : [];
  builderDraft = { lunch, snack };
  activeSlot = 'lunch';
  saveDraft();
  render();
}

// Guided "let your child pick" flow — present a few big choices per food group.
function openKidPick() {
  const steps = [
    { cat: 'protein', slot: 'lunch', label: 'a protein' },
    { cat: 'fruit', slot: 'lunch', label: 'a fruit' },
    { cat: 'veg', slot: 'lunch', label: 'a veggie' },
    { cat: 'grain', slot: 'lunch', label: 'a grain' },
    { cat: 'snack', slot: 'snack', label: 'a snack' },
  ].filter(s => state.items.some(i => i.category === s.cat));
  if (!steps.length) return;
  const picks = { lunch: [], snack: [] };
  let stepIdx = 0;

  function candidates(catKey) {
    let pool = state.items.filter(i => i.category === catKey && !seedFlagged(i));
    const favs = pool.filter(i => isFav(i.id));
    if (favs.length >= 2) pool = favs;
    const start = (state.rotation['kid_' + catKey] || 0);
    state.rotation['kid_' + catKey] = start + 1;
    const k = start % pool.length;
    const rotated = pool.slice(k).concat(pool.slice(0, k));
    return rotated.slice(0, Math.min(3, rotated.length));
  }
  function next() { stepIdx++; if (stepIdx >= steps.length) finish(); else renderStep(); }
  function finish() { builderDraft = picks; activeSlot = 'lunch'; saveDraft(); closeModal(); render(); }
  function renderStep() {
    const s = steps[stepIdx];
    const body = el('<div></div>');
    body.append(el(`<h3>Pick ${esc(s.label)}! ${cat(s.cat).emoji}</h3>`));
    body.append(el(`<div class="kid-progress">Choice ${stepIdx + 1} of ${steps.length}</div>`));
    const grid = el('<div class="kid-grid"></div>');
    candidates(s.cat).forEach(it => {
      const card = el(`<button class="kid-card"><div class="kid-thumb">${itemThumb(it)}</div><div class="kid-name">${esc(it.name)}</div></button>`);
      card.onclick = () => { picks[s.slot].push(it.id); next(); };
      grid.append(card);
    });
    body.append(grid);
    const skip = el('<button class="btn ghost" style="width:100%;margin-top:6px">Skip this one</button>');
    skip.onclick = next;
    body.append(skip);
    openModal(body);
  }
  renderStep();
}

// ---------- Eat-the-rainbow ----------
const RAINBOW = [
  { key: 'red',    emoji: '🔴' },
  { key: 'orange', emoji: '🟠' },
  { key: 'yellow', emoji: '🟡' },
  { key: 'green',  emoji: '🟢' },
  { key: 'purple', emoji: '🟣' },
];
// produce colors for the seed items (user-added foods can set their own `color`)
const COLOR_BY_ID = {
  strawberries: 'red', watermelon: 'red', tomatoes: 'red', applesauce: 'red',
  'carrot-soft': 'orange', 'sweet-potato': 'orange', mandarin: 'orange',
  'banana-coins': 'yellow', pineapple: 'yellow',
  broccoli: 'green', 'green-beans': 'green', peas: 'green', cucumber: 'green', avocado: 'green', kiwi: 'green', pear: 'green', edamame: 'green',
  blueberries: 'purple',
};
const foodColor = (it) => it.color || COLOR_BY_ID[it.id] || null;
const colorsIn = (ids) => new Set(ids.map(id => foodColor(itemById(id))).filter(Boolean));

// ---------- Nutrition highlights ----------
const NUTRIENTS = [
  { key: 'iron',    emoji: '🩸', label: 'Iron' },
  { key: 'calcium', emoji: '🦴', label: 'Calcium' },
  { key: 'protein', emoji: '💪', label: 'Protein' },
  { key: 'fiber',   emoji: '🌾', label: 'Fiber' },
  { key: 'vitc',    emoji: '🍊', label: 'Vitamin C' },
  { key: 'fat',     emoji: '🥑', label: 'Healthy fat' },
];
// key-nutrient highlights per seed food (approximate, for at-a-glance balance — not a lab value)
const NUTRIENTS_BY_ID = {
  'egg-hard': ['iron', 'protein', 'fat'], 'egg-scram': ['iron', 'protein', 'fat'],
  'chicken-shred': ['iron', 'protein'], 'fish-flaked': ['protein', 'fat'], tuna: ['protein'],
  'turkey-rolls': ['protein'], 'black-beans': ['iron', 'protein', 'fiber'], chickpeas: ['iron', 'protein', 'fiber'],
  lentils: ['iron', 'protein', 'fiber'], tofu: ['iron', 'calcium', 'protein'], edamame: ['iron', 'protein', 'fiber'],
  hummus: ['protein', 'fiber'],
  blueberries: ['fiber', 'vitc'], 'banana-coins': ['fiber'], strawberries: ['vitc', 'fiber'],
  watermelon: ['vitc'], mandarin: ['vitc'], pear: ['fiber'], kiwi: ['vitc'], pineapple: ['vitc'], applesauce: ['fiber'],
  'carrot-soft': ['fiber'], 'sweet-potato': ['fiber', 'vitc'], broccoli: ['calcium', 'fiber', 'vitc'],
  'green-beans': ['fiber'], peas: ['protein', 'fiber'], cucumber: [], tomatoes: ['vitc'], avocado: ['fiber', 'fat'],
  'toast-strips': ['fiber'], 'mini-pasta': ['fiber'], 'brown-rice': ['fiber'], oatmeal: ['iron', 'fiber'],
  crackers: ['fiber'], 'rice-cakes': [], pita: ['fiber'],
  yogurt: ['calcium', 'protein', 'fat'], 'greek-yogurt': ['calcium', 'protein'], 'cheese-shred': ['calcium', 'protein', 'fat'],
  babybel: ['calcium', 'protein', 'fat'], cottage: ['calcium', 'protein'], 'cream-cheese': ['calcium', 'fat'],
  'mini-muffin': ['fiber'], 'fd-fruit': ['vitc'], 'fruit-cup': ['vitc'], 'o-cereal': ['iron', 'fiber'], 'veg-pouch': ['vitc'],
  'r-egg-muffins': ['iron', 'calcium', 'protein'], 'r-meatballs': ['iron', 'protein'],
  'r-quesadilla': ['calcium', 'protein', 'fiber'], 'r-oat-bites': ['fiber'], 'r-pinwheels': ['calcium', 'protein'],
};
const nutrientsOf = (it) => it.nutrients || NUTRIENTS_BY_ID[it.id] || [];
const nutrientsIn = (ids) => { const s = new Set(); ids.forEach(id => { const it = itemById(id); if (it) nutrientsOf(it).forEach(n => s.add(n)); }); return s; };

// ---------- Foods-tried tracker ----------
const isTried = (id) => !!state.tried[id];
function toggleTried(id) {
  if (state.tried[id]) delete state.tried[id]; else state.tried[id] = true;
  save();
}

// ---------- Shopping aisles ----------
const AISLES = ['Produce', 'Meat & seafood', 'Dairy & eggs', 'Bakery', 'Frozen', 'Pantry'];
function aisleFor(ing) {
  const s = ing.toLowerCase();
  if (/(berr|banana|apple|pear|kiwi|melon|mandarin|orange|pineapple|carrot|potato|broccoli|bean(s)?\b|pea|cucumber|avocado|tomato|spinach|pepper|fruit|veg)/.test(s)) return 'Produce';
  if (/(chicken|turkey|beef|pork|salmon|cod|tuna|fish|tofu|edamame|ground)/.test(s)) return 'Meat & seafood';
  if (/(cheese|yogurt|milk|egg|cream|cottage|babybel)/.test(s)) return 'Dairy & eggs';
  if (/(bread|tortilla|pita|bun|bagel|muffin|waffle)/.test(s)) return 'Bakery';
  if (/(frozen|freeze-dried)/.test(s)) return 'Frozen';
  return 'Pantry';
}

// ---------- Theme ----------
function applyTheme() { document.documentElement.dataset.theme = state.settings.theme || 'light'; }
function toggleTheme() { state.settings.theme = (state.settings.theme === 'dark') ? 'light' : 'dark'; save(); applyTheme(); render(); }

// ---------- Export / import ----------
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'lunchbox-backup.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.items)) throw new Error('not a lunchbox backup');
      if (!confirm('Importing replaces EVERYTHING currently in the app (foods, favorites, this week, shopping list). Continue?')) return;
      state = normalize(data);  // replace whole state, filling any missing keys
      builderDraft = state.draft;
      save(); applyTheme(); setView('builder');
    } catch (e) { alert('Could not import: ' + e.message); }
  };
  reader.readAsText(file);
}

// ---------- Week templates + day clipboard ----------
let dayClipboard = null;  // {lunch, snack} copied from a planner day
function saveTemplate(name) {
  const days = {};
  DAYS.forEach(d => { const p = planFor(d); if (p.lunch.length || p.snack.length) days[d] = p; });
  state.templates.push({ id: 't' + (state.templates.length + 1) + Object.keys(days).length, name: name || ('Week ' + (state.templates.length + 1)), days });
  save();
}
function applyTemplate(t) {
  DAYS.forEach(d => { if (t.days[d]) state.plan[d] = { lunch: [...t.days[d].lunch], snack: [...t.days[d].snack] }; });
  save();
}

// ---------- Router ----------
function setView(name) {
  activeView = name;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
  render();
}

function render() {
  const v = $('#view');
  if (activeView === 'builder') v.innerHTML = '', v.append(renderBuilder());
  else if (activeView === 'planner') v.innerHTML = '', v.append(renderPlanner());
  else if (activeView === 'library') v.innerHTML = '', v.append(renderLibrary());
  else if (activeView === 'shopping') v.innerHTML = '', v.append(renderShopping());
  window.scrollTo(0, 0);
}

// build a DOM node from an HTML string
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// ============================================================
//  VIEW 1 — Lunchbox Builder ("Pack")
// ============================================================
function renderBuilder() {
  const wrap = el('<div></div>');

  // hero banner (only worth showing on an empty box, as a friendly welcome)
  if (builderDraft.lunch.length + builderDraft.snack.length === 0) {
    wrap.append(el('<div class="hero"><img src="art/hero.png" alt="A colorful toddler bento lunch"><div class="hero-cap">Let\'s pack a happy lunch 🧡</div></div>'));
  }
  wrap.append(el('<div class="view-head"><h2>Pack a lunchbox</h2></div>'));

  // collapsible school-rules reminder
  const rules = el(`<details class="rules card"><summary>📋 ${esc(SCHOOL.name)} packing rules</summary><ul>${SCHOOL.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul></details>`);
  wrap.append(rules);

  // slot toggle: am I adding to the lunch or the snack?
  const seg = el('<div class="seg"></div>');
  [['lunch', '🍱 Lunch'], ['snack', '🍪 Snack']].forEach(([slot, label]) => {
    const n = builderDraft[slot].length;
    const b = el(`<button class="seg-btn ${activeSlot === slot ? 'on' : ''}">${label}${n ? ` · ${n}` : ''}</button>`);
    b.onclick = () => { activeSlot = slot; render(); };
    seg.append(b);
  });
  wrap.append(seg);

  // quick-fill: auto-assemble a balanced lunch + snack, rotating for variety
  const favCount = Object.keys(state.favorites).length;
  const qf = el('<div class="qf-row"></div>');
  const qfBtns = el('<div class="qf-btns"></div>');
  const qfBtn = el(`<button class="btn qf-btn">✨ Quick-fill</button>`);
  qfBtn.onclick = () => quickFill();
  const kpBtn = el(`<button class="btn secondary qf-btn">👶 Let them pick</button>`);
  kpBtn.onclick = () => openKidPick();
  qfBtns.append(qfBtn, kpBtn);
  qf.append(qfBtns);
  qf.append(el(`<div class="qf-hint">${favCount ? `Rotates through your ${favCount} ⭐ favorite${favCount > 1 ? 's' : ''} first.` : 'Star foods in the Foods tab to pull from your favorites.'}</div>`));
  wrap.append(qf);

  // balance meter — applies to the LUNCH slot
  const groups = new Set(builderDraft.lunch.map(id => itemById(id)?.category));
  const meter = el('<div class="balance"></div>');
  BALANCE_GROUPS.forEach(g => {
    const c = cat(g);
    meter.append(el(`<div class="b ${groups.has(g) ? 'on' : ''}">${c.emoji} ${c.label}</div>`));
  });
  wrap.append(el('<div class="section-label" style="margin:6px 0 4px">Lunch balance</div>'));
  wrap.append(meter);

  // eat-the-rainbow meter (colors across the whole box)
  const present = colorsIn([...builderDraft.lunch, ...builderDraft.snack]);
  const rb = el('<div class="rainbow"></div>');
  rb.append(el('<span class="rainbow-label">🌈 Rainbow</span>'));
  RAINBOW.forEach(c => rb.append(el(`<span class="rdot ${present.has(c.key) ? 'on' : 'off'}" title="${c.key}">${c.emoji}</span>`)));
  wrap.append(rb);

  // nutrition highlights covered by the box
  const nut = nutrientsIn([...builderDraft.lunch, ...builderDraft.snack]);
  const nrow = el('<div class="nutri"></div>');
  NUTRIENTS.forEach(n => nrow.append(el(`<span class="ndot ${nut.has(n.key) ? 'on' : 'off'}" title="${n.label}">${n.emoji} ${n.label}</span>`)));
  wrap.append(nrow);

  // current box summary (both slots)
  const summary = el('<div class="card box-summary"></div>');
  const total = builderDraft.lunch.length + builderDraft.snack.length;
  if (total === 0) {
    summary.append(el('<div class="empty">Tap foods below to build today\'s box. Use the 🍱 / 🍪 toggle to fill the lunch and the snack. 🍱</div>'));
  } else {
    summary.append(slotSummary('lunch', '🍱 Lunch'));
    summary.append(slotSummary('snack', '🍪 Snack'));

    // packing reminders driven by what's in the box
    const anyCold = [...builderDraft.lunch, ...builderDraft.snack].some(id => itemById(id)?.cold);
    const reminders = el('<div class="reminders"></div>');
    if (anyCold) reminders.append(el('<div class="reminder warn">❄️ This box has perishables — pack an ice pack (food shouldn\'t sit out over 2 hrs).</div>'));
    if (builderDraft.snack.length === 0) reminders.append(el('<div class="reminder warn">🍪 No snack yet — pack a lunch AND a snack each day.</div>'));
    reminders.append(el('<div class="reminder">🏷️ Label it · 🚫 no glass containers.</div>'));
    summary.append(reminders);

    const save = el('<div class="modal-actions" style="margin-top:14px"></div>');
    const toDay = el('<button class="btn">Save to a day →</button>');
    toDay.onclick = () => openSaveToDay();
    const clr = el('<button class="btn secondary">Clear</button>');
    clr.onclick = () => { builderDraft = { lunch: [], snack: [] }; saveDraft(); render(); };
    save.append(toDay, clr);
    summary.append(save);
  }
  wrap.append(summary);

  // food picker grouped by category
  wrap.append(el(`<div class="section-label picker-head">Adding to ${activeSlot === 'lunch' ? '🍱 lunch' : '🍪 snack'} — tap ➕</div>`));
  CATEGORIES.forEach(c => {
    const items = state.items.filter(i => i.category === c.key);
    if (!items.length) return;
    wrap.append(el(`<div class="section-label" style="margin-top:10px">${c.emoji} ${c.label}</div>`));
    items.forEach(it => wrap.append(builderRow(it)));
  });
  return wrap;
}

// one slot's list inside the box summary
function slotSummary(slot, label) {
  const box = el(`<div class="slot-block"><div class="slot-head">${label}</div></div>`);
  const ids = builderDraft[slot];
  if (!ids.length) { box.append(el('<div class="day-empty">empty</div>')); return box; }
  const ul = el('<ul class="box-list"></ul>');
  ids.forEach(id => {
    const it = itemById(id); if (!it) return;
    const li = el(`<li><span>${cat(it.category).emoji} ${esc(it.name)}</span></li>`);
    const rm = el('<button class="btn ghost small">Remove</button>');
    rm.onclick = () => { removeFirst(builderDraft[slot], id); saveDraft(); render(); };
    li.append(rm);
    ul.append(li);
  });
  box.append(ul);
  return box;
}

function builderRow(it) {
  const count = builderDraft[activeSlot].filter(x => x === it.id).length;
  const row = el(`
    <div class="item-row">
      <div class="item-emoji">${itemThumb(it)}</div>
      <div class="item-main">
        <div class="item-name">${isFav(it.id) ? '⭐ ' : ''}${esc(it.name)}</div>
        <div class="item-prep">${esc(it.prep)}</div>
        ${portionLine(it)}
        <div class="badges">${badges(it)}</div>
      </div>
    </div>`);
  const btn = el(`<button class="qty-btn ${count ? 'in' : ''}">${count ? count : '+'}</button>`);
  btn.onclick = () => { builderDraft[activeSlot].push(it.id); saveDraft(); render(); };
  const star = el(`<button class="star-btn ${isFav(it.id) ? 'on' : ''}" title="Favorite">${isFav(it.id) ? '⭐' : '☆'}</button>`);
  star.onclick = () => { toggleFav(it.id); render(); };
  const wrap = el('<div class="item-actions col"></div>');
  wrap.append(star, btn);
  row.append(wrap);
  return row;
}

function openSaveToDay() {
  const body = el('<div></div>');
  body.append(el('<h3>Save this box to…</h3>'));
  DAYS.forEach(d => {
    const has = dayCount(d);
    const b = el(`<button class="btn ${has ? 'secondary' : ''}" style="width:100%;margin-bottom:8px;display:block">${d}${has ? ` (replaces ${has})` : ''}</button>`);
    b.onclick = () => {
      state.plan[d] = { lunch: [...builderDraft.lunch], snack: [...builderDraft.snack] };
      builderDraft = { lunch: [], snack: [] };
      saveDraft();
      closeModal();
      setView('planner');
    };
    body.append(b);
  });
  const cancel = el('<button class="btn ghost" style="width:100%">Cancel</button>');
  cancel.onclick = closeModal;
  body.append(cancel);
  openModal(body);
}

// ============================================================
//  VIEW 2 — Weekly Planner ("Week")
// ============================================================
function renderPlanner() {
  const wrap = el('<div></div>');
  wrap.append(el('<div class="view-head"><h2>This week</h2></div>'));

  if (!DAYS.some(d => dayCount(d))) {
    wrap.append(el('<div class="empty"><img class="empty-art" src="art/empty-week.png" alt=""><div>No lunches planned yet. Pack one in the “Pack” tab, then save it to a day.</div></div>'));
  }

  // repetition warning — flag any food planned on 4+ days
  const dayUse = {}; // id -> count of days
  DAYS.forEach(d => { const seen = new Set(); const p = planFor(d); [...p.lunch, ...p.snack].forEach(id => { if (!seen.has(id)) { seen.add(id); dayUse[id] = (dayUse[id] || 0) + 1; } }); });
  const repeats = Object.keys(dayUse).filter(id => dayUse[id] >= 4 && itemById(id)).map(id => `${itemById(id).name} (${dayUse[id]}×)`);
  if (repeats.length) wrap.append(el(`<div class="reminder warn" style="margin-bottom:12px">🔁 A lot of repeats this week: ${esc(repeats.join(', '))}. Mix it up to avoid lunch ruts.</div>`));

  const chipRow = (ids) => {
    const chips = el('<div class="day-items"></div>');
    ids.forEach(id => {
      const it = itemById(id); if (!it) return;
      chips.append(el(`<span class="day-chip">${cat(it.category).emoji} ${esc(it.name)}</span>`));
    });
    return chips;
  };

  DAYS.forEach(d => {
    const { lunch, snack } = planFor(d);
    const filled = lunch.length + snack.length;
    const card = el('<div class="card day-card"></div>');
    const head = el(`<div class="day-head"><span class="day-name">${d}</span></div>`);
    const actions = el('<div class="day-actions"></div>');
    if (filled) {
      const copy = el('<button class="btn ghost small">Copy</button>');
      copy.onclick = () => { dayClipboard = JSON.parse(JSON.stringify(planFor(d))); render(); };
      actions.append(copy);
    }
    if (dayClipboard) {
      const paste = el('<button class="btn ghost small">Paste</button>');
      paste.onclick = () => { state.plan[d] = { lunch: [...dayClipboard.lunch], snack: [...dayClipboard.snack] }; save(); render(); };
      actions.append(paste);
    }
    if (filled) {
      const clr = el('<button class="btn ghost small">Clear</button>');
      clr.onclick = () => { if (confirm(`Clear ${d}'s lunch & snack?`)) { delete state.plan[d]; save(); render(); } };
      actions.append(clr);
    }
    head.append(actions);
    card.append(head);

    if (!filled) {
      card.append(el('<div class="day-empty">Nothing planned.' + (dayClipboard ? ' Tap Paste, or pack' : ' Pack') + ' one in the “Pack” tab.</div>'));
    } else {
      card.append(el('<div class="slot-head">🍱 Lunch</div>'));
      card.append(lunch.length ? chipRow(lunch) : el('<div class="day-empty">no lunch</div>'));
      const groups = new Set(lunch.map(id => itemById(id)?.category));
      const dots = el('<div class="day-balance"></div>');
      BALANCE_GROUPS.forEach(g => dots.append(el(`<div class="dot ${groups.has(g) ? 'on' : ''}" title="${cat(g).label}"></div>`)));
      const missing = BALANCE_GROUPS.filter(g => !groups.has(g)).map(g => cat(g).label);
      dots.append(el(`<span class="day-empty" style="margin:0 0 0 8px">${missing.length ? 'Missing: ' + missing.join(', ') : 'Balanced ✓'}</span>`));
      card.append(dots);
      card.append(el('<div class="slot-head" style="margin-top:10px">🍪 Snack</div>'));
      card.append(snack.length ? chipRow(snack) : el('<div class="day-empty">no snack — school needs one</div>'));
    }
    wrap.append(card);
  });

  // ---- Templates ----
  wrap.append(el('<div class="section-label" style="margin-top:18px">Week templates</div>'));
  const tpl = el('<div class="card" style="padding:12px"></div>');
  const anyPlanned = DAYS.some(d => dayCount(d));
  const saveBtn = el(`<button class="btn ${anyPlanned ? '' : 'secondary'}" style="width:100%">💾 Save this week as a template</button>`);
  saveBtn.onclick = () => {
    if (!anyPlanned) { alert('Plan at least one day first.'); return; }
    const name = prompt('Name this template:', 'Favorite week');
    if (name === null) return;
    saveTemplate(name.trim()); render();
  };
  tpl.append(saveBtn);
  state.templates.forEach((t, i) => {
    const row = el('<div class="tpl-row"></div>');
    row.append(el(`<span class="tpl-name">${esc(t.name)}</span>`));
    const apply = el('<button class="btn small">Apply</button>');
    apply.onclick = () => { applyTemplate(t); render(); };
    const del = el('<button class="btn ghost small">Delete</button>');
    del.onclick = () => { if (confirm(`Delete the “${t.name}” template?`)) { state.templates.splice(i, 1); save(); render(); } };
    row.append(apply, del);
    tpl.append(row);
  });
  wrap.append(tpl);

  // ---- Data toolbar ----
  wrap.append(el('<div class="section-label" style="margin-top:18px">Data &amp; settings</div>'));
  const bar = el('<div class="toolbar"></div>');
  const exp = el('<button class="btn secondary small">⬇️ Export</button>'); exp.onclick = exportData;
  const imp = el('<button class="btn secondary small">⬆️ Import</button>');
  imp.onclick = () => { const inp = el('<input type="file" accept="application/json,.json" style="display:none">'); inp.onchange = (e) => { if (e.target.files[0]) importData(e.target.files[0]); }; document.body.appendChild(inp); inp.click(); inp.remove(); };
  const prn = el('<button class="btn secondary small">🖨️ Print week</button>'); prn.onclick = () => window.print();
  const thm = el(`<button class="btn secondary small">${state.settings.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>`); thm.onclick = toggleTheme;
  bar.append(exp, imp, prn, thm);
  wrap.append(bar);
  return wrap;
}

// ============================================================
//  VIEW 3 — Food Library ("Foods")
// ============================================================
function renderLibrary() {
  const wrap = el('<div></div>');
  const n = Object.keys(state.tried).length;
  wrap.append(el(`<div class="view-head"><h2>Foods</h2><span id="explored" class="explored">🌈 Explored ${n} of ${state.items.length} foods</span></div>`));

  const search = el(`<input class="search" placeholder="Search foods…" value="${esc(librarySearch)}">`);
  search.oninput = (e) => { librarySearch = e.target.value; refreshList(); };
  wrap.append(search);

  const chips = el('<div class="chips"></div>');
  const mk = (key, label) => {
    const c = el(`<button class="chip ${libraryFilter === key ? 'active' : ''}">${label}</button>`);
    c.onclick = () => { libraryFilter = key; render(); };
    return c;
  };
  chips.append(mk('all', 'All'));
  chips.append(mk('recipe', '📖 Recipes'));
  CATEGORIES.forEach(c => chips.append(mk(c.key, `${c.emoji} ${c.label}`)));
  wrap.append(chips);

  const list = el('<div id="lib-list"></div>');
  wrap.append(list);
  fillLibraryList(list);

  const fab = el('<button class="btn fab">＋ Add food</button>');
  fab.onclick = () => openItemEditor(null);
  wrap.append(fab);
  return wrap;

  function refreshList() { fillLibraryList($('#lib-list')); }
}

function fillLibraryList(list) {
  const q = librarySearch.trim().toLowerCase();
  const items = state.items
    .filter(i => libraryFilter === 'all' ? true : libraryFilter === 'recipe' ? i.recipe : i.category === libraryFilter)
    .filter(i => !q || i.name.toLowerCase().includes(q) || (i.prep || '').toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  list.innerHTML = '';
  if (!items.length) { list.append(el('<div class="empty">No foods match.</div>')); return; }
  items.forEach(it => {
    const row = el(`
      <div class="item-row">
        <div class="item-emoji">${itemThumb(it)}</div>
        <div class="item-main">
          <div class="item-name">${esc(it.name)}</div>
          <div class="item-prep">${esc(it.prep)}</div>
          ${portionLine(it)}
          <div class="badges">${badges(it)}</div>
          ${it.flag ? `<div class="item-flag">⚠ ${esc(it.flag)}</div>` : ''}
        </div>
      </div>`);
    const actions = el('<div class="item-actions col"></div>');
    const star = el(`<button class="star-btn ${isFav(it.id) ? 'on' : ''}" title="Favorite">${isFav(it.id) ? '⭐' : '☆'}</button>`);
    star.onclick = () => { toggleFav(it.id); fillLibraryList(list); };
    const tried = el(`<button class="btn small ${isTried(it.id) ? '' : 'secondary'}" title="Mark as tried">${isTried(it.id) ? '✓ tried' : 'tried?'}</button>`);
    tried.onclick = () => { const was = isTried(it.id); toggleTried(it.id); if (!was) celebrate(it.name); fillLibraryList(list); refreshExplored(); };
    actions.append(star, tried);
    if (it.recipe) { const v = el('<button class="btn ghost small">📖 Recipe</button>'); v.onclick = () => openRecipe(it.id); actions.append(v); }
    const edit = el('<button class="btn ghost small">Edit</button>');
    edit.onclick = () => openItemEditor(it.id);
    actions.append(edit);
    row.append(actions);
    list.append(row);
  });
}

// small transient toast
function toast(msg) {
  const t = el(`<div class="toast">${esc(msg)}</div>`);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 1900);
}
// non-food celebration when a new food is marked tried (research-backed: never food rewards)
function celebrate(name) { toast(`🌟 Tried ${name}! Way to explore.`); }

// add a list of ingredients to the ad-hoc shopping list, tagged by where they came from
function addIngredientsToShopping(ings, sourceLabel) {
  let n = 0;
  (ings || []).forEach(ing => {
    const k = (ing || '').trim(); if (!k) return;
    state.shoppingExtra[k] = state.shoppingExtra[k] || [];
    if (!state.shoppingExtra[k].includes(sourceLabel)) state.shoppingExtra[k].push(sourceLabel);
    n++;
  });
  save();
  return n;
}
function refreshExplored() {
  const n = Object.keys(state.tried).length, tot = state.items.length;
  const box = $('#explored'); if (box) box.textContent = `🌈 Explored ${n} of ${tot} foods`;
}

// photo capture: downscale any picked image to a small square JPEG dataURL
let editingPhoto = null;
let editorToken = 0;  // bumped each time the editor opens; guards the async photo decode
function photoFromFile(file, cb) {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const S = 160, c = document.createElement('canvas'); c.width = S; c.height = S;
    const ctx = c.getContext('2d');
    const scale = Math.max(S / img.width, S / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
    URL.revokeObjectURL(url);
    cb(c.toDataURL('image/jpeg', 0.72));
  };
  img.onerror = () => { URL.revokeObjectURL(url); alert('Could not read that image.'); };
  img.src = url;
}
function updatePhotoUI() {
  const wrap = $('#f-photo-wrap'); if (!wrap) return;
  wrap.innerHTML = '';
  if (editingPhoto) {
    wrap.append(el(`<img class="editor-photo" src="${editingPhoto}" alt="">`));
    const rm = el('<button type="button" class="btn ghost small">Remove photo</button>');
    rm.onclick = () => { editingPhoto = null; updatePhotoUI(); };
    wrap.append(rm);
  } else {
    const add = el('<button type="button" class="btn secondary small">📷 Add a photo</button>');
    const inp = el('<input type="file" accept="image/*" capture="environment" style="display:none">');
    inp.onchange = (e) => { const tok = editorToken; if (e.target.files[0]) photoFromFile(e.target.files[0], (d) => { if (tok !== editorToken) return; editingPhoto = d; updatePhotoUI(); }); };
    add.onclick = () => inp.click();
    wrap.append(add, inp);
  }
}

function openItemEditor(id) {
  const it = id ? itemById(id) : { name: '', category: 'protein', prep: '', allergens: [], ingredients: [] };
  editingPhoto = it.photo || null;
  editorToken++;
  const body = el('<div></div>');
  body.append(el(`<h3>${id ? 'Edit food' : 'New food'}</h3>`));
  body.append(el(`<div class="fields">
    <div class="field"><label>Name</label><input id="f-name" value="${esc(it.name)}" placeholder="e.g. Banana coins"></div>
    <div class="field"><label>Category</label>
      <select id="f-cat">${CATEGORIES.map(c => `<option value="${c.key}" ${c.key === it.category ? 'selected' : ''}>${c.emoji} ${c.label}</option>`).join('')}</select>
    </div>
    <div class="field"><label>Prep / safety note</label><textarea id="f-prep" placeholder="How to prep it safely">${esc(it.prep)}</textarea></div>
    <div class="field"><label>Allergens (comma-separated)</label><input id="f-allerg" value="${esc((it.allergens || []).join(', '))}" placeholder="dairy, egg, wheat"></div>
    <div class="field"><label>Shopping ingredients (comma-separated)</label><input id="f-ing" value="${esc((it.ingredients || []).join(', '))}" placeholder="bananas"></div>
    <div class="field"><label>Toddler serving (optional — defaults by category)</label><input id="f-portion" value="${esc(it.portion || '')}" placeholder="${esc(PORTIONS[it.category] || '~2 Tbsp')}"></div>
    <div class="field"><label><input type="checkbox" id="f-cold" ${it.cold ? 'checked' : ''} style="width:auto;margin-right:8px;vertical-align:middle"> Keep cold (perishable — needs an ice pack)</label></div>
    <div class="field"><label>Photo (optional)</label><div id="f-photo-wrap" class="photo-wrap"></div></div>
  </div>`));
  const actions = el('<div class="modal-actions"></div>');
  const saveBtn = el('<button class="btn">Save</button>');
  saveBtn.onclick = () => {
    const name = $('#f-name').value.trim();
    if (!name) { $('#f-name').focus(); return; }
    const payload = {
      name,
      category: $('#f-cat').value,
      prep: $('#f-prep').value.trim(),
      allergens: splitList($('#f-allerg').value),
      ingredients: splitList($('#f-ing').value),
      portion: $('#f-portion').value.trim(),
      cold: $('#f-cold').checked,
      photo: editingPhoto || undefined,
    };
    if (id) Object.assign(itemById(id), payload);
    else state.items.push({ id: 'u' + Date.now().toString(36), ...payload });
    save(); closeModal(); render();
  };
  const cancel = el('<button class="btn secondary">Cancel</button>');
  cancel.onclick = closeModal;
  actions.append(saveBtn, cancel);
  body.append(actions);

  if (id) {
    const del = el('<button class="btn ghost" style="width:100%;color:#c14b6c;margin-top:6px">Delete food</button>');
    del.onclick = () => {
      state.items = state.items.filter(i => i.id !== id);
      delete state.favorites[id]; delete state.tried[id];
      Object.keys(state.plan).forEach(d => {
        const p = planFor(d);
        state.plan[d] = { lunch: p.lunch.filter(x => x !== id), snack: p.snack.filter(x => x !== id) };
      });
      save(); closeModal(); render();
    };
    body.append(del);
  }
  openModal(body);
  updatePhotoUI();
}

// ============================================================
//  VIEW 4 — Shopping List ("Shop")
// ============================================================
function renderShopping() {
  const wrap = el('<div></div>');
  wrap.append(el('<div class="view-head"><h2>Shopping list</h2></div>'));

  // roll up ingredients from everything planned this week (lunch + snack) + ad-hoc additions
  const counts = {};   // ingredient -> Set of source labels (day names or '📖 Recipe' / 'added')
  DAYS.forEach(d => {
    const { lunch, snack } = planFor(d);
    [...lunch, ...snack].forEach(id => {
      const it = itemById(id); if (!it) return;
      (it.ingredients || []).forEach(ing => {
        const key = ing.trim();
        if (!key) return;
        (counts[key] = counts[key] || new Set()).add(d);
      });
    });
  });
  // merge ad-hoc items added from recipes or by hand
  Object.keys(state.shoppingExtra).forEach(ing => {
    (counts[ing] = counts[ing] || new Set());
    state.shoppingExtra[ing].forEach(src => counts[ing].add(src));
  });
  const ingredients = Object.keys(counts).sort((a, b) => a.localeCompare(b));

  // manual add-an-item box (always available)
  const addRow = el('<form class="shop-add"><input class="search" placeholder="Add an item… (e.g. milk)"><button class="btn" type="submit">Add</button></form>');
  addRow.onsubmit = (e) => {
    e.preventDefault();
    const inp = addRow.querySelector('input');
    const v = inp.value.trim();
    if (v) { addIngredientsToShopping([v], 'added'); render(); }
  };
  wrap.append(addRow);

  if (!ingredients.length) {
    wrap.append(el('<div class="empty"><img class="empty-art" src="art/empty-shop.png" alt=""><div>Plan a week in the Week tab, tap “🛒 Add” on a recipe, or add items above — they all gather here, grouped by aisle.</div></div>'));
    return wrap;
  }

  const remaining = ingredients.filter(i => !state.checked[i]).length;
  wrap.append(el(`<div class="section-label">${remaining} of ${ingredients.length} left to buy · grouped by aisle</div>`));

  // group ingredients by store aisle
  const byAisle = {};
  ingredients.forEach(ing => { (byAisle[aisleFor(ing)] = byAisle[aisleFor(ing)] || []).push(ing); });
  AISLES.filter(a => byAisle[a]).forEach(aisle => {
    wrap.append(el(`<div class="aisle-head">${esc(aisle)}</div>`));
    const card = el('<div class="card"></div>');
    byAisle[aisle].forEach(ing => {
      const done = !!state.checked[ing];
      const days = [...counts[ing]];
      const row = el(`
        <div class="shop-row ${done ? 'done' : ''}">
          <div class="shop-check ${done ? 'done' : ''}">${done ? '✓' : ''}</div>
          <div class="shop-name">${esc(ing)}${days.length > 1 ? ` <span class="shop-qty">×${days.length}</span>` : ''}<div class="shop-from">for ${days.join(', ')}</div></div>
        </div>`);
      row.onclick = () => {
        if (state.checked[ing]) delete state.checked[ing]; else state.checked[ing] = true;
        save(); render();
      };
      card.append(row);
    });
    wrap.append(card);
  });

  const bar = el('<div class="toolbar" style="margin-top:14px"></div>');
  const clr = el('<button class="btn secondary small">Uncheck all</button>');
  clr.onclick = () => { state.checked = {}; save(); render(); };
  bar.append(clr);
  if (Object.keys(state.shoppingExtra).length) {
    const clrAdded = el('<button class="btn secondary small">Clear added items</button>');
    clrAdded.onclick = () => { state.shoppingExtra = {}; save(); render(); };
    bar.append(clrAdded);
  }
  wrap.append(bar);
  return wrap;
}

// recipe detail modal (steps + freezer note)
function openRecipe(id) {
  const it = itemById(id); if (!it) return;
  const body = el('<div></div>');
  body.append(el(`<h3>📖 ${esc(it.name)}</h3>`));
  if (it.yield) body.append(el(`<div class="rcp-meta">Makes ${esc(it.yield)}</div>`));
  body.append(el(`<div><div class="section-label">Prep / safety</div><div class="item-prep">${esc(it.prep)}</div></div>`));
  const ol = el('<ol class="rcp-steps"></ol>');
  (it.steps || []).forEach(s => ol.append(el(`<li>${esc(s)}</li>`)));
  body.append(el('<div class="section-label" style="margin-top:12px">Steps</div>'));
  body.append(ol);
  if (it.freezer) body.append(el(`<div class="reminder" style="margin-top:12px">❄️ ${esc(it.freezer)}</div>`));
  if ((it.ingredients || []).length) {
    body.append(el('<div class="section-label" style="margin-top:12px">Ingredients</div>'));
    body.append(el(`<div class="rcp-ings">${it.ingredients.map(g => `<span class="day-chip">${esc(g)}</span>`).join('')}</div>`));
    const add = el('<button class="btn" style="width:100%;margin-top:12px">🛒 Add ingredients to shopping list</button>');
    add.onclick = () => { const n = addIngredientsToShopping(it.ingredients, '📖 ' + it.name); closeModal(); toast(`Added ${n} ingredient${n === 1 ? '' : 's'} to your shopping list 🛒`); if (activeView === 'shopping') render(); };
    body.append(add);
  }
  const close = el('<button class="btn secondary" style="width:100%;margin-top:8px">Close</button>');
  close.onclick = closeModal;
  body.append(close);
  openModal(body);
}

// ---------- Modal plumbing ----------
function openModal(node) {
  const m = $('#modal'); m.innerHTML = '';
  const x = el('<button class="modal-close" aria-label="Close">✕</button>');
  x.onclick = closeModal;
  m.append(x, node);
  $('#modal-backdrop').hidden = false;
}
function closeModal() { $('#modal-backdrop').hidden = true; $('#modal').innerHTML = ''; }
$('#modal-backdrop').addEventListener('click', (e) => { if (e.target.id === 'modal-backdrop') closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal-backdrop').hidden) closeModal(); });

// ---------- Small utils ----------
function removeFirst(arr, val) { const i = arr.indexOf(val); if (i >= 0) arr.splice(i, 1); return arr; }
function splitList(s) { return s.split(',').map(x => x.trim()).filter(Boolean); }

// ---------- Boot ----------
applyTheme();
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setView(t.dataset.view)));
setView('builder');

// Register service worker for offline use (only works over http/https, not file://)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode just won't be available; app still works */ });
}
