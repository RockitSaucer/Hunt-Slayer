/* Iowa deer pack — DNR 2026-27 regulations PDF p.6 + official county GIS.
 * Resident Zone B is 8 named counties; all others Zone A. Same calendar both zones.
 */
(function () {
  var GIS = 'https://programs.iowadnr.gov/geospatial/rest/services/reference/ManagementBoundaries/MapServer/0/query';
  var HUNT = 'https://services2.arcgis.com/r6iFVcMJeA4kB4GC/arcgis/rest/services/Atlas_Web_Application/FeatureServer/2/query';
  var B = ['CRAWFORD','IDA','LYON','O\'BRIEN','OBRIEN','PLYMOUTH','SHELBY','SIOUX','WOODBURY'];
  var NOTE = 'Iowa 2026-27 Hunting & Trapping Regulations p.6. Zone B is antlered-buck only except youth/disabled/landowner. January antlerless is participating counties only (omitted). Confirm iowadnr.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'IA',
    name: 'Iowa',
    year: 2026,
    source: 'Iowa Hunting & Trapping Regulations 2026-2027 (PDF created 2026-07-27)',
    agency: 'Iowa Department of Natural Resources',
    agencyUrl: 'https://www.iowadnr.gov/things-do/hunting-trapping/iowa-hunting-seasons',
    lawUrl: 'https://www.iowadnr.gov/media/1700/download?inline',
    mapUrl: 'https://www.iowadnr.gov/news-release/2026-07-17/important-changes-heading-2026-2027-hunting-seasons',
    huntUnitGis: GIS,
    unitField: 'unitName',
    unitNameField: 'unitName',
    outFields: 'unitName',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties (Zone A/B)',
    confirmLabel: 'Iowa DNR 2026-27 regulations',
    minUnitCache: 80,
    hasBlm: false,
    wma: {
      url: HUNT, where: '1=1',
      outFields: 'AREA_NAME,Hunt_ID,DEER,OBJECTID',
      nameFields: ['AREA_NAME'],
      label: 'Public hunting area', short: 'Hunt land', typeLabel: 'Hunt land'
    },
    extraToggles: [{ key: 'wma', color: '#e59a18', text: '#111', label: 'Hunt land', title: 'Iowa public hunting areas' }],
    normalizeUnitId: function (id) { return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, ''); },
    regionForUnit: function (id) {
      var s = String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '').replace(/'/g, '');
      return (s === 'CRAWFORD' || s === 'IDA' || s === 'LYON' || s === 'OBRIEN' || s === 'PLYMOUTH' || s === 'SHELBY' || s === 'SIOUX' || s === 'WOODBURY') ? 'B' : 'A';
    },
    regionOrder: ['A', 'B'],
    regionColors: { A: '#5b8def', B: '#e0913c' },
    regionNames: { A: 'Zone A (all other counties)', B: 'Zone B (8 NW counties)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Youth', gun: ['2026-09-19', '2026-10-04'], land: 'Either', target: 'Deer', limit: 'Youth Sep 19-Oct 4, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-01', '2026-12-04'], land: 'Either', target: 'Deer', limit: 'Archery early split Oct 1-Dec 4, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-12-21', '2027-01-10'], land: 'Either', target: 'Deer', limit: 'Archery late split Dec 21, 2026-Jan 10, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-10-17', '2026-10-25'], land: 'Either', target: 'Deer', limit: 'Early muzzleloader Oct 17-25, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-12-21', '2027-01-10'], land: 'Either', target: 'Deer', limit: 'Late muzzleloader Dec 21, 2026-Jan 10, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Gun1', gun: ['2026-12-05', '2026-12-09'], land: 'Either', target: 'Deer', limit: 'Regular gun 1 Dec 5-9, 2026. Some Zone A counties antlered-only this split. ' + NOTE },
      { areas: 'ALL', type: 'Gun2', gun: ['2026-12-12', '2026-12-20'], land: 'Either', target: 'Deer', limit: 'Regular gun 2 Dec 12-20, 2026. ' + NOTE }
    ],
    extraVsAlabama: ['New 2026 resident Zone A/B (8 NW counties)', 'Split regular gun weekends', 'January antlerless omitted (participating counties only)'],
    accuracyNotes: [
      'Official 2026-27 DNR PDF p.6.',
      'No official Zone A/B polygon layer — Zone B is the 8-county name list.',
      'January antlerless (Jan 11-24) omitted so non-participating counties stay closed.',
      'First regular gun antlered-only counties (Audubon, Carroll, Greene + map) not individually closed.'
    ]
  });
})();
