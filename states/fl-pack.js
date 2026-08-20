/* Florida deer pack — FWC 2026-27 zone dates + official DMU GIS (12 units).
 * Dates: https://myfwc.com/hunting/season-dates/ (2026-2027 header)
 * GIS: FWC White-tailed Deer Management Unit Areas MapServer/4
 * FWC: these dates do NOT apply to WMAs — confirm each WMA brochure.
 */
(function () {
  var DMU = 'https://gis.myfwc.com/hosting/rest/services/Open_Data/White_tailed_Deer_Management_Unit_Areas/MapServer/4/query';
  var WMA = 'https://gis.myfwc.com/mapping/rest/services/Open_Data/Wildlife_Management_Areas_Florida/MapServer/1/query';
  var areas = {
    A1: { n: 'A1', name: 'DMU A1', region: 'A' },
    A2: { n: 'A2', name: 'DMU A2', region: 'A' },
    A3: { n: 'A3', name: 'DMU A3', region: 'A' },
    B1: { n: 'B1', name: 'DMU B1', region: 'B' },
    C1: { n: 'C1', name: 'DMU C1', region: 'C' },
    C2: { n: 'C2', name: 'DMU C2', region: 'C' },
    C3: { n: 'C3', name: 'DMU C3', region: 'C' },
    C4: { n: 'C4', name: 'DMU C4', region: 'C' },
    C5: { n: 'C5', name: 'DMU C5', region: 'C' },
    C6: { n: 'C6', name: 'DMU C6', region: 'C' },
    D1: { n: 'D1', name: 'DMU D1', region: 'D' },
    D2: { n: 'D2', name: 'DMU D2', region: 'D' }
  };
  var A = ['A1','A2','A3'], B = ['B1'], C = ['C1','C2','C3','C4','C5','C6'], D = ['D1','D2'];
  var NOTE = 'FWC 2026-27 zone dates for lands outside the WMA system. WMA dates differ — confirm the WMA brochure. Antler rules vary by DMU.';
  window.RSPackLib.buildAndRegister({
    code: 'FL',
    name: 'Florida',
    year: 2026,
    source: 'FWC 2026-2027 Florida Resident Game season dates',
    agency: 'Florida Fish and Wildlife Conservation Commission',
    agencyUrl: 'https://myfwc.com/hunting/season-dates/',
    lawUrl: 'https://www.eregulations.com/assets/docs/resources/FL/26FLHD_LR2.pdf',
    mapUrl: 'https://myfwc.com/hunting/season-dates/zone-map/',
    huntUnitGis: DMU,
    unitField: 'DMU',
    unitNameField: 'DMU',
    regionField: 'Zone',
    outFields: 'DMU,Zone,Unit,OBJECTID',
    unitLabel: 'DMU',
    overlayFoldLabel: 'Deer zones / DMUs',
    confirmLabel: 'FWC 2026-27 season dates',
    lawLabel: '2026-2027 Florida Hunting Regulations',
    agencyLabel: 'FWC — season dates',
    wmaNote: 'FWC WMA. Zone dates on this pack do NOT apply to WMAs. Confirm the WMA brochure.',
    minUnitCache: 10,
    hasBlm: false,
    wma: {
      url: WMA,
      where: '1=1',
      outFields: 'NAME,NAME_SHORT,TYPE,WEBSITE,OBJECTID',
      nameFields: ['NAME', 'NAME_SHORT'],
      label: 'Wildlife Management Area',
      short: 'WMA',
      typeLabel: 'WMA',
      notes: 'FWC WMA. Confirm the specific WMA brochure — zone dates do not apply here.'
    },
    normalizeUnitId: function (id) {
      var s = String(id == null ? '' : id).toUpperCase().replace(/\s+/g, '');
      var m = s.match(/([ABCD]\d)/);
      return m ? m[1] : s;
    },
    regionOrder: ['A', 'B', 'C', 'D'],
    regionColors: { A: '#e0913c', B: '#5b8def', C: '#2f9e4f', D: '#a78bfa' },
    regionNames: {
      A: 'Zone A (south)',
      B: 'Zone B',
      C: 'Zone C',
      D: 'Zone D (panhandle)'
    },
    areas: areas,
    seasons: [
      { areas: A, type: 'Archery', arch: ['2026-08-01', '2026-08-30'], land: 'Either', target: 'Antlered deer (antlerless shorter in A2/A3)', limit: 'Zone A archery Aug 1-30, 2026. ' + NOTE },
      { areas: A, type: 'Crossbow', arch: ['2026-08-01', '2026-09-04'], land: 'Either', target: 'Antlered deer', limit: 'Zone A crossbow Aug 1-Sept 4, 2026 (mapped as Archery). ' + NOTE },
      { areas: A, type: 'Muzzleloader', muzzle: ['2026-09-05', '2026-09-18'], land: 'Either', target: 'Antlered deer', limit: 'Zone A muzzleloader Sept 5-18, 2026. ' + NOTE },
      { areas: A, type: 'Gun', gun: ['2026-09-19', '2026-10-18'], land: 'Either', target: 'Antlered deer', limit: 'Zone A general gun Sept 19-Oct 18, 2026. ' + NOTE },
      { areas: A, type: 'Gun', gun: ['2026-11-21', '2027-01-03'], land: 'Either', target: 'Antlered deer', limit: 'Zone A general gun Nov 21, 2026-Jan 3, 2027. ' + NOTE },
      { areas: A, type: 'Youth', gun: ['2026-09-12', '2026-09-13'], land: 'Either', target: 'Deer (not spotted fawn)', limit: 'Zone A youth weekend Sept 12-13, 2026. Not on WMAs. ' + NOTE, youthOnly: true },

      { areas: B, type: 'Archery', arch: ['2026-10-17', '2026-11-15'], land: 'Either', target: 'Deer', limit: 'Zone B archery Oct 17-Nov 15, 2026. ' + NOTE },
      { areas: B, type: 'Crossbow', arch: ['2026-10-17', '2026-11-20'], land: 'Either', target: 'Deer', limit: 'Zone B crossbow Oct 17-Nov 20, 2026 (mapped as Archery). ' + NOTE },
      { areas: B, type: 'Muzzleloader', muzzle: ['2026-11-21', '2026-12-04'], land: 'Either', target: 'Deer', limit: 'Zone B muzzleloader Nov 21-Dec 4, 2026. ' + NOTE },
      { areas: B, type: 'Gun', gun: ['2026-12-05', '2027-02-21'], land: 'Either', target: 'Antlered deer (antlerless Dec 26-Jan 3)', limit: 'Zone B general gun Dec 5, 2026-Feb 21, 2027. Antlerless only Dec 26-Jan 3. ' + NOTE },
      { areas: B, type: 'Youth', gun: ['2026-11-28', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Zone B youth weekend Nov 28-29, 2026. ' + NOTE, youthOnly: true },

      { areas: C, type: 'Archery', arch: ['2026-09-19', '2026-10-18'], land: 'Either', target: 'Deer', limit: 'Zone C archery Sept 19-Oct 18, 2026. ' + NOTE },
      { areas: C, type: 'Crossbow', arch: ['2026-09-19', '2026-10-23'], land: 'Either', target: 'Deer', limit: 'Zone C crossbow Sept 19-Oct 23, 2026 (mapped as Archery). ' + NOTE },
      { areas: C, type: 'Muzzleloader', muzzle: ['2026-10-24', '2026-11-06'], land: 'Either', target: 'Deer', limit: 'Zone C muzzleloader Oct 24-Nov 6, 2026. ' + NOTE },
      { areas: C, type: 'Gun', gun: ['2026-11-07', '2027-01-24'], land: 'Either', target: 'Antlered deer (antlerless shorter by DMU)', limit: 'Zone C general gun Nov 7, 2026-Jan 24, 2027 for antlered. Antlerless windows vary by DMU. ' + NOTE },
      { areas: C, type: 'Youth', gun: ['2026-10-31', '2026-11-01'], land: 'Either', target: 'Deer', limit: 'Zone C youth weekend Oct 31-Nov 1, 2026. ' + NOTE, youthOnly: true },

      { areas: D, type: 'Archery', arch: ['2026-10-24', '2026-11-25'], land: 'Either', target: 'Deer', limit: 'Zone D archery Oct 24-Nov 25, 2026. ' + NOTE },
      { areas: D, type: 'Crossbow', arch: ['2026-10-24', '2026-11-25'], land: 'Either', target: 'Deer', limit: 'Zone D crossbow Oct 24-Nov 25, 2026. ' + NOTE },
      { areas: D, type: 'Crossbow', arch: ['2026-11-30', '2026-12-04'], land: 'Either', target: 'Deer', limit: 'Zone D crossbow Nov 30-Dec 4, 2026. ' + NOTE },
      { areas: D, type: 'Gun', gun: ['2026-11-26', '2026-11-29'], land: 'Either', target: 'Deer', limit: 'Zone D general gun Nov 26-29, 2026. ' + NOTE },
      { areas: D, type: 'Gun', gun: ['2026-12-12', '2027-02-21'], land: 'Either', target: 'Deer', limit: 'Zone D general gun Dec 12, 2026-Feb 21, 2027. ' + NOTE },
      { areas: D, type: 'Muzzleloader', muzzle: ['2026-12-05', '2026-12-11'], land: 'Either', target: 'Deer', limit: 'Zone D muzzleloader Dec 5-11, 2026. ' + NOTE },
      { areas: D, type: 'Muzzleloader', muzzle: ['2027-02-22', '2027-02-28'], land: 'Either', target: 'Deer', limit: 'Zone D muzzleloader Feb 22-28, 2027. ' + NOTE },
      { areas: D, type: 'Youth', gun: ['2026-12-05', '2026-12-06'], land: 'Either', target: 'Deer', limit: 'Zone D youth weekend Dec 5-6, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: [
      'Four hunting zones (A-D) and 12 DMUs',
      'Separate crossbow season (mapped onto Archery)',
      'WMA dates are NOT the zone dates',
      'Antler-point rules vary by DMU'
    ],
    accuracyNotes: [
      'Antlered zone windows from official FWC 2026-27 season-dates page.',
      'Antlerless-only sub-windows (esp. Zone A DMU A2/A3 and Zone C DMUs) are noted, not separately enforced.',
      'Zone B general gun is encoded as antlered Dec 5-Feb 21; antlerless there is only Dec 26-Jan 3.',
      'WMA-specific seasons are excluded by FWC and are not in this pack.'
    ]
  });
})();
