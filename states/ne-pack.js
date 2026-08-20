/* Nebraska deer pack — official NGPC 2026 hunting-seasons page + TIGER counties.
 * Method dates are statewide. Unit buck permits / late antlerless are unit-listed (late omitted).
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'Nebraska Game and Parks 2026 hunting seasons (outdoornebraska.gov). November firearm is a unit-buck permit. Late antlerless and river antlerless omitted. Confirm outdoornebraska.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'NE',
    name: 'Nebraska',
    year: 2026,
    source: 'NGPC Hunting Seasons page 2026',
    agency: 'Nebraska Game and Parks Commission',
    agencyUrl: 'https://outdoornebraska.gov/hunt/hunting-seasons/',
    lawUrl: 'https://outdoornebraska.gov/hunt/game/deer/',
    mapUrl: 'https://outdoornebraska.gov/hunt/game/deer/',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='31'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties (unit permits)',
    confirmLabel: 'NGPC 2026 deer seasons',
    minUnitCache: 80,
    hasBlm: true,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    },
    regionOrder: ['U'],
    regionColors: { U: '#e0913c' },
    regionNames: { U: 'Nebraska (statewide method dates)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-01', '2026-12-31'], land: 'Either', target: 'Deer', limit: 'Archery Sept 1-Dec 31, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-14', '2026-11-22'], land: 'Either', target: 'Deer (unit buck permit)', limit: 'November firearm Nov 14-22, 2026. Requires a unit buck permit. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-12-01', '2026-12-31'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Dec 1-31, 2026. ' + NOTE }
    ],
    extraVsAlabama: ['Statewide method calendar; unit permits for firearm', 'Late antlerless omitted'],
    accuracyNotes: [
      'Dates from official outdoornebraska.gov/hunt/hunting-seasons/ 2026 deer bullets (Archery Sept 1-Dec 31, November firearm Nov 14-22, Muzzleloader Dec 1-31).',
      'Overlay is Census TIGER counties. Official 2026 unit maps are PDFs; 2022 DMU GIS was not used.',
      'November firearm is a unit-buck permit — pack shows the window statewide with that note (same leftover class as ND/CO).',
      'October river antlerless, late antlerless Jan 1-15, 2027, and special landowner Nov 7-9 omitted (unit/permit).'
    ]
  });
})();
