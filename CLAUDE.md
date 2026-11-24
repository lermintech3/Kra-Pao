# Kra-Pap — notes for Claude

Household finance app (Thai UI, iOS style, vivid colors) for a couple. Single file: `index.html`.

- Live artifact slug: `58961677-80ee-413d-892f-0ebe5b217684` (https://claude.ai/artifact/BwTqRXhSnAnvJJAACwtbN3), in the Artifacts folder "บ้านของเรา 🏡".
- Capability declaration: `{"db": {"rules": [{"path": "", "read": "interact", "write": "interact"}]}}`.
- After changing `index.html`: run `node --check` on the extracted script, screenshot at 390×844 with sample data seeded in localStorage key `ourwallet.v1`, then republish the artifact (`publish_files`, as `index.html`) and commit here.
- Never seed, wipe or rewrite the live database — it holds the couple's real data.

## Data model
- `tx/{id}`: `{type:'expense'|'income', amount, cat, who:'a'|'b'|'both', date:'YYYY-MM-DD', note, ts, bill?}`
- `goals/{id}`: `{name, target, saved, e, color (0-5), deadline, log:[{d,a}]}`
- `bills/{id}`: `{name, amount, day, cat, who, paid:{'YYYY-MM': txId}}`
- `debts/{id}`: debt records (balance, rate, min, day, log)
- `meta/settings`: `{a:{name,e}, b:{name,e}, budgets:{catId: amount}, saveTarget, emMonths}`
- Tabs: home, tx, plan (budget/recurring/forecast/report), goals (savings & debts).
- Backend order: Cloudflare D1 via Worker (if `api-config.js` sets `D1_API_URL`; house-key login stored in localStorage `ourwallet.key`; polling every 8 s; `makeD1()` mimics the db API) → Firebase (if `firebase-config.js` has real values; Google sign-in, Firestore compat SDK from gstatic, same collection paths) → Claude artifact `db` → localStorage. `attach(db)` subscribes for both Firestore and Claude db (same API shape).
- `firestore.rules` limits access to two emails. Setup guide for the user: `FIREBASE_SETUP_TH.md` (GitHub Pages hosting at https://lermintech3.github.io/Kra-Pap/).
- D1: `cloudflare/schema.sql` (single `docs(col,id,data,updated,deleted)` table, soft deletes) and `cloudflare/worker.js` (Bearer HOUSE_KEY, `GET /api/all?since=`, `PUT|DELETE /api/doc/:col/:id`). Guide: `D1_SETUP_TH.md`.
- When republishing the artifact, publish `index.html`, `api-config.js` and `firebase-config.js` (empty/placeholder values).
- `cloudflare/worker-full.js` = worker + embedded index.html (serves app at `/`, `api-config.js` sets `D1_SAME_ORIGIN`). **Rebuild with `python3 cloudflare/build.py` after every index.html change.**
- Test D1 locally: wrap `worker.js` in a Node http server with `node:sqlite` as `env.DB`, point `api-config.js` at http://localhost.

## Design
- No emoji in the UI: `ICONS` (line SVGs) + `I(name)`; category icons via `ci(c)`; any emoji (incl. saved data like goal/debt `e`) is converted to an icon at render time by `iconize()` (MutationObserver) using the `EMO` map — add new emoji there.
- Theme = "Aqua Glass" (user's choice: premium, dimensional, glassy, blue–green–white): fixed aqua mesh background, frosted glass cards/tab bar/sheets (backdrop-filter), glossy 3D icon bubbles, ocean-gradient balance card with white guilloche + silver chip (SVG data URIs in CSS vars `--art-*`). UI accents are blue/teal/green; category data colors stay as validated.
- Home is e-wallet style: gradient header, white balance card with hide-amount eye, 4 quick actions, insight carousel. Entry sheet uses a custom iOS keypad with + − × math, category chip row, date chips, note suggestions.
- Cards radius 26 glass, frosted floating tab bar, bottom sheets, segmented controls; system font + Noto Sans Thai.
- Expense category colors are fixed and color-blind validated in this order: food #FF8A00, transport #007AFF, shopping #FF2D55, home #20A8C0, fun #AF52DE, health #30C26A, bills #5856D6, edu #D9A400, other #8E8E93. Adding a category needs re-validation.
- Income/expense chart: #007AFF / #FF8A00. People: a #AF52DE, b #20A8C0, both #FF8A00.
