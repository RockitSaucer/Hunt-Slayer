# REG SLAYER — Hunt Slayer

**Current release:** **V5.2 Beta**

Alabama deer planner with map tools, offline map packs, account login, personal/shared maps, and parties.

## Production

- Site: https://regslayer.com  
- Repo: this project (multi-file static app)  
- Auth / maps: Supabase **HuntSlayer**

## App shell

| File | Role |
|------|------|
| `index.html` | Main app (planner, map, weather, UI) |
| `offline-engine.js` | Offline packs, weather disk cache, SW registration |
| `sw.js` | Service worker (shell + tile + API caches) |
| `auth-sync.js` | Login + personal/shared map cloud sync |
| `party-maps.js` | Parties, live location share |
| `vendor/leaflet/` | Bundled map engine (works offline after first visit) |
| `icons/pins/` · `icons/tools/` | Custom map pins and toolbar icons |
| `manifest.webmanifest` | PWA / Add to Home Screen |

## Offline use

1. Open the site **with signal** once.  
2. Map spot menu → **Offline map** (2 mi basemap tiles), or save a drawn area and accept tile download.  
3. Airplane mode / no service: planner, pins/areas, and cached map tiles still work.  

Service workers need **https** (or localhost).

## Local preview

```bash
python -m http.server 8080
# open http://localhost:8080/
```

## Pin & tool icons

See [`docs/PIN_AND_TOOL_ICONS.md`](docs/PIN_AND_TOOL_ICONS.md). Scripts: `tools/process_pin_icons.py`, `tools/process_tool_icons.py`.

## V5.2 notes

- Promoted from TestOffline: offline packs, pin pack, multi-file shell, toolbar tool icons  
- Tile pack cache aligned with service worker (`reg-slayer-tiles-v2`)  
- Production branding (no TestOffline labels)
