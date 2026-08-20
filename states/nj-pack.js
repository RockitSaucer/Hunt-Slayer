/* New Jersey deer pack — N.J.A.C. 7:25-5 Game Code formulas for 2026-27 + official DMZ GIS + WMA polygons.
 * 2026-27 printed digest not posted; season lengths come from the Game Code (calendar formulas).
 * Youth dates match the official NJFW 2026-27 Take a Kid Hunting page.
 */
(function () {
  var DMZ = 'https://mapsdep.nj.gov/arcgis/rest/services/Features/Environmental_admin/MapServer/17/query';
  var WMA = 'https://mapsdep.nj.gov/arcgis/rest/services/Features/Land/MapServer/67/query';
  var NOTE = 'N.J.A.C. 7:25-5 Game Code formulas applied to 2026-27. Printed digest not posted. Special-area zones omitted. Confirm dep.nj.gov/njfw.';

  var S8 = [10, 11, 13, 14, 15, 36, 49, 50, 51];
  var S7 = [7, 8, 9, 12, 17, 41];
  var S6 = [5, 19, 25, 42, 48];
  var S5 = [2, 16, 27, 28, 29, 31, 35, 47];
  var S4 = [6];
  var S3 = [30, 55, 63, 65];
  var S2 = [1, 3, 4, 18, 22, 26];
  var S0 = [21, 23, 24, 34, 43, 45, 46];
  var EARLY_BOW = S8.concat(S7).concat(S6).concat(S5).concat(S4);
  var LATE_BOW = S3.concat(S2).concat(S0);
  var WINTER_LONG = S8.concat(S7);
  var WINTER_SHORT = S6.concat(S5).concat(S4).concat(S3).concat(S2).concat(S0);
  var PB_LONG = S8.concat(S7).concat(S6).concat(S5).concat(S4);
  var ALL_STD = EARLY_BOW.concat(LATE_BOW);

  function norm(id) {
    var n = parseInt(String(id == null ? '' : id).replace(/^ZONE\s+/i, '').replace(/^DMZ\s+/i, ''), 10);
    return isNaN(n) ? id : n;
  }
  function regionOf(id) {
    var n = norm(id);
    if (S8.indexOf(n) !== -1) return '8';
    if (S7.indexOf(n) !== -1) return '7';
    if (S6.indexOf(n) !== -1) return '6';
    if (S5.indexOf(n) !== -1) return '5';
    if (S4.indexOf(n) !== -1) return '4';
    if (S3.indexOf(n) !== -1) return '3';
    if (S2.indexOf(n) !== -1) return '2';
    if (S0.indexOf(n) !== -1) return '0';
    return 'X';
  }

  window.RSPackLib.buildAndRegister({
    code: 'NJ',
    name: 'New Jersey',
    year: 2026,
    source: 'N.J.A.C. 7:25-5.25–5.27 Game Code + NJFW 2026-27 youth hunt page',
    agency: 'New Jersey Fish & Wildlife',
    agencyUrl: 'https://dep.nj.gov/njfw/hunting/deer-seasons-and-regulations/',
    lawUrl: 'https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-7-25-5-25',
    mapUrl: 'https://dep.nj.gov/njfw/hunting/deer-management-zone-descriptions/',
    huntUnitGis: DMZ,
    unitField: 'DMZ',
    unitNameField: 'ZONE_DESC',
    outFields: 'DMZ,ZONE_DESC,SA_OWNER,REGULATION,OBJECTID',
    unitLabel: 'DMZ',
    overlayFoldLabel: 'Deer management zones',
    confirmLabel: 'NJ Game Code / 2026-27 Hunting and Trapping Digest',
    minUnitCache: 40,
    hasBlm: false,
    wma: {
      url: WMA,
      where: "USE_DESIGNATION='Wildlife Management Area'",
      outFields: 'FEATURE_NAME,USE_DESIGNATION,LAND_MANAGER,PUBLIC_ACCESS,OBJECTID',
      nameFields: ['FEATURE_NAME'],
      label: 'Wildlife Management Area', short: 'WMA', typeLabel: 'WMA',
      notes: 'NJDEP state-owned WMAs. WMA dates can differ from the DMZ table.'
    },
    normalizeUnitId: norm,
    regionForUnit: regionOf,
    regionOrder: ['8', '7', '6', '5', '4', '3', '2', '0', 'X'],
    regionColors: {
      '8': '#e0913c', '7': '#5b8def', '6': '#2f9e4f', '5': '#a78bfa',
      '4': '#c45c26', '3': '#0ea5e9', '2': '#d4a017', '0': '#64748b', X: '#94a3b8'
    },
    regionNames: {
      '8': 'Regulation set 8',
      '7': 'Regulation set 7',
      '6': 'Regulation set 6',
      '5': 'Regulation set 5',
      '4': 'Regulation set 4',
      '3': 'Regulation set 3',
      '2': 'Regulation set 2',
      '0': 'Regulation set 0',
      X: 'Special-area / unmatched DMZ (closed in pack)'
    },
    primitiveUsesGun: true,
    areas: {},
    seasons: [
      { areas: ALL_STD, type: 'Youth', arch: ['2026-09-26', '2026-09-26'], gun: ['2026-09-26', '2026-09-26'], land: 'Either', target: 'Deer (youth)', limit: 'Youth archery Sep 26, 2026 (official NJFW 2026-27 youth page / N.J.A.C. 7:25-5.25(a)3). ' + NOTE, youthOnly: true },
      { areas: EARLY_BOW, type: 'Archery', arch: ['2026-09-12', '2026-10-30'], land: 'Either', target: 'Deer', limit: 'Fall bow Sep 12-Oct 30, 2026 (sets 4-8). Second Saturday in September through last Friday in October. N.J.A.C. 7:25-5.25(a)2. ' + NOTE },
      { areas: LATE_BOW, type: 'Archery', arch: ['2026-10-03', '2026-10-30'], land: 'Either', target: 'Deer', limit: 'Fall bow Oct 3-30, 2026 (sets 0-3). Fourth Saturday prior to last Friday in October. N.J.A.C. 7:25-5.25(a)1. ' + NOTE },
      { areas: PB_LONG, type: 'Archery', arch: ['2026-11-01', '2026-12-24'], land: 'Either', target: 'Deer (permit bow)', limit: 'Permit bow Nov 1-Dec 24, 2026 (sets 4-8; Christmas closed). Confirm digest. ' + NOTE },
      { areas: PB_LONG, type: 'Archery', arch: ['2026-12-26', '2026-12-31'], land: 'Either', target: 'Deer (permit bow)', limit: 'Permit bow Dec 26-31, 2026 (sets 4-8). Confirm digest. ' + NOTE },
      { areas: S3, type: 'Archery', arch: ['2026-11-01', '2026-11-30'], land: 'Either', target: 'Deer (permit bow)', limit: 'Permit bow Nov 1-30, 2026 (set 3). Confirm digest. ' + NOTE },
      { areas: S0, type: 'Archery', arch: ['2026-11-01', '2026-11-22'], land: 'Either', target: 'Deer (permit bow)', limit: 'Permit bow Nov 1-22, 2026 (set 0). Confirm digest. ' + NOTE },
      { areas: S2, type: 'Archery', arch: ['2026-11-01', '2026-11-30'], land: 'Either', target: 'Deer (permit bow)', limit: 'Permit bow Nov 1-30, 2026 (set 2, conservative). Confirm digest. ' + NOTE },
      { areas: WINTER_LONG, type: 'Archery', arch: ['2027-01-01', '2027-02-20'], land: 'Either', target: 'Deer', limit: 'Winter bow Jan 1-Feb 20, 2027 (sets 7-8; third Saturday in February). N.J.A.C. 7:25-5.26. ' + NOTE },
      { areas: WINTER_SHORT, type: 'Archery', arch: ['2027-01-01', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Winter bow Jan 1-31, 2027 (sets 0-6). N.J.A.C. 7:25-5.26. ' + NOTE },
      { areas: ALL_STD, type: 'Youth', gun: ['2026-11-21', '2026-11-21'], land: 'Either', target: 'Deer (youth)', limit: 'Youth firearm Nov 21, 2026 (official NJFW 2026-27 youth page). ' + NOTE, youthOnly: true },
      { areas: ALL_STD, type: 'Firearm', gun: ['2026-12-07', '2026-12-12'], land: 'Either', target: 'Antlered deer (six-day)', limit: 'Six-day firearm Dec 7-12, 2026 (second Monday after Thanksgiving through Saturday). N.J.A.C. 7:25-5.27. Muzzleloader legal. No Sunday hunting. ' + NOTE },
      { areas: ALL_STD, type: 'Muzzleloader', muzzle: ['2026-11-30', '2026-12-01'], land: 'Either', target: 'Deer (permit muzzleloader)', limit: 'Permit muzzleloader overlap Nov 30-Dec 1, 2026 (Monday-Tuesday preceding six-day). Later set-specific days omitted. ' + NOTE }
    ],
    extraVsAlabama: ['DMZs + regulation-set colors', 'Game Code calendar formulas', 'WMA polygons'],
    accuracyNotes: [
      'Fall bow, winter bow, six-day firearm, and youth dates computed from official N.J.A.C. 7:25-5 formulas. Youth archery Sep 26 and youth firearm Nov 21 match the official NJFW 2026-27 Take a Kid Hunting page.',
      '2026-27 printed digest was not posted as of 2026-08-19. Permit-bow end dates for sets 0/2/3 follow the 2025-26 digest pattern (Game Code permit-bow section not re-quoted this pass).',
      'Regulation-set zone lists are from the last published digest (2025-26). An April 2026 Game Code proposal would collapse sets — not used until adopted/posted.',
      'Special-area zones (37, 38, 39, 53, 54, 61, 64, 66, 67, 68) are overlay-only (region X) with no season rows.',
      'Permit shotgun omitted (zone windows differ). Permit muzzleloader later days omitted so short sets never show extra days.',
      'GIS: NJDEP DMZ layer 17 (88 polygons / 54 unique DMZ) and state-owned WMA polygons (USE_DESIGNATION Wildlife Management Area).',
      'No National Forest. Overlay shows NWR + USACE + WMA, not TVA/Forever Wild/SOA/PDHA.',
      'WMA dates can differ from the DMZ table.'
    ]
  });
})();
