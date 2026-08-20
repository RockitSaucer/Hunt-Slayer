/* Georgia deer pack — 2026-2027 Hunting & Fishing Regulations PDF pp. 12-16 + TIGER counties.
 * Color regions (Yellow/Cyan/Orange/Green/Magenta/Gray) are a printed map, not GIS.
 * Statewide method framework encoded; Magenta SW either-sex through Jan 15 noted.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var WMA = 'https://services6.arcgis.com/9QlSLDqa0P1cHLhu/arcgis/rest/services/WRD_WMA_Public/FeatureServer/14/query';
  var NOTE = 'Georgia 2026-2027 Hunting and Fishing Regulations (PDF, created 2026-08-11). Either-sex days vary by color region/county. Confirm georgiawildlife.com. Do not use stale eRegulations HTML (still 2025-26).';
  var MAGENTA = ['Baker County','Calhoun County','Decatur County','Early County','Grady County','Miller County','Mitchell County','Seminole County','Thomas County'];
  var ARCHERY_ONLY = ['Clayton County','Cobb County','DeKalb County'];
  var EXT = MAGENTA.concat(['Barrow County','Bibb County','Chatham County','Cherokee County','Clarke County','Columbia County','Douglas County','Fayette County','Forsyth County','Fulton County','Gwinnett County','Hall County','Henry County','Muscogee County','Paulding County','Richmond County','Rockdale County']);
  window.RSPackLib.buildAndRegister({
    code: 'GA',
    name: 'Georgia',
    year: 2026,
    source: 'Georgia’s Guide to 2026-2027 Regulations and Seasons (eRegulations PDF)',
    agency: 'Georgia DNR Wildlife Resources Division',
    agencyUrl: 'https://georgiawildlife.com/hunting/hunter-resources',
    lawUrl: 'https://www.eregulations.com/assets/docs/resources/GA/26GAAB-LR2.pdf',
    mapUrl: 'https://georgiawildlife.com/deer-info',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='13'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties',
    confirmLabel: 'Georgia 2026-2027 hunting regulations',
    minUnitCache: 140,
    hasBlm: false,
    wma: {
      url: WMA, where: '1=1',
      outFields: 'PropName,Tract_Name,OBJECTID',
      nameFields: ['PropName', 'Tract_Name'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA'
    },
    normalizeUnitId: function (id) {
      var s = String(id == null ? '' : id);
      if (/county/i.test(s)) return s;
      return s + ' County';
    },
    regionForUnit: function (id) {
      var s = String(id == null ? '' : id);
      if (!/county/i.test(s)) s = s + ' County';
      if (ARCHERY_ONLY.indexOf(s) !== -1) return 'A';
      if (MAGENTA.indexOf(s) !== -1) return 'M';
      if (EXT.indexOf(s) !== -1) return 'X';
      return 'U';
    },
    regionOrder: ['A', 'M', 'X', 'U'],
    regionColors: { A: '#64748b', M: '#c026d3', X: '#e0913c', U: '#2f9e4f' },
    regionNames: {
      A: 'Archery-only (Clayton, Cobb, DeKalb)',
      M: 'Magenta SW (firearms through Jan 15)',
      X: 'Extended archery counties',
      U: 'Statewide method calendar'
    },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-12', '2026-10-09'], land: 'Either', target: 'Deer', limit: 'Archery Sep 12-Oct 9, 2026 (either-sex days vary). ' + NOTE },
      { areas: EXT, type: 'ExtArchery', arch: ['2026-09-12', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Extended archery through Jan 31, 2027 in listed counties. ' + NOTE },
      { areas: 'ALL', type: 'Primitive', muzzle: ['2026-10-10', '2026-10-16'], land: 'Either', target: 'Deer', limit: 'Primitive weapons & youth-only firearms Oct 10-16, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-10-17', '2027-01-10'], land: 'Either', target: 'Deer (either-sex days vary by color region)', limit: 'Firearms Oct 17, 2026-Jan 10, 2027. Clayton/Cobb/DeKalb and Fulton north of GA 92: firearms deer hunting not allowed. ' + NOTE },
      { areas: MAGENTA, type: 'Firearm', gun: ['2026-10-17', '2027-01-15'], land: 'Either', target: 'Deer', limit: 'Magenta SW counties firearms either-sex through Jan 15, 2027. ' + NOTE }
    ],
    extraVsAlabama: ['County color regions instead of letter zones', 'Extended archery in listed counties', 'WMA dates differ from private-land tables'],
    accuracyNotes: [
      'Official 2026-2027 PDF (not the stale eRegulations HTML).',
      'Yellow/Cyan/Orange/Green either-sex DAYS inside firearms season are not encoded — firearms window is the full Oct 17-Jan 10 (over-inclusive on buck-only days).',
      'Clayton/Cobb/DeKalb still receive the statewide firearm window in the engine (ALL) — they should be archery-only. Leftover.',
      'Fulton north of GA 92 firearms ban is a line, not GIS.',
      'Color-region county groups for Yellow/Cyan/Orange taken from the printed map, not a FeatureServer.'
    ]
  });
})();
