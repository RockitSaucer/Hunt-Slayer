/* Indiana deer pack — 2026-27 DNR season sheet + county GIS.
 * DRZ extra Sep 15-Jan 31 is named zones only — not applied statewide.
 */
(function () {
  var GIS = 'https://gisdata.in.gov/server/rest/services/Hosted/County_Boundaries_of_Indiana_Current/FeatureServer/0/query';
  var LAND = 'https://gisdata.in.gov/server/rest/services/Hosted/ManagedLands_DNR_Open/FeatureServer/0/query';
  var NOTE = 'Indiana 2026-27 Hunting & Trapping Guide. DRZ extra season is named reduction zones only (not statewide). Marion County may be missing from the GIO county layer. Confirm in.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'IN',
    name: 'Indiana',
    year: 2026,
    source: 'Indiana April 2026 – March 2027 Hunting & Trapping Seasons + 2026-27 guide',
    agency: 'Indiana DNR Division of Fish & Wildlife',
    agencyUrl: 'https://www.in.gov/dnr/fish-and-wildlife/wildlife-resources/animals/white-tailed-deer/',
    lawUrl: 'https://www.in.gov/dnr/fish-and-wildlife/files/fw-hunting_trapping_seasons.pdf',
    mapUrl: 'https://www.eregulations.com/indiana/hunting/',
    huntUnitGis: GIS,
    unitField: 'name',
    unitNameField: 'name',
    outFields: 'name,fips,cnty_fips',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties',
    confirmLabel: 'Indiana DNR 2026-27 seasons',
    minUnitCache: 80,
    hasBlm: false,
    wma: {
      url: LAND, where: '1=1',
      outFields: 'unitname,subunit,acres,OBJECTID',
      nameFields: ['unitname', 'subunit'],
      label: 'DNR managed land', short: 'DNR land', typeLabel: 'DNR land'
    },
    extraToggles: [{ key: 'wma', color: '#e59a18', text: '#111', label: 'DNR land', title: 'Indiana DNR open managed lands' }],
    normalizeUnitId: function (id) { return String(id == null ? '' : id); },
    regionOrder: ['U'],
    regionColors: { U: '#2f9e4f' },
    regionNames: { U: 'Indiana counties' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Youth', gun: ['2026-09-26', '2026-09-27'], land: 'Either', target: 'Deer', limit: 'Youth Sep 26-27, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-01', '2027-01-03'], land: 'Either', target: 'Deer', limit: 'Archery Oct 1, 2026-Jan 3, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-14', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Firearms Nov 14-29, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-12-05', '2026-12-20'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Dec 5-20, 2026. ' + NOTE }
    ],
    extraVsAlabama: ['County antlerless bag limits (CABL)', 'Deer Reduction Zones extra season not applied statewide', 'Porter County DRZ suspended 2026-27'],
    accuracyNotes: [
      'Official 2026-27 DNR season sheet.',
      'DRZ Sep 15-Jan 31 is NOT statewide — omitted so non-DRZ land never shows extra firearms.',
      'GIO county layer count 91 (Marion missing).',
      'Many FWAs ban firearm antlerless — not encoded.'
    ]
  });
})();
