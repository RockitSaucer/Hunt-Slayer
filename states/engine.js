/* One-state loader. Never keeps another state's GIS/rules in memory. */
(function () {
  var KEY = 'reg_slayer_active_state';
  var ringsCache = null;
  var ringsLoading = null;

  function catalog() {
    return window.RS_STATE_CATALOG || [];
  }
  function findMeta(code) {
    var c = String(code || '').toUpperCase();
    for (var i = 0; i < catalog().length; i++) {
      if (catalog()[i].code === c) return catalog()[i];
    }
    return null;
  }
  function savedCode() {
    try { return String(localStorage.getItem(KEY) || '').toUpperCase(); } catch (e) { return ''; }
  }
  function saveCode(code) {
    try { localStorage.setItem(KEY, String(code).toUpperCase()); } catch (e) {}
  }

  function loadRings() {
    if (ringsCache) return Promise.resolve(ringsCache);
    if (window.RS_US_RINGS && window.RS_US_RINGS.rings) {
      ringsCache = window.RS_US_RINGS;
      return Promise.resolve(ringsCache);
    }
    if (ringsLoading) return ringsLoading;
    ringsLoading = fetch('./states/us-rings.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        ringsCache = j || { rings: {}, bboxes: {} };
        ringsLoading = null;
        return ringsCache;
      })
      .catch(function () {
        ringsLoading = null;
        ringsCache = window.RS_US_RINGS || { rings: {}, bboxes: {} };
        return ringsCache;
      });
    return ringsLoading;
  }

  function bboxFromRing(ring) {
    var minla = 90, maxla = -90, minln = 180, maxln = -180;
    (ring || []).forEach(function (p) {
      if (!p || p.length < 2) return;
      if (p[0] < minla) minla = p[0];
      if (p[0] > maxla) maxla = p[0];
      if (p[1] < minln) minln = p[1];
      if (p[1] > maxln) maxln = p[1];
    });
    return { south: minla, north: maxla, west: minln, east: maxln };
  }

  function applyPack(meta, data) {
    var code = meta.code;
    var ring = (data && data.rings && data.rings[code]) || [];
    var bb = (data && data.bboxes && data.bboxes[code]) || null;
    var env = bb
      ? { west: bb[0], south: bb[1], east: bb[2], north: bb[3] }
      : bboxFromRing(ring);
    var pack = {
      code: code,
      name: meta.name,
      agency: meta.agency,
      agencyUrl: meta.agencyUrl,
      lawUrl: meta.lawUrl,
      tz: meta.tz,
      status: meta.status || 'building',
      ring: ring,
      env: env,
      bboxStr: env.west.toFixed(3) + ',' + env.south.toFixed(3) + ',' + env.east.toFixed(3) + ',' + env.north.toFixed(3),
      storagePrefix: code.toLowerCase() + '_hunt_'
    };
    window.RS_STATE = pack;
    try {
      window.ACTIVE_STATE_RING = ring.length ? ring : (code === 'AL' ? window.AL_STATE_RING || ring : ring);
      if (typeof ACTIVE_STATE_RING !== 'undefined') ACTIVE_STATE_RING = window.ACTIVE_STATE_RING;
    } catch (eR) {
      window.ACTIVE_STATE_RING = ring.length ? ring : [];
    }
    var btn = document.getElementById('brand-state-btn');
    if (btn) {
      btn.textContent = pack.name;
      btn.title = 'Hunting state: ' + pack.name + ' — tap to change';
    }
    var foot = document.getElementById('rs-footer-state');
    if (foot) {
      foot.textContent = pack.name + ' public & private land · USGS · ' + pack.agency;
    }
    var flink = document.getElementById('rs-footer-agency');
    if (flink) {
      flink.href = pack.agencyUrl;
      flink.textContent = pack.agency;
    }
    var howto = document.getElementById('howto-agency-note');
    if (howto) {
      howto.textContent = 'Always confirm official ' + pack.agency + ' rules before you hunt.';
    }
    if (typeof window.rsOnStateApplied === 'function') {
      try { window.rsOnStateApplied(pack); } catch (eA) { console.warn('rsOnStateApplied', eA); }
    }
    return pack;
  }

  function applyState(code, opts) {
    opts = opts || {};
    var meta = findMeta(code) || findMeta('AL');
    saveCode(meta.code);
    var loadPack = (typeof window.loadStatePack === 'function')
      ? window.loadStatePack(meta.code)
      : Promise.resolve(null);
    return loadPack.then(function () {
      return loadRings();
    }).then(function (data) {
      return applyPack(meta, data);
    }).then(function (pack) {
      if (opts.refit && typeof window.drawActiveStateMask === 'function') {
        try { window.drawActiveStateMask(); } catch (eM) {}
      }
      return pack;
    });
  }

  function openPicker(force) {
    var overlay = document.getElementById('state-pick-overlay');
    if (!overlay) return;
    var sel = document.getElementById('state-pick-select');
    if (sel && !sel._rsFilled) {
      sel._rsFilled = true;
      catalog().forEach(function (st) {
        var opt = document.createElement('option');
        opt.value = st.code;
        opt.textContent = st.name;
        sel.appendChild(opt);
      });
    }
    var cur = (window.RS_STATE && window.RS_STATE.code) || savedCode() || 'AL';
    if (sel) sel.value = cur;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.dataset.force = force ? '1' : '0';
  }

  function closePicker() {
    var overlay = document.getElementById('state-pick-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function ensurePicked() {
    var code = savedCode();
    if (code && findMeta(code)) {
      return applyState(code);
    }
    openPicker(true);
    return applyState('AL');
  }

  function wirePicker() {
    var overlay = document.getElementById('state-pick-overlay');
    var go = document.getElementById('state-pick-go');
    var cancel = document.getElementById('state-pick-cancel');
    var headerBtn = document.getElementById('brand-state-btn');
    if (headerBtn && !headerBtn._rsWired) {
      headerBtn._rsWired = true;
      headerBtn.addEventListener('click', function () { openPicker(false); });
    }
    function commitPick() {
      var sel = document.getElementById('state-pick-select');
      var code = sel ? sel.value : 'AL';
      return applyState(code, { refit: true }).then(function () {
        closePicker();
        try {
          if (localStorage.getItem('reg_slayer_howto_seen_v1') !== '1' && typeof window.openHowToGuide === 'function') {
            window.openHowToGuide();
          }
        } catch (eH) {}
      });
    }
    if (go && !go._rsWired) {
      go._rsWired = true;
      go.addEventListener('click', function () { commitPick(); });
    }
    var selEl = document.getElementById('state-pick-select');
    if (selEl && !selEl._rsChangeWired) {
      selEl._rsChangeWired = true;
      selEl.addEventListener('change', function () { commitPick(); });
    }
    if (cancel && !cancel._rsWired) {
      cancel._rsWired = true;
      cancel.addEventListener('click', function () {
        if (overlay && overlay.dataset.force === '1' && !savedCode()) return;
        closePicker();
      });
    }
    if (overlay && !overlay._rsWired) {
      overlay._rsWired = true;
      overlay.addEventListener('click', function (ev) {
        if (ev.target === overlay && overlay.dataset.force !== '1') closePicker();
      });
    }
  }

  window.RSState = {
    catalog: catalog,
    findMeta: findMeta,
    applyState: applyState,
    openPicker: openPicker,
    closePicker: closePicker,
    ensurePicked: ensurePicked,
    wirePicker: wirePicker,
    savedCode: savedCode
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wirePicker);
  } else {
    wirePicker();
  }

  // Start pack + rings as soon as this file runs (head) so overlays are not waiting on window.onload
  try {
    var bootCode = savedCode();
    if (bootCode && bootCode !== 'AL' && typeof window.loadStatePack === 'function') {
      window.loadStatePack(bootCode);
    }
    loadRings();
  } catch (ePref) {}
})();
