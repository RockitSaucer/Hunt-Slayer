/* North Carolina deer pack — NCWRC eRegulations deer seasons (updated Aug 18, 2026) + TIGER counties.
 * Zones are county lists from the official 2026-27 table. Game-land dates follow the county unless noted.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var GL = 'https://services1.arcgis.com/YfqBAUM5nWR3yhGP/arcgis/rest/services/gamelands_general/FeatureServer/21/query';
  var NOTE = 'NCWRC 2026-27 deer seasons (eRegulations last updated Aug 18, 2026). Antlerless dates match antlered in NE/SE/Central/NW; Western antlerless is shorter in some counties. Game lands follow the county unless the Game Lands section says otherwise. Confirm ncwildlife.gov.';

  var NE = ['BERTIE','CAMDEN','CHOWAN','CURRITUCK','EDGECOMBE','FRANKLIN','GATES','GREENE','HALIFAX','HERTFORD','JOHNSTON','MARTIN','NASH','NORTHAMPTON','PASQUOTANK','PERQUIMANS','PITT','VANCE','WAKE','WARREN','WAYNE','WILSON'];
  var SE = ['BEAUFORT','BLADEN','BRUNSWICK','CARTERET','COLUMBUS','CRAVEN','DARE','DUPLIN','HARNETT','HOKE','HYDE','JONES','LENOIR','MOORE','NEW HANOVER','ONSLOW','PAMLICO','PENDER','RICHMOND','ROBESON','SCOTLAND','TYRRELL','WASHINGTON'];
  var SE_CWD = ['CUMBERLAND','SAMPSON'];
  var CE = ['ALAMANCE','ANSON','CABARRUS','CASWELL','CHATHAM','DAVIDSON','DURHAM','GRANVILLE','GUILFORD','LEE','MECKLENBURG','MONTGOMERY','ORANGE','PERSON','RANDOLPH','ROCKINGHAM','ROWAN','STANLY','UNION'];
  var NW = ['ALEXANDER','ALLEGHANY','ASHE','CATAWBA','CLEVELAND','DAVIE','GASTON','IREDELL','LINCOLN','POLK','RUTHERFORD','WATAUGA'];
  var NW_CWD = ['FORSYTH','STOKES','SURRY','WILKES','YADKIN'];
  var W1 = ['AVERY','BURKE','CALDWELL','MADISON','MITCHELL','YANCEY'];
  var W2 = ['BUNCOMBE','HENDERSON','MCDOWELL'];
  var W3 = ['CHEROKEE','CLAY','HAYWOOD','JACKSON','MACON','SWAIN','TRANSYLVANIA'];
  var W4 = ['GRAHAM'];

  function zoneOf(id) {
    var s = String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    if (NE.indexOf(s) !== -1) return 'NE';
    if (SE.indexOf(s) !== -1) return 'SE';
    if (SE_CWD.indexOf(s) !== -1) return 'SECWD';
    if (CE.indexOf(s) !== -1) return 'CE';
    if (NW.indexOf(s) !== -1) return 'NW';
    if (NW_CWD.indexOf(s) !== -1) return 'NWCWD';
    if (W1.indexOf(s) !== -1) return 'W1';
    if (W2.indexOf(s) !== -1) return 'W2';
    if (W3.indexOf(s) !== -1) return 'W3';
    if (W4.indexOf(s) !== -1) return 'W4';
    return 'U';
  }

  window.RSPackLib.buildAndRegister({
    code: 'NC',
    name: 'North Carolina',
    year: 2026,
    source: 'NCWRC eRegulations Deer Hunting Seasons (updated Aug 18, 2026)',
    agency: 'North Carolina Wildlife Resources Commission',
    agencyUrl: 'https://www.ncwildlife.gov/hunting/fishing-hunting-trapping-regulations',
    lawUrl: 'https://www.eregulations.com/northcarolina/hunting/deer-hunting-seasons',
    mapUrl: 'https://www.eregulations.com/northcarolina/hunting/deer-zone-maps',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='37'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Deer season zones (by county)',
    confirmLabel: 'NCWRC 2026-27 regulations digest',
    minUnitCache: 90,
    hasBlm: false,
    wma: {
      url: GL, where: '1=1',
      outFields: 'GML_HAB,SUM_ACRES,GameLandID,OBJECTID',
      nameFields: ['GML_HAB'],
      label: 'Game Land', short: 'Game land', typeLabel: 'Game land',
      notes: 'NCWRC Game Lands. Weapon seasons follow the county unless the Game Lands section says otherwise.'
    },
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    },
    regionForUnit: zoneOf,
    regionOrder: ['NE', 'SE', 'SECWD', 'CE', 'NW', 'NWCWD', 'W1', 'W2', 'W3', 'W4'],
    regionColors: {
      NE: '#5b8def', SE: '#2f9e4f', SECWD: '#c45c26', CE: '#e0913c',
      NW: '#a78bfa', NWCWD: '#d97706', W1: '#64748b', W2: '#0ea5e9', W3: '#16a34a', W4: '#7c3aed'
    },
    regionNames: {
      NE: 'Northeastern',
      SE: 'Southeastern',
      SECWD: 'Southeastern CWD (Cumberland, Sampson)',
      CE: 'Central',
      NW: 'Northwestern',
      NWCWD: 'Northwestern CWD',
      W1: 'Western (Avery group)',
      W2: 'Western (Buncombe / Henderson / McDowell)',
      W3: 'Western (Cherokee group)',
      W4: 'Western (Graham)'
    },
    areas: {},
    seasons: [
      { areas: NE, type: 'Archery', arch: ['2026-09-12', '2026-10-02'], land: 'Either', target: 'Deer', limit: 'Northeastern archery Sept 12-Oct 2, 2026. ' + NOTE },
      { areas: NE, type: 'Blackpowder', muzzle: ['2026-10-03', '2026-10-16'], land: 'Either', target: 'Deer', limit: 'Northeastern blackpowder Oct 3-16, 2026. ' + NOTE },
      { areas: NE, type: 'Gun', gun: ['2026-10-17', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Northeastern gun Oct 17, 2026-Jan 1, 2027. ' + NOTE },

      { areas: SE.concat(SE_CWD), type: 'Archery', arch: ['2026-09-12', '2026-10-02'], land: 'Either', target: 'Deer', limit: 'Southeastern archery Sept 12-Oct 2, 2026. ' + NOTE },
      { areas: SE.concat(SE_CWD), type: 'Blackpowder', muzzle: ['2026-10-03', '2026-10-16'], land: 'Either', target: 'Deer', limit: 'Southeastern blackpowder Oct 3-16, 2026. ' + NOTE },
      { areas: SE.concat(SE_CWD), type: 'Gun', gun: ['2026-10-17', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Southeastern gun Oct 17, 2026-Jan 1, 2027. ' + NOTE },
      { areas: SE_CWD, type: 'Early', gun: ['2026-08-22', '2026-08-23'], land: 'Either', target: 'Antlered deer', limit: 'SE CWD special early season Aug 22-23, 2026 (any lawful weapon, antlered). ' + NOTE },

      { areas: CE, type: 'Archery', arch: ['2026-09-12', '2026-10-30'], land: 'Either', target: 'Deer', limit: 'Central archery Sept 12-Oct 30, 2026. ' + NOTE },
      { areas: CE, type: 'Blackpowder', muzzle: ['2026-10-31', '2026-11-13'], land: 'Either', target: 'Deer', limit: 'Central blackpowder Oct 31-Nov 13, 2026. ' + NOTE },
      { areas: CE, type: 'Gun', gun: ['2026-11-14', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Central gun Nov 14, 2026-Jan 1, 2027. ' + NOTE },

      { areas: NW, type: 'Archery', arch: ['2026-09-12', '2026-11-06'], land: 'Either', target: 'Deer', limit: 'Northwestern archery Sept 12-Nov 6, 2026. ' + NOTE },
      { areas: NW, type: 'Blackpowder', muzzle: ['2026-11-07', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Northwestern blackpowder Nov 7-20, 2026. ' + NOTE },
      { areas: NW, type: 'Gun', gun: ['2026-11-21', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Northwestern gun Nov 21, 2026-Jan 1, 2027. ' + NOTE },

      { areas: NW_CWD, type: 'Early', gun: ['2026-08-22', '2026-08-23'], land: 'Either', target: 'Antlered deer', limit: 'NW CWD special early season Aug 22-23, 2026 (any lawful weapon, antlered). ' + NOTE },
      { areas: NW_CWD, type: 'Archery', arch: ['2026-09-12', '2026-10-30'], land: 'Either', target: 'Deer', limit: 'NW CWD archery Sept 12-Oct 30, 2026. ' + NOTE },
      { areas: NW_CWD, type: 'Blackpowder', muzzle: ['2026-10-31', '2026-11-13'], land: 'Either', target: 'Deer', limit: 'NW CWD blackpowder Oct 31-Nov 13, 2026. ' + NOTE },
      { areas: NW_CWD, type: 'Gun', gun: ['2026-11-14', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'NW CWD gun Nov 14, 2026-Jan 1, 2027. ' + NOTE },

      { areas: W1.concat(W2, W3, W4), type: 'Archery', arch: ['2026-09-12', '2026-11-13'], land: 'Either', target: 'Deer', limit: 'Western archery Sept 12-Nov 13, 2026. ' + NOTE },
      { areas: W1.concat(W2, W3, W4), type: 'Blackpowder', muzzle: ['2026-11-14', '2026-11-27'], land: 'Either', target: 'Deer (antlerless shorter in some counties)', limit: 'Western blackpowder Nov 14-27, 2026. Antlerless shorter in Cherokee group / Graham. ' + NOTE },
      { areas: W1.concat(W2, W3, W4), type: 'Gun', gun: ['2026-11-28', '2027-01-01'], land: 'Either', target: 'Deer (antlerless shorter in some counties)', limit: 'Western gun Nov 28, 2026-Jan 1, 2027. Antlerless is shorter or closed in some mountain counties. ' + NOTE },

      { areas: 'ALL', type: 'Youth', gun: ['2026-09-26', '2026-09-27'], land: 'Either', target: 'Deer', limit: 'Statewide youth deer days Sept 26-27, 2026 (youth under 16, any legal weapon). ' + NOTE, youthOnly: true },
      { areas: W1.concat(W2, W3, W4), type: 'Youth', gun: ['2026-11-26', '2026-11-27'], land: 'Either', target: 'Deer', limit: 'Western youth deer days Nov 26-27, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['County deer zones instead of letter rings', 'CWD special early weekends in listed counties', 'Western antlerless shorter than antlered'],
    accuracyNotes: [
      'Dates from official eRegulations Deer Hunting Seasons page last updated Aug 18, 2026.',
      'Overlay is Census TIGER counties (100). Official zone GIS is a printed map, not a FeatureServer.',
      'Western antlerless (Buncombe/Henderson/McDowell gun Nov 28-Dec 5; Cherokee group blackpowder Nov 21-27 and gun Nov 28 only; Graham blackpowder Nov 21 only, no gun antlerless) is noted, not separately enforced — antlered window is shown.',
      'Buncombe/Henderson highway-line antlerless exception is not drawn.',
      'Urban archery Jan 9-Feb 14, 2027 is participating municipalities only — omitted.',
      'Game Lands FeatureServer field names may differ; if the layer 404s, huntable land still shows USFS/NWR/USACE.',
      'Game-land gun antlerless dates can differ from the county table.'
    ]
  });
})();
