/* Pennsylvania deer pack — PGC 2026-27 seasons & bag limits + PASDA WMU GIS (23 units).
 * Archery is longer in WMUs 2B, 5C, 5D. Flintlock + late archery share Dec 26-Jan 24.
 */
(function () {
  var WMU = 'https://pgcmaps.pa.gov/arcgis/rest/services/PGC/PGC_PUBLIC/MapServer/21/query';
  var SGL = 'https://pgcmaps.pa.gov/arcgis/rest/services/PGC/NEW_PUBLIC/MapServer/17/query';
  var NOTE = 'PGC 2026-27 Seasons and Bag Limits (official pa.gov page). Antlerless needs a WMU antlerless license. Confirm pgc.pa.gov.';
  var EARLY = ['2B', '5C', '5D'];
  window.RSPackLib.buildAndRegister({
    code: 'PA',
    name: 'Pennsylvania',
    year: 2026,
    source: 'PGC Seasons and Bag Limits 2026-27',
    agency: 'Pennsylvania Game Commission',
    agencyUrl: 'https://www.pa.gov/agencies/pgc/huntingandtrapping/regulations/seasons-and-bag-limits',
    lawUrl: 'https://www.pa.gov/agencies/pgc/huntingandtrapping/regulations/seasons-and-bag-limits',
    mapUrl: 'https://www.pa.gov/agencies/pgc/huntingandtrapping/wildlife-management-units/wmu-boundary-maps',
    huntUnitGis: WMU,
    unitField: 'WMU_ID',
    unitNameField: 'WMU_ID',
    outFields: 'WMU_ID,OBJECTID,ACREAGE',
    unitLabel: 'WMU',
    overlayFoldLabel: 'Wildlife Management Units',
    confirmLabel: 'PGC 2026-27 seasons and bag limits',
    minUnitCache: 20,
    hasBlm: false,
    wma: {
      url: SGL, where: '1=1',
      outFields: 'SGL,NAME,PGC_REGION,ACRES,OBJECTID',
      nameFields: ['NAME', 'SGL'],
      label: 'State Game Land', short: 'SGL', typeLabel: 'SGL',
      notes: 'PGC State Game Lands (PASDA 2023). Confirm SGL-specific rules.'
    },
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/^WMU\s+/, '');
    },
    regionOrder: ['E', 'S'],
    regionColors: { E: '#e0913c', S: '#5b8def' },
    regionNames: { E: 'Early-archery WMUs 2B / 5C / 5D', S: 'Statewide archery start Oct 3' },
    regionForUnit: function (id) {
      var s = String(id == null ? '' : id).toUpperCase().replace(/^WMU\s+/, '');
      return (s === '2B' || s === '5C' || s === '5D') ? 'E' : 'S';
    },
    areas: {},
    seasons: [
      { areas: EARLY, type: 'Archery', arch: ['2026-09-19', '2026-11-27'], land: 'Either', target: 'Deer', limit: 'WMUs 2B, 5C, 5D archery Sept 19-Nov 27, 2026. ' + NOTE },
      { areas: EARLY, type: 'Archery', arch: ['2026-12-26', '2027-01-24'], land: 'Either', target: 'Deer', limit: 'WMUs 2B, 5C, 5D late archery Dec 26, 2026-Jan 24, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-03', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Statewide archery Oct 3-Nov 20, 2026 (2B/5C/5D already open earlier). ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-12-26', '2027-01-24'], land: 'Either', target: 'Deer', limit: 'Statewide late archery Dec 26, 2026-Jan 24, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-10-17', '2026-10-25'], land: 'Either', target: 'Antlerless deer', limit: 'Antlerless muzzleloader Oct 17-25, 2026. Antlerless license required. ' + NOTE },
      { areas: 'ALL', type: 'Flintlock', muzzle: ['2026-12-26', '2027-01-24'], land: 'Either', target: 'Deer', limit: 'Flintlock (antlered or antlerless) Dec 26, 2026-Jan 24, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-28', '2026-12-13'], land: 'Either', target: 'Deer', limit: 'Regular firearms Nov 28-Dec 13, 2026. ' + NOTE },
      { areas: EARLY, type: 'ExtFirearm', gun: ['2026-12-26', '2027-01-24'], land: 'Either', target: 'Antlerless deer', limit: 'Extended regular firearms (antlerless) WMUs 2B, 5C, 5D Dec 26, 2026-Jan 24, 2027. ' + NOTE },
      { areas: ['4A', '4C', '4D', '5A'], type: 'ExtFirearm', gun: ['2026-12-26', '2027-01-18'], land: 'Either', target: 'Antlerless deer', limit: 'Extended regular firearms (antlerless) WMUs 4A, 4C, 4D, 5A Dec 26, 2026-Jan 18, 2027. ' + NOTE }
    ],
    extraVsAlabama: ['WMU polygons instead of letter rings', 'Early archery only in 2B/5C/5D', 'Flintlock mapped as Primitive'],
    accuracyNotes: [
      'Dates from official PGC Seasons and Bag Limits page (2026-27 section).',
      'GIS is live PGC WMU layer (22 polygons, field WMU_ID). No 2H in the live service (PASDA 2021 still has 2H).',
      'WMUs 4A/4C/4D/5A extended antlerless firearms: live page once said Jan 18, 2026; PGC final-approval release is Jan 18, 2027 — encoded as 2027.',
      'Special antlerless firearms Oct 22-25 (junior/senior/disabled/military) omitted.',
      'Agricultural deer control Aug 1-Apr 15 omitted.',
      'Sunday hunting rules are not weekday-filtered.'
    ]
  });
})();
