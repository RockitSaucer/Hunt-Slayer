/* Nevada mule deer pack — official 2026-27 NDOW eRegulations mule-deer tables + official hunt-unit GIS.
 * All mule deer is a draw tag. Conservative early overlap so late-only units never show open early.
 */
(function () {
  var GIS = 'https://services.arcgis.com/RyxlXSfFi87rAosq/arcgis/rest/services/NDOWGameMgmtUnits/FeatureServer/0/query';
  var WMA = 'https://services.arcgis.com/RyxlXSfFi87rAosq/arcgis/rest/services/Wildlife_Management_Areas/FeatureServer/0/query';
  var NOTE = 'NDOW 2026-27 Big Game Seasons (eRegulations mule deer, last updated May 27, 2026). Mule deer is draw-only. Confirm ndow.org / the hunt table for that unit group.';

  var NO_EARLY_ARCH = ['021', '21'];
  var GUN_EARLY = [];
  (function buildGun() {
    var i;
    for (i = 11; i <= 14; i++) GUN_EARLY.push(pad(i));
    GUN_EARLY.push('022', '031', '032', '033', '034', '035', '041', '042', '043', '044', '045', '046', '051');
    for (i = 61; i <= 68; i++) if (i !== 63) GUN_EARLY.push(pad(i));
    for (i = 71; i <= 79; i++) GUN_EARLY.push(pad(i));
    GUN_EARLY.push('091');
    for (i = 101; i <= 109; i++) GUN_EARLY.push(String(i));
    for (i = 111; i <= 115; i++) GUN_EARLY.push(String(i));
    GUN_EARLY.push('121');
    for (i = 131; i <= 134; i++) GUN_EARLY.push(String(i));
    for (i = 141; i <= 145; i++) GUN_EARLY.push(String(i));
    for (i = 151; i <= 156; i++) GUN_EARLY.push(String(i));
    for (i = 161; i <= 164; i++) GUN_EARLY.push(String(i));
    for (i = 171; i <= 173; i++) GUN_EARLY.push(String(i));
    for (i = 181; i <= 184; i++) GUN_EARLY.push(String(i));
    GUN_EARLY.push('195', '221', '222', '223', '231', '241', '242', '243', '244', '245', '251', '252', '253', '254');
  })();
  var ARCH_EARLY = GUN_EARLY.concat([
    '015', '081', '192', '194', '196',
    '201', '202', '203', '204', '205', '206', '207', '208',
    '211', '212', '213',
    '261', '262', '263', '264', '265', '266', '267', '268',
    '271', '272', '291'
  ]);
  var MUZ_EARLY = ARCH_EARLY.filter(function (u) {
    return ['081', '114', '115', '181', '182', '183', '184', '201', '202', '203', '204', '205', '206', '207', '208'].indexOf(u) === -1;
  });

  function pad(n) {
    n = String(n);
    while (n.length < 3) n = '0' + n;
    return n;
  }
  function norm(id) {
    var s = String(id == null ? '' : id).replace(/^UNIT\s+/i, '').replace(/^HU?NT\s*UNIT\s+/i, '');
    var n = parseInt(s, 10);
    if (isNaN(n)) return s;
    return pad(n);
  }
  function regionOf(id) {
    var s = norm(id);
    var n = parseInt(s, 10);
    if (!isNaN(n) && n >= 200) return 'S';
    if (!isNaN(n) && n >= 100) return 'E';
    return 'N';
  }

  window.RSPackLib.buildAndRegister({
    code: 'NV',
    name: 'Nevada',
    year: 2026,
    source: 'NDOW 2026-27 eRegulations Mule Deer Hunts (updated May 27, 2026)',
    agency: 'Nevada Department of Wildlife',
    agencyUrl: 'https://www.ndow.org/hunt/',
    lawUrl: 'https://www.eregulations.com/nevada/hunting/big-game/mule-deer-hunts',
    mapUrl: 'https://www.ndow.org/blog/hunt-unit-boundaries/',
    huntUnitGis: GIS,
    huntUnitWhere: "HUNTUNIT IS NOT NULL AND (SYMBOL IS NULL OR SYMBOL <> 'Closed')",
    unitField: 'HUNTUNIT',
    unitNameField: 'HUNTUNIT',
    outFields: 'HUNTUNIT,MANAGEUNIT,SYMBOL,CLOSED,Deer,OBJECTID',
    unitLabel: 'Hunt unit',
    overlayFoldLabel: 'NDOW hunt units',
    confirmLabel: 'NDOW 2026-27 big game seasons',
    minUnitCache: 100,
    hasBlm: true,
    wma: {
      url: WMA, where: '1=1',
      outFields: 'WMA_NAME1,WMA_CODE,LandName,County,LEGALACRES,OBJECTID',
      nameFields: ['WMA_NAME1', 'LandName'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: norm,
    regionForUnit: regionOf,
    regionOrder: ['N', 'E', 'S'],
    regionColors: { N: '#e0913c', E: '#5b8def', S: '#2f9e4f' },
    regionNames: {
      N: 'Units 011-091 (northwest / north)',
      E: 'Units 101-195 (east / central)',
      S: 'Units 201+ (south)'
    },
    areas: {},
    seasons: [
      { areas: ARCH_EARLY, type: 'Archery', arch: ['2026-08-10', '2026-09-09'], land: 'Either', target: 'Antlered mule deer (draw)', limit: 'Typical archery Aug 10-Sep 9, 2026. Unit 021 is December-only (separate row). Draw tag required. ' + NOTE },
      { areas: NO_EARLY_ARCH, type: 'Archery', arch: ['2026-12-01', '2026-12-10'], land: 'Either', target: 'Antlered mule deer (draw)', limit: 'Unit 021 archery Dec 1-10, 2026. ' + NOTE },
      { areas: MUZ_EARLY, type: 'Muzzleloader', muzzle: ['2026-09-10', '2026-09-30'], land: 'Either', target: 'Antlered mule deer (draw)', limit: 'Typical muzzleloader overlap Sep 10-30, 2026 (many groups run through Oct 4). Nov/Dec-only muzzle units excluded. Draw tag required. ' + NOTE },
      { areas: GUN_EARLY, type: 'Firearm', gun: ['2026-10-05', '2026-10-16'], land: 'Either', target: 'Antlered mule deer (draw)', limit: 'Early any-legal overlap Oct 5-16, 2026 (shortest shared early window). Later splits omitted. Units with Nov/Dec-only rifle have no gun row. ' + NOTE }
    ],
    extraVsAlabama: ['Draw-only mule deer', 'Conservative early overlap', 'NDOW WMAs'],
    accuracyNotes: [
      'Dates from official NDOW 2026-27 eRegulations mule-deer hunt tables (updated May 27, 2026).',
      'GIS is NDOW Game Management Units (129 polygons, HUNTUNIT).',
      'Archery Aug 10-Sep 9 is encoded on listed units (not 021). Unit 021 is December archery only.',
      'Muzzleloader uses Sep 10-30 so units that close Sep 30 never show Oct 1-4 open.',
      'Rifle is overlap Oct 5-16 on units that have an October hunt. Nov/Dec-only units have no gun row. Extra late-split days omitted.',
      'Every hunt is a draw quota. A hunter without that tag will still see the window if the unit is in the list.',
      'No white-tailed general season.'
    ]
  });
})();
