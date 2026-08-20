/* Illinois deer pack — 2026-27 IDNR Digest + ISGS county GIS.
 * Firearm/muzzleloader closed in Cook, DuPage, Lake, and Kane east of IL-47 — Kane split not digitized.
 */
(function () {
  var GIS = 'https://data.isgs.illinois.edu/arcgis/rest/services/Reference/County_Boundaries/MapServer/0/query';
  var SITES = 'https://services.arcgis.com/b9DHj1BjfdLLFv11/arcgis/rest/services/IDNR_Site_Boundaries_10_7_25/FeatureServer/0/query';
  var CLOSED = ['COOK','DUPAGE','LAKE'];
  var NOTE = 'IDNR 2026-27 Digest of Hunting and Trapping. Firearm/muzzleloader closed Cook, DuPage, Lake, and Kane east of IL-47. Confirm dnr.illinois.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'IL',
    name: 'Illinois',
    year: 2026,
    source: '2026-2027 Illinois Digest of Hunting and Trapping Regulations',
    agency: 'Illinois Department of Natural Resources',
    agencyUrl: 'https://dnr.illinois.gov/hunting/deerhunting.html',
    lawUrl: 'https://v3-wp.huntillinois.org/wp-content/uploads/2026/08/HuntTrapDigest.pdf',
    mapUrl: 'https://dnr.illinois.gov/hunting/deerfirearmmuzzleloader.html',
    huntUnitGis: GIS,
    unitField: 'COUNTY_NAME',
    unitNameField: 'COUNTY_NAME',
    outFields: 'COUNTY_NAME,CO_FIPS',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties',
    confirmLabel: 'IDNR 2026-27 hunting digest',
    minUnitCache: 90,
    hasBlm: false,
    wma: {
      url: SITES, where: '1=1',
      outFields: 'Name,OBJECTID',
      nameFields: ['Name'],
      label: 'IDNR site', short: 'IDNR', typeLabel: 'IDNR site'
    },
    extraToggles: [{ key: 'wma', color: '#e59a18', text: '#111', label: 'IDNR', title: 'IDNR sites' }],
    normalizeUnitId: function (id) { return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, ''); },
    regionOrder: ['U'],
    regionColors: { U: '#486a2f' },
    regionNames: { U: 'Illinois counties' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-10-01', '2026-11-19'], land: 'Either', target: 'Deer', limit: 'Archery Oct 1-Nov 19, 2026 (firearm counties). Cook/DuPage/Lake/Kane-east stay open through Jan 17. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-11-23', '2026-12-02'], land: 'Either', target: 'Deer', limit: 'Archery Nov 23-Dec 2, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Archery', arch: ['2026-12-07', '2027-01-17'], land: 'Either', target: 'Deer', limit: 'Archery Dec 7, 2026-Jan 17, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-10', '2026-10-12'], land: 'Either', target: 'Deer', limit: 'Youth firearm Oct 10-12, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-20', '2026-11-22'], land: 'Either', target: 'Deer', limit: 'Firearm 1st season Nov 20-22, 2026. Closed Cook/DuPage/Lake/Kane-east. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-12-03', '2026-12-06'], land: 'Either', target: 'Deer', limit: 'Firearm 2nd season Dec 3-6, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-12-11', '2026-12-13'], land: 'Either', target: 'Deer', limit: 'Muzzleloader-only Dec 11-13, 2026 (also valid Dec 3-6 with muzzleloader permit). ' + NOTE }
    ],
    extraVsAlabama: ['County firearm quotas', 'Restricted Archery Zone (Champaign, Douglas, Macon, Piatt) antlered-only Oct 1-31 not enforced as closed', 'CWD/Late Winter extra seasons omitted'],
    accuracyNotes: [
      'Official 2026-27 digest / IDNR pages.',
      'Kane east of IL-47 firearm closure is a line, not GIS — Kane County will show firearm OPEN (over-inclusive on the east side).',
      'Cook/DuPage/Lake still get firearm windows in the engine (ALL) — they should be treated as archery-only; leftover: those three counties incorrectly show firearm OPEN.',
      'Special CWD and Late Winter (Dec 31-Jan 3 and Jan 15-17) omitted pending 2026-27 county lists.'
    ]
  });
})();
