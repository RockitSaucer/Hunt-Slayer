/* Connecticut deer pack — 2026 DEEP Hunting and Trapping Guide + official zone GIS.
 * Deer page last updated Aug 11, 2026.
 * GIS: Deer_Turkey_Management_Zones FeatureServer/0 (13 zones).
 */
(function () {
  var Z = 'https://services1.arcgis.com/FjPcSmEFuDYlIdKC/arcgis/rest/services/Deer_Turkey_Management_Zones/FeatureServer/0/query';
  var HUNT = 'https://services1.arcgis.com/FjPcSmEFuDYlIdKC/arcgis/rest/services/Connecticut_Open_for_Hunting_New_Schema/FeatureServer/0/query';
  var ids = ['1','2','3','4A','4B','5','6','7','8','9','10','11','12'];
  var areas = {};
  ids.forEach(function (id) {
    areas[id] = { n: id, name: 'Deer/Turkey Zone ' + id, region: 'U' };
  });
  var ALL = ids;
  var Z1112 = ['11','12'];
  var NOTE = 'DEEP 2026 Hunting Guide. Private-land windows are encoded. State-land archery closes Nov 17 and reopens Dec 23; state muzzleloader ends Dec 22. Lottery/no-lottery shotgun is Nov 18-Dec 8 on listed properties. Confirm DEEP.';
  window.RSPackLib.buildAndRegister({
    code: 'CT',
    name: 'Connecticut',
    year: 2026,
    source: '2026 Connecticut Hunting and Trapping Guide (updated Aug 11, 2026)',
    agency: 'Connecticut DEEP Wildlife Division',
    agencyUrl: 'https://portal.ct.gov/deep/hunting/2026-connecticut-hunting-and-trapping-guide/deer-hunting',
    lawUrl: 'https://portal.ct.gov/-/media/deep/hunting_trapping/pdf_files/2026-ct-hunting-guide.pdf',
    mapUrl: 'https://portal.ct.gov/deep/hunting/deer-and-turkey-management-zone-map',
    huntUnitGis: Z,
    unitField: 'zone',
    unitNameField: 'zone',
    outFields: 'zone',
    unitLabel: 'Deer Zone',
    overlayFoldLabel: 'Deer/turkey zones',
    confirmLabel: 'CT DEEP 2026 Hunting Guide',
    lawLabel: '2026 Connecticut Hunting and Trapping Guide',
    agencyLabel: 'CT DEEP — deer hunting',
    wmaNote: 'DEEP lands open to hunting. Lottery vs no-lottery shotgun and muzzleloader flags vary by property. Confirm the interactive hunting map.',
    minUnitCache: 10,
    hasBlm: false,
    wma: {
      url: HUNT,
      where: '1=1',
      outFields: 'HuntAName,Property_Type,OBJECTID',
      nameFields: ['HuntAName'],
      label: 'Area open for hunting',
      short: 'Hunt land',
      typeLabel: 'Hunt land',
      notes: 'CT DEEP areas open for hunting. Confirm Archery/No-lottery/Muzzleloader columns on the property.'
    },
    extraToggles: [
      { key: 'wma', color: '#e59a18', text: '#111', label: 'Hunt land', title: 'DEEP areas open for hunting' }
    ],
    normalizeUnitId: function (id) {
      var s = String(id == null ? '' : id).toUpperCase().replace(/^ZONE\s+/, '');
      return s;
    },
    regionOrder: ['U'],
    regionColors: { U: '#5b8def' },
    regionNames: { U: 'Deer/turkey management zones 1–12' },
    areas: areas,
    seasons: [
      { areas: ALL, type: 'Archery', arch: ['2026-09-15', '2026-12-31'], land: 'Either', target: 'Deer', limit: 'Private land archery all zones Sept 15-Dec 31, 2026. State land: Sept 15-Nov 17 and Dec 23-31 except bowhunting-only areas (open through Dec 31). ' + NOTE },
      { areas: Z1112, type: 'Archery', arch: ['2027-01-01', '2027-01-31'], land: 'Private', target: 'Deer', limit: 'Private land Zones 11-12 archery Jan 1-31, 2027. ' + NOTE },
      { areas: ALL, type: 'Firearm', gun: ['2026-11-18', '2026-12-08'], land: 'Either', target: 'Deer', limit: 'Private shotgun/rifle and state no-lottery/lottery regular Nov 18-Dec 8, 2026. ' + NOTE },
      { areas: ALL, type: 'Landowner', gun: ['2026-11-01', '2026-12-31'], land: 'Private', target: 'Deer', limit: 'Landowner permit Nov 1-Dec 31 (10+ contiguous acres). ' + NOTE },
      { areas: ALL, type: 'Muzzleloader', muzzle: ['2026-12-09', '2026-12-31'], land: 'Private', target: 'Deer', limit: 'Private land muzzleloader Dec 9-31, 2026. State land muzzleloader is Dec 9-22 only. ' + NOTE },
      { areas: ALL, type: 'Muzzleloader-state', muzzle: ['2026-12-09', '2026-12-22'], land: 'Either', target: 'Deer', limit: 'State land muzzleloader Dec 9-22, 2026. ' + NOTE },
      { areas: ALL, type: 'Youth', gun: ['2026-11-07', '2026-11-14'], land: 'Either', target: 'Deer', limit: 'Junior Deer Hunter Training Days Nov 7-14, 2026 (excluding Sunday on state land). ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: [
      'Deer/turkey management zones 1-12 (not A-E)',
      'Separate private vs state-land archery and muzzleloader calendars',
      'Lottery shotgun on some state properties',
      'January archery only in zones 11-12 on private land'
    ],
    accuracyNotes: [
      'Official 2026 DEEP guide + deer page updated Aug 11, 2026.',
      'Archery Sept 15-Dec 31 is the private-land window; state land is shorter except bowhunting-only areas.',
      'GIS zone codes are lowercase 4a/4b; pack normalizes to 4A/4B.',
      'Sunday hunting 40 yards from blazed trails (printed guide wrongly said 40 feet).'
    ]
  });
})();
