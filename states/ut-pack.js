/* Utah deer pack — official DWR 2026 news general-season windows + TIGER counties.
 * General buck deer is statewide by weapon; limited-entry / extended archery not encoded.
 */
(function () {
  var GIS = 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/2026MuleDeerGeneralSeason2/FeatureServer/0/query';
  var NOTE = 'Utah DWR 2026 general-season buck deer (Field Regulations Guidebook 2026.1.2 p.8). Limited-entry and extended-archery omitted. Confirm hunt.utah.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'UT',
    name: 'Utah',
    year: 2026,
    source: 'UDWR 2026 deer/elk hunts news + 2026 Big Game Field Regulations Guidebook p.8',
    agency: 'Utah Division of Wildlife Resources',
    agencyUrl: 'https://wildlife.utah.gov/news/2026/08/14/what-hunters-should-know-for-the-2026-deer-and-elk-hunts',
    lawUrl: 'https://wildlife.utah.gov/guidebooks/field_regs.pdf',
    mapUrl: 'https://hunt.utah.gov/',
    huntUnitGis: GIS,
    unitField: 'boundary_name',
    unitNameField: 'boundary_name',
    outFields: 'boundary_name,hunt_type,season,OBJECTID',
    unitLabel: 'Hunt unit',
    overlayFoldLabel: '2026 general-season deer units',
    confirmLabel: 'Utah DWR 2026 big game guidebook',
    minUnitCache: 25,
    hasBlm: true,
    normalizeUnitId: function (id) { return String(id == null ? '' : id); },
    regionOrder: ['U'],
    regionColors: { U: '#c4a35a' },
    regionNames: { U: 'Utah (general-season windows)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-08-15', '2026-09-11'], land: 'Either', target: 'Buck deer', limit: 'General-season archery buck deer Aug 15-Sept 11, 2026. Extended archery on listed units omitted. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-09-23', '2026-10-01'], land: 'Either', target: 'Buck deer', limit: 'General-season muzzleloader buck deer Sept 23-Oct 1, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-10-17', '2026-10-25'], land: 'Either', target: 'Buck deer', limit: 'General-season any-legal-weapon buck deer Oct 17-25, 2026. ' + NOTE }
    ],
    extraVsAlabama: ['General-season windows only', 'Hunt-unit GIS not wired (Hunt Planner is hunt-number based)'],
    accuracyNotes: [
      'Dates from official UDWR news (Aug 14, 2026): archery begins Aug 15; muzzleloader Sept 23-Oct 1; any legal weapon Oct 17-25. News cites guidebook p.8.',
      'GIS is official UDWR 2026 Mule Deer General Season layer (31 units, field boundary_name, season Fall 2026).',
      'A general-season permit is still unit-based. Pack shows the statewide weapon window on every general unit.',
      'Extended archery (Sept 12 onward on listed urban/valley units) omitted.',
      'Early any-weapon (select units Oct 7-11) omitted.',
      'Limited-entry / CWMU hunts omitted.',
      'HAMSS Nov 7-30 not encoded (not in the news bullet list).'
    ]
  });
})();
