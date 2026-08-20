/* Oklahoma deer pack — official ODWC 2026-27 deer/big-game season page + TIGER counties.
 * Method dates are statewide; antlerless days / holiday gun vary by zone (holiday omitted).
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'ODWC 2026-27 deer seasons (wildlifedepartment.com). Method dates are statewide. Holiday antlerless gun is zone-listed and omitted. Confirm wildlifedepartment.com.';
  window.RSPackLib.buildAndRegister({
    code: 'OK',
    name: 'Oklahoma',
    year: 2026,
    source: 'ODWC Hunting Seasons / Deer - Big Game Season 2026-27',
    agency: 'Oklahoma Department of Wildlife Conservation',
    agencyUrl: 'https://www.wildlifedepartment.com/hunting/seasons',
    lawUrl: 'https://www.wildlifedepartment.com/hunting/regs/deer-big-game-season',
    mapUrl: 'https://www.wildlifedepartment.com/hunting/regs/deer-big-game-season',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='40'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties',
    confirmLabel: 'ODWC 2026-27 deer seasons',
    minUnitCache: 70,
    hasBlm: true,
    wma: {
      url: 'https://services1.arcgis.com/jRf8jjFwxedITdFe/arcgis/rest/services/Public_WMA_Boundaries/FeatureServer/1/query',
      where: '1=1',
      outFields: 'WMANAME,SHORTNAME,WMATYPE,ACRES,OBJECTID',
      nameFields: ['WMANAME', 'SHORTNAME'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    },
    regionOrder: ['U'],
    regionColors: { U: '#e0913c' },
    regionNames: { U: 'Oklahoma (statewide method dates)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-01', '2027-01-15'], land: 'Either', target: 'Deer', limit: 'Deer archery Oct 1, 2026-Jan 15, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-16', '2026-10-18'], land: 'Either', target: 'Deer', limit: 'Youth deer gun Oct 16-18, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-10-24', '2026-11-01'], land: 'Either', target: 'Deer', limit: 'Deer muzzleloader Oct 24-Nov 1, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Gun', gun: ['2026-11-21', '2026-12-06'], land: 'Either', target: 'Deer', limit: 'Deer gun Nov 21-Dec 6, 2026. ' + NOTE }
    ],
    extraVsAlabama: ['Statewide method calendar', 'Holiday antlerless omitted (zone list)'],
    accuracyNotes: [
      'Dates from official ODWC hunting-seasons and deer-big-game-season pages (2026-27).',
      'Overlay is Census TIGER counties. Official antlerless-zone GIS was not wired this pass.',
      'Holiday antlerless gun (Dec 18-31, 2026 on the seasons page) is zone-specific — omitted so closed zones never show extra gun.',
      'Antlerless days inside regular gun/muzzleloader vary by zone — leftover (window is the full method season).',
      'WMA / WMMA dates can differ.'
    ]
  });
})();
