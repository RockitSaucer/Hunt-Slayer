/* West Virginia deer pack — WVDNR 2026-27 seasons page + TIGER counties.
 * Buck firearms / archery / muzzleloader are statewide; antlerless is selected counties (omitted as extra gun).
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'WVDNR 2026-27 Hunting and Trapping Seasons page. Antlerless split season is selected counties only (not encoded as extra gun). Confirm wvdnr.gov digest pp. 13-18.';
  window.RSPackLib.buildAndRegister({
    code: 'WV',
    name: 'West Virginia',
    year: 2026,
    source: 'WVDNR 2026-2027 Hunting Season Dates page',
    agency: 'West Virginia Division of Natural Resources',
    agencyUrl: 'https://wvdnr.gov/hunting-seasons/',
    lawUrl: 'https://wvdnr.gov/wp-content/uploads/2026/07/Pub_Regs_HuntTrap_202627_DNR_WILD_20260724-1.pdf',
    mapUrl: 'https://wvdnr.gov/hunting/hunting-regulations/',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='54'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties',
    confirmLabel: 'WVDNR 2026-27 Hunting and Trapping Regulations Summary',
    minUnitCache: 50,
    hasBlm: false,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    },
    regionOrder: ['U'],
    regionColors: { U: '#2f9e4f' },
    regionNames: { U: 'West Virginia (statewide deer dates)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-26', '2026-12-31'], land: 'Either', target: 'Deer', limit: 'Deer archery and crossbow Sept 26-Dec 31, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-23', '2026-12-06'], land: 'Either', target: 'Antlered deer (buck firearms)', limit: 'Buck firearms Nov 23-Dec 6, 2026. Antlerless during this window is selected counties only. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-12-14', '2026-12-20'], land: 'Either', target: 'Deer', limit: 'Deer muzzleloader Dec 14-20, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-17', '2026-10-18'], land: 'Either', target: 'Deer', limit: 'Youth / Class Q / Class XS Oct 17-18, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Youth', gun: ['2026-12-26', '2026-12-27'], land: 'Either', target: 'Deer', limit: 'Youth / Class Q / Class XS Dec 26-27, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['Statewide calendar; antlerless is county-listed', 'Mountaineer Heritage winter hunt omitted'],
    accuracyNotes: [
      'Dates from official WVDNR hunting-seasons page (2026-2027 table).',
      'Overlay is Census TIGER counties. Official county-open lists for antlerless live in the digest PDF pp. 13-18 and were not transcribed county-by-county.',
      'Antlerless split (Oct 22-25, Nov 23-Dec 6, Dec 10-13, Dec 28-31) is selected counties — omitted so closed counties never show extra gun days.',
      'Buck firearms is encoded statewide as antlered; selected-county antlerless during that same window is a leftover.',
      'Winter 2027 Mountaineer Heritage (Jan 14-17) omitted (special hunt).',
      'WMA / public-hunting-area dates can differ.'
    ]
  });
})();
