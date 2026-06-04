# 🍱 Lunchbox

A small, offline-first web app for packing balanced, toddler-safe lunches and snacks.
Built for a ~2-year-old — every food carries a prep/safety note (choking-hazard sizing, soft textures).

## Four tabs
- **Pack** — tap foods into today's box; a meter shows whether you've covered protein / fruit / veg / grain. Save the box to a day.
- **Week** — Mon–Sun plan; each day shows its foods and whether it's balanced.
- **Foods** — searchable library by category. Add / edit / delete your own foods (name, category, prep note, allergens, shopping ingredients).
- **Shop** — auto-built grocery list rolled up from everything planned this week; check items off as you buy.

All data is saved **on the device** (browser localStorage) — nothing is sent anywhere, and it works with **no internet** (planes, cruises).

## Run it locally
```
python -m http.server 5173 --directory .
```
Then open http://localhost:5173

## Put it on an iPad (no App Store)
The app is a PWA, so it installs to the home screen and runs fullscreen + offline:
1. Host the folder somewhere the iPad can reach it over HTTPS (e.g. GitHub Pages, Netlify drop, or your home network). HTTPS is required for offline caching to kick in.
2. Open the URL in **Safari** on the iPad.
3. Share button → **Add to Home Screen**.
4. Launch from the new icon. After the first load it works with the network off.

## Files
- `index.html` — shell + tab bar
- `app.js` — all logic + the four views
- `data.js` — category config + starter food library (edit to taste)
- `styles.css` — mobile-first styling
- `manifest.webmanifest` + `sw.js` — make it installable + offline
- `icons/` — home-screen icons

## Note on safety
The prep notes are sensible defaults, not medical advice — you know your son's eating
abilities best. Choking-hazard guidance (halve round foods, soften hard ones) follows
common pediatric recommendations, but always supervise and adjust to him.
