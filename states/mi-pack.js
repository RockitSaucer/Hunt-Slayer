/* Michigan deer pack — official 2026 DNR digest calendar + TIGER counties.
 * Regular archery/firearm are statewide. Dec 4-6 is LP firearm vs UP muzzleloader.
 * Token-gated statewide DMU FeatureServer is not used.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'Michigan DNR 2026 deer regulations (michigan.gov/dnr). Limited Firearms Deer Zone eliminated. Dec 4-6 is firearm in the Lower Peninsula and muzzleloader in the UP. Confirm michigan.gov/Deer.';
  var UP = ['ALGER','BARAGA','CHIPPEWA','DELTA','DICKINSON','GOGEBIC','HOUGHTON','IRON','KEWEENAW','LUCE','MACKINAC','MARQUETTE','MENOMINEE','ONTONAGON','SCHOOLCRAFT'];
  var LP = ['ALCONA','ALLEGAN','ALPENA','ANTRIM','ARENAC','BARRY','BAY','BENZIE','BERRIEN','BRANCH','CALHOUN','CASS','CHARLEVOIX','CHEBOYGAN','CLARE','CLINTON','CRAWFORD','EATON','EMMET','GENESEE','GLADWIN','GRAND TRAVERSE','GRATIOT','HILLSDALE','HURON','INGHAM','IONIA','IOSCO','ISABELLA','JACKSON','KALAMAZOO','KALKASKA','KENT','LAKE','LAPEER','LEELANAU','LENAWEE','LIVINGSTON','MACOMB','MANISTEE','MASON','MECOSTA','MIDLAND','MISSAUKEE','MONROE','MONTCALM','MONTMORENCY','MUSKEGON','NEWAYGO','OAKLAND','OCEANA','OGEMAW','OSCEOLA','OSCODA','OTSEGO','OTTAWA','PRESQUE ISLE','ROSCOMMON','SAGINAW','ST. CLAIR','ST CLAIR','SAINT CLAIR','ST. JOSEPH','ST JOSEPH','SAINT JOSEPH','SANILAC','SHIAWASSEE','TUSCOLA','VAN BUREN','WASHTENAW','WAYNE','WEXFORD'];

  function pen(id) {
    var s = String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    return UP.indexOf(s) !== -1 ? 'UP' : 'LP';
  }

  window.RSPackLib.buildAndRegister({
    code: 'MI',
    name: 'Michigan',
    year: 2026,
    source: 'Michigan DNR 2026 deer regulations / hunting season calendar',
    agency: 'Michigan Department of Natural Resources',
    agencyUrl: 'https://www.michigan.gov/dnr/managing-resources/laws/regulations/deer',
    lawUrl: 'https://www.michigan.gov/dnr/things-to-do/hunting/hunting-season-calendar',
    mapUrl: 'https://www.michigan.gov/dnr/managing-resources/laws/regulations/deer',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='26'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties (UP vs LP)',
    confirmLabel: 'Michigan DNR 2026 deer regulations',
    minUnitCache: 80,
    hasBlm: false,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    },
    regionForUnit: pen,
    regionOrder: ['LP', 'UP'],
    regionColors: { LP: '#5b8def', UP: '#2f9e4f' },
    regionNames: { LP: 'Lower Peninsula', UP: 'Upper Peninsula' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-01', '2026-11-14'], land: 'Either', target: 'Deer', limit: 'Early archery Oct 1-Nov 14, 2026 statewide. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-12-01', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Late archery Dec 1, 2026-Jan 1, 2027 statewide. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-15', '2026-11-30'], land: 'Either', target: 'Deer', limit: 'Regular firearm Nov 15-30, 2026 statewide. ' + NOTE },
      { areas: UP, type: 'Muzzleloader', muzzle: ['2026-12-04', '2026-12-06'], land: 'Either', target: 'Deer', limit: 'UP muzzleloader Dec 4-6, 2026. ' + NOTE },
      { areas: LP, type: 'Firearm', gun: ['2026-12-04', '2026-12-06'], land: 'Either', target: 'Deer', limit: 'December firearm Dec 4-6, 2026 in Lower Peninsula. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-09-12', '2026-09-13'], land: 'Either', target: 'Deer', limit: 'Liberty Hunt Sept 12-13, 2026 (youth ≤16 and qualifying disabilities). ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['UP vs LP December split', 'Statewide DMU GIS token-gated', 'Antlerless extras omitted'],
    accuracyNotes: [
      'Dates from official Michigan DNR 2026 deer regulations / season calendar (NRC approved 2026-05-15).',
      'Overlay is Census TIGER 83 counties. Official statewide DMU FeatureServer is token-gated (499). UP vs LP is a county name list.',
      'December 4-6: LP is any legal firearm; UP is muzzleloader only.',
      'Early antlerless firearm Sept 12-13 and late antlerless Dec 7-Jan 1 (LP except DMUs 145/245) omitted so UP never shows those extra gun days.',
      'Island DMUs 145 / 245 (North Manitou / South Fox) omitted.',
      'Independence Hunt Oct 15-18 (disability permit) omitted.'
    ]
  });
})();
