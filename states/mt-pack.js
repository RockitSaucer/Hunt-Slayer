/* Montana deer pack — FWP 2026 seasons page + official 2026-27 HD GIS.
 * Statewide summary dates only. HD-specific mule/whitetail, B licenses, and shoulder seasons are NOT fully encoded.
 */
(function () {
  var GIS = 'https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/ADMBND_HD_DEERELKLION/FeatureServer/0/query';
  var WMA = 'https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FWPLND_WMA/FeatureServer/0/query';
  var BACK = ['150','280','316'];
  var NOTE = 'FWP 2026 Deer, Elk, Antelope regulations. These are statewide summary dates. Confirm this hunting district in the 2026 DEA booklet. Many B licenses are private-land only.';
  window.RSPackLib.buildAndRegister({
    code: 'MT',
    name: 'Montana',
    year: 2026,
    source: 'FWP 2026 Deer, Elk, Antelope Hunting Regulations + seasons page',
    agency: 'Montana Fish, Wildlife & Parks',
    agencyUrl: 'https://fwp.mt.gov/hunt/seasons',
    lawUrl: 'https://fwp.mt.gov/binaries/content/assets/fwp/hunt/regulations/2026/2026-dea-regulations-final-with-low-resolution-maps-for-web.pdf',
    mapUrl: 'https://fwp.mt.gov/gis/maps/huntPlanner/',
    huntUnitGis: GIS,
    huntUnitWhere: 'DISTRICT IS NOT NULL',
    unitField: 'DISTRICT',
    unitNameField: 'NAME',
    outFields: 'DISTRICT,NAME',
    unitLabel: 'HD',
    overlayFoldLabel: 'Hunting districts',
    confirmLabel: 'FWP 2026 DEA regulations',
    minUnitCache: 80,
    hasBlm: true,
    wma: {
      url: WMA, where: '1=1',
      outFields: 'NAME,OBJECTID',
      nameFields: ['NAME'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: function (id) { return String(id == null ? '' : id).replace(/^HD\s+/i, ''); },
    regionOrder: ['U'],
    regionColors: { U: '#c026d3' },
    regionNames: { U: 'Montana hunting districts' },
    areas: { '150': { n: '150', name: 'HD 150 (backcountry)', region: 'U' }, '280': { n: '280', name: 'HD 280 (backcountry)', region: 'U' }, '316': { n: '316', name: 'HD 316 (backcountry)', region: 'U' } },
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-05', '2026-10-18'], land: 'Either', target: 'Deer', limit: 'Archery Sep 5-Oct 18, 2026 (HD-specific tags). ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-15', '2026-10-16'], land: 'Either', target: 'Deer', limit: 'Youth deer-only Oct 15-16, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'General', gun: ['2026-10-24', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'General Oct 24-Nov 29 except backcountry HDs 150, 280, 316. ' + NOTE },
      { areas: BACK, type: 'Backcountry', gun: ['2026-09-15', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Backcountry general HDs 150, 280, 316 Sep 15-Nov 29, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-12-12', '2026-12-20'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Dec 12-20, 2026 (confirm HD table). ' + NOTE }
    ],
    extraVsAlabama: ['Hunting districts (139 numbered)', 'Backcountry HDs 150/280/316', 'Extensive BLM', 'Shoulder seasons vary by HD and are not listed'],
    accuracyNotes: [
      'Official FWP 2026 seasons page summary + 2026 DEA PDF.',
      'Not per-HD mule vs whitetail. Shoulder seasons Aug 15-Feb 15 window omitted.',
      'GIS includes reservation/park polygons with null DISTRICT — filtered out.',
      'B licenses often private land only in 2026.'
    ]
  });
})();
