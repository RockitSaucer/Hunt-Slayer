/* One active state pack at a time. Alabama stays in index.html (gold). */
(function () {
  window.RS_PACKS = window.RS_PACKS || {};

  function activePack() {
    var code = window.RS_STATE && window.RS_STATE.code;
    if (!code || code === 'AL') return null;
    return window.RS_PACKS[code] || null;
  }

  function registerPack(pack) {
    if (!pack || !pack.code) return;
    window.RS_PACKS[pack.code] = pack;
  }

  var inflight = {};

  function loadStatePack(code) {
    code = String(code || '').toUpperCase();
    if (!code || code === 'AL') return Promise.resolve(null);
    if (window.RS_PACKS[code]) return Promise.resolve(window.RS_PACKS[code]);
    if (inflight[code]) return inflight[code];
    inflight[code] = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = './states/' + code.toLowerCase() + '-pack.js';
      s.async = true;
      s.onload = function () { resolve(window.RS_PACKS[code] || null); };
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    }).then(function (pack) {
      delete inflight[code];
      return pack;
    });
    return inflight[code];
  }

  window.activePack = activePack;
  window.registerStatePack = registerPack;
  window.loadStatePack = loadStatePack;
})();
