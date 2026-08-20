/* Ohio deer pack — ODNR Wildlife Council 2026-27 statewide dates + TIGER counties.
 * Seasons are statewide; bag limits / CWD surveillance extras vary by county.
 */
(function () {
  var GIS = 'https://gis.ohiodnr.gov/arcgis/rest/services/DOW_Services/HuntingRegulations_AGOL_3/MapServer/7/query';
  var HUNT = 'https://gis2.ohiodnr.gov/arcgis/rest/services/DOW_Services/DOW_HuntingLands/MapServer/0/query';
  var NOTE = 'ODNR Division of Wildlife 2026-27 (Wildlife Council approved Apr 29, 2026). Dates are statewide. CWD surveillance-area extra archery/gun is omitted. Confirm ohiodnr.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'OH',
    name: 'Ohio',
    year: 2026,
    source: 'ODNR Wildlife Council 2026-27 hunting seasons news release (May 4, 2026)',
    agency: 'Ohio Department of Natural Resources Division of Wildlife',
    agencyUrl: 'https://ohiodnr.gov/buy-and-apply/hunting-fishing-boating/hunting-resources/hunting-regulations',
    lawUrl: 'https://dam.assets.ohio.gov/image/upload/ohiodnr.gov/documents/wildlife/laws-regs-licenses/Ohio%20Hunting%20and%20Trapping%20Regulations%20ENGLISH.pdf',
    mapUrl: 'https://ohiodnr.gov/wps/portal/gov/odnr/discover-and-learn/safety-conservation/about-ODNR/news/ohio-wildlife-council-approves-2026-27-hunting-seasons',
    huntUnitGis: GIS,
    unitField: 'COUNTY',
    unitNameField: 'COUNTY',
    outFields: 'COUNTY,ArcherySeason,GunSeason,MuzzleloaderSeason,County_Bag_Limit,OBJECTID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties (2026-27 deer regs)',
    confirmLabel: 'ODNR 2026-27 Hunting & Trapping Regulations',
    minUnitCache: 80,
    hasBlm: false,
    wma: {
      url: HUNT, where: "hunt_status='OPEN'",
      outFields: 'ALT_NAME,LANDS_NAME,hunt_status,OBJECTID',
      nameFields: ['ALT_NAME', 'LANDS_NAME'],
      label: 'Wildlife Area / public hunting land', short: 'Hunt land', typeLabel: 'Hunt land'
    },
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    },
    regionOrder: ['U'],
    regionColors: { U: '#5b8def' },
    regionNames: { U: 'Ohio (statewide deer dates)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-26', '2027-02-07'], land: 'Either', target: 'Deer', limit: 'Deer archery Sept 26, 2026-Feb 7, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-11-21', '2026-11-22'], land: 'Either', target: 'Deer', limit: 'Youth deer gun Nov 21-22, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Gun', gun: ['2026-11-30', '2026-12-06'], land: 'Either', target: 'Deer', limit: 'Deer gun Nov 30-Dec 6, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Gun', gun: ['2026-12-19', '2026-12-20'], land: 'Either', target: 'Deer', limit: 'Deer gun weekend Dec 19-20, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2027-01-02', '2027-01-05'], land: 'Either', target: 'Deer', limit: 'Deer muzzleloader Jan 2-5, 2027. ' + NOTE }
    ],
    extraVsAlabama: ['Statewide calendar; county bag limits differ', 'CWD surveillance extras not encoded'],
    accuracyNotes: [
      'Dates from official ODNR Wildlife Council news release May 4, 2026 and the 2026-27 regulations PDF snippet.',
      'GIS is official ODNR 2026-27 HuntingRegulations deer-regs layer (107 polygons: counties + DSA township pieces, 2026 dates in attributes).',
      'CWD surveillance-area extra archery (Sept 12, 2026-Feb 7, 2027) and early gun (Oct 10-12, 2026) are omitted so non-DSA counties never show open.',
      'County bag limits (2, 3, or 6) are not encoded.',
      'Wildlife-area-specific closures are not encoded.'
    ]
  });
})();
