/* California deer pack — official 2026 Deer Seasons by Zone + CDFW BIOS ds342 GIS.
 * https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=168214&inline
 * Additional muzzleloader/either-sex hunts (M/G/J) are NOT in this pack.
 */
(function () {
  var GIS = 'https://services2.arcgis.com/Uq9r85Potqm3MfRV/arcgis/rest/services/biosds342_fpu/FeatureServer/0/query';
  var WA = 'https://services2.arcgis.com/Uq9r85Potqm3MfRV/arcgis/rest/services/biosds3077_fpu/FeatureServer/0/query';
  function add(o, ids, region) {
    ids.forEach(function (id) { o[id] = { n: id, name: 'Zone ' + id, region: region }; });
  }
  var areas = {
    'A (North Unit 160)': { n: 'A-N', name: 'A (North Unit 160)', region: 'A' },
    'A (South Unit 110)': { n: 'A-S', name: 'A (South Unit 110)', region: 'A' }
  };
  add(areas, ['B1','B2','B3','B4','B5','B6'], 'B');
  add(areas, ['C1','C2','C3','C4'], 'C');
  add(areas, ['D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15','D16','D17','D19'], 'D');
  add(areas, ['X1','X2','X3a','X3b','X4','X5a','X5b','X6a','X6b','X7a','X7b','X8','X9a','X9b','X9c','X10','X12'], 'X');
  var A = ['A (North Unit 160)', 'A (South Unit 110)'];
  var B135 = ['B1','B2','B3','B5'];
  var C23 = ['C2','C3'];
  var D345 = ['D3','D4','D5'];
  var D67 = ['D6','D7'];
  var D8910 = ['D8','D9','D10'];
  var D111315 = ['D11','D13','D15'];
  var X17 = ['X1','X2','X3a','X3b','X4','X5a','X5b','X6a','X6b','X7a','X7b'];
  var X810 = ['X8','X10'];
  var X9ab12 = ['X9a','X9b','X12'];
  var NOTE = 'CDFW Approved 2026 Deer Seasons by Zone. General tags are typically buck hunts. Additional M/G/J hunts are not listed. Confirm Title 14 §360 and the 2026 Big Game Digest. Polygons are approximate.';
  function r(areas, typ, arch, gun, extra) {
    var o = { areas: areas, type: typ, land: 'Either', target: extra || 'Deer (typically buck on general/zone tags)', limit: NOTE };
    if (arch) o.arch = arch;
    if (gun) o.gun = gun;
    return o;
  }
  window.RSPackLib.buildAndRegister({
    code: 'CA',
    name: 'California',
    year: 2026,
    source: 'CDFW Approved 2026 Deer Seasons by Zone (NRM 168214)',
    agency: 'California Department of Fish and Wildlife',
    agencyUrl: 'https://wildlife.ca.gov/Hunting/Deer',
    lawUrl: 'https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=168214&inline',
    mapUrl: 'https://wildlife.ca.gov/Hunting/Deer',
    huntUnitGis: GIS,
    unitField: 'Zone_Nam',
    unitNameField: 'Zone_Nam',
    regionField: 'ZONE_LTR',
    outFields: 'ZONE_LTR,Zone_Nam',
    unitLabel: 'Deer Zone',
    overlayFoldLabel: 'Deer hunt zones',
    confirmLabel: 'CDFW 2026 Deer Seasons by Zone',
    lawLabel: 'Approved 2026 Deer Seasons by Zone',
    agencyLabel: 'CDFW — deer hunting',
    wmaNote: 'CDFW wildlife areas. Many require a pass or have hunt-specific dates (G/M/J hunts) not in this pack.',
    minUnitCache: 30,
    hasBlm: true,
    primitiveUsesGun: true,
    wma: {
      url: WA,
      where: '1=1',
      outFields: 'PROP_NAME,OBJECTID',
      nameFields: ['PROP_NAME'],
      label: 'CDFW public access land',
      short: 'CDFW land',
      typeLabel: 'CDFW land'
    },
    extraToggles: [
      { key: 'wma', color: '#e59a18', text: '#111', label: 'CDFW land', title: 'CDFW public-access lands' }
    ],
    normalizeUnitId: function (id) {
      var s = String(id == null ? '' : id);
      if (/north/i.test(s)) return 'A (North Unit 160)';
      if (/south/i.test(s) && /110|A \(South/i.test(s)) return 'A (South Unit 110)';
      var u = s.toUpperCase().replace(/-/g, '').replace(/\s+/g, '');
      var m = u.match(/^([ABCDX])(\d+[ABC]?)/);
      if (!m) return s;
      var z = m[1] + m[2];
      return z.replace(/([0-9])([ABC])$/, function (_, d, l) { return d + l.toLowerCase(); });
    },
    regionOrder: ['A', 'B', 'C', 'D', 'X'],
    regionColors: { A: '#e0913c', B: '#5b8def', C: '#2f9e4f', D: '#a78bfa', X: '#c026d3' },
    regionNames: { A: 'Zone A', B: 'B zones', C: 'C zones', D: 'D zones', X: 'X zones' },
    areas: areas,
    seasons: [
      r(A, 'Archery', ['2026-07-11', '2026-08-02'], null),
      r(A, 'General', null, ['2026-08-08', '2026-09-20']),
      r(B135, 'Archery', ['2026-08-15', '2026-09-06'], null),
      r(B135, 'General', null, ['2026-09-19', '2026-10-25']),
      r(['B4'], 'Archery', ['2026-07-25', '2026-08-16'], null),
      r(['B4'], 'General', null, ['2026-08-22', '2026-09-27']),
      r(['B6'], 'Archery', ['2026-08-15', '2026-09-06'], null),
      r(['B6'], 'General', null, ['2026-09-19', '2026-10-18']),
      r(['C1'], 'Archery', ['2026-08-15', '2026-08-30'], null, 'C-1 archery is Hunt A-1'),
      r(['C1'], 'General', null, ['2026-09-19', '2026-10-18']),
      r(C23, 'Archery', ['2026-08-15', '2026-09-06'], null, 'C-2/C-3 archery is Hunt A-1'),
      r(C23, 'General', null, ['2026-09-19', '2026-10-25']),
      r(['C4'], 'Archery', ['2026-08-15', '2026-08-30'], null, 'C-4 archery is Hunt A-1'),
      r(['C4'], 'General', null, ['2026-09-19', '2026-10-04']),
      r(D345, 'Archery', ['2026-08-15', '2026-09-06'], null),
      r(D345, 'General', null, ['2026-09-26', '2026-11-01']),
      r(D67, 'Archery', ['2026-08-15', '2026-09-06'], null),
      r(D67, 'General', null, ['2026-09-19', '2026-11-01']),
      r(D8910, 'Archery', ['2026-08-15', '2026-09-06'], null),
      r(D8910, 'General', null, ['2026-09-26', '2026-10-25']),
      r(D111315, 'Archery', ['2026-09-05', '2026-09-27'], null),
      r(D111315, 'General', null, ['2026-10-10', '2026-11-08']),
      r(['D12'], 'Archery', ['2026-10-03', '2026-10-25'], null),
      r(['D12'], 'General', null, ['2026-11-07', '2026-11-29']),
      r(['D14'], 'Archery', ['2026-09-05', '2026-09-27'], null),
      r(['D14'], 'General', null, ['2026-10-10', '2026-11-08']),
      r(['D16'], 'Archery', ['2026-09-05', '2026-09-27'], null),
      r(['D16'], 'General', null, ['2026-10-24', '2026-11-22']),
      r(['D17'], 'Archery', ['2026-09-05', '2026-09-27'], null),
      r(['D17'], 'General', null, ['2026-10-10', '2026-11-01']),
      r(['D19'], 'Archery', ['2026-09-05', '2026-09-27'], null),
      r(['D19'], 'General', null, ['2026-10-03', '2026-11-01']),
      r(X17, 'Archery', ['2026-08-15', '2026-09-06'], null, 'X-zone archery is a separate A-hunt; typical window Aug 15-Sep 6'),
      r(X17, 'General', null, ['2026-10-03', '2026-10-18']),
      r(X810, 'Archery', ['2026-08-15', '2026-09-06'], null),
      r(X810, 'General', null, ['2026-09-26', '2026-10-11']),
      r(X9ab12, 'Archery', ['2026-08-15', '2026-09-06'], null),
      r(X9ab12, 'General', null, ['2026-09-19', '2026-10-12']),
      r(['X9c'], 'Archery', ['2026-08-15', '2026-09-06'], null),
      r(['X9c'], 'General', null, ['2026-10-17', '2026-11-08']),
      r(['X10'], 'Archery', ['2026-08-15', '2026-08-30'], null, 'Hunt A-19 X-10 archery Aug 15-30')
    ],
    extraVsAlabama: [
      'A/B/C/D/X zone tags instead of letter seasons',
      'No statewide muzzleloader — extra M hunts not listed',
      'C-zone and X-zone archery are separate hunt codes',
      'Extensive BLM in X zones'
    ],
    accuracyNotes: [
      'Dates from official CDFW Approved 2026 Deer Seasons by Zone PDF.',
      'GIS ds342 metadata still says 2014 mapping; treat borders as approximate vs CCR §360 text.',
      'Additional hunts (G, M, MA, J) and apprentice hunts are not encoded.',
      'General/zone tags treated as typical buck hunts; either-sex only when a special hunt title says so (those hunts omitted).',
      'X-zone archery uses the common A-hunt window Aug 15-Sep 6 except X-10 A-19 (Aug 15-30).'
    ]
  });
})();
