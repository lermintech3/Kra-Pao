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
- `meta/settings`: `{a:{name,e}, b:{name,e}, budgets:{catId: amount}}`
- Falls back to localStorage when `claude.use('db')` resolves null.

## Design
- bg `#F2F2F7`, white cards radius 22, frosted floating tab bar, bottom sheets, segmented controls; system font + Noto Sans Thai.
- Expense category colors are fixed and color-blind validated in this order: food #FF8A00, transport #007AFF, shopping #FF2D55, home #20A8C0, fun #AF52DE, health #30C26A, bills #5856D6, edu #D9A400, other #8E8E93. Adding a category needs re-validation.
- Income/expense chart: #007AFF / #FF8A00. People: a #AF52DE, b #20A8C0, both #FF8A00.
