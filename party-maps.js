/* REG SLAYER — multi private maps, party presence, share-to-map (extends RegSlayerCloud) */
(function () {
  'use strict';
  if (!window.RegSlayerCloud) {
    console.warn('RegSlayerCloud missing — party maps extension skipped');
    return;
  }

  var C = window.RegSlayerCloud;
  var PRESENCE_KEY = 'reg_slayer_sharing_loc_v1';
  var ARROW_KEY = 'reg_slayer_my_arrow_color_v1';
  var DIR_ICON_KEY = 'reg_slayer_my_dir_icon_v1';
  var HIDDEN_MEMBERS_KEY = 'reg_slayer_hidden_party_content_v1';
  var MAP_ALIAS_KEY = 'reg_slayer_map_alias_v1';
  var PARTY_PREFS_LOCAL_KEY = 'reg_slayer_party_prefs_local_v1';
  /** Directional icons for party/GPS (from icons/dir — location icons pipeline). */
  var DIR_ICON_CATALOG = [
    { id: 'arrow_head', name: 'Arrow head', src: 'icons/dir/arrow_head.png', frontDeg: 0 },
    { id: 'boat', name: 'Boat', src: 'icons/dir/boat.png', frontDeg: 0 },
    // PNG is diagonal: nose lower-left (~225°). Rotate −225° so tip points up.
    { id: 'bomb', name: 'Bomb', src: 'icons/dir/bomb.png', frontDeg: 225 },
    { id: 'bullet', name: 'Bullet', src: 'icons/dir/bullet.png', frontDeg: 0 },
    { id: 'capture', name: 'Capture', src: 'icons/dir/capture.png', frontDeg: 0 },
    { id: 'car', name: 'Car', src: 'icons/dir/car.png', frontDeg: 0 },
    { id: 'helicopter', name: 'Helicopter', src: 'icons/dir/helicopter.png', frontDeg: 0 },
    { id: 'prop_plane', name: 'Prop plane', src: 'icons/dir/prop_plane.png', frontDeg: 180 },
    { id: 'rocket', name: 'Rocket', src: 'icons/dir/rocket.png', frontDeg: 0 },
    { id: 'shuttle', name: 'Shuttle', src: 'icons/dir/shuttle.png', frontDeg: 0 },
    { id: 'speed_boat', name: 'Speed Boat', src: 'icons/dir/speed_boat.png', frontDeg: 0 },
    { id: 'truck', name: 'Truck', src: 'icons/dir/truck.png', frontDeg: 0 },
    { id: 'x_wing', name: 'X-wing', src: 'icons/dir/x_wing.png', frontDeg: 0 }
  ];
  var DIR_ICON_BUST = 'dir2';
  var MOVE_M = 8; // meters = "moving"
  var MOVE_MS = 4000; // min interval when moving
  var HEARTBEAT_MS = 5000; // always push at least this often while sharing
  var HEADING_PUSH_DEG = 8; // re-push when facing turns this many degrees
  var HEADING_PUSH_MS = 1200; // min interval for heading-only updates
  var MAX_SHARE_MS = 60 * 60 * 1000;
  var PULL_MS = 3000; // peer visibility poll (mobile + desktop)

  var presenceTimer = null;
  var presenceWatch = null;
  var headingOrientHandler = null;
  var headingWatchOn = false;
  var sharing = false;
  var shareStartedAt = 0;
  var lastSent = { lat: null, lng: null, heading: null, at: 0 };
  var lastFacingHeading = null; // device compass / GPS course
  var lastHeadingPushAt = 0;
  var partyLayer = null;
  var partyMarkers = {};
  var myArrowColor = '#e11d1d';
  var myDirIconId = null; // custom directional icon for self (null = default triangle)
  // memberId -> { nickname, arrow_color, show_content, direction_icon_id,
  //   icon_scale (0.4–1.6), marker_hidden (bool) — scale/hidden are local-only }
  var partyPrefs = {};
  var hiddenContentOwners = {}; // userId -> true means HIDE their content
  /** Selected map row in Settings → My Maps (for members list; View Map sets active view). */
  var mapsUiSelected = { kind: null, id: null };
  var _dirPickerOnPick = null;
  var _dirPickerSelected = null;
  var _dirPickerColor = '#e11d1d';
  var _dirGlyphFilterSeq = 0;

  try {
    var ac = localStorage.getItem(ARROW_KEY);
    if (ac) myArrowColor = ac;
  } catch (e) {}
  try {
    var di = localStorage.getItem(DIR_ICON_KEY);
    if (di) myDirIconId = di;
  } catch (eDi) {}

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function getSb() {
    // Prefer live client from auth-sync (same session). Fallbacks for load order races.
    try {
      if (C && typeof C.getClient === 'function' && C.getClient()) return C.getClient();
    } catch (e0) {}
    try {
      if (C && C._sb) return C._sb;
    } catch (e1) {}
    return window.__rsSb || null;
  }
  function getUser() {
    if (window.__rsUser) return window.__rsUser;
    return null;
  }
  /** Leaflet map — index.html uses `let map` and also sets window.map after init. */
  function getMap() {
    if (window.map) return window.map;
    try {
      if (typeof map !== 'undefined' && map) return map;
    } catch (e) {}
    return null;
  }

  // Expose helpers the original module doesn't
  // Patch: we reach into original by re-wrapping public API after boot
  function ensurePartyLayer() {
    var m = getMap();
    if (!m || typeof L === 'undefined') return null;
    if (!partyLayer) {
      partyLayer = L.layerGroup().addTo(m);
    } else if (!m.hasLayer(partyLayer)) {
      try { partyLayer.addTo(m); } catch (eA) {}
    }
    try { partyLayer.bringToFront(); } catch (eF) {}
    return partyLayer;
  }

  function haversineM(aLat, aLng, bLat, bLng) {
    var R = 6371000;
    var toR = Math.PI / 180;
    var dLat = (bLat - aLat) * toR;
    var dLng = (bLng - aLng) * toR;
    var x = Math.sin(dLat / 2);
    var y = Math.sin(dLng / 2);
    var h = x * x + Math.cos(aLat * toR) * Math.cos(bLat * toR) * y * y;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function normalizeHeading(d) {
    d = Number(d);
    if (isNaN(d)) return null;
    d = d % 360;
    if (d < 0) d += 360;
    return d;
  }

  function headingDelta(a, b) {
    a = normalizeHeading(a);
    b = normalizeHeading(b);
    if (a == null || b == null) return 180;
    var d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  /** Prefer device compass; fall back to GPS course-over-ground. */
  function resolveFacingHeading(gpsHeading) {
    var h = null;
    try {
      if (typeof window.deviceHeadingDeg === 'number' && !isNaN(window.deviceHeadingDeg)) {
        h = window.deviceHeadingDeg;
      }
    } catch (e0) {}
    if (h == null && lastFacingHeading != null) h = lastFacingHeading;
    if (h == null && gpsHeading != null && !isNaN(gpsHeading)) h = gpsHeading;
    h = normalizeHeading(h);
    if (h != null) lastFacingHeading = h;
    return h;
  }

  function getDirIconById(id) {
    if (!id) return null;
    for (var i = 0; i < DIR_ICON_CATALOG.length; i++) {
      if (DIR_ICON_CATALOG[i].id === id) return DIR_ICON_CATALOG[i];
    }
    return null;
  }
  function dirIconSrc(id) {
    var ic = getDirIconById(id);
    if (!ic) return '';
    return ic.src + (DIR_ICON_BUST ? ('?v=' + DIR_ICON_BUST) : '');
  }
  function prefKey(uid) {
    return String(uid == null ? '' : uid);
  }

  function getPartyPref(uid) {
    var k = prefKey(uid);
    return partyPrefs[k] || partyPrefs[uid] || {};
  }

  /**
   * Which direction icon to draw for a member on THIS device:
   * 1) If I set a custom icon for them (party prefs) → use that (only I see it)
   * 2) Else use their profile default (e.g. Scott’s rocket shows as rocket for everyone)
   * 3) Else default red triangle
   */
  function memberDirIconId(m) {
    if (!m) return null;
    var uid = m.user_id != null ? m.user_id : m.id;
    var pref = getPartyPref(uid);
    if (Object.prototype.hasOwnProperty.call(pref, 'direction_icon_id')) {
      var override = pref.direction_icon_id;
      // Non-empty override wins for me only. Empty/null = fall back to their profile default.
      if (override) return override;
    }
    return m.direction_icon_id || null;
  }

  function memberIconScale(m) {
    if (!m) return 1;
    var pref = getPartyPref(m.user_id != null ? m.user_id : m.id);
    var s = pref && pref.icon_scale != null ? Number(pref.icon_scale) : 1;
    if (isNaN(s) || s <= 0) s = 1;
    return Math.max(0.4, Math.min(1.6, s));
  }

  function memberMarkerHidden(m) {
    if (!m) return false;
    var pref = getPartyPref(m.user_id != null ? m.user_id : m.id);
    return !!(pref && pref.marker_hidden);
  }

  function memberIconSizePx(m) {
    // Base custom icon ~30px; scale 100% = 30
    return Math.round(30 * memberIconScale(m));
  }

  function memberIconSignature(m) {
    return String(memberDirIconId(m) || '') + '|' + String(memberColor(m) || '') +
      '|' + String(memberIconScale(m)) + '|' + (memberMarkerHidden(m) ? '1' : '0');
  }

  function myDefaultDirIconLabel() {
    if (!myDirIconId) return 'Custom default arrow';
    var ic = getDirIconById(myDirIconId);
    return ic ? ('Arrow: ' + ic.name) : 'Custom default arrow';
  }
  function syncMyDirIconSettingsBtn() {
    var btn = $('set-my-dir-icon-btn');
    if (btn) btn.textContent = myDefaultDirIconLabel();
  }
  function openMyDefaultDirIcon() {
    openDirIconPicker({
      title: 'Your default direction icon',
      currentId: myDirIconId || null,
      currentColor: myArrowColor || '#e11d1d',
      mode: 'self',
      onPick: function (id, color) {
        myDirIconId = id || null;
        if (color) myArrowColor = color;
        try {
          if (myDirIconId) localStorage.setItem(DIR_ICON_KEY, myDirIconId);
          else localStorage.removeItem(DIR_ICON_KEY);
          if (myArrowColor) localStorage.setItem(ARROW_KEY, myArrowColor);
        } catch (eL) {}
        try {
          document.documentElement.style.setProperty('--gps-arrow-color', myArrowColor);
        } catch (eCss) {}
        try {
          var sb = getSb() || window.__rsSb;
          var user = getUser() || window.__rsUser;
          if (sb && user) {
            sb.from('profiles').update({
              direction_icon_id: myDirIconId,
              arrow_color: myArrowColor
            }).eq('id', user.id).then(function () {});
          }
        } catch (eP) {}
        syncMyDirIconSettingsBtn();
        try {
          if (typeof setGpsMarker === 'function' && typeof userLat !== 'undefined' && userLat != null) {
            setGpsMarker(userLat, userLng);
          }
        } catch (eG) {}
        try {
          if (window.showAppCopyToast) {
            showAppCopyToast('<span class="act">Default arrow updated</span><br>' +
              (myDirIconId ? esc((getDirIconById(myDirIconId) || {}).name || myDirIconId) : 'Default triangle'));
          }
        } catch (eT) {}
      }
    });
  }
  window.openMyDefaultDirIcon = openMyDefaultDirIcon;
  window.syncMyDirIconSettingsBtn = syncMyDirIconSettingsBtn;

  function normalizeDirHex(hex) {
    if (typeof normalizeHexColor === 'function') {
      return normalizeHexColor(hex) || '#e11d1d';
    }
    var h = String(hex || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(h)) return h.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(h)) {
      return ('#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]).toLowerCase();
    }
    return '#e11d1d';
  }

  /**
   * Recolor black silhouette PNGs to a solid hex + thin black outline
   * (matches default GPS arrow stroke).
   */
  function dirIconColoredMarkup(iconId, hex, size) {
    var img = dirIconSrc(iconId);
    var s = size || 30;
    if (!img) return '';
    hex = normalizeDirHex(hex);
    _dirGlyphFilterSeq += 1;
    var fid = 'dgf' + _dirGlyphFilterSeq + '_' + String(iconId || 'x').replace(/[^a-z0-9_-]/gi, '');
    // Outline thickness scales slightly with size (~1.2–1.6px look)
    var outlineR = s >= 36 ? 1.35 : (s >= 28 ? 1.2 : 1.05);
    var src = String(img)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return (
      '<svg class="rs-dir-icon-svg" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" ' +
        'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
        'aria-hidden="true" focusable="false" style="display:block;overflow:visible;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.45));">' +
        '<defs>' +
          '<filter id="' + fid + '" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB">' +
            // Expand silhouette → black stroke ring (like default arrow outline)
            '<feMorphology in="SourceAlpha" operator="dilate" radius="' + outlineR + '" result="dilated"/>' +
            '<feFlood flood-color="#000000" flood-opacity="1" result="black"/>' +
            '<feComposite in="black" in2="dilated" operator="in" result="outline"/>' +
            // Colored fill from original alpha
            '<feFlood flood-color="' + hex + '" flood-opacity="1" result="flood"/>' +
            '<feComposite in="flood" in2="SourceAlpha" operator="in" result="fill"/>' +
            '<feMerge>' +
              '<feMergeNode in="outline"/>' +
              '<feMergeNode in="fill"/>' +
            '</feMerge>' +
          '</filter>' +
        '</defs>' +
        '<image width="' + s + '" height="' + s + '" href="' + src + '" xlink:href="' + src + '" ' +
          'filter="url(#' + fid + ')" preserveAspectRatio="xMidYMid meet"/>' +
      '</svg>'
    );
  }

  /**
   * Directional marker body: default triangle or custom icon (slightly larger than default arrow).
   * frontDeg = where the PNG nose points (0=up). CSS rot = heading − frontDeg.
   * color tints the silhouette (triangle fill or PNG recolor).
   */
  function buildDirBodyHtml(color, heading, iconId, sizePx) {
    var rot = heading != null && !isNaN(heading) ? (((Number(heading) % 360) + 360) % 360) : 0;
    var c = normalizeDirHex(color || '#2563eb');
    var ic = getDirIconById(iconId);
    if (ic) {
      var front = (ic.frontDeg != null && !isNaN(ic.frontDeg)) ? Number(ic.frontDeg) : 0;
      var cssRot = ((rot - front) % 360 + 360) % 360;
      // Custom icons: slightly larger than default ~17–24px arrow
      var s = sizePx || 30;
      var glyph = dirIconColoredMarkup(ic.id, c, s);
      return (
        '<div class="party-arrow-rot rs-dir-icon-rot" data-front="' + front + '" style="width:' + s +
          'px;height:' + s + 'px;transform:rotate(' + cssRot.toFixed(1) +
          'deg);transform-origin:center center;will-change:transform;line-height:0;">' +
          glyph +
        '</div>'
      );
    }
    var w = sizePx ? Math.round(sizePx * 0.8) : 24;
    var h = sizePx ? Math.round(sizePx * 1.13) : 34;
    return (
      '<div class="party-arrow-rot" data-front="0" style="width:' + w + 'px;height:' + h +
        'px;transform:rotate(' + rot.toFixed(1) + 'deg);transform-origin:center 70%;will-change:transform;">' +
        '<svg viewBox="0 0 24 32" width="' + w + '" height="' + h + '">' +
          '<path d="M12 1.5 L22.5 29.5 L12 23.2 L1.5 29.5 Z" fill="' + c +
            '" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/>' +
        '</svg>' +
      '</div>'
    );
  }

  /**
   * Party member marker. sizePx scales the directional icon; hidden draws a small
   * colored ring-dot (same idea as a hidden map pin) that still tracks location.
   */
  function buildPartyArrowIcon(color, label, heading, iconId, sizePx, hidden) {
    var name = esc((label || '').slice(0, 16));
    var c = normalizeDirHex(color || '#2563eb');
    var html;
    if (hidden) {
      // Match hidden-pin style: white core + colored ring
      html =
        '<div class="party-arrow-wrap party-member-hidden-dot" style="display:flex;flex-direction:column;align-items:center;pointer-events:auto;">' +
          '<div style="font-size:9px;font-weight:800;color:#fff;text-shadow:0 0 3px #000,0 1px 2px #000;background:rgba(0,0,0,.5);padding:0 4px;border-radius:3px;margin-bottom:2px;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + name + '</div>' +
          '<div style="width:14px;height:14px;border-radius:50%;background:#ffffff;border:3px solid ' + c +
            ';box-shadow:0 1px 4px rgba(0,0,0,0.45);"></div>' +
        '</div>';
      return L.divIcon({
        className: 'party-presence-icon party-presence-hidden',
        html: html,
        iconSize: [80, 36],
        iconAnchor: [40, 30]
      });
    }
    var s = sizePx != null && !isNaN(sizePx) ? Math.round(sizePx) : 30;
    s = Math.max(14, Math.min(56, s));
    var body = buildDirBodyHtml(c, heading, iconId, s);
    html =
      '<div class="party-arrow-wrap" style="display:flex;flex-direction:column;align-items:center;pointer-events:auto;">' +
        '<div style="font-size:10px;font-weight:800;color:#fff;text-shadow:0 0 3px #000,0 1px 2px #000;background:rgba(0,0,0,.55);padding:1px 5px;border-radius:4px;margin-bottom:2px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + name + '</div>' +
        body +
      '</div>';
    // Scale icon hit box with glyph size so larger icons stay clickable/centered
    var boxW = Math.max(100, s + 70);
    var boxH = Math.max(60, s + 36);
    return L.divIcon({
      className: 'party-presence-icon',
      html: html,
      iconSize: [boxW, boxH],
      iconAnchor: [boxW / 2, boxH - 12]
    });
  }

  function partyIconForMember(mem, heading) {
    return buildPartyArrowIcon(
      memberColor(mem),
      memberLabel(mem),
      heading,
      memberDirIconId(mem),
      memberIconSizePx(mem),
      memberMarkerHidden(mem)
    );
  }

  /**
   * Picker-only: rotate so the icon's "front" (frontDeg) faces up.
   * Map uses rotate(heading − frontDeg); upright preview = rotate(−frontDeg).
   */
  function dirIconUprightPreview(iconId, hex, size) {
    var ic = getDirIconById(iconId);
    if (!ic) return '';
    var front = (ic.frontDeg != null && !isNaN(ic.frontDeg)) ? Number(ic.frontDeg) : 0;
    var upright = ((-front) % 360 + 360) % 360;
    return (
      '<span class="dir-upright-wrap" style="display:inline-flex;align-items:center;justify-content:center;' +
        'transform:rotate(' + upright.toFixed(1) + 'deg);transform-origin:center center;line-height:0;" ' +
        'title="Front points up (frontDeg ' + front + ')">' +
        dirIconColoredMarkup(iconId, hex, size) +
      '</span>'
    );
  }

  function updateDirIconLivePreview() {
    var box = $('dir-icon-live-preview');
    if (!box) return;
    var c = normalizeDirHex(_dirPickerColor || '#e11d1d');
    if (_dirPickerSelected) {
      // Always nose-up so orientation is easy to verify
      box.innerHTML = dirIconUprightPreview(_dirPickerSelected, c, 36);
    } else {
      // Match map default GPS arrow (same paths as buildGpsMarkerIcon) — tip already up
      box.innerHTML =
        '<svg class="dir-default-map-arrow" viewBox="0 0 24 32" width="28" height="36" aria-hidden="true" style="display:block;">' +
          '<path d="M12 1.5 L22.5 29.5 L12 23.2 L1.5 29.5 Z" fill="' + c +
            '" stroke="#000" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>' +
          '<path d="M12 6.5 L17.2 24.5 L12 20.5 L6.8 24.5 Z" fill="' + c + '" opacity="0.35"/>' +
        '</svg>';
    }
  }

  function renderDirIconPickerGrid(selectedId) {
    var grid = $('dir-icon-grid');
    if (!grid) return;
    var q = (($('dir-icon-search') && $('dir-icon-search').value) || '').trim().toLowerCase();
    var list = DIR_ICON_CATALOG.filter(function (ic) {
      if (!q) return true;
      return ic.name.toLowerCase().indexOf(q) >= 0 || ic.id.indexOf(q) >= 0;
    });
    // Friend mode: first tile = "use their profile default"; self mode = red triangle
    var defTitle = _dirPickerMode === 'friend' ? 'Use their default' : 'Default triangle';
    var c = normalizeDirHex(_dirPickerColor || '#e11d1d');
    var html = '';
    var defSel = !selectedId;
    // Same chevron path as map GPS marker (buildGpsMarkerIcon)
    var defaultArrowSvg =
      '<svg class="dir-default-map-arrow" viewBox="0 0 24 32" width="28" height="36" aria-hidden="true" style="display:block;">' +
        '<path d="M12 1.5 L22.5 29.5 L12 23.2 L1.5 29.5 Z" fill="' + c +
          '" stroke="#000" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M12 6.5 L17.2 24.5 L12 20.5 L6.8 24.5 Z" fill="' + c + '" opacity="0.35"/>' +
      '</svg>';
    html += '<button type="button" class="dir-icon-cell' + (defSel ? ' selected' : '') +
      '" data-id="" title="' + esc(defTitle) + '" aria-label="' + esc(defTitle) + '">' +
      '<span class="dir-cell-glyph">' + defaultArrowSvg + '</span></button>';
    list.forEach(function (ic) {
      var sel = selectedId === ic.id;
      // All custom icons drawn nose-up so frontDeg can be checked at a glance
      html += '<button type="button" class="dir-icon-cell' + (sel ? ' selected' : '') +
        '" data-id="' + esc(ic.id) + '" data-name="' + esc(ic.name) +
        '" title="' + esc(ic.name) + ' (front up)" aria-label="' + esc(ic.name) + '">' +
        '<span class="dir-cell-glyph">' + dirIconUprightPreview(ic.id, c, 40) + '</span></button>';
    });
    grid.innerHTML = html;
    grid.querySelectorAll('.dir-icon-cell').forEach(function (btn) {
      btn.onclick = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var id = btn.getAttribute('data-id') || '';
        _dirPickerSelected = id || null;
        grid.querySelectorAll('.dir-icon-cell').forEach(function (b) {
          b.classList.toggle('selected', (b.getAttribute('data-id') || '') === id);
        });
        updateDirIconLivePreview();
      };
    });
    updateDirIconLivePreview();
  }

  var _dirPickerMode = 'self'; // 'self' | 'friend'
  window.onDirIconPickerColorChange = function (hex) {
    _dirPickerColor = normalizeDirHex(hex);
    // Live-tint thumbs + preview without full grid rebuild if possible
    try { renderDirIconPickerGrid(_dirPickerSelected); } catch (e) {
      try { updateDirIconLivePreview(); } catch (e2) {}
    }
  };
  function wireDirIconColorPicker() {
    var root = $('cp-dir-icon');
    if (!root) return;
    // Ensure picker is built (shared color-picker system in index.html)
    try {
      if (typeof initAllColorPickers === 'function') initAllColorPickers();
    } catch (eI) {}
    try {
      if (typeof setColorPickerValue === 'function') {
        setColorPickerValue(root, normalizeDirHex(_dirPickerColor), { silent: true });
      }
    } catch (eS) {}
    var hv = $('dir-icon-color-value');
    if (hv) hv.value = normalizeDirHex(_dirPickerColor);
  }
  function openDirIconPicker(opts) {
    opts = opts || {};
    _dirPickerOnPick = typeof opts.onPick === 'function' ? opts.onPick : null;
    _dirPickerSelected = opts.currentId || null;
    _dirPickerColor = normalizeDirHex(opts.currentColor || myArrowColor || '#e11d1d');
    _dirPickerMode = opts.mode === 'friend' ? 'friend' : 'self';
    var modal = $('dir-icon-picker-modal');
    if (!modal) return;
    var title = $('dir-icon-picker-title');
    if (title) title.textContent = opts.title || 'Choose direction icon';
    var search = $('dir-icon-search');
    if (search) search.value = '';
    var hv = $('dir-icon-color-value');
    if (hv) hv.value = _dirPickerColor;
    wireDirIconColorPicker();
    renderDirIconPickerGrid(_dirPickerSelected);
    modal.classList.add('active');
    modal.removeAttribute('hidden');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeDirIconPicker() {
    var modal = $('dir-icon-picker-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      modal.setAttribute('hidden', '');
      modal.setAttribute('aria-hidden', 'true');
    }
    _dirPickerOnPick = null;
  }
  function confirmDirIconPicker() {
    var id = _dirPickerSelected || null;
    var color = normalizeDirHex(_dirPickerColor || '#e11d1d');
    var cb = _dirPickerOnPick;
    closeDirIconPicker();
    if (cb) {
      try { cb(id, color); } catch (e) { console.warn(e); }
    }
  }
  window.openDirIconPicker = openDirIconPicker;
  window.closeDirIconPicker = closeDirIconPicker;
  window.confirmDirIconPicker = confirmDirIconPicker;
  window.renderDirIconPickerGrid = function () {
    renderDirIconPickerGrid(_dirPickerSelected);
  };

  /** Smooth in-place rotation without full icon rebuild when possible. */
  function updatePartyMarkerHeading(uid, heading) {
    var mk = partyMarkers[uid];
    if (!mk) return;
    heading = normalizeHeading(heading);
    if (heading == null) return;
    try {
      var el = mk.getElement && mk.getElement();
      if (el) {
        var rot = el.querySelector('.party-arrow-rot');
        if (rot) {
          var front = parseFloat(rot.getAttribute('data-front') || '0');
          if (isNaN(front)) front = 0;
          var cssRot = ((heading - front) % 360 + 360) % 360;
          rot.style.transform = 'rotate(' + cssRot.toFixed(1) + 'deg)';
          mk._rsHeading = heading;
          return;
        }
      }
    } catch (e) {}
    // Hidden dots have no rotator — skip rebuild on heading-only ticks
    try {
      if (mk._rsHidden) {
        mk._rsHeading = heading;
        return;
      }
    } catch (eH) {}
    // Fallback: rebuild icon
    try {
      var mem = (window.__rsPartyMembers || []).find(function (x) { return String(x.user_id) === String(uid); }) ||
        { user_id: uid, username: 'Hunter' };
      var icon = partyIconForMember(mem, heading);
      mk.setIcon(icon);
      mk._rsHeading = heading;
      mk._rsHidden = memberMarkerHidden(mem);
    } catch (e2) {}
  }

  function formatAgo(iso) {
    if (!iso) return 'unknown';
    var t = new Date(iso).getTime();
    if (isNaN(t)) return 'unknown';
    var s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    return Math.floor(s / 3600) + 'h ago';
  }

  function escJs(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ');
  }

  /**
   * Party member popup: last update, Hide/Unhide, Edit friend, Save pin — no facing degrees.
   */
  function buildPartyMemberPopupHtml(row, mem) {
    var uid = String(row.user_id);
    var label = memberLabel(mem);
    var lat = Number(row.lat);
    var lng = Number(row.lng);
    var isHidden = memberMarkerHidden(mem);
    return (
      '<div class="map-dot-menu party-member-popup" onclick="event.stopPropagation();">' +
        '<div class="mdm-title">' + esc(label) + (isHidden ? ' <span style="opacity:.75;font-weight:600;">(hidden)</span>' : '') + '</div>' +
        '<div class="mdm-sub" style="margin:4px 0 10px;">Last update: <strong>' +
          esc(formatAgo(row.updated_at)) + '</strong></div>' +
        '<button type="button" class="mdm-btn hide-friend' + (isHidden ? ' is-hidden' : '') + '" ' +
          'onclick="event.preventDefault();event.stopPropagation();' +
          'window.rsTogglePartyFriendHidden&&window.rsTogglePartyFriendHidden(\'' + escJs(uid) + '\');return false;">' +
          (isHidden ? 'Unhide' : 'Hide') + '</button>' +
        '<button type="button" class="mdm-btn pin" ' +
          'onclick="event.preventDefault();event.stopPropagation();' +
          'window.rsEditPartyFriend&&window.rsEditPartyFriend(\'' + escJs(uid) + '\');return false;">' +
          'Edit friend</button>' +
        '<button type="button" class="mdm-btn save-pin" ' +
          'onclick="event.preventDefault();event.stopPropagation();' +
          'window.rsSavePartyPin&&window.rsSavePartyPin(\'' + escJs(uid) + '\',' +
          lat + ',' + lng + ',\'' + escJs(label) + '\');return false;">' +
          'Save pin</button>' +
      '</div>'
    );
  }

  function findPartyMember(uid) {
    var members = window.__rsPartyMembers || [];
    uid = String(uid);
    for (var i = 0; i < members.length; i++) {
      if (String(members[i].user_id) === uid) return members[i];
    }
    return { user_id: uid, username: 'Hunter', display_name: 'Hunter' };
  }

  window.rsTogglePartyFriendHidden = function (uid) {
    uid = String(uid || '');
    if (!uid) return Promise.resolve();
    var pref = getPartyPref(uid);
    var next = !pref.marker_hidden;
    return savePartyPref(uid, { marker_hidden: next }).then(function () {
      rebuildPartyMemberIcon(uid);
      try {
        var mk = partyMarkers[uid] || partyMarkers[prefKey(uid)];
        if (mk && mk.getPopup) {
          var mem = findPartyMember(uid);
          var ll = mk.getLatLng && mk.getLatLng();
          var row = {
            user_id: uid,
            lat: ll ? ll.lat : null,
            lng: ll ? ll.lng : null,
            updated_at: mk._rsUpdatedAt || new Date().toISOString()
          };
          mk.setPopupContent(buildPartyMemberPopupHtml(row, mem));
          // Keep popup open after hide/unhide so user can confirm state
          try { if (!mk.isPopupOpen || !mk.isPopupOpen()) mk.openPopup(); } catch (eO) {}
        }
      } catch (eP) {}
      try {
        if (window.showAppCopyToast) {
          showAppCopyToast(next
            ? '<span class="act">Hidden</span><br>Shows as a color dot on your map'
            : '<span class="act">Unhidden</span><br>Full direction icon restored');
        }
      } catch (eT) {}
    }).catch(function (err) {
      console.warn('rsTogglePartyFriendHidden', err);
    });
  };

  window.rsEditPartyFriend = function (uid) {
    uid = String(uid || '');
    if (!uid) return;
    var mem = findPartyMember(uid);
    var pref = partyPrefs[uid] || partyPrefs[mem.user_id] || getPartyPref(uid) || {};
    var nick = pref.nickname || '';
    var col = pref.arrow_color || mem.arrow_color || memberColor(mem) || '#2563eb';
    // Local override only — empty means “show their profile default”
    var dirId = (Object.prototype.hasOwnProperty.call(pref, 'direction_icon_id') && pref.direction_icon_id)
      ? pref.direction_icon_id
      : null;
    var dirName = dirId
      ? ((getDirIconById(dirId) || {}).name || dirId)
      : 'Use their default';
    var scalePct = Math.round(memberIconScale(mem) * 100);
    var isHidden = !!pref.marker_hidden;
    var body =
      '<p class="settings-hint" style="margin:0 0 8px;">Nickname, color, size, hide, and direction icon are only for you. Their default icon still shows for everyone else.</p>' +
      '<label style="display:block;font-size:11px;font-weight:700;margin:6px 0 4px;">Nickname</label>' +
      '<input type="text" id="rs-friend-nick" maxlength="32" value="' + esc(nick) + '" ' +
        'style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #444;background:#1a1a1a;color:#fff;">' +
      '<label style="display:block;font-size:11px;font-weight:700;margin:10px 0 4px;">Arrow color</label>' +
      '<input type="color" id="rs-friend-color" value="' + esc(col) + '" ' +
        'style="width:100%;height:40px;padding:0;border:none;background:transparent;cursor:pointer;">' +
      '<label style="display:block;font-size:11px;font-weight:700;margin:10px 0 4px;">Direction icon (your screen only)</label>' +
      '<button type="button" class="settings-subbtn" id="rs-friend-dir-btn" style="width:100%;margin:0;">' +
        esc(dirName) + '</button>' +
      '<input type="hidden" id="rs-friend-dir" value="' + esc(dirId || '') + '">' +
      '<label style="display:block;font-size:11px;font-weight:700;margin:12px 0 4px;">Icon size <span id="rs-friend-size-val">' +
        scalePct + '</span>%</label>' +
      '<input type="range" id="rs-friend-size" min="40" max="160" step="5" value="' + scalePct + '" ' +
        'style="width:100%;margin:0 0 10px;" ' +
        'oninput="var v=document.getElementById(\'rs-friend-size-val\');if(v)v.textContent=this.value;">' +
      '<button type="button" class="settings-subbtn" id="rs-friend-hide-btn" style="width:100%;margin:4px 0 0;' +
        (isHidden ? 'background:#1a4a5c;border-color:#2a6a7c;' : '') + '">' +
        (isHidden ? 'Unhide icon' : 'Hide') + '</button>' +
      '<p class="settings-hint" style="margin:6px 0 0;font-size:10px;">Hide turns their marker into a small color dot that still moves with them. Click the dot to open this menu again.</p>';
    showSimpleModal('Edit friend — ' + (mem.display_name || mem.username || 'Hunter'), body, [
      {
        label: 'Save',
        primary: true,
        onClick: function () {
          var nEl = document.getElementById('rs-friend-nick');
          var cEl = document.getElementById('rs-friend-color');
          var dEl = document.getElementById('rs-friend-dir');
          var sEl = document.getElementById('rs-friend-size');
          var n = nEl ? String(nEl.value || '').trim() : '';
          var c = cEl ? (cEl.value || col) : col;
          var d = dEl && dEl.value ? dEl.value : null;
          var pct = sEl ? (parseInt(sEl.value, 10) || 100) : 100;
          pct = Math.max(40, Math.min(160, pct));
          var scale = pct / 100;
          return savePartyPref(uid, {
            nickname: n || null,
            arrow_color: c,
            direction_icon_id: d,
            icon_scale: scale
          }).then(function () {
            rebuildPartyMemberIcon(uid);
            // Delay presence refresh so local prefs aren't racing a cloud reload
            setTimeout(function () {
              try { pullPresence(); } catch (eP) {}
            }, 50);
            try {
              var tip = d
                ? ((getDirIconById(d) || {}).name || d)
                : 'their default';
              if (window.showAppCopyToast) {
                showAppCopyToast('<span class="act">Friend updated</span><br>' +
                  esc(n || mem.username || 'Hunter') + ' · ' + esc(tip) + ' · ' + pct + '%');
              }
            } catch (eT) {}
          });
        }
      },
      { label: 'Cancel' }
    ]);
    setTimeout(function () {
      var dirBtn = document.getElementById('rs-friend-dir-btn');
      if (dirBtn) {
        dirBtn.onclick = function (ev) {
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          var cur = (document.getElementById('rs-friend-dir') || {}).value || null;
          var colEl0 = document.getElementById('rs-friend-color');
          openDirIconPicker({
            title: 'Direction icon — ' + (mem.display_name || 'Friend'),
            currentId: cur || null,
            currentColor: (colEl0 && colEl0.value) || col,
            mode: 'friend',
            onPick: function (id, color) {
              var hid = document.getElementById('rs-friend-dir');
              var lab = document.getElementById('rs-friend-dir-btn');
              var cEl = document.getElementById('rs-friend-color');
              if (hid) hid.value = id || '';
              if (lab) {
                lab.textContent = id
                  ? ((getDirIconById(id) || {}).name || id)
                  : 'Use their default';
              }
              if (cEl && color) cEl.value = color;
            }
          });
        };
      }
      var hideBtn = document.getElementById('rs-friend-hide-btn');
      if (hideBtn) {
        hideBtn.onclick = function (ev) {
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          var next = !getPartyPref(uid).marker_hidden;
          // Persist nickname/color/size currently in the form so Hide doesn't drop unsaved edits
          var nEl = document.getElementById('rs-friend-nick');
          var cEl = document.getElementById('rs-friend-color');
          var dEl = document.getElementById('rs-friend-dir');
          var sEl = document.getElementById('rs-friend-size');
          var n = nEl ? String(nEl.value || '').trim() : '';
          var c = cEl ? (cEl.value || col) : col;
          var d = dEl && dEl.value ? dEl.value : null;
          var pct = sEl ? (parseInt(sEl.value, 10) || 100) : 100;
          pct = Math.max(40, Math.min(160, pct));
          savePartyPref(uid, {
            nickname: n || null,
            arrow_color: c,
            direction_icon_id: d,
            icon_scale: pct / 100,
            marker_hidden: next
          }).then(function () {
            rebuildPartyMemberIcon(uid);
            try {
              var modal = document.getElementById('rs-simple-modal');
              if (modal && modal.parentNode) modal.remove();
            } catch (eClose) {}
            try {
              if (window.showAppCopyToast) {
                showAppCopyToast(next
                  ? '<span class="act">Hidden</span><br>Shows as a color dot on your map'
                  : '<span class="act">Unhidden</span><br>Full direction icon restored');
              }
            } catch (eT) {}
          }).catch(function (err) {
            console.warn('edit friend hide', err);
          });
        };
      }
    }, 30);
    // Close leaflet popup so it does not sit under the modal
    try {
      var m = getMap();
      if (m) m.closePopup();
    } catch (eC) {}
  };

  window.rsSavePartyPin = function (uid, lat, lng, label) {
    lat = Number(lat);
    lng = Number(lng);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Location not available.');
      return;
    }
    var mem = findPartyMember(uid);
    var name = (label || memberLabel(mem) || 'Party member') + ' location';
    var color = memberColor(mem) || '#2563eb';
    var pin = {
      id: 'pin_party_' + Date.now() + '_' + Math.floor(Math.random() * 999),
      name: name,
      lat: lat,
      lng: lng,
      isPin: true,
      color: color,
      notes: 'Saved from party live location',
      createdAt: new Date().toISOString()
    };
    stampOwner(pin);
    try {
      if (typeof locations !== 'undefined' && Array.isArray(locations)) {
        locations.push(pin);
      }
    } catch (eL) {}
    try {
      var pins = JSON.parse(localStorage.getItem('alabama_hunt_custom_pins') || '[]');
      if (!Array.isArray(pins)) pins = [];
      pins.push(pin);
      localStorage.setItem('alabama_hunt_custom_pins', JSON.stringify(pins));
    } catch (eS) {
      alert('Could not save pin on this device.');
      return;
    }
    try {
      if (typeof drawPinsOnMap === 'function') drawPinsOnMap();
    } catch (eD) {}
    try {
      if (typeof window.regSlayerMapDataChanged === 'function') window.regSlayerMapDataChanged();
    } catch (eM) {}
    try {
      var m = getMap();
      if (m) m.closePopup();
    } catch (eC) {}
    try {
      if (window.showAppCopyToast) {
        showAppCopyToast('<span class="act">Pin saved</span><br>' + esc(name));
      } else {
        alert('Pin saved: ' + name);
      }
    } catch (eT) {}
  };

  function partyPrefsLocalStoreKey(mapId) {
    var user = getUser() || window.__rsUser;
    var uid = user ? (user.id || user.user_id || '') : '';
    return PARTY_PREFS_LOCAL_KEY + ':' + String(mapId || '') + ':' + String(uid || '');
  }
  function loadPartyPrefsLocal(mapId) {
    try {
      var raw = localStorage.getItem(partyPrefsLocalStoreKey(mapId));
      var o = raw ? JSON.parse(raw) : {};
      return o && typeof o === 'object' ? o : {};
    } catch (e) {
      return {};
    }
  }
  function savePartyPrefsLocal(mapId, allPrefsByMember) {
    try {
      localStorage.setItem(partyPrefsLocalStoreKey(mapId), JSON.stringify(allPrefsByMember || {}));
    } catch (e) {}
  }
  function persistPartyPrefLocal(mapId, memberId, fields) {
    var store = loadPartyPrefsLocal(mapId);
    var mid = prefKey(memberId);
    store[mid] = Object.assign({}, store[mid] || {}, fields || {});
    savePartyPrefsLocal(mapId, store);
  }

  async function loadPartyPrefs(mapId) {
    partyPrefs = {};
    var sb = getSb() || window.__rsSb;
    var user = getUser() || window.__rsUser;
    if (!mapId) return;
    // 1) Local overrides first (survive cloud reload / missing migration)
    var local = loadPartyPrefsLocal(mapId);
    Object.keys(local).forEach(function (mid) {
      partyPrefs[mid] = Object.assign({}, local[mid]);
      partyPrefs[mid] = partyPrefs[mid];
    });
    if (!sb || !user) return;
    try {
      // Prefer full select; fall back if direction_icon_id column not migrated yet
      var res = await sb.from('party_member_prefs')
        .select('member_user_id, nickname, arrow_color, show_content, direction_icon_id')
        .eq('map_id', mapId)
        .eq('owner_user_id', user.id);
      if (res.error) {
        res = await sb.from('party_member_prefs')
          .select('member_user_id, nickname, arrow_color, show_content')
          .eq('map_id', mapId)
          .eq('owner_user_id', user.id);
      }
      (res.data || []).forEach(function (r) {
        var k = prefKey(r.member_user_id);
        // Cloud base, then local wins for direction_icon_id / nick / color if set locally later
        var merged = Object.assign({}, r, local[k] || {});
        // If cloud has direction_icon_id and local doesn't, keep cloud
        if (!Object.prototype.hasOwnProperty.call(local[k] || {}, 'direction_icon_id') &&
            r.direction_icon_id != null) {
          merged.direction_icon_id = r.direction_icon_id;
        }
        partyPrefs[k] = merged;
        partyPrefs[r.member_user_id] = merged;
      });
    } catch (e) {
      console.warn('loadPartyPrefs', e);
    }
    try {
      hiddenContentOwners = JSON.parse(localStorage.getItem(HIDDEN_MEMBERS_KEY + ':' + mapId) || '{}');
    } catch (e2) { hiddenContentOwners = {}; }
  }

  /** Columns that exist on party_member_prefs; icon_scale / marker_hidden stay local-only. */
  var PARTY_PREF_CLOUD_KEYS = {
    nickname: true,
    arrow_color: true,
    show_content: true,
    direction_icon_id: true
  };

  async function savePartyPref(memberId, fields, mapIdOpt) {
    var sb = getSb() || window.__rsSb;
    var user = getUser() || window.__rsUser;
    var vs = C.getViewState && C.getViewState();
    var mapId = mapIdOpt || (vs && vs.mode === 'shared' ? vs.sharedMapId : null) ||
      (mapsUiSelected && mapsUiSelected.kind === 'shared' ? mapsUiSelected.id : null);
    if (!mapId) {
      throw new Error('Not on a shared map — open the map first, then edit this hunter.');
    }
    var mid = prefKey(memberId);
    // Always update memory + localStorage first (map redraw must not depend on cloud)
    partyPrefs[mid] = Object.assign({}, getPartyPref(mid), fields);
    partyPrefs[memberId] = partyPrefs[mid];
    persistPartyPrefLocal(mapId, mid, fields);

    if (!sb || !user) return partyPrefs[mid];

    var cloudFields = {};
    Object.keys(fields || {}).forEach(function (k) {
      if (PARTY_PREF_CLOUD_KEYS[k]) cloudFields[k] = fields[k];
    });
    // Nothing cloud-worthy (e.g. only icon_scale / marker_hidden) — local is enough
    if (!Object.keys(cloudFields).length) return partyPrefs[mid];

    var row = Object.assign({
      map_id: mapId,
      owner_user_id: user.id,
      member_user_id: mid,
      updated_at: new Date().toISOString()
    }, cloudFields);

    var res = await sb.from('party_member_prefs').upsert(row, {
      onConflict: 'map_id,owner_user_id,member_user_id'
    });
    if (res.error) {
      // Retry without direction_icon_id if column not migrated
      if (Object.prototype.hasOwnProperty.call(cloudFields, 'direction_icon_id')) {
        var row2 = Object.assign({}, row);
        delete row2.direction_icon_id;
        var res2 = await sb.from('party_member_prefs').upsert(row2, {
          onConflict: 'map_id,owner_user_id,member_user_id'
        });
        if (res2.error) {
          console.warn('party pref cloud save failed; kept local', res2.error);
        } else {
          console.warn('direction_icon_id not on cloud yet (run migration). Local override still applied.');
        }
      } else {
        console.warn('party pref cloud save failed; kept local', res.error);
      }
    }
    return partyPrefs[mid];
  }

  async function enrichMembersWithProfiles(members) {
    var sb = getSb() || window.__rsSb;
    if (!sb || !members || !members.length) return members || [];
    var need = [];
    members.forEach(function (m) {
      if (!m) return;
      // Always refresh profile direction_icon_id / arrow_color when possible
      if (m.user_id) need.push(m.user_id);
    });
    if (!need.length) return members;
    try {
      var res = await sb.from('profiles')
        .select('id, arrow_color, direction_icon_id, username, display_name')
        .in('id', need);
      if (res.error || !res.data) return members;
      var byId = {};
      res.data.forEach(function (p) {
        byId[prefKey(p.id)] = p;
      });
      members.forEach(function (m) {
        var p = byId[prefKey(m.user_id)];
        if (!p) return;
        if (p.direction_icon_id != null) m.direction_icon_id = p.direction_icon_id;
        if (p.arrow_color) m.arrow_color = p.arrow_color;
        if (p.username && !m.username) m.username = p.username;
        if (p.display_name && !m.display_name) m.display_name = p.display_name;
      });
    } catch (e) {
      console.warn('enrichMembersWithProfiles', e);
    }
    return members;
  }

  async function listMembersForMap(mapId) {
    var sb = getSb() || window.__rsSb;
    if (!mapId || !sb) return [];
    var { data, error } = await sb.rpc('list_shared_map_members', { p_map_id: mapId });
    if (error) throw error;
    var members = data || [];
    await enrichMembersWithProfiles(members);
    return members;
  }

  function memberLabel(m) {
    if (!m) return 'Hunter';
    var pref = getPartyPref(m.user_id);
    if (pref && pref.nickname) return pref.nickname;
    return m.display_name || m.username || 'Hunter';
  }

  function memberColor(m) {
    if (!m) return '#2563eb';
    var pref = getPartyPref(m.user_id);
    if (pref && pref.arrow_color) return pref.arrow_color;
    return m.arrow_color || '#2563eb';
  }

  /** Force rebuild of one party marker’s icon (after edit). */
  function rebuildPartyMemberIcon(uid) {
    uid = prefKey(uid);
    var mk = partyMarkers[uid] || partyMarkers[String(uid)];
    if (!mk) {
      // Marker may use a different key casing — scan
      Object.keys(partyMarkers).forEach(function (k) {
        if (prefKey(k) === uid) mk = partyMarkers[k];
      });
    }
    if (!mk) {
      console.warn('rebuildPartyMemberIcon: no marker for', uid, Object.keys(partyMarkers));
      return;
    }
    var mem = findPartyMember(uid);
    var hdg = mk._rsHeading != null ? mk._rsHeading : 0;
    try {
      var icon = partyIconForMember(mem, hdg);
      mk.setIcon(icon);
      mk._rsIconSig = memberIconSignature(mem);
      mk._rsHeading = hdg;
      mk._rsHidden = memberMarkerHidden(mem);
      // Ensure keyed under string id
      partyMarkers[uid] = mk;
    } catch (e) {
      console.warn('rebuildPartyMemberIcon', e);
    }
  }

  async function pullPresence() {
    var vs = C.getViewState && C.getViewState();
    var sb = getSb();
    var user = getUser();
    var m = getMap();
    // Keep window.map in sync when the main app only has a local `map` binding
    if (m && !window.map) {
      try { window.map = m; } catch (eWm) {}
    }
    if (!vs || vs.mode !== 'shared' || !vs.sharedMapId || !sb || !m) {
      // Don't wipe markers just because map isn't ready yet — only when not on shared
      if (!vs || vs.mode !== 'shared' || !vs.sharedMapId) clearPartyMarkers();
      return;
    }
    var layer = ensurePartyLayer();
    if (!layer) return;
    try {
      // Refresh member labels occasionally
      // Refresh member profiles + my overrides so direction icons stay current
      try {
        await listMembers();
      } catch (eMem) {
        console.warn('listMembers', eMem);
      }

      var res = await sb.from('party_presence')
        .select('user_id, is_sharing, lat, lng, heading, updated_at, started_at')
        .eq('map_id', vs.sharedMapId)
        .eq('is_sharing', true);
      if (res.error) {
        console.warn('presence pull error', res.error);
        return;
      }
      var data = res.data || [];
      var members = window.__rsPartyMembers || [];
      var byId = {};
      members.forEach(function (mm) {
        byId[mm.user_id] = mm;
        byId[String(mm.user_id)] = mm;
      });
      var seen = {};
      data.forEach(function (row) {
        if (!row.is_sharing || row.lat == null || row.lng == null) return;
        // Hide self from party layer (own GPS marker is separate)
        if (user && String(row.user_id) === String(user.id)) return;
        // Stale > 3 min hide (heartbeats are ~5s — 20 min was too forgiving for "offline")
        var age = Date.now() - new Date(row.updated_at).getTime();
        if (isNaN(age) || age > 3 * 60 * 1000) return;
        var uid = String(row.user_id);
        seen[uid] = true;
        var mem = byId[row.user_id] || byId[uid] ||
          { user_id: row.user_id, username: 'Hunter', display_name: 'Hunter' };
        var label = memberLabel(mem);
        var hdg = normalizeHeading(row.heading);
        var popup = buildPartyMemberPopupHtml(row, mem);
        var sig = memberIconSignature(mem);
        var isHidden = memberMarkerHidden(mem);
        if (partyMarkers[uid]) {
          partyMarkers[uid].setLatLng([row.lat, row.lng]);
          partyMarkers[uid]._rsUpdatedAt = row.updated_at;
          try {
            partyMarkers[uid].setPopupContent(popup);
          } catch (eP) {}
          // Rebuild icon when color/custom glyph/size/hide changed (heading-only path skips setIcon)
          if (partyMarkers[uid]._rsIconSig !== sig) {
            try {
              var iconUp = partyIconForMember(mem, hdg != null ? hdg : partyMarkers[uid]._rsHeading);
              partyMarkers[uid].setIcon(iconUp);
              partyMarkers[uid]._rsIconSig = sig;
              partyMarkers[uid]._rsHidden = isHidden;
            } catch (eIc) {
              console.warn('party icon update', eIc);
            }
          } else if (hdg != null && !isHidden) {
            if (partyMarkers[uid]._rsHeading == null ||
                headingDelta(partyMarkers[uid]._rsHeading, hdg) >= 2) {
              updatePartyMarkerHeading(uid, hdg);
            }
          }
          if (hdg != null) partyMarkers[uid]._rsHeading = hdg;
        } else {
          var icon = partyIconForMember(mem, hdg);
          var mk = L.marker([row.lat, row.lng], { icon: icon, zIndexOffset: 900 }).addTo(layer);
          mk.bindPopup(popup, {
            className: 'map-dot-popup party-member-leaflet-popup',
            closeButton: true,
            autoPan: false,
            maxWidth: 260,
            closeOnClick: false
          });
          mk._rsHeading = hdg;
          mk._rsUserId = uid;
          mk._rsIconSig = sig;
          mk._rsHidden = isHidden;
          mk._rsUpdatedAt = row.updated_at;
          partyMarkers[uid] = mk;
        }
      });
      Object.keys(partyMarkers).forEach(function (uid) {
        if (!seen[uid]) {
          try { layer.removeLayer(partyMarkers[uid]); } catch (e) {}
          delete partyMarkers[uid];
        }
      });
      try { layer.bringToFront(); } catch (eBf) {}
    } catch (e) {
      console.warn('presence pull', e);
    }
  }

  function clearPartyMarkers() {
    if (partyLayer) {
      try { partyLayer.clearLayers(); } catch (e) {}
    }
    partyMarkers = {};
  }

  async function pushPresence(lat, lng, heading, force) {
    var vs = C.getViewState && C.getViewState();
    var sb = getSb();
    var user = getUser();
    if (!sharing || !vs || vs.mode !== 'shared' || !vs.sharedMapId || !sb || !user) return false;
    if (Date.now() - shareStartedAt > MAX_SHARE_MS) {
      stopSharing('auto');
      return false;
    }
    // Always resolve best facing heading (never wipe with null on heartbeat)
    var hdg = resolveFacingHeading(heading);
    if (hdg == null && lastSent.heading != null) hdg = lastSent.heading;

    var now = Date.now();
    var moved = true;
    if (lastSent.lat != null) {
      var d = haversineM(lastSent.lat, lastSent.lng, lat, lng);
      moved = d >= MOVE_M;
    }
    var headingTurned = lastSent.heading == null
      ? (hdg != null)
      : (hdg != null && headingDelta(lastSent.heading, hdg) >= HEADING_PUSH_DEG);

    if (!force && lastSent.at) {
      var elapsed = now - lastSent.at;
      if (moved && elapsed < MOVE_MS) return true;
      if (!moved && headingTurned && elapsed < HEADING_PUSH_MS) return true;
      if (!moved && !headingTurned && elapsed < HEARTBEAT_MS) return true;
    }

    var payload = {
      map_id: vs.sharedMapId,
      user_id: user.id,
      is_sharing: true,
      lat: lat,
      lng: lng,
      heading: hdg,
      started_at: new Date(shareStartedAt).toISOString(),
      last_moved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    try {
      var res = await sb.from('party_presence').upsert(payload, { onConflict: 'map_id,user_id' });
      if (res.error) {
        console.warn('presence push failed', res.error);
        try {
          if (window.showAppCopyToast) {
            showAppCopyToast('<span class="act">Share location failed</span><br>' +
              esc(res.error.message || 'Could not update party location'));
          }
        } catch (eT) {}
        return false;
      }
      lastSent = { lat: lat, lng: lng, heading: hdg, at: now };
      if (headingTurned) lastHeadingPushAt = now;
      return true;
    } catch (e) {
      console.warn('presence push', e);
      return false;
    }
  }

  function stopPartyHeadingWatch() {
    if (!headingWatchOn || !headingOrientHandler) return;
    try { window.removeEventListener('deviceorientationabsolute', headingOrientHandler, true); } catch (e0) {}
    try { window.removeEventListener('deviceorientation', headingOrientHandler, true); } catch (e1) {}
    headingWatchOn = false;
    headingOrientHandler = null;
  }

  function startPartyHeadingWatch() {
    if (headingWatchOn) return;
    headingOrientHandler = function (e) {
      if (!e) return;
      var raw = null;
      if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
        raw = e.webkitCompassHeading; // iOS: degrees from true/magnetic north
      } else if (typeof e.alpha === 'number' && !isNaN(e.alpha)) {
        raw = (360 - e.alpha) % 360;
      }
      raw = normalizeHeading(raw);
      if (raw == null) return;
      lastFacingHeading = raw;
      try { window.deviceHeadingDeg = raw; } catch (eW) {}
      // Push facing update while sharing (even if standing still)
      if (sharing && lastSent.lat != null) {
        var now = Date.now();
        if (now - lastHeadingPushAt >= HEADING_PUSH_MS) {
          if (lastSent.heading == null || headingDelta(lastSent.heading, raw) >= HEADING_PUSH_DEG) {
            pushPresence(lastSent.lat, lastSent.lng, raw, false);
          }
        }
      }
    };
    try { window.addEventListener('deviceorientationabsolute', headingOrientHandler, true); } catch (eA) {}
    try { window.addEventListener('deviceorientation', headingOrientHandler, true); } catch (eR) {}
    headingWatchOn = true;
  }

  function requestOrientationPermissionIfNeeded() {
    return new Promise(function (resolve) {
      try {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
            .then(function (state) { resolve(state === 'granted'); })
            .catch(function () { resolve(false); });
          return;
        }
      } catch (e) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  }

  /** Called from main app compass updates (and our own orientation watch). */
  function onDeviceHeading(heading) {
    heading = normalizeHeading(heading);
    if (heading == null) return;
    lastFacingHeading = heading;
    if (sharing && lastSent.lat != null) {
      var now = Date.now();
      if (now - lastHeadingPushAt >= HEADING_PUSH_MS &&
          (lastSent.heading == null || headingDelta(lastSent.heading, heading) >= HEADING_PUSH_DEG)) {
        pushPresence(lastSent.lat, lastSent.lng, heading, false);
      }
    }
  }

  function startSharing() {
    var vs = C.getViewState && C.getViewState();
    if (!vs || vs.mode !== 'shared' || !vs.sharedMapId) {
      alert('Share location only works on a shared map. Open a shared map first (Settings → My Maps → View).');
      return;
    }
    if (!navigator.geolocation) {
      alert('Geolocation not available on this device.');
      return;
    }
    if (!getSb() || !getUser()) {
      alert('Sign in required to share location with your party.');
      return;
    }
    // Ensure map reference for peers who pull while we share
    var m = getMap();
    if (m) {
      try { window.map = m; } catch (eM) {}
    }

    sharing = true;
    shareStartedAt = Date.now();
    lastSent = { lat: null, lng: null, heading: null, at: 0 };
    lastHeadingPushAt = 0;
    try {
      localStorage.setItem(PRESENCE_KEY, JSON.stringify({
        on: true,
        started: shareStartedAt,
        mapId: vs.sharedMapId
      }));
    } catch (e) {}
    updateShareLocBtn();

    // iOS: compass permission must be requested from this user tap
    requestOrientationPermissionIfNeeded().then(function (ok) {
      startPartyHeadingWatch();
      // Also ask main app compass stack if available
      try {
        if (typeof ensureDeviceOrientationPermission === 'function') {
          ensureDeviceOrientationPermission().then(function () {
            if (typeof startDeviceHeadingWatch === 'function') startDeviceHeadingWatch();
          });
        } else if (typeof startDeviceHeadingWatch === 'function') {
          startDeviceHeadingWatch();
        }
      } catch (eH) {}
      if (!ok) {
        try {
          if (window.showAppCopyToast) {
            showAppCopyToast('<span class="act">Compass optional</span><br>Location will still share; facing may use GPS course.');
          }
        } catch (eT) {}
      }
    });

    if (presenceWatch != null) {
      try { navigator.geolocation.clearWatch(presenceWatch); } catch (e2) {}
    }
    presenceWatch = navigator.geolocation.watchPosition(function (pos) {
      var lat = pos.coords.latitude, lng = pos.coords.longitude;
      // GPS course when moving; otherwise device compass
      var gpsH = pos.coords.heading;
      var speed = pos.coords.speed; // m/s
      var heading = null;
      if (gpsH != null && !isNaN(gpsH) && speed != null && speed > 0.8) {
        heading = gpsH; // course over ground while walking/driving
      } else {
        heading = resolveFacingHeading(gpsH);
      }
      pushPresence(lat, lng, heading, false);
    }, function (err) {
      console.warn('share location GPS error', err);
      try {
        if (window.showAppCopyToast) {
          showAppCopyToast('<span class="act">Location error</span><br>Allow location access to share with party.');
        }
      } catch (e3) {}
    }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });

    // Heartbeat with heading preserved + peer pull
    if (presenceTimer) clearInterval(presenceTimer);
    presenceTimer = setInterval(function () {
      if (!sharing) return;
      if (Date.now() - shareStartedAt > MAX_SHARE_MS) {
        stopSharing('auto');
        return;
      }
      pullPresence();
      if (lastSent.lat != null) {
        var h = resolveFacingHeading(lastSent.heading);
        pushPresence(lastSent.lat, lastSent.lng, h, true);
      }
    }, HEARTBEAT_MS);

    // Immediate force push
    navigator.geolocation.getCurrentPosition(function (pos) {
      var h0 = resolveFacingHeading(pos.coords.heading);
      pushPresence(pos.coords.latitude, pos.coords.longitude, h0, true).then(function (ok) {
        if (ok !== false && window.showAppCopyToast) {
          showAppCopyToast('<span class="act">Sharing location</span><br>Party can see your position and facing direction.');
        }
      });
    }, function (err) {
      console.warn(err);
      alert('Could not get your location. Check location permission and try again.');
      stopSharing();
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });

    pullPresence();
  }

  async function stopSharing(reason) {
    sharing = false;
    try { localStorage.removeItem(PRESENCE_KEY); } catch (e) {}
    if (presenceWatch != null) {
      try { navigator.geolocation.clearWatch(presenceWatch); } catch (e2) {}
      presenceWatch = null;
    }
    if (presenceTimer) { clearInterval(presenceTimer); presenceTimer = null; }
    stopPartyHeadingWatch();
    updateShareLocBtn();
    var vs = C.getViewState && C.getViewState();
    var sb = getSb();
    var user = getUser();
    if (sb && user && vs && vs.sharedMapId) {
      try {
        var res = await sb.from('party_presence').upsert({
          map_id: vs.sharedMapId,
          user_id: user.id,
          is_sharing: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'map_id,user_id' });
        if (res.error) console.warn('stop share presence', res.error);
      } catch (e3) {}
    }
    if (reason === 'auto') {
      try {
        showAppCopyToast && showAppCopyToast('<span class="act">Location sharing ended</span><br>Auto-off after 1 hour.');
      } catch (e4) {}
    } else {
      try {
        showAppCopyToast && showAppCopyToast('<span class="act">Stopped sharing location</span>');
      } catch (e5) {}
    }
  }

  function toggleSharing() {
    if (sharing) stopSharing();
    else startSharing();
  }

  function updateShareLocBtn() {
    var btn = $('share-loc-btn');
    if (!btn) return;
    // Restart pulse animation cleanly when turning on
    btn.classList.remove('is-sharing');
    if (sharing) {
      // force reflow so animation restarts
      void btn.offsetWidth;
      btn.classList.add('is-sharing');
    }
    btn.setAttribute('aria-pressed', sharing ? 'true' : 'false');
    btn.title = sharing ? 'Sharing location with party (tap to stop)' : 'Share current location with party';
  }

  // ---- List maps / UI ----
  async function listPrivateMaps() {
    var sb = window.__rsSb;
    if (!sb) return [];
    var { data, error } = await sb.rpc('list_my_private_maps');
    if (error) throw error;
    return data || [];
  }

  async function listMembers() {
    var vs = C.getViewState && C.getViewState();
    var sb = getSb() || window.__rsSb;
    if (!vs || vs.mode !== 'shared' || !vs.sharedMapId || !sb) {
      window.__rsPartyMembers = [];
      return [];
    }
    var { data, error } = await sb.rpc('list_shared_map_members', { p_map_id: vs.sharedMapId });
    if (error) throw error;
    var members = data || [];
    // Always merge profile direction_icon_id / arrow_color so others see each user's default
    await enrichMembersWithProfiles(members);
    await loadPartyPrefs(vs.sharedMapId);
    window.__rsPartyMembers = members;
    return window.__rsPartyMembers;
  }

  function showSimpleModal(title, bodyHtml, buttons) {
    var existing = $('rs-simple-modal');
    if (existing) existing.remove();
    var wrap = document.createElement('div');
    wrap.id = 'rs-simple-modal';
    wrap.className = 'rs-simple-modal active';
    wrap.onclick = function (e) { if (e.target === wrap) wrap.remove(); };
    var card = document.createElement('div');
    card.className = 'rs-simple-card';
    card.onclick = function (e) { e.stopPropagation(); };
    card.innerHTML = '<h3>' + esc(title) + '</h3><div class="rs-simple-body">' + bodyHtml + '</div><div class="rs-simple-actions" id="rs-simple-actions"></div>';
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    var act = card.querySelector('#rs-simple-actions');
    (buttons || []).forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'settings-subbtn' + (b.primary ? ' rs-btn-primary' : '');
      btn.textContent = b.label;
      btn.onclick = function () {
        // Run handler BEFORE removing modal so form fields still exist
        // (Edit friend Save was wiping direction_icon_id by reading after remove).
        var err = null;
        if (b.onClick) {
          try {
            var ret = b.onClick();
            // If Save returns a promise, wait then close
            if (ret && typeof ret.then === 'function') {
              ret.then(function () {
                if (b.close !== false && wrap.parentNode) wrap.remove();
              }).catch(function (e) {
                err = e;
                alert((e && e.message) || String(e));
              });
              return;
            }
          } catch (eClick) {
            err = eClick;
            alert((eClick && eClick.message) || String(eClick));
            return;
          }
        }
        if (!err && b.close !== false) wrap.remove();
      };
      act.appendChild(btn);
    });
    return wrap;
  }

  async function openSharedMapActions(mapRow) {
    showSimpleModal(mapRow.name || 'Shared map',
      '<p class="settings-hint">Code: <strong>' + esc(mapRow.code) + '</strong></p>',
      [
        {
          label: 'View this map',
          primary: true,
          onClick: function () {
            C.switchToShared(mapRow.id).then(function () {
              refreshMapsUi();
              pullPresence();
            }).catch(function (e) { alert(e.message || e); });
          }
        },
        {
          label: 'Share this map',
          onClick: function () {
            var text = 'Join my HuntSlayer map!\nMap: ' + (mapRow.name || '') + '\nCode: ' + mapRow.code +
              '\nhttps://regslayer.com/?join=' + mapRow.code;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(function () {
                alert('Copied:\n' + text);
              }).catch(function () { window.prompt('Copy:', text); });
            } else window.prompt('Copy:', text);
          }
        },
        { label: 'Cancel' }
      ]
    );
  }

  async function openPrivateMapActions(mapRow) {
    showSimpleModal(mapRow.name || 'Private map',
      '<p class="settings-hint">Private — only you. Rename or open.</p>',
      [
        {
          label: 'View this map',
          primary: true,
          onClick: function () {
            switchToPrivate(mapRow.id).catch(function (e) { alert(e.message || e); });
          }
        },
        {
          label: 'Rename map',
          onClick: function () {
            var n = prompt('New name:', mapRow.name || '');
            if (!n || !n.trim()) return;
            renamePrivate(mapRow.id, n.trim()).then(refreshMapsUi).catch(function (e) { alert(e.message || e); });
          }
        },
        { label: 'Cancel' }
      ]
    );
  }

  async function switchToPrivate(mapId) {
    var sb = window.__rsSb;
    if (!sb) throw new Error('Not ready');
    // save current
    if (C.forcePush) C.forcePush();
    await new Promise(function (r) { setTimeout(r, 100); });
    if (C.markDirty) { /* snapshot via collect happens in push */ }

    // Use original snapshot/cache path via internal hooks we expose
    if (typeof C._switchToPrivate === 'function') {
      return C._switchToPrivate(mapId);
    }
    // Fallback: set view + pull
    var { data, error } = await sb.from('private_maps').select('id, name, map_state, map_revision').eq('id', mapId).maybeSingle();
    if (error || !data) throw error || new Error('Map not found');
    var vs = C.getViewState();
    vs.mode = 'private';
    vs.privateMapId = data.id;
    vs.privateMapName = data.name;
    vs.sharedMapId = null;
    vs.sharedMapName = '';
    vs.sharedMapCode = '';
    // personal alias
    if (vs.mode === 'private') { /* ok */ }
    try {
      localStorage.setItem('reg_slayer_view_v1', JSON.stringify(vs));
    } catch (e) {}
    // apply state
    if (window.applyMapStateFromCloud) {
      window.applyMapStateFromCloud(data.map_state || {});
    } else if (typeof C._applyRemoteState === 'function') {
      C._applyRemoteState(data.map_state, data.map_revision);
    }
    // Write local keys via refresh helper
    try {
      var st = data.map_state || {};
      localStorage.setItem('alabama_hunt_custom_pins', JSON.stringify(st.pins || []));
      localStorage.setItem('alabama_hunt_historical_hunts', JSON.stringify(st.hunts || []));
      localStorage.setItem('alabama_hunt_custom_areas_v1', JSON.stringify(st.customAreas || []));
      localStorage.setItem('alabama_hunt_measured_paths_v1', JSON.stringify(st.measuredPaths || []));
      localStorage.setItem('alabama_hunt_user_stands_v1', JSON.stringify(st.stands || {}));
      localStorage.setItem('alabama_hunt_hidden_locations_v1', JSON.stringify(st.hiddenLocs || []));
      if (window.regSlayerRefreshMapData) window.regSlayerRefreshMapData();
    } catch (e2) {}
    clearPartyMarkers();
    stopSharing();
    updateBrandName();
    refreshMapsUi();
    if (C.persistViewPrefsCloud) { /* optional */ }
  }

  async function renamePrivate(id, name) {
    var sb = window.__rsSb;
    var { data, error } = await sb.rpc('rename_private_map', { p_id: id, p_name: name });
    if (error) throw error;
    var vs = C.getViewState();
    if (vs && vs.privateMapId === id) {
      vs.privateMapName = data.name;
      try { localStorage.setItem('reg_slayer_view_v1', JSON.stringify(vs)); } catch (e) {}
      updateBrandName();
    }
    return data;
  }

  async function createPrivateMap(name) {
    var sb = window.__rsSb;
    var { data, error } = await sb.rpc('create_private_map', { p_name: name });
    if (error) throw error;
    await switchToPrivate(data.id);
    return data;
  }

  function updateBrandName() {
    var vs = C.getViewState && C.getViewState();
    var el = $('brand-map-name');
    if (!el || !vs) return;
    if (vs.mode === 'shared') {
      el.textContent = displayMapName('shared', vs.sharedMapId, vs.sharedMapName || 'Shared');
      el.title = 'Shared map · ' + (vs.sharedMapCode || '');
    } else {
      el.textContent = displayMapName('private', vs.privateMapId, vs.privateMapName || 'My Map');
      el.title = 'Private map';
    }
  }

  function shareMapInviteText(mapRow) {
    var code = mapRow && mapRow.code ? String(mapRow.code) : '';
    var name = mapRow && mapRow.name ? String(mapRow.name) : 'Hunt map';
    return 'Join my HuntSlayer map!\nMap: ' + name + '\nCode: ' + code +
      '\nhttps://regslayer.com/?join=' + code;
  }

  function copyMapInvite(mapRow) {
    var text = shareMapInviteText(mapRow);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        try {
          if (window.showAppCopyToast) showAppCopyToast('<span class="act">Invite copied</span><br>Code ' + esc(mapRow.code || ''));
          else alert('Copied:\n' + text);
        } catch (e) { alert('Copied:\n' + text); }
      }).catch(function () { window.prompt('Copy:', text); });
    } else window.prompt('Copy:', text);
  }

  function loadMapAliases() {
    try {
      return JSON.parse(localStorage.getItem(MAP_ALIAS_KEY) || '{}') || {};
    } catch (e) { return {}; }
  }
  function saveMapAlias(kind, id, name) {
    var o = loadMapAliases();
    var key = kind + ':' + id;
    if (name && String(name).trim()) o[key] = String(name).trim().slice(0, 60);
    else delete o[key];
    try { localStorage.setItem(MAP_ALIAS_KEY, JSON.stringify(o)); } catch (e) {}
  }
  function getMapAlias(kind, id) {
    var o = loadMapAliases();
    return o[kind + ':' + id] || null;
  }
  function displayMapName(kind, id, serverName) {
    return getMapAlias(kind, id) || serverName || (kind === 'shared' ? 'Shared map' : 'Private map');
  }

  async function listMySharedForRename(mapId) {
    var smaps = [];
    try {
      if (C.listMySharedMaps) smaps = await C.listMySharedMaps();
      if (!smaps || !smaps.length) {
        var sb0 = getSb() || window.__rsSb;
        if (sb0) {
          var r0 = await sb0.rpc('list_my_shared_maps');
          smaps = r0.data || [];
        }
      }
    } catch (e) { smaps = []; }
    var m = (smaps || []).find(function (x) { return String(x.id) === String(mapId); });
    if (!m) return null;
    return {
      kind: 'shared',
      id: m.id,
      name: m.name || 'Shared map',
      code: m.code || '',
      is_host: !!m.is_host,
      host_user_id: m.host_user_id,
      raw: m
    };
  }

  async function leaveSharedMap(mapId) {
    var sb = getSb() || window.__rsSb;
    if (!sb) throw new Error('Not ready');
    var { error } = await sb.rpc('leave_shared_map', { p_map_id: mapId });
    if (error) throw error;
    var vs = C.getViewState && C.getViewState();
    if (vs && vs.mode === 'shared' && String(vs.sharedMapId) === String(mapId)) {
      // Fall back to default private map
      var pmaps = await listPrivateMaps();
      var def = (pmaps || []).find(function (m) { return m.is_default; }) || (pmaps || [])[0];
      if (def) await switchToPrivate(def.id);
      else {
        vs.mode = 'private';
        vs.sharedMapId = null;
        vs.sharedMapName = '';
        vs.sharedMapCode = '';
        try { localStorage.setItem('reg_slayer_view_v1', JSON.stringify(vs)); } catch (e) {}
        updateBrandName();
      }
    }
    saveMapAlias('shared', mapId, null);
    if (mapsUiSelected.kind === 'shared' && String(mapsUiSelected.id) === String(mapId)) {
      mapsUiSelected = { kind: null, id: null };
    }
  }

  async function removeSharedMember(mapId, userId) {
    var sb = getSb() || window.__rsSb;
    if (!sb) throw new Error('Not ready');
    var { error } = await sb.rpc('remove_shared_map_member', {
      p_map_id: mapId,
      p_user_id: userId
    });
    if (error) throw error;
  }

  async function deleteSharedMap(mapId) {
    var sb = getSb() || window.__rsSb;
    if (!sb) throw new Error('Not ready');
    var { error } = await sb.rpc('delete_shared_map', { p_map_id: mapId });
    if (error) throw error;
    var vs = C.getViewState && C.getViewState();
    if (vs && vs.mode === 'shared' && String(vs.sharedMapId) === String(mapId)) {
      var pmaps = await listPrivateMaps();
      var def = (pmaps || []).find(function (m) { return m.is_default; }) || (pmaps || [])[0];
      if (def) await switchToPrivate(def.id);
    }
    saveMapAlias('shared', mapId, null);
    if (mapsUiSelected.kind === 'shared' && String(mapsUiSelected.id) === String(mapId)) {
      mapsUiSelected = { kind: null, id: null };
    }
  }

  async function deletePrivateMap(mapId) {
    var sb = getSb() || window.__rsSb;
    if (!sb) throw new Error('Not ready');
    var { error } = await sb.rpc('delete_private_map', { p_id: mapId });
    if (error) throw error;
    var vs = C.getViewState && C.getViewState();
    if (vs && (vs.mode === 'private' || vs.mode === 'personal') && String(vs.privateMapId) === String(mapId)) {
      var pmaps = await listPrivateMaps();
      var def = (pmaps || []).find(function (m) { return m.is_default; }) || (pmaps || [])[0];
      if (def) await switchToPrivate(def.id);
    }
    saveMapAlias('private', mapId, null);
    if (mapsUiSelected.kind === 'private' && String(mapsUiSelected.id) === String(mapId)) {
      mapsUiSelected = { kind: null, id: null };
    }
  }

  function closeAllMapGearMenus() {
    try {
      document.querySelectorAll('.settings-map-row.gear-open').forEach(function (el) {
        el.classList.remove('gear-open');
      });
    } catch (e) {}
  }

  function openMapGearMenu(card) {
    closeAllMapGearMenus();
    var row = document.querySelector('.settings-map-row[data-kind="' + card.kind + '"][data-id="' + card.id + '"]');
    if (!row) return;
    row.classList.add('gear-open');
    var menu = row.querySelector('.settings-map-gear-menu');
    if (!menu) return;
    var isHost = !!card.is_host || card.kind === 'private';
    var html = '';
    if (card.kind === 'private' || isHost) {
      html += '<button type="button" class="settings-subbtn smc-gear-rename" data-kind="' + card.kind + '" data-id="' + card.id + '">Rename map</button>';
    }
    if (card.kind === 'shared' && !isHost) {
      html += '<button type="button" class="settings-subbtn smc-gear-leave" data-id="' + card.id + '">Leave map</button>';
    }
    if (card.kind === 'shared' && isHost) {
      html += '<button type="button" class="settings-subbtn danger smc-gear-delete" data-kind="shared" data-id="' + card.id + '">Delete map</button>';
    }
    if (card.kind === 'private') {
      html += '<button type="button" class="settings-subbtn danger smc-gear-delete" data-kind="private" data-id="' + card.id + '">Delete map</button>';
    }
    html += '<button type="button" class="settings-subbtn smc-gear-cancel">Cancel</button>';
    menu.innerHTML = html;

    var ren = menu.querySelector('.smc-gear-rename');
    if (ren) ren.onclick = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      closeAllMapGearMenus();
      promptRenameMap(card);
    };
    var leave = menu.querySelector('.smc-gear-leave');
    if (leave) leave.onclick = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      closeAllMapGearMenus();
      if (!confirm('Leave this shared map? You can rejoin later with the invite code.')) return;
      leaveSharedMap(card.id).then(function () {
        refreshMapsUi();
      }).catch(function (e) { alert(e.message || e); });
    };
    var del = menu.querySelector('.smc-gear-delete');
    if (del) del.onclick = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      closeAllMapGearMenus();
      var msg = card.kind === 'shared'
        ? 'Delete this shared map for everyone? Members will lose access. This cannot be undone.'
        : 'Delete this private map? Pins and drawings on it will be removed from the cloud copy.';
      if (!confirm(msg)) return;
      var p = card.kind === 'shared' ? deleteSharedMap(card.id) : deletePrivateMap(card.id);
      p.then(function () { refreshMapsUi(); }).catch(function (e) { alert(e.message || e); });
    };
    var cancel = menu.querySelector('.smc-gear-cancel');
    if (cancel) cancel.onclick = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      closeAllMapGearMenus();
    };
  }

  function promptRenameMap(card) {
    var current = displayMapName(card.kind, card.id, card.name);
    var n = prompt('New map name:', current);
    if (n == null) return;
    n = String(n).trim().slice(0, 60);
    if (!n) return;
    if (card.kind === 'private') {
      renamePrivate(card.id, n).then(function () {
        saveMapAlias('private', card.id, null);
        refreshMapsUi();
      }).catch(function (e) { alert(e.message || e); });
      return;
    }
    // Shared: only creator reaches here — ask everyone vs just me
    showSimpleModal('Rename map',
      '<p class="settings-status">Rename to <strong>' + esc(n) + '</strong>?</p>' +
      '<p class="settings-status">Rename for everyone updates the name on all members’ screens. “Just me” only changes what you see.</p>',
      [
        {
          label: 'Rename for everyone',
          primary: true,
          onClick: function () {
            var sb = getSb() || window.__rsSb;
            if (!sb) { alert('Not ready'); return; }
            sb.rpc('rename_shared_map', { p_id: card.id, p_name: n }).then(function (r) {
              if (r.error) throw r.error;
              saveMapAlias('shared', card.id, null);
              var vs = C.getViewState && C.getViewState();
              if (vs && vs.mode === 'shared' && String(vs.sharedMapId) === String(card.id)) {
                vs.sharedMapName = (r.data && r.data.name) || n;
                try { localStorage.setItem('reg_slayer_view_v1', JSON.stringify(vs)); } catch (e) {}
                updateBrandName();
              }
              refreshMapsUi();
            }).catch(function (e) { alert(e.message || e); });
          }
        },
        {
          label: 'Just me',
          onClick: function () {
            saveMapAlias('shared', card.id, n);
            var vs = C.getViewState && C.getViewState();
            if (vs && vs.mode === 'shared' && String(vs.sharedMapId) === String(card.id)) {
              // Brand can show personal alias while viewing
              updateBrandName();
            }
            refreshMapsUi();
          }
        },
        { label: 'Cancel' }
      ]
    );
  }

  function buildPartyMembersHtml(members, vs, user) {
    if (!members || !members.length) {
      return '<p class="settings-hint">Only you on this map so far.</p>';
    }
    return members.map(function (m) {
      var pref = partyPrefs[m.user_id] || {};
      var nick = pref.nickname || '';
      var col = pref.arrow_color || m.arrow_color || '#2563eb';
      var show = pref.show_content !== false && !hiddenContentOwners[m.user_id];
      var self = user && m.user_id === user.id;
      return '<div class="party-member-row" data-uid="' + m.user_id + '">' +
        '<div class="party-member-head">' +
          '<span class="party-dot" style="background:' + esc(col) + '"></span>' +
          '<strong>' + esc(memberLabel(m)) + '</strong>' +
          (self ? ' <span class="settings-hint">(you)</span>' : '') +
          (m.is_host ? ' · host' : '') +
        '</div>' +
        (!self ? (
          '<label class="settings-row"><input type="checkbox" class="party-show-content" ' + (show ? 'checked' : '') + '>' +
          '<span class="sr-text">Show their pins/areas on map</span></label>' +
          '<div class="settings-inline-row"><input type="text" class="party-nick" placeholder="Nickname" value="' + esc(nick) + '">' +
          '<input type="color" class="party-color" value="' + esc(col) + '" title="Arrow color" style="width:44px;height:36px;padding:0;border:none;">' +
          '<button type="button" class="party-save">Save</button></div>'
        ) : '') +
      '</div>';
    }).join('');
  }

  function openPartyMemberCustomize(member, mapId, mapMeta) {
    var user = getUser() || window.__rsUser;
    var self = user && member && member.user_id === user.id;
    var iAmHost = !!(mapMeta && mapMeta.is_host);
    var pref = partyPrefs[member.user_id] || {};
    var nick = pref.nickname || '';
    var col = pref.arrow_color || member.arrow_color || (self ? myArrowColor : '#2563eb');
    var dirId = self
      ? (myDirIconId || null)
      : ((Object.prototype.hasOwnProperty.call(pref, 'direction_icon_id') && pref.direction_icon_id)
        ? pref.direction_icon_id
        : null);
    var dirName = dirId
      ? ((getDirIconById(dirId) || {}).name || dirId)
      : (self ? 'Default triangle' : 'Use their default');
    var show = pref.show_content !== false && !hiddenContentOwners[member.user_id];
    var label = memberLabel(member) || 'Hunter';
    var scalePct = Math.round(memberIconScale(member) * 100);
    var isHidden = !!pref.marker_hidden;
    var body =
      '<p class="settings-status" style="margin:0 0 8px;">' + esc(label) +
        (self ? ' (you)' : '') + (member.is_host ? ' · host' : '') + '</p>' +
      '<label class="settings-status" style="display:block;margin:0 0 4px;">Nickname (only for you)</label>' +
      '<input type="text" id="rs-mem-nick" class="toast-form-control" style="width:100%;box-sizing:border-box;margin-bottom:8px;" ' +
        'value="' + esc(nick) + '" placeholder="Optional nickname">' +
      '<label class="settings-status" style="display:block;margin:0 0 4px;">Arrow / color</label>' +
      '<input type="color" id="rs-mem-color" value="' + esc(col) + '" style="width:100%;height:36px;border:none;margin-bottom:8px;">' +
      '<label class="settings-status" style="display:block;margin:0 0 4px;">Direction icon' +
        (self ? ' (everyone sees this for you)' : ' (your screen only)') + '</label>' +
      '<button type="button" class="settings-subbtn" id="rs-mem-dir-btn" style="width:100%;margin:0 0 8px;">' +
        esc(dirName) + '</button>' +
      '<input type="hidden" id="rs-mem-dir" value="' + esc(dirId || '') + '">' +
      (!self
        ? (
          '<label class="settings-status" style="display:block;margin:8px 0 4px;">Icon size <span id="rs-mem-size-val">' +
            scalePct + '</span>%</label>' +
          '<input type="range" id="rs-mem-size" min="40" max="160" step="5" value="' + scalePct + '" ' +
            'style="width:100%;margin:0 0 8px;" ' +
            'oninput="var v=document.getElementById(\'rs-mem-size-val\');if(v)v.textContent=this.value;">' +
          '<button type="button" class="settings-subbtn" id="rs-mem-hide-btn" style="width:100%;margin:0 0 8px;' +
            (isHidden ? 'background:#1a4a5c;border-color:#2a6a7c;' : '') + '">' +
            (isHidden ? 'Unhide icon' : 'Hide icon (color dot)') + '</button>' +
          '<label class="settings-row" style="border:none;padding:4px 0;"><input type="checkbox" id="rs-mem-show" ' +
            (show ? 'checked' : '') + '><span class="sr-text">Show their pins/areas on map</span></label>'
        )
        : '<p class="settings-status">Your live location uses this color and icon on the map. Others see your default icon unless they override it.</p>');
    var buttons = [
      {
        label: 'Save',
        primary: true,
        onClick: function () {
          var nickEl = $('rs-mem-nick');
          var colEl = $('rs-mem-color');
          var showEl = $('rs-mem-show');
          var dirEl = $('rs-mem-dir');
          var sizeEl = $('rs-mem-size');
          var n = nickEl ? nickEl.value.trim() : '';
          var c = colEl ? colEl.value : col;
          var d = dirEl && dirEl.value ? dirEl.value : null;
          var fields = {
            nickname: n || null,
            arrow_color: c || '#2563eb',
            direction_icon_id: d
          };
          if (!self && sizeEl) {
            var pct = parseInt(sizeEl.value, 10) || 100;
            pct = Math.max(40, Math.min(160, pct));
            fields.icon_scale = pct / 100;
          }
          if (!self && showEl) {
            fields.show_content = !!showEl.checked;
            if (!showEl.checked) hiddenContentOwners[member.user_id] = true;
            else delete hiddenContentOwners[member.user_id];
            try {
              localStorage.setItem(HIDDEN_MEMBERS_KEY + ':' + mapId, JSON.stringify(hiddenContentOwners));
            } catch (eH) {}
          }
          if (self) {
            myArrowColor = c || myArrowColor;
            myDirIconId = d;
            try { localStorage.setItem(ARROW_KEY, myArrowColor); } catch (eA) {}
            try {
              if (d) localStorage.setItem(DIR_ICON_KEY, d);
              else localStorage.removeItem(DIR_ICON_KEY);
            } catch (eD) {}
            try { document.documentElement.style.setProperty('--gps-arrow-color', myArrowColor); } catch (eCss) {}
            try {
              var sbP = getSb();
              if (sbP && user) {
                sbP.from('profiles').update({
                  arrow_color: myArrowColor,
                  direction_icon_id: d
                }).eq('id', user.id).then(function () {});
              }
            } catch (eProf) {}
            try { syncMyDirIconSettingsBtn(); } catch (eB) {}
          }
          // Friends: store override (null = use their profile default)
          if (!self) {
            fields.direction_icon_id = d || null;
          }
          return savePartyPref(member.user_id, fields, mapId).then(function () {
            if (self) {
              try {
                if (typeof setGpsMarker === 'function' && typeof userLat !== 'undefined' && userLat != null) {
                  setGpsMarker(userLat, userLng);
                }
              } catch (eG) {}
            } else {
              rebuildPartyMemberIcon(member.user_id);
            }
            applyContentOwnerFilter();
            setTimeout(function () {
              try { pullPresence(); } catch (eP) {}
              try { refreshMapsUi(); } catch (eR) {}
            }, 50);
          });
        }
      }
    ];
    if (iAmHost && !self && !member.is_host) {
      buttons.push({
        label: 'Remove from map',
        onClick: function () {
          if (!confirm('Remove ' + label + ' from this map? They can rejoin with the invite code.')) return;
          removeSharedMember(mapId, member.user_id).then(function () {
            refreshMapsUi();
          }).catch(function (e) { alert(e.message || e); });
        }
      });
    }
    buttons.push({ label: 'Cancel' });
    showSimpleModal('Customize ' + label, body, buttons);
    setTimeout(function () {
      var dirBtn = document.getElementById('rs-mem-dir-btn');
      if (dirBtn) {
        dirBtn.onclick = function (ev) {
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          var cur = (document.getElementById('rs-mem-dir') || {}).value || null;
          var colEl0 = document.getElementById('rs-mem-color');
          openDirIconPicker({
            title: 'Direction icon — ' + label,
            currentId: cur || null,
            currentColor: (colEl0 && colEl0.value) || col,
            mode: self ? 'self' : 'friend',
            onPick: function (id, color) {
              var hid = document.getElementById('rs-mem-dir');
              var lab = document.getElementById('rs-mem-dir-btn');
              var cEl = document.getElementById('rs-mem-color');
              if (hid) hid.value = id || '';
              if (lab) {
                lab.textContent = id
                  ? ((getDirIconById(id) || {}).name || id)
                  : (self ? 'Default triangle' : 'Use their default');
              }
              if (cEl && color) cEl.value = color;
            }
          });
        };
      }
      var hideBtn = document.getElementById('rs-mem-hide-btn');
      if (hideBtn && !self) {
        hideBtn.onclick = function (ev) {
          if (ev) { ev.preventDefault(); ev.stopPropagation(); }
          var next = !getPartyPref(member.user_id).marker_hidden;
          var nickEl = $('rs-mem-nick');
          var colEl = $('rs-mem-color');
          var dirEl = $('rs-mem-dir');
          var sizeEl = $('rs-mem-size');
          var n = nickEl ? nickEl.value.trim() : '';
          var c = colEl ? colEl.value : col;
          var d = dirEl && dirEl.value ? dirEl.value : null;
          var pct = sizeEl ? (parseInt(sizeEl.value, 10) || 100) : 100;
          pct = Math.max(40, Math.min(160, pct));
          savePartyPref(member.user_id, {
            nickname: n || null,
            arrow_color: c || '#2563eb',
            direction_icon_id: d || null,
            icon_scale: pct / 100,
            marker_hidden: next
          }, mapId).then(function () {
            rebuildPartyMemberIcon(member.user_id);
            try {
              var modal = document.getElementById('rs-simple-modal');
              if (modal && modal.parentNode) modal.remove();
            } catch (eClose) {}
            try {
              if (window.showAppCopyToast) {
                showAppCopyToast(next
                  ? '<span class="act">Hidden</span><br>Shows as a color dot on your map'
                  : '<span class="act">Unhidden</span><br>Full direction icon restored');
              }
            } catch (eT) {}
            try { refreshMapsUi(); } catch (eR) {}
          }).catch(function (err) {
            console.warn('member hide', err);
          });
        };
      }
    }, 30);
  }

  async function fillSelectedMapMembersPanel(smaps) {
    var panel = $('set-map-members-panel');
    if (!panel) return;
    if (!mapsUiSelected || mapsUiSelected.kind !== 'shared' || !mapsUiSelected.id) {
      panel.innerHTML = '';
      return;
    }
    var mapId = mapsUiSelected.id;
    var mapRow = (smaps || []).find(function (x) { return String(x.id) === String(mapId); });
    var mapName = displayMapName('shared', mapId, (mapRow && mapRow.name) || 'Shared map');
    panel.innerHTML = '<div class="smm-title">Members · ' + esc(mapName) + '</div>' +
      '<p class="settings-status">Loading…</p>';
    try {
      await loadPartyPrefs(mapId);
      var members = await listMembersForMap(mapId);
      // Cache for active map listMembers path
      var vs = C.getViewState && C.getViewState();
      if (vs && vs.mode === 'shared' && vs.sharedMapId === mapId) {
        window.__rsPartyMembers = members;
      }
      var user = getUser() || window.__rsUser;
      if (!members.length) {
        panel.innerHTML = '<div class="smm-title">Members · ' + esc(mapName) + '</div>' +
          '<p class="settings-status">No members listed yet. View the map and share an invite.</p>';
        return;
      }
      var mapMeta = {
        is_host: !!(mapRow && (mapRow.is_host || (user && mapRow.host_user_id === user.id)))
      };
      // Also detect host from members list
      if (!mapMeta.is_host && user) {
        var me = members.find(function (x) { return String(x.user_id) === String(user.id); });
        if (me && me.is_host) mapMeta.is_host = true;
      }
      panel.innerHTML = '<div class="smm-title">Members · ' + esc(mapName) + '</div>' +
        members.map(function (m) {
          var self = user && m.user_id === user.id;
          var col = memberColor(m);
          var meta = (self ? 'you' : '') + (m.is_host ? (self ? ' · host' : 'host') : '');
          return '<button type="button" class="smm-member settings-subbtn" data-uid="' + esc(m.user_id) + '">' +
            '<span class="smm-dot" style="background:' + esc(col) + '"></span>' +
            '<span class="smm-label">' + esc(memberLabel(m)) + '</span>' +
            (meta ? '<span class="smm-meta">' + esc(meta) + '</span>' : '') +
          '</button>';
        }).join('');
      panel.querySelectorAll('.smm-member').forEach(function (btn) {
        btn.onclick = function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          var uid = btn.getAttribute('data-uid');
          var mem = members.find(function (x) { return String(x.user_id) === String(uid); });
          if (mem) openPartyMemberCustomize(mem, mapId, mapMeta);
        };
      });
    } catch (eMem) {
      panel.innerHTML = '<div class="smm-title">Members · ' + esc(mapName) + '</div>' +
        '<p class="settings-status">Could not load members' +
        (eMem && eMem.message ? ': ' + esc(eMem.message) : '') + '.</p>';
    }
  }

  function mapRowHtml(card) {
    var selected = mapsUiSelected.kind === card.kind && String(mapsUiSelected.id) === String(card.id);
    var shown = displayMapName(card.kind, card.id, card.name);
    return '<div class="settings-map-row' +
      (card.active ? ' is-active' : '') +
      (selected ? ' is-selected' : '') +
      '" data-kind="' + card.kind + '" data-id="' + card.id + '">' +
      '<button type="button" class="smc-gear settings-subbtn" data-kind="' + card.kind + '" data-id="' + card.id +
        '" title="Map options" aria-label="Map options">⚙</button>' +
      '<button type="button" class="smc-name settings-subbtn" data-kind="' + card.kind + '" data-id="' + card.id + '" title="' +
        esc(shown) + '">' + esc(shown) + '</button>' +
      '<button type="button" class="smc-share settings-subbtn" data-kind="' + card.kind + '" data-id="' + card.id + '">Share</button>' +
      '<button type="button" class="smc-view settings-subbtn" data-kind="' + card.kind + '" data-id="' + card.id + '">View Map</button>' +
      '<div class="settings-map-gear-menu" role="menu"></div>' +
    '</div>';
  }

  async function refreshMapsUi() {
    updateBrandName();
    updateShareLocBtn();
    var allBox = $('set-all-maps-list');
    var privBox = $('set-private-maps-list');
    var sharedBox = $('set-shared-maps-list');
    var modeLabel = $('set-map-mode-label');
    var membersPanel = $('set-map-members-panel');
    var vs = C.getViewState && C.getViewState();
    if (modeLabel && vs) {
      if (vs.mode === 'shared') {
        modeLabel.textContent = 'Viewing: ' +
          displayMapName('shared', vs.sharedMapId, vs.sharedMapName || 'Shared') + ' (shared)';
      } else {
        modeLabel.textContent = 'Viewing: ' +
          displayMapName('private', vs.privateMapId, vs.privateMapName || 'My Map') + ' (not shared)';
      }
    }

    var pmaps = [];
    var smaps = [];
    try { pmaps = await listPrivateMaps(); } catch (eP) { pmaps = []; }
    try {
      if (C.listMySharedMaps) smaps = await C.listMySharedMaps();
      if (!smaps || !smaps.length) {
        var sb0 = getSb() || window.__rsSb;
        if (sb0) {
          var r0 = await sb0.rpc('list_my_shared_maps');
          smaps = r0.data || [];
        }
      }
    } catch (eS) { smaps = []; }

    // Sort: private (not shared) first by name, then shared by name
    pmaps = (pmaps || []).slice().sort(function (a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
    smaps = (smaps || []).slice().sort(function (a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

    var privateCards = pmaps.map(function (m) {
      return {
        kind: 'private',
        id: m.id,
        name: m.name || 'Private map',
        is_default: !!m.is_default,
        is_host: true,
        active: !!(vs && (vs.mode === 'private' || vs.mode === 'personal') && vs.privateMapId === m.id),
        raw: m
      };
    });
    var sharedCards = (smaps || []).map(function (m) {
      return {
        kind: 'shared',
        id: m.id,
        name: m.name || 'Shared map',
        code: m.code || '',
        is_host: !!m.is_host,
        host_user_id: m.host_user_id,
        active: !!(vs && vs.mode === 'shared' && vs.sharedMapId === m.id),
        raw: m
      };
    });

    // Default selection to currently viewed map
    if (!mapsUiSelected.id && vs) {
      if (vs.mode === 'shared' && vs.sharedMapId) {
        mapsUiSelected = { kind: 'shared', id: vs.sharedMapId };
      } else if (vs.privateMapId) {
        mapsUiSelected = { kind: 'private', id: vs.privateMapId };
      }
    }

    if (allBox) {
      if (!privateCards.length && !sharedCards.length) {
        allBox.innerHTML = '<p class="settings-status">No maps yet. Create a private or shared map below.</p>';
      } else {
        var html = '';
        html += '<div class="settings-maps-group">';
        html += '<div class="settings-maps-group-title">Not shared</div>';
        if (!privateCards.length) {
          html += '<p class="settings-status">No private maps yet.</p>';
        } else {
          html += privateCards.map(mapRowHtml).join('');
        }
        html += '</div>';
        html += '<div class="settings-maps-group">';
        html += '<div class="settings-maps-group-title">Shared</div>';
        if (!sharedCards.length) {
          html += '<p class="settings-status">No shared maps yet.</p>';
        } else {
          html += sharedCards.map(mapRowHtml).join('');
        }
        html += '</div>';
        allBox.innerHTML = html;

        function findCard(kind, id) {
          var list = kind === 'shared' ? sharedCards : privateCards;
          return list.find(function (c) { return String(c.id) === String(id); });
        }
        allBox.querySelectorAll('.smc-gear').forEach(function (btn) {
          btn.onclick = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var kind = btn.getAttribute('data-kind');
            var id = btn.getAttribute('data-id');
            var card = findCard(kind, id);
            if (!card) return;
            var row = btn.closest('.settings-map-row');
            if (row && row.classList.contains('gear-open')) {
              closeAllMapGearMenus();
              return;
            }
            openMapGearMenu(card);
          };
        });
        allBox.querySelectorAll('.smc-name').forEach(function (btn) {
          btn.onclick = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            closeAllMapGearMenus();
            var kind = btn.getAttribute('data-kind');
            var id = btn.getAttribute('data-id');
            if (mapsUiSelected.kind === kind && String(mapsUiSelected.id) === String(id)) {
              // Toggle off only for shared (hide members); keep private selection light
              if (kind === 'shared') mapsUiSelected = { kind: null, id: null };
            } else {
              mapsUiSelected = { kind: kind, id: id };
            }
            refreshMapsUi();
          };
        });
        allBox.querySelectorAll('.smc-view').forEach(function (btn) {
          btn.onclick = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            closeAllMapGearMenus();
            var kind = btn.getAttribute('data-kind');
            var id = btn.getAttribute('data-id');
            mapsUiSelected = { kind: kind, id: id };
            if (kind === 'private') {
              switchToPrivate(id).then(function () {
                refreshMapsUi();
              }).catch(function (e) { alert(e.message || e); });
            } else if (C.switchToShared) {
              C.switchToShared(id).then(function () {
                refreshMapsUi();
                pullPresence();
              }).catch(function (e) { alert(e.message || e); });
            }
          };
        });
        allBox.querySelectorAll('.smc-share').forEach(function (btn) {
          btn.onclick = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            closeAllMapGearMenus();
            var kind = btn.getAttribute('data-kind');
            var id = btn.getAttribute('data-id');
            if (kind === 'shared') {
              var row = (smaps || []).find(function (x) { return String(x.id) === String(id); });
              if (row) copyMapInvite(row);
              else alert('Could not find invite code for this map.');
            } else {
              showSimpleModal('Share map',
                '<p class="settings-status">This map is <strong>not shared</strong> — only you can see it. Create a <strong>shared map</strong> below to invite hunting partners with a 6-digit code.</p>',
                [{ label: 'OK', primary: true }]
              );
            }
          };
        });
      }
    }

    // Click outside closes gear menus
    if (!document._rsMapGearOutside) {
      document._rsMapGearOutside = true;
      document.addEventListener('click', function (ev) {
        if (ev.target && ev.target.closest && ev.target.closest('.settings-map-row')) return;
        closeAllMapGearMenus();
      }, true);
    }

    await fillSelectedMapMembersPanel(smaps);

    if (privBox) privBox.innerHTML = '';
    if (sharedBox) sharedBox.innerHTML = '';

    if (vs && vs.mode === 'shared' && vs.sharedMapId) {
      pullPresence();
    } else {
      clearPartyMarkers();
    }

    renderOverlayParty();
  }

  function applyContentOwnerFilter() {
    // Filter pins/areas/hunts by ownerId when drawing — set flag for draw hooks
    window.__rsHiddenContentOwners = hiddenContentOwners;
    try {
      if (typeof drawPinsOnMap === 'function') drawPinsOnMap();
      if (typeof drawHuntsOnMap === 'function') drawHuntsOnMap();
      if (typeof drawCustomAreasOnMap === 'function') drawCustomAreasOnMap();
    } catch (e) {}
  }

  function renderOverlayParty() {
    var box = $('ml-party-list');
    var fold = $('ml-fold-body-party');
    var vs = C.getViewState && C.getViewState();
    if (!box) return;
    if (!vs || vs.mode !== 'shared') {
      box.innerHTML = '<p class="settings-hint" style="font-size:11px;">Open a shared map to see party members.</p>';
      return;
    }
    var members = window.__rsPartyMembers || [];
    if (!members.length) {
      box.innerHTML = '<p class="settings-hint" style="font-size:11px;">Loading party…</p>';
      listMembers().then(function () { renderOverlayParty(); refreshMapsUi(); });
      return;
    }
    box.innerHTML = members.map(function (m) {
      var show = !hiddenContentOwners[m.user_id];
      return '<label class="ml-option"><input type="checkbox" data-party-uid="' + m.user_id + '" ' + (show ? 'checked' : '') + '>' +
        '<span class="ml-opt-text">' + esc(memberLabel(m)) + ' <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + esc(memberColor(m)) + ';vertical-align:middle;"></span></span></label>';
    }).join('') +
      '<p class="settings-hint" style="font-size:10px;margin:6px 0 0;">Uncheck hides their pins/areas. Live location always shows while they share.</p>';
    box.querySelectorAll('[data-party-uid]').forEach(function (inp) {
      inp.onchange = function () {
        var uid = inp.getAttribute('data-party-uid');
        if (!inp.checked) hiddenContentOwners[uid] = true;
        else delete hiddenContentOwners[uid];
        try {
          localStorage.setItem(HIDDEN_MEMBERS_KEY + ':' + vs.sharedMapId, JSON.stringify(hiddenContentOwners));
        } catch (e) {}
        applyContentOwnerFilter();
      };
    });
  }

  // ---- Share entity to another map ----
  async function listAllTargetMaps() {
    var out = [];
    try {
      var p = await listPrivateMaps();
      p.forEach(function (m) { out.push({ kind: 'private', id: m.id, name: m.name + ' (private)' }); });
    } catch (e) {}
    try {
      var sb = window.__rsSb;
      var r = await sb.rpc('list_my_shared_maps');
      (r.data || []).forEach(function (m) { out.push({ kind: 'shared', id: m.id, name: m.name + ' · ' + m.code, code: m.code }); });
    } catch (e2) {}
    var vs = C.getViewState && C.getViewState();
    // exclude current
    return out.filter(function (m) {
      if (!vs) return true;
      if (vs.mode === 'shared' && m.kind === 'shared' && m.id === vs.sharedMapId) return false;
      if ((vs.mode === 'private' || vs.mode === 'personal') && m.kind === 'private' && m.id === vs.privateMapId) return false;
      return true;
    });
  }

  async function getMapStateRow(kind, id) {
    var sb = window.__rsSb;
    if (kind === 'private') {
      var { data, error } = await sb.from('private_maps').select('map_state, map_revision').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    }
    var r = await sb.from('shared_maps').select('map_state, map_revision').eq('id', id).maybeSingle();
    if (r.error) throw r.error;
    return r.data;
  }

  async function putMapStateRow(kind, id, state, rev) {
    var sb = window.__rsSb;
    if (kind === 'private') {
      var { error } = await sb.from('private_maps').update({
        map_state: state,
        map_revision: rev,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      return;
    }
    var r = await sb.from('shared_maps').update({
      map_state: state,
      map_revision: rev,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (r.error) throw r.error;
  }

  function stampOwner(entity) {
    var user = window.__rsUser;
    var prof = C.getProfile && C.getProfile();
    if (!entity || !user) return entity;
    entity.ownerId = user.id;
    entity.ownerName = (prof && prof.username) || 'me';
    entity.updatedAt = new Date().toISOString();
    return entity;
  }

  async function copyEntityToMap(entity, entityType, target) {
    var row = await getMapStateRow(target.kind, target.id);
    var state = (row && row.map_state) || {};
    state.pins = state.pins || [];
    state.hunts = state.hunts || [];
    state.customAreas = state.customAreas || [];
    state.measuredPaths = state.measuredPaths || [];
    state.stands = state.stands || {};
    var copy = JSON.parse(JSON.stringify(entity));
    copy.id = entityType + '_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
    stampOwner(copy);
    if (entityType === 'pin') state.pins.push(copy);
    else if (entityType === 'hunt') state.hunts.push(copy);
    else if (entityType === 'area') state.customAreas.push(copy);
    else if (entityType === 'stand') {
      // stands keyed by loc — store as pin-like under stands.__shared
      var key = 'shared';
      if (!Array.isArray(state.stands[key])) state.stands[key] = [];
      state.stands[key].push(copy);
    }
    var rev = ((row && row.map_revision) || 0) + 1;
    if (!state.meta) state.meta = {};
    state.meta.revision = rev;
    state.meta.savedAt = new Date().toISOString();
    await putMapStateRow(target.kind, target.id, state, rev);
  }

  async function openShareToMapFlow(entity, defaultType) {
    var targets = await listAllTargetMaps();
    if (!targets.length) {
      alert('No other maps available. Create another private or shared map first.');
      return;
    }
    var opts = targets.map(function (t, i) {
      return '<option value="' + i + '">' + esc(t.name) + '</option>';
    }).join('');
    showSimpleModal('Share to another map',
      '<label class="settings-hint">Which map?</label>' +
      '<select id="rs-share-map-sel" style="width:100%;margin:6px 0 12px;padding:8px;background:#0f140e;color:#e8efe4;border:1px solid #2e3a2a;border-radius:8px;">' + opts + '</select>' +
      '<label class="settings-hint">Save as</label>' +
      '<select id="rs-share-type-sel" style="width:100%;margin:6px 0 4px;padding:8px;background:#0f140e;color:#e8efe4;border:1px solid #2e3a2a;border-radius:8px;">' +
        '<option value="pin"' + (defaultType === 'pin' ? ' selected' : '') + '>Pin</option>' +
        '<option value="hunt"' + (defaultType === 'hunt' ? ' selected' : '') + '>Hunt</option>' +
        '<option value="stand"' + (defaultType === 'stand' ? ' selected' : '') + '>Stand</option>' +
        (entity && entity.ring ? '<option value="area">Area</option>' : '') +
      '</select>' +
      '<p class="settings-hint">Keeps color, notes, and other details. Appears on the target map only (stays on this map too).</p>',
      [
        {
          label: 'Share',
          primary: true,
          close: false,
          onClick: function () {
            var mi = parseInt(($('rs-share-map-sel') || {}).value, 10);
            var typ = ($('rs-share-type-sel') || {}).value || 'pin';
            var t = targets[mi];
            if (!t) return;
            var ent = entity || {};
            // build minimal entity if only lat/lng
            if (!ent.id) {
              ent = {
                id: 'tmp',
                name: ent.name || 'Shared spot',
                lat: ent.lat,
                lng: ent.lng,
                color: ent.color || '#e59a18',
                notes: ent.notes || '',
                isPin: typ === 'pin'
              };
            }
            copyEntityToMap(ent, typ, t).then(function () {
              var modal = $('rs-simple-modal');
              if (modal) modal.remove();
              alert('Saved to: ' + t.name);
            }).catch(function (e) {
              alert(e.message || String(e));
            });
          }
        },
        { label: 'Cancel' }
      ]
    );
  }

  function openShareLocationChooser(lat, lng, label, entity) {
    showSimpleModal('Share location',
      '<p class="settings-hint">' + esc(label || 'This spot') + '</p>',
      [
        {
          label: 'Share to another map',
          primary: true,
          onClick: function () {
            openShareToMapFlow(entity || { lat: lat, lng: lng, name: label || 'Spot' }, 'pin');
          }
        },
        {
          label: 'Copy location',
          onClick: function () {
            if (typeof shareLocationLink === 'function') shareLocationLink(lat, lng, label);
            else if (typeof googleMapsShareUrl === 'function') {
              var u = googleMapsShareUrl(lat, lng);
              if (navigator.clipboard) navigator.clipboard.writeText(u);
              else window.prompt('Copy:', u);
            }
          }
        },
        { label: 'Cancel' }
      ]
    );
  }

  function openShareMyLocationChooser() {
    var lat = (typeof userLat !== 'undefined') ? userLat : null;
    var lng = (typeof userLng !== 'undefined') ? userLng : null;
    function go(la, lo) {
      showSimpleModal('Share my location',
        '<p class="settings-hint">Choose how to share your GPS position.</p>',
        [
          {
            label: 'Share to another map',
            primary: true,
            onClick: function () {
              openShareToMapFlow({ lat: la, lng: lo, name: 'My location' }, 'pin');
            }
          },
          {
            label: 'Copy location',
            onClick: function () {
              if (typeof shareLocationLink === 'function') shareLocationLink(la, lo, 'My location');
              else if (typeof googleMapsShareUrl === 'function') {
                var u = googleMapsShareUrl(la, lo);
                if (navigator.clipboard) navigator.clipboard.writeText(u);
                else window.prompt('Copy:', u);
              }
            }
          },
          {
            label: sharing ? 'Stop sharing with party' : 'Share with party (live)',
            onClick: function () {
              if (!sharing) startSharing();
              else stopSharing();
            }
          },
          { label: 'Cancel' }
        ]
      );
    }
    if (lat != null && lng != null) go(lat, lng);
    else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (pos) {
        go(pos.coords.latitude, pos.coords.longitude);
      }, function () { alert('Could not get location'); });
    } else alert('Location unavailable');
  }

  // Map-dot share is handled in index.html (same-size popup chooser).
  // Keep openShareToMapFlow / openShareLocationChooser available for pin popups.
  var _origShareSaved = window.shareSavedPinLocation;
  window.shareSavedPinLocation = function (id) {
    var loc = (typeof locations !== 'undefined') ? locations.find(function (l) { return String(l.id) === String(id); }) : null;
    if (!loc) {
      if (_origShareSaved) return _origShareSaved(id);
      return false;
    }
    // Use centered modal sized like map-dot card
    openShareLocationChooser(loc.lat, loc.lng, loc.name || 'Pin', loc);
    return false;
  };

  var _origShareLoc = window.shareLocationLink;
  // keep original for clipboard path

  // Stamp owner on saves
  var _origRsChanged = window.regSlayerMapDataChanged;
  window.regSlayerMapDataChanged = function () {
    try {
      // tag newest pin without owner
      var pins = JSON.parse(localStorage.getItem('alabama_hunt_custom_pins') || '[]');
      var user = window.__rsUser;
      var prof = C.getProfile && C.getProfile();
      var changed = false;
      pins.forEach(function (p) {
        if (p && !p.ownerId && user) {
          p.ownerId = user.id;
          p.ownerName = (prof && prof.username) || 'me';
          changed = true;
        }
      });
      if (changed) localStorage.setItem('alabama_hunt_custom_pins', JSON.stringify(pins));
      var areas = JSON.parse(localStorage.getItem('alabama_hunt_custom_areas_v1') || '[]');
      var ca = false;
      areas.forEach(function (a) {
        if (a && !a.ownerId && user) {
          a.ownerId = user.id;
          a.ownerName = (prof && prof.username) || 'me';
          ca = true;
        }
      });
      if (ca) localStorage.setItem('alabama_hunt_custom_areas_v1', JSON.stringify(areas));
    } catch (e) {}
    if (typeof _origRsChanged === 'function') _origRsChanged();
  };

  // Filter draws by hidden owners
  var _origDrawPins = null;
  function installDrawFilters() {
    if (typeof drawPinsOnMap === 'function' && !drawPinsOnMap._rsWrapped) {
      _origDrawPins = drawPinsOnMap;
      window.drawPinsOnMap = function () {
        var hidden = window.__rsHiddenContentOwners || {};
        var backup;
        if (typeof locations !== 'undefined' && Object.keys(hidden).length) {
          backup = locations.slice();
          // temporarily filter pins for draw — drawPins filters isPin from locations
          // We'll filter inside by monkeypatching locations filter
        }
        var r = _origDrawPins.apply(this, arguments);
        return r;
      };
      // Simpler: patch after draw clears and re-filter layers — skip, use pre-filter on locations isPin
      window.drawPinsOnMap = function () {
        if (!window.map || !window.pinMarkerGroup) return _origDrawPins.apply(this, arguments);
        var hidden = window.__rsHiddenContentOwners || {};
        var user = window.__rsUser;
        pinMarkerGroup.clearLayers();
        if (typeof locations === 'undefined') return;
        locations.filter(function (l) {
          if (!l.isPin) return false;
          if (l.ownerId && hidden[l.ownerId] && (!user || l.ownerId !== user.id)) return false;
          return true;
        }).forEach(function (loc) {
          // reuse original single-pin draw by temporary call is hard — call original logic
        });
        // Fall back to original then remove filtered
        _origDrawPins.apply(this, arguments);
        try {
          pinMarkerGroup.eachLayer(function (layer) {
            // can't easily map — re-run original only
          });
        } catch (e) {}
      };
      // Actually keep original drawPinsOnMap and filter at data level before draw:
      window.drawPinsOnMap = function () {
        var hidden = window.__rsHiddenContentOwners || {};
        var user = window.__rsUser;
        var removed = [];
        if (typeof locations !== 'undefined' && Object.keys(hidden).length) {
          for (var i = locations.length - 1; i >= 0; i--) {
            var l = locations[i];
            if (l && l.isPin && l.ownerId && hidden[l.ownerId] && (!user || l.ownerId !== user.id)) {
              removed.push(locations.splice(i, 1)[0]);
            }
          }
        }
        try {
          return _origDrawPins.apply(this, arguments);
        } finally {
          if (removed.length) {
            removed.forEach(function (x) { locations.push(x); });
          }
        }
      };
      window.drawPinsOnMap._rsWrapped = true;
    }
  }

  // Wire settings UI extras after DOM ready
  function wireExtraSettings() {
    var createPriv = $('set-create-private-btn');
    if (createPriv) createPriv.onclick = function () {
      var name = ($('set-create-private-name') && $('set-create-private-name').value || '').trim();
      if (!name) { alert('Enter a name for your private map'); return; }
      createPrivateMap(name).then(function (m) {
        if ($('set-create-private-name')) $('set-create-private-name').value = '';
        alert('Private map created: ' + m.name);
        refreshMapsUi();
      }).catch(function (e) { alert(e.message || e); });
    };
    var renameCur = $('set-rename-current-btn');
    if (renameCur) renameCur.onclick = function () {
      var vs = C.getViewState && C.getViewState();
      if (!vs) return;
      if (vs.mode === 'shared' && vs.sharedMapId) {
        // Only host can rename; open same flow as gear
        listMySharedForRename(vs.sharedMapId).then(function (card) {
          if (!card) { alert('Map not found'); return; }
          if (!card.is_host) {
            alert('Only the map creator can rename this map.');
            return;
          }
          promptRenameMap(card);
        }).catch(function (e) { alert(e.message || e); });
      } else if (vs.privateMapId) {
        promptRenameMap({
          kind: 'private',
          id: vs.privateMapId,
          name: vs.privateMapName || 'My Map',
          is_host: true
        });
      } else alert('Open a map first');
    };
    var arrowInp = $('set-my-arrow-color');
    if (arrowInp) {
      arrowInp.value = myArrowColor;
      arrowInp.onchange = function () {
        myArrowColor = arrowInp.value || '#e11d1d';
        try { localStorage.setItem(ARROW_KEY, myArrowColor); } catch (e) {}
        // persist profile
        var sb = window.__rsSb;
        var user = window.__rsUser;
        if (sb && user) {
          sb.from('profiles').update({ arrow_color: myArrowColor }).eq('id', user.id).then(function () {});
        }
        // recolor own GPS if possible
        try {
          if (typeof setGpsMarker === 'function' && typeof userLat !== 'undefined' && userLat != null) {
            // patch buildGpsMarkerIcon via CSS variable
            document.documentElement.style.setProperty('--gps-arrow-color', myArrowColor);
            setGpsMarker(userLat, userLng);
          }
        } catch (e2) {}
      };
      document.documentElement.style.setProperty('--gps-arrow-color', myArrowColor);
    }
    var shareBtn = $('share-loc-btn');
    if (shareBtn) {
      // Toolbar: party live location only — on/off, pulse when active, no multi-option popup
      shareBtn.onclick = function (ev) {
        if (ev) { try { ev.preventDefault(); ev.stopPropagation(); } catch (e0) {} }
        toggleSharing();
        return false;
      };
    }
    // gps long-press / secondary: after snap offer share? User asked: when clicking current location arrow icon on map
    // Own GPS marker is non-interactive. Make share via toolbar. Also hook snapToGPS secondary menu:
  }

  // Patch buildGpsMarkerIcon: own color + optional custom directional icon
  var _origBuildGps = null;
  function installGpsColor() {
    if (typeof buildGpsMarkerIcon === 'function' && !buildGpsMarkerIcon._rsColor) {
      _origBuildGps = buildGpsMarkerIcon;
      window.buildGpsMarkerIcon = function (headingDeg) {
        // Custom direction icon for self
        if (myDirIconId && getDirIconById(myDirIconId) && typeof L !== 'undefined') {
          var scale = 1.5;
          try {
            if (typeof getGpsMarkerScale === 'function') scale = getGpsMarkerScale();
          } catch (eS) {}
          // Slightly larger than default arrow (~17×24 * scale)
          var s = Math.round(28 * scale);
          var rot = 0;
          if (headingDeg != null && !isNaN(headingDeg)) {
            rot = ((Number(headingDeg) % 360) + 360) % 360;
          }
          var body = buildDirBodyHtml(myArrowColor, rot, myDirIconId, s);
          var html =
            '<div class="gps-heading-tri-wrap rs-dir-gps-wrap" style="width:' + s +
              'px;height:' + s + 'px;position:relative;overflow:visible;">' + body + '</div>';
          return L.divIcon({
            className: 'gps-heading-icon',
            html: html,
            iconSize: [s, s],
            iconAnchor: [s / 2, s / 2]
          });
        }
        var icon = _origBuildGps(headingDeg);
        try {
          if (icon && icon.options && icon.options.html) {
            icon.options.html = icon.options.html.replace(/#e11d1d/g, myArrowColor).replace(/#ff4d4d/g, myArrowColor);
          }
        } catch (e) {}
        return icon;
      };
      window.buildGpsMarkerIcon._rsColor = true;
    }
  }

  // Capture sb + user from auth client used by main module
  function bindClientRefs() {
    // Prefer auth-sync's single shared client (same session / JWT)
    try {
      var c = getSb();
      if (c) window.__rsSb = c;
    } catch (e0) {}
    if (!window.__rsSb && window.supabase && window.supabase.createClient) {
      try {
        var url = 'https://grvhmktqzrivbqbczkii.supabase.co';
        var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdydmhta3RxenJpdmJxYmN6a2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MDQ0MTIsImV4cCI6MjEwMTI4MDQxMn0.fFfrS-7w45IzxwOvvyYDB5ngLnyTz-Ru7XVL5LZXm4o';
        window.__rsSb = window.supabase.createClient(url, key, {
          auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage }
        });
      } catch (e) {}
    }
    var sb = getSb();
    if (sb) {
      window.__rsSb = sb;
      sb.auth.getSession().then(function (res) {
        if (res.data && res.data.session) {
          window.__rsUser = res.data.session.user;
          var uid = res.data.session.user.id;
          sb.from('profiles').select('arrow_color, direction_icon_id').eq('id', uid).maybeSingle()
            .then(function (r) {
              if (r.data) {
                if (r.data.arrow_color) {
                  myArrowColor = r.data.arrow_color;
                  try { localStorage.setItem(ARROW_KEY, myArrowColor); } catch (eA) {}
                  try { document.documentElement.style.setProperty('--gps-arrow-color', myArrowColor); } catch (eC) {}
                }
                if (r.data.direction_icon_id) {
                  myDirIconId = r.data.direction_icon_id;
                  try { localStorage.setItem(DIR_ICON_KEY, myDirIconId); } catch (eD) {}
                } else {
                  myDirIconId = null;
                  try { localStorage.removeItem(DIR_ICON_KEY); } catch (eD2) {}
                }
                try { syncMyDirIconSettingsBtn(); } catch (eB) {}
                try {
                  if (typeof setGpsMarker === 'function' && typeof userLat !== 'undefined' && userLat != null) {
                    setGpsMarker(userLat, userLng);
                  }
                } catch (eG) {}
              }
            }).catch(function () {});
        }
      }).catch(function () {});
    }
  }

  // Hook maps tab refresh
  window.addEventListener('regslayer-maps-tab', function () {
    refreshMapsUi();
  });

  // After auth
  var partyPullInterval = null;
  function ensurePartyPullLoop() {
    if (partyPullInterval) return;
    // Always pull when viewing a shared map — even if we are not sharing ourselves
    // Faster poll so mobile clients see each other both ways
    partyPullInterval = setInterval(function () {
      var vs = C.getViewState && C.getViewState();
      if (vs && vs.mode === 'shared' && vs.sharedMapId && document.visibilityState === 'visible') {
        var m = getMap();
        if (m && !window.map) {
          try { window.map = m; } catch (e) {}
        }
        pullPresence();
      }
    }, PULL_MS);
    // Extra pull when tab becomes visible (mobile backgrounding)
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        setTimeout(function () { pullPresence(); }, 200);
      }
    });
    // pageshow (bfcache restore on iOS)
    window.addEventListener('pageshow', function () {
      setTimeout(function () { pullPresence(); }, 300);
    });
  }

  function onReady() {
    bindClientRefs();
    wireExtraSettings();
    installGpsColor();
    installDrawFilters();
    // Share location is OFF by default — do not auto-resume previous session
    sharing = false;
    try { localStorage.removeItem(PRESENCE_KEY); } catch (e) {}
    updateShareLocBtn();
    ensurePartyPullLoop();
    setTimeout(function () {
      // Capture map if already created
      try {
        var m0 = getMap();
        if (m0) window.map = m0;
      } catch (e0) {}
      refreshMapsUi();
      pullPresence();
    }, 500);
    // Retry after map typically mounts
    [1200, 2500, 5000].forEach(function (ms) {
      setTimeout(function () {
        try {
          var m = getMap();
          if (m) window.map = m;
        } catch (e1) {}
        pullPresence();
      }, ms);
    });
  }

  // When main app finishes ensureMap, re-pull party markers
  var _origEnsureMap = window.ensureMap;
  if (typeof _origEnsureMap === 'function' && !_origEnsureMap._rsPartyHook) {
    window.ensureMap = function () {
      return _origEnsureMap.apply(this, arguments).then(function (m) {
        try {
          if (m) window.map = m;
          else if (getMap()) window.map = getMap();
        } catch (e) {}
        setTimeout(function () { pullPresence(); }, 50);
        return m;
      });
    };
    window.ensureMap._rsPartyHook = true;
  }

  if (C.authReady && C.authReady.then) {
    C.authReady.then(onReady).catch(onReady);
  } else {
    setTimeout(onReady, 1200);
  }

  // Public API
  window.RegSlayerParty = {
    refreshMapsUi: refreshMapsUi,
    toggleSharing: toggleSharing,
    startSharing: startSharing,
    stopSharing: stopSharing,
    openShareToMapFlow: openShareToMapFlow,
    openShareLocationChooser: openShareLocationChooser,
    openShareMyLocationChooser: openShareMyLocationChooser,
    listPrivateMaps: listPrivateMaps,
    createPrivateMap: createPrivateMap,
    switchToPrivate: switchToPrivate,
    isSharing: function () { return sharing; },
    stampOwner: stampOwner,
    pullPresence: pullPresence,
    onDeviceHeading: onDeviceHeading
  };

  // Multi-map on create pin: inject checkboxes after save forms appear — hook savePinFromMap
  var _origSavePin = null;
  function waitForSavePin() {
    if (typeof savePinFromMap === 'function' && !savePinFromMap._rsMulti) {
      _origSavePin = savePinFromMap;
      window.savePinFromMap = function () {
        var r = _origSavePin.apply(this, arguments);
        // After save, offer multi-map if checked
        setTimeout(function () {
          var boxes = document.querySelectorAll('.rs-extra-map-chk:checked');
          if (!boxes.length) return;
          try {
            var pins = JSON.parse(localStorage.getItem('alabama_hunt_custom_pins') || '[]');
            var last = pins[pins.length - 1];
            if (!last) return;
            boxes.forEach(function (chk) {
              var kind = chk.getAttribute('data-kind');
              var id = chk.getAttribute('data-id');
              copyEntityToMap(last, 'pin', { kind: kind, id: id }).catch(function (e) { console.warn(e); });
            });
          } catch (e) {}
        }, 100);
        return r;
      };
      savePinFromMap._rsMulti = true;
    }
  }
  setInterval(waitForSavePin, 2000);

  // Pin form multi-map targets
  window.rsFillExtraMapChecks = async function (containerId) {
    var el = $(containerId);
    if (!el) return;
    el.innerHTML = '<span class="settings-hint">Also save to:</span>';
    try {
      var maps = await listAllTargetMaps();
      maps.forEach(function (m) {
        var lab = document.createElement('label');
        lab.className = 'settings-row';
        lab.innerHTML = '<input type="checkbox" class="rs-extra-map-chk" data-kind="' + m.kind + '" data-id="' + m.id + '"><span class="sr-text">' + esc(m.name) + '</span>';
        el.appendChild(lab);
      });
    } catch (e) {}
  };
})();
