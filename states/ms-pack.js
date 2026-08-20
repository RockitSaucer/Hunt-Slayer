/* Mississippi deer pack — official 2026-27 eRegulations (updated Aug 14, 2026) + TIGER counties.
 * Four DMUs. Highway splits (I-55/I-20/US 61/US 84/MS 35) are not drawn.
 * North Central = 6 whole counties. SE-core = coastal whole counties. Rest = conservative overlap.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'MDWFP 2026-27 deer seasons (eRegulations last updated Aug 14, 2026). WMA dates differ (WMAs are not Open Public Land). Confirm mdwfp.com.';

  var NC = ['ALCORN','BENTON','DESOTO','DE SOTO','MARSHALL','TATE','TIPPAH'];
  var SE = ['HANCOCK','HARRISON','JACKSON','GEORGE','GREENE','STONE','PEARL RIVER','PERRY','FORREST','LAMAR','MARION','WALTHALL'];

  function norm(id) {
    return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '').replace(/\./g, '');
  }
  function regionOf(id) {
    var s = norm(id);
    if (NC.indexOf(s) !== -1) return 'NC';
    if (SE.indexOf(s) !== -1) return 'SE';
    return 'H';
  }

  window.RSPackLib.buildAndRegister({
    code: 'MS',
    name: 'Mississippi',
    year: 2026,
    source: 'MDWFP eRegulations Deer Hunting Seasons (updated Aug 14, 2026)',
    agency: 'Mississippi Department of Wildlife, Fisheries, and Parks',
    agencyUrl: 'https://www.mdwfp.com/wildlife-hunting/',
    lawUrl: 'https://www.eregulations.com/mississippi/hunting/deer-hunting-seasons',
    mapUrl: 'https://www.mdwfp.com/wildlife-hunting/hunting-seasons-and-bag-limits',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='28'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties (NC / SE-core / Hills-Delta conservative)',
    confirmLabel: 'MDWFP 2026-27 hunting seasons',
    minUnitCache: 70,
    hasBlm: false,
    normalizeUnitId: norm,
    regionForUnit: regionOf,
    regionOrder: ['NC', 'H', 'SE'],
    regionColors: { NC: '#5b8def', H: '#e0913c', SE: '#2f9e4f' },
    regionNames: {
      NC: 'North Central (6 whole counties)',
      H: 'Hills / Delta / split (conservative overlap)',
      SE: 'Southeast-core whole counties'
    },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-11', '2026-09-13'], land: 'Private', target: 'Legal buck (velvet, special permit)', limit: 'Velvet archery Sep 11-13, 2026. Special permit. Private and authorized state/federal lands. ' + NOTE },
      { areas: NC, type: 'Archery', arch: ['2026-10-01', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'North Central archery Oct 1-Nov 20, 2026. ' + NOTE },
      { areas: SE, type: 'Archery', arch: ['2026-10-15', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Southeast archery Oct 15-Nov 20, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-15', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Conservative archery overlap Oct 15-Nov 20, 2026 (Hills extra Oct 1-14 omitted on split counties). ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-11-07', '2027-01-31'], land: 'Either', target: 'Deer (youth 15 and under)', limit: 'Youth gun Nov 7, 2026-Jan 31, 2027. ' + NOTE, youthOnly: true },
      { areas: SE, type: 'Youth', gun: ['2027-02-01', '2027-02-15'], land: 'Either', target: 'Legal bucks (youth)', limit: 'Southeast youth gun Feb 1-15, 2027. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Primitive', muzzle: ['2026-11-09', '2026-11-20'], land: 'Private', target: 'Antlerless deer', limit: 'Antlerless primitive weapons Nov 9-20, 2026 (private land). ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-21', '2026-12-01'], land: 'Either', target: 'Deer', limit: 'Guns (dogs allowed) Nov 21-Dec 1, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Primitive', muzzle: ['2026-12-02', '2026-12-15'], land: 'Either', target: 'Deer', limit: 'Primitive weapons Dec 2-15, 2026. Weapon of choice on private land with Primitive permit. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-12-16', '2026-12-23'], land: 'Either', target: 'Deer', limit: 'Guns (no dogs) Dec 16-23, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-12-24', '2027-01-20'], land: 'Either', target: 'Deer', limit: 'Guns (dogs allowed) Dec 24, 2026-Jan 20, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2027-01-21', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Archery/primitive Jan 21-31, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Primitive', muzzle: ['2027-01-21', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Archery/primitive Jan 21-31, 2027. ' + NOTE },
      { areas: SE, type: 'Archery', arch: ['2027-02-01', '2027-02-15'], land: 'Either', target: 'Legal bucks', limit: 'Southeast archery/primitive Feb 1-15, 2027 (legal bucks). ' + NOTE },
      { areas: SE, type: 'Primitive', muzzle: ['2027-02-01', '2027-02-15'], land: 'Either', target: 'Legal bucks', limit: 'Southeast archery/primitive Feb 1-15, 2027 (legal bucks). ' + NOTE }
    ],
    extraVsAlabama: ['NC vs SE-core vs Hills/Delta conservative', 'WMA not Open Public Land'],
    accuracyNotes: [
      'Dates from official eRegulations deer page last updated Aug 14, 2026 (2026-27 column).',
      'No official 4-DMU FeatureServer. Overlay is Census TIGER counties.',
      'North Central is the official 6 whole counties.',
      'Southeast-core is whole counties that sit well south of US 84 and east of MS 35. Highway-split counties (Wayne, Jones, Lincoln, Adams, etc.) go in Hills/Delta/split.',
      'Hills extra archery Oct 1-14 is encoded only on North Central. Split/Hills counties use Oct 15 start so a Southeast sliver never shows open Oct 1-14.',
      'Delta highway line (I-55/I-20/US 61) is not drawn.',
      'Feb 1-15 extra is Southeast only.',
      'WMA calendars differ and are not encoded. WMAs are not Open Public Land.'
    ]
  });
})();
