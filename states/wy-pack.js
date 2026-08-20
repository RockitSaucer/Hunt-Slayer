/* Wyoming deer pack — WGFD Chapter 6 (2026) + official 2026 hunt-area GIS.
 * Do not invent dates. Confirm https://wgfd.wyo.gov/media/33694 before hunting.
 */
(function () {
  var GIS = 'https://services6.arcgis.com/cWzdqIyxbijuhPLw/arcgis/rest/services';
  var PADUS = 'https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/Manager_Name_PADUS/FeatureServer/0/query';
  var FWS = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_PublicHuntUnits_view/FeatureServer/0/query';

  var areas = {
    1: { n:1, name:'Crook', region:'A', herd:'Black Hills' },
    2: { n:2, name:'Bearlodge', region:'A', herd:'Black Hills' },
    3: { n:3, name:'Keyhole', region:'A', herd:'Black Hills' },
    4: { n:4, name:'Sand Creek', region:'A', herd:'Black Hills' },
    5: { n:5, name:'Inyan Kara', region:'A', herd:'Black Hills' },
    6: { n:6, name:'Skull Creek', region:'A', herd:'Black Hills' },
    7: { n:7, name:'South Osage', region:'B', herd:'Cheyenne River' },
    8: { n:8, name:'Upton-Four Horse', region:'B', herd:'Cheyenne River' },
    9: { n:9, name:'Blacktail Creek', region:'B', herd:'Cheyenne River' },
    10: { n:10, name:'Rochelle Hills', region:'B', herd:'Cheyenne River' },
    11: { n:11, name:'Mule Creek', region:'B', herd:'Cheyenne River' },
    12: { n:12, name:'Hat Creek', region:'B', herd:'Cheyenne River' },
    13: { n:13, name:'Lusk', region:'B', herd:'Cheyenne River' },
    14: { n:14, name:'Twenty Mile', region:'B', herd:'Cheyenne River' },
    15: { n:15, name:'Southeast Wyoming', region:'T', herd:'Goshen Rim' },
    17: { n:17, name:'Northwest Gillette', region:'C', herd:'Powder River' },
    18: { n:18, name:'Campbell', region:'C', herd:'Powder River' },
    19: { n:19, name:'Pumpkin Buttes', region:'C', herd:'Pumpkin Buttes' },
    21: { n:21, name:'Thunder Basin', region:'B', herd:'Cheyenne River' },
    22: { n:22, name:'Douglas', region:'B', herd:'North Converse' },
    23: { n:23, name:'Clearmont', region:'C', herd:'Powder River' },
    24: { n:24, name:'Sheridan', region:'Y', herd:'North Bighorn' },
    25: { n:25, name:'Tongue-Goose', region:'Y', herd:'North Bighorn' },
    26: { n:26, name:'Ucross', region:'C', herd:'Powder River' },
    27: { n:27, name:'Buffalo', region:'Y', herd:'North Bighorn' },
    28: { n:28, name:'Hunter Mesa', region:'Y', herd:'North Bighorn' },
    29: { n:29, name:'Johnson', region:'C', herd:'Pumpkin Buttes' },
    30: { n:30, name:'Upper Powder River', region:'Y', herd:'Upper Powder River' },
    31: { n:31, name:'Salt Creek', region:'C', herd:'Pumpkin Buttes' },
    32: { n:32, name:'Beartrap Creek', region:'Y', herd:'Upper Powder River' },
    33: { n:33, name:'Red Fork', region:'Y', herd:'Upper Powder River' },
    34: { n:34, name:'North Natrona', region:'Q', herd:'North Natrona' },
    35: { n:35, name:'Upper Nowood', region:'M', herd:'Southwest Bighorn' },
    36: { n:36, name:'Badwater', region:'M', herd:'Southwest Bighorn' },
    37: { n:37, name:'Copper Mountain', region:'M', herd:'Southwest Bighorn' },
    39: { n:39, name:'Bates Creek', region:'M', herd:'Southwest Bighorn' },
    40: { n:40, name:'Buffalo Creek', region:'M', herd:'Southwest Bighorn' },
    41: { n:41, name:'Lower Nowood', region:'R', herd:'Paintrock' },
    46: { n:46, name:'Cloud Peak', region:'R', herd:'Paintrock' },
    47: { n:47, name:'Webber Canyon', region:'R', herd:'Paintrock' },
    50: { n:50, name:'Upper Shell-Beaver Creek', region:'R', herd:'North Bighorn' },
    51: { n:51, name:'Beaver Creek', region:'R', herd:'North Bighorn' },
    52: { n:52, name:'Crystal Creek', region:'R', herd:'North Bighorn' },
    53: { n:53, name:'Devils Canyon', region:'R', herd:'North Bighorn' },
    59: { n:59, name:'South Laramie Mountains', region:'J', herd:'Laramie Mountains' },
    60: { n:60, name:'Pole Mountain', region:'J', herd:'Laramie Mountains' },
    61: { n:61, name:'Harriman', region:'J', herd:'Sheep Mountain' },
    64: { n:64, name:'Laramie Peak', region:'J', herd:'Laramie Mountains' },
    65: { n:65, name:'South Converse', region:'J', herd:'South Converse' },
    66: { n:66, name:'Bates Hole-Hat Six', region:'D', herd:'Bates Hole/Hat Six' },
    67: { n:67, name:'Casper Mountain', region:'D', herd:'Bates Hole/Hat Six' },
    70: { n:70, name:'Shirley Mountain', region:'D', herd:'Shirley Mountain' },
    74: { n:74, name:'Kyle', region:'D', herd:'Sheep Mountain' },
    75: { n:75, name:'Four Mile', region:'D', herd:'Sheep Mountain' },
    76: { n:76, name:'Sheep Mountain', region:'D', herd:'Sheep Mountain' },
    77: { n:77, name:'Boulder Ridge', region:'D', herd:'Sheep Mountain' },
    78: { n:78, name:'French Creek', region:'D', herd:'Platte Valley' },
    79: { n:79, name:'Kennaday Peak', region:'D', herd:'Platte Valley' },
    80: { n:80, name:'Spring Creek', region:'D', herd:'Platte Valley' },
    81: { n:81, name:'Blackhall', region:'D', herd:'Platte Valley' },
    82: { n:82, name:'Baggs', region:'W', herd:'Baggs' },
    84: { n:84, name:'Atlantic Rim', region:'W', herd:'Baggs' },
    87: { n:87, name:'Ferris', region:'Q', herd:'Ferris' },
    88: { n:88, name:'Kendrick', region:'D', herd:'Rattlesnake' },
    89: { n:89, name:'Rattlesnake', region:'Q', herd:'Rattlesnake' },
    90: { n:90, name:'Muskrat', region:'Q', herd:'Beaver Rim' },
    92: { n:92, name:'Table Mountain', region:'L', herd:'South Wind River' },
    94: { n:94, name:'Twin Creek', region:'L', herd:'South Wind River' },
    96: { n:96, name:'Green Mountain', region:'Q', herd:'Sweetwater' },
    97: { n:97, name:'Sweetwater Rocks', region:'Q', herd:'Sweetwater' },
    98: { n:98, name:'Chain Lakes', region:'Q', herd:'Chain Lakes' },
    100: { n:100, name:'South Wamsutter', region:'W', herd:'Baggs' },
    101: { n:101, name:'Black Butte', region:'W', herd:'South Rock Springs' },
    102: { n:102, name:'Aspen Mountain', region:'W', herd:'South Rock Springs' },
    105: { n:105, name:'Beartooth', region:'F', herd:'Clark\'s Fork' },
    106: { n:106, name:'Crandall-Sunlight', region:'F', herd:'Clark\'s Fork' },
    109: { n:109, name:'Bald Ridge', region:'F', herd:'Clark\'s Fork' },
    110: { n:110, name:'Grinnell', region:'F', herd:'Upper Shoshone' },
    111: { n:111, name:'Elk Fork', region:'F', herd:'Upper Shoshone' },
    112: { n:112, name:'Ishawooa', region:'F', herd:'Upper Shoshone' },
    113: { n:113, name:'Boulder', region:'F', herd:'Upper Shoshone' },
    114: { n:114, name:'Wall Mountain', region:'F', herd:'Upper Shoshone' },
    115: { n:115, name:'Thorofare', region:'F', herd:'Upper Shoshone' },
    116: { n:116, name:'Meeteetse', region:'F', herd:'Owl Creek/Meeteetse' },
    117: { n:117, name:'Franc\'s Peak', region:'F', herd:'Owl Creek/Meeteetse' },
    118: { n:118, name:'Upper Gooseberry Creek', region:'F', herd:'Owl Creek/Meeteetse' },
    119: { n:119, name:'Anchor', region:'F', herd:'Owl Creek/Meeteetse' },
    120: { n:120, name:'Hamilton Dome', region:'F', herd:'Owl Creek/Meeteetse' },
    121: { n:121, name:'Heart Mountain', region:'X', herd:'Shoshone River' },
    122: { n:122, name:'Shoshone River', region:'X', herd:'Shoshone River' },
    123: { n:123, name:'Yellowtail', region:'X', herd:'Shoshone River' },
    124: { n:124, name:'Emblem', region:'X', herd:'Greybull River' },
    125: { n:125, name:'Fifteen Mile', region:'X', herd:'Basin' },
    127: { n:127, name:'Cottonwood', region:'X', herd:'Basin' },
    128: { n:128, name:'Wind River', region:'L', herd:'Dubois' },
    130: { n:130, name:'Big Sandy', region:'H', herd:'Sublette' },
    131: { n:131, name:'Steamboat', region:'W', herd:'Sublette' },
    132: { n:132, name:'Cedar Mountain', region:'K', herd:'Uinta' },
    133: { n:133, name:'Uinta', region:'K', herd:'Uinta' },
    134: { n:134, name:'Bear River Divide', region:'K', herd:'Wyoming Range' },
    135: { n:135, name:'West Green River', region:'G', herd:'Wyoming Range' },
    138: { n:138, name:'Boulder', region:'H', herd:'Sublette' },
    139: { n:139, name:'Pinedale', region:'H', herd:'Sublette' },
    140: { n:140, name:'New Fork', region:'H', herd:'Sublette' },
    141: { n:141, name:'Green River', region:'H', herd:'Sublette' },
    142: { n:142, name:'Piney-Horse Creek', region:'H', herd:'Sublette' },
    143: { n:143, name:'South Piney', region:'G', herd:'Wyoming Range' },
    144: { n:144, name:'Greys River', region:'G', herd:'Wyoming Range' },
    145: { n:145, name:'Salt River', region:'G', herd:'Wyoming Range' },
    148: { n:148, name:'Teton', region:'F', herd:'Upper Shoshone' },
    149: { n:149, name:'Targhee', region:'H', herd:'Targhee' },
    150: { n:150, name:'Wilson', region:'H', herd:'Sublette' },
    151: { n:151, name:'Fall Creek', region:'H', herd:'Sublette' },
    152: { n:152, name:'Lower Hoback', region:'H', herd:'Sublette' },
    153: { n:153, name:'Monument Ridge', region:'H', herd:'Sublette' },
    154: { n:154, name:'Raspberry Ridge', region:'H', herd:'Sublette' },
    155: { n:155, name:'Crystal Peak', region:'H', herd:'Sublette' },
    156: { n:156, name:'Spread Creek', region:'L', herd:'Dubois' },
    157: { n:157, name:'Boysen', region:'L', herd:'Project' },
    160: { n:160, name:'Beaver Creek', region:'L', herd:'South Wind River' },
    163: { n:163, name:'Middle Fork', region:'Y', herd:'Upper Powder River' },
    164: { n:164, name:'Nowater', region:'M', herd:'Southwest Bighorn' },
    165: { n:165, name:'YU Bench', region:'X', herd:'Greybull River' },
    168: { n:168, name:'Medicine Butte', region:'K', herd:'Uinta' },
    169: { n:169, name:'Tisdale Mountain', region:'Y', herd:'Upper Powder River' },
    171: { n:171, name:'Crowheart Butte', region:'L', herd:'Project' },
  };
  var regionColors = {
    A: '#8a8a8a',
    B: '#e6d29a',
    C: '#e0913c',
    D: '#7dcf9a',
    F: '#5b8def',
    G: '#c026d3',
    H: '#14b8a6',
    J: '#9a8b3a',
    K: '#f97316',
    L: '#84cc16',
    M: '#a78bfa',
    Q: '#fb7185',
    R: '#38bdf8',
    T: '#fbbf24',
    W: '#34d399',
    X: '#f472b6',
    Y: '#60a5fa',
  };
  var regionNames = {
    A: 'Region A · Black Hills 1–6',
    B: 'Region B · NE plains',
    C: 'Region C · Powder River',
    D: 'Region D · Shirley / Platte',
    F: 'Region F · NW mountains / Teton',
    G: 'Region G · Wyoming Range west',
    H: 'Region H · Sublette',
    J: 'Region J · Laramie Peak',
    K: 'Region K · Uinta',
    L: 'Region L · Wind River / Boysen',
    M: 'Region M · SW Bighorn',
    Q: 'Region Q · Central basin',
    R: 'Region R · Bighorn east',
    T: 'Region T · SE Wyoming',
    W: 'Region W · Baggs / Steamboat',
    X: 'Region X · Bighorn Basin',
    Y: 'Region Y · Bighorn / Powder',
  };
  var seasons = [
    { areas:[1], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'', land:'Either', target:'Antlered deer', limit:'Antlered deer valid entire area; any white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[1,2,3], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'350', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[2], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'', land:'Either', target:'Antlered deer', limit:'Antlered deer valid entire area; any white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[3], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'', land:'Either', target:'Antlered deer', limit:'Antlered deer valid entire area; any white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[4], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'', land:'Either', target:'Antlered deer', limit:'Antlered deer; State of Wyoming Ranch A property is closed', muzzleOnly:false, closed:false },
    { areas:[4], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'25', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[5], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'', land:'Either', target:'Antlered deer', limit:'Antlered deer', muzzleOnly:false, closed:false },
    { areas:[6], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'', land:'Either', target:'Antlered deer', limit:'Antlered deer', muzzleOnly:false, closed:false },
    { areas:[7], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-15'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[8], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-15'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[8], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[8], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'50', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[9], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-15'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[10], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-21'], quota:'75', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[10], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'25', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[10], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'25', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[11], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-15'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[11], type:'Gen', arch:null, gun:['2026-10-16','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[11,12,13,14], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'200', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[11,12,13,14], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'150', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[12], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-15'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[12], type:'Gen', arch:null, gun:['2026-10-16','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[13], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-15'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[13], type:'Gen', arch:null, gun:['2026-10-16','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[14], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-15'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[14], type:'Gen', arch:null, gun:['2026-10-16','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[15], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-20','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[15], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'500', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[15], type:'3', arch:null, gun:['2026-12-01','2026-12-31'], quota:'', land:'Either', target:'Antlerless white-tailed deer', limit:'Antlerless white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[15], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'150', land:'Private', target:'Doe or fawn', limit:'Doe or fawn valid on private land', muzzleOnly:false, closed:false },
    { areas:[15], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'450', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[17], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[17], type:'Gen', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[17], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'250', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[18], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[18], type:'Gen', arch:null, gun:['2026-11-01','2026-11-15'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[18], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-15'], quota:'200', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[19], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[19], type:'Gen', arch:null, gun:['2026-11-01','2026-11-15'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[19], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-15'], quota:'75', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[21], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-15'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[21], type:'Gen', arch:null, gun:['2026-11-01','2026-11-15'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[21], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-31'], quota:'50', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[22], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'400', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[22], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'75', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[22], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'100', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[23], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[23], type:'Gen', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[23,26], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-30'], quota:'500', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[23], type:'7', arch:null, gun:['2026-09-01','2026-12-15'], quota:'25', land:'Private', target:'Doe or fawn', limit:'Doe or fawn valid on private land', muzzleOnly:false, closed:false },
    { areas:[23,26], type:'8', arch:null, gun:['2026-09-01','2026-12-15'], quota:'1000', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[24], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[24], type:'Gen', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[24], type:'3', arch:null, gun:['2026-10-15','2026-10-31'], quota:'500', land:'Private', target:'Any white-tailed deer', limit:'Any white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[24], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer valid in the entire area', muzzleOnly:false, closed:false },
    { areas:[24], type:'7', arch:null, gun:['2026-09-01','2026-12-15'], quota:'25', land:'Private', target:'Doe or fawn', limit:'Doe or fawn valid on private land', muzzleOnly:false, closed:false },
    { areas:[24], type:'8', arch:null, gun:['2026-09-01','2026-12-15'], quota:'3000', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[25], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[26], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[26], type:'Gen', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[27], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[27], type:'Gen', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[27], type:'8', arch:null, gun:['2026-09-01','2026-09-30'], quota:'1200', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[27], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid in the entire area; also valid in Area 28', muzzleOnly:false, closed:false },
    { areas:[27], type:'8', arch:null, gun:['2026-12-01','2026-12-31'], quota:'', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[28], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[28], type:'Gen', arch:null, gun:['2026-10-25','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[29], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[29], type:'Gen', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[29], type:'Gen', arch:null, gun:['2026-12-01','2026-12-31'], quota:'', land:'Either', target:'Antlerless white-tailed deer', limit:'Antlerless white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[29,31], type:'8', arch:null, gun:['2026-09-01','2026-09-30'], quota:'700', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[29,31], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid in the entire area', muzzleOnly:false, closed:false },
    { areas:[30], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[30], type:'Gen', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[30], type:'Gen', arch:null, gun:['2026-12-01','2026-12-31'], quota:'', land:'Either', target:'Antlerless white-tailed deer', limit:'Antlerless white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[30,32,33,163,169], type:'8', arch:null, gun:['2026-09-01','2026-09-30'], quota:'1000', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[30,32,33,163,169], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-12-31'], quota:'', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid in the entire area', muzzleOnly:false, closed:false },
    { areas:[31], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-10'], quota:'', land:'Either', target:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[32], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-21'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[32], type:'Gen', arch:null, gun:['2026-11-01','2026-11-15'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[33], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[33], type:'Gen', arch:null, gun:['2026-11-01','2026-11-15'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[33], type:'Gen', arch:null, gun:['2026-11-16','2026-12-31'], quota:'', land:'Either', target:'Antlerless white-tailed deer', limit:'Antlerless white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[34], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'125', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[34], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[34], type:'7', arch:null, gun:['2026-08-15','2026-12-15'], quota:'25', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid east of Bucknum Road (Natrona CR 125) and south of Burlington Northern Santa Fe railroad right-of-way', muzzleOnly:false, closed:false },
    { areas:[34], type:'8', arch:null, gun:['2026-08-15','2026-12-15'], quota:'75', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[35], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[36], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'125', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[36], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'25', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[37], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'50', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[37,39], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-15'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[37], type:'7', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-11-30'], quota:'25', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1/2 mile of irrigated land within the Buffalo Creek drainage', muzzleOnly:false, closed:false },
    { areas:[37,39], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-12-15'], quota:'50', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[39], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[40], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[40], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer; also valid in Area 35', muzzleOnly:false, closed:false },
    { areas:[40], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'150', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer; also valid in Area 35', muzzleOnly:false, closed:false },
    { areas:[41], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[41], type:'Gen', arch:null, gun:['2026-10-25','2026-10-31'], quota:'', land:'Either', target:'Any deer', limit:'Any deer valid on or within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[41], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-12-15'], quota:'75', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[41], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-15'], quota:'25', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[41], type:'8', arch:null, gun:['2026-09-01','2026-12-31'], quota:'150', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer; also valid in Area 46', muzzleOnly:false, closed:false },
    { areas:[46], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[47], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[47], type:'Gen', arch:null, gun:['2026-10-25','2026-10-31'], quota:'', land:'Either', target:'Any deer', limit:'Any deer valid on or within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[47,51,52], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-12-15'], quota:'75', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[47], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-15'], quota:'25', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[47], type:'8', arch:null, gun:['2026-09-01','2026-12-31'], quota:'75', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer; also valid in Area 46', muzzleOnly:false, closed:false },
    { areas:[50], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[51], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[51], type:'Gen', arch:null, gun:['2026-10-25','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer valid on or within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[51], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-15'], quota:'75', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[51], type:'8', arch:null, gun:['2026-09-01','2026-12-31'], quota:'100', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[52], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[52], type:'Gen', arch:null, gun:['2026-10-25','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer valid on or within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[52], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'25', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[53], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (3+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[59], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-20','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[59,64], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'250', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[59,64], type:'3', arch:null, gun:['2026-12-01','2026-12-31'], quota:'', land:'Either', target:'Antlerless white-tailed deer', limit:'Antlerless white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[59,64], type:'6', arch:['2026-09-01','2026-09-30'], gun:['2026-10-20','2026-10-31'], quota:'100', land:'Private', target:'Doe or fawn', limit:'Doe or fawn valid on private land', muzzleOnly:false, closed:false },
    { areas:[59,64], type:'6', arch:null, gun:['2026-11-01','2026-12-31'], quota:'', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid in the entire area', muzzleOnly:false, closed:false },
    { areas:[59,64], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-31'], quota:'350', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[60], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-05'], quota:'100', land:'Either', target:'Any deer', limit:'Any deer', muzzleOnly:false, closed:false },
    { areas:[60], type:'2', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-05'], quota:'200', land:'OffNF', target:'Any deer', limit:'Any deer off national forest', muzzleOnly:false, closed:false },
    { areas:[60], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'100', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[60], type:'6', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'50', land:'Either', target:'Doe or fawn', limit:'Doe or fawn', muzzleOnly:false, closed:false },
    { areas:[60], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'100', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[61], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[64], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:null, quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer (regular season split — see Oct 20–31 row)', muzzleOnly:false, closed:false },
    { areas:[64], type:'Gen', arch:null, gun:['2026-10-20','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer; Tom Thorne/Beth Williams WHMA and Laramie Peak WHMA north of Tunnel Road (Albany CR 727) closed', muzzleOnly:false, closed:false },
    { areas:[64], type:'2', arch:['2026-09-01','2026-09-30'], gun:['2026-10-20','2026-10-31'], quota:'100', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[65], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-20','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[65], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'300', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer; also valid in that portion of Area 66 in Converse County', muzzleOnly:false, closed:false },
    { areas:[65], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-12-31'], quota:'500', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer; also valid in that portion of Area 66 in Converse County', muzzleOnly:false, closed:false },
    { areas:[66], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-21'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[66,88,89], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'75', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[66,88,89], type:'8', arch:null, gun:['2026-08-15','2026-10-14'], quota:'75', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer only valid in Area 88', muzzleOnly:false, closed:false },
    { areas:[66,88,89], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[67], type:'Closed', arch:null, gun:null, quota:'', land:'Either', target:'Closed', limit:'Hunt Area 67 (Casper Mountain) is closed to deer hunting', muzzleOnly:false, closed:true },
    { areas:[70], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-21'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[70,74], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[70,74], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'75', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[74], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[75], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[75,76,77], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'75', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[75,76,77], type:'3', arch:null, gun:['2026-12-01','2026-12-31'], quota:'', land:'Either', target:'Antlerless white-tailed deer', limit:'Antlerless white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[75,76,77], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'100', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[76], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[77], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[78], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'250', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[78,79,80,81], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[78,79,80,81], type:'8', arch:null, gun:['2026-09-01','2026-12-31'], quota:'125', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[79], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'250', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[80], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'150', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[81], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'175', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[82], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-10'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[82], type:'Gen-Youth', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-12'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer; youth only', muzzleOnly:false, closed:false },
    { areas:[82,100], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'25', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[82,100], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2027-01-15'], quota:'25', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[84], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'25', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[87], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'50', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[87], type:'2', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'25', land:'Either', target:'Antlered mule deer (3 points or less on either antler) or any white-tailed deer', limit:'Antlered mule deer (3 points or less on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[88], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-21'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[88], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-12-15'], quota:'75', land:'Private', target:'Doe or fawn', limit:'Doe or fawn valid on private land', muzzleOnly:false, closed:false },
    { areas:[89], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'150', land:'Either', target:'Antlered deer', limit:'Antlered deer', muzzleOnly:false, closed:false },
    { areas:[90], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-31'], quota:'50', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[92], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-20'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[92,94,160], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[92,94,160], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'50', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[94], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-20'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[96], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-20'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[97], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-20'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[98], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-20'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer, archery or muzzle-loading firearms only', muzzleOnly:true, closed:false },
    { areas:[100], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-06'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[100], type:'Gen-Youth', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-12'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer; youth only', muzzleOnly:false, closed:false },
    { areas:[101], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'25', land:'Either', target:'Antlered deer', limit:'Antlered deer', muzzleOnly:false, closed:false },
    { areas:[102], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'150', land:'Either', target:'Any deer', limit:'Any deer', muzzleOnly:false, closed:false },
    { areas:[105], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:null, quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[105], type:'Gen', arch:null, gun:['2026-10-01','2026-10-31'], quota:'', land:'OnNF', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer on national forest; any white-tailed deer valid in the entire area', muzzleOnly:false, closed:false },
    { areas:[105], type:'Gen', arch:null, gun:['2026-11-01','2026-11-05'], quota:'', land:'OffNF', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer off national forest; any white-tailed deer valid in the entire area', muzzleOnly:false, closed:false },
    { areas:[105], type:'Gen', arch:null, gun:['2026-11-06','2026-11-20'], quota:'', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[105,106,109], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-20'], quota:'50', land:'Either', target:'Any deer', limit:'Any deer', muzzleOnly:false, closed:false },
    { areas:[105], type:'8', arch:null, gun:['2026-09-01','2026-12-31'], quota:'75', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[106], type:'Gen', arch:null, gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer within the North Absaroka Wilderness; any white-tailed deer valid in the entire area', muzzleOnly:false, closed:false },
    { areas:[106], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[106], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-15'], quota:'50', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[109], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-31'], quota:'35', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[109], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-31'], quota:'125', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[110], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[110,111], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'25', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[110,111], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'100', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[111], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[112], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[112,113,114], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'25', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[112,113,114], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'75', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[112,113,114], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'300', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[113], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[113], type:'7', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-12-31'], quota:'100', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid east of Carter Mountain', muzzleOnly:false, closed:false },
    { areas:[114], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[115], type:'Gen', arch:['2026-09-01','2026-09-09'], gun:['2026-09-10','2026-10-27'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[116], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'75', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[116,117], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-30'], quota:'100', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[116], type:'7', arch:null, gun:['2026-09-01','2026-10-14'], quota:'125', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land in the Wood River drainage', muzzleOnly:false, closed:false },
    { areas:[116,117], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'200', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[117], type:'1', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-15'], quota:'50', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[118], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'25', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[118], type:'1', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[118,119], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'50', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[119], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-15'], quota:'50', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[119], type:'2', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'50', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[119,120], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'100', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[120], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-15'], quota:'75', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[120], type:'8', arch:null, gun:['2026-09-01','2026-12-15'], quota:'150', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[121], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-10'], quota:'', land:'Either', target:'Any deer', limit:'Any deer on private land; antlered mule deer or any white-tailed deer off private land', muzzleOnly:false, closed:false },
    { areas:[121], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-15'], quota:'75', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[121], type:'7', arch:null, gun:['2026-08-15','2026-11-30'], quota:'100', land:'Private', target:'Doe or fawn', limit:'Doe or fawn valid on private land', muzzleOnly:false, closed:false },
    { areas:[121], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-15'], quota:'100', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[122], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-10'], quota:'', land:'Either', target:'Any deer', limit:'Any deer on private land; antlered mule deer or any white-tailed deer off private land', muzzleOnly:false, closed:false },
    { areas:[122], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-15'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[122], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'100', land:'Private', target:'Doe or fawn', limit:'Doe or fawn valid on private land', muzzleOnly:false, closed:false },
    { areas:[122], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-15'], quota:'100', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[123], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[123], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-11-30'], quota:'25', land:'Private', target:'Doe or fawn', limit:'Doe or fawn valid on private land', muzzleOnly:false, closed:false },
    { areas:[124], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[124], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-15'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[124], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-30'], quota:'25', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[124], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-15'], quota:'100', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[125], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-15'], quota:'75', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[125], type:'1', arch:null, gun:['2026-11-16','2026-12-15'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[127], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-24'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[127], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-12-15'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[127], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-12-15'], quota:'50', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[128], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-22'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[128], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-20'], quota:'75', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[128], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-30'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[128], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-31'], quota:'50', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[128], type:'8', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[130], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-06'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[130], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'5', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[131], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-06'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[131], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-09','2026-10-31'], quota:'50', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1/2 mile of irrigated land west of Blue Rim (Sweetwater CR 5) and Old Stauffer Roads (Sweetwater CR 7) and south of the OCI Entrance Road (Sweetwater CR 6)', muzzleOnly:false, closed:false },
    { areas:[132], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[132], type:'Gen-Youth', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer; youth only', muzzleOnly:false, closed:false },
    { areas:[132,133,134,135,168], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'25', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[132], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-31'], quota:'25', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1 mile of irrigated land in Sweetwater County west of WY-530 and north of Sweetwater CR 1 and BLM road 4', muzzleOnly:false, closed:false },
    { areas:[133], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[133], type:'Gen-Youth', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer; youth only', muzzleOnly:false, closed:false },
    { areas:[134], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[134], type:'Gen-Youth', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer; youth only', muzzleOnly:false, closed:false },
    { areas:[135], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[135], type:'Gen-Youth', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer; youth only', muzzleOnly:false, closed:false },
    { areas:[138], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[138,139,140,142,143], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[139], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[140], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[141], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-21'], quota:'75', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[141], type:'1', arch:null, gun:['2026-10-22','2026-10-31'], quota:'', land:'OnNF', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer on national forest', muzzleOnly:false, closed:false },
    { areas:[142], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[143], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[144], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[145], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[145], type:'3', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-11-30'], quota:'25', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[145], type:'3', arch:null, gun:['2026-12-01','2027-01-31'], quota:'', land:'Either', target:'Antlerless white-tailed deer', limit:'Antlerless white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[145], type:'8', arch:null, gun:['2026-11-01','2027-01-31'], quota:'25', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[148], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-25'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[148,150,151,152,155,156], type:'3', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-11-30'], quota:'75', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[148,150,151,152,155,156], type:'8', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-11-30'], quota:'75', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[149], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[149], type:'3', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-11-30'], quota:'25', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[149], type:'8', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-11-30'], quota:'25', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[150], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[151], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[152], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[153], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[154], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[155], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[156], type:'Gen', arch:['2026-09-01','2026-09-14'], gun:['2026-09-15','2026-10-02'], quota:'', land:'Either', target:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', limit:'Antlered mule deer (4+ points on either antler) or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[157], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-31'], quota:'', land:'Either', target:'Any deer', limit:'Any deer', muzzleOnly:false, closed:false },
    { areas:[157], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-11-01','2026-11-30'], quota:'175', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[157], type:'6', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-11-30'], quota:'100', land:'Either', target:'Doe or fawn', limit:'Doe or fawn', muzzleOnly:false, closed:false },
    { areas:[157], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-31'], quota:'Unlimited', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[157], type:'8', arch:null, gun:['2026-11-01','2026-11-30'], quota:'', land:'Private', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer valid on private land', muzzleOnly:false, closed:false },
    { areas:[160], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-20'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[163], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-21'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[163], type:'Gen', arch:null, gun:['2026-11-01','2026-11-15'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[164], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[164], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-11-15','2026-11-30'], quota:'50', land:'Either', target:'Any deer', limit:'Any deer valid within 1 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[164], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-15'], quota:'50', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[164], type:'6', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'50', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1/2 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[164], type:'7', arch:['2026-09-01','2026-09-30'], gun:['2026-11-15','2026-11-30'], quota:'50', land:'Either', target:'Doe or fawn', limit:'Doe or fawn valid within 1 mile of irrigated land', muzzleOnly:false, closed:false },
    { areas:[164], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'150', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[165], type:'1', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-31'], quota:'50', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[165], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-12-15'], quota:'100', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[165], type:'8', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-12-31'], quota:'300', land:'Either', target:'Doe or fawn white-tailed deer', limit:'Doe or fawn white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[168], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-10'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[168], type:'Gen-Youth', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-14'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer; youth only', muzzleOnly:false, closed:false },
    { areas:[169], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-15','2026-10-21'], quota:'', land:'Either', target:'Antlered mule deer or any white-tailed deer', limit:'Antlered mule deer or any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[169], type:'Gen', arch:null, gun:['2026-11-01','2026-11-15'], quota:'', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[171], type:'Gen', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-10-31'], quota:'', land:'Either', target:'Any deer', limit:'Any deer', muzzleOnly:false, closed:false },
    { areas:[171], type:'3', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'150', land:'Either', target:'Any white-tailed deer', limit:'Any white-tailed deer', muzzleOnly:false, closed:false },
    { areas:[171], type:'6', arch:['2026-09-01','2026-09-30'], gun:['2026-10-01','2026-12-31'], quota:'350', land:'Either', target:'Doe or fawn', limit:'Doe or fawn', muzzleOnly:false, closed:false },
  ];
  (function mergeElk() {
    var extra = (window.RS_ELK_SEASONS && window.RS_ELK_SEASONS.WY) || [];
    extra.forEach(function (r) {
      if (!r) return;
      seasons.push(Object.assign({}, r, { species: 'elk' }));
    });
  })();

  function colorForArea(n) {
    var i = Number(n) || 0;
    var h = (i * 47 + 13) % 360;
    var s = 52 + (i % 5) * 5;
    var l = 44 + (i % 4) * 4;
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
  }
  function areaMeta(n) {
    return areas[Number(n)] || null;
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
    for (var i = 0; i < seasons.length; i++) {
      var r = seasons[i];
      var sp = (r.species === 'elk') ? 'elk' : 'deer';
      if (sp !== species || r.closed) continue;
      if (r.areas === 'ALL' || r.areas == null) return true;
      if (r.areas && r.areas.indexOf(n) !== -1) return true;
    }
    return false;
  }
  function weaponUsesArchery(weapon) {
    return weapon === 'Archery' || weapon === 'Either';
  }
  function weaponUsesGun(weapon) {
    return weapon === 'Gun' || weapon === 'Primitive' || weapon === 'Either' || weapon === 'Youth';
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
  function inWin(ds, win) {
    return !!(win && win[0] && win[1] && ds >= win[0] && ds <= win[1]);
  }
  function matchRules(areaNum, dateStr, weapon, land, locSource, species) {
    species = species || ((typeof window.currentHuntSpecies === 'function') ? window.currentHuntSpecies() : 'deer');
    var rows = rowsForArea(areaNum);
    var out = [];
    var meta = areaMeta(areaNum);
    var label = meta ? ('Hunt Area ' + meta.n + ' — ' + meta.name) : ('Hunt Area ' + areaNum);
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var rowSp = (r.species === 'elk') ? 'elk' : 'deer';
      if (rowSp !== species) continue;
      if (r.closed) continue;
      if (!landOk(r.land, land, locSource)) continue;
      var hit = null;
      var start = null, end = null;
      if (weaponUsesArchery(weapon) && inWin(dateStr, r.arch) && (weapon === 'Archery' || weapon === 'Either')) {
        hit = 'Archery';
        start = r.arch[0];
        end = r.arch[1];
      }
      if (!hit && weaponUsesGun(weapon) && inWin(dateStr, r.gun)) {
        if (weapon === 'Youth' && !/youth/i.test(r.type)) continue;
        if (weapon === 'Gun' && r.muzzleOnly) continue;
        if (weapon === 'Primitive' || r.muzzleOnly) hit = 'Primitive';
        else if (weapon === 'Youth') hit = 'Youth';
        else hit = 'Gun';
        start = r.gun[0];
        end = r.gun[1];
      }
      if (!hit) continue;
      out.push({
        locId: 'wy_ha_' + areaNum,
        weapon: hit,
        land: r.land === 'Private' ? 'Private' : (r.land === 'Either' ? 'Either' : 'Public'),
        start: start,
        end: end,
        target: r.target,
        limit: r.quota ? (r.quota + ' · ' + r.limit) : r.limit,
        notes: label + ' · Type ' + r.type + (r.quota ? (' · quota ' + r.quota) : '') +
          '. Confirm WGFD Chapter 6 2026 before hunting.'
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
        notes: 'USFS surface ownership only (USDA Forest Service). Private inholdings are not drawn. Confirm forest-specific orders and WGFD hunt-area seasons.'
      },
      {
        key: 'blm', label: 'BLM public land', typeLabel: 'BLM',
        url: PADUS,
        where: "Mang_Name = 'BLM' AND State_Nm = 'WY' AND Pub_Access = 'OA' AND FeatClass = 'Fee' AND Mang_Type <> 'PVT'",
        useBbox: true, paginate: true,
        outFields: 'Mang_Name,Unit_Nm,Loc_Nm,State_Nm,Des_Tp,Pub_Access,GIS_Acres,OBJECTID',
        color: '#c4a35a', fillOpacity: 0.22, weight: 1.05,
        listMode: 'unit', nameFields: ['Unit_Nm', 'Loc_Nm'],
        nameSuffix: ' (BLM)',
        drawOnMap: true, maxOffset: 0.00035,
        notes: 'BLM surface (PAD-US open access). Wyoming has extensive BLM — Alabama does not. Confirm field-office maps, travel, and WGFD hunt-area seasons.'
      },
      {
        key: 'wma', label: 'Wildlife Habitat Management Area', typeLabel: 'WHMA',
        url: GIS + '/WHMA_Boundaries/FeatureServer/4/query',
        where: '1=1',
        outFields: 'WHMA_Name,Acres,PublicView,MoreInfoLink,OBJECTID',
        color: wma.color, fillOpacity: wma.fillOpacity, weight: wma.weight,
        listMode: 'unit', nameFields: ['WHMA_Name'],
        drawOnMap: true, maxOffset: 0.00004,
        notes: 'WGFD Wildlife Habitat Management Area (WHMA). Some units close seasonally. Confirm WGFD access page.'
      },
      {
        key: 'walkin', label: 'Walk-In Hunting', typeLabel: 'Walk-In',
        url: GIS + '/WalkInHuntingBoundaries/FeatureServer/0/query',
        where: '1=1',
        outFields: 'WIH_Name,WIA_NO,COUNTY,Type,Label,AccessDates,Acres,Species,OBJECTID',
        color: '#22c55e', fillOpacity: 0.30, weight: 1.2,
        listMode: 'unit', nameFields: ['WIH_Name', 'Label', 'WIA_NO'],
        nameSuffix: ' (Walk-In)',
        drawOnMap: true, maxOffset: 0.00003,
        notes: 'WGFD Walk-In Hunting Area (leased private/state access). Foot traffic only unless posted otherwise. Confirm AccessDates and species.'
      },
      {
        key: 'hma', label: 'Hunter Management Area', typeLabel: 'HMA',
        url: GIS + '/HMA_Boundaries/FeatureServer/0/query',
        where: '1=1',
        outFields: 'HMA_NAME,Type,Label,PublicView,OBJECTID',
        color: '#fb923c', fillOpacity: 0.28, weight: 1.2,
        listMode: 'unit', nameFields: ['HMA_NAME', 'Label'],
        nameSuffix: ' (HMA)',
        drawOnMap: true, maxOffset: 0.00004,
        notes: 'WGFD Hunter Management Area. Permission slip usually required. Confirm HMA rules and deer authorization.'
      },
      {
        key: 'nwr', label: 'National Wildlife Refuge', typeLabel: 'NWR',
        url: FWS,
        where: "State = 'WY' AND Organization_Type = 'NWR' AND Huntable <> 'No'",
        useBbox: true,
        outFields: 'Organization_Name,Hunt_Unit_Name,Huntable,Acreage,Organization_Code,Hunting_Website,Station_Website,Permit_Required,State,OBJECTID',
        color: nwr.color, fillOpacity: nwr.fillOpacity, weight: nwr.weight,
        listMode: 'unit', nameFields: ['Organization_Name', 'Hunt_Unit_Name'],
        noSunday: false, drawOnMap: true, maxOffset: 0,
        notes: 'FWS Public Hunt Units. Confirm the signed refuge brochure (e.g. National Elk Refuge permission slips).'
      },
      {
        key: 'usace', label: 'USACE Corps Land', typeLabel: 'USACE',
        url: PADUS,
        where: "Mang_Name = 'USACE' AND State_Nm = 'WY' AND Pub_Access = 'OA' AND FeatClass = 'Fee' AND Mang_Type <> 'PVT' AND (Des_Tp = 'REC' OR Des_Tp = 'PUB')",
        useBbox: true,
        outFields: 'Mang_Name,Unit_Nm,Loc_Nm,State_Nm,Des_Tp,Pub_Access,GIS_Acres,OBJECTID',
        color: usace.color, fillOpacity: usace.fillOpacity, weight: usace.weight,
        listMode: 'unit', nameFields: ['Unit_Nm', 'Loc_Nm'],
        nameSuffix: ' (USACE)',
        drawOnMap: true, maxOffset: 0.00015,
        notes: 'U.S. Army Corps of Engineers project land in Wyoming. Confirm project office maps and WGFD seasons.'
      }
    ];
  }
  window.RS_WY = {
    code: 'WY',
    year: 2026,
    source: 'WGFD Chapter 6 Deer Hunting Seasons 2026',
    agency: 'Wyoming Game & Fish Department',
    agencyUrl: 'https://wgfd.wyo.gov/Hunting/Hunt-Planner/deer-Hunting',
    lawUrl: 'https://wgfd.wyo.gov/media/33694/download?inline',
    mapUrl: 'https://wgfd.wyo.gov/media/33716/download?inline',
    regsUrl: 'https://wgfd.wyo.gov/regulations',
    huntUnitGis: GIS + '/2026_Deer_Hunt_Areas/FeatureServer/0/query',
    huntAreaGis: GIS + '/2026_Deer_Hunt_Areas/FeatureServer/0/query',
    elkHuntUnitGis: GIS + '/ElkHuntAreas/FeatureServer/0/query',
    elkOutFields: 'HUNTAREA,HUNTNAME,HERDNAME,Region,SqMiles',
    elkClosedAreas: [72, 79],
    overlayFoldLabel: 'Deer hunt areas',
    overlayFoldLabelElk: 'Elk hunt areas',
    unitField: 'HUNTAREA',
    unitNameField: 'HUNTNAME',
    regionField: 'Region',
    outFields: 'HUNTAREA,HUNTNAME,MD_HERDNAM,WD_HERDNAM,Region,SqMiles',
    unitLabel: 'Hunt Area',
    confirmLabel: 'WGFD Chapter 6',
    lawLabel: 'WGFD Chapter 6 — 2026 Deer Hunting Seasons',
    agencyLabel: 'WGFD Hunt Planner — Deer',
    wmaNote: 'WGFD Wildlife Habitat Management Area. Some units close seasonally.',
    extraToggles: [
      { key: 'wma', color: '#e59a18', text: '#111', label: 'WHMA', title: 'Wildlife Habitat Management Areas' },
      { key: 'walkin', color: '#22c55e', text: '#111', label: 'Walk-In', title: 'WGFD Walk-In Hunting Areas' },
      { key: 'hma', color: '#fb923c', text: '#111', label: 'HMA', title: 'Hunter Management Areas (permission slip)' },
      { key: 'blm', color: '#c4a35a', text: '#111', label: 'BLM', title: 'BLM public land — Wyoming has this; Alabama does not' },
      { key: 'forestNwr', color: '#2f9e4f', text: '#fff', label: 'Forest/NWR', title: 'National Forests & NWR' },
      { key: 'usace', color: '#6b7c3a', text: '#fff', label: 'USACE', title: 'U.S. Army Corps of Engineers' }
    ],
    areas: areas,
    seasons: seasons,
    regionColors: regionColors,
    regionNames: regionNames,
    regionOrder: ['A','B','C','D','F','G','H','J','K','L','M','Q','R','T','W','X','Y'],
    colorForArea: colorForArea,
    areaMeta: areaMeta,
    rowsForArea: rowsForArea,
    unitHasSpeciesSeason: unitHasSpeciesSeason,
    matchRules: matchRules,
    anyOpen: anyOpen,
    layers: layers,
    peakRut: { startMD: [11, 10], endMD: [12, 5], midMD: [11, 22], label: 'Nov 10–Dec 5 (mule deer planning avg)' },
    extraVsAlabama: [
      'Numbered hunt areas (not A–E letters) with official WGFD GIS borders',
      'Mule deer and white-tailed deer managed separately (Type 3 / Type 8)',
      'Limited-quota license types 1, 2, 3, 6, 7, 8 plus General',
      'Nonresident general regions A–Y',
      'Special archery season in addition to regular firearm season',
      'Wildlife Habitat Management Areas (WHMA) instead of Alabama WMAs',
      'Walk-In Hunting Areas (leased private/state access)',
      'Hunter Management Areas (permission slips)',
      'Extensive BLM public land (Alabama has none)',
      'Antler-point restrictions (3-pt / 4-pt) on many areas',
      'Youth-only general seasons on some areas',
      'CWD / carcass rules (see WGFD Chapter 6 Important Hunting Information)'
    ]
  };
  window.RS_PACKS = window.RS_PACKS || {};
  window.RS_PACKS.WY = window.RS_WY;
  if (typeof window.registerStatePack === 'function') window.registerStatePack(window.RS_WY);
})();
