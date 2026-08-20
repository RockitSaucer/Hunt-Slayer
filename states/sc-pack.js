/* South Carolina deer pack — SCDNR eRegulations private-land 2026-27 + TIGER counties.
 * Game Zones 1-4 from official SCDNR zone page. WMA dates differ and are not encoded.
 */
(function () {
  var ZONES = 'https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/South_Carolina_Game_Zones/FeatureServer/0/query';
  var NOTE = 'SCDNR 2026-27 private-land deer seasons (eRegulations last updated Aug 7, 2026). Archery/crossbows are legal during all seasons. WMA dates differ. Confirm dnr.sc.gov.';
  var Z1 = ['1'];
  var Z2 = ['2'];
  var Z3 = ['3'];
  var Z4 = ['4'];

  window.RSPackLib.buildAndRegister({
    code: 'SC',
    name: 'South Carolina',
    year: 2026,
    source: 'SCDNR eRegulations Deer Seasons on Private Lands (updated Aug 7, 2026)',
    agency: 'South Carolina Department of Natural Resources',
    agencyUrl: 'https://www.dnr.sc.gov/hunting.html',
    lawUrl: 'https://www.eregulations.com/southcarolina/hunting/deer-seasons-on-private-lands',
    mapUrl: 'https://www.dnr.sc.gov/hunting/zones/index.html',
    huntUnitGis: ZONES,
    unitField: 'GameZone',
    unitNameField: 'GameZone',
    outFields: 'GameZone,OBJECTID',
    unitLabel: 'Game Zone',
    overlayFoldLabel: 'Game Zones',
    confirmLabel: 'SCDNR 2026-27 hunting guide',
    minUnitCache: 3,
    hasBlm: false,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).replace(/^ZONE\s+/i, '').replace(/^GAME\s*ZONE\s+/i, '');
    },
    regionForUnit: function (id) {
      return String(id == null ? '' : id).replace(/^ZONE\s+/i, '').replace(/^GAME\s*ZONE\s+/i, '');
    },
    regionOrder: ['1', '2', '3', '4'],
    regionColors: { '1': '#64748b', '2': '#5b8def', '3': '#e0913c', '4': '#2f9e4f' },
    regionNames: {
      '1': 'Game Zone 1',
      '2': 'Game Zone 2',
      '3': 'Game Zone 3',
      '4': 'Game Zone 4'
    },
    areas: {},
    seasons: [
      { areas: Z1, type: 'Primitive', muzzle: ['2026-10-01', '2026-10-10'], land: 'Either', target: 'Deer', limit: 'Zone 1 primitive weapons Oct 1-10, 2026 (private land). ' + NOTE },
      { areas: Z1, type: 'Gun', gun: ['2026-10-11', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Zone 1 gun Oct 11, 2026-Jan 1, 2027 (private land). ' + NOTE },
      { areas: Z1, type: 'Archery', arch: ['2026-10-01', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Zone 1 archery during all open seasons (Oct 1, 2026-Jan 1, 2027). ' + NOTE },
      { areas: Z1, type: 'Youth', gun: ['2026-09-26', '2026-09-26'], land: 'Private', target: 'Antlered deer', limit: 'Zone 1 youth day Sept 26, 2026 (private land). ' + NOTE, youthOnly: true },

      { areas: Z2, type: 'Archery', arch: ['2026-09-15', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Zone 2 archery-only Sept 15-30, then archery during later seasons through Jan 1. ' + NOTE },
      { areas: Z2, type: 'Primitive', muzzle: ['2026-10-01', '2026-10-10'], land: 'Either', target: 'Deer', limit: 'Zone 2 primitive weapons Oct 1-10, 2026. ' + NOTE },
      { areas: Z2, type: 'Gun', gun: ['2026-10-11', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Zone 2 gun Oct 11, 2026-Jan 1, 2027. ' + NOTE },
      { areas: Z2, type: 'Youth', gun: ['2026-09-12', '2026-09-12'], land: 'Private', target: 'Antlered deer', limit: 'Zone 2 youth day Sept 12, 2026 (private land). ' + NOTE, youthOnly: true },

      { areas: Z3, type: 'Archery', arch: ['2026-08-15', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Zone 3 archery & gun Aug 15, 2026-Jan 1, 2027 (buck only Aug 15-Sept 14). ' + NOTE },
      { areas: Z3, type: 'Gun', gun: ['2026-08-15', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Zone 3 archery & gun Aug 15, 2026-Jan 1, 2027 (buck only Aug 15-Sept 14). ' + NOTE },
      { areas: Z3, type: 'Youth', gun: ['2026-08-08', '2026-08-08'], land: 'Private', target: 'Antlered deer', limit: 'Zone 3 youth day Aug 8, 2026 (private land). ' + NOTE, youthOnly: true },

      { areas: Z4, type: 'Archery', arch: ['2026-08-15', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Zone 4 archery-only Aug 15-31, then archery during gun through Jan 1 (buck only Aug 15-Sept 14). ' + NOTE },
      { areas: Z4, type: 'Gun', gun: ['2026-09-01', '2027-01-01'], land: 'Either', target: 'Deer', limit: 'Zone 4 gun Sept 1, 2026-Jan 1, 2027 (buck only Sept 1-14). ' + NOTE },
      { areas: Z4, type: 'Youth', gun: ['2026-08-08', '2026-08-08'], land: 'Private', target: 'Antlered deer', limit: 'Zone 4 youth day Aug 8, 2026 (private land). ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['Official 4 Game Zone polygons', 'Private-land dates only — WMA differs'],
    accuracyNotes: [
      'Dates from official eRegulations private-land page last updated Aug 7, 2026.',
      'Overlay is official SCDNR Game Zones FeatureServer (4 polygons). This draws the Norfolk Southern / SC 183 split in Oconee/Pickens/Greenville.',
      'WMA seasons are different and not encoded.',
      'Jan 2 youth either-sex day omitted (single day after close).',
      'Buck-only Aug 15-Sept 14 (Zones 3-4) is a bag/sex rule, not a closed calendar.'
    ]
  });
})();
