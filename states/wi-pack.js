/* Wisconsin deer pack — official DNR 2026 dates + official DMU GIS.
 * Statewide method calendar. Extended archery (to Jan 31) and metro extra gun omitted.
 */
(function () {
  var DMU = 'https://dnrmaps.wi.gov/arcgis/rest/services/WM_CWD/WM_DMU_MSU_DMZ_Ext/MapServer/2/query';
  var NOTE = 'Wisconsin DNR 2026 deer dates (dnr.wisconsin.gov/topic/hunt/dates). Extended archery to Jan 31 is metro subunits and select farmland counties only — omitted. Confirm the 2026 season-structure map.';
  window.RSPackLib.buildAndRegister({
    code: 'WI',
    name: 'Wisconsin',
    year: 2026,
    source: 'Wisconsin DNR season dates page (2026 deer table)',
    agency: 'Wisconsin Department of Natural Resources',
    agencyUrl: 'https://dnr.wisconsin.gov/topic/hunt/dates',
    lawUrl: 'https://dnr.wisconsin.gov/topic/hunt/deer',
    mapUrl: 'https://widnr.widen.net/s/nbtxfbfxbq/2026-deer-management-units-and-season-structure-map',
    huntUnitGis: DMU,
    unitField: 'DEER_MGMT_UNIT_ID',
    unitNameField: 'DEER_MGMT_UNIT_NAME',
    regionField: 'DEER_MANAGEMENT_ZONE',
    outFields: 'DEER_MGMT_UNIT_ID,DEER_MGMT_UNIT_NAME,DEER_MANAGEMENT_ZONE,METRO_SUBUNIT_NAME,OBJECTID',
    unitLabel: 'DMU',
    overlayFoldLabel: 'Deer management units',
    confirmLabel: 'Wisconsin DNR 2026 deer seasons',
    minUnitCache: 80,
    hasBlm: false,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).replace(/\s+-\s+.*$/, '').trim();
    },
    regionOrder: ['Northern Forest Zone', 'Central Forest Zone', 'Central Farmland Zone', 'Southern Farmland Zone'],
    regionColors: {
      'Northern Forest Zone': '#5b8def',
      'Central Forest Zone': '#2f9e4f',
      'Central Farmland Zone': '#e0913c',
      'Southern Farmland Zone': '#a78bfa'
    },
    regionNames: {
      'Northern Forest Zone': 'Northern Forest Zone',
      'Central Forest Zone': 'Central Forest Zone',
      'Central Farmland Zone': 'Central Farmland Zone',
      'Southern Farmland Zone': 'Southern Farmland Zone'
    },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-12', '2027-01-03'], land: 'Either', target: 'Deer', limit: 'Archery and crossbow Sept 12, 2026-Jan 3, 2027. Metro/select farmland continue to Jan 31 — omitted. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-10', '2026-10-11'], land: 'Either', target: 'Deer', limit: 'Youth deer hunt Oct 10-11, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Gun', gun: ['2026-11-21', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Gun deer Nov 21-29, 2026. Metro subunits continue to Dec 9 — omitted. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-11-30', '2026-12-09'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Nov 30-Dec 9, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Antlerless', gun: ['2026-12-10', '2026-12-13'], land: 'Either', target: 'Antlerless deer', limit: 'Statewide antlerless-only Dec 10-13, 2026. ' + NOTE }
    ],
    extraVsAlabama: ['Official DMU polygons', 'Statewide calendar; metro extras omitted'],
    accuracyNotes: [
      'Dates from official DNR hunt/dates and hunt/deer pages (2026 table).',
      'GIS is official WI DNR DMU layer (111 polygons). Farmland DMU_IDs are county names; forest DMUs are numbers.',
      'Extended archery Sept 12-Jan 31, 2027 (metro + select farmland) omitted so other units never show January archery after Jan 3.',
      'Metro-subunit extra gun Nov 21-Dec 9 omitted.',
      'Holiday antlerless Dec 24-Jan 1, 2027 omitted (not confirmed statewide).',
      'Antlerless authorizations / CWD rules are bag rules, not a closed calendar.'
    ]
  });
})();
