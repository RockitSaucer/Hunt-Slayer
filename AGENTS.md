# Hunt-Slayer agent notes

Production site for **REG SLAYER** (https://regslayer.com).  
Source of truth for the live multi-file app; TestOffline is the experimental mirror.

## Pin & tool icons

**Full procedure:** [`docs/PIN_AND_TOOL_ICONS.md`](docs/PIN_AND_TOOL_ICONS.md)

1. Sources: `Desktop/HuntApp/button icons/Layers naked/` (pins), `Tool Icons/` (toolbar)
2. Run: `python tools/process_pin_icons.py` / `process_tool_icons.py`
3. Wire `PIN_ICON_CATALOG` in `index.html` from `icons/pins/_catalog.json`
4. Bump `SHELL_CACHE` in `sw.js` when shipping new shell assets

## Working rules

- Prefer editing files in this repo (or HuntApp promote folders) and deploy as a unit.
- User map data lives in **localStorage + Supabase**, never in the HTML repo.
- Do not rename storage keys without a migration.
- Keep offline tile cache name in sync: `offline-engine.js` and `sw.js` both use `reg-slayer-tiles-v2`.
