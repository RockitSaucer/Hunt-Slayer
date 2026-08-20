/* Arizona deer pack — official 2026-27 AZGFD regulations PDF (OTC archery) + AGFD GMU GIS.
 * General/muzzleloader/youth rifle are hunt-number draws and are NOT encoded.
 * OTC archery harvest limits can close a unit mid-season — hunter must check harvest-tracking.azgfd.gov.
 */
(function () {
  var GIS = 'https://services1.arcgis.com/UpxtrwRYNaXVpkGe/arcgis/rest/services/AGFD_Management_Unit_Boundaries/FeatureServer/0/query';
  var NOTE = 'AZGFD 2026-27 Hunting Regulations (official PDF). OTC archery only. Harvest limits can close a unit at sundown the following Wednesday. Draw hunts (general/muzzleloader/youth) omitted. Confirm azgfd.com.';

  var R1 = ['1','2A','2B','2C','3A','3B','3C','4A','4B','27'];
  var R2 = ['5A','5B','6A','6B','7','8','9','11M','12A','12B','13A','13B'];
  var R3 = ['10','15A','15B','15C','15D','16A','17A','17B','18A','18B','19A','19B','20A'];
  var R4 = ['16B','20C','39','40A','40B','41','42','43A','43B','44A','44B','45A','45B','45C','46A','46B'];
  var R5 = ['28','29','30A','30B','31','32','33','34A','34B','35A','35B','36A','36B','36C','37A','37B','38M'];
  var R6 = ['20B','21','22','23','24A','24B','25M','26M'];

  var AUG = ['2A','2B','2C','3B','4A','4B','5A','5B','6A','6B','7','8','9','10','15A','15B','15C','15D','16A','17B','18A','18B','19A','19B','20A','20B','20C','21','22','23','24A','24B','28','29','30A','30B','31','32','33','34A','34B','35A','35B','36A','36B','36C'];
  var DEC = ['4A','4B','5A','5B','6A','6B','7','8','9','10','15A','15B','15C','15D','16A','17B','18A','18B','19A','19B','20A','20B','20C','21','22','23','24A','24B','25M','26M','27','28','29','30A','30B','31','32','33','34A','34B','35A','35B','36A','36B','36C','37A','37B','38M','39','40A','40B','41','42','43A','43B','44A','44B'];
  var JAN_ONLY = ['45A','45B','45C','46A','46B'];

  function norm(id) {
    return String(id == null ? '' : id).toUpperCase().replace(/^UNIT\s+/, '').replace(/^GMU\s+/, '').replace(/\s+/g, '');
  }
  function regionOf(id) {
    var s = norm(id);
    if (R1.indexOf(s) !== -1) return 'I';
    if (R2.indexOf(s) !== -1) return 'II';
    if (R3.indexOf(s) !== -1) return 'III';
    if (R4.indexOf(s) !== -1) return 'IV';
    if (R5.indexOf(s) !== -1) return 'V';
    if (R6.indexOf(s) !== -1) return 'VI';
    return 'U';
  }

  window.RSPackLib.buildAndRegister({
    code: 'AZ',
    name: 'Arizona',
    year: 2026,
    source: 'AZGFD 2026-27 Hunting Regulations PDF (Commission Order 2, OTC archery tables)',
    agency: 'Arizona Game and Fish Department',
    agencyUrl: 'https://www.azgfd.com/hunting/regulations/',
    lawUrl: 'https://azgfd-portal-wordpress-pantheon.s3.us-west-2.amazonaws.com/wp-content/uploads/2026/05/04081122/2026-27-Arizona-Hunting-Regulations.pdf',
    mapUrl: 'https://www.azgfd.com/hunting/where-to-hunt/',
    huntUnitGis: GIS,
    unitField: 'GMUNAME',
    unitNameField: 'GMUNAME',
    outFields: 'GMUNAME,REG_NAME,GF_REGION,OBJECTID',
    unitLabel: 'GMU',
    overlayFoldLabel: 'Game management units',
    confirmLabel: 'AZGFD 2026-27 hunting regulations',
    minUnitCache: 70,
    hasBlm: true,
    normalizeUnitId: norm,
    regionForUnit: regionOf,
    regionOrder: ['I', 'II', 'III', 'IV', 'V', 'VI', 'U'],
    regionColors: { I: '#e0913c', II: '#5b8def', III: '#2f9e4f', IV: '#a78bfa', V: '#c45c26', VI: '#0ea5e9', U: '#64748b' },
    regionNames: {
      I: 'Region I (Pinetop)',
      II: 'Region II (Flagstaff)',
      III: 'Region III (Kingman)',
      IV: 'Region IV (Yuma)',
      V: 'Region V (Tucson)',
      VI: 'Region VI (Mesa)',
      U: 'Other / unmatched GMU label'
    },
    areas: {},
    seasons: [
      { areas: AUG, type: 'Archery', arch: ['2026-08-21', '2026-09-10'], land: 'Either', target: 'Antlered deer (OTC harvest limit)', limit: 'OTC archery Aug 21-Sep 10, 2026. Harvest limit can close the unit. ' + NOTE },
      { areas: DEC, type: 'Archery', arch: ['2026-12-11', '2027-01-31'], land: 'Either', target: 'Antlered deer (OTC harvest limit)', limit: 'OTC archery Dec 11, 2026-Jan 31, 2027. New-year tag required in January. Harvest limit can close the unit. ' + NOTE },
      { areas: JAN_ONLY, type: 'Archery', arch: ['2027-01-01', '2027-01-31'], land: 'Either', target: 'Antlered deer (OTC harvest limit)', limit: 'OTC archery Jan 1-31, 2027 (units 45A-C, 46A-B). Harvest limit can close the unit. ' + NOTE }
    ],
    extraVsAlabama: ['OTC archery only — draw rifle/muzzleloader omitted', 'Harvest-limit mid-season closures', 'AZGFD regions I-VI colors'],
    accuracyNotes: [
      'OTC archery dates transcribed from official 2026-27 AZGFD PDF Commission Order 2 (pages 31-33).',
      'GIS is AGFD Management Unit Boundaries (80 polygons, field GMUNAME). 15BE/15BW-style splits may be combined. Metadata is not the 2026 legal description (R12-4-108).',
      'General, muzzleloader, CHAMP, and youth-only deer are hunt-number draws and are not encoded — those days stay closed in the engine.',
      'Units with no OTC row (including 1, 3A, 3C, 11M, 12A/B, 13A/B, 16B, 17A) have no archery rows.',
      'Harvest limits can close a unit before the printed end date. Engine cannot know live harvest-tracking.azgfd.gov status.',
      'January hunts need a new calendar-year nonpermit-tag.',
      'WMA / state-hunt-land dates are not encoded.'
    ]
  });
})();
