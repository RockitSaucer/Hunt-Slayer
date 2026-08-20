/* Tennessee deer pack — official TWRA 2026-27 deer page + TIGER counties (Units 1-6).
 * Calendar is statewide; units change antlerless bag, not method dates.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'TWRA 2026-27 deer page. Dates are statewide; Units 1-3 vs 4-6 change antlerless bag, not the calendar. August hunt is private land + listed Unit 1 WMAs only. Confirm tn.gov/twra.';

  var U1 = ['BENTON','CARROLL','CHESTER','CROCKETT','DECATUR','DYER','FAYETTE','GIBSON','HARDEMAN','HARDIN','HAYWOOD','HENDERSON','HENRY','LAUDERDALE','LAKE','MADISON','MCNAIRY','OBION','SHELBY','TIPTON','WEAKLEY'];
  var U2 = ['CHEATHAM','DAVIDSON','DICKSON','GILES','HICKMAN','HOUSTON','HUMPHREYS','LAWRENCE','LINCOLN','LEWIS','MARSHALL','MAURY','MONTGOMERY','PERRY','ROBERTSON','STEWART','SUMNER','WAYNE','WILLIAMSON'];
  var U3 = ['BEDFORD','CANNON','CLAY','COFFEE','DEKALB','FRANKLIN','JACKSON','MACON','MOORE','OVERTON','PUTNAM','RUTHERFORD','SMITH','TROUSDALE','VAN BUREN','WARREN','WHITE','WILSON'];
  var U4 = ['ANDERSON','BLEDSOE','CAMPBELL','CLAIBORNE','CUMBERLAND','FENTRESS','GRAINGER','GRUNDY','HANCOCK','MORGAN','PICKETT','SCOTT','SEQUATCHIE','UNION'];
  var U5 = ['BRADLEY','HAMILTON','LOUDON','KNOX','MARION','MCMINN','MEIGS','RHEA','ROANE'];
  var U6 = ['BLOUNT','CARTER','COCKE','GREENE','HAMBLEN','HAWKINS','JEFFERSON','JOHNSON','MONROE','POLK','SEVIER','SULLIVAN','UNICOI','WASHINGTON'];

  function unitOf(id) {
    var s = String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    if (U1.indexOf(s) !== -1) return '1';
    if (U2.indexOf(s) !== -1) return '2';
    if (U3.indexOf(s) !== -1) return '3';
    if (U4.indexOf(s) !== -1) return '4';
    if (U5.indexOf(s) !== -1) return '5';
    if (U6.indexOf(s) !== -1) return '6';
    return 'U';
  }

  window.RSPackLib.buildAndRegister({
    code: 'TN',
    name: 'Tennessee',
    year: 2026,
    source: 'TWRA Deer Season Dates page (2026-27 table)',
    agency: 'Tennessee Wildlife Resources Agency',
    agencyUrl: 'https://www.tn.gov/twra/hunting/big-game/deer.html',
    lawUrl: 'https://www.tn.gov/twra/hunting/tennessee-hunting-seasons-summary.html',
    mapUrl: 'https://www.tn.gov/twra/hunting/big-game/deer.html',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='47'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Deer units (by county)',
    confirmLabel: 'TWRA 2026-27 deer seasons',
    minUnitCache: 90,
    hasBlm: false,
    wma: {
      url: 'https://services3.arcgis.com/PWXNAH2YKmZY7lBq/arcgis/rest/services/HuntingAllowed/FeatureServer/0/query',
      where: '1=1',
      outFields: 'NAME,MANAGEMENT,ACRES,REGION,HUNT,OBJECTID',
      nameFields: ['NAME'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA',
      notes: 'TWRA hunting-allowed lands. WMA dates can differ from statewide unit dates.'
    },
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    },
    regionForUnit: unitOf,
    regionOrder: ['1', '2', '3', '4', '5', '6'],
    regionColors: { '1': '#e0913c', '2': '#5b8def', '3': '#2f9e4f', '4': '#a78bfa', '5': '#c45c26', '6': '#0ea5e9' },
    regionNames: {
      '1': 'Unit 1 (west)',
      '2': 'Unit 2',
      '3': 'Unit 3',
      '4': 'Unit 4',
      '5': 'Unit 5',
      '6': 'Unit 6 (east)'
    },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-26', '2026-10-30'], land: 'Either', target: 'Deer', limit: 'Archery Sept 26-Oct 30, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-11-02', '2026-11-06'], land: 'Either', target: 'Deer', limit: 'Archery Nov 2-6, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-11-07', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Muzzleloader/archery Nov 7-20, 2026. Straight-wall rifles private land only Nov 14-20. ' + NOTE },
      { areas: 'ALL', type: 'Gun', gun: ['2026-11-21', '2027-01-03'], land: 'Either', target: 'Deer', limit: 'Gun/muzzleloader/archery Nov 21, 2026-Jan 3, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-31', '2026-11-01'], land: 'Either', target: 'Deer', limit: 'Young sportsman Oct 31-Nov 1, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Youth', gun: ['2027-01-09', '2027-01-10'], land: 'Either', target: 'Deer', limit: 'Young sportsman Jan 9-10, 2027. ' + NOTE, youthOnly: true },
      { areas: U1, type: 'August', arch: ['2026-08-28', '2026-08-30'], land: 'Private', target: 'Antlered deer', limit: 'August archery Aug 28-30, 2026. Private land and listed Unit 1 WMAs only. No antlerless. ' + NOTE }
    ],
    extraVsAlabama: ['Six county DMUs; statewide calendar', 'August velvet hunt private + listed Unit 1 WMAs'],
    accuracyNotes: [
      'Dates from official TWRA deer page 2026-27 table.',
      'Overlay is Census TIGER counties mapped to official Unit 1-6 county lists. No official DMU FeatureServer used.',
      'August hunt is also open on listed Unit 1 WMAs — those public tracts will not show the August window (Private land only).',
      'WMA dates can differ and are not encoded.',
      'Antlerless bag (Units 1-3 vs 4-6) is a bag rule, not a closed calendar.'
    ]
  });
})();
