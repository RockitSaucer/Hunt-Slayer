/* REG SLAYER — production service worker
 * Caches app shell for return visits with no signal.
 * Map tiles: cache-first when already stored; network otherwise (then cache).
 */
const SHELL_CACHE = 'reg-slayer-shell-v79';
const TILE_CACHE = 'reg-slayer-tiles-v2';
const DATA_CACHE = 'reg-slayer-data-v1';

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './hunt-slayer-logo.png',
  './reg-slayer-logo.png',
  './peak-rut-antlers.png',
  // Peak-rut list skull (Available Hunts badge)
  './offline-engine.js',
  './auth-sync.js',
  './party-maps.js',
  // WMA permit Zone A/B rings (required offline / hard-refresh)
  './wma-zones-data.js',
  './icons/tools/measure.png',
  './icons/tools/draw.png',
  './icons/tools/track.png',
  './icons/tools/layers.png',
  // Pin glyphs — needed offline when opening a map with saved pins
  './icons/pins/alligator.png',
  './icons/pins/arrow.png',
  './icons/pins/beaver_dam.png',
  './icons/pins/blood.png',
  './icons/pins/boat.png',
  './icons/pins/boat_ramp.png',
  './icons/pins/bow.png',
  './icons/pins/bow_stand.png',
  './icons/pins/bridge.png',
  './icons/pins/buck.png',
  './icons/pins/camera.png',
  './icons/pins/crossing.png',
  './icons/pins/deadhead.png',
  './icons/pins/doe.png',
  './icons/pins/feeder.png',
  './icons/pins/food.png',
  './icons/pins/house.png',
  './icons/pins/muzzleloader.png',
  './icons/pins/prints.png',
  './icons/pins/rifle.png',
  './icons/pins/rifle_stand.png',
  './icons/pins/rub.png',
  './icons/pins/salt.png',
  './icons/pins/scrape.png',
  './icons/pins/shed.png',
  './icons/pins/tent.png',
  './icons/pins/tree.png',
  './icons/pins/truck.png',
  // Directional location icons (party / GPS)
  './icons/dir/arrow_head.png',
  './icons/dir/boat.png',
  './icons/dir/bomb.png',
  './icons/dir/bullet.png',
  './icons/dir/capture.png',
  './icons/dir/car.png',
  './icons/dir/helicopter.png',
  './icons/dir/prop_plane.png',
  './icons/dir/rocket.png',
  './icons/dir/shuttle.png',
  './icons/dir/speed_boat.png',
  './icons/dir/truck.png',
  './icons/dir/x_wing.png',
  './vendor/leaflet/leaflet.js',
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/marker-icon.png',
  './vendor/leaflet/marker-icon-2x.png',
  './vendor/leaflet/marker-shadow.png',
  './vendor/leaflet/layers.png',
  './vendor/leaflet/layers-2x.png'
];

function isTileUrl(url) {
  try {
    const u = new URL(url);
    const h = u.hostname;
    if (h.includes('basemap.nationalmap.gov')) return true;
    if (h.includes('basemaps.cartocdn.com')) return true;
    if (h.includes('arcgisonline.com') && u.pathname.includes('/tile/')) return true;
    if (h.includes('wayback.maptiles.arcgis.com') && u.pathname.includes('/tile/')) return true;
    if (h.includes('tiles.regrid.com')) return true;
    if (h.includes('tilecache.rainviewer.com')) return true;
    if (h.includes('tile.openstreetmap.org')) return true;
    return false;
  } catch (e) {
    return false;
  }
}

function isApiUrl(url) {
  try {
    const u = new URL(url);
    const h = u.hostname;
    if (h.includes('open-meteo.com')) return true;
    if (h.includes('api.weather.gov')) return true;
    if (h.includes('waterservices.usgs.gov') || h.includes('waterdata.usgs.gov')) return true;
    if (h.includes('conservationgis.alabama.gov')) return true;
    if (h.includes('services.arcgis.com') || h.includes('apps.fs.usda.gov')) return true;
    if (h.includes('api.rainviewer.com')) return true;
    return false;
  } catch (e) {
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(
        SHELL_ASSETS.map((path) =>
          cache.add(path).catch((err) => {
            console.warn('[SW] shell skip', path, err);
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== TILE_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isShellHtmlRequest(req, url) {
  if (req.mode === 'navigate') return true;
  try {
    const u = new URL(url);
    const p = u.pathname || '';
    if (p === '/' || p.endsWith('/') || p.endsWith('.html')) return true;
  } catch (e) {}
  return false;
}

/** Core app files that must update on mobile as soon as a new deploy is online */
function isShellAppScript(url) {
  try {
    const u = new URL(url);
    const p = u.pathname || '';
    return (
      p.endsWith('/index.html') ||
      p.endsWith('/offline-engine.js') ||
      p.endsWith('/auth-sync.js') ||
      p.endsWith('/party-maps.js') ||
      p.endsWith('/wma-zones-data.js') ||
      p.endsWith('/sw.js') ||
      p.endsWith('/manifest.webmanifest')
    );
  } catch (e) {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;

  // App shell / same-origin
  if (url.startsWith(self.registration.scope)) {
    /*
     * HTML + core JS: NETWORK-FIRST when online.
     * Cache-first left phones stuck on old deploys (desktop CDN looked new;
     * mobile SW kept serving reg-slayer-shell-vN index forever).
     * Offline still falls back to shell cache.
     */
    if (isShellHtmlRequest(req, url) || isShellAppScript(url)) {
      event.respondWith(
        fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() =>
            caches.match(req).then((cached) => {
              if (cached) return cached;
              if (isShellHtmlRequest(req, url)) return caches.match('./index.html');
              return Response.error();
            })
          )
      );
      return;
    }

    // Other same-origin assets (icons, vendor): cache-first, revalidate in background
    event.respondWith(
      caches.match(req).then((cached) => {
        const net = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached || Response.error());
        return cached || net;
      })
    );
    return;
  }

  // Map tiles: cache-first (supports offline packs + browsed tiles)
  if (isTileUrl(url)) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req)
            .then((res) => {
              if (res && res.ok) {
                try {
                  cache.put(req, res.clone());
                } catch (e) {}
              }
              return res;
            })
            .catch(() => cached || Response.error());
        })
      )
    );
    return;
  }

  // Weather / GIS APIs: network-first, fall back to cache
  if (isApiUrl(url)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(DATA_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || Response.error())
        )
    );
  }
});

// Allow page to ask SW to precache a list of tile URLs
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'PRECACHE_URLS' && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(TILE_CACHE).then(async (cache) => {
        let ok = 0;
        let fail = 0;
        for (const u of data.urls) {
          try {
            const res = await fetch(u, { mode: 'cors', credentials: 'omit' });
            if (res && res.ok) {
              await cache.put(u, res.clone());
              ok++;
            } else {
              fail++;
            }
          } catch (e) {
            fail++;
          }
          if (event.source && (ok + fail) % 20 === 0) {
            event.source.postMessage({
              type: 'PRECACHE_PROGRESS',
              ok,
              fail,
              total: data.urls.length,
              packId: data.packId || null
            });
          }
        }
        if (event.source) {
          event.source.postMessage({
            type: 'PRECACHE_DONE',
            ok,
            fail,
            total: data.urls.length,
            packId: data.packId || null
          });
        }
      })
    );
  }
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
