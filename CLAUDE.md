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

## Premium banking pack (last <script> block)
- App lock: 6-digit PIN per device, SHA-256 + salt in localStorage `ourwallet.pin`; options in `ourwallet.pincfg` {auto: seconds before re-lock, hide: hide balance on open}. Early inline script adds `html.locked` before render; `#lock` overlay; 5 wrong tries → 30 s wait; "ลืมรหัส" only removes the device lock (data untouched).
- Bell (`#btnBell`) = `notifs()`: due/overdue bills & debts (3 days), budget ≥80%/over, month-end negative, goals reached/near deadline. Seen keys in `ourwallet.seen`.
- Transaction rows open `openSlip(id)` (e-slip with ref `KP+yymmdd+id`, footer says it is an in-app record, not a transfer proof) → edit/duplicate/copy/delete.
- `openStatement(mk)` = monthly e-Statement with opening balance (net of all earlier tx), running balance, copy as CSV. Linked from home "รายการล่าสุด" and Report tab.
- Hooks wrap `renderHome`, `renderReport`, `openSettings` (adds ความปลอดภัย group); balance count-up animation.

## Themes
- Default theme = "Sky Bank" (`html.sky`, user asked for a clean mobile-banking look like Thai bank apps — generic style only, no bank's name/logo/brand marks): flat white cards on #F2F6FA, sky-blue header (#0A8FD8→#14B4F0), white account card ("บัญชีครัวเรือน" + pseudo number from names + Statement button), "บริการ" 8-icon grid replaces `.qa`, white tiles with coloured icon chips, docked white bottom bar. CSS block `SKY BANK THEME`; JS block after the premium pack wraps `renderHome`/`openSettings` (theme picker).
- "Sky Premium" colour layer (CSS block `SKY PREMIUM`, user asked for more colour/sharper look): navy→royal→sky header, navy account card with gold accents (#D9AE5B/#F3D898), multi-tone gradient service icons, coloured gradient tiles (teal/royal/amber/violet), accent bar before card titles, gradient segmented/chips/buttons, docked navy tab bar with gold FAB ring, tinted background and sheets. Category data colours unchanged.
- Theme stored per device in localStorage `ourwallet.theme` ('aqua' = Aqua Glass, else Sky); class set by the early inline script before render.

## Design
- No emoji in the UI: `ICONS` (line SVGs) + `I(name)`; category icons via `ci(c)`; any emoji (incl. saved data like goal/debt `e`) is converted to an icon at render time by `iconize()` (MutationObserver) using the `EMO` map — add new emoji there.
- Alternative theme "Aqua Glass" (earlier choice: premium, dimensional, glassy, blue–green–white): fixed aqua mesh background, frosted glass cards/tab bar/sheets (backdrop-filter), glossy 3D icon bubbles, ocean-gradient balance card with white guilloche + silver chip (SVG data URIs in CSS vars `--art-*`). UI accents are blue/teal/green; category data colors stay as validated.
- Home is e-wallet style: gradient header, white balance card with hide-amount eye, 4 quick actions, insight carousel. Entry sheet uses a custom iOS keypad with + − × math, category chip row, date chips, note suggestions.
- Cards radius 26 glass, frosted floating tab bar, bottom sheets, segmented controls; system font + Noto Sans Thai.
- Expense category colors are fixed and color-blind validated in this order: food #FF8A00, transport #007AFF, shopping #FF2D55, home #20A8C0, fun #AF52DE, health #30C26A, bills #5856D6, edu #D9A400, other #8E8E93. Adding a category needs re-validation.
- Income/expense chart: #007AFF / #FF8A00. People: a #AF52DE, b #20A8C0, both #FF8A00.
