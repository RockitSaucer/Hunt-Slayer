/* New Hampshire deer pack — official NHFG 2026 dates page + official deer WMU GIS (20 units).
 * WMU A closes archery Dec 8 and firearms one week early (Nov 29). Either-sex days by WMU are not in the 2026 digest yet.
 */
(function () {
  var WMU = 'https://services8.arcgis.com/hg1B9Egwk1I5p300/arcgis/rest/services/WMU/FeatureServer/1/query';
  var NOTE = 'NH Fish & Game 2026 dates (wildlife.nh.gov). 2026-27 digest either-sex table was not posted as of 2026-08-19. Confirm wildlife.nh.gov.';
  var REST = ['B','C1','C2','D1','D2E','D2W','E','F','G1','G2','H1','H2','I1','I2','J1','J2','K','L','M'];
  window.RSPackLib.buildAndRegister({
    code: 'NH',
    name: 'New Hampshire',
    year: 2026,
    source: 'NH Fish & Game Dates and Seasons / Deer Hunting pages (2026) + NHFG WMU deer layer',
    agency: 'New Hampshire Fish and Game Department',
    agencyUrl: 'https://www.wildlife.nh.gov/hunting-nh/dates-and-seasons',
    lawUrl: 'https://www.wildlife.nh.gov/hunting-nh/deer-hunting-new-hampshire',
    mapUrl: 'https://www.wildlife.nh.gov/hunting-nh/where-hunt/new-hampshire-wildlife-management-units',
    huntUnitGis: WMU,
    unitField: 'WMU',
    unitNameField: 'WMU',
    outFields: 'WMU,ACRES,SQMILES,OBJECTID',
    unitLabel: 'WMU',
    overlayFoldLabel: 'Wildlife Management Units',
    confirmLabel: 'NH Fish & Game 2026 deer seasons',
    minUnitCache: 18,
    hasBlm: false,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/^WMU\s+/, '');
    },
    regionOrder: ['A', 'R'],
    regionColors: { A: '#64748b', R: '#5b8def' },
    regionNames: { A: 'WMU A (earlier close)', R: 'WMUs B–M' },
    regionForUnit: function (id) {
      var s = String(id == null ? '' : id).toUpperCase().replace(/^WMU\s+/, '');
      return s === 'A' ? 'A' : 'R';
    },
    areas: {},
    seasons: [
      { areas: ['A'], type: 'Archery', arch: ['2026-09-15', '2026-12-08'], land: 'Either', target: 'Deer', limit: 'Archery Sept 15-Dec 8, 2026 in WMU A (closes one week early). ' + NOTE },
      { areas: REST, type: 'Archery', arch: ['2026-09-15', '2026-12-15'], land: 'Either', target: 'Deer', limit: 'Archery Sept 15-Dec 15, 2026 in WMUs B-M. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-10-31', '2026-11-10'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Oct 31-Nov 10, 2026 statewide. Either-sex days vary by WMU (2026 digest table not posted). ' + NOTE },
      { areas: ['A'], type: 'Firearm', gun: ['2026-11-11', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Regular firearms Nov 11-29, 2026 in WMU A (closes one week early vs Dec 6). ' + NOTE },
      { areas: REST, type: 'Firearm', gun: ['2026-11-11', '2026-12-06'], land: 'Either', target: 'Deer', limit: 'Regular firearms Nov 11-Dec 6, 2026 in WMUs B-M. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-24', '2026-10-25'], land: 'Either', target: 'Deer', limit: 'Youth deer weekend Oct 24-25, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['Official 20 deer WMUs', 'WMU A earlier close', 'Either-sex table not in 2026 digest yet'],
    accuracyNotes: [
      'Dates from official NHFG dates-and-seasons and deer-hunting pages (2026). The 2026-27 printed digest was not posted as of 2026-08-19 (eRegulations still 2025-26).',
      'GIS is official NHFG deer WMU layer (20 polygons, field WMU). Do not use the 24-polygon base layer (A1/A2 splits) for deer seasons.',
      'Either-sex vs antlered-only days inside muzzleloader and firearms vary by WMU. The 2026 table is not published — not encoded (do not copy 2025).',
      'Town firearm restrictions not encoded.',
      'Special antlerless permits in L/M not encoded.'
    ]
  });
})();
