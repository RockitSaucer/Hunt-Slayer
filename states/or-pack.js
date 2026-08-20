/* Oregon deer pack — official 2026 ODFW general western seasons + official WMU GIS.
 * Eastern Oregon is controlled Deer Hunt Areas in 2026 — no general tag. East WMUs draw closed.
 */
(function () {
  var WMU = 'https://nrimp.dfw.state.or.us/arcgis/rest/services/ODFW_Admin/WildlifeManagementUnits/FeatureServer/0/query';
  var NOTE = 'ODFW 2026 big-game seasons (myodfw.com / eRegulations last updated Mar 31, 2026). Western general tag only. Eastern deer is controlled (Deer Hunt Areas, not WMUs). Late western archery omitted. Confirm dfw.state.or.us.';
  var WEST = [10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

  function num(id) {
    var n = parseInt(String(id == null ? '' : id).replace(/^UNIT\s+/i, ''), 10);
    return isNaN(n) ? id : n;
  }
  function regionOf(id) {
    var n = num(id);
    return (typeof n === 'number' && n >= 10 && n <= 30) ? 'W' : 'E';
  }

  window.RSPackLib.buildAndRegister({
    code: 'OR',
    name: 'Oregon',
    year: 2026,
    source: 'ODFW 2026 general season dates + eRegulations Buck Deer Seasons (updated Mar 31, 2026)',
    agency: 'Oregon Department of Fish and Wildlife',
    agencyUrl: 'https://myodfw.com/big-game-hunting/seasons',
    lawUrl: 'https://www.eregulations.com/oregon/hunting/buck-deer-seasons',
    mapUrl: 'https://myodfw.com/articles/maps',
    huntUnitGis: WMU,
    huntUnitWhere: "REGION <> 'NOT MANAGED'",
    unitField: 'UNIT_NUM',
    unitNameField: 'UNIT_NAME',
    regionField: 'REGION',
    outFields: 'UNIT_NUM,UNIT_NAME,REGION,OBJECTID',
    unitLabel: 'WMU',
    overlayFoldLabel: 'Wildlife management units',
    confirmLabel: 'ODFW 2026 Big Game Regulations',
    minUnitCache: 60,
    hasBlm: true,
    normalizeUnitId: num,
    regionForUnit: regionOf,
    regionOrder: ['W', 'E'],
    regionColors: { W: '#2f9e4f', E: '#e0913c' },
    regionNames: {
      W: 'Western Oregon (general tag)',
      E: 'Eastern Oregon (controlled — no general deer tag)'
    },
    areas: {},
    seasons: [
      { areas: WEST, type: 'Archery', arch: ['2026-08-29', '2026-09-27'], land: 'Either', target: 'Buck deer (western general)', limit: 'Western general archery Aug 29-Sep 27, 2026. Late western archery omitted. ' + NOTE },
      { areas: WEST, type: 'Firearm', gun: ['2026-10-03', '2026-11-06'], land: 'Either', target: 'Buck deer (western general)', limit: 'Western any-legal-weapon Oct 3-Nov 6, 2026. Youth extra Nov 7-8 omitted. ' + NOTE },
      { areas: WEST, type: 'Youth', gun: ['2026-10-03', '2026-11-08'], land: 'Either', target: 'Buck deer (youth 12-17)', limit: 'Youth 12-17 may hunt western general through Nov 8, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['West general vs east controlled', '2026 eastern Deer Hunt Areas not drawn (WMU overlay)'],
    accuracyNotes: [
      'Western general dates from official ODFW 2026 seasons page and eRegulations buck deer (updated Mar 31, 2026).',
      'GIS is official ODFW WMU FeatureServer (69 polygons, UNIT_NUM / REGION).',
      'Eastern Oregon 2026 deer hunts are new Deer Hunt Area polygons (controlled). Those areas are not this WMU layer — east WMUs have no general rows (closed on a general tag).',
      'Late western archery (Nov 14-Dec 6 / Nov 21-Dec 13 on listed units) omitted so units without late archery never show open.',
      'White-tailed deer illegal in western units except listed Melrose controlled hunts — leftover (bag, not calendar).',
      'Controlled muzzleloader hunts omitted.',
      'Wildlife-area / WMA dates can differ.'
    ]
  });
})();
