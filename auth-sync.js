/* REG SLAYER 5.2 Beta — Auth + personal/shared map cloud sync (local-first).
   Loaded inline into index.html. Performance rules:
   - Always write localStorage first
   - Debounced cloud push (idle when possible)
   - No push while offlineMode or navigator.onLine === false
   - No aggressive polling; shared pull only when tab visible
*/
(function () {
  'use strict';

  var SB_URL = 'https://grvhmktqzrivbqbczkii.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdydmhta3RxenJpdmJxYmN6a2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MDQ0MTIsImV4cCI6MjEwMTI4MDQxMn0.fFfrS-7w45IzxwOvvyYDB5ngLnyTz-Ru7XVL5LZXm4o';

  var EMAIL_DOMAIN = 'users.regslayer.local';
  var VIEW_KEY = 'reg_slayer_view_v1';
  var OFFLINE_KEY = 'reg_slayer_offline_mode_v1';
  var CACHE_KEY = 'reg_slayer_map_cache_v1';
  var DIRTY_KEY = 'reg_slayer_map_dirty_v1';
  var MAX_CACHE_BYTES = 1800000; // ~1.8MB prune threshold

  var sb = null;
  var sessionUser = null;
  var profile = null;
  var viewState = { mode: 'private', privateMapId: null, privateMapName: 'My Map', sharedMapId: null, sharedMapName: '', sharedMapCode: '' };
  var offlineMode = false;
  var cloudBusy = false;
  var dirty = false;
  var pushTimer = null;
  var pullTimer = null;
  var lastPullAt = 0;
  var localRevision = 0;
  var pendingSignupCodes = null;
  var authReadyResolve = null;
  var authReady = new Promise(function (r) { authReadyResolve = r; });

  function $(id) { return document.getElementById(id); }

  function normalizeUsername(u) {
    return String(u || '').trim().toLowerCase().replace(/\s+/g, '');
  }

  function syntheticEmail(username) {
    return normalizeUsername(username) + '@' + EMAIL_DOMAIN;
  }

  function isOnline() {
    if (offlineMode) return false;
    try { if (navigator.onLine === false) return false; } catch (e) {}
    return true;
  }

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function saveJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function loadViewState() {
    var v = loadJson(VIEW_KEY, null);
    if (v && (v.mode === 'personal' || v.mode === 'private' || v.mode === 'shared')) {
      viewState = Object.assign({
        mode: 'private', privateMapId: null, privateMapName: 'My Map',
        sharedMapId: null, sharedMapName: '', sharedMapCode: ''
      }, v);
      if (viewState.mode === 'personal') viewState.mode = 'private';
    }
  }

  function persistViewState() {
    saveJson(VIEW_KEY, viewState);
  }

  function loadOfflineMode() {
    try { offlineMode = localStorage.getItem(OFFLINE_KEY) === '1'; } catch (e) { offlineMode = false; }
  }

  function setOfflineMode(on) {
    offlineMode = !!on;
    try { localStorage.setItem(OFFLINE_KEY, offlineMode ? '1' : '0'); } catch (e) {}
    updateAuthChrome();
    if (!offlineMode && isDirty()) scheduleCloudPush(true);
  }

  function isDirty() {
    if (dirty) return true;
    try { return localStorage.getItem(DIRTY_KEY) === '1'; } catch (e) { return false; }
  }

  function restoreDirtyFlag() {
    try { dirty = localStorage.getItem(DIRTY_KEY) === '1'; } catch (e) { dirty = false; }
  }

  // ---- Map state pack/unpack (mirrors existing localStorage keys) ----
  var MAP_KEYS = {
    pins: 'alabama_hunt_custom_pins',
    hunts: 'alabama_hunt_historical_hunts',
    customAreas: 'alabama_hunt_custom_areas_v1',
    measuredPaths: 'alabama_hunt_measured_paths_v1',
    stands: 'alabama_hunt_user_stands_v1',
    hiddenLocs: 'alabama_hunt_hidden_locations_v1'
  };

  function emptyMapState() {
    return {
      pins: [],
      hunts: [],
      customAreas: [],
      measuredPaths: [],
      stands: {},
      hiddenLocs: [],
      meta: { savedAt: new Date().toISOString(), revision: 0 }
    };
  }

  function mapStateHasContent(state) {
    if (!state || typeof state !== 'object') return false;
    if (state.pins && state.pins.length) return true;
    if (state.hunts && state.hunts.length) return true;
    if (state.customAreas && state.customAreas.length) return true;
    if (state.measuredPaths && state.measuredPaths.length) return true;
    if (state.hiddenLocs && state.hiddenLocs.length) return true;
    if (state.stands && typeof state.stands === 'object') {
      try {
        if (Object.keys(state.stands).length) return true;
      } catch (eK) {}
    }
    return false;
  }

  function collectMapState() {
    var state = {
      pins: loadJson(MAP_KEYS.pins, []),
      hunts: loadJson(MAP_KEYS.hunts, []),
      customAreas: loadJson(MAP_KEYS.customAreas, []),
      measuredPaths: loadJson(MAP_KEYS.measuredPaths, []),
      stands: loadJson(MAP_KEYS.stands, {}),
      hiddenLocs: loadJson(MAP_KEYS.hiddenLocs, []),
      meta: { savedAt: new Date().toISOString(), revision: localRevision || 0 }
    };
    return state;
  }

  function applyMapState(state) {
    if (!state || typeof state !== 'object') state = {};
    saveJson(MAP_KEYS.pins, Array.isArray(state.pins) ? state.pins : []);
    saveJson(MAP_KEYS.hunts, Array.isArray(state.hunts) ? state.hunts : []);
    saveJson(MAP_KEYS.customAreas, Array.isArray(state.customAreas) ? state.customAreas : []);
    saveJson(MAP_KEYS.measuredPaths, Array.isArray(state.measuredPaths) ? state.measuredPaths : []);
    saveJson(MAP_KEYS.stands, state.stands && typeof state.stands === 'object' ? state.stands : {});
    saveJson(MAP_KEYS.hiddenLocs, Array.isArray(state.hiddenLocs) ? state.hiddenLocs : []);
    localRevision = (state.meta && state.meta.revision) || 0;
  }

  function cacheSlotKey() {
    if (viewState.mode === 'shared' && viewState.sharedMapId) return 'shared:' + viewState.sharedMapId;
    if (viewState.privateMapId) return 'private:' + viewState.privateMapId;
    return 'personal';
  }

  /**
   * Load THIS map's cached state into the live localStorage keys (pins/areas/etc).
   * If this map has never been opened, clear live keys so the previous map's data
   * cannot leak into a new empty map.
   */
  function applyLiveKeysFromCurrentSlot() {
    var cached = readLocalCache(cacheSlotKey());
    if (cached && cached.state) {
      applyMapState(cached.state);
      localRevision = (cached.state.meta && cached.state.meta.revision) || 0;
    } else {
      applyMapState(emptyMapState());
      localRevision = 0;
      // Seed an empty cache entry so later collect/push never re-imports another map
      try { writeLocalCache(emptyMapState()); } catch (eW) {}
    }
  }

  function writeLocalCache(state) {
    var cache = loadJson(CACHE_KEY, {});
    cache[cacheSlotKey()] = {
      state: state,
      savedAt: Date.now(),
      name: viewState.mode === 'shared'
        ? (viewState.sharedMapName || 'Shared map')
        : (viewState.privateMapName || 'My Map'),
      code: viewState.sharedMapCode || null
    };
    // Prune if too large
    try {
      var raw = JSON.stringify(cache);
      if (raw.length > MAX_CACHE_BYTES) {
        var entries = Object.keys(cache).map(function (k) {
          return { k: k, t: (cache[k] && cache[k].savedAt) || 0 };
        }).sort(function (a, b) { return a.t - b.t; });
        var active = cacheSlotKey();
        while (entries.length > 2 && JSON.stringify(cache).length > MAX_CACHE_BYTES * 0.75) {
          var drop = entries.shift();
          if (drop.k !== active && drop.k !== 'personal') delete cache[drop.k];
          else break;
        }
      }
    } catch (e) {}
    saveJson(CACHE_KEY, cache);
  }

  function readLocalCache(slot) {
    var cache = loadJson(CACHE_KEY, {});
    return cache[slot] || null;
  }

  function markDirty() {
    dirty = true;
    try { localStorage.setItem(DIRTY_KEY, '1'); } catch (e) {}
    // Always refresh local cache immediately (offline-safe)
    try {
      var st = collectMapState();
      writeLocalCache(st);
    } catch (e2) {}
    // Fast path: upload soon after edit/delete (still idle-friendly)
    scheduleCloudPush(false);
  }

  function scheduleCloudPush(immediate) {
    if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
    var delay = immediate ? 50 : 700;
    pushTimer = setTimeout(function () {
      pushTimer = null;
      runWhenIdle(function () { pushMapToCloud(); });
    }, delay);
  }

  // Public hook used after any map feature save
  window.regSlayerMapDataChanged = function () {
    try { markDirty(); } catch (e) {}
  };

  function runWhenIdle(fn) {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(function () { try { fn(); } catch (e) { console.warn(e); } }, { timeout: 2500 });
    } else {
      setTimeout(function () { try { fn(); } catch (e) { console.warn(e); } }, 0);
    }
  }

  async function pushMapToCloud() {
    if (!sb || !sessionUser || cloudBusy) return;
    if (!isOnline()) return;
    if (!isDirty()) return;
    cloudBusy = true;
    updateSyncBadge('syncing');
    try {
      // Local is authority when dirty — full replace (no merge).
      // Merge-by-id was resurrecting deleted pins/areas on push/refresh.
      var state = collectMapState();
      writeLocalCache(state);
      if (!state.meta) state.meta = {};
      state.meta.savedAt = new Date().toISOString();
      state.meta.savedBy = sessionUser.id;

      if (viewState.mode === 'shared' && viewState.sharedMapId) {
        var { data: cur, error: rErr } = await sb
          .from('shared_maps')
          .select('map_revision')
          .eq('id', viewState.sharedMapId)
          .maybeSingle();
        if (rErr) throw rErr;
        var remoteRev = (cur && cur.map_revision) || 0;
        var nextRev = remoteRev + 1;
        state.meta.revision = nextRev;
        var { error: uErr } = await sb
          .from('shared_maps')
          .update({ map_state: state, map_revision: nextRev })
          .eq('id', viewState.sharedMapId);
        if (uErr) throw uErr;
        localRevision = nextRev;
      } else if (viewState.privateMapId) {
        var { data: pm, error: pmErr } = await sb
          .from('private_maps')
          .select('map_revision')
          .eq('id', viewState.privateMapId)
          .maybeSingle();
        if (pmErr) throw pmErr;
        var prev = ((pm && pm.map_revision) || 0) + 1;
        state.meta.revision = prev;
        var { error: pUp } = await sb
          .from('private_maps')
          .update({
            map_state: state,
            map_revision: prev,
            updated_at: new Date().toISOString()
          })
          .eq('id', viewState.privateMapId);
        if (pUp) throw pUp;
        localRevision = prev;
      } else {
        var { data: um, error: umErr } = await sb
          .from('user_map_state')
          .select('map_revision')
          .eq('user_id', sessionUser.id)
          .maybeSingle();
        if (umErr) throw umErr;
        var urev = ((um && um.map_revision) || 0) + 1;
        state.meta.revision = urev;
        var { error: upErr } = await sb
          .from('user_map_state')
          .upsert({
            user_id: sessionUser.id,
            map_state: state,
            map_revision: urev,
            updated_at: new Date().toISOString()
          });
        if (upErr) throw upErr;
        localRevision = urev;
      }
      dirty = false;
      try { localStorage.removeItem(DIRTY_KEY); } catch (e) {}
      writeLocalCache(state);
      updateSyncBadge('ok');
    } catch (e) {
      console.warn('Cloud push deferred', e);
      updateSyncBadge('pending');
    } finally {
      cloudBusy = false;
    }
  }

  async function pullMapFromCloud(force) {
    if (!sb || !sessionUser) return;
    if (!isOnline()) return;
    // Shared maps need quicker pin/emphasize sync; private can stay slower
    var minGap = (viewState.mode === 'shared') ? 2500 : 12000;
    if (!force && Date.now() - lastPullAt < minGap) return;
    // Never overwrite a local delete/edit that has not uploaded yet
    if (isDirty()) {
      scheduleCloudPush(true);
      return;
    }
    try {
      var state = null;
      var rev = 0;
      if (viewState.mode === 'shared' && viewState.sharedMapId) {
        var { data, error } = await sb
          .from('shared_maps')
          .select('map_state, map_revision, name, code')
          .eq('id', viewState.sharedMapId)
          .maybeSingle();
        if (error) throw error;
        if (!data) return;
        state = data.map_state || {};
        rev = data.map_revision || 0;
        viewState.sharedMapName = data.name || viewState.sharedMapName;
        viewState.sharedMapCode = data.code || viewState.sharedMapCode;
        persistViewState();
      } else if (viewState.privateMapId) {
        var { data: pmd, error: pe } = await sb
          .from('private_maps')
          .select('map_state, map_revision, name')
          .eq('id', viewState.privateMapId)
          .maybeSingle();
        if (pe) throw pe;
        if (!pmd) return;
        state = pmd.map_state || {};
        rev = pmd.map_revision || 0;
        viewState.privateMapName = pmd.name || viewState.privateMapName;
        persistViewState();
      } else {
        var { data: um, error: e2 } = await sb
          .from('user_map_state')
          .select('map_state, map_revision')
          .eq('user_id', sessionUser.id)
          .maybeSingle();
        if (e2) throw e2;
        if (!um) return;
        state = um.map_state || {};
        rev = um.map_revision || 0;
      }
      lastPullAt = Date.now();
      if (rev && rev === localRevision && !force) return;

      // If remote is empty but local still has data (and not dirty), seed cloud only when
      // the data belongs to THIS map's cache slot — never import leftovers from another map.
      var local = collectMapState();
      var remoteEmpty = !mapStateHasContent(state);
      var localHas = mapStateHasContent(local);
      var slotCache = readLocalCache(cacheSlotKey());
      var slotOwnsData = !!(slotCache && mapStateHasContent(slotCache.state));
      if (remoteEmpty && localHas && !rev && slotOwnsData) {
        dirty = true;
        try { localStorage.setItem(DIRTY_KEY, '1'); } catch (eD) {}
        scheduleCloudPush(true);
        return;
      }
      if (remoteEmpty && localHas && !rev && !slotOwnsData) {
        // Live keys still hold another map's pins — wipe them for this empty map
        applyMapState(state || emptyMapState());
        localRevision = 0;
        writeLocalCache(emptyMapState());
        refreshMapFromLocalState();
        updateAuthChrome();
        return;
      }

      // Full replace from cloud (includes deletions). Dirty local already bailed out above.
      applyMapState(state);
      localRevision = rev;
      writeLocalCache(state);
      refreshMapFromLocalState();
      updateAuthChrome();
    } catch (e) {
      console.warn('Cloud pull skipped', e);
    }
  }

  function refreshMapFromLocalState() {
    try {
      // silent: background party sync (emphasize pulse, pin edits) — no toast spam
      if (typeof window.regSlayerRefreshMapData === 'function') {
        window.regSlayerRefreshMapData({ silent: true });
      }
    } catch (e) {
      console.warn('refreshMapFromLocalState', e);
    }
  }

  /** Supabase Realtime: shared map updates (emphasize beacon, pin edits) for all members. */
  var sharedMapChannel = null;
  var sharedMapFastPoll = null;

  function stopSharedMapLiveSync() {
    try {
      if (sharedMapChannel && sb) {
        sb.removeChannel(sharedMapChannel);
      }
    } catch (e0) {}
    sharedMapChannel = null;
    if (sharedMapFastPoll) {
      try { clearInterval(sharedMapFastPoll); } catch (e1) {}
      sharedMapFastPoll = null;
    }
  }

  function startSharedMapLiveSync() {
    stopSharedMapLiveSync();
    if (!sb || !sessionUser) return;
    if (viewState.mode !== 'shared' || !viewState.sharedMapId) return;
    var mapId = viewState.sharedMapId;

    // Realtime on shared_maps row (requires Realtime enabled for table in Supabase)
    try {
      sharedMapChannel = sb
        .channel('shared-map-live-' + mapId)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'shared_maps',
            filter: 'id=eq.' + mapId
          },
          function (payload) {
            try {
              if (isDirty()) return; // don't clobber local edits
              var row = payload && payload.new;
              if (!row) return;
              var rev = row.map_revision || 0;
              if (rev && rev === localRevision) return;
              var state = row.map_state || {};
              applyMapState(state);
              localRevision = rev;
              writeLocalCache(state);
              lastPullAt = Date.now();
              refreshMapFromLocalState();
            } catch (eRt) {
              console.warn('shared map realtime apply', eRt);
            }
          }
        )
        .subscribe(function (status) {
          // status: SUBSCRIBED | CHANNEL_ERROR | TIMED_OUT | CLOSED
          try { /* optional debug */ } catch (eS) {}
        });
    } catch (eCh) {
      console.warn('shared map realtime unavailable', eCh);
      sharedMapChannel = null;
    }

    // Fast poll backup so emphasize still lands if Realtime is off (every 4s on shared maps)
    sharedMapFastPoll = setInterval(function () {
      if (document.visibilityState === 'hidden') return;
      if (!isOnline() || isDirty()) return;
      if (viewState.mode !== 'shared' || !viewState.sharedMapId) return;
      pullMapFromCloud(false);
    }, 4000);
  }

  async function persistViewPrefsCloud() {
    if (!sb || !sessionUser || !isOnline()) return;
    try {
      var mode = viewState.mode === 'shared' ? 'shared' : 'private';
      await sb.from('user_view_prefs').upsert({
        user_id: sessionUser.id,
        view_mode: mode,
        last_shared_map_id: viewState.mode === 'shared' ? viewState.sharedMapId : null,
        last_private_map_id: viewState.mode !== 'shared' ? viewState.privateMapId : null,
        updated_at: new Date().toISOString()
      });
    } catch (e) {}
  }

  async function ensureDefaultPrivateMap() {
    if (!sb || !sessionUser) return null;
    var { data: list } = await sb.rpc('list_my_private_maps');
    if (list && list.length) {
      var def = list.find(function (m) { return m.is_default; }) || list[0];
      return def;
    }
    var { data: created } = await sb.rpc('create_private_map', { p_name: 'My Map' });
    return created;
  }

  async function restoreViewPrefsFromCloud() {
    if (!sb || !sessionUser || !isOnline()) return;
    try {
      var def = await ensureDefaultPrivateMap();
      var { data } = await sb
        .from('user_view_prefs')
        .select('view_mode, last_shared_map_id, last_private_map_id')
        .eq('user_id', sessionUser.id)
        .maybeSingle();
      if (data && (data.view_mode === 'shared') && data.last_shared_map_id) {
        var { data: sm } = await sb
          .from('shared_maps')
          .select('id, name, code')
          .eq('id', data.last_shared_map_id)
          .maybeSingle();
        if (sm) {
          viewState.mode = 'shared';
          viewState.sharedMapId = sm.id;
          viewState.sharedMapName = sm.name;
          viewState.sharedMapCode = sm.code;
          if (def) {
            viewState.privateMapId = viewState.privateMapId || def.id;
            viewState.privateMapName = viewState.privateMapName || def.name;
          }
          persistViewState();
          return;
        }
      }
      var pid = (data && data.last_private_map_id) || (def && def.id);
      if (pid) {
        var { data: pm } = await sb.from('private_maps').select('id, name').eq('id', pid).maybeSingle();
        if (pm) {
          viewState.mode = 'private';
          viewState.privateMapId = pm.id;
          viewState.privateMapName = pm.name;
          viewState.sharedMapId = null;
          viewState.sharedMapName = '';
          viewState.sharedMapCode = '';
          persistViewState();
          return;
        }
      }
      if (def) {
        viewState.mode = 'private';
        viewState.privateMapId = def.id;
        viewState.privateMapName = def.name;
        viewState.sharedMapId = null;
        viewState.sharedMapName = '';
        viewState.sharedMapCode = '';
        persistViewState();
      }
    } catch (e) {}
  }

  // ---- Auth ----
  function randomRecoveryCodes(n) {
    var out = [];
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (var i = 0; i < n; i++) {
      var s = '';
      var arr = new Uint8Array(8);
      crypto.getRandomValues(arr);
      for (var j = 0; j < 8; j++) s += alphabet[arr[j] % alphabet.length];
      // format XXXX-XXXX
      out.push(s.slice(0, 4) + '-' + s.slice(4));
    }
    return out;
  }

  async function sha256Hex(text) {
    var data = new TextEncoder().encode(text);
    var hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  async function ensureClient() {
    if (sb) return sb;
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase library not loaded');
    }
    // Same Supabase project for regslayer.com + huntslayer.com — one account works on both.
    // Session storage is origin-scoped (sign in once per domain if switching sites),
    // but username / password / recovery codes are identical against HuntSlayer auth.
    sb = window.supabase.createClient(SB_URL, SB_ANON, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    return sb;
  }

  /** Public origins that share this auth backend (for invite links / docs). */
  function appPublicOrigins() {
    return ['https://regslayer.com', 'https://huntslayer.com', 'https://www.regslayer.com', 'https://www.huntslayer.com'];
  }
  function currentAppOrigin() {
    try {
      if (window.location && window.location.origin && /^https?:/i.test(window.location.origin)) {
        return window.location.origin.replace(/\/$/, '');
      }
    } catch (e) {}
    return 'https://regslayer.com';
  }
  function inviteJoinUrl(code) {
    var c = String(code || '').replace(/\D/g, '').slice(0, 6);
    return currentAppOrigin() + '/?join=' + c;
  }

  /** Base64url helpers for sister-site SSO handoff (tokens in URL hash only). */
  function b64urlEncode(str) {
    try {
      var b64 = btoa(unescape(encodeURIComponent(str)));
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    } catch (e) { return ''; }
  }
  function b64urlDecode(str) {
    try {
      var s = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      return decodeURIComponent(escape(atob(s)));
    } catch (e) { return ''; }
  }

  /**
   * Consume #rs_sso=… handoff from the sister site (same Supabase project).
   * Restores session into this origin's localStorage and optional view prefs.
   */
  async function consumeSisterSsoHandoff() {
    var raw = '';
    try {
      var hash = String(window.location.hash || '');
      var m = hash.match(/(?:^|#|&)rs_sso=([^&]+)/);
      if (m) raw = m[1];
      if (!raw) {
        var u = new URL(window.location.href);
        raw = u.searchParams.get('rs_sso') || '';
      }
    } catch (e0) { raw = ''; }
    if (!raw) return false;

    // Strip tokens from the address bar immediately
    try {
      var u2 = new URL(window.location.href);
      u2.searchParams.delete('rs_sso');
      var h2 = String(u2.hash || '').replace(/([#&]?)rs_sso=[^&]*/g, '').replace(/^#&/, '#').replace(/^#$/, '');
      u2.hash = h2.charAt(0) === '#' ? h2.slice(1) : h2;
      if (window.history && history.replaceState) {
        history.replaceState({}, '', u2.pathname + (u2.search || '') + (u2.hash || ''));
      }
    } catch (eStrip) {}

    var payload = null;
    try { payload = JSON.parse(b64urlDecode(raw)); } catch (eP) { payload = null; }
    if (!payload || !payload.at || !payload.rt) return false;

    try {
      await ensureClient();
      var res = await sb.auth.setSession({
        access_token: payload.at,
        refresh_token: payload.rt
      });
      if (res && res.error) throw res.error;
      if (payload.view && typeof payload.view === 'object') {
        try {
          viewState = Object.assign({
            mode: 'private', privateMapId: null, privateMapName: 'My Map',
            sharedMapId: null, sharedMapName: '', sharedMapCode: ''
          }, payload.view);
          if (viewState.mode === 'personal') viewState.mode = 'private';
          persistViewState();
        } catch (eV) {}
      }
      return true;
    } catch (eSet) {
      console.warn('Sister SSO handoff failed', eSet);
      return false;
    }
  }

  /**
   * Build sister-site URL with session handoff so the other origin is signed in.
   * targetOrigin e.g. https://www.regslayer.com
   */
  async function buildSisterHandoffUrl(targetOrigin) {
    var base = String(targetOrigin || '').replace(/\/$/, '');
    if (!base) base = 'https://regslayer.com';
    var url = base + '/';
    try {
      await ensureClient();
      var { data } = await sb.auth.getSession();
      var sess = data && data.session;
      if (sess && sess.access_token && sess.refresh_token) {
        var payload = {
          at: sess.access_token,
          rt: sess.refresh_token,
          exp: sess.expires_at || null,
          view: viewState || null,
          t: Date.now()
        };
        var enc = b64urlEncode(JSON.stringify(payload));
        if (enc) url = base + '/#rs_sso=' + enc;
      }
    } catch (e) {}
    return url;
  }

  /** Navigate to sister site with session (same tab). */
  async function goToSisterSite(targetOrigin) {
    var url = await buildSisterHandoffUrl(targetOrigin);
    window.location.href = url;
  }

  async function loadProfile() {
    if (!sb || !sessionUser) return null;
    var { data, error } = await sb
      .from('profiles')
      .select('id, username, recovery_email, display_name')
      .eq('id', sessionUser.id)
      .maybeSingle();
    if (error) throw error;
    profile = data;
    return profile;
  }

  async function signUp(username, password, recoveryEmail) {
    await ensureClient();
    var uname = normalizeUsername(username);
    if (uname.length < 3 || uname.length > 32 || !/^[a-z0-9_]+$/.test(uname)) {
      throw new Error('Username: 3–32 chars, letters/numbers/underscore only');
    }
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
    var email = syntheticEmail(uname);
    var codes = randomRecoveryCodes(8);
    var hashes = [];
    for (var i = 0; i < codes.length; i++) hashes.push(await sha256Hex(codes[i].toUpperCase()));

    var { data, error } = await sb.auth.signUp({
      email: email,
      password: password,
      options: { data: { username: uname } }
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign up failed');

    var recEmail = recoveryEmail && String(recoveryEmail).trim() ? String(recoveryEmail).trim() : null;
    var { error: pErr } = await sb.from('profiles').insert({
      id: data.user.id,
      username: username.trim(),
      username_normalized: uname,
      recovery_email: recEmail,
      recovery_code_hashes: hashes,
      display_name: username.trim()
    });
    if (pErr) throw pErr;

    pendingSignupCodes = codes;
    sessionUser = data.user;
    await loadProfile();
    return { codes: codes };
  }

  async function signIn(username, password) {
    await ensureClient();
    var uname = normalizeUsername(username);
    var email = syntheticEmail(uname);
    var { data, error } = await sb.auth.signInWithPassword({ email: email, password: password });
    if (error) throw error;
    sessionUser = data.user;
    await loadProfile();
    return data;
  }

  async function signOut() {
    if (sb) await sb.auth.signOut();
    sessionUser = null;
    profile = null;
    showAuthGate(true);
  }

  async function recoverWithCode(username, code, newPassword) {
    var res = await fetch(SB_URL + '/functions/v1/recover-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SB_ANON,
        Authorization: 'Bearer ' + SB_ANON
      },
      body: JSON.stringify({
        username: username,
        recovery_code: String(code || '').trim().toUpperCase(),
        new_password: newPassword
      })
    });
    var body = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(body.error || 'Recovery failed');
    return true;
  }

  // ---- Shared maps ----
  async function createSharedMap(name) {
    if (!sb || !sessionUser) throw new Error('Sign in required');
    // Save current map first (do not copy its pins into the new shared map)
    await snapshotCurrentToCache();
    if (isDirty() && isOnline()) {
      try { await pushMapToCloud(); } catch (ePush) {}
    }
    var { data, error } = await sb.rpc('create_shared_map', { p_name: name });
    if (error) throw error;
    viewState.mode = 'shared';
    viewState.sharedMapId = data.id;
    viewState.sharedMapName = data.name;
    viewState.sharedMapCode = data.code;
    persistViewState();
    await persistViewPrefsCloud();
    // New shared maps start empty — content only arrives when users add it (or share later)
    dirty = false;
    try { localStorage.removeItem(DIRTY_KEY); } catch (eD) {}
    applyMapState(emptyMapState());
    localRevision = 0;
    writeLocalCache(emptyMapState());
    refreshMapFromLocalState();
    // Auto-copy invite with deep link
    try {
      var invite = inviteShareText(data.code, data.name);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(invite);
      } else {
        fallbackCopy(invite);
      }
    } catch (eCopy) {
      try { fallbackCopy(inviteShareText(data.code, data.name)); } catch (e2) {}
    }
    updateAuthChrome();
    try { startSharedMapLiveSync(); } catch (eLive) {}
    return data;
  }

  async function joinSharedMap(code) {
    if (!sb || !sessionUser) throw new Error('Sign in required');
    await snapshotCurrentToCache();
    if (isDirty() && isOnline()) {
      try { await pushMapToCloud(); } catch (ePush) {}
    }
    var { data, error } = await sb.rpc('join_shared_map', { p_code: code });
    if (error) throw error;
    viewState.mode = 'shared';
    viewState.sharedMapId = data.id;
    viewState.sharedMapName = data.name;
    viewState.sharedMapCode = data.code;
    persistViewState();
    await persistViewPrefsCloud();
    dirty = false;
    try { localStorage.removeItem(DIRTY_KEY); } catch (eD) {}
    // Load this shared map's cache or clear — never keep previous map's live keys
    applyLiveKeysFromCurrentSlot();
    await pullMapFromCloud(true);
    refreshMapFromLocalState();
    updateAuthChrome();
    try { startSharedMapLiveSync(); } catch (eLive) {}
    return data;
  }

  async function switchToPersonal() {
    await snapshotCurrentToCache();
    if (dirty && isOnline()) {
      try { await pushMapToCloud(); } catch (e) {}
    }
    var def = await ensureDefaultPrivateMap();
    viewState.mode = 'private';
    viewState.sharedMapId = null;
    viewState.sharedMapName = '';
    viewState.sharedMapCode = '';
    if (def) {
      viewState.privateMapId = def.id;
      viewState.privateMapName = def.name;
    }
    persistViewState();
    await persistViewPrefsCloud();
    dirty = false;
    try { localStorage.removeItem(DIRTY_KEY); } catch (eD) {}
    applyLiveKeysFromCurrentSlot();
    try { stopSharedMapLiveSync(); } catch (eStop) {}
    await pullMapFromCloud(true);
    refreshMapFromLocalState();
    updateAuthChrome();
    try {
      if (window.RegSlayerParty && typeof window.RegSlayerParty.recordMapVisit === 'function' && viewState.privateMapId) {
        window.RegSlayerParty.recordMapVisit('private', viewState.privateMapId);
      }
    } catch (eV) {}
  }

  async function switchToPrivateMap(mapId) {
    await snapshotCurrentToCache();
    if (isDirty() && isOnline()) {
      try { await pushMapToCloud(); } catch (e) {}
    }
    var { data, error } = await sb.from('private_maps').select('id, name').eq('id', mapId).maybeSingle();
    if (error || !data) throw error || new Error('Map not found');
    viewState.mode = 'private';
    viewState.privateMapId = data.id;
    viewState.privateMapName = data.name;
    viewState.sharedMapId = null;
    viewState.sharedMapName = '';
    viewState.sharedMapCode = '';
    persistViewState();
    await persistViewPrefsCloud();
    dirty = false;
    try { localStorage.removeItem(DIRTY_KEY); } catch (eD) {}
    // Critical: clear previous map's pins/areas from live keys before pull
    applyLiveKeysFromCurrentSlot();
    try { stopSharedMapLiveSync(); } catch (eStop) {}
    await pullMapFromCloud(true);
    refreshMapFromLocalState();
    updateAuthChrome();
    try {
      if (window.RegSlayerParty && typeof window.RegSlayerParty.recordMapVisit === 'function') {
        window.RegSlayerParty.recordMapVisit('private', data.id);
      }
    } catch (eV) {}
  }

  async function switchToShared(mapId) {
    await snapshotCurrentToCache();
    if (dirty && isOnline()) {
      try { await pushMapToCloud(); } catch (e) {}
    }
    var { data, error } = await sb.from('shared_maps').select('id, name, code').eq('id', mapId).maybeSingle();
    if (error || !data) throw error || new Error('Map not found');
    viewState.mode = 'shared';
    viewState.sharedMapId = data.id;
    viewState.sharedMapName = data.name;
    viewState.sharedMapCode = data.code;
    persistViewState();
    await persistViewPrefsCloud();
    dirty = false;
    try { localStorage.removeItem(DIRTY_KEY); } catch (eD) {}
    applyLiveKeysFromCurrentSlot();
    await pullMapFromCloud(true);
    refreshMapFromLocalState();
    updateAuthChrome();
    try { startSharedMapLiveSync(); } catch (eLive) {}
    try {
      if (window.RegSlayerParty && typeof window.RegSlayerParty.recordMapVisit === 'function') {
        window.RegSlayerParty.recordMapVisit('shared', data.id);
      }
    } catch (eV) {}
  }

  async function snapshotCurrentToCache() {
    try {
      var st = collectMapState();
      writeLocalCache(st);
    } catch (e) {}
  }

  async function listMySharedMaps() {
    if (!sb || !sessionUser) return [];
    var { data, error } = await sb.rpc('list_my_shared_maps');
    if (error) throw error;
    return data || [];
  }

  function shareCodeToClipboard() {
    var code = viewState.sharedMapCode;
    if (!code) {
      alert('Open a shared map first, or create one in Settings â†’ Maps.');
      return;
    }
    var text = inviteShareText(code, viewState.sharedMapName);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        alert('Copied:\n' + text);
      }).catch(function () {
        fallbackCopy(text);
      });
    } else fallbackCopy(text);
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Copied:\n' + text);
    } catch (e) {
      prompt('Copy this:', text);
    }
  }

  // ---- UI ----
  function resolveActiveMapLabel() {
    // Prefer party-maps display (includes personal aliases) when available
    try {
      if (window.RegSlayerParty && typeof window.RegSlayerParty.currentMapDisplayName === 'function') {
        var fromParty = window.RegSlayerParty.currentMapDisplayName(viewState);
        if (fromParty && String(fromParty).trim()) return String(fromParty).trim();
      }
    } catch (eP) {}
    if (viewState.mode === 'shared') {
      return (viewState.sharedMapName && String(viewState.sharedMapName).trim())
        ? String(viewState.sharedMapName).trim()
        : 'Shared map';
    }
    return (viewState.privateMapName && String(viewState.privateMapName).trim())
      ? String(viewState.privateMapName).trim()
      : 'My Map';
  }

  function updateAuthChrome() {
    var mapLabel = resolveActiveMapLabel();
    var mapTitle = viewState.mode === 'shared'
      ? ('Shared map · code ' + (viewState.sharedMapCode || ''))
      : 'Private map';
    // Prefer unified party label writer (mobile title + max chip + brand)
    try {
      if (window.RegSlayerParty && typeof window.RegSlayerParty.updateBrandName === 'function') {
        window.RegSlayerParty.updateBrandName();
      } else {
        var nameEl = $('brand-map-name');
        if (nameEl) {
          nameEl.textContent = mapLabel;
          nameEl.title = mapTitle;
          nameEl.style.display = '';
        }
        var mobileName = $('map-title-mobile');
        if (mobileName) {
          mobileName.textContent = mapLabel;
          mobileName.title = (mapTitle || 'Active map') + ' — click to switch maps';
          try { mobileName.setAttribute('aria-label', 'Map: ' + mapLabel + '. Click to switch.'); } catch (e1) {}
        }
        var fsTitle = $('map-fs-title');
        if (fsTitle) {
          fsTitle.textContent = mapLabel;
          fsTitle.title = (mapTitle || 'Active map') + ' — click to switch maps';
        }
        var bottomName = $('map-bottom-map-name');
        if (bottomName) {
          bottomName.textContent = mapLabel;
          bottomName.title = (mapTitle || 'Active map') + ' — click to switch maps';
          try { bottomName.setAttribute('aria-label', 'Map: ' + mapLabel + '. Click to switch.'); } catch (eBn) {}
        }
      }
    } catch (eLabels) {
      try {
        var mn = $('map-title-mobile');
        if (mn) mn.textContent = mapLabel;
        var btm = $('map-bottom-map-name');
        if (btm) btm.textContent = mapLabel;
      } catch (e2) {}
    }
    var badge = $('auth-user-chip');
    if (badge) {
      badge.textContent = profile && profile.username ? ('@' + profile.username) : (sessionUser ? 'Signed in' : '');
    }
    var modeLabel = $('set-map-mode-label');
    if (modeLabel) {
      if (viewState.mode === 'shared') {
        modeLabel.textContent = 'Viewing: ' + mapLabel + ' (shared)';
      } else {
        modeLabel.textContent = 'Viewing: ' + mapLabel + ' (private)';
      }
    }
    var off = $('set-offline-mode');
    if (off) off.checked = !!offlineMode;
    var sync = $('set-sync-status');
    if (sync) {
      if (offlineMode) sync.textContent = 'Offline mode — cloud sync paused';
      else if (!isOnline()) sync.textContent = 'No connection — saving locally';
      else if (dirty) sync.textContent = 'Local save pending cloud upload…';
      else sync.textContent = 'Cloud sync ready';
    }
    updateSettingsMapsList();
  }

  function updateSyncBadge(state) {
    var sync = $('set-sync-status');
    if (!sync) return;
    if (offlineMode) { sync.textContent = 'Offline mode — cloud sync paused'; return; }
    if (state === 'syncing') sync.textContent = 'Uploading to cloud…';
    else if (state === 'pending') sync.textContent = 'Waiting to upload (will retry when online)…';
    else if (state === 'ok') sync.textContent = 'Synced with cloud';
  }

  async function updateSettingsMapsList() {
    // Unified My Maps list is rendered by party-maps refreshMapsUi (set-all-maps-list).
    try {
      if (window.RegSlayerParty && typeof window.RegSlayerParty.refreshMapsUi === 'function') {
        await window.RegSlayerParty.refreshMapsUi();
        return;
      }
    } catch (e0) {}
    var box = $('set-all-maps-list') || $('set-shared-maps-list');
    if (!box || !sessionUser) return;
    box.innerHTML = '<p class="settings-hint">Loading maps…</p>';
    try {
      var maps = await listMySharedMaps();
      if (!maps.length) {
        box.innerHTML = '<p class="settings-hint">No shared maps yet. Create one below.</p>';
        return;
      }
      var html = '';
      maps.forEach(function (m) {
        var active = viewState.mode === 'shared' && viewState.sharedMapId === m.id;
        html += '<div class="settings-map-row' + (active ? ' is-active' : '') + '">';
        html += '<button type="button" class="settings-map-open" data-mid="' + m.id + '">' +
          esc(m.name) + '</button>';
        html += '</div>';
      });
      box.innerHTML = html;
      box.querySelectorAll('.settings-map-open').forEach(function (btn) {
        btn.addEventListener('click', function () {
          switchToShared(btn.getAttribute('data-mid')).catch(function (e) {
            alert(e.message || String(e));
          });
        });
      });
    } catch (e) {
      box.innerHTML = '<p class="settings-hint">Could not load maps (offline?).</p>';
    }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showAuthGate(show) {
    var gate = $('auth-gate');
    if (!gate) return;
    gate.classList.toggle('active', !!show);
    gate.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) {
      try {
        if (gate.parentNode !== document.body) document.body.appendChild(gate);
      } catch (e) {}
      gate.style.zIndex = '2147483646';
    }
  }

  function showAuthPanel(name) {
    ['auth-panel-signin', 'auth-panel-signup', 'auth-panel-recover', 'auth-panel-codes'].forEach(function (id) {
      var el = $(id);
      if (el) el.style.display = (id === 'auth-panel-' + name) ? '' : 'none';
    });
    var err = $('auth-error');
    if (err) err.textContent = '';
  }

  function setAuthError(msg) {
    var err = $('auth-error');
    if (err) err.textContent = msg || '';
  }

  function wireAuthUi() {
    var si = $('auth-btn-signin');
    if (si) si.onclick = function () {
      setAuthError('');
      signIn($('auth-si-user').value, $('auth-si-pass').value)
        .then(function () { return onAuthed(true); })
        .catch(function (e) { setAuthError(e.message || String(e)); });
    };
    var su = $('auth-btn-signup');
    if (su) su.onclick = function () {
      setAuthError('');
      var p1 = $('auth-su-pass').value;
      var p2 = $('auth-su-pass2').value;
      if (p1 !== p2) { setAuthError('Passwords do not match'); return; }
      signUp($('auth-su-user').value, p1, $('auth-su-email').value)
        .then(function (res) {
          showAuthPanel('codes');
          var box = $('auth-codes-list');
          if (box) box.textContent = (res.codes || []).join('\n');
        })
        .catch(function (e) { setAuthError(e.message || String(e)); });
    };
    var codesDone = $('auth-btn-codes-done');
    if (codesDone) codesDone.onclick = function () {
      pendingSignupCodes = null;
      onAuthed(true);
    };
    var copyCodes = $('auth-btn-copy-codes');
    if (copyCodes) copyCodes.onclick = function () {
      var box = $('auth-codes-list');
      if (box) fallbackCopy(box.textContent);
    };
    var rec = $('auth-btn-recover');
    if (rec) rec.onclick = function () {
      setAuthError('');
      recoverWithCode($('auth-rc-user').value, $('auth-rc-code').value, $('auth-rc-pass').value)
        .then(function () {
          setAuthError('');
          alert('Password updated. Sign in with your new password.');
          showAuthPanel('signin');
        })
        .catch(function (e) { setAuthError(e.message || String(e)); });
    };
    document.querySelectorAll('[data-auth-goto]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        showAuthPanel(a.getAttribute('data-auth-goto'));
      });
    });
  }

  window.addEventListener('regslayer-maps-tab', function () {
    try { updateAuthChrome(); } catch (e) {}
  });

  function wireSettingsMapsUi() {
    var createBtn = $('set-create-map-btn');
    if (createBtn) createBtn.onclick = function () {
      var name = ($('set-create-map-name') && $('set-create-map-name').value || '').trim();
      if (!name) { alert('Enter a name for the shared map'); return; }
      createSharedMap(name).then(function (m) {
        var invite = inviteShareText(m.code, m.name);
        alert('Shared map created!\n\nInvite copied to clipboard:\n\n' + invite);
        if ($('set-create-map-name')) $('set-create-map-name').value = '';
        updateAuthChrome();
      }).catch(function (e) { alert(e.message || String(e)); });
    };
    var joinBtn = $('set-join-map-btn');
    if (joinBtn) joinBtn.onclick = function () {
      var code = ($('set-join-map-code') && $('set-join-map-code').value || '').trim();
      joinSharedMap(code).then(function (m) {
        alert('Joined shared map: ' + m.name + ' (' + m.code + ')');
        if ($('set-join-map-code')) $('set-join-map-code').value = '';
        updateAuthChrome();
      }).catch(function (e) { alert(e.message || String(e)); });
    };
    var personalBtn = $('set-use-personal-btn');
    if (personalBtn) personalBtn.onclick = function () {
      switchToPersonal().catch(function (e) { alert(e.message || String(e)); });
    };
    var shareBtn = $('set-share-code-btn');
    if (shareBtn) shareBtn.onclick = function () { shareCodeToClipboard(); };
    var off = $('set-offline-mode');
    if (off) off.onchange = function () { setOfflineMode(off.checked); };
    var signOutBtn = $('set-signout-btn');
    if (signOutBtn) signOutBtn.onclick = function () {
      if (confirm('Sign out on this device? Map data stays on the device and in the cloud.')) {
        signOut().catch(function (e) { alert(e.message || String(e)); });
      }
    };
  }

  function startPullLoop() {
    if (pullTimer) clearInterval(pullTimer);
    // Personal + shared: light poll so deletes/edits arrive on other devices
    pullTimer = setInterval(function () {
      if (document.visibilityState === 'hidden') return;
      if (!isOnline() || isDirty()) return;
      // Shared maps use startSharedMapLiveSync (4s + realtime); keep slow poll as fallback
      runWhenIdle(function () { pullMapFromCloud(false); });
    }, 30000);
    try { startSharedMapLiveSync(); } catch (eLive) {}
  }

  function captureJoinFromUrl() {
    try {
      var u = new URL(window.location.href);
      var code = u.searchParams.get('join') || u.searchParams.get('map') || '';
      code = String(code).replace(/\D/g, '').slice(0, 6);
      if (code.length === 6) {
        try { sessionStorage.setItem('reg_slayer_pending_join', code); } catch (eS) {}
        u.searchParams.delete('join');
        u.searchParams.delete('map');
        var clean = u.pathname + (u.search || '') + (u.hash || '');
        if (window.history && history.replaceState) history.replaceState({}, '', clean || '/');
      }
    } catch (e) {}
  }

  async function consumePendingJoin() {
    var code = '';
    try { code = sessionStorage.getItem('reg_slayer_pending_join') || ''; } catch (e) {}
    if (!code || code.length !== 6) return;
    try { sessionStorage.removeItem('reg_slayer_pending_join'); } catch (e2) {}
    try {
      await joinSharedMap(code);
      alert('Joined shared map: ' + (viewState.sharedMapName || code));
    } catch (err) {
      alert('Could not join map ' + code + ': ' + (err.message || err));
    }
  }

  function inviteShareText(code, mapName) {
    var c = String(code || '').replace(/\D/g, '').slice(0, 6);
    var link = inviteJoinUrl(c);
    var nameLine = mapName ? ('Map: ' + mapName + '\n') : '';
    return 'Join my HuntSlayer map!\n' + nameLine + 'Code: ' + c + '\n' + link +
      '\n(Works on regslayer.com and huntslayer.com — same account)';
  }

  async function onAuthed(fromLogin) {
    showAuthGate(false);
    restoreDirtyFlag();
    loadViewState();
    await restoreViewPrefsFromCloud();
    // Apply last local cache for active map immediately (offline-first feel)
    var slot = cacheSlotKey();
    var cached = readLocalCache(slot);
    if (cached && cached.state) {
      applyMapState(cached.state);
      if (cached.state.meta && cached.state.meta.revision) {
        localRevision = cached.state.meta.revision;
      }
      refreshMapFromLocalState();
    }
    // Upload pending local deletes/edits BEFORE any cloud pull (prevents resurrect)
    if (isDirty()) {
      try { await pushMapToCloud(); } catch (eP) { console.warn(eP); }
    }
    await pullMapFromCloud(true);
    if (isDirty()) scheduleCloudPush(true);
    await consumePendingJoin();
    updateAuthChrome();
    startPullLoop();
    try {
      if (window.RegSlayerParty && typeof window.RegSlayerParty.recordVisitFromViewState === 'function') {
        window.RegSlayerParty.recordVisitFromViewState();
      }
    } catch (eVis) {}
    if (authReadyResolve) { authReadyResolve(); authReadyResolve = null; }
  }

  async function bootstrapAuth() {
    loadOfflineMode();
    loadViewState();
    restoreDirtyFlag();
    captureJoinFromUrl();
    wireAuthUi();
    wireSettingsMapsUi();
    updateAuthChrome();
    showAuthPanel('signin');
    try {
      await ensureClient();
      // Sister-site SSO: apply tokens from the other domain before reading session
      try { await consumeSisterSsoHandoff(); } catch (eSso) { console.warn(eSso); }
      var { data } = await sb.auth.getSession();
      if (data && data.session && data.session.user) {
        sessionUser = data.session.user;
        window.__rsUser = sessionUser;
        window.__rsSb = sb;
        try { await loadProfile(); } catch (e) {}
        await onAuthed(false);
      } else {
        showAuthGate(true);
      }
      sb.auth.onAuthStateChange(function (event, session) {
        if (session && session.user) {
          sessionUser = session.user;
          window.__rsUser = sessionUser;
          window.__rsSb = sb;
        } else if (event === 'SIGNED_OUT') {
          sessionUser = null;
          window.__rsUser = null;
          profile = null;
          showAuthGate(true);
        }
      });
    } catch (e) {
      console.error(e);
      showAuthGate(true);
      setAuthError('Could not reach sign-in service. Check connection.');
    }

    window.addEventListener('online', function () {
      if (!offlineMode && isDirty()) scheduleCloudPush(true);
      updateAuthChrome();
    });
    window.addEventListener('offline', function () { updateAuthChrome(); });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden' && isDirty() && isOnline()) {
        pushMapToCloud();
      } else if (document.visibilityState === 'visible' && !isDirty() && isOnline()) {
        runWhenIdle(function () { pullMapFromCloud(true); });
      }
    });
  }

  // Expose for settings / debugging
  window.RegSlayerCloud = {
    bootstrapAuth: bootstrapAuth,
    markDirty: markDirty,
    forcePush: function () {
      dirty = true;
      try { localStorage.setItem(DIRTY_KEY, '1'); } catch (e) {}
      try {
        var st = collectMapState();
        writeLocalCache(st);
      } catch (e2) {}
      scheduleCloudPush(true);
    },
    shareCodeToClipboard: shareCodeToClipboard,
    switchToPersonal: switchToPersonal,
    switchToPrivateMap: switchToPrivateMap,
    _switchToPrivate: switchToPrivateMap,
    createSharedMap: createSharedMap,
    joinSharedMap: joinSharedMap,
    listMySharedMaps: listMySharedMaps,
    startSharedMapLiveSync: startSharedMapLiveSync,
    stopSharedMapLiveSync: stopSharedMapLiveSync,
    authReady: authReady,
    getViewState: function () { return viewState; },
    getProfile: function () { return profile; },
    isOfflineMode: function () { return offlineMode; },
    setOfflineMode: setOfflineMode,
    getClient: function () { return sb; },
    switchToShared: switchToShared,
    inviteJoinUrl: inviteJoinUrl,
    inviteShareText: inviteShareText,
    currentAppOrigin: currentAppOrigin,
    appPublicOrigins: appPublicOrigins,
    buildSisterHandoffUrl: buildSisterHandoffUrl,
    goToSisterSite: goToSisterSite,
    consumeSisterSsoHandoff: consumeSisterSsoHandoff,
    get _sb() { return sb; }
  };
  // Expose for party extension
  Object.defineProperty(window, '__rsSbBridge', {
    get: function () { return sb; }
  });
})();
