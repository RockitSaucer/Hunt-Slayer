/* Washington deer pack — official 2026 WDFW general-season tables (eRegulations May 1, 2026) + official GMU GIS.
 * Per-GMU species (blacktail / mule / whitetail) and late seasons vary. Conservative: shortest shared early windows.
 */
(function () {
  var GMU = 'https://geodataservices.wdfw.wa.gov/arcgis/rest/services/MapServices/SharedReferenceLayers/MapServer/0/query';
  var NOTE = 'WDFW 2026 general deer seasons (eRegulations last updated May 1, 2026). Late seasons and high-buck wilderness hunts omitted. Closed GMUs 157, 490, 522 and permit-only 290, 329, 371, 485 have no general seasons. Confirm wdfw.wa.gov.';
  var CLOSED = [157, 490, 522, 290, 329, 371, 485];
  var WT_GUN_LATE = [101, 105, 108, 111, 113, 117, 121, 124];

  window.RSPackLib.buildAndRegister({
    code: 'WA',
    name: 'Washington',
    year: 2026,
    source: 'WDFW 2026-27 Big Game pamphlet / eRegulations deer general seasons (updated May 1, 2026)',
    agency: 'Washington Department of Fish and Wildlife',
    agencyUrl: 'https://wdfw.wa.gov/hunting/regulations/big-game',
    lawUrl: 'https://www.eregulations.com/washington/hunting/deer-general-seasons',
    mapUrl: 'https://wdfw.wa.gov/hunting/locations/gmu',
    huntUnitGis: GMU,
    huntUnitWhere: 'GMU_Num NOT IN (157,490,522,290,329,371,485)',
    unitField: 'GMU_Num',
    unitNameField: 'GMU_Name',
    regionField: 'EastWest_Ind',
    outFields: 'GMU_Num,GMU_Name,WDFWReg_Num,EastWest_Ind,OBJECTID',
    unitLabel: 'GMU',
    overlayFoldLabel: 'Game Management Units',
    confirmLabel: 'WDFW 2026-27 big game pamphlet',
    minUnitCache: 140,
    hasBlm: true,
    normalizeUnitId: function (id) {
      var n = parseInt(String(id == null ? '' : id).replace(/^GMU\s+/i, ''), 10);
      return isNaN(n) ? id : n;
    },
    regionOrder: ['W', 'E'],
    regionColors: { W: '#2f9e4f', E: '#e0913c' },
    regionNames: { W: 'Western Washington GMUs', E: 'Eastern Washington GMUs' },
    regionForUnit: function (id) {
      var n = parseInt(String(id == null ? '' : id).replace(/^GMU\s+/i, ''), 10);
      return (!isNaN(n) && n >= 400) ? 'W' : 'E';
    },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-01', '2026-09-20'], land: 'Either', target: 'Deer', limit: 'Early archery overlap Sept 1-20, 2026 (some GMUs run through Sept 25; some end Sept 20). Late archery omitted. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-09-26', '2026-10-04'], land: 'Either', target: 'Deer', limit: 'Early muzzleloader Sept 26-Oct 4, 2026. Late muzzleloader omitted. ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-10-17', '2026-10-27'], land: 'Either', target: 'Deer', limit: 'Modern firearm overlap Oct 17-27, 2026 (shortest mule/white-tail general). Blacktail extra through Nov 1 is west GMUs only. ' + NOTE },
      { areas: WT_GUN_LATE, type: 'Firearm', gun: ['2026-10-17', '2026-10-30'], land: 'Either', target: 'White-tailed deer', limit: 'White-tailed general Oct 17-30, 2026 in GMUs 101-124. ' + NOTE }
    ],
    extraVsAlabama: ['Official GMU polygons', 'Conservative overlap; late seasons omitted', 'Closed / permit-only GMUs have no rows but still draw'],
    accuracyNotes: [
      'Dates from official WDFW eRegulations deer general seasons page last updated May 1, 2026.',
      'GIS is official WDFW GMU layer (162 polygons, GMU_Num).',
      'Archery uses the shortest early window (through Sept 20) so GMUs that close Sept 20 never show Sept 21-25 open. Most units actually run through Sept 25.',
      'Modern firearm uses Oct 17-27 statewide so mule/3-pt units never show Oct 28-Nov 1 open. Blacktail western GMUs actually run through Nov 1 — leftover (those extra days omitted).',
      'Late archery, late muzzleloader, late modern, and high-buck wilderness hunts omitted (GMU lists differ).',
      'Closed GMUs 157, 490, 522 and permit-only 290, 329, 371, 485 are filtered out of the overlay (huntUnitWhere).',
      'Species (blacktail vs mule vs whitetail) is not a picker. A GMU can have different legal deer by species; pack shows a deer window, not species.',
      'Need a deer tag for that weapon (archery / muzzleloader / modern).'
    ]
  });
})();
