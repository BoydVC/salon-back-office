# Salon Back Office

Warm, mobile-friendly hair-salon desk for **Miranda Boyd** — TokenMax burn build inspired by @WetterBo’s salon back office.

**DEMO / sample data only.** All clients, phones, emails, formulas, and receipts are fictional. JT and Laney appear as first-name demo stand-ins (hair clients, not family). No real client PII.

## Screens

1. **Week** — 7-day bookings calendar with day columns + week stats  
2. **Clients** — cards with color formulas, notes, tags  
3. **Inventory** — product table with low-stock flags  
4. **Revenue** — SVG revenue-by-week chart + summary cards  
5. **About** — demo disclaimer + run notes  

Receipt drawer opens from the header (paid DEMO receipts).

## Run

```bash
./run.sh          # build + serve http://127.0.0.1:4305/
./run.sh --shots  # + screenshots/
```

Offline single file: `dist/salon-back-office.html`

## Layout

- `web/` — index.html, app.css, app.js  
- `data/demo.json` — DEMO sample data  
- `build.py` / `server.py` / `tests/screenshot.sh`


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/salon-back-office` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
- Personal details (emails, phone numbers, home street address) were replaced with `[redacted-…]` placeholders.
