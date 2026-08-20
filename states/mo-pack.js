/* Missouri deer pack — MDC 2026 Fall Deer and Turkey booklet statewide dates.
 * Hunt units are counties (Census TIGER). Antlerless firearms are select counties — not assigned.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'MDC 2026 Fall Deer and Turkey regulations. Antlerless firearms portions are select counties only and are not assigned here. Confirm the booklet for this county. CWD zone was removed for 2026.';
  window.RSPackLib.buildAndRegister({
    code: 'MO',
    name: 'Missouri',
    year: 2026,
    source: 'MDC 2026 Fall Deer and Turkey Hunting Regulations and Information',
    agency: 'Missouri Department of Conservation',
    agencyUrl: 'https://mdc.mo.gov/hunting-trapping/species/deer',
    lawUrl: 'https://mdc.mo.gov/sites/default/files/2026-06/2026%20FDT_508.pdf',
    mapUrl: 'https://mdc.mo.gov/hunting-trapping/seasons',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='29'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties',
    confirmLabel: 'MDC 2026 Fall Deer and Turkey booklet',
    minUnitCache: 100,
    hasBlm: false,
    normalizeUnitId: function (id) {
      var s = String(id == null ? '' : id);
      if (/county|city/i.test(s)) return s;
      return s + ' County';
    },
    regionOrder: ['U'],
    regionColors: { U: '#e0913c' },
    regionNames: { U: 'Missouri counties' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-15', '2026-11-13'], land: 'Either', target: 'Deer', limit: 'Archery Sep 15-Nov 13, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-11-25', '2027-01-15'], land: 'Either', target: 'Deer', limit: 'Archery Nov 25, 2026-Jan 15, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-24', '2026-10-25'], land: 'Either', target: 'Deer', limit: 'Youth firearms Oct 24-25, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Youth', gun: ['2026-11-27', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Youth firearms Nov 27-29, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-14', '2026-11-24'], land: 'Either', target: 'Deer', limit: 'November firearms portion Nov 14-24, 2026. ' + NOTE },
      { areas: 'ALL', type: 'AltMethods', muzzle: ['2026-12-26', '2027-01-05'], land: 'Either', target: 'Deer', limit: 'Alternative methods (muzzleloader) Dec 26, 2026-Jan 5, 2027. ' + NOTE }
    ],
    extraVsAlabama: ['County seasons (not letter zones)', 'CWD management zone removed for 2026', 'Antler-point restriction removed statewide'],
    accuracyNotes: [
      'Official 2026 FDT booklet statewide dates.',
      'Antlerless firearms Oct 9-11 and Dec 5-13 are SELECT COUNTIES and are omitted so closed counties never show open.',
      'Conservation-area deer hunts override county tables.',
      'Web antlerless maps still showed 2023/2025 filenames — booklet used instead.'
    ]
  });
})();
