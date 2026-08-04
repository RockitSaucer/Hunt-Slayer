# REG SLAYER — Hunt Slayer

**Current release:** **V5.6 Beta**

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
| `peak-rut-antlers.png` | Peak-rut list skull badge |
| `manifest.webmanifest` | PWA / Add to Home Screen |

## V5.6 notes

- My Maps: active maps first; tap to expand View/Share + details (code/party under selection)
- Sign out + cloud sync / offline mode moved to Tools tab (sync at bottom)
- Layers overlays order: Public lands → Pins → Roads → Topo → Property → Deer zones
- Public lands opacity slider (all types at once)

## V5.5 notes

- Radar and Track no longer strip map overlays / clear the map
- Max/Min and compass/wind stay visible when radar or track turns off

## V5.4 notes

- Share location button pulses again when active
- Track button stays visible and pulses while recording
- Live track HUD above Track: distance, time, elevation change, Stop
- On stop: save modal with optional name, line color, Delete track

## V5.3 notes

- Peak-rut red skull badge: reliable on desktop (opacity pulse, PNG + data-URI fallback)
- Green ✓ list pins: snap to live GIS centroids so markers sit on the public-land overlay
- Wheeler North/South coords corrected to FWS Public Hunt Units (Main Hunt Area / Flint Creek West)

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

See [`docs/PIN_AND_TOOL_ICONS.md`](docs/PIN_AND_TOOL_ICONS.md).
