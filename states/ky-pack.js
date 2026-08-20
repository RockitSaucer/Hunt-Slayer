/* Kentucky deer pack — KDFWR 2026-27 deer page + official county zone GIS (CURRENTZONE).
 * Season dates are statewide; bag/antlerless rules differ by zone 1-4.
 */
(function () {
  var GIS = 'https://services3.arcgis.com/ghsX9CKghMvyYjBU/arcgis/rest/services/Ky_KDFWR_Annual_Deer_Management_Zones_WM_gdb/FeatureServer/0/query';
  var WMA = 'https://services3.arcgis.com/ghsX9CKghMvyYjBU/arcgis/rest/services/Wildlife_Management_Areas_in_Kentucky/FeatureServer/0/query';
  var NOTE = 'KDFWR 2026-27 deer seasons. Dates are statewide; Zone 4 antlerless cannot be taken during modern gun, early muzzleloader, or the first six days of late muzzleloader. Confirm fw.ky.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'KY',
    name: 'Kentucky',
    year: 2026,
    source: 'KDFWR deer page / Fall Hunting 2026-27 guide',
    agency: 'Kentucky Department of Fish and Wildlife Resources',
    agencyUrl: 'https://fw.ky.gov/Hunt/Pages/Deer.aspx',
    lawUrl: 'https://fw.ky.gov/Hunt/Documents/huntingguideentire.pdf',
    mapUrl: 'https://fw.ky.gov/Hunt/Pages/Deer.aspx',
    huntUnitGis: GIS,
    unitField: 'NAME',
    unitNameField: 'NAME',
    regionField: 'CURRENTZONE',
    outFields: 'NAME,FIPS,CURRENTZONE',
    unitLabel: 'County',
    overlayFoldLabel: 'Deer zones (by county)',
    confirmLabel: 'KDFWR 2026-27 hunting guide',
    minUnitCache: 100,
    hasBlm: false,
    wma: {
      url: WMA, where: "WMA='Yes'",
      outFields: 'AREANAME,Counties,OBJECTID',
      nameFields: ['AREANAME'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: function (id) { return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, ''); },
    regionOrder: ['1', '2', '3', '4'],
    regionColors: { '1': '#e0913c', '2': '#5b8def', '3': '#2f9e4f', '4': '#a78bfa' },
    regionNames: { '1': 'Deer Zone 1', '2': 'Deer Zone 2', '3': 'Deer Zone 3', '4': 'Deer Zone 4' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-05', '2027-01-18'], land: 'Either', target: 'Deer', limit: 'Archery Sep 5, 2026-Jan 18, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-10-17', '2026-10-18'], land: 'Either', target: 'Deer', limit: 'Early muzzleloader Oct 17-18, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-12-12', '2026-12-20'], land: 'Either', target: 'Deer', limit: 'Late muzzleloader Dec 12-20, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-14', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Modern gun Nov 14-29, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Youth', gun: ['2026-10-10', '2026-10-18'], land: 'Either', target: 'Deer', limit: 'Youth-only gun Oct 10-18, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['Four deer zones on county polygons', 'Statewide dates; zone changes bag/antlerless', 'Crossbow Sep 19-Jan 18 mapped as Archery extra if needed'],
    accuracyNotes: [
      'Dates from official KDFWR deer page (2026-27). PDF guide returned 403 from this environment.',
      'Join GIS on CURRENTZONE (not historic DZyyyy columns).',
      'Zone 4 antlerless restriction is a bag rule, not a closed calendar.',
      'CWD antlerless Sep 25-28 is CWD SZ counties only — omitted.'
    ]
  });
})();
