/* Maryland deer pack — official eRegulations 2026-27 deer seasons (updated June 12, 2026) + TIGER counties.
 * Washington County is split by highway; pack treats the whole county as Region A (conservative).
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'Maryland DNR 2026-27 deer seasons (eRegulations last updated June 12, 2026). Sunday hunting is county-listed and not weekday-filtered. Washington County split is treated as Region A. Confirm dnr.maryland.gov.';
  var A = ['ALLEGANY', 'GARRETT', 'WASHINGTON'];
  var B = ['ANNE ARUNDEL','BALTIMORE','CALVERT','CAROLINE','CARROLL','CECIL','CHARLES','DORCHESTER','FREDERICK','HARFORD','HOWARD','KENT','MONTGOMERY','PRINCE GEORGE\'S','PRINCE GEORGES','QUEEN ANNE\'S','QUEEN ANNES','ST. MARY\'S','ST MARYS','SAINT MARYS','SOMERSET','TALBOT','WICOMICO','WORCESTER'];

  function reg(id) {
    var s = String(id == null ? '' : id).toUpperCase()
      .replace(/\s+COUNTY$/, '').replace(/'/g, '');
    if (s === 'ALLEGANY' || s === 'GARRETT' || s === 'WASHINGTON') return 'A';
    return 'B';
  }

  window.RSPackLib.buildAndRegister({
    code: 'MD',
    name: 'Maryland',
    year: 2026,
    source: 'Maryland eRegulations Deer Seasons & Bag Limits (updated June 12, 2026)',
    agency: 'Maryland Department of Natural Resources',
    agencyUrl: 'https://dnr.maryland.gov/wildlife/pages/hunt_trap/home.aspx',
    lawUrl: 'https://www.eregulations.com/maryland/hunting/deer-seasons-bag-limits',
    mapUrl: 'https://www.eregulations.com/maryland/hunting/deer-seasons-bag-limits',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='24'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties (Region A/B)',
    confirmLabel: 'Maryland 2026-27 Guide to Hunting and Trapping',
    minUnitCache: 20,
    hasBlm: false,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '').replace(/'/g, '');
    },
    regionForUnit: reg,
    regionOrder: ['A', 'B'],
    regionColors: { A: '#64748b', B: '#5b8def' },
    regionNames: {
      A: 'Region A (Allegany, Garrett, Washington conservative)',
      B: 'Region B'
    },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-11', '2026-10-21'], land: 'Either', target: 'Deer', limit: 'Archery Sept 11-Oct 21, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-25', '2026-11-27'], land: 'Either', target: 'Deer', limit: 'Archery Oct 25-Nov 27, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-12-14', '2026-12-18'], land: 'Either', target: 'Deer', limit: 'Archery Dec 14-18, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2027-01-03', '2027-01-07'], land: 'Either', target: 'Deer', limit: 'Archery Jan 3-7, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2027-01-11', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Archery Jan 11-31, 2027. ' + NOTE },
      { areas: A, type: 'Archery', arch: ['2027-01-08', '2027-01-10'], land: 'Either', target: 'Deer', limit: 'Region A extra archery Jan 8-10, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-10-22', '2026-10-24'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Oct 22-24, 2026. Region A: only one deer total these days. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-12-19', '2027-01-02'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Dec 19, 2026-Jan 2, 2027 (Region A antlerless starts Dec 26 — leftover). ' + NOTE },
      { areas: B, type: 'Muzzleloader', muzzle: ['2026-10-26', '2026-10-31'], land: 'Either', target: 'Antlerless deer', limit: 'Region B extra muzzleloader Oct 26-31, 2026 (antlerless). ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-28', '2026-12-12'], land: 'Either', target: 'Deer', limit: 'Firearms Nov 28-Dec 12, 2026. Region A antlerless is Dec 5-12 only (antlered still open). ' + NOTE },
      { areas: B, type: 'Firearm', gun: ['2027-01-08', '2027-01-10'], land: 'Either', target: 'Deer', limit: 'Region B winter firearms Jan 8-10, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-11-14', '2026-11-15'], land: 'Either', target: 'Deer', limit: 'Junior deer hunt Nov 14 statewide; Nov 15 certain counties. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['Region A vs B on county polygons', 'Sunday hunting not weekday-filtered', 'Washington County conservative Region A'],
    accuracyNotes: [
      'Dates from official eRegulations deer seasons page last updated June 12, 2026 (2026-27 tables).',
      'Overlay is Census TIGER counties. Washington County highway split is not drawn — whole county treated as Region A so the west side never gets Region B extra gun Jan 8-10.',
      'East Washington (Region B) therefore misses winter firearms Jan 8-10 — leftover.',
      'Region A antlerless firearms is Dec 5-12; pack shows gun Nov 28-Dec 12 because antlered is still legal those first days.',
      'Region A antlerless muzzleloader late window starts Dec 26; pack uses Dec 19 (antlered).',
      'Primitive hunt days Feb 1-3, 2027 omitted (special equipment).',
      'Sundays closed in many counties — not weekday-filtered.',
      'Sika seasons (Eastern Shore) omitted as a separate species.'
    ]
  });
})();
