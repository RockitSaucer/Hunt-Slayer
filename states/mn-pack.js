/* Minnesota deer pack — DNR 2026 deer page + official DPA GIS (130 areas).
 * Firearm A/B series windows encoded; DPA lists from the official deer hunting page.
 */
(function () {
  var GIS = 'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/bdry_deer_permit_areas/MapServer/0/query';
  var WMA = 'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/bdry_dnr_wildlife_mgmt_areas_pub/FeatureServer/0/query';
  var NOTE = 'MN DNR 2026 deer seasons. Confirm hunting_regs.pdf for this DPA. Shotgun-only is local ordinance now, not a statewide zone.';
  var BSE = ['338','341','605','642','643','644','645','646','647','648','649'];
  var areas = { '601': { n: '601', name: 'DPA 601 (metro)', region: 'U' } };
  BSE.forEach(function (id) { areas[id] = { n: id, name: 'DPA ' + id, region: 'U' }; });
  var NOTE2 = NOTE;
  window.RSPackLib.buildAndRegister({
    code: 'MN',
    name: 'Minnesota',
    year: 2026,
    source: 'MN DNR 2026 deer hunting page + seasons calendar',
    agency: 'Minnesota Department of Natural Resources',
    agencyUrl: 'https://www.dnr.state.mn.us/hunting/deer/index.html',
    lawUrl: 'https://www.dnr.state.mn.us/hunting_regs.pdf',
    mapUrl: 'https://www.dnr.state.mn.us/deer_map.pdf',
    huntUnitGis: GIS,
    unitField: 'dpa',
    unitNameField: 'dpa',
    outFields: 'dpa',
    unitLabel: 'DPA',
    overlayFoldLabel: 'Deer permit areas',
    confirmLabel: 'MN DNR 2026 deer seasons',
    minUnitCache: 80,
    hasBlm: false,
    wma: {
      url: WMA, where: '1=1',
      outFields: 'PRTNAME,UNIT_NAME,OBJECTID',
      nameFields: ['PRTNAME', 'UNIT_NAME'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: function (id) { return String(id == null ? '' : id).replace(/^0+/, ''); },
    regionOrder: ['U'],
    regionColors: { U: '#3d7a4a' },
    regionNames: { U: 'Minnesota deer permit areas' },
    areas: areas,
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-19', '2026-12-31'], land: 'Either', target: 'Deer', limit: 'Archery statewide Sep 19-Dec 31, 2026. ' + NOTE2 },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-15', '2026-10-18'], land: 'Either', target: 'Deer', limit: 'Youth Oct 15-18, 2026. ' + NOTE2, youthOnly: true },
      { areas: 'ALL', type: 'FirearmA', gun: ['2026-11-07', '2026-11-15'], land: 'Either', target: 'Deer', limit: 'Conservative firearm A overlap (Nov 7-15). 100-series DPAs stay open through Nov 22 — confirm DNR for this DPA. ' + NOTE2 },
      { areas: BSE, type: 'FirearmB', gun: ['2026-11-21', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Late southeast firearms Season B Nov 21-29, 2026. ' + NOTE2 },
      { areas: ['601'], type: 'FirearmMetro', gun: ['2026-11-07', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Metro DPA 601 Nov 7-29, 2026. ' + NOTE2 },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-11-28', '2026-12-13'], land: 'Either', target: 'Deer', limit: 'Muzzleloader statewide Nov 28-Dec 13, 2026. ' + NOTE2 }
    ],
    extraVsAlabama: ['Deer permit areas (not letter zones)', 'Firearm A vs B by DPA series', 'Statewide archery and muzzleloader'],
    accuracyNotes: [
      'Official 2026 DNR deer page.',
      'Firearm A is encoded as the SHORTER window (Nov 7-15) for all DPAs so 200-series never show open Nov 16-22. 100-series actually run through Nov 22.',
      'Season B encoded only for the exact southeast DPA list on the deer page.',
      'Late CWD Dec 18-20 not encoded.'
    ]
  });
})();
