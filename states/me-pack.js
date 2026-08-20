/* Maine deer pack — MDIFW 2026-27 season table + official WMD GIS.
 * Sundays closed (not encoded as a weekday filter). Expanded archery is designated areas only.
 */
(function () {
  var GIS = 'https://services1.arcgis.com/RbMX0mRVOFNTdLzd/arcgis/rest/services/WMD/FeatureServer/0/query';
  var WMA = 'https://services1.arcgis.com/RbMX0mRVOFNTdLzd/arcgis/rest/services/MaineDIFW_WildlifeManagementAreas/FeatureServer/0/query';
  var ids = [];
  for (var i = 1; i <= 29; i++) ids.push(String(i));
  var areas = {};
  ids.forEach(function (id) {
    areas[id] = { n: id, name: 'WMD ' + id, region: 'U' };
  });
  var EXT = [];
  for (var j = 12; j <= 18; j++) EXT.push(String(j));
  for (var k = 20; k <= 29; k++) EXT.push(String(k));
  var NOTE = 'MDIFW 2026-27 hunting seasons. Sundays closed. Expanded archery is designated areas only. Confirm the 2026-27 hunting lawbook.';
  window.RSPackLib.buildAndRegister({
    code: 'ME',
    name: 'Maine',
    year: 2026,
    source: 'MDIFW 2026-2027 hunting season dates PDF',
    agency: 'Maine Department of Inland Fisheries & Wildlife',
    agencyUrl: 'https://www.maine.gov/ifw/hunting-trapping/hunting/laws-rules/season-dates-bag-limits.html',
    lawUrl: 'https://www.maine.gov/ifw/docs/26-MDIFW-6-Hunting-Season-2026-27.pdf',
    mapUrl: 'https://www.maine.gov/ifw/hunting-trapping/hunting/laws-rules/deer-hunting.html',
    huntUnitGis: GIS,
    unitField: 'IDENTIFIER',
    unitNameField: 'IDENTIFIER',
    outFields: 'IDENTIFIER',
    unitLabel: 'WMD',
    overlayFoldLabel: 'Wildlife Management Districts',
    confirmLabel: 'MDIFW 2026-27 season dates',
    minUnitCache: 25,
    hasBlm: false,
    wma: {
      url: WMA, where: '1=1',
      outFields: 'NAME,OBJECTID',
      nameFields: ['NAME'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: function (id) { return String(id == null ? '' : id).replace(/^0+/, '') || '0'; },
    regionOrder: ['U'],
    regionColors: { U: '#2f9e4f' },
    regionNames: { U: 'Maine WMDs 1–29' },
    areas: areas,
    seasons: [
      { areas: ids, type: 'Archery', arch: ['2026-10-03', '2026-10-30'], land: 'Either', target: 'Deer (either-sex in regular archery)', limit: 'Regular archery all WMDs Oct 3-30, 2026. ' + NOTE },
      { areas: ids, type: 'Youth', gun: ['2026-10-23', '2026-10-24'], land: 'Either', target: 'Deer', limit: 'Youth deer hunt Oct 23-24, 2026. ' + NOTE, youthOnly: true },
      { areas: ids, type: 'ResidentDay', gun: ['2026-10-31', '2026-10-31'], land: 'Either', target: 'Deer', limit: 'Maine resident-only day Oct 31, 2026. ' + NOTE },
      { areas: ids, type: 'Firearm', gun: ['2026-11-02', '2026-11-28'], land: 'Either', target: 'Deer (either-sex WMDs 21-25 and 29)', limit: 'Firearms Nov 2-28, 2026. Sundays closed. ' + NOTE },
      { areas: ids, type: 'Muzzleloader', muzzle: ['2026-11-30', '2026-12-05'], land: 'Either', target: 'Deer', limit: 'Statewide muzzleloader Nov 30-Dec 5, 2026. ' + NOTE },
      { areas: EXT, type: 'Muzzleloader', muzzle: ['2026-12-07', '2026-12-12'], land: 'Either', target: 'Deer', limit: 'Extended muzzleloader WMDs 12-18 and 20-29 Dec 7-12, 2026. ' + NOTE }
    ],
    extraVsAlabama: ['Wildlife Management Districts 1-29', 'Sunday hunting prohibited', 'Expanded archery is mapped separately (not encoded statewide)'],
    accuracyNotes: [
      'Official 2026-27 MDIFW season table.',
      'GIS layer has ~40 polygons vs 29 WMDs (water/islands/IDENTIFIER=0). Written WMD descriptions control.',
      'Sundays are closed statewide — not filtered by weekday in the engine.',
      'Expanded archery Sep 12-Dec 12 is designated areas only and is not drawn.'
    ]
  });
})();
