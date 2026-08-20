/* Massachusetts deer pack — MassWildlife 2026 season summary + official WMZ GIS (15 polygons).
 * Sundays closed. Early/winter seasons are WMZ 13-14 only.
 */
(function () {
  var GIS = 'https://services1.arcgis.com/7iJyYTjCtKsZS1LR/arcgis/rest/services/WildlifeManagementZones/FeatureServer/0/query';
  var WMA = 'https://services1.arcgis.com/7iJyYTjCtKsZS1LR/arcgis/rest/services/MassWildlifeLands/FeatureServer/0/query';
  var ids = ['1','2','3','4N','4S','5','6','7','8','9','10','11','12','13','14'];
  var areas = {};
  ids.forEach(function (id) { areas[id] = { n: id, name: 'WMZ ' + id, region: 'U' }; });
  var ISL = ['13','14'];
  var NOTE = 'MassWildlife 2026 hunting season summary. Sundays closed. Confirm mass.gov deer hunting regulations.';
  window.RSPackLib.buildAndRegister({
    code: 'MA',
    name: 'Massachusetts',
    year: 2026,
    source: 'MassWildlife 2026 hunting and freshwater fishing season summary',
    agency: 'Massachusetts Division of Fisheries and Wildlife',
    agencyUrl: 'https://www.mass.gov/info-details/deer-hunting-regulations',
    lawUrl: 'https://www.mass.gov/info-details/2026-hunting-and-freshwater-fishing-season-summary',
    mapUrl: 'https://www.mass.gov/info-details/wildlife-management-zone-map',
    huntUnitGis: GIS,
    unitField: 'DMZ',
    unitNameField: 'DMZ',
    outFields: 'DMZ,ACRES,SQ_MILES',
    unitLabel: 'WMZ',
    overlayFoldLabel: 'Wildlife management zones',
    confirmLabel: 'MassWildlife 2026 season summary',
    minUnitCache: 10,
    hasBlm: false,
    wma: {
      url: WMA, where: "F_TYPE2='WMA'",
      outFields: 'SITE_NAME,F_TYPE2,DISTRICT,OBJECTID',
      nameFields: ['SITE_NAME'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: function (id) {
      var s = String(id == null ? '' : id).toUpperCase().replace(/^WMZ\s+/, '').replace(/^ZONE\s+/, '');
      if (s === '4NORTH' || s === '4N') return '4N';
      if (s === '4SOUTH' || s === '4S') return '4S';
      return s;
    },
    regionOrder: ['U'],
    regionColors: { U: '#5b8def' },
    regionNames: { U: 'Massachusetts WMZ 1–14' },
    areas: areas,
    seasons: [
      { areas: ids, type: 'Archery', arch: ['2026-10-05', '2026-11-28'], land: 'Either', target: 'Deer', limit: 'Archery WMZ 1-14 Oct 5-Nov 28, 2026. Sundays closed. ' + NOTE },
      { areas: ids, type: 'Firearm', gun: ['2026-11-30', '2026-12-12'], land: 'Either', target: 'Deer', limit: 'Shotgun Nov 30-Dec 12, 2026. ' + NOTE },
      { areas: ids, type: 'Primitive', muzzle: ['2026-12-14', '2026-12-31'], land: 'Either', target: 'Deer', limit: 'Primitive firearms Dec 14-31, 2026. ' + NOTE },
      { areas: ISL, type: 'Early', arch: ['2026-09-21', '2026-10-01'], land: 'Either', target: 'Deer', limit: 'Early deer WMZ 13-14 Sep 21-Oct 1, 2026. ' + NOTE },
      { areas: ids, type: 'Youth', gun: ['2026-10-03', '2026-10-03'], land: 'Either', target: 'Deer', limit: 'Youth deer hunt day Oct 3, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['WMZ 1-14 with 4N/4S split', 'Sunday hunting prohibited', 'Island early season 13-14'],
    accuracyNotes: [
      'Official Mass.gov 2026 deer dates (no printed digest).',
      'Sundays closed — not weekday-filtered in the engine.',
      'Winter deer Jan 1-Feb 14 on WMZ 13-14 was printed as 2026 (end of prior season) and is omitted for fall 2026.',
      'GIS DMZ is 4N/4S not 4.'
    ]
  });
})();
