/* Colorado deer pack — CPW 2026 Big Game Brochure + official Hunting Atlas GMUs.
 * Dates transcribed from the 2026 Colorado Big Game brochure (CPW, printed Feb 2026):
 *   Archery Sept 2–30; Muzzleloader Sept 12–20; Rifle 1 Oct 14–18 (select GMUs);
 *   Rifle 2 Oct 24–Nov 1; Rifle 3 Nov 7–15; Rifle 4 Nov 18–22;
 *   Plains rifle Oct 24–Nov 3; plains archery Oct 1–23 / Nov 4–30 / Dec 15–31;
 *   plains muzzleloader Oct 10–18; plains late rifle Dec 1–14.
 * Most deer licenses are limited by hunt code. Do not treat a window as OTC.
 * Confirm https://cpw.widen.net/s/5wvx7rggrd/colorado-big-game-hunting-brochure
 */
(function () {
  var ATLAS = 'https://ndismaps.nrel.colostate.edu/arcgis/rest/services/HuntingAtlas/HuntingAtlas_Base_Map/MapServer';
  var PADUS = 'https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/Manager_Name_PADUS/FeatureServer/0/query';
  var FWS = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_PublicHuntUnits_view/FeatureServer/0/query';

  var areas = {
    1: { n:1, name:'Moffat', region:'M', herd:'D-1' },
    2: { n:2, name:'Moffat', region:'M', herd:'D-1' },
    3: { n:3, name:'Moffat', region:'M', herd:'D-2' },
    4: { n:4, name:'Moffat/Routt', region:'M', herd:'D-2' },
    5: { n:5, name:'Moffat/Routt', region:'M', herd:'D-2' },
    6: { n:6, name:'Jackson', region:'M', herd:'D-3' },
    7: { n:7, name:'Larimer', region:'M', herd:'D-4' },
    8: { n:8, name:'Larimer', region:'M', herd:'D-4' },
    9: { n:9, name:'Larimer/Weld', region:'M', herd:'D-4' },
    10: { n:10, name:'Moffat/Rio Blanco', region:'M', herd:'D-6' },
    11: { n:11, name:'Moffat/Rio Blanco', region:'M', herd:'D-7' },
    12: { n:12, name:'Moffat/Routt/Rio Blanco', region:'M', herd:'D-7' },
    13: { n:13, name:'Moffat/Routt', region:'M', herd:'D-7' },
    14: { n:14, name:'Routt/Grand', region:'M', herd:'D-2' },
    15: { n:15, name:'Routt/Grand/Eagle', region:'M', herd:'D-8' },
    16: { n:16, name:'Jackson', region:'M', herd:'D-3' },
    17: { n:17, name:'Jackson', region:'M', herd:'D-3' },
    18: { n:18, name:'Grand', region:'M', herd:'D-9' },
    19: { n:19, name:'Larimer', region:'M', herd:'D-4' },
    20: { n:20, name:'Larimer/Boulder/Weld', region:'M', herd:'D-10' },
    21: { n:21, name:'Rio Blanco/Garfield', region:'M', herd:'D-11' },
    22: { n:22, name:'Rio Blanco/Garfield', region:'M', herd:'D-7' },
    23: { n:23, name:'Rio Blanco/Garfield', region:'M', herd:'D-7' },
    24: { n:24, name:'Rio Blanco/Garfield', region:'M', herd:'D-7' },
    25: { n:25, name:'Garfield/Eagle', region:'M', herd:'D-43' },
    26: { n:26, name:'Eagle/Garfield/Routt', region:'M', herd:'D-43' },
    27: { n:27, name:'Grand/Routt', region:'M', herd:'D-9' },
    28: { n:28, name:'Grand', region:'M', herd:'D-9' },
    29: { n:29, name:'Boulder/Jefferson/Gilpin', region:'M', herd:'D-27' },
    30: { n:30, name:'Garfield/Mesa', region:'M', herd:'D-11' },
    31: { n:31, name:'Mesa/Garfield/Rio Blanco', region:'M', herd:'D-41' },
    32: { n:32, name:'Garfield', region:'M', herd:'D-41' },
    33: { n:33, name:'Garfield/Rio Blanco', region:'M', herd:'D-42' },
    34: { n:34, name:'Garfield/Eagle', region:'M', herd:'D-43' },
    35: { n:35, name:'Eagle', region:'M', herd:'D-8' },
    36: { n:36, name:'Eagle/Grand', region:'M', herd:'D-8' },
    37: { n:37, name:'Summit/Grand', region:'M', herd:'D-9' },
    38: { n:38, name:'Gilpin/Boulder/Clear Creek/Jefferson', region:'M', herd:'D-27' },
    39: { n:39, name:'Jefferson/Clear Creek/Park', region:'M', herd:'D-17' },
    40: { n:40, name:'Mesa', region:'M', herd:'D-18' },
    41: { n:41, name:'Mesa/Delta', region:'M', herd:'D-12' },
    42: { n:42, name:'Mesa/Garfield', region:'M', herd:'D-12' },
    43: { n:43, name:'Garfield/Pitkin/Eagle/Gunnison', region:'M', herd:'D-13' },
    44: { n:44, name:'Eagle', region:'M', herd:'D-14' },
    45: { n:45, name:'Eagle/Pitkin', region:'M', herd:'D-8' },
    46: { n:46, name:'Jefferson/Clear Creek/Park', region:'M', herd:'D-17' },
    47: { n:47, name:'Eagle/Pitkin', region:'M', herd:'D-13' },
    48: { n:48, name:'Lake/Chaffee', region:'M', herd:'D-15' },
    49: { n:49, name:'Lake/Park/Chaffee', region:'M', herd:'D-16' },
    50: { n:50, name:'Park', region:'M', herd:'D-38' },
    51: { n:51, name:'Douglas', region:'M', herd:'D-17' },
    52: { n:52, name:'Delta/Gunnison', region:'M', herd:'D-51' },
    53: { n:53, name:'Delta/Gunnison', region:'M', herd:'D-20' },
    54: { n:54, name:'Gunnison', region:'M', herd:'D-57' },
    55: { n:55, name:'Gunnison', region:'M', herd:'D-57' },
    56: { n:56, name:'Chaffee', region:'M', herd:'D-15' },
    57: { n:57, name:'Chaffee/Park/Fremont', region:'M', herd:'D-16' },
    58: { n:58, name:'Fremont/Park', region:'M', herd:'D-16' },
    59: { n:59, name:'Pueblo/Fremont/El Paso/Teller', region:'M', herd:'D-50' },
    60: { n:60, name:'Mesa/Montrose', region:'M', herd:'D-23' },
    61: { n:61, name:'Mesa/Montrose/Ouray/San Miguel', region:'M', herd:'D-19' },
    62: { n:62, name:'Delta/Mesa/Montrose/Ouray', region:'M', herd:'D-19' },
    63: { n:63, name:'Delta/Gunnison/Montrose', region:'M', herd:'D-20' },
    64: { n:64, name:'Delta/Montrose', region:'M', herd:'D-40' },
    65: { n:65, name:'Gunnison/Hinsdale/Montrose/Ouray', region:'M', herd:'D-40' },
    66: { n:66, name:'Gunnison/Hinsdale/Saguache', region:'M', herd:'D-57' },
    67: { n:67, name:'Gunnison/Hinsdale/Saguache', region:'M', herd:'D-57' },
    68: { n:68, name:'Saguache', region:'M', herd:'D-26' },
    69: { n:69, name:'Custer/Fremont', region:'M', herd:'D-34' },
    70: { n:70, name:'Dolores/Montrose/San Miguel', region:'M', herd:'D-24' },
    71: { n:71, name:'Dolores/Montezuma', region:'M', herd:'D-24' },
    72: { n:72, name:'Montezuma', region:'M', herd:'D-29' },
    73: { n:73, name:'Montezuma', region:'M', herd:'D-29' },
    74: { n:74, name:'La Plata/San Juan', region:'M', herd:'D-52' },
    75: { n:75, name:'La Plata/San Juan', region:'M', herd:'D-30' },
    76: { n:76, name:'Hinsdale/Mineral/Rio Grande', region:'M', herd:'D-36' },
    77: { n:77, name:'Archuleta/Hinsdale/La Plata/Mineral', region:'M', herd:'D-30' },
    78: { n:78, name:'Archuleta/Conejos/Mineral/Rio Grande', region:'M', herd:'D-30' },
    79: { n:79, name:'Alamosa/Mineral/Rio Grande/Saguache', region:'M', herd:'D-36' },
    80: { n:80, name:'Alamosa/Conejos/Mineral/Rio Grande', region:'M', herd:'D-35' },
    81: { n:81, name:'Alamosa/Archuleta/Conejos/Rio Grande', region:'M', herd:'D-35' },
    82: { n:82, name:'Alamosa/Saguache', region:'M', herd:'D-56' },
    83: { n:83, name:'Alamosa/Costilla', region:'M', herd:'D-56' },
    84: { n:84, name:'Custer/Fremont/Huerfano/Pueblo', region:'M', herd:'D-34' },
    85: { n:85, name:'Huerfano/Las Animas', region:'M', herd:'D-32' },
    86: { n:86, name:'Fremont/Custer/Chaffee', region:'M', herd:'D-34' },
    87: { n:87, name:'Larimer/Weld', region:'P', herd:'D-5' },
    88: { n:88, name:'Weld', region:'P', herd:'D-5' },
    89: { n:89, name:'Weld/Logan', region:'P', herd:'D-5' },
    90: { n:90, name:'Logan/Sedgwick', region:'P', herd:'D-5' },
    91: { n:91, name:'Sedgwick', region:'P', herd:'D-44' },
    92: { n:92, name:'Logan/Sedgwick', region:'P', herd:'D-44' },
    93: { n:93, name:'Logan/Sedgwick/Phillips', region:'P', herd:'D-54' },
    94: { n:94, name:'Larimer/Adams/Weld', region:'P', herd:'D-44' },
    95: { n:95, name:'Weld/Logan/Morgan/Washington', region:'P', herd:'D-5' },
    96: { n:96, name:'Logan/Washington/Morgan', region:'P', herd:'D-44' },
    97: { n:97, name:'Logan/Washington/Morgan', region:'P', herd:'D-54' },
    98: { n:98, name:'Logan/Phillips/Yuma/Washington', region:'P', herd:'D-54' },
    99: { n:99, name:'Weld/Morgan/Adams', region:'P', herd:'D-54' },
    100: { n:100, name:'Washington/Morgan', region:'P', herd:'D-54' },
    101: { n:101, name:'Washington/Yuma', region:'P', herd:'D-55' },
    102: { n:102, name:'Washington/Yuma', region:'P', herd:'D-55' },
    103: { n:103, name:'Yuma', region:'P', herd:'D-47' },
    104: { n:104, name:'Denver/Adams/Arapahoe/Douglas/Elbert', region:'P', herd:'D-49' },
    105: { n:105, name:'Adams/Arapahoe/Elbert', region:'P', herd:'D-49' },
    106: { n:106, name:'Arapahoe/Elbert/Washington/Lincoln', region:'P', herd:'D-49' },
    107: { n:107, name:'Washington/Lincoln/Kit Carson', region:'P', herd:'D-46' },
    109: { n:109, name:'Washington/Yuma/Kit Carson', region:'P', herd:'D-47' },
    110: { n:110, name:'El Paso', region:'P', herd:'D-48' },
    111: { n:111, name:'Elbert/Lincoln/El Paso', region:'P', herd:'D-48' },
    112: { n:112, name:'Lincoln', region:'P', herd:'D-46' },
    113: { n:113, name:'Lincoln/Cheyenne', region:'P', herd:'D-46' },
    114: { n:114, name:'Lincoln/Kit Carson/Cheyenne', region:'P', herd:'D-46' },
    115: { n:115, name:'Kit Carson/Cheyenne', region:'P', herd:'D-46' },
    116: { n:116, name:'Kit Carson/Cheyenne', region:'P', herd:'D-47' },
    117: { n:117, name:'Kit Carson/Cheyenne', region:'P', herd:'D-47' },
    118: { n:118, name:'El Paso', region:'P', herd:'D-48' },
    119: { n:119, name:'El Paso/Lincoln', region:'P', herd:'D-48' },
    120: { n:120, name:'Lincoln/Crowley/Kiowa', region:'P', herd:'D-46' },
    121: { n:121, name:'Cheyenne/Lincoln/Kiowa', region:'P', herd:'D-46' },
    122: { n:122, name:'Cheyenne/Kiowa', region:'P', herd:'D-28' },
    123: { n:123, name:'El Paso/Pueblo', region:'P', herd:'D-48' },
    124: { n:124, name:'Crowley/Pueblo', region:'P', herd:'D-48' },
    125: { n:125, name:'Bent/Crowley/Kiowa/Otero', region:'P', herd:'D-28' },
    126: { n:126, name:'Kiowa/Bent/Prowers', region:'P', herd:'D-28' },
    127: { n:127, name:'Kiowa/Prowers', region:'P', herd:'D-28' },
    128: { n:128, name:'Huerfano/Las Animas/Otero/Pueblo', region:'P', herd:'D-45' },
    129: { n:129, name:'Crowley/Otero/Pueblo', region:'P', herd:'D-28' },
    130: { n:130, name:'Otero/Bent', region:'P', herd:'D-28' },
    131: { n:131, name:'Routt/Rio Blanco', region:'M', herd:'D-7' },
    132: { n:132, name:'Prowers', region:'P', herd:'D-28' },
    133: { n:133, name:'Huerfano/Las Animas/Pueblo', region:'P', herd:'D-45' },
    134: { n:134, name:'Las Animas/Pueblo', region:'P', herd:'D-45' },
    135: { n:135, name:'Las Animas/Pueblo/Otero', region:'P', herd:'D-45' },
    136: { n:136, name:'Las Animas', region:'P', herd:'D-45' },
    137: { n:137, name:'Las Animas/Baca', region:'P', herd:'D-33' },
    138: { n:138, name:'Baca', region:'P', herd:'D-33' },
    139: { n:139, name:'Baca', region:'P', herd:'D-28' },
    140: { n:140, name:'Las Animas', region:'P', herd:'D-32' },
    141: { n:141, name:'Las Animas', region:'P', herd:'D-45' },
    142: { n:142, name:'Las Animas', region:'P', herd:'D-45' },
    143: { n:143, name:'Las Animas', region:'P', herd:'D-33' },
    144: { n:144, name:'Baca', region:'P', herd:'D-33' },
    145: { n:145, name:'Baca', region:'P', herd:'D-28' },
    146: { n:146, name:'Bent/Prowers', region:'P', herd:'D-28' },
    147: { n:147, name:'Las Animas', region:'P', herd:'D-45' },
    161: { n:161, name:'Jackson', region:'M', herd:'D-3' },
    171: { n:171, name:'Jackson', region:'M', herd:'D-3' },
    181: { n:181, name:'Grand', region:'M', herd:'D-9' },
    191: { n:191, name:'Larimer', region:'M', herd:'D-4' },
    201: { n:201, name:'Moffat', region:'M', herd:'D-1' },
    211: { n:211, name:'Moffat/Rio Blanco', region:'M', herd:'D-7' },
    214: { n:214, name:'Routt', region:'M', herd:'D-2' },
    231: { n:231, name:'Routt/Rio Blanco/Garfield', region:'M', herd:'D-7' },
    301: { n:301, name:'Moffat', region:'M', herd:'D-2' },
    361: { n:361, name:'Eagle/Grand', region:'M', herd:'D-8' },
    371: { n:371, name:'Summit', region:'M', herd:'D-9' },
    391: { n:391, name:'Jefferson/Denver/Arapahoe/Douglas', region:'M', herd:'D-17' },
    411: { n:411, name:'Mesa/Delta', region:'M', herd:'D-51' },
    421: { n:421, name:'Mesa/Garfield', region:'M', herd:'D-12' },
    431: { n:431, name:'Pitkin', region:'M', herd:'D-13' },
    441: { n:441, name:'Moffat/Routt', region:'M', herd:'D-2' },
    444: { n:444, name:'Eagle/Garfield/Pitkin', region:'M', herd:'D-53' },
    461: { n:461, name:'Jefferson/Park', region:'M', herd:'D-17' },
    471: { n:471, name:'Pitkin', region:'M', herd:'D-13' },
    481: { n:481, name:'Chaffee', region:'M', herd:'D-15' },
    500: { n:500, name:'Park', region:'M', herd:'D-38' },
    501: { n:501, name:'Park/Jefferson', region:'M', herd:'D-38' },
    511: { n:511, name:'Teller/El Paso/Park', region:'M', herd:'D-50' },
    512: { n:512, name:'El Paso', region:'M', herd:'D-50' },
    521: { n:521, name:'Delta/Gunnison', region:'M', herd:'D-51' },
    551: { n:551, name:'Gunnison/Saguache', region:'M', herd:'D-57' },
    561: { n:561, name:'Chaffee/Saguache', region:'M', herd:'D-15' },
    581: { n:581, name:'Park/Teller/Fremont', region:'M', herd:'D-16' },
    591: { n:591, name:'Pueblo/Fremont/El Paso', region:'M', herd:'D-50' },
    681: { n:681, name:'Saguache', region:'M', herd:'D-26' },
    682: { n:682, name:'Saguache', region:'M', herd:'D-26' },
    691: { n:691, name:'Custer/Fremont', region:'M', herd:'D-34' },
    711: { n:711, name:'Dolores/Montezuma/San Miguel', region:'M', herd:'D-24' },
    741: { n:741, name:'La Plata', region:'M', herd:'D-52' },
    751: { n:751, name:'Archuleta/Hinsdale/La Plata/San Juan', region:'M', herd:'D-30' },
    771: { n:771, name:'Archuleta', region:'M', herd:'D-30' },
    791: { n:791, name:'Alamosa/Mineral/Rio Grande/Saguache', region:'M', herd:'D-36' },
    851: { n:851, name:'Costilla/Las Animas', region:'M', herd:'D-32' },
    861: { n:861, name:'Huerfano', region:'M', herd:'D-34' },
    951: { n:951, name:'Weld/Morgan', region:'P', herd:'D-44' },
  };

  var regionColors = { M: '#3d7a4a', P: '#d4a017' };
  var regionNames = {
    M: 'Mountain GMUs (west / central)',
    P: 'Plains GMUs (east of I-25)'
  };
  var NOTE = 'Most deer licenses are limited by hunt code. Confirm the 2026 CPW Big Game Brochure for this GMU before hunting.';
  var mountain = [];
  var plains = [];
  Object.keys(areas).forEach(function (k) {
    var n = Number(k);
    if (areas[n].region === 'P') plains.push(n);
    else mountain.push(n);
  });
  var seasons = [
    { areas: mountain, type: 'Archery', arch: ['2026-09-02', '2026-09-30'], muzzle: null, gun: null, quota: '', land: 'Either', target: 'Deer — limited hunt code', limit: 'Mountain archery Sept 2–30 unless the hunt-code table says otherwise. ' + NOTE, closed: false },
    { areas: mountain, type: 'Muzzle', arch: null, muzzle: ['2026-09-12', '2026-09-20'], gun: null, quota: '', land: 'Either', target: 'Deer — limited hunt code', limit: 'Mountain muzzleloader Sept 12–20 unless otherwise noted. ' + NOTE, closed: false },
    { areas: mountain, type: 'Rifle1', arch: null, muzzle: null, gun: ['2026-10-14', '2026-10-18'], quota: '', land: 'Either', target: 'Deer — first rifle (select GMUs)', limit: 'First rifle Oct 14–18 in select GMUs only. ' + NOTE, closed: false },
    { areas: mountain, type: 'Rifle2', arch: null, muzzle: null, gun: ['2026-10-24', '2026-11-01'], quota: '', land: 'Either', target: 'Deer — second rifle', limit: 'Second rifle Oct 24–Nov 1. ' + NOTE, closed: false },
    { areas: mountain, type: 'Rifle3', arch: null, muzzle: null, gun: ['2026-11-07', '2026-11-15'], quota: '', land: 'Either', target: 'Deer — third rifle', limit: 'Third rifle Nov 7–15. ' + NOTE, closed: false },
    { areas: mountain, type: 'Rifle4', arch: null, muzzle: null, gun: ['2026-11-18', '2026-11-22'], quota: '', land: 'Either', target: 'Deer — fourth rifle', limit: 'Fourth rifle Nov 18–22. ' + NOTE, closed: false },
    { areas: plains, type: 'Archery', arch: ['2026-10-01', '2026-10-23'], muzzle: null, gun: null, quota: '', land: 'Either', target: 'Deer — plains archery', limit: 'Plains archery Oct 1–23. ' + NOTE, closed: false },
    { areas: plains, type: 'Archery', arch: ['2026-11-04', '2026-11-30'], muzzle: null, gun: null, quota: '', land: 'Either', target: 'Deer — plains archery', limit: 'Plains archery Nov 4–30. ' + NOTE, closed: false },
    { areas: plains, type: 'Archery', arch: ['2026-12-15', '2026-12-31'], muzzle: null, gun: null, quota: '', land: 'Either', target: 'Deer — plains archery', limit: 'Plains archery Dec 15–31. ' + NOTE, closed: false },
    { areas: plains, type: 'Muzzle', arch: null, muzzle: ['2026-10-10', '2026-10-18'], gun: null, quota: '', land: 'Either', target: 'Deer — plains muzzleloader', limit: 'Plains muzzleloader Oct 10–18. ' + NOTE, closed: false },
    { areas: plains, type: 'Rifle', arch: null, muzzle: null, gun: ['2026-10-24', '2026-11-03'], quota: '', land: 'Either', target: 'Deer — plains rifle', limit: 'Plains rifle Oct 24–Nov 3. ' + NOTE, closed: false },
    { areas: plains, type: 'RifleLate', arch: null, muzzle: null, gun: ['2026-12-01', '2026-12-14'], quota: '', land: 'Either', target: 'Deer — plains late rifle', limit: 'Plains late rifle Dec 1–14 on listed hunt codes. ' + NOTE, closed: false },
    /* Elk — same official 2026 brochure mountain windows. Plains elk not encoded (limited). */
    { species: 'elk', areas: mountain, type: 'Archery', arch: ['2026-09-02', '2026-09-30'], muzzle: null, gun: null, quota: '', land: 'Either', target: 'Elk — limited hunt code', limit: 'Mountain archery elk Sept 2–30 unless the hunt-code table says otherwise. Most licenses limited. Confirm CPW 2026 Big Game Brochure.', closed: false },
    { species: 'elk', areas: mountain, type: 'Muzzle', arch: null, muzzle: ['2026-09-12', '2026-09-20'], gun: null, quota: '', land: 'Either', target: 'Elk — limited hunt code', limit: 'Mountain muzzleloader elk Sept 12–20. Most licenses limited. Confirm CPW 2026 Big Game Brochure.', closed: false },
    { species: 'elk', areas: mountain, type: 'Rifle1', arch: null, muzzle: null, gun: ['2026-10-14', '2026-10-18'], quota: '', land: 'Either', target: 'Elk — first rifle (mostly limited)', limit: 'First rifle elk Oct 14–18. Draw-only in most GMUs. Confirm CPW 2026 Big Game Brochure.', closed: false },
    { species: 'elk', areas: mountain, type: 'Rifle2', arch: null, muzzle: null, gun: ['2026-10-24', '2026-11-01'], quota: '', land: 'Either', target: 'Elk — second rifle', limit: 'Second rifle elk Oct 24–Nov 1. Some OTC bull licenses; Gunnison 54/55/551 rifle is limited. Confirm CPW 2026 Big Game Brochure.', closed: false },
    { species: 'elk', areas: mountain, type: 'Rifle3', arch: null, muzzle: null, gun: ['2026-11-07', '2026-11-15'], quota: '', land: 'Either', target: 'Elk — third rifle', limit: 'Third rifle elk Nov 7–15. Some OTC bull licenses. Confirm CPW 2026 Big Game Brochure.', closed: false },
    { species: 'elk', areas: mountain, type: 'Rifle4', arch: null, muzzle: null, gun: ['2026-11-18', '2026-11-22'], quota: '', land: 'Either', target: 'Elk — fourth rifle', limit: 'Fourth rifle elk Nov 18–22. Confirm hunt code. Confirm CPW 2026 Big Game Brochure.', closed: false }
  ];

  function colorForArea(n) {
    var i = Number(n) || 0;
    var h = (i * 47 + 21) % 360;
    var s = 50 + (i % 5) * 5;
    var l = 42 + (i % 4) * 4;
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
  }
  function areaMeta(n) {
    return areas[Number(n)] || null;
  }
  function regionForUnit(n) {
    var m = areaMeta(n);
    if (m && m.region) return m.region;
    n = Number(n);
    if (n === 951) return 'P';
    if (n === 131) return 'M';
    if (n >= 87 && n <= 147) return 'P';
    return 'M';
  }
  function rowsForArea(n) {
    n = Number(n);
    var out = [];
    for (var i = 0; i < seasons.length; i++) {
      if (seasons[i].areas.indexOf(n) !== -1) out.push(seasons[i]);
    }
    return out;
  }
  function unitHasSpeciesSeason(id, species) {
    species = species || 'deer';
    var n = Number(id);
    var rows = [];
    for (var i = 0; i < seasons.length; i++) {
      var r = seasons[i];
      var sp = (r.species === 'elk') ? 'elk' : 'deer';
      if (sp !== species || r.closed) continue;
      if (r.areas === 'ALL' || r.areas == null) return true;
      if (r.areas && r.areas.indexOf(n) !== -1) rows.push(r);
    }
    return rows.length > 0;
  }
  function inWin(ds, win) {
    return !!(win && win[0] && win[1] && ds >= win[0] && ds <= win[1]);
  }
  function landOk(rowLand, queryLand, locSource) {
    locSource = String(locSource || '').toLowerCase();
    if (queryLand === 'Private') {
      return rowLand === 'Private' || rowLand === 'Either' || rowLand === 'OffNF';
    }
    if (rowLand === 'Private') return false;
    if (rowLand === 'OnNF') return locSource === 'usfs';
    if (rowLand === 'OffNF') return locSource !== 'usfs';
    return true;
  }
  function matchRules(areaNum, dateStr, weapon, land, locSource, species) {
    species = species || ((typeof window.currentHuntSpecies === 'function') ? window.currentHuntSpecies() : 'deer');
    var rows = rowsForArea(areaNum);
    var out = [];
    var meta = areaMeta(areaNum);
    var label = meta ? ('GMU ' + meta.n + ' — ' + meta.name) : ('GMU ' + areaNum);
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var rowSp = (r.species === 'elk') ? 'elk' : 'deer';
      if (rowSp !== species) continue;
      if (r.closed) continue;
      if (!landOk(r.land, land, locSource)) continue;
      var hit = null;
      var start = null, end = null;
      var wantArch = weapon === 'Archery' || weapon === 'Either';
      var wantMuz = weapon === 'Primitive' || weapon === 'Either';
      var wantGun = weapon === 'Gun' || weapon === 'Youth' || weapon === 'Either';
      if (wantArch && inWin(dateStr, r.arch)) {
        hit = 'Archery';
        start = r.arch[0];
        end = r.arch[1];
      } else if (wantMuz && inWin(dateStr, r.muzzle)) {
        hit = 'Primitive';
        start = r.muzzle[0];
        end = r.muzzle[1];
      } else if (wantGun && inWin(dateStr, r.gun)) {
        hit = weapon === 'Youth' ? 'Youth' : 'Gun';
        start = r.gun[0];
        end = r.gun[1];
      }
      if (!hit) continue;
      out.push({
        locId: 'co_gmu_' + areaNum,
        weapon: hit,
        land: r.land === 'Private' ? 'Private' : (r.land === 'Either' ? 'Either' : 'Public'),
        start: start,
        end: end,
        target: r.target,
        limit: r.limit,
        notes: label + ' · ' + r.type + '. Confirm CPW 2026 Big Game Brochure hunt code before hunting.'
      });
    }
    return out;
  }
  function anyOpen(areaNum, dateStr, weapon, land, locSource) {
    return matchRules(areaNum, dateStr, weapon, land, locSource).length > 0;
  }
  function layers() {
    var C = window.PUBLIC_LAND_COLORS || {};
    function sty(key, fallback) {
      return C[key] || fallback;
    }
    var wma = sty('wma', { color: '#e59a18', fillOpacity: 0.34, weight: 1.25 });
    var usfs = sty('usfs', { color: '#2f9e4f', fillOpacity: 0.16, weight: 1.0 });
    var nwr = sty('nwr', { color: '#2f9e4f', fillOpacity: 0.32, weight: 1.25 });
    var usace = sty('usace', { color: '#6b7c3a', fillOpacity: 0.32, weight: 1.25 });
    return [
      {
        key: 'usfs', label: 'National Forest', typeLabel: 'National Forest',
        url: 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_BasicOwnership_01/MapServer/0/query',
        where: "ownerclassification = 'USDA FOREST SERVICE'",
        useBbox: true, paginate: true,
        outFields: 'ownerclassification,forestname,region,objectid',
        color: usfs.color, fillOpacity: usfs.fillOpacity, weight: usfs.weight,
        listMode: 'unit', nameFields: ['forestname'],
        nameSuffix: ' (USFS)',
        drawOnMap: true, interactive: true, maxOffset: 0.00025,
        notes: 'USFS surface ownership only (USDA Forest Service). Private inholdings are not drawn. Confirm forest orders and CPW GMU hunt codes.'
      },
      {
        key: 'blm', label: 'BLM public land', typeLabel: 'BLM',
        url: PADUS,
        where: "Mang_Name = 'BLM' AND State_Nm = 'CO' AND Pub_Access = 'OA' AND FeatClass = 'Fee' AND Mang_Type <> 'PVT'",
        useBbox: true, paginate: true,
        outFields: 'Mang_Name,Unit_Nm,Loc_Nm,State_Nm,Des_Tp,Pub_Access,GIS_Acres,OBJECTID',
        color: '#c4a35a', fillOpacity: 0.22, weight: 1.05,
        listMode: 'unit', nameFields: ['Unit_Nm', 'Loc_Nm'],
        nameSuffix: ' (BLM)',
        drawOnMap: true, maxOffset: 0.00035,
        notes: 'BLM surface (PAD-US open access). Colorado has extensive BLM. Confirm field-office maps and CPW GMU seasons.'
      },
      {
        key: 'wma', label: 'State Wildlife Area', typeLabel: 'SWA',
        url: ATLAS + '/102/query',
        where: "PropType='SWA'",
        outFields: 'PropName,PropType,Acres,CPW_URL,OBJECTID',
        color: wma.color, fillOpacity: wma.fillOpacity, weight: wma.weight,
        listMode: 'unit', nameFields: ['PropName'],
        drawOnMap: true, maxOffset: 0.00004,
        notes: 'CPW State Wildlife Area. Many SWAs have local closures, weapon limits, or reservations. Confirm the property page.'
      },
      {
        key: 'walkin', label: 'Walk-In Access', typeLabel: 'Walk-In',
        url: ATLAS + '/101/query',
        where: "BigGame='Y'",
        outFields: 'COVERLABEL,COVER,BigGame,CLOSEDATE,URL,OBJECTID',
        color: '#22c55e', fillOpacity: 0.30, weight: 1.2,
        listMode: 'unit', nameFields: ['COVERLABEL'],
        nameSuffix: ' (Walk-In)',
        drawOnMap: true, maxOffset: 0.00003,
        notes: 'CPW Walk-In Access (leased). Foot traffic. Confirm CLOSEDATE, species, and permission posting.'
      },
      {
        key: 'stl', label: 'State Trust Land', typeLabel: 'STL',
        url: ATLAS + '/102/query',
        where: "PropType='STL'",
        outFields: 'PropName,PropType,Acres,CPW_URL,OBJECTID',
        color: '#a78bfa', fillOpacity: 0.26, weight: 1.15,
        listMode: 'unit', nameFields: ['PropName'],
        nameSuffix: ' (STL)',
        drawOnMap: true, maxOffset: 0.00005,
        notes: 'Colorado State Trust Land. Hunting allowed where posted open; confirm access rules and CPW GMU hunt codes.'
      },
      {
        key: 'nwr', label: 'National Wildlife Refuge', typeLabel: 'NWR',
        url: FWS,
        where: "State = 'CO' AND Organization_Type = 'NWR' AND Huntable <> 'No'",
        useBbox: true,
        outFields: 'Organization_Name,Hunt_Unit_Name,Huntable,Acreage,Organization_Code,Hunting_Website,Station_Website,Permit_Required,State,OBJECTID',
        color: nwr.color, fillOpacity: nwr.fillOpacity, weight: nwr.weight,
        listMode: 'unit', nameFields: ['Organization_Name', 'Hunt_Unit_Name'],
        noSunday: false, drawOnMap: true, maxOffset: 0,
        notes: 'FWS Public Hunt Units in Colorado. Confirm the signed refuge brochure.'
      },
      {
        key: 'usace', label: 'USACE Corps Land', typeLabel: 'USACE',
        url: PADUS,
        where: "Mang_Name = 'USACE' AND State_Nm = 'CO' AND Pub_Access = 'OA' AND FeatClass = 'Fee' AND Mang_Type <> 'PVT' AND (Des_Tp = 'REC' OR Des_Tp = 'PUB')",
        useBbox: true,
        outFields: 'Mang_Name,Unit_Nm,Loc_Nm,State_Nm,Des_Tp,Pub_Access,GIS_Acres,OBJECTID',
        color: usace.color, fillOpacity: usace.fillOpacity, weight: usace.weight,
        listMode: 'unit', nameFields: ['Unit_Nm', 'Loc_Nm'],
        nameSuffix: ' (USACE)',
        drawOnMap: true, maxOffset: 0.00015,
        notes: 'U.S. Army Corps of Engineers project land in Colorado. Confirm project office maps and CPW seasons.'
      }
    ];
  }
  window.RS_CO = {
    code: 'CO',
    year: 2026,
    source: 'CPW 2026 Colorado Big Game Brochure (deer pp. 20–34)',
    agency: 'Colorado Parks & Wildlife',
    agencyUrl: 'https://cpw.state.co.us/activities/hunting/big-game/hunting-deer',
    lawUrl: 'https://cpw.widen.net/s/5wvx7rggrd/colorado-big-game-hunting-brochure',
    mapUrl: 'https://ndismaps.nrel.colostate.edu/index.html?app=HuntingAtlas',
    regsUrl: 'https://cpw.state.co.us/rules-and-regulations',
    huntUnitGis: ATLAS + '/81/query',
    huntAreaGis: ATLAS + '/81/query',
    unitField: 'GMUID',
    unitNameField: 'COUNTY',
    regionField: '',
    outFields: 'GMUID,COUNTY,DEERDAU',
    unitLabel: 'GMU',
    overlayFoldLabel: 'Deer GMUs',
    overlayFoldLabelElk: 'Elk GMUs',
    confirmLabel: 'CPW 2026 Big Game Brochure',
    lawLabel: 'CPW 2026 Big Game Brochure — deer',
    agencyLabel: 'Colorado Parks & Wildlife — hunting deer',
    wmaNote: 'CPW State Wildlife Area. Many SWAs have local closures, weapon limits, or reservations. Confirm the property page.',
    minUnitCache: 100,
    extraToggles: [
      { key: 'wma', color: '#e59a18', text: '#111', label: 'SWA', title: 'State Wildlife Areas' },
      { key: 'walkin', color: '#22c55e', text: '#111', label: 'Walk-In', title: 'CPW Walk-In Access (big game)' },
      { key: 'stl', color: '#a78bfa', text: '#111', label: 'STL', title: 'State Trust Land' },
      { key: 'blm', color: '#c4a35a', text: '#111', label: 'BLM', title: 'BLM public land — Colorado has this; Alabama does not' },
      { key: 'forestNwr', color: '#2f9e4f', text: '#fff', label: 'Forest/NWR', title: 'National Forests & NWR' },
      { key: 'usace', color: '#6b7c3a', text: '#fff', label: 'USACE', title: 'U.S. Army Corps of Engineers' }
    ],
    areas: areas,
    seasons: seasons,
    regionColors: regionColors,
    regionNames: regionNames,
    regionOrder: ['M', 'P'],
    colorForArea: colorForArea,
    areaMeta: areaMeta,
    regionForUnit: regionForUnit,
    rowsForArea: rowsForArea,
    unitHasSpeciesSeason: unitHasSpeciesSeason,
    matchRules: matchRules,
    anyOpen: anyOpen,
    layers: layers,
    extraVsAlabama: [
      'Numbered GMUs (not A–E letters) with official CPW Hunting Atlas borders',
      'Most deer licenses limited by hunt code (draw / leftover) — not a general statewide tag',
      'Over-the-counter white-tailed-only licenses in some units (see brochure pp. 33–34)',
      'Mountain vs plains season calendars',
      'Four regular rifle seasons plus plains rifle and plains late rifle',
      'State Wildlife Areas (SWA) instead of Alabama WMAs',
      'Walk-In Access program',
      'State Trust Lands (STL)',
      'Extensive BLM public land (Alabama has none)',
      'Ranching for Wildlife and private-land-only hunt codes (confirm brochure; not listed as public destinations)'
    ]
  };
  window.RS_PACKS = window.RS_PACKS || {};
  window.RS_PACKS.CO = window.RS_CO;
  if (typeof window.registerStatePack === 'function') window.registerStatePack(window.RS_CO);
})();
