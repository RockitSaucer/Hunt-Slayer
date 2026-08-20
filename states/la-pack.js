/* Louisiana deer pack — official 2026-27 LDWF schedule + TIGER parishes.
 * Areas 1-10. No official Area polygon REST. Whole-parish cores get that area's dates.
 * Split parishes (listed in more than one area) use a conservative overlap.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'LDWF 2026-27 deer hunting schedule (support.louisianaoutdoors.com / 26LAHD). WMA dates differ. Split parishes use overlap so the later-opening area never shows open too early. Confirm wlf.louisiana.gov.';

  var A1 = ['CONCORDIA','EAST CARROLL','FRANKLIN','MADISON','RICHLAND','TENSAS','WEST CARROLL'];
  var A2 = ['BIENVILLE','BOSSIER','CADDO','CALDWELL','CLAIBORNE','DE SOTO','DESOTO','JACKSON','LINCOLN','NATCHITOCHES','RED RIVER','SABINE','UNION','WEBSTER','WINN'];
  var A4 = ['ST HELENA','WASHINGTON'];
  var A6 = ['AVOYELLES','POINTE COUPEE','WEST BATON ROUGE','WEST FELICIANA'];
  var A9 = ['ASCENSION','ASSUMPTION','JEFFERSON','LAFOURCHE','ORLEANS','PLAQUEMINES','ST BERNARD','ST CHARLES','ST JAMES','ST JOHN THE BAPTIST','TERREBONNE'];
  var A10 = ['CAMERON','VERMILION','VERMILLION'];

  function norm(id) {
    return String(id == null ? '' : id).toUpperCase()
      .replace(/\s+PARISH$/, '')
      .replace(/\./g, '')
      .replace(/^ST\s+/, 'ST ')
      .replace(/^SAINT\s+/, 'ST ');
  }
  function regionOf(id) {
    var s = norm(id);
    if (A1.indexOf(s) !== -1) return '1';
    if (A2.indexOf(s) !== -1) return '2';
    if (A4.indexOf(s) !== -1) return '4';
    if (A6.indexOf(s) !== -1) return '6';
    if (A9.indexOf(s) !== -1) return '9';
    if (A10.indexOf(s) !== -1) return '10';
    return 'S';
  }

  window.RSPackLib.buildAndRegister({
    code: 'LA',
    name: 'Louisiana',
    year: 2026,
    source: 'LDWF 2026-2027 Deer Hunting Schedule + Deer Hunting Areas parish lists',
    agency: 'Louisiana Department of Wildlife and Fisheries',
    agencyUrl: 'https://www.wlf.louisiana.gov/page/seasons-and-regulations',
    lawUrl: 'https://support.louisianaoutdoors.com/hc/en-us/articles/40876416872852-Deer-Hunting-Schedule',
    mapUrl: 'https://support.louisianaoutdoors.com/hc/en-us/articles/38975299245972-Deer-Hunting-Areas',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='22'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'Parish',
    overlayFoldLabel: 'Parishes (Deer Areas 1-10; splits conservative)',
    confirmLabel: 'LDWF 2026-27 hunting regulations (26LAHD)',
    minUnitCache: 60,
    hasBlm: false,
    normalizeUnitId: norm,
    regionForUnit: regionOf,
    regionOrder: ['1', '2', '4', '6', '9', '10', 'S'],
    regionColors: {
      '1': '#e0913c',
      '2': '#5b8def',
      '4': '#2f9e4f',
      '6': '#a78bfa',
      '9': '#c45c26',
      '10': '#0ea5e9',
      S: '#64748b'
    },
    regionNames: {
      '1': 'Area 1 (whole-parish core)',
      '2': 'Area 2 (whole-parish core)',
      '4': 'Area 4 (whole-parish core)',
      '6': 'Area 6 (whole-parish core)',
      '9': 'Area 9 (whole-parish core)',
      '10': 'Area 10 (whole-parish core)',
      S: 'Split parishes (conservative overlap)'
    },
    areas: {},
    seasons: [
      { areas: A1, type: 'Archery', arch: ['2026-09-12', '2026-09-20'], land: 'Either', target: 'Bucks only (velvet)', limit: 'Area 1 bucks-only velvet Sep 12-20, 2026. ' + NOTE },
      { areas: A1, type: 'Archery', arch: ['2026-10-01', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Area 1 archery Oct 1, 2026-Jan 31, 2027. ' + NOTE },
      { areas: A1, type: 'Primitive', muzzle: ['2026-11-14', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Area 1 primitive Nov 14-20, 2026. ' + NOTE },
      { areas: A1, type: 'Primitive', muzzle: ['2027-01-25', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Area 1 primitive Jan 25-31, 2027. ' + NOTE },
      { areas: A1, type: 'Firearm', gun: ['2026-11-21', '2027-01-24'], land: 'Either', target: 'Deer', limit: 'Area 1 firearms (still + dogs) Nov 21, 2026-Jan 24, 2027. ' + NOTE },
      { areas: A1, type: 'Youth', gun: ['2026-10-31', '2026-11-06'], land: 'Either', target: 'Deer', limit: 'Area 1 youth/veterans Oct 31-Nov 6, 2026. ' + NOTE, youthOnly: true },

      { areas: A2, type: 'Archery', arch: ['2026-08-29', '2026-09-06'], land: 'Either', target: 'Bucks only (velvet)', limit: 'Area 2 bucks-only velvet Aug 29-Sep 6, 2026. ' + NOTE },
      { areas: A2, type: 'Archery', arch: ['2026-10-01', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Area 2 archery Oct 1, 2026-Jan 31, 2027. ' + NOTE },
      { areas: A2, type: 'Primitive', muzzle: ['2026-10-24', '2026-10-30'], land: 'Either', target: 'Deer', limit: 'Area 2 primitive Oct 24-30, 2026. ' + NOTE },
      { areas: A2, type: 'Primitive', muzzle: ['2027-01-18', '2027-01-24'], land: 'Either', target: 'Deer', limit: 'Area 2 primitive Jan 18-24, 2027. ' + NOTE },
      { areas: A2, type: 'Firearm', gun: ['2026-10-31', '2027-01-17'], land: 'Either', target: 'Deer', limit: 'Area 2 firearms Oct 31, 2026-Jan 17, 2027. ' + NOTE },
      { areas: A2, type: 'Youth', gun: ['2026-10-10', '2026-10-16'], land: 'Either', target: 'Deer', limit: 'Area 2 youth/veterans Oct 10-16, 2026. ' + NOTE, youthOnly: true },

      { areas: A4, type: 'Archery', arch: ['2026-10-01', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Area 4 archery Oct 1, 2026-Jan 31, 2027. ' + NOTE },
      { areas: A4, type: 'Primitive', muzzle: ['2026-11-14', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Area 4 primitive Nov 14-20, 2026. ' + NOTE },
      { areas: A4, type: 'Primitive', muzzle: ['2027-01-25', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Area 4 primitive Jan 25-31, 2027. ' + NOTE },
      { areas: A4, type: 'Firearm', gun: ['2026-11-21', '2027-01-24'], land: 'Either', target: 'Deer', limit: 'Area 4 firearms Nov 21, 2026-Jan 24, 2027. ' + NOTE },
      { areas: A4, type: 'Youth', gun: ['2026-10-31', '2026-11-06'], land: 'Either', target: 'Deer', limit: 'Area 4 youth/veterans Oct 31-Nov 6, 2026. ' + NOTE, youthOnly: true },

      { areas: A6, type: 'Archery', arch: ['2026-09-12', '2026-09-20'], land: 'Either', target: 'Bucks only (velvet)', limit: 'Area 6 bucks-only velvet Sep 12-20, 2026. ' + NOTE },
      { areas: A6, type: 'Archery', arch: ['2026-10-01', '2027-02-15'], land: 'Either', target: 'Deer', limit: 'Area 6 archery Oct 1, 2026-Feb 15, 2027 (bucks Oct 1-15; either-sex Oct 16-Feb 15). ' + NOTE },
      { areas: A6, type: 'Primitive', muzzle: ['2026-11-14', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Area 6 primitive Nov 14-20, 2026. ' + NOTE },
      { areas: A6, type: 'Primitive', muzzle: ['2027-01-25', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Area 6 primitive Jan 25-31, 2027. ' + NOTE },
      { areas: A6, type: 'Firearm', gun: ['2026-11-21', '2027-01-24'], land: 'Either', target: 'Deer', limit: 'Area 6 firearms Nov 21, 2026-Jan 24, 2027. ' + NOTE },
      { areas: A6, type: 'Youth', gun: ['2026-10-31', '2026-11-06'], land: 'Either', target: 'Deer', limit: 'Area 6 youth/veterans Oct 31-Nov 6, 2026. ' + NOTE, youthOnly: true },

      { areas: A9, type: 'Archery', arch: ['2026-10-01', '2027-02-15'], land: 'Either', target: 'Deer', limit: 'Area 9 archery Oct 1, 2026-Feb 15, 2027 (bucks Oct 1-15; either-sex Oct 16-Feb 15). ' + NOTE },
      { areas: A9, type: 'Primitive', muzzle: ['2026-11-14', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Area 9 primitive either-sex Nov 14-20, 2026. ' + NOTE },
      { areas: A9, type: 'Primitive', muzzle: ['2027-01-25', '2027-01-31'], land: 'Either', target: 'Bucks', limit: 'Area 9 primitive bucks Jan 25-31, 2027. ' + NOTE },
      { areas: A9, type: 'Firearm', gun: ['2026-11-21', '2027-01-24'], land: 'Either', target: 'Deer', limit: 'Area 9 firearms Nov 21, 2026-Jan 24, 2027 (either-sex days vary). ' + NOTE },
      { areas: A9, type: 'Youth', gun: ['2026-10-31', '2026-11-06'], land: 'Either', target: 'Deer', limit: 'Area 9 youth/veterans Oct 31-Nov 6, 2026. ' + NOTE, youthOnly: true },

      { areas: A10, type: 'Archery', arch: ['2026-09-19', '2027-01-15'], land: 'Either', target: 'Deer', limit: 'Area 10 archery Sep 19, 2026-Jan 15, 2027. ' + NOTE },
      { areas: A10, type: 'Primitive', muzzle: ['2026-10-10', '2026-10-16'], land: 'Either', target: 'Deer', limit: 'Area 10 primitive Oct 10-16, 2026. ' + NOTE },
      { areas: A10, type: 'Primitive', muzzle: ['2027-01-04', '2027-01-10'], land: 'Either', target: 'Deer', limit: 'Area 10 primitive Jan 4-10, 2027. ' + NOTE },
      { areas: A10, type: 'Firearm', gun: ['2026-10-17', '2027-01-03'], land: 'Either', target: 'Deer (still-hunt only)', limit: 'Area 10 still-hunt firearms Oct 17, 2026-Jan 3, 2027. No dog season. ' + NOTE },
      { areas: A10, type: 'Youth', gun: ['2026-09-26', '2026-10-02'], land: 'Either', target: 'Deer', limit: 'Area 10 youth/veterans Sep 26-Oct 2, 2026. ' + NOTE, youthOnly: true },

      { areas: 'ALL', type: 'Archery', arch: ['2026-10-16', '2027-01-15'], land: 'Either', target: 'Deer', limit: 'Split-parish conservative archery overlap Oct 16, 2026-Jan 15, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Primitive', muzzle: ['2026-11-14', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Split-parish conservative primitive overlap Nov 14-20, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-11-21', '2026-12-11'], land: 'Either', target: 'Deer', limit: 'Split-parish conservative gun overlap Nov 21-Dec 11, 2026. ' + NOTE }
    ],
    extraVsAlabama: ['Deer Areas 1-10 on parish polygons', 'Split parishes conservative overlap', 'WMA dates not encoded'],
    accuracyNotes: [
      'Dates from official LDWF 2026-27 deer hunting schedule.',
      'Parish-to-area lists from official LDWF Deer Hunting Areas page (2026-27). Many parishes are in more than one area (highway/river splits).',
      'Whole-parish cores (listed in only one area) get that area\'s calendar and color.',
      'Split parishes are color S and also receive the ALL overlap rows (Oct 16 archery / Nov 14 primitive / Nov 21 gun). Unique cores also match ALL — leftover: Area 10 unique parishes get extra overlap gun in November they already have, and Area 2 unique get a later archery start via ALL in addition to Oct 1. That does not show closed land open.',
      'Areas 3, 5, 7, 8 have no unique whole parish in this pack — those calendars exist only inside split parishes (conservative overlap).',
      'No official Area 1-10 polygon REST. Overlay is Census TIGER parishes.',
      'Kisatchie NF is still-hunt only — leftover (not land-filtered).',
      'WMA / refuge schedules differ and are not encoded.'
    ]
  });
})();
