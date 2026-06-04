// data.js — categories, school-policy config, and a research-backed library of
// toddler-safe lunch & snack items.
//
// Every item is NUT-FREE and SUNFLOWER-FREE (per the school handbook). Prep notes
// follow AAP/CDC choking guidance for under-4s (pieces ≤ ½", round/firm foods
// modified). `cold: true` = perishable, pack with an ice pack (USDA FSIS 2-hour rule).
// `allergens` flags common allergens; seed allergens (sesame/sunflower/pumpkin/chia/
// flax) are surfaced as a ⚠ because the school bans "nuts including sunflower seeds
// and certain seeds." See research/toddler-lunch-packing.md for sourcing.

const SCHOOL = {
  name: 'School',
  rules: [
    '🥜 Nut-free — including sunflower seeds & certain seeds',
    '🚫 No candy, chips, soda, cake, or gelatin/Jello',
    '🍱 Pack a lunch AND a snack every day',
    '❄️ Use an ice pack · 🏷️ label it · no glass containers',
  ],
};

// Allergens that fall under the school's "nuts + sunflower + certain seeds" ban and
// should be visually flagged for a second look.
const SEED_FLAG_ALLERGENS = ['sesame', 'sunflower', 'pumpkin', 'chia', 'flax'];

const CATEGORIES = [
  { key: 'protein', label: 'Protein', emoji: '🍗', color: '#f4a259' },
  { key: 'fruit',   label: 'Fruit',   emoji: '🍓', color: '#e76f8f' },
  { key: 'veg',     label: 'Veggie',  emoji: '🥦', color: '#6cc070' },
  { key: 'grain',   label: 'Grain',   emoji: '🍞', color: '#d6b25e' },
  { key: 'dairy',   label: 'Dairy',   emoji: '🧀', color: '#f2cd60' },
  { key: 'snack',   label: 'Snack',   emoji: '🍪', color: '#b08968' },
];

// A "balanced" lunchbox aims to cover these groups. Used by the builder's meter.
const BALANCE_GROUPS = ['protein', 'fruit', 'veg', 'grain'];

