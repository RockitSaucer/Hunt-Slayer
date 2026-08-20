/* New York deer pack — official DEC deer/bear seasons page + official WMU GIS (92 units).
 * Northern vs Southern zone from WMU letter prefix (6P is Southern). Late north bow/muzzle only listed WMUs.
 */
(function () {
  var WMU = 'https://gisservices.dec.ny.gov/arcgis/rest/services/dil/dil_land_activities/MapServer/4/query';
  var NOTE = 'NYSDEC 2026 deer seasons (dec.ny.gov deer-bear/seasons). Confirm the digest. Some Southern WMUs are bow-only (1C, 3S, 4J, 8C).';
  var LATE_N = ['5A', '5G', '5J', '6A', '6C', '6G', '6H'];
  var BOW_ONLY = ['1C', '3S', '4J', '8C'];
  var N = ['5A','5C','5F','5G','5H','5J','5R','5S','5T','6A','6C','6F','6G','6H','6J','6K','6N','6R','6S'];
  var S = ['1A','1C','2A','3A','3C','3F','3G','3H','3J','3K','3M','3N','3P','3R','3S','4A','4B','4C','4F','4G','4H','4J','4K','4L','4O','4P','4R','4S','4T','4U','4W','4Y','4Z','6P','7A','7F','7H','7J','7M','7P','7R','7S','8A','8C','8F','8G','8H','8J','8M','8N','8P','8R','8S','8T','8W','8X','8Y','9A','9C','9F','9G','9H','9J','9K','9M','9N','9P','9R','9S','9T','9W','9X','9Y'];
  var S_GUN = S.filter(function (u) { return BOW_ONLY.indexOf(u) === -1; });

  function zoneOf(id) {
    var s = String(id == null ? '' : id).toUpperCase().replace(/^WMU\s+/, '');
    if (s === '6P') return 'S';
    if (s.charAt(0) === '5' || s.charAt(0) === '6') return 'N';
    return 'S';
  }

  window.RSPackLib.buildAndRegister({
    code: 'NY',
    name: 'New York',
    year: 2026,
    source: 'NYSDEC Deer and Bear Hunting Seasons page',
    agency: 'New York State Department of Environmental Conservation',
    agencyUrl: 'https://dec.ny.gov/things-to-do/hunting/deer-bear/seasons',
    lawUrl: 'https://dec.ny.gov/things-to-do/hunting/hunting-trapping-regulations',
    mapUrl: 'https://dec.ny.gov/things-to-do/hunting/regulations/wildlife-management-units',
    huntUnitGis: WMU,
    unitField: 'UNIT',
    unitNameField: 'UNIT',
    outFields: 'UNIT,UNITSQMILES,OBJECTID',
    unitLabel: 'WMU',
    overlayFoldLabel: 'Wildlife Management Units',
    confirmLabel: 'NYSDEC 2026 deer seasons',
    minUnitCache: 80,
    hasBlm: false,
    wma: {
      url: 'https://services6.arcgis.com/DZHaqZm9cxOD4CWM/arcgis/rest/services/Wildlife_Management_Areas/FeatureServer/17/query',
      where: '1=1',
      outFields: 'WMA,WILDAREA,REGION,WMU,URL,OBJECTID',
      nameFields: ['WMA', 'WILDAREA'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/^WMU\s+/, '');
    },
    regionForUnit: zoneOf,
    regionOrder: ['N', 'S'],
    regionColors: { N: '#5b8def', S: '#e0913c' },
    regionNames: { N: 'Northern Zone', S: 'Southern Zone' },
    areas: {},
    seasons: [
      { areas: N, type: 'NBow', arch: ['2026-09-27', '2026-10-23'], land: 'Either', target: 'Deer', limit: 'Northern bowhunting Sept 27-Oct 23, 2026. ' + NOTE },
      { areas: LATE_N, type: 'NLateBow', arch: ['2026-12-07', '2026-12-13'], land: 'Either', target: 'Deer', limit: 'Northern late bow Dec 7-13, 2026 in WMUs 5A, 5G, 5J, 6A, 6C, 6G, 6H only. ' + NOTE },
      { areas: LATE_N, type: 'NLateMuz', muzzle: ['2026-12-07', '2026-12-13'], land: 'Either', target: 'Deer', limit: 'Northern late muzzleloader Dec 7-13, 2026 in listed WMUs. ' + NOTE },
      { areas: N, type: 'NMuz', muzzle: ['2026-10-17', '2026-10-23'], land: 'Either', target: 'Deer', limit: 'Northern early muzzleloader Oct 17-23, 2026. ' + NOTE },
      { areas: N, type: 'NGun', gun: ['2026-10-24', '2026-12-06'], land: 'Either', target: 'Deer', limit: 'Northern regular season Oct 24-Dec 6, 2026. ' + NOTE },
      { areas: N, type: 'Youth', gun: ['2026-10-10', '2026-10-12'], land: 'Either', target: 'Deer', limit: 'Youth firearms Oct 10-12, 2026. ' + NOTE, youthOnly: true },

      { areas: S, type: 'SBow', arch: ['2026-10-01', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Southern bowhunting Oct 1-Nov 20, 2026. ' + NOTE },
      { areas: ['1C'], type: 'SuffolkBow', arch: ['2026-10-01', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Suffolk WMU 1C regular bow Oct 1, 2026-Jan 31, 2027 (bow-only; special firearms needs extra permit). ' + NOTE },
      { areas: ['3S'], type: 'WestchesterBow', arch: ['2026-10-01', '2026-12-31'], land: 'Either', target: 'Deer', limit: 'Westchester WMU 3S bow Oct 1-Dec 31, 2026 (bow-only). ' + NOTE },
      { areas: S, type: 'SLateBow', arch: ['2026-12-14', '2026-12-22'], land: 'Either', target: 'Deer', limit: 'Southern late bow Dec 14-22, 2026. ' + NOTE },
      { areas: S, type: 'SHolidayBow', arch: ['2026-12-26', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Southern holiday bow Dec 26, 2026-Jan 1, 2027. ' + NOTE },
      { areas: S_GUN, type: 'SMuz', muzzle: ['2026-12-14', '2026-12-22'], land: 'Either', target: 'Deer', limit: 'Southern muzzleloader Dec 14-22, 2026. Not in bow-only WMUs 1C, 3S, 4J, 8C. ' + NOTE },
      { areas: S_GUN, type: 'SHolidayMuz', muzzle: ['2026-12-26', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Southern holiday muzzleloader Dec 26, 2026-Jan 1, 2027. ' + NOTE },
      { areas: S_GUN, type: 'SGun', gun: ['2026-11-21', '2026-12-13'], land: 'Either', target: 'Deer', limit: 'Southern regular firearms Nov 21-Dec 13, 2026. ' + NOTE },
      { areas: S_GUN, type: 'Youth', gun: ['2026-10-10', '2026-10-12'], land: 'Either', target: 'Deer', limit: 'Youth firearms Oct 10-12, 2026. Not in bow-only WMUs. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['WMU polygons; Northern vs Southern calendars', 'Bow-only WMUs leftover on gun rows'],
    accuracyNotes: [
      'Dates from official DEC deer-and-bear seasons page (2026 table in search/snippet + page header). Full HTML table was thin in the fetcher — confirm the live page.',
      'GIS is official DEC WMU layer (92 units, field UNIT). Layer metadata says boundaries begin 2009/2010; confirm no 2026 change.',
      'Northern vs Southern is inferred: units starting with 5 or 6 except 6P = Northern; 6P and 1/2/3/4/7/8/9 = Southern. 6R and 6S are treated as Northern — confirm on the DEC zone map.',
      'Bow-only WMUs 1C, 3S, 4J, 8C are excluded from Southern gun/muzzle/youth.',
      'Early antlerless Sept 12-20 (listed Southern WMUs) omitted.',
      'Westchester / Suffolk / Nassau firearm restrictions not encoded.'
    ]
  });
})();
