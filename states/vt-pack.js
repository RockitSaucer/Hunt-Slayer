/* Vermont deer pack — official VTFW 2026 seasons page + TIGER counties.
 * Regular / archery / Dec muzzleloader are statewide. Expanded archery is designated zones only (omitted).
 */
(function () {
  var WMU = 'https://anrmaps.vermont.gov/arcgis/rest/services/Open_Data/OPENDATA_ANR_BOUNDARIES_SP_NOCACHE_v2/MapServer/164/query';
  var NOTE = 'Vermont Fish & Wildlife 2026 deer seasons (vtfishandwildlife.com). Expanded archery (Sept 15-30) is designated zones only and omitted. Antlerless in regular season needs a permit. Confirm vtfishandwildlife.com.';
  window.RSPackLib.buildAndRegister({
    code: 'VT',
    name: 'Vermont',
    year: 2026,
    source: 'VTFW Hunting and Trapping Seasons / White-Tailed Deer 2026',
    agency: 'Vermont Fish & Wildlife Department',
    agencyUrl: 'https://www.vtfishandwildlife.com/hunt/hunting-and-trapping-seasons',
    lawUrl: 'https://www.vtfishandwildlife.com/hunt/hunting-and-trapping-opportunities/white-tailed-deer',
    mapUrl: 'https://www.vtfishandwildlife.com/hunt/hunting-and-trapping-opportunities/white-tailed-deer',
    huntUnitGis: WMU,
    unitField: 'BOUNDARY',
    unitNameField: 'BOUNDARY',
    outFields: 'BOUNDARY,ABNAME,OBJECTID',
    unitLabel: 'WMU',
    overlayFoldLabel: 'Wildlife Management Units',
    confirmLabel: 'Vermont Fish & Wildlife 2026 deer seasons',
    minUnitCache: 20,
    hasBlm: false,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/^WMU\s+/, '');
    },
    regionOrder: ['U'],
    regionColors: { U: '#2f9e4f' },
    regionNames: { U: 'Vermont (statewide deer dates)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-01', '2026-12-15'], land: 'Either', target: 'Deer', limit: 'Archery Oct 1-Dec 15, 2026 (one legal buck statewide; antlerless by WMU permit). ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-10-29', '2026-11-01'], land: 'Either', target: 'Antlerless deer', limit: 'October muzzleloader Oct 29-Nov 1, 2026. Antlerless only; muzzleloader license + antlerless permit. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-11-30', '2026-12-13'], land: 'Either', target: 'Deer', limit: 'December muzzleloader Nov 30-Dec 13, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-14', '2026-11-29'], land: 'Either', target: 'Deer', limit: '16-day regular season Nov 14-29, 2026. Antlerless needs a permit. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-11-07', '2026-11-08'], land: 'Either', target: 'Deer', limit: 'Youth and novice weekend Nov 7-8, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['Statewide calendar; WMU permits for antlerless', 'Expanded archery omitted'],
    accuracyNotes: [
      'Dates from official VTFW hunting-and-trapping-seasons and white-tailed deer pages (2026).',
      'GIS is official Vermont ANR WMU layer (21 units, field BOUNDARY). Dates are statewide; WMUs change legal-buck definition and antlerless permits.',
      'Expanded archery Sept 15-30 is designated zones only — omitted.',
      'October muzzleloader is antlerless-permit-only; shown as Primitive so a hunter without the permit still sees the window.',
      'Regular-season antlerless also needs a permit (new for 2026).'
    ]
  });
})();
