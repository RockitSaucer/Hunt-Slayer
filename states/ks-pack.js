/* Kansas deer pack — KDWP When to Hunt 2026-27 + official DMU GIS (units 1-18; 19 urban separate).
 * Printed 2026-27 summary PDF was not on the regs page at check time — HTML When to Hunt used.
 */
(function () {
  var GIS = 'https://services1.arcgis.com/q2CglofYX6ACNEeu/arcgis/rest/services/Kansas_Deer_Management_Units/FeatureServer/0/query';
  var WA = 'https://services1.arcgis.com/q2CglofYX6ACNEeu/arcgis/rest/services/KDWPT_Wildlife_Areas_view/FeatureServer/0/query';
  var WI = 'https://services1.arcgis.com/q2CglofYX6ACNEeu/arcgis/rest/services/24_25_7_29/FeatureServer/0/query';
  var ids = [];
  for (var i = 1; i <= 18; i++) ids.push('UNIT ' + i);
  ids.push('19');
  var areas = {};
  function ksReg(n) {
    if (['11','12','13','14','15','19'].indexOf(n) !== -1) return 'L';
    if (['4','5','6','7','8','9','10','16'].indexOf(n) !== -1) return 'M';
    if (n === '3') return '3';
    return 'S';
  }
  ids.forEach(function (id) {
    var n = id.replace('UNIT ', '');
    var rg = ksReg(n);
    areas[n] = { n: n, name: 'DMU ' + n, region: rg };
    areas[id] = { n: n, name: 'DMU ' + n, region: rg };
  });
  var WAO_LONG = ['11','12','13','14','15','19'];
  var WAO_MID = ['4','5','6','7','8','9','10','16'];
  var WAO_3 = ['3'];
  var NOTE = 'KDWP When to Hunt (official 2026-27 date table). Printed 2026-27 summary PDF was not posted on the regs page. Confirm ksoutdoors.gov. Extended WAO is unit-specific.';
  window.RSPackLib.buildAndRegister({
    code: 'KS',
    name: 'Kansas',
    year: 2026,
    source: 'KDWP When to Hunt 2026-2028 official date table',
    agency: 'Kansas Department of Wildlife and Parks',
    agencyUrl: 'https://www.ksoutdoors.gov/outdoor-activities/hunting-in-kansas/when-to-hunt',
    lawUrl: 'https://www.ksoutdoors.gov/outdoor-activities/hunting-in-kansas/when-to-hunt',
    mapUrl: 'https://www.ksoutdoors.gov/outdoor-activities/hunting-in-kansas/where-to-hunt/maps',
    huntUnitGis: GIS,
    unitField: 'DMU',
    unitNameField: 'DMU',
    outFields: 'DMU,AreaSQMile',
    unitLabel: 'DMU',
    overlayFoldLabel: 'Deer management units',
    confirmLabel: 'KDWP When to Hunt 2026-27',
    minUnitCache: 15,
    hasBlm: false,
    wma: {
      url: WA, where: "Hunt_Acc='Yes'",
      outFields: 'NAME,MGT_UNIT,OBJECTID',
      nameFields: ['NAME'],
      label: 'Wildlife Area', short: 'WA', typeLabel: 'WA'
    },
    extraLayers: [{
      key: 'walkin', label: 'Walk-In Hunting', typeLabel: 'Walk-In',
      url: WI, where: '1=1',
      outFields: 'AREAID,COUNTY,ACRES,OBJECTID',
      color: '#22c55e', fillOpacity: 0.3, weight: 1.2,
      listMode: 'unit', nameFields: ['AREAID', 'COUNTY'],
      nameSuffix: ' (WIHA)',
      drawOnMap: true, maxOffset: 0.00003,
      notes: 'KDWP WIHA. Service name is stale (24_25) but atlas points at 2026-27. Confirm access.'
    }],
    extraToggles: [
      { key: 'wma', color: '#e59a18', text: '#111', label: 'WA', title: 'KDWP wildlife areas' },
      { key: 'walkin', color: '#22c55e', text: '#111', label: 'WIHA', title: 'Walk-In Hunting Access' }
    ],
    normalizeUnitId: function (id) {
      var s = String(id == null ? '' : id).toUpperCase().replace(/^UNIT\s+/, '').replace(/^DMU\s+/, '');
      var m = s.match(/(\d+)/);
      return m ? m[1] : s;
    },
    regionForUnit: function (id) {
      var n = String(id == null ? '' : id).replace(/^UNIT\s+/i, '').replace(/^DMU\s+/i, '');
      if (['11','12','13','14','15','19'].indexOf(n) !== -1) return 'L';
      if (['4','5','6','7','8','9','10','16'].indexOf(n) !== -1) return 'M';
      if (n === '3') return '3';
      return 'S';
    },
    regionOrder: ['S', '3', 'M', 'L'],
    regionColors: { S: '#64748b', '3': '#5b8def', M: '#e0913c', L: '#2f9e4f' },
    regionNames: {
      S: 'DMUs 1-2, 17-18 (no extra WAO)',
      '3': 'DMU 3 (WAO through Jan 10)',
      M: 'DMUs 4-10 and 16 (WAO through Jan 17)',
      L: 'DMUs 11-15 and 19 (WAO through Jan 24)'
    },
    areas: areas,
    seasons: [
      { areas: 'ALL', type: 'Youth', gun: ['2026-09-05', '2026-09-13'], land: 'Either', target: 'Deer', limit: 'Youth/disabled Sep 5-13, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-09-14', '2026-09-27'], land: 'Either', target: 'Deer', limit: 'Muzzleloader-only Sep 14-27, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-14', '2026-12-31'], land: 'Either', target: 'Deer', limit: 'Regular archery Sep 14-Dec 31, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-12-02', '2026-12-13'], land: 'Either', target: 'Deer', limit: 'Regular firearms Dec 2-13, 2026. ' + NOTE },
      { areas: WAO_3, type: 'WAO', gun: ['2027-01-01', '2027-01-10'], land: 'Either', target: 'Deer (WAO)', limit: 'Extended firearm WAO Unit 3 Jan 1-10, 2027. ' + NOTE },
      { areas: WAO_MID, type: 'WAO', gun: ['2027-01-01', '2027-01-17'], land: 'Either', target: 'Deer (WAO)', limit: 'Extended firearm WAO Units 4-10 and 16 Jan 1-17, 2027. ' + NOTE },
      { areas: WAO_LONG, type: 'WAO', gun: ['2027-01-01', '2027-01-24'], land: 'Either', target: 'Deer (WAO)', limit: 'Extended firearm WAO Units 11-15 and 19 Jan 1-24, 2027. ' + NOTE },
      { areas: ['19'], type: 'Archery', arch: ['2027-01-25', '2027-01-31'], land: 'Either', target: 'Deer (WAO)', limit: 'Extended archery WAO Unit 19 Jan 25-31, 2027. ' + NOTE }
    ],
    extraVsAlabama: ['19 DMUs', 'WIHA walk-in', 'Extended WAO by unit groups', 'Military 4A/8A/10A not in GIS'],
    accuracyNotes: [
      'Dates from official KDWP When to Hunt page, not a 2026 printed digest (that PDF was not posted).',
      'Unit 19 urban is a separate GIS layer — not in the 18-unit FeatureServer. Overlay may miss 19 until that layer is added.',
      'WIHA service name is 24_25_7_29; atlas title is 2026-2027.',
      'Units 1, 2, 17, 18 have no extended WAO.'
    ]
  });
})();
