/* North Dakota deer pack — official 2026 proclamation + official deer-unit GIS (38 units).
 * Bow/muzzleloader statewide. Regular gun is lottery by unit + deer type on the license.
 */
(function () {
  var UNITS = 'https://services1.arcgis.com/GOcSXpzwBHyk2nog/arcgis/rest/services/NDGISHUB_Deer_Units/FeatureServer/0/query';
  var WMA = 'https://services1.arcgis.com/GOcSXpzwBHyk2nog/arcgis/rest/services/NDGISHUB_Wildlife_Management_Areas/FeatureServer/0/query';
  var NOTE = 'NDGF 2026-2027 Deer Hunting Proclamation (finalized). Regular gun requires a lottery license for that unit and deer type. Confirm gf.nd.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'ND',
    name: 'North Dakota',
    year: 2026,
    source: 'NDGF 2026 Deer Proclamation / season-dates (Finalized)',
    agency: 'North Dakota Game and Fish Department',
    agencyUrl: 'https://gf.nd.gov/hunting/deer',
    lawUrl: 'https://gf.nd.gov/regulations/deer',
    mapUrl: 'https://gf.nd.gov/gnf/regulations/docs/deer/proc-deer-2026.pdf',
    huntUnitGis: UNITS,
    unitField: 'UNIT_ID',
    unitNameField: 'UNIT_ID',
    regionField: 'REGION',
    outFields: 'UNIT_ID,ACRES,UNIT_TYPE,REGION,OBJECTID',
    unitLabel: 'Deer unit',
    overlayFoldLabel: 'Deer gun units',
    confirmLabel: 'NDGF 2026 deer proclamation',
    minUnitCache: 35,
    hasBlm: true,
    wma: {
      url: WMA, where: '1=1',
      outFields: 'Unit_Name,Acres,COUNTY,OBJECTID',
      nameFields: ['Unit_Name'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/^UNIT\s+/, '');
    },
    regionOrder: ['U'],
    regionColors: { U: '#5b8def' },
    regionNames: { U: 'North Dakota deer units (gun is lottery)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-04', '2027-01-03'], land: 'Either', target: 'Deer', limit: 'Deer bow Sept 4, 2026 (noon)-Jan 3, 2027. Nonresidents private-only first 9.5 days (no PLOTS until Sept 14). ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-09-18', '2026-09-27'], land: 'Either', target: 'Antlerless deer', limit: 'Youth deer Sept 18-27, 2026 (ages 11-13 antlerless). ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Gun', gun: ['2026-11-06', '2026-11-22'], land: 'Either', target: 'Deer (lottery unit + type on license)', limit: 'Deer gun Nov 6 (noon)-Nov 22, 2026. Requires a lottery license for that UNIT_ID and deer type. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-11-27', '2026-12-13'], land: 'Either', target: 'White-tailed deer', limit: 'Muzzleloader Nov 27 (noon)-Dec 13, 2026. White-tailed only; type on license. ' + NOTE }
    ],
    extraVsAlabama: ['Official 38 gun units', 'Gun is lottery by unit, not a general tag', 'PLOTS walk-in not wired (3631 tracts)'],
    accuracyNotes: [
      'Dates from official NDGF 2026 deer proclamation (finalized).',
      'GIS is official NDGISHUB Deer Units (39 polygons / 38 unique UNIT_ID). One extra polygon vs the proclamation ID list.',
      'A hunter without a gun license for that unit will still see the Nov 6-22 window. Confirm the license.',
      'Nonresident bow private-only Sept 4-13 is noted, not land-filtered. PLOTS layer exists but is not in this pack.',
      'Muzzleloader is white-tailed only (mule deer closed).',
      'Units 4B/4C and 4D/4E have a first 2.5-day lock to the assigned unit — not encoded separately.'
    ]
  });
})();