// cold: needs an ice pack. flag: optional extra caution shown on the item.
const SEED_ITEMS = [
  // ---- Proteins ----
  { id: 'egg-hard',     name: 'Hard-boiled egg',       category: 'protein', prep: 'Peeled, sliced into thin rounds or quartered; yolk fully cooked.', allergens: ['egg'], ingredients: ['eggs'], cold: true },
  { id: 'egg-scram',    name: 'Soft scrambled egg',    category: 'protein', prep: 'Cooked through but soft; broken into small bite-size pieces.', allergens: ['egg', 'dairy'], ingredients: ['eggs', 'butter'], cold: true },
  { id: 'chicken-shred',name: 'Shredded chicken',      category: 'protein', prep: 'Cooked & finely shredded, kept moist — no big chunks.', allergens: [], ingredients: ['chicken breast'], cold: true },
  { id: 'fish-flaked',  name: 'Flaked cooked fish',    category: 'protein', prep: 'Salmon/cod baked & flaked; ALL bones removed.', allergens: ['fish'], ingredients: ['salmon or cod fillet'], cold: true },
  { id: 'tuna',         name: 'Tuna (in water)',       category: 'protein', prep: 'Drained, lightly mashed; small spoonfuls.', allergens: ['fish'], ingredients: ['canned tuna in water'], cold: true },
  { id: 'turkey-rolls', name: 'Turkey roll-ups',       category: 'protein', prep: 'Thin low-sodium slices, rolled and cut into short strips.', allergens: [], ingredients: ['sliced turkey'], cold: true },
  { id: 'black-beans',  name: 'Black beans',           category: 'protein', prep: 'Soft-cooked, drained, lightly mashed.', allergens: [], ingredients: ['black beans'], cold: true },
  { id: 'chickpeas',    name: 'Chickpeas',             category: 'protein', prep: 'Drained, rinsed, skins off or slightly mashed (soft, not roasted-hard).', allergens: [], ingredients: ['chickpeas'], cold: true },
  { id: 'lentils',      name: 'Soft lentils',          category: 'protein', prep: 'Cooked until fully tender; can be lightly mashed.', allergens: [], ingredients: ['lentils'], cold: true },
  { id: 'tofu',         name: 'Soft tofu cubes',       category: 'protein', prep: 'Pressed, ½" cubes; lightly pan-warmed or soft.', allergens: ['soy'], ingredients: ['firm tofu'], cold: true },
  { id: 'edamame',      name: 'Edamame',               category: 'protein', prep: 'Cooked soft, fully SHELLED; halve beans (whole = choke risk).', allergens: ['soy'], ingredients: ['shelled edamame'], cold: true },
  { id: 'hummus',       name: 'Hummus (tahini-free)',  category: 'protein', prep: 'Use a SESAME/TAHINI-FREE hummus; serve as a dip with soft pita strips.', allergens: ['sesame', 'wheat'], ingredients: ['tahini-free hummus', 'pita bread'], cold: true, flag: 'Most hummus contains sesame (tahini) — buy a tahini-free one or skip.' },

  // ---- Fruits ----
  { id: 'blueberries',  name: 'Blueberries',           category: 'fruit', prep: 'Halved or lightly squished (whole = round choke risk).', allergens: [], ingredients: ['blueberries'], cold: true },
  { id: 'banana-coins', name: 'Banana coins',          category: 'fruit', prep: 'Peeled, sliced into thin coins; halve large ones.', allergens: [], ingredients: ['bananas'], cold: false },
  { id: 'strawberries', name: 'Strawberries',          category: 'fruit', prep: 'Hulled, sliced thin or quartered lengthwise.', allergens: [], ingredients: ['strawberries'], cold: true },
  { id: 'watermelon',   name: 'Watermelon',            category: 'fruit', prep: 'Seedless, ½" cubes (no melon balls — round).', allergens: [], ingredients: ['watermelon'], cold: true },
  { id: 'mandarin',     name: 'Mandarin segments',     category: 'fruit', prep: 'Segments halved; remove any seeds.', allergens: [], ingredients: ['mandarin oranges'], cold: true },
  { id: 'pear',         name: 'Soft pear',             category: 'fruit', prep: 'Ripe, peeled, cored, diced small.', allergens: [], ingredients: ['pears'], cold: true },
  { id: 'kiwi',         name: 'Kiwi',                  category: 'fruit', prep: 'Peeled, sliced into rounds then halved.', allergens: [], ingredients: ['kiwi'], cold: true },
  { id: 'pineapple',    name: 'Pineapple',             category: 'fruit', prep: 'Fresh or in juice (drained); ½" pieces.', allergens: [], ingredients: ['pineapple'], cold: true },
  { id: 'applesauce',   name: 'Applesauce pouch',      category: 'fruit', prep: 'Unsweetened. Shelf-stable until opened.', allergens: [], ingredients: ['unsweetened applesauce pouches'], cold: false },

  // ---- Veggies ----
  { id: 'carrot-soft',  name: 'Steamed carrots',       category: 'veg', prep: 'Steamed fork-soft, thin sticks (raw carrot = choke risk).', allergens: [], ingredients: ['carrots'], cold: true },
  { id: 'sweet-potato', name: 'Roasted sweet potato',  category: 'veg', prep: 'Baked very soft, peeled, ½" dice, cooled.', allergens: [], ingredients: ['sweet potato'], cold: true },
  { id: 'broccoli',     name: 'Steamed broccoli',      category: 'veg', prep: 'Steamed until very soft; small florets.', allergens: [], ingredients: ['broccoli'], cold: true },
  { id: 'green-beans',  name: 'Green beans',           category: 'veg', prep: 'Cooked tender, cut into ½" pieces.', allergens: [], ingredients: ['green beans'], cold: true },
  { id: 'peas',         name: 'Peas',                  category: 'veg', prep: 'Cooked soft; squish a few to reduce roundness.', allergens: [], ingredients: ['frozen peas'], cold: true },
  { id: 'cucumber',     name: 'Cucumber',              category: 'veg', prep: 'Peeled, quartered lengthwise, thin slices.', allergens: [], ingredients: ['cucumber'], cold: true },
  { id: 'avocado',      name: 'Avocado',               category: 'veg', prep: 'Ripe, ½" dice or thin slices (squeeze lemon to slow browning).', allergens: [], ingredients: ['avocado'], cold: true },
  { id: 'tomatoes',     name: 'Cherry tomatoes',       category: 'veg', prep: 'Quartered lengthwise — never whole/halved (round choke risk).', allergens: [], ingredients: ['cherry tomatoes'], cold: true },

  // ---- Grains ----
  { id: 'toast-strips', name: 'Toast strips',          category: 'grain', prep: 'Whole-grain, lightly toasted, finger-width strips.', allergens: ['wheat'], ingredients: ['whole-grain bread'], cold: false },
  { id: 'mini-pasta',   name: 'Soft pasta',            category: 'grain', prep: 'Whole-wheat, cooked soft (past al dente); small shapes.', allergens: ['wheat'], ingredients: ['mini whole-wheat pasta'], cold: true },
  { id: 'brown-rice',   name: 'Brown rice',            category: 'grain', prep: 'Cooked soft; small spoonfuls.', allergens: [], ingredients: ['brown rice'], cold: true },
  { id: 'oatmeal',      name: 'Oatmeal',               category: 'grain', prep: 'Plain rolled oats cooked to soft porridge; room temp.', allergens: [], ingredients: ['rolled oats'], cold: false },
  { id: 'crackers',     name: 'Whole-grain crackers',  category: 'grain', prep: 'Soft-ish; offer with water. Check label is nut/seed-free.', allergens: ['wheat'], ingredients: ['whole-grain crackers'], cold: false },
  { id: 'rice-cakes',   name: 'Brown rice cakes',      category: 'grain', prep: 'Plain; break into pieces, offer with water.', allergens: [], ingredients: ['brown rice cakes'], cold: false },
  { id: 'pita',         name: 'Pita / tortilla strips',category: 'grain', prep: 'Whole-wheat, soft, cut into small strips or triangles.', allergens: ['wheat'], ingredients: ['whole-wheat pita or tortillas'], cold: false },

  // ---- Dairy ----
  { id: 'yogurt',       name: 'Whole-milk yogurt',     category: 'dairy', prep: 'Plain / no added sugar; small cup or pouch.', allergens: ['dairy'], ingredients: ['whole-milk yogurt'], cold: true },
  { id: 'greek-yogurt', name: 'Greek yogurt',          category: 'dairy', prep: 'Plain full-fat; higher protein. No added sugar.', allergens: ['dairy'], ingredients: ['plain Greek yogurt'], cold: true },
  { id: 'cheese-shred', name: 'Shredded cheese',       category: 'dairy', prep: 'Cheddar/mozzarella shredded or thin pieces (not a hard stick/cube).', allergens: ['dairy'], ingredients: ['mild cheese'], cold: true },
  { id: 'babybel',      name: 'Babybel pieces',        category: 'dairy', prep: 'Wrapper off, cut into small pea-size pieces.', allergens: ['dairy'], ingredients: ['Babybel mini cheeses'], cold: true },
  { id: 'cottage',      name: 'Cottage cheese',        category: 'dairy', prep: 'Small-curd, small spoonfuls.', allergens: ['dairy'], ingredients: ['cottage cheese'], cold: true },
  { id: 'cream-cheese', name: 'Cream cheese',          category: 'dairy', prep: 'Spread THIN on toast/crackers — never a thick glob.', allergens: ['dairy', 'wheat'], ingredients: ['cream cheese', 'whole-grain bread'], cold: true },

  // ---- Snacks ----
  { id: 'mini-muffin',  name: 'Whole-grain mini muffin',category: 'snack', prep: 'Homemade low-sugar (banana-oat/zucchini); quartered. Nut/seed-free batter.', allergens: ['wheat', 'egg'], ingredients: ['flour', 'oats', 'bananas', 'egg'], cold: false },
  { id: 'fd-fruit',     name: 'Freeze-dried fruit',    category: 'snack', prep: 'No added sugar; dissolves easily. Offer with water.', allergens: [], ingredients: ['freeze-dried fruit'], cold: false },
  { id: 'fruit-cup',    name: 'Fruit cup (in juice)',  category: 'snack', prep: 'Packed in 100% juice/water (no syrup); drain, cut any large pieces.', allergens: [], ingredients: ['fruit cups in juice'], cold: false },
  { id: 'o-cereal',     name: 'Whole-grain O cereal',  category: 'snack', prep: 'Plain low-sugar; dry finger food.', allergens: ['wheat'], ingredients: ['plain O-shaped cereal'], cold: false },
  { id: 'veg-pouch',    name: 'Veggie/fruit pouch',    category: 'snack', prep: '100% fruit & veg, no added sugar. Squeeze onto a spoon.', allergens: [], ingredients: ['fruit & veg pouches'], cold: false },

  // ---- Make-ahead recipes (recipe:true → tap to see steps; freezer-friendly) ----
  { id: 'r-egg-muffins', name: 'Egg & veggie muffins', category: 'protein', recipe: true, prep: 'Cut into small soft pieces. Iron + protein; hides veggies.', allergens: ['egg', 'dairy'], ingredients: ['eggs', 'shredded cheese', 'spinach', 'bell pepper'], cold: true, yield: '12 mini muffins', freezer: 'Freeze up to 3 months; thaw overnight in the fridge.', steps: [
      'Heat oven to 350°F. Grease a 12-cup mini muffin tin.',
      'Whisk 6 eggs with a splash of milk.',
      'Finely chop a handful of spinach + bell pepper; stir in with ¼ cup shredded cheese.',
      'Fill cups ¾ full. Bake 15–18 min until set.',
      'Cool fully, then refrigerate 3 days or freeze.' ] },
  { id: 'r-meatballs', name: 'Baked chicken meatballs', category: 'protein', recipe: true, prep: 'Quarter each meatball before serving (round = choke risk).', allergens: ['egg', 'wheat'], ingredients: ['ground chicken', 'breadcrumbs', 'egg', 'grated carrot'], cold: true, yield: '~20 small', freezer: 'Freeze cooked & cooled up to 3 months.', steps: [
      'Heat oven to 400°F. Line a tray with parchment.',
      'Mix 1 lb ground chicken, ½ cup breadcrumbs, 1 egg, ½ cup finely grated carrot, pinch of salt.',
      'Roll into small balls; bake 18–20 min until cooked through (165°F).',
      'Cool, then refrigerate 3 days or freeze. Quarter before packing.' ] },
  { id: 'r-quesadilla', name: 'Bean & cheese quesadilla', category: 'grain', recipe: true, prep: 'Cut into small strips or triangles.', allergens: ['wheat', 'dairy'], ingredients: ['whole-wheat tortillas', 'shredded cheese', 'refried/mashed beans'], cold: true, yield: '4 quesadillas', freezer: 'Freeze 3 months; reheat from frozen.', steps: [
      'Spread mashed beans on a tortilla, sprinkle cheese, top with another tortilla.',
      'Cook in a dry pan ~2 min per side until cheese melts.',
      'Cool, cut into small strips. Refrigerate 2–3 days or freeze.' ] },
  { id: 'r-oat-bites', name: 'No-bake oat bites', category: 'snack', recipe: true, prep: 'Soft; break into pieces for younger eaters.', allergens: [], ingredients: ['rolled oats', 'mashed banana', 'honey'], cold: false, flag: 'Honey is fine for ages 1+ — never for a baby under 12 months.', yield: '~15 bites', freezer: 'Freeze 3 months on a tray, then bag.', steps: [
      'Mash 1 ripe banana; mix with 1½ cups rolled oats and a drizzle of honey.',
      'Roll into small balls.',
      'Chill 30 min to firm up. Refrigerate 1 week or freeze.' ] },
  { id: 'r-pinwheels', name: 'Cream-cheese pinwheels', category: 'grain', recipe: true, prep: 'Slice into thin rounds.', allergens: ['wheat', 'dairy'], ingredients: ['whole-wheat tortillas', 'cream cheese'], cold: true, yield: '2 wraps', freezer: 'Flash-freeze; keeps 2–3 months. Avoid watery fillings.', steps: [
      'Spread a thin layer of cream cheese over a tortilla (no watery fillings — they go soggy).',
      'Roll tightly, then slice into thin pinwheels.',
      'Refrigerate same-day, or flash-freeze on a tray then bag.' ] },

  { id: 'r-sweetpotato-bites', name: 'Sweet potato & chickpea bites', category: 'protein', recipe: true, prep: 'Soft baked patties; serve in small pieces.', allergens: ['egg', 'wheat'], ingredients: ['sweet potato', 'chickpeas', 'breadcrumbs', 'egg'], cold: true, yield: '~16 bites', freezer: 'Freeze cooked & cooled up to 3 months.', nutrients: ['iron', 'protein', 'fiber', 'vitc'], steps: [
      'Bake or steam 1 sweet potato until very soft; mash with 1 cup drained chickpeas.',
      'Mix in ⅓ cup breadcrumbs and 1 egg; season lightly.',
      'Scoop small patties onto a lined tray; bake 400°F for ~20 min, flipping once.',
      'Cool fully. Refrigerate 3 days or freeze.' ] },
  { id: 'r-zucchini-muffins', name: 'Zucchini-carrot mini muffins', category: 'snack', recipe: true, prep: 'Quarter each mini muffin.', allergens: ['wheat', 'egg'], ingredients: ['flour', 'grated zucchini', 'grated carrot', 'egg', 'oil'], cold: false, yield: '12 mini muffins', freezer: 'Freeze up to 3 months; thaw at room temp.', nutrients: ['fiber'], steps: [
      'Heat oven to 350°F; grease a mini muffin tin.',
      'Mix 1 cup flour, ½ tsp baking powder, 1 egg, ¼ cup oil, and ½ cup each grated zucchini + carrot (squeeze zucchini dry first).',
      'Fill cups ¾ full; bake 15–18 min.',
      'Cool fully. Keeps 3 days, or freeze.' ] },
  { id: 'r-pancake-bites', name: 'Banana-oat pancake bites', category: 'grain', recipe: true, prep: 'Mini pancakes; cut into pieces.', allergens: ['wheat', 'egg', 'dairy'], ingredients: ['flour', 'oats', 'mashed banana', 'milk', 'egg'], cold: false, yield: '~20 mini', freezer: 'Freeze in a bag up to 2 months; toast to reheat.', nutrients: ['fiber'], steps: [
      'Blend 1 banana, 1 cup flour, ½ cup oats, 1 egg, ¾ cup milk, 1 tsp baking powder.',
      'Cook small silver-dollar pancakes on a greased pan.',
      'Cool. Refrigerate 3 days or freeze flat in a bag.' ] },
  { id: 'r-veggie-nuggets', name: 'Lentil & veggie nuggets', category: 'protein', recipe: true, prep: 'Soft nuggets; cut in half to serve.', allergens: ['wheat', 'egg', 'dairy'], ingredients: ['cooked lentils', 'grated carrot', 'breadcrumbs', 'shredded cheese', 'egg'], cold: true, yield: '~18 nuggets', freezer: 'Freeze cooked up to 3 months.', nutrients: ['iron', 'protein', 'fiber'], steps: [
      'Mash 1 cup soft-cooked lentils; mix with ½ cup grated carrot, ½ cup breadcrumbs, ¼ cup cheese, 1 egg.',
      'Shape into small nuggets on a lined tray.',
      'Bake 400°F ~18–20 min until firm. Cool, then refrigerate 3 days or freeze.' ] },
  { id: 'r-broccoli-bites', name: 'Cheesy broccoli & rice bites', category: 'grain', recipe: true, prep: 'Soft baked bites; small pieces.', allergens: ['dairy', 'egg'], ingredients: ['cooked rice', 'finely chopped broccoli', 'shredded cheese', 'egg'], cold: true, yield: '~14 bites', freezer: 'Freeze up to 2 months.', nutrients: ['calcium', 'fiber', 'protein'], steps: [
      'Steam broccoli very soft and chop finely.',
      'Mix 1½ cups cooked rice, 1 cup broccoli, ¾ cup cheese, 2 eggs.',
      'Press into a greased mini muffin tin; bake 375°F ~20 min.',
      'Cool fully. Refrigerate 3 days or freeze.' ] },
  { id: 'r-burritos', name: 'Mini bean & cheese burritos', category: 'grain', recipe: true, prep: 'Cut into short, small pieces.', allergens: ['wheat', 'dairy'], ingredients: ['small tortillas', 'mashed beans', 'shredded cheese'], cold: true, yield: '6 mini burritos', freezer: 'Wrap individually; freeze up to 3 months.', nutrients: ['protein', 'fiber', 'calcium'], steps: [
      'Spread mashed beans on a small tortilla, add a little cheese.',
      'Roll up and tuck the ends; warm in a pan to seal.',
      'Cool, wrap each one. Refrigerate 3 days or freeze.' ] },
  { id: 'r-oat-squares', name: 'Apple-cinnamon baked oat squares', category: 'snack', recipe: true, prep: 'Cut into small soft squares.', allergens: ['egg', 'dairy'], ingredients: ['rolled oats', 'grated apple', 'milk', 'egg', 'cinnamon'], cold: false, yield: '9 squares', freezer: 'Freeze up to 3 months; thaw or warm.', nutrients: ['fiber'], steps: [
      'Mix 2 cups oats, 1 grated apple, 1¼ cups milk, 1 egg, 1 tsp cinnamon, 1 tsp baking powder.',
      'Spread in a greased 8x8 pan; bake 375°F ~25 min.',
      'Cool, cut into squares. Refrigerate 4 days or freeze.' ] },
  { id: 'r-french-toast', name: 'French toast sticks', category: 'grain', recipe: true, prep: 'Cut bread into finger-width sticks.', allergens: ['wheat', 'egg', 'dairy'], ingredients: ['whole-grain bread', 'egg', 'milk', 'cinnamon'], cold: false, yield: '~12 sticks', freezer: 'Freeze flat; toast straight from frozen.', nutrients: ['protein', 'fiber'], steps: [
      'Whisk 2 eggs, ¼ cup milk, a little cinnamon.',
      'Cut bread into sticks; dip and cook on a greased pan until golden.',
      'Cool. Refrigerate 2 days or freeze flat in a bag.' ] },
  { id: 'r-carrot-tots', name: 'Baked carrot & potato tots', category: 'veg', recipe: true, prep: 'Soft tots; halve to serve.', allergens: ['egg', 'dairy', 'wheat'], ingredients: ['grated potato', 'grated carrot', 'shredded cheese', 'egg', 'breadcrumbs'], cold: true, yield: '~20 tots', freezer: 'Freeze cooked up to 2 months.', nutrients: ['fiber', 'vitc'], steps: [
      'Squeeze 1 cup grated potato + ½ cup grated carrot dry.',
      'Mix with ¼ cup cheese, 1 egg, ¼ cup breadcrumbs.',
      'Shape small tots; bake 425°F ~20 min, flipping once.',
      'Cool. Refrigerate 3 days or freeze.' ] },
  { id: 'r-cottage-pancakes', name: 'Cottage cheese banana pancakes', category: 'protein', recipe: true, prep: 'Soft mini pancakes; cut up.', allergens: ['wheat', 'egg', 'dairy'], ingredients: ['cottage cheese', 'mashed banana', 'egg', 'flour'], cold: false, yield: '~16 mini', freezer: 'Freeze in a bag up to 2 months.', nutrients: ['calcium', 'protein'], steps: [
      'Blend ½ cup cottage cheese, 1 banana, 1 egg, ½ cup flour.',
      'Cook small pancakes on a greased pan.',
      'Cool. Refrigerate 2 days or freeze flat.' ] },

  // ===== Asian recipes (nut-free + sesame-free; see research/asian-toddler-lunch-recipes.md) =====
  // ---- Chinese ----
  { id: 'a-congee', name: 'Congee / jook (rice porridge)', category: 'grain', recipe: true, prep: 'Silky-soft — one of the safest toddler textures. Serve warm from a thermos.', allergens: [], ingredients: ['white rice', 'water or low-sodium broth', 'fresh ginger'], cold: true, yield: '4 servings', freezer: 'Freeze cooked up to 1 month; reheat with a splash of water.', nutrients: ['fiber'], flag: 'Pack hot in a thermos. Never use mochi/sticky rice — choking hazard; plain rice only.', steps: [
      'Rinse ¾ cup rice; simmer with 7 cups water/broth + a few ginger slices.',
      'Cook 20–30 min, stirring, until broken-down and creamy. Remove ginger.',
      'Stir in soft add-ins (mashed egg, shredded chicken, silken tofu) if you like.',
      'Cool quickly if storing; reheat piping hot and pack in a warmed thermos.' ] },
  { id: 'a-steamed-egg', name: 'Steamed egg custard (蒸蛋)', category: 'protein', recipe: true, prep: 'Silky, spoon-soft — ideal for toddlers.', allergens: ['egg'], ingredients: ['eggs', 'water or low-sodium broth'], cold: true, yield: '3–4 servings', freezer: 'Best fresh (texture weeps if frozen). Make day-of.', nutrients: ['protein', 'iron'], flag: 'Omit the sesame oil to keep it school-compliant — a drop of neutral oil + scallion is plenty.', steps: [
      'Beat 3 eggs; add an equal volume of water/broth and a little salt.',
      'Strain into a shallow heatproof dish; cover with foil.',
      'Steam 3 min on high, then off-heat (lid shut) 14 min — don\'t peek.',
      'Top with minced scallion. Serve warm or room temp.' ] },
  { id: 'a-tomato-egg', name: 'Tomato & egg (番茄炒蛋)', category: 'protein', recipe: true, prep: 'Cut tomato small and cook fully soft; eggs in small soft pieces. Serve over soft rice.', allergens: ['egg'], ingredients: ['ripe tomatoes', 'eggs', 'neutral oil', 'a little sugar'], cold: true, yield: '3 servings', freezer: 'Best fresh; refrigerate up to 2 days.', nutrients: ['protein', 'vitc', 'iron'], flag: 'Traditionally has no sesame — naturally school-safe.', steps: [
      'Cut 4 small tomatoes into small wedges; beat 4 eggs with a pinch of salt.',
      'Scramble eggs soft in oil; set aside.',
      'Stir-fry tomatoes with a little sugar + splash of water until fully soft.',
      'Fold eggs back in; serve over soft rice.' ] },
  { id: 'a-scallion-pancake', name: 'Easy scallion pancakes', category: 'grain', recipe: true, prep: 'Soft shortcut version (dumpling wrappers). Cut into small strips; cook on medium so they stay pliable.', allergens: ['wheat'], ingredients: ['round dumpling wrappers', 'scallions', 'neutral oil', 'salt'], cold: false, yield: '4–6 pancakes', freezer: 'Freeze uncooked between parchment; cook from frozen.', nutrients: ['fiber'], flag: 'This shortcut version uses no sesame oil — check the wrapper label is sesame-free.', steps: [
      'Brush a wrapper with oil; sprinkle salt + chopped scallion; stack another on top. Repeat 4–6 layers.',
      'Roll the stack into a thin pancake.',
      'Cook ~2–3 min per side on medium until golden.',
      'Cut into small strips or squares; cool before packing.' ] },

  // ---- Japanese ----
  { id: 'a-onigiri', name: 'Onigiri (rice balls)', category: 'grain', recipe: true, prep: 'Shape small for little hands; break into pieces for under-2s.', allergens: [], ingredients: ['Japanese short-grain rice', 'salt', 'unseasoned nori (optional)'], cold: true, yield: '6 small balls', freezer: 'Freeze plain cooked rice, not shaped balls; reshape fresh.', nutrients: ['fiber'], flag: 'Use UNSEASONED nori torn into small strips (it gets gummy). NEVER mochi/glutinous rice — serious choking hazard.', steps: [
      'Cook short-grain rice; cool until just warm.',
      'Wet hands, salt lightly, press ~½ cup rice into a ball or triangle.',
      'Add a tiny soft filling (flaked salmon, tuna-mayo) if you like.',
      'Wrap a small nori strip around the base, or skip for toddlers. Eat within ~6 hrs with an ice pack.' ] },
  { id: 'a-tamagoyaki', name: 'Tamagoyaki (rolled egg)', category: 'protein', recipe: true, prep: 'Cut into finger-width pieces; fully cooked, soft and cohesive.', allergens: ['egg', 'soy'], ingredients: ['eggs', 'a little sugar', 'light soy sauce', 'neutral oil'], cold: true, yield: '6 pieces', freezer: 'Freeze up to 1 month; thaw in the fridge.', nutrients: ['protein'], flag: 'Naturally sesame-free.', steps: [
      'Mix 3 eggs with ½ Tbsp sugar, a pinch of salt, 1 tsp soy sauce, 1 Tbsp water.',
      'Grease a pan; pour a thin layer, let it set, roll to one side.',
      'Grease, add next layer, roll again — repeat 3–4 times into a log.',
      'Cool, slice into 6; cut small for toddlers.' ] },
  { id: 'a-kabocha', name: 'Simmered kabocha squash', category: 'veg', recipe: true, prep: 'Simmered velvety-soft; peel skin off for under-2s, cut into ~1 cm cubes.', allergens: ['soy'], ingredients: ['kabocha squash', 'water', 'a little sugar', 'light soy sauce'], cold: true, yield: '4 servings', freezer: 'Freezes 2–3 weeks (softens slightly).', nutrients: ['fiber', 'vitc'], flag: 'Naturally sesame-free. A classic bento veg.', steps: [
      'Cut kabocha into 2-inch pieces.',
      'Simmer skin-side down in water + a little sugar, covered, 20–30 min until a skewer slides in.',
      'Add a splash of soy sauce near the end; rest 30 min to soak up flavor.',
      'Peel + cube small for toddlers. Good warm or cold.' ] },
  { id: 'a-mushipan', name: 'Mushi-pan (steamed cake)', category: 'snack', recipe: true, prep: 'Soft, spongy; serve room temp in quarters.', allergens: ['wheat', 'egg', 'dairy'], ingredients: ['flour', 'baking powder', 'egg', 'milk', 'a little sugar', 'oil'], cold: false, yield: '4 small cakes', freezer: 'Freeze up to 1 month; thaw at room temp.', nutrients: [], flag: 'Naturally sesame-free. Fold in mashed sweet potato for extra nutrition.', steps: [
      'Whisk ½ cup flour + 1 tsp baking powder.',
      'Mix 1 egg, 2 Tbsp milk, 2 Tbsp sugar, 1 Tbsp oil; combine with the dry.',
      'Spoon into cupcake liners in ramekins.',
      'Steam, covered (towel under lid), ~8 min until a skewer is clean. Cool.' ] },

  // ---- Korean ----
  { id: 'a-gyeranmari', name: 'Gyeran-mari (Korean rolled egg)', category: 'protein', recipe: true, prep: 'Slice into ¾-inch rounds; soft, low choking risk.', allergens: ['egg'], ingredients: ['eggs', 'finely minced carrot', 'finely minced scallion', 'neutral oil', 'salt'], cold: true, yield: '4 servings', freezer: 'Best within 2–3 days refrigerated.', nutrients: ['protein'], flag: 'A popular Korean lunchbox dish that is naturally sesame-free.', steps: [
      'Beat 3 eggs with finely minced carrot + scallion and a little salt.',
      'Pour a thin layer into a greased pan over medium-low.',
      'As it sets, roll it up; add more egg and keep rolling into a log.',
      'Cool, then slice into rounds.' ] },
  { id: 'a-mandu', name: 'Veggie & tofu mandu (steamed)', category: 'protein', recipe: true, prep: 'Steam (softest); cut each dumpling in half. Mince filling fine.', allergens: ['wheat', 'soy', 'egg'], ingredients: ['round dumpling wrappers', 'firm tofu (squeezed)', 'ground chicken or pork', 'blanched chopped mung sprouts', 'onion', 'egg'], cold: true, yield: '~30 dumplings', freezer: 'Freeze raw on a tray then bag; steam from frozen.', nutrients: ['protein', 'fiber'], flag: 'This filling uses no sesame oil — check the wrapper label is sesame-free.', steps: [
      'Squeeze tofu dry; blanch + finely chop sprouts.',
      'Mix tofu, meat, sprouts, minced onion, 1 egg, salt + pepper.',
      'Spoon filling onto wrappers; wet edges and seal.',
      'Steam ~10 min until cooked through. Cool, halve before serving.' ] },

  // ---- Vietnamese ----
  { id: 'a-chaoga', name: 'Cháo gà (chicken congee)', category: 'grain', recipe: true, prep: 'Porridge — very safe texture. Shred chicken into fine strands. Skip fried-shallot topping.', allergens: [], ingredients: ['jasmine rice', 'chicken (thighs or breast)', 'ginger', 'shallot', 'low-sodium broth'], cold: true, yield: '4–6 servings', freezer: 'Freeze chicken + broth separately up to 3 months.', nutrients: ['protein', 'fiber'], flag: 'Pack hot in a thermos. Naturally sesame-free; keep sodium low for a toddler.', steps: [
      'Simmer chicken with ginger + shallot until cooked; shred finely, keep the broth.',
      'Simmer 1 cup rinsed rice in 6 cups broth 30–40 min until porridgey.',
      'Season lightly; stir in shredded chicken.',
      'Top with a little scallion. Pack hot in a warmed thermos.' ] },
  { id: 'a-xiumai', name: 'Xíu mại (pork meatballs in tomato)', category: 'protein', recipe: true, prep: 'Make small; cut each meatball in half (round = choke risk). Tomato sauce keeps them moist.', allergens: ['fish'], ingredients: ['ground pork', 'finely diced jicama', 'scallion whites', 'tomatoes', 'tomato paste', 'a little fish sauce'], cold: true, yield: '~16 meatballs', freezer: 'Freeze raw meatballs on a tray then bag.', nutrients: ['protein', 'vitc'], flag: 'Naturally sesame-free. Use just a few drops of fish sauce for a toddler (or swap a little soy).', steps: [
      'Mix pork, finely diced jicama, minced scallion whites, a little fish sauce + cornstarch.',
      'Roll small balls.',
      'Simmer in a simple tomato sauce (tomato + paste + a little sugar + water), covered, ~10 min.',
      'Serve over soft rice; halve meatballs for toddlers.' ] },

  // ---- South Asian ----
  { id: 'a-khichdi', name: 'Moong dal khichdi', category: 'grain', recipe: true, prep: 'Mash to a soft porridge while hot. Remove any whole spices before serving.', allergens: ['dairy'], ingredients: ['rice', 'moong dal (split yellow lentils)', 'soft diced vegetables', 'a little ghee', 'turmeric'], cold: true, yield: '3–4 servings', freezer: 'Best fresh; refrigerate up to 1 day. Pack hot in a thermos.', nutrients: ['iron', 'protein', 'fiber'], flag: 'Naturally sesame-free. Skip green chilli; pack hot in a thermos (serve warm, not lukewarm).', steps: [
      'Rinse + soak ¼ cup each rice and moong dal ~30 min.',
      'Pressure-cook with soft-diced veg, a pinch of turmeric and ~1¼ cups water until very soft.',
      'Mash together while hot; stir in a little ghee.',
      'Loosen with hot water to a porridge; cool to safe temp before serving.' ] },
  { id: 'a-besan-chilla', name: 'Besan chilla (chickpea pancake)', category: 'grain', recipe: true, prep: 'Cook soft (squish-test); cut into small strips.', allergens: [], ingredients: ['besan (chickpea flour)', 'water', 'finely grated veg (carrot/zucchini)', 'ajwain', 'turmeric'], cold: false, yield: '4 chillas', freezer: 'Best fresh; batter keeps 1 day.', nutrients: ['protein', 'fiber'], flag: 'Naturally nut- and sesame-free; a great veggie-hiding protein pancake.', steps: [
      'Whisk ¾ cup besan with ¾ cup water, a pinch of turmeric + ajwain; rest 10 min.',
      'Stir in finely grated veg + chopped coriander.',
      'Pour medium-thick rounds on a lightly oiled pan; cook ~2½ min per side until set.',
      'Cool; cut into strips.' ] },
  { id: 'a-curd-rice', name: 'Curd rice (thayir sadam)', category: 'dairy', recipe: true, prep: 'Rice soft/mushy; serve cool — great for hot days. Skip green chilli.', allergens: ['dairy'], ingredients: ['cooked soft rice', 'plain whole-milk yogurt', 'a little milk', 'curry leaves', 'mustard seeds', 'neutral oil'], cold: true, yield: '3 servings', freezer: 'Make rice ahead; mix with fresh yogurt day-of.', nutrients: ['calcium', 'protein'], flag: 'Use NEUTRAL oil for the tadka, NOT sesame/gingelly oil — keeps it school-compliant. Omit any cashew garnish.', steps: [
      'Cook rice very soft; cool and mash lightly.',
      'Stir in yogurt + a splash of milk to a creamy consistency.',
      'Make a quick tempering in neutral oil: pop mustard seeds, add curry leaves + a pinch of hing; stir in.',
      'Serve cool or at room temp.' ] },
  { id: 'a-idli', name: 'Steamed idli', category: 'grain', recipe: true, prep: 'Naturally soft and toddler-friendly; serve mini idlis or quartered.', allergens: [], ingredients: ['idli rice', 'urad dal', 'fenugreek seeds'], cold: false, yield: 'batter makes many', freezer: 'Batter keeps 5 days refrigerated; steam fresh daily.', nutrients: ['fiber', 'protein'], flag: 'Skip idli podi (it contains SESAME) and restaurant coconut chutney (often has cashew). Serve with plain curd or mild sambar.', steps: [
      'Soak rice and urad dal (with a little fenugreek) ~6–8 hrs; grind to a thick batter.',
      'Ferment overnight until bubbly.',
      'Pour into greased idli moulds; steam ~10–12 min until a toothpick is clean.',
      'Cool 2 min; serve with plain curd (no sesame podi).' ] },
];
