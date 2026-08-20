/* Shared state-pack factory. New states are data files; matchRules/layers stay one implementation. */
(function () {
  var PADUS = 'https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/Manager_Name_PADUS/FeatureServer/0/query';
  var FWS = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_PublicHuntUnits_view/FeatureServer/0/query';
  /** USFS surface ownership (USDA FOREST SERVICE only). Not the proclamation boundary. */
  var USFS_OWN = 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_BasicOwnership_01/MapServer/0/query';
  /** Fee + open-access only — never Forest System proclamation boundaries (those include private inholdings). */
  function padusOpenFeeWhere(code, mangName) {
    return "Mang_Name = '" + mangName + "' AND State_Nm = '" + code +
      "' AND Pub_Access = 'OA' AND FeatClass = 'Fee' AND Mang_Type <> 'PVT'";
  }

  function sty(key, fallback) {
    var C = window.PUBLIC_LAND_COLORS || {};
    return C[key] || fallback;
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

  function areaKey(areas, id) {
    if (id == null || id === '') return null;
    if (Object.prototype.hasOwnProperty.call(areas, id)) return id;
    var n = Number(id);
    if (!isNaN(n) && Object.prototype.hasOwnProperty.call(areas, n)) return n;
    var s = String(id);
    if (Object.prototype.hasOwnProperty.call(areas, s)) return s;
    return null;
  }

  function rowHasArea(row, id, key) {
    var list = row.areas;
    if (list === 'ALL' || list == null) return true;
    if (!list || !list.length) return false;
    if (list.indexOf(id) !== -1) return true;
    if (key != null && list.indexOf(key) !== -1) return true;
    if (list.indexOf(String(id)) !== -1) return true;
    var n = Number(id);
    if (!isNaN(n) && list.indexOf(n) !== -1) return true;
    return false;
  }

  function colorForArea(n) {
    var s = String(n == null ? '' : n);
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return 'hsl(' + (h % 360) + ',' + (48 + (h % 6) * 4) + '%,' + (42 + (h % 5) * 3) + '%)';
  }

  var HUNT_LAND = {
    AZ: { short: 'WA', title: 'Wildlife Areas' },
    CA: { short: 'CDFW land', title: 'CDFW public-access lands' },
    CO: { short: 'SWA', title: 'State Wildlife Areas' },
    CT: { short: 'Hunt land', title: 'DEEP areas open for hunting' },
    DE: { short: 'WA', title: 'Wildlife Areas' },
    IA: { short: 'Hunt land', title: 'Public hunting areas' },
    ID: { short: 'WMA', title: 'Wildlife Management Areas' },
    IL: { short: 'IDNR', title: 'IDNR sites' },
    IN: { short: 'DNR land', title: 'DNR managed land' },
    KS: { short: 'WA', title: 'Wildlife Areas' },
    MD: { short: 'WMA', title: 'Wildlife Management Areas' },
    ME: { short: 'WMA', title: 'Wildlife Management Areas' },
    MI: { short: 'SGA', title: 'State Game Areas' },
    MO: { short: 'CA', title: 'Conservation Areas' },
    NC: { short: 'Game land', title: 'Game Lands' },
    NH: { short: 'WMA', title: 'Wildlife Management Areas' },
    NJ: { short: 'WMA', title: 'Wildlife Management Areas' },
    NV: { short: 'WMA', title: 'Wildlife Management Areas' },
    NY: { short: 'WMA', title: 'Wildlife Management Areas' },
    OH: { short: 'Hunt land', title: 'Wildlife Areas / public hunting land' },
    OR: { short: 'WA', title: 'Wildlife Areas' },
    PA: { short: 'SGL', title: 'State Game Lands' },
    RI: { short: 'MA', title: 'Management Areas' },
    SC: { short: 'WMA', title: 'Wildlife Management Areas' },
    SD: { short: 'GPA', title: 'Game Production Areas' },
    TX: { short: 'WMA', title: 'Wildlife Management Areas' },
    UT: { short: 'WMA', title: 'Wildlife Management Areas' },
    VA: { short: 'WMA', title: 'Wildlife Management Areas' },
    VT: { short: 'WMA', title: 'Wildlife Management Areas' },
    WA: { short: 'WA', title: 'Wildlife Areas' },
    WI: { short: 'Public land', title: 'DNR public hunting land' },
    WV: { short: 'WMA', title: 'Wildlife Management Areas' },
    WY: { short: 'WHMA', title: 'Wildlife Habitat Management Areas' }
  };
  var NO_USFS = { CT:1, DE:1, IA:1, KS:1, MD:1, MA:1, ME:1, ND:1, NE:1, NJ:1, RI:1 };
  var NO_USACE = { RI:1 };

  function huntLandName(code) {
    return HUNT_LAND[code] || { short: 'WMA', title: 'Wildlife Management Areas' };
  }
  function hasUsfs(spec) {
    if (spec.hasUsfs === false || spec.hasForestNwr === false) return false;
    return !NO_USFS[spec.code];
  }
  function hasNwr(spec) {
    return spec.hasForestNwr !== false && spec.hasNwr !== false;
  }
  function hasUsace(spec) {
    if (spec.hasUsace === false) return false;
    return !NO_USACE[spec.code];
  }

  function standardLayers(spec) {
    var code = spec.code;
    var wma = sty('wma', { color: '#ff8f1f', fillOpacity: 0.46, weight: 2.4 });
    var usfs = sty('usfs', { color: '#00d26a', fillOpacity: 0.34, weight: 2.1 });
    var nwr = sty('nwr', { color: '#00d26a', fillOpacity: 0.44, weight: 2.3 });
    var usace = sty('usace', { color: '#ffe14a', fillOpacity: 0.42, weight: 2.3 });
    var blm = sty('blm', { color: '#ffc14d', fillOpacity: 0.40, weight: 2.2 });
    var out = [];
    if (hasUsfs(spec)) {
      out.push({
        key: 'usfs', label: 'National Forest', typeLabel: 'National Forest',
        url: USFS_OWN,
        where: "ownerclassification = 'USDA FOREST SERVICE'",
        useBbox: true, paginate: true,
        outFields: 'ownerclassification,forestname,region,objectid',
        color: usfs.color, fillOpacity: usfs.fillOpacity, weight: usfs.weight,
        listMode: 'unit', nameFields: ['forestname'],
        nameSuffix: ' (USFS)',
        drawOnMap: true, interactive: true, maxOffset: 0.00025,
        notes: 'USFS surface ownership only (USDA Forest Service). Private inholdings are not drawn. Confirm forest orders and ' +
          (spec.confirmLabel || spec.agency) + '.'
      });
    }
    if (spec.hasBlm) {
      out.push({
        key: 'blm', label: 'BLM public land', typeLabel: 'BLM',
        url: PADUS,
        where: padusOpenFeeWhere(code, 'BLM'),
        useBbox: true, paginate: true,
        outFields: 'Mang_Name,Unit_Nm,Loc_Nm,State_Nm,Des_Tp,Pub_Access,GIS_Acres,OBJECTID',
        color: blm.color, fillOpacity: blm.fillOpacity, weight: blm.weight,
        listMode: 'unit', nameFields: ['Unit_Nm', 'Loc_Nm'],
        nameSuffix: ' (BLM)',
        drawOnMap: true, maxOffset: 0.00035,
        notes: 'BLM surface (PAD-US open access). Confirm field-office maps and ' + (spec.confirmLabel || spec.agency) + '.'
      });
    }
    var wmaSpec = spec.wma;
    if (wmaSpec && wmaSpec.url) {
      out.push({
        key: 'wma',
        label: wmaSpec.label || 'Wildlife Management Area',
        typeLabel: wmaSpec.typeLabel || wmaSpec.label || 'WMA',
        url: wmaSpec.url,
        where: wmaSpec.where || '1=1',
        useBbox: wmaSpec.useBbox !== false,
        paginate: wmaSpec.paginate !== false,
        outFields: wmaSpec.outFields || 'OBJECTID',
        color: wma.color, fillOpacity: wma.fillOpacity, weight: wma.weight,
        listMode: 'unit',
        nameFields: wmaSpec.nameFields || ['NAME', 'Name', 'Unit_Nm'],
        drawOnMap: true, maxOffset: wmaSpec.maxOffset != null ? wmaSpec.maxOffset : 0.00012,
        notes: wmaSpec.notes || spec.wmaNote || ((wmaSpec.label || 'WMA') + '. Confirm agency property rules.')
      });
    } else {
      var hl = huntLandName(code);
      out.push({
        key: 'wma',
        label: hl.title,
        typeLabel: hl.short,
        url: PADUS,
        where: "State_Nm = '" + code + "' AND Pub_Access = 'OA' AND FeatClass = 'Fee' AND Mang_Type <> 'PVT' AND (Mang_Name = 'SFW' OR Mang_Name = 'SDNR' OR Mang_Name = 'SDC' OR Mang_Name = 'State Fish And Wildlife' OR Mang_Name = 'State Department of Natural Resources' OR Mang_Name = 'State Dept of Natural Resources' OR Des_Tp = 'HUNT')",
        useBbox: true, paginate: true,
        outFields: 'Mang_Name,Unit_Nm,Loc_Nm,State_Nm,Des_Tp,Pub_Access,GIS_Acres,OBJECTID',
        color: wma.color, fillOpacity: wma.fillOpacity, weight: wma.weight,
        listMode: 'unit',
        nameFields: ['Unit_Nm', 'Loc_Nm'],
        nameSuffix: ' (' + hl.short + ')',
        drawOnMap: true, maxOffset: 0.00008,
        notes: 'PAD-US open-access ' + hl.title + ' in ' + spec.name + '. Dates on these tracts can differ from the statewide table. Confirm ' + (spec.confirmLabel || spec.agency) + '.'
      });
    }
    (spec.extraLayers || []).forEach(function (ly) {
      out.push(ly);
    });
    if (hasNwr(spec)) {
      out.push({
        key: 'nwr', label: 'National Wildlife Refuge', typeLabel: 'NWR',
        url: FWS,
        where: "State = '" + code + "' AND Organization_Type = 'NWR' AND Huntable <> 'No'",
        useBbox: true,
        outFields: 'Organization_Name,Hunt_Unit_Name,Huntable,Acreage,Organization_Code,Hunting_Website,Station_Website,Permit_Required,State,OBJECTID',
        color: nwr.color, fillOpacity: nwr.fillOpacity, weight: nwr.weight,
        listMode: 'unit', nameFields: ['Organization_Name', 'Hunt_Unit_Name'],
        noSunday: false, drawOnMap: true, maxOffset: 0,
        notes: 'FWS Public Hunt Units in ' + spec.name + '. Confirm the signed refuge brochure.'
      });
    }
    if (hasUsace(spec)) {
      out.push({
        key: 'usace', label: 'USACE Corps Land', typeLabel: 'USACE',
        url: PADUS,
        where: "Mang_Name = 'USACE' AND State_Nm = '" + code + "' AND Pub_Access = 'OA' AND FeatClass = 'Fee' AND Mang_Type <> 'PVT' AND (Des_Tp = 'REC' OR Des_Tp = 'PUB')",
        useBbox: true,
        outFields: 'Mang_Name,Unit_Nm,Loc_Nm,State_Nm,Des_Tp,Pub_Access,GIS_Acres,OBJECTID',
        color: usace.color, fillOpacity: usace.fillOpacity, weight: usace.weight,
        listMode: 'unit', nameFields: ['Unit_Nm', 'Loc_Nm'],
        nameSuffix: ' (USACE)',
        drawOnMap: true, maxOffset: 0.00015,
        notes: 'U.S. Army Corps of Engineers project land in ' + spec.name + '. Confirm project office maps.'
      });
    }
    return out;
  }

  function defaultToggles(spec) {
    var t = [];
    var extras = spec.extraToggles || [];
    var hl = huntLandName(spec.code);
    var hasWmaToggle = extras.some(function (x) { return x && x.key === 'wma'; });
    if (!hasWmaToggle) {
      t.push({
        key: 'wma', color: (sty('wma', { color: '#ff8f1f' }).color), text: '#111',
        label: (spec.wma && (spec.wma.short || spec.wma.typeLabel)) || hl.short,
        title: (spec.wma && spec.wma.label) || hl.title
      });
    }
    extras.forEach(function (x) { t.push(x); });
    var hasForestToggle = extras.some(function (x) { return x && x.key === 'forestNwr'; });
    var hasUsaceToggle = extras.some(function (x) { return x && x.key === 'usace'; });
    if (spec.hasBlm) {
      t.push({ key: 'blm', color: (sty('blm', { color: '#ffc14d' }).color), text: '#111', label: 'BLM', title: 'BLM public land' });
    }
    if (!hasForestToggle) {
      if (hasUsfs(spec) && hasNwr(spec)) {
        t.push({ key: 'forestNwr', color: (sty('nwr', { color: '#00d26a' }).color), text: '#111', label: 'Forest/NWR', title: 'National Forests & NWR' });
      } else if (hasUsfs(spec)) {
        t.push({ key: 'forestNwr', color: (sty('usfs', { color: '#00d26a' }).color), text: '#111', label: 'Forest', title: 'National Forest' });
      } else if (hasNwr(spec)) {
        t.push({ key: 'forestNwr', color: (sty('nwr', { color: '#00d26a' }).color), text: '#111', label: 'NWR', title: 'National Wildlife Refuge' });
      }
    }
    if (!hasUsaceToggle && hasUsace(spec)) {
      t.push({ key: 'usace', color: (sty('usace', { color: '#ffe14a' }).color), text: '#111', label: 'USACE', title: 'U.S. Army Corps of Engineers' });
    }
    return t;
  }

  function build(spec) {
    if (!spec || !spec.code) throw new Error('pack spec missing code');
    var areas = spec.areas || {};
    var seasons = (spec.seasons || []).slice();
    var extraElk = (window.RS_ELK_SEASONS && window.RS_ELK_SEASONS[spec.code]) || [];
    extraElk.forEach(function (r) {
      if (!r) return;
      seasons.push(Object.assign({}, r, { species: 'elk' }));
    });
    var unitLabel = spec.unitLabel || 'Hunt unit';
    var primitiveUsesGun = !!spec.primitiveUsesGun;
    var regionColors = spec.regionColors || { U: '#5b8def' };
    var regionNames = spec.regionNames || { U: unitLabel + 's' };
    var regionOrder = spec.regionOrder && spec.regionOrder.length ? spec.regionOrder : ['U'];

    function normId(id) {
      if (typeof spec.normalizeUnitId === 'function') {
        try { id = spec.normalizeUnitId(id); } catch (eN) {}
      }
      return id;
    }
    function areaMeta(id) {
      var k = areaKey(areas, normId(id));
      if (k == null) k = areaKey(areas, id);
      return k == null ? null : areas[k];
    }
    function regionForUnit(id) {
      var m = areaMeta(id);
      if (m && m.region) return m.region;
      return regionOrder[0] || 'U';
    }
    function rowIsStatewide(r) {
      return !r || r.areas === 'ALL' || r.areas == null;
    }
    function rowSpecies(r) {
      return (r && r.species === 'elk') ? 'elk' : 'deer';
    }
    function currentSpecies() {
      try {
        if (typeof window.currentHuntSpecies === 'function') return window.currentHuntSpecies();
        if (window.selectedSpecies === 'elk') return 'elk';
      } catch (eS) {}
      return 'deer';
    }
    function rowsForArea(id, species) {
      species = species || currentSpecies();
      var nid = normId(id);
      var k = areaKey(areas, nid);
      if (k == null) k = areaKey(areas, id);
      var out = [];
      for (var i = 0; i < seasons.length; i++) {
        if (rowSpecies(seasons[i]) !== species) continue;
        if (rowIsStatewide(seasons[i]) || rowHasArea(seasons[i], nid, k) || rowHasArea(seasons[i], id, k)) {
          out.push(seasons[i]);
        }
      }
      return out;
    }
    function calendarIsStatewide() {
      var species = currentSpecies();
      var rows = seasons.filter(function (r) { return rowSpecies(r) === species; });
      if (!rows.length) return false;
      return rows.every(function (r) {
        if (rowIsStatewide(r)) return true;
        return !!(r.areas && r.areas.length && Object.keys(areas).length &&
          r.areas.length >= Math.max(3, Object.keys(areas).length * 0.85));
      });
    }
    function unitHasSpeciesSeason(id, species) {
      species = species || currentSpecies();
      var rows = seasons.filter(function (r) { return rowSpecies(r) === species && !r.closed; });
      if (!rows.length) return false;
      if (rows.some(rowIsStatewide)) return true;
      return rowsForArea(id, species).length > 0;
    }
    function matchRules(areaNum, dateStr, weapon, land, locSource, species) {
      areaNum = normId(areaNum);
      species = species || currentSpecies();
      var rows = rowsForArea(areaNum, species);
      var out = [];
      var meta = areaMeta(areaNum);
      var label = meta
        ? (unitLabel + ' ' + (meta.n != null ? meta.n : areaNum) + (meta.name ? (' — ' + meta.name) : ''))
        : (unitLabel + ' ' + areaNum);
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r.closed) continue;
        if (!landOk(r.land || 'Either', land, locSource)) continue;
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
        } else if (wantMuz && primitiveUsesGun && !r.muzzle && inWin(dateStr, r.gun) && !r.muzzleOnly) {
          hit = 'Primitive';
          start = r.gun[0];
          end = r.gun[1];
        } else if (wantGun && inWin(dateStr, r.gun) && !(weapon === 'Gun' && r.muzzleOnly)) {
          if (r.youthOnly && weapon === 'Gun') continue;
          hit = (weapon === 'Youth' || r.youthOnly) ? 'Youth' : 'Gun';
          start = r.gun[0];
          end = r.gun[1];
        }
        if (!hit) continue;
        out.push({
          locId: String(spec.code).toLowerCase() + '_u_' + areaNum,
          weapon: hit,
          land: r.land === 'Private' ? 'Private' : (r.land === 'Either' || !r.land ? 'Either' : 'Public'),
          start: start,
          end: end,
          target: r.target || 'Deer',
          limit: r.limit || '',
          notes: (r.notes || (label + ' · ' + (r.type || hit) + '. Confirm ' + (spec.confirmLabel || spec.agency) + ' before hunting.'))
        });
      }
      return out;
    }
    function matchStatewide(dateStr, weapon, land, locSource, species) {
      species = species || currentSpecies();
      if (!calendarIsStatewide()) return [];
      var keys = Object.keys(areas);
      if (!keys.length) return matchRules('ALL', dateStr, weapon, land, locSource, species);
      return matchRules(keys[0], dateStr, weapon, land, locSource, species);
    }

    var pack = {
      code: spec.code,
      year: spec.year || 2026,
      source: spec.source,
      agency: spec.agency,
      agencyUrl: spec.agencyUrl,
      lawUrl: spec.lawUrl,
      mapUrl: spec.mapUrl,
      regsUrl: spec.regsUrl,
      huntUnitGis: spec.huntUnitGis,
      huntAreaGis: spec.huntUnitGis,
      huntUnitWhere: spec.huntUnitWhere || '1=1',
      elkHuntUnitGis: spec.elkHuntUnitGis || '',
      elkHuntUnitWhere: spec.elkHuntUnitWhere || '',
      elkUnitField: spec.elkUnitField || '',
      elkUnitNameField: spec.elkUnitNameField || '',
      elkRegionField: spec.elkRegionField || '',
      elkOutFields: spec.elkOutFields || '',
      elkClosedAreas: spec.elkClosedAreas || [],
      unitField: spec.unitField,
      unitNameField: spec.unitNameField,
      regionField: spec.regionField || '',
      outFields: spec.outFields,
      unitLabel: unitLabel,
      overlayFoldLabel: spec.overlayFoldLabel || ('Deer ' + unitLabel.toLowerCase() + 's'),
      overlayFoldLabelElk: spec.overlayFoldLabelElk || '',
      confirmLabel: spec.confirmLabel || spec.agency,
      lawLabel: spec.lawLabel || ((spec.agency || spec.name) + ' deer regulations'),
      agencyLabel: spec.agencyLabel || ((spec.agency || spec.name) + ' — hunting'),
      wmaNote: spec.wmaNote,
      minUnitCache: spec.minUnitCache != null ? spec.minUnitCache : 3,
      maxOffset: spec.maxOffset,
      extraToggles: spec.toggles || defaultToggles(spec),
      areas: areas,
      seasons: seasons,
      regionColors: regionColors,
      regionNames: regionNames,
      regionOrder: regionOrder,
      colorForArea: spec.colorForArea || colorForArea,
      areaMeta: areaMeta,
      regionForUnit: spec.regionForUnit || regionForUnit,
      rowsForArea: rowsForArea,
      matchRules: matchRules,
      matchStatewide: matchStatewide,
      calendarIsStatewide: calendarIsStatewide,
      unitHasSpeciesSeason: unitHasSpeciesSeason,
      anyOpen: function (a, d, w, l, s) { return matchRules(a, d, w, l, s).length > 0; },
      layers: function () { return standardLayers(spec); },
      extraVsAlabama: spec.extraVsAlabama || [],
      primitiveUsesGun: primitiveUsesGun,
      accuracyNotes: spec.accuracyNotes || []
    };
    var elkSrc = (window.RS_ELK_SOURCES && window.RS_ELK_SOURCES[spec.code]) || {};
    pack.elkLawUrl = spec.elkLawUrl || elkSrc.lawUrl || '';
    pack.elkLawLabel = spec.elkLawLabel || elkSrc.lawLabel || '';
    pack.elkAgencyUrl = spec.elkAgencyUrl || elkSrc.agencyUrl || '';
    pack.elkAgencyLabel = spec.elkAgencyLabel || elkSrc.agencyLabel || '';
    return pack;
  }

  function buildAndRegister(spec) {
    var pack = build(spec);
    window.RS_PACKS = window.RS_PACKS || {};
    window.RS_PACKS[pack.code] = pack;
    window['RS_' + pack.code] = pack;
    if (typeof window.registerStatePack === 'function') window.registerStatePack(pack);
    return pack;
  }

  window.RSPackLib = {
    build: build,
    buildAndRegister: buildAndRegister,
    PADUS: PADUS,
    FWS: FWS,
    USFS_OWN: USFS_OWN
  };
})();
