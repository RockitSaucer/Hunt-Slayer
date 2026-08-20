/* Arkansas deer pack — AGFC 2026-27 deer seasons by zone (official page).
 * Source: https://www.agfc.com/hunting/deer/deer-seasons-and-limits-by-zone/
 * GIS: AGFC FeatureServer layer 12 (Deer Zones). Layer attributes still say 2010
 * and include 1A/4B/5B/6A/8A which the 2026-27 page does not list — those labels
 * have no seasons in this pack (closed until AGFC confirms).
 */
(function () {
  var GIS = 'https://gisec2.agfc.com/arcgis/rest/services/GIS/AGFC_DATA/FeatureServer';
  var areas = {};
  function add(ids, region) {
    ids.forEach(function (id) {
      areas[id] = { n: id, name: 'Deer Zone ' + id, region: region };
    });
  }
  add(['1','2','3','6','7','8','10','11'], 'G6');
  add(['4','5'], 'G22');
  add(['4A','5A','14','15'], 'G13');
  add(['9','12','13'], 'G20');
  add(['16','16A','17'], 'G28');
  ['1A','4B','5B','6A','8A'].forEach(function (id) {
    areas[id] = { n: id, name: 'Deer Zone ' + id + ' (GIS label; confirm 2026-27 map)', region: 'X' };
  });
  var ALL = ['1','2','3','4','4A','5','5A','6','7','8','9','10','11','12','13','14','15','16','16A','17'];
  var AF_DEC12 = ['1','2','3','6','7','8','10','11'];
  var AF_DEC19 = ['4A','5A','14','15'];
  var AF_OCT_ONLY = ['9','12','13','16','16A','17'];
  var GUN_DEC6 = ['1','2','3','6','7','8','10','11'];
  var GUN_NOV22 = ['4','5'];
  var GUN_DEC13 = ['4A','5A','14','15'];
  var GUN_DEC20 = ['9','12','13'];
  var GUN_DEC28 = ['16','16A','17'];
  var NOTE = 'Confirm AGFC 2026-27 deer zone page and WMA booklet before hunting. WMA dates can differ from the zone.';

  window.RSPackLib.buildAndRegister({
    code: 'AR',
    name: 'Arkansas',
    year: 2026,
    source: 'AGFC 2026-27 Deer Seasons and Limits by Zone',
    agency: 'Arkansas Game & Fish Commission',
    agencyUrl: 'https://www.agfc.com/hunting/deer/deer-seasons-and-limits-by-zone/',
    lawUrl: 'https://www.agfc.com/hunting/deer/deer-seasons-and-limits-by-zone/',
    mapUrl: 'https://www.agfc.com/hunting/deer/deer-seasons-and-limits-by-zone/',
    huntUnitGis: GIS + '/12/query',
    unitField: 'flabel',
    unitNameField: 'fname',
    outFields: 'fname,flabel,acres,objectid',
    unitLabel: 'Deer Zone',
    overlayFoldLabel: 'Deer zones',
    confirmLabel: 'AGFC 2026-27 deer zone page',
    lawLabel: 'AGFC 2026-27 Deer Seasons and Limits by Zone',
    agencyLabel: 'Arkansas Game & Fish Commission — deer',
    wmaNote: 'AGFC WMA. Many WMAs have different deer dates than the zone. Confirm the WMA page.',
    minUnitCache: 15,
    hasBlm: false,
    wma: {
      url: GIS + '/11/query',
      where: "ftype='Regulatory Boundary'",
      outFields: 'fname,flabel,ftype,acres,web_link_agfc,objectid',
      nameFields: ['fname', 'flabel'],
      label: 'Wildlife Management Area',
      short: 'WMA',
      typeLabel: 'WMA',
      notes: 'AGFC WMA boundary. Confirm the WMA deer season; it can differ from the zone.'
    },
    normalizeUnitId: function (id) {
      var s = String(id == null ? '' : id).toUpperCase();
      var m = s.match(/(\d+[A-Z]?)/);
      return m ? m[1] : s;
    },
    regionOrder: ['G6', 'G22', 'G13', 'G20', 'G28', 'X'],
    regionColors: { G6: '#e0913c', G22: '#5b8def', G13: '#2f9e4f', G20: '#a78bfa', G28: '#c45c26', X: '#64748b' },
    regionNames: {
      G6: 'Modern gun through Dec 6 (zones 1-3, 6-8, 10-11)',
      G22: 'Modern gun through Nov 22 (zones 4-5)',
      G13: 'Modern gun through Dec 13 (4A, 5A, 14, 15)',
      G20: 'Modern gun through Dec 20 (9, 12, 13)',
      G28: 'Modern gun through Dec 28 (16, 16A, 17)',
      X: 'GIS-only leftover labels (closed)'
    },
    areas: areas,
    seasons: [
      { areas: ALL, type: 'Archery-early', arch: ['2026-08-29', '2026-08-31'], land: 'Either', target: 'Antlered buck only', limit: 'Early buck-only archery Aug 29-31, 2026. ' + NOTE },
      { areas: ALL, type: 'Archery', arch: ['2026-09-26', '2027-02-28'], land: 'Either', target: 'Deer', limit: 'Archery Sept 26, 2026-Feb 28, 2027. Zone bag limits vary. ' + NOTE },
      { areas: AF_DEC12.concat(AF_DEC19).concat(AF_OCT_ONLY), type: 'AltFirearms', muzzle: ['2026-10-17', '2026-10-25'], land: 'Either', target: 'Deer', limit: 'Alternative firearms (ex-muzzleloader) Oct 17-25, 2026. Closed in zones 4 and 5. ' + NOTE },
      { areas: AF_DEC12, type: 'AltFirearms', muzzle: ['2026-12-12', '2026-12-14'], land: 'Either', target: 'Deer', limit: 'Alternative firearms Dec 12-14, 2026. ' + NOTE },
      { areas: AF_DEC19, type: 'AltFirearms', muzzle: ['2026-12-19', '2026-12-21'], land: 'Either', target: 'Deer', limit: 'Alternative firearms Dec 19-21, 2026. ' + NOTE },
      { areas: GUN_DEC6, type: 'ModernGun', gun: ['2026-11-14', '2026-12-06'], land: 'Either', target: 'Deer', limit: 'Modern gun Nov 14-Dec 6, 2026. ' + NOTE },
      { areas: GUN_NOV22, type: 'ModernGun', gun: ['2026-11-14', '2026-11-22'], land: 'Either', target: 'Deer', limit: 'Modern gun Nov 14-22, 2026 (zones 4 and 5). Alt firearms closed. ' + NOTE },
      { areas: GUN_DEC13, type: 'ModernGun', gun: ['2026-11-14', '2026-12-13'], land: 'Either', target: 'Deer', limit: 'Modern gun Nov 14-Dec 13, 2026. ' + NOTE },
      { areas: GUN_DEC20, type: 'ModernGun', gun: ['2026-11-14', '2026-12-20'], land: 'Either', target: 'Deer', limit: 'Modern gun Nov 14-Dec 20, 2026. ' + NOTE },
      { areas: GUN_DEC28, type: 'ModernGun', gun: ['2026-11-14', '2026-12-28'], land: 'Either', target: 'Deer', limit: 'Modern gun Nov 14-Dec 28, 2026. ' + NOTE },
      { areas: ALL, type: 'ModernGun-Christmas', gun: ['2026-12-26', '2026-12-28'], land: 'Either', target: 'Deer', limit: 'Christmas holiday modern gun Dec 26-28, 2026. ' + NOTE },
      { areas: ALL, type: 'Youth', gun: ['2026-11-07', '2026-11-08'], land: 'Either', target: 'Deer', limit: 'Youth modern gun Nov 7-8, 2026. Public-land youth: check WMA. ' + NOTE, youthOnly: true },
      { areas: ALL, type: 'Youth', gun: ['2027-01-02', '2027-01-03'], land: 'Either', target: 'Deer', limit: 'Youth modern gun Jan 2-3, 2027. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: [
      'Numbered deer zones (1-17 plus 4A/5A/16A) instead of A-E',
      'Muzzleloader season is named Alternative Firearms',
      'Early buck-only archery Aug 29-31',
      'Christmas modern-gun weekend',
      'WMA dates often differ from the zone — confirm WMA page'
    ],
    accuracyNotes: [
      'Dates transcribed from AGFC 2026-27 zone page (fetched 2026-08-19).',
      'GIS deer-zone layer still labeled season 2010 and includes 1A/4B/5B/6A/8A not listed on the 2026-27 page. Those GIS labels have no seasons here.',
      'WMA-specific deer seasons are NOT in this pack — zone dates only.'
    ]
  });
})();
