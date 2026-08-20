/* New Mexico deer pack — official 2026-27 NMDOW deer-draw tables + BLM/NMDGF GMU GIS.
 * Public land is draw hunt codes. Conservative: common bow window only. Rifle omitted.
 */
(function () {
  var GIS = 'https://gis.blm.gov/nmarcgis/rest/services/Recreation/NMDGF_NM_Game_Management_Units/MapServer/0/query';
  var NOTE = 'NMDOW 2026-27 Hunting Rules deer tables. Public hunts are draw licenses (deadline Mar 18, 2026). Rifle/muzzleloader hunt codes omitted. Confirm wildlife.dgf.nm.gov.';

  var NW = ['2','2A','2B','2C','4','5','5A','5B','6','6A','6C','7','8','9','10','12','14'];
  var NE = ['41','42','43','45','47','48','49','50','51','52','53','54','55','55A','55B','56','57','58','59'];
  var SW = ['13','15','16','16A','16B','16C','16D','16E','17','18','19','20','21','22','23','24','25','26','27'];
  var SE = ['28','29','30','31','32','33','34','36','37','38','39','40'];
  var NO_SEP_BOW = ['2C','19'];
  var SEP_BOW = NW.concat(NE).concat(SW).concat(SE).filter(function (u) {
    return NO_SEP_BOW.indexOf(u) === -1;
  });

  function norm(id) {
    return String(id == null ? '' : id).toUpperCase().replace(/^UNIT\s+/, '').replace(/^GMU\s+/, '').replace(/\s+/g, '');
  }
  function regionOf(id) {
    var s = norm(id);
    var core = s.replace(/[A-E]$/, '');
    if (NW.indexOf(s) !== -1 || NW.indexOf(core) !== -1) return 'NW';
    if (NE.indexOf(s) !== -1 || NE.indexOf(core) !== -1) return 'NE';
    if (SW.indexOf(s) !== -1 || SW.indexOf(core) !== -1) return 'SW';
    if (SE.indexOf(s) !== -1 || SE.indexOf(core) !== -1) return 'SE';
    return 'U';
  }

  window.RSPackLib.buildAndRegister({
    code: 'NM',
    name: 'New Mexico',
    year: 2026,
    source: '2026-2027 New Mexico Hunting Rules — Deer (official NMDOW PDF pp. 52-63)',
    agency: 'New Mexico Department of Wildlife',
    agencyUrl: 'https://wildlife.dgf.nm.gov/hunting/',
    lawUrl: 'https://wildlife.dgf.nm.gov/home/publications/',
    mapUrl: 'https://wildlife.dgf.nm.gov/hunting/maps/big-game-unit-maps-pdfs/',
    huntUnitGis: GIS,
    unitField: 'GMU',
    unitNameField: 'GMU',
    outFields: 'GMU,HUNT_INFO,OBJECTID',
    unitLabel: 'GMU',
    overlayFoldLabel: 'Game management units',
    confirmLabel: 'NMDOW 2026-27 hunting rules (deer)',
    minUnitCache: 50,
    hasBlm: true,
    normalizeUnitId: norm,
    regionForUnit: regionOf,
    regionOrder: ['NW', 'NE', 'SW', 'SE', 'U'],
    regionColors: { NW: '#e0913c', NE: '#5b8def', SW: '#2f9e4f', SE: '#a78bfa', U: '#64748b' },
    regionNames: {
      NW: 'Northwest GMUs (2-14)',
      NE: 'Northeast GMUs (41-59)',
      SW: 'Southwest GMUs (13-27)',
      SE: 'Southeast GMUs (28-40)',
      U: 'Other / unmatched'
    },
    areas: {},
    seasons: [
      { areas: SEP_BOW, type: 'Archery', arch: ['2026-09-01', '2026-09-24'], land: 'Either', target: 'Fork-antlered deer (draw)', limit: 'Typical public-draw bow Sep 1-24, 2026. Units 2C and 19 are January-only bow. Draw license required. ' + NOTE },
      { areas: NO_SEP_BOW, type: 'Archery', arch: ['2027-01-01', '2027-01-15'], land: 'Either', target: 'Fork-antlered deer (draw)', limit: 'Units 2C and 19 public bow is Jan 1-15, 2027 only. ' + NOTE }
    ],
    extraVsAlabama: ['Draw hunt codes — rifle omitted', 'Quadrant colors', 'Jan bow extra on some units omitted except 2C/19'],
    accuracyNotes: [
      'Bow Sep 1-24 transcribed from official 2026-27 NMDOW deer PDF (most public GMUs).',
      'GIS is BLM/NMDGF Game Management Units (field GMU). Shapefile year on NMDOW site is 2017; confirm current legal descriptions.',
      'Sep 1-24 bow is encoded on listed GMUs (2C and 19 excluded). GIS labels that do not match the list stay closed.',
      'January 1-15 bow on many other units omitted so units without January bow never show open.',
      'Muzzleloader and any-legal hunt codes are 4-5 day draws with different dates by GMU — omitted. Those days stay closed in the engine.',
      'Private-land-only licenses follow a corresponding hunt code and are not a statewide calendar.',
      'State WMAs are closed unless designated open — PAD-US/WMA overlay is access, not a season.',
      'Premium statewide hunt DER-1-700 (1 license) omitted.'
    ]
  });
})();
