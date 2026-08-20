/* Rhode Island deer pack — official 250-RICR-60-00-9 (effective 2026-07-28) + TIGER counties.
 * Zones 1 and 2 share the mainland calendar. Zone 3 (Patience/Prudence) and Zone 4 (Block Island) omitted as extras.
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var NOTE = 'Rhode Island 250-RICR-60-00-9 effective July 28, 2026. Zones 1 and 2 share these dates. Zone 3 is archery-only islands; Zone 4 (Block Island) is a date list — omitted. Do not use stale eRegulations HTML (still 2025-26). Confirm dem.ri.gov.';
  window.RSPackLib.buildAndRegister({
    code: 'RI',
    name: 'Rhode Island',
    year: 2026,
    source: '250-RICR-60-00-9 (effective 2026-07-28)',
    agency: 'Rhode Island Department of Environmental Management Fish & Wildlife',
    agencyUrl: 'https://dem.ri.gov/natural-resources-bureau/fish-wildlife/hunting',
    lawUrl: 'https://rules.sos.ri.gov/regulations/part/250-60-00-9',
    mapUrl: 'https://dem.ri.gov/natural-resources-bureau/fish-wildlife/hunting',
    huntUnitGis: TIGER,
    huntUnitWhere: "STATE='44'",
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties (Zones 1-2 calendar)',
    confirmLabel: 'RIDEM 250-RICR-60-00-9 (2026-27)',
    minUnitCache: 4,
    hasBlm: false,
    normalizeUnitId: function (id) {
      return String(id == null ? '' : id).toUpperCase().replace(/\s+COUNTY$/, '');
    },
    regionOrder: ['U'],
    regionColors: { U: '#5b8def' },
    regionNames: { U: 'Rhode Island mainland (Zones 1-2)' },
    areas: {},
    seasons: [
      { areas: 'ALL', type: 'Archery', arch: ['2026-09-15', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Zones 1-2 archery Sept 15, 2026-Jan 31, 2027. ' + NOTE },
      { areas: 'ALL', type: 'Muzzleloader', muzzle: ['2026-11-07', '2026-12-04'], land: 'Either', target: 'Deer', limit: 'Zones 1-2 muzzleloader Nov 7-Dec 4, 2026 (first Saturday in November through Friday before first Saturday in December). ' + NOTE },
      { areas: 'ALL', type: 'Firearm', gun: ['2026-12-05', '2026-12-31'], land: 'Either', target: 'Deer', limit: 'Zones 1-2 shotgun Dec 5-31, 2026. ' + NOTE },
      { areas: 'ALL', type: 'Youth', arch: ['2026-09-12', '2026-09-13'], land: 'Either', target: 'Deer', limit: 'Zones 1-2 youth archery weekend Sept 12-13, 2026. ' + NOTE, youthOnly: true },
      { areas: 'ALL', type: 'Youth', muzzle: ['2026-10-31', '2026-11-01'], land: 'Either', target: 'Deer', limit: 'Zones 1-2 youth muzzleloader Oct 31-Nov 1, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: ['RICR town zones flattened onto 5 counties', 'Block Island / Patience / Prudence omitted'],
    accuracyNotes: [
      'Dates from official 250-RICR-60-00-9 effective July 28, 2026 — not the stale eRegulations HTML (last updated Oct 24, 2025).',
      'Overlay is Census TIGER 5 counties. Official zones are towns (Zone 1 vs 2). Both zones share the same 2026 archery/muzzleloader/shotgun calendar, so county overlay is OK for those weapons.',
      'Zone 3 (Patience and Prudence Islands) is archery-only Oct 19, 2026-Jan 31, 2027 — omitted (islands sit inside Newport County).',
      'Zone 4 (Block Island / New Shoreham) is a long list of specific days — omitted so mainland never shows those extra days. Block Island is in Washington County.',
      '2025-26 late private-land antlerless Dec 26-Jan 2 is NOT in the 2026 RICR — not encoded.'
    ]
  });
})();
