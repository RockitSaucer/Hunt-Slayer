/* Delaware deer pack — DNREC / eRegulations deer seasons (page last updated June 25, 2026).
 * Seasons are statewide. Overlay uses official Census TIGER counties (location only).
 * Source: https://www.eregulations.com/delaware/hunting/deer-seasons
 */
(function () {
  var TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query';
  var areas = {
    'Kent County': { n: 'Kent', name: 'Kent County', region: 'U' },
    'New Castle County': { n: 'New Castle', name: 'New Castle County', region: 'U' },
    'Sussex County': { n: 'Sussex', name: 'Sussex County', region: 'U' }
  };
  var ALL = Object.keys(areas);
  var NOTE = 'Statewide 2026-27 DNREC deer dates. Confirm the Delaware Hunting and Trapping Guide. Wildlife-area hunts can differ.';
  window.RSPackLib.buildAndRegister({
    code: 'DE',
    name: 'Delaware',
    year: 2026,
    source: 'DNREC eRegulations Deer Seasons (updated June 25, 2026)',
    agency: 'Delaware DNREC Division of Fish and Wildlife',
    agencyUrl: 'https://dnrec.delaware.gov/fish-wildlife/hunting/seasons/',
    lawUrl: 'https://www.eregulations.com/delaware/hunting/deer-seasons',
    mapUrl: 'https://www.eregulations.com/assets/docs/resources/DE/DE-Wildlife-Management-Zones-2026.pdf',
    huntUnitGis: TIGER,
    unitField: 'NAME',
    unitNameField: 'NAME',
    outFields: 'NAME,STATE,COUNTY,GEOID',
    unitLabel: 'County',
    overlayFoldLabel: 'Counties (seasons are statewide)',
    confirmLabel: 'DNREC 2026-27 Hunting Guide',
    lawLabel: 'Delaware deer seasons (eRegulations, June 25, 2026)',
    agencyLabel: 'DNREC — hunting seasons',
    minUnitCache: 3,
    hasBlm: false,
    huntUnitWhere: "STATE='10'",
    normalizeUnitId: function (id) {
      var s = String(id == null ? '' : id);
      if (/kent/i.test(s)) return 'Kent County';
      if (/castle/i.test(s)) return 'New Castle County';
      if (/sussex/i.test(s)) return 'Sussex County';
      return s;
    },
    regionOrder: ['U'],
    regionColors: { U: '#486a2f' },
    regionNames: { U: 'Delaware counties (statewide dates)' },
    areas: areas,
    seasons: [
      { areas: ALL, type: 'Archery', arch: ['2026-09-01', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Archery/crossbow statewide Sept 1, 2026-Jan 31, 2027. ' + NOTE },
      { areas: ALL, type: 'Muzzleloader', muzzle: ['2026-10-09', '2026-10-18'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Oct 9-18, 2026. ' + NOTE },
      { areas: ALL, type: 'Muzzleloader', muzzle: ['2027-01-25', '2027-01-31'], land: 'Either', target: 'Deer', limit: 'Muzzleloader Jan 25-31, 2027. ' + NOTE },
      { areas: ALL, type: 'Firearm', gun: ['2026-11-13', '2026-11-22'], land: 'Either', target: 'Deer', limit: 'General firearm Nov 13-22, 2026. ' + NOTE },
      { areas: ALL, type: 'Firearm', gun: ['2027-01-16', '2027-01-24'], land: 'Either', target: 'Deer', limit: 'General firearm Jan 16-24, 2027. ' + NOTE },
      { areas: ALL, type: 'Antlerless', gun: ['2026-10-02', '2026-10-04'], land: 'Either', target: 'Antlerless (archery may take antlered)', limit: 'Special antlerless Oct 2-4, 2026. Firearms: antlerless only. ' + NOTE },
      { areas: ALL, type: 'Antlerless', gun: ['2026-10-23', '2026-10-25'], land: 'Either', target: 'Antlerless (archery may take antlered)', limit: 'Special antlerless Oct 23-25, 2026. ' + NOTE },
      { areas: ALL, type: 'Antlerless', gun: ['2026-10-30', '2026-10-31'], land: 'Either', target: 'Antlerless (archery may take antlered)', limit: 'Special antlerless Oct 30-31, 2026. ' + NOTE },
      { areas: ALL, type: 'Antlerless', gun: ['2026-12-12', '2026-12-20'], land: 'Either', target: 'Antlerless (archery may take antlered)', limit: 'Special antlerless Dec 12-20, 2026. ' + NOTE },
      { areas: ALL, type: 'Youth', gun: ['2026-09-26', '2026-09-27'], land: 'Either', target: 'Deer', limit: 'Youth and non-ambulatory Sept 26-27, 2026. ' + NOTE, youthOnly: true },
      { areas: ALL, type: 'Youth', gun: ['2026-11-07', '2026-11-08'], land: 'Either', target: 'Deer', limit: 'Youth and non-ambulatory Nov 7-8, 2026. ' + NOTE, youthOnly: true }
    ],
    extraVsAlabama: [
      'Statewide calendar (not letter zones)',
      'January firearm and muzzleloader segments',
      'Special antlerless weekends',
      'Handgun/straight-wall season Jan 2-10 closed in WMZ 1A and 1B (not encoded as a separate overlay)'
    ],
    accuracyNotes: [
      'Dates from official eRegulations deer seasons page last updated June 25, 2026.',
      'Hunt-unit overlay is Census counties because seasons are statewide. Wildlife Management Zones 1A/1B (handgun closure) are not drawn.',
      'WMA-specific managed hunts are not in this pack.',
      'Jan 2-10 handgun/straight-wall season omitted from Gun windows (zones 1A/1B closed); confirm guide if using those firearms in January.'
    ]
  });
})();
