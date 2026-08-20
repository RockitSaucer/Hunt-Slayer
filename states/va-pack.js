/* Virginia deer pack — official DWR 2026-27 deer page + TIGER counties/cities.
 * Firearms length splits by county group. Late archery / late muzzleloader vary — conservative where needed.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'Virginia DWR 2026-27 deer regulations (dwr.virginia.gov). Either-sex DAYS inside firearms are not a closed calendar. Public-land (NF/WMA) firearms are often shorter. Confirm dwr.virginia.gov.';

  /* Private-land firearms Nov 14-Dec 12 (western / mountain groups from DWR table). */
  var SHORT_GUN = [
    'BUCHANAN','DICKENSON','WISE','ALLEGHANY','BATH','HIGHLAND','LEE',
    'HENRY','PATRICK','BLAND','RUSSELL','SCOTT','TAZEWELL',
    'AUGUSTA','BOTETOURT','CRAIG','GILES','GRAYSON','ROCKBRIDGE','SMYTH','WASHINGTON',
    'ROCKINGHAM'
  ];
  /* Tidewater cities: firearms Oct 1-Nov 30. Suffolk is split by the Dismal Swamp line — leftover. */
  var COASTAL = ['CHESAPEAKE','VIRGINIA BEACH'];
  /* Private-land firearms Nov 14-Jan 2 (DWR long list). */
  var LONG_GUN = [
    'CAROLINE','KING AND QUEEN','KING WILLIAM','AMELIA','CUMBERLAND','GLOUCESTER','NOTTOWAY',
    'APPOMATTOX','BRUNSWICK','BUCKINGHAM','CHARLOTTE','DINWIDDIE','ESSEX','LUNENBURG','MATHEWS',
    'MECKLENBURG','MIDDLESEX','PRINCE EDWARD','ACCOMACK','ALBEMARLE','AMHERST','ARLINGTON',
    'BEDFORD','CAMPBELL','CARROLL','CHARLES CITY','CHESTERFIELD','CLARKE','CULPEPER','FAIRFAX',
    'FAUQUIER','FLOYD','FLUVANNA','FRANKLIN','FREDERICK','GOOCHLAND','GREENE','GREENSVILLE',
    'HALIFAX','HANOVER','HENRICO','ISLE OF WIGHT','JAMES CITY','KING GEORGE','LANCASTER',
    'LOUDOUN','LOUISA','MADISON','MONTGOMERY','NELSON','NEW KENT','NORTHAMPTON','NORTHUMBERLAND',
    'ORANGE','PAGE','PITTSYLVANIA','POWHATAN','PRINCE GEORGE','PRINCE WILLIAM','PULASKI',
    'RAPPAHANNOCK','RICHMOND','ROANOKE','SHENANDOAH','SOUTHAMPTON','SPOTSYLVANIA','STAFFORD',
    'SUFFOLK','SURRY','SUSSEX','WARREN','WESTMORELAND','WYTHE','YORK'
  ];

  function grp(id) {
    var s = String(id == null ? '' : id).toUpperCase()
      .replace(/\s+COUNTY$/, '').replace(/\s+CITY$/, '').replace(/\s+CITY AND COUNTY$/, '');
    if (COASTAL.indexOf(s) !== -1) return 'C';
    if (SHORT_GUN.indexOf(s) !== -1) return 'W';
    return 'E';
  }

  window.RSPackLib.buildAndRegister({
    code: 'VA',
    name: 'Virginia',
    year: 2026,
    source: 'Virginia DWR Deer Hunting Regulations and Seasons 2026-27',
    agency: 'Virginia Department of Wildlife Resources',
    agencyUrl: 'https://dwr.virginia.gov/hunting/regulations/deer/',
    lawUrl: 'https://dwr.virginia.gov/wp-content/uploads/media/2026-2027-Virginia-Hunting-Trapping-and-Migratory-Game-Bird-Seasons-Guide.pdf',
    mapUrl: 'https://dwr.virginia.gov/hunting/regulations/deer/',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='51'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County / city',
    overlayFoldLabel: 'Counties and cities',
    confirmLabel: 'Virginia DWR 2026-27 deer regulations',
    minUnitCache: 120,
    hasBlm: false,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase()
        .replace(/\s+COUNTY$/, '').replace(/\s+CITY$/, '');
    },
    regionForUnit: grp,
    regionOrder: ['W', 'E', 'C'],
    regionColors: { W: '#64748b', E: '#5b8def', C: '#e0913c' },
    regionNames: {
      W: 'Shorter firearms (Nov 14-Dec 12 private)',
      E: 'Longer firearms (Nov 14-Jan 2 private)',
      C: 'Coastal cities (Oct 1-Nov 30)'
    },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-03', '2026-11-13'], land: 'Either', target: 'Deer', limit: 'Early archery Oct 3-Nov 13, 2026 statewide. Late archery omitted (county exceptions). ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-10-31', '2026-11-13'], land: 'Either', target: 'Deer', limit: 'Early muzzleloader Oct 31-Nov 13, 2026. Not in Chesapeake / Virginia Beach / east-Suffolk (those are in firearms). Late muzzleloader omitted (county exceptions). ' + NOTE },
      { areas: SHORT_GUN, type: 'Firearm', gun: ['2026-11-14', '2026-12-12'], land: 'Either', target: 'Deer', limit: 'Private-land firearms Nov 14-Dec 12, 2026. ' + NOTE },
      { areas: LONG_GUN, type: 'Firearm', gun: ['2026-11-14', '2027-01-02'], land: 'Either', target: 'Deer', limit: 'Private-land firearms Nov 14, 2026-Jan 2, 2027. ' + NOTE },
      { areas: COASTAL, type: 'Firearm', gun: ['2026-10-01', '2026-11-30'], land: 'Either', target: 'Deer', limit: 'Chesapeake / Virginia Beach firearms Oct 1-Nov 30, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-09-26', '2026-09-27'], land: 'Either', target: 'Deer', limit: 'Youth and apprentice weekend Sept 26-27, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['County firearms groups instead of letter rings', 'Public-land NF seasons shorter', 'Either-sex days not encoded'],
    accuracyNotes: [
      'Dates from official DWR deer page 2026-27.',
      'Overlay is Census TIGER counties/cities. Highway splits (Rockingham 613/731, Suffolk Dismal Swamp, Amherst 29) are not drawn.',
      'Rockingham treated as short-gun (west-of-routes conservative). East Rockingham actually has firearms through Jan 2.',
      'Late archery and late muzzleloader omitted — too many private-land exceptions to encode honestly.',
      'Urban / NOVA late archery and antlerless-only firearms omitted.',
      'National Forest firearms are typically Nov 14-28 — pack uses private-land windows. A USFS click in December can over-show gun.',
      'Suffolk is one TIGER polygon; east of Dismal Swamp follows the coastal city table, west follows the long private table.',
      'Early muzzleloader is encoded statewide including Chesapeake/VA Beach (should be closed — they are in firearms then). Leftover.',
      'Either-sex days inside firearms are bag/sex rules, not a closed calendar.'
    ]
  });
})();
