/* South Dakota deer pack — official GFP 2026 key dates + TIGER counties.
 * Archery statewide. Firearm East vs West not drawn — conservative overlap only.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'SDGFP 2026 deer seasons (gfp.sd.gov). Firearm is lottery by unit. East River Nov 21-Dec 6 and West River Nov 14-29 — pack uses overlap Nov 21-29 so neither side shows open when closed. Confirm gfp.sd.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'SD',
    name: 'South Dakota',
    year: 2026,
    source: 'SDGFP deer / key dates 2026',
    agency: 'South Dakota Game, Fish and Parks',
    agencyUrl: 'https://gfp.sd.gov/deer/',
    lawUrl: 'https://gfp.sd.gov/events/keydates/',
    mapUrl: 'https://gfp.sd.gov/deer/',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='46'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties (East/West overlap)',
    confirmLabel: 'SDGFP 2026 deer seasons',
    minUnitCache: 60,
    hasBlm: true,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    },
    regionOrder: ['U'],
    regionColors: { U: '#5b8def' },
    regionNames: { U: 'South Dakota (firearm overlap only)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-01', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Archery deer Sept 1, 2026-Jan 1, 2027. License/draw required. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-21', '2026-11-29'], land: 'Either', target: 'Deer (lottery unit)', limit: 'Firearm overlap Nov 21-29, 2026 (West River still open; East River already open). West-only Nov 14-20 and East-only Nov 30-Dec 6 omitted. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-12-01', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Dec 1, 2026-Jan 1, 2027 (draw). ' + NOTE }
    ],
    extraVsAlabama: ['Conservative East/West firearm overlap', 'Black Hills / Custer extra omitted'],
    accuracyNotes: [
      'Archery dates from official GFP key-dates / deer page (Deer Season - Archery 2026: Sept 1, 2026-Jan 1, 2027).',
      'West River firearm Nov 14-29 and East River Nov 21-Dec 6 from official gfp.sd.gov/deer/ season cards.',
      'Overlay is Census TIGER counties. East River / West River / Black Hills unit GIS not wired.',
      'Firearm encoded as overlap only (Nov 21-29) so West counties never show Dec 1-6 open and East counties never show Nov 14-20 open.',
      'Black Hills / Custer Nov 1-30 omitted (separate lottery).',
      'Muzzleloader Dec 1, 2026-Jan 1, 2027 from official GFP key dates. Draw license required.',
      'Firearm is lottery by unit — same leftover class as ND.'
    ]
  });
})();
