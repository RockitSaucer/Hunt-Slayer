/**
 * Hunt / Reg Slayer — multi-day map calendar events
 * localStorage first; optional Supabase when map_calendar_events exists.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'reg_slayer_cal_events_v2';
  var HIDES_KEY = 'reg_slayer_cal_event_hides_v1';
  /** Tombstones so pullCloud never resurrects deleted events (cross-site dual-write) */
  var DELETED_KEY = 'reg_slayer_cal_event_deleted_v1';
  var events = [];
  var localHides = {}; // eventId -> true
  var localDeleted = {}; // eventId | planEventId -> timestamp
  var pendingLocationPick = null; // { draftId|eventId, name }
  var ready = false;

  function uid() {
    return 'cev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function localYmd(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function parseYmd(s) {
    if (!s) return null;
    var p = String(s).split('-');
    if (p.length < 3) return null;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  function loadLocal() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      events = Array.isArray(raw) ? raw.map(normalize).filter(Boolean) : [];
    } catch (e) {
      events = [];
    }
    try {
      localHides = JSON.parse(localStorage.getItem(HIDES_KEY) || '{}') || {};
    } catch (e2) {
      localHides = {};
    }
    try {
      localDeleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '{}') || {};
    } catch (e3) {
      localDeleted = {};
    }
    // Drop anything already tombstoned
    events = events.filter(function (e) { return e && !isDeleted(e); });
  }

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      localStorage.setItem(HIDES_KEY, JSON.stringify(localHides));
      localStorage.setItem(DELETED_KEY, JSON.stringify(localDeleted));
    } catch (e) {}
  }

  function isDeleted(evOrId) {
    if (evOrId == null) return false;
    if (typeof evOrId === 'object') {
      if (localDeleted[String(evOrId.id)]) return true;
      if (evOrId.planEventId && localDeleted[String(evOrId.planEventId)]) return true;
      if (evOrId.planEventId && localDeleted['plan_' + String(evOrId.planEventId)]) return true;
      return false;
    }
    var id = String(evOrId);
    if (localDeleted[id]) return true;
    if (localDeleted['plan_' + id]) return true;
    return false;
  }

  function markDeletedIds(ids) {
    var now = Date.now();
    (ids || []).forEach(function (id) {
      if (id == null || id === '') return;
      localDeleted[String(id)] = now;
    });
    // Prune tombstones older than 180 days
    var cutoff = now - 180 * 24 * 60 * 60 * 1000;
    Object.keys(localDeleted).forEach(function (k) {
      if (Number(localDeleted[k]) < cutoff) delete localDeleted[k];
    });
  }

  function normalize(ev) {
    if (!ev || typeof ev !== 'object') return null;
    var start = ev.startDate || ev.start_date || ev.date || null;
    var end = ev.endDate || ev.end_date || start;
    if (!start) return null;
    if (!end || end < start) end = start;
    var hl = ev.hunt_link || ev.huntLink || null;
    var listPack = ev.listPack || ev.list_pack || (hl && hl.listPack) || null;
    return {
      id: String(ev.id || uid()),
      text: String(ev.text || ev.name || ev.title || 'Event'),
      color: ev.color || '#e59a18',
      startDate: start,
      endDate: end,
      mapScope: ev.mapScope || ev.map_scope || 'personal', // personal | all | shared | private
      sharedMapId: ev.sharedMapId || ev.shared_map_id || null,
      privateMapId: ev.privateMapId || ev.private_map_id || null,
      mapIds: Array.isArray(ev.mapIds) ? ev.mapIds : (Array.isArray(ev.map_ids) ? ev.map_ids : []),
      lat: ev.lat != null ? Number(ev.lat) : null,
      lng: ev.lng != null ? Number(ev.lng) : null,
      locationLabel: ev.locationLabel || ev.location_label || null,
      locationId: ev.locationId != null ? ev.locationId : null,
      weapon: ev.weapon || null,
      land: ev.land || null,
      creatorUserId: ev.creatorUserId || ev.creator_user_id || null,
      createdAt: ev.createdAt || ev.created_at || new Date().toISOString(),
      updatedAt: ev.updatedAt || ev.updated_at || new Date().toISOString(),
      planEventId: ev.planEventId || ev.plan_event_id || (hl && hl.planEventId) || null,
      planListId: ev.planListId || ev.plan_list_id || (hl && hl.planListId) || null,
      inviteCode: ev.inviteCode || ev.invite_code || (hl && hl.inviteCode) || null,
      members: Array.isArray(ev.members) ? ev.members : (hl && Array.isArray(hl.members) ? hl.members : []),
      listPack: listPack,
      _fromPlanSlayer: !!(ev._fromPlanSlayer || (hl && hl.fromPlanSlayer)),
      _localOnly: !!ev._localOnly
    };
  }

  function myId() {
    try {
      if (global.RegSlayerCloud && typeof global.RegSlayerCloud.getUser === 'function') {
        var u = global.RegSlayerCloud.getUser();
        if (u && u.id) return u.id;
      }
      if (global.__rsUser && global.__rsUser.id) return global.__rsUser.id;
    } catch (e) {}
    return null;
  }

  function isHidden(id) {
    return !!localHides[String(id)];
  }

  function hideForMe(id) {
    localHides[String(id)] = true;
    saveLocal();
    // Best-effort cloud hide
    try {
      var sb = global.RegSlayerCloud && global.RegSlayerCloud.getClient && global.RegSlayerCloud.getClient();
      var uid = myId();
      if (sb && uid) {
        sb.from('map_calendar_event_hides').upsert({ event_id: id, user_id: uid }).then(function () {});
      }
    } catch (e) {}
  }

  function unhideForMe(id) {
    delete localHides[String(id)];
    saveLocal();
    // Best-effort cloud unhide
    try {
      var sb = global.RegSlayerCloud && global.RegSlayerCloud.getClient && global.RegSlayerCloud.getClient();
      var uid = myId();
      if (sb && uid) {
        sb.from('map_calendar_event_hides').delete().eq('event_id', id).eq('user_id', uid).then(function () {});
      }
    } catch (e) {}
  }

  function isCreator(ev) {
    if (!ev) return false;
    var me = myId();
    if (!me) return !ev.creatorUserId; // local-only guest owns local events
    if (!ev.creatorUserId) return true;
    return String(ev.creatorUserId) === String(me);
  }

  function activeSharedMapId() {
    try {
      if (global.RegSlayerParty && typeof global.RegSlayerParty.getViewState === 'function') {
        var vs = global.RegSlayerParty.getViewState();
        if (vs && vs.mode === 'shared' && vs.mapId) return String(vs.mapId);
      }
      if (global.RegSlayerParty && global.RegSlayerParty.activeMapId) {
        return String(global.RegSlayerParty.activeMapId);
      }
    } catch (e) {}
    return null;
  }

  function eventVisibleOnDay(ev, ymd, mapContextId, opts) {
    opts = opts || {};
    if (!ev) return false;
    // #114: calendar dots keep hidden events; day list still filters them out
    if (!opts.includeHidden && isHidden(ev.id)) return false;
    if (ev.startDate > ymd || ev.endDate < ymd) return false;
    var scope = ev.mapScope || 'personal';
    if (scope === 'all' || scope === 'personal' || scope === 'private') return true;
    if (scope === 'shared') {
      // Visible when viewing that shared map, or when no map context (planner home)
      if (!mapContextId) return true;
      if (ev.sharedMapId && String(ev.sharedMapId) === String(mapContextId)) return true;
      if (ev.mapIds && ev.mapIds.some(function (m) { return String(m) === String(mapContextId); })) return true;
      return false;
    }
    return true;
  }

  function dedupeDayEvents(list) {
    // #97 / #121: dedupe Plan dual-write (plan_* id + cloud UUID for same planEventId)
    // also collapse identical name+date rows without planEventId when same creator
    var byPlan = {};
    var byNameKey = {};
    var out = [];
    (list || []).forEach(function (ev) {
      if (!ev) return;
      var pid = ev.planEventId ? String(ev.planEventId) : '';
      if (pid) {
        var prev = byPlan[pid];
        if (prev) {
          // Prefer UUID cloud id over plan_ local id
          var isUuid = /^[0-9a-f]{8}-/i.test(String(ev.id));
          var prevUuid = /^[0-9a-f]{8}-/i.test(String(prev.id));
          if (isUuid && !prevUuid) {
            var idx = out.indexOf(prev);
            if (idx >= 0) out[idx] = ev;
            byPlan[pid] = ev;
          }
          return;
        }
        byPlan[pid] = ev;
        out.push(ev);
        return;
      }
      // Soft dedupe: same text + start/end + creator (Reg double-dot reports)
      var nk = String(ev.text || '').toLowerCase().trim() + '|' +
        String(ev.startDate || '') + '|' + String(ev.endDate || '') + '|' +
        String(ev.creatorUserId || '');
      if (nk.length > 4 && byNameKey[nk]) return;
      if (nk.length > 4) byNameKey[nk] = ev;
      out.push(ev);
    });
    return out;
  }

  function eventsForDay(ymd, mapContextId, opts) {
    opts = opts || {};
    mapContextId = mapContextId != null ? mapContextId : activeSharedMapId();
    var list = events.filter(function (ev) {
      return eventVisibleOnDay(ev, ymd, mapContextId, opts);
    });
    return dedupeDayEvents(list);
  }

  /** #114: dots include hidden events (list view still uses eventsForDay without includeHidden) */
  function eventsForDayDots(ymd, mapContextId) {
    return eventsForDay(ymd, mapContextId, { includeHidden: true });
  }

  function getById(id) {
    return events.find(function (e) { return String(e.id) === String(id); }) || null;
  }

  function isUuidLike(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));
  }

  function ymdToIsoNoon(ymd) {
    if (!ymd) return null;
    var s = String(ymd);
    if (s.length === 10) return s + 'T12:00:00';
    return s;
  }

  /**
   * Dual-write Hunt/Reg calendar → PlanSlayer plan_events (same Supabase account).
   * Plan loadEvents uses plan_events as source of truth, so Hunt-only map_calendar
   * rows never appear there without this.
   */
  function pushPlanCloud(ev) {
    try {
      var sb = global.RegSlayerCloud && global.RegSlayerCloud.getClient && global.RegSlayerCloud.getClient();
      var uid = myId();
      if (!sb || !uid || !ev || ev._localOnly) return;
      // Skip pure demos / empty titles
      if (!ev.text && !ev.name) return;

      function stampLocalPlanId(planId, inviteCode) {
        if (!planId) return;
        var id = String(ev.id);
        var idx = events.findIndex(function (e) { return e && String(e.id) === id; });
        if (idx < 0) return;
        events[idx].planEventId = String(planId);
        if (inviteCode) events[idx].inviteCode = inviteCode;
        saveLocal();
        // Refresh map_calendar hunt_link with planEventId
        try { pushCloud(events[idx]); } catch (eP) {}
      }

      function applyPlanRow(planId, baseState) {
        if (!planId || !isUuidLike(planId)) return Promise.resolve();
        // Merge — never wipe Plan packing lists / expenses already on the row
        var stateObj = Object.assign({}, (baseState && typeof baseState === 'object') ? baseState : {}, {
          color: ev.color || (baseState && baseState.color) || '#e59a18',
          hunt_event_id: String(ev.id),
          fromHuntSlayer: true,
          mapScope: ev.mapScope || (baseState && baseState.mapScope) || 'personal',
          sharedMapId: ev.sharedMapId != null ? ev.sharedMapId : ((baseState && baseState.sharedMapId) || null),
          privateMapId: ev.privateMapId != null ? ev.privateMapId : ((baseState && baseState.privateMapId) || null),
          weapon: ev.weapon || (baseState && baseState.weapon) || null,
          land: ev.land || (baseState && baseState.land) || null
        });
        if (ev.listPack && ev.listPack.columns) {
          stateObj.namedListPack = ev.listPack;
        }
        if (!stateObj.lists) {
          stateObj.lists = {
            todo: { group: [], personal: {} },
            buy: { group: [], personal: {} },
            bring: { group: [], personal: {} }
          };
        }
        if (!Array.isArray(stateObj.expenses)) stateObj.expenses = [];
        if (!Array.isArray(stateObj.mapPins)) stateObj.mapPins = [];
        return sb.from('plan_events').update({
          name: ev.text || 'Event',
          event_type: ev.weapon ? String(ev.weapon).toLowerCase() : 'hunt',
          start_at: ymdToIsoNoon(ev.startDate),
          end_at: ymdToIsoNoon(ev.endDate || ev.startDate),
          location_label: ev.locationLabel || null,
          lat: ev.lat != null && !isNaN(Number(ev.lat)) ? Number(ev.lat) : null,
          lng: ev.lng != null && !isNaN(Number(ev.lng)) ? Number(ev.lng) : null,
          state: stateObj,
          updated_at: new Date().toISOString()
        }).eq('id', planId).then(function (res) {
          if (res && res.error) {
            try { console.warn('[calendar] plan_events update', res.error); } catch (e0) {}
          }
        }).catch(function (e1) {
          try { console.warn('[calendar] plan_events update', e1); } catch (e2) {}
        });
      }

      var existingPlanId = (ev.planEventId && isUuidLike(ev.planEventId))
        ? String(ev.planEventId)
        : null;

      if (existingPlanId) {
        sb.from('plan_events').select('state').eq('id', existingPlanId).maybeSingle()
          .then(function (res) {
            var st = (res && res.data && res.data.state) || {};
            return applyPlanRow(existingPlanId, st);
          })
          .catch(function () { return applyPlanRow(existingPlanId, {}); });
        return;
      }

      // Create on Plan (owner + invite code + membership)
      sb.rpc('create_plan_event', {
        p_name: ev.text || 'Event',
        p_event_type: 'hunt',
        p_start_at: ymdToIsoNoon(ev.startDate)
      }).then(function (res) {
        if (!res || res.error || !res.data) {
          try { console.warn('[calendar] create_plan_event', res && res.error); } catch (e3) {}
          return;
        }
        var row = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!row || !row.id) return;
        stampLocalPlanId(row.id, row.invite_code || null);
        // create_plan_event already seeded state.lists — merge into that
        return applyPlanRow(row.id, row.state || {});
      }).catch(function (e4) {
        try { console.warn('[calendar] create_plan_event', e4); } catch (e5) {}
      });
    } catch (e) {
      try { console.warn('[calendar] pushPlanCloud', e); } catch (e6) {}
    }
  }

  function upsert(ev) {
    var n = normalize(ev);
    if (!n) return null;
    if (isDeleted(n)) {
      // Explicit user edit of a still-visible form shouldn't resurrect tombstones —
      // only allow if caller clears tombstone (not used today)
      return null;
    }
    if (!n.creatorUserId) n.creatorUserId = myId();
    n.updatedAt = new Date().toISOString();
    var idx = events.findIndex(function (e) { return String(e.id) === String(n.id); });
    if (idx >= 0) {
      var prev = events[idx] || {};
      var merged = Object.assign({}, prev, n);
      // Preserve Plan link if save form omitted it (edit path)
      if (!merged.planEventId && prev.planEventId) merged.planEventId = prev.planEventId;
      if (!merged.inviteCode && prev.inviteCode) merged.inviteCode = prev.inviteCode;
      if (!merged.planListId && prev.planListId) merged.planListId = prev.planListId;
      if (!merged.listPack && prev.listPack) merged.listPack = prev.listPack;
      events[idx] = merged;
    } else {
      n.createdAt = n.createdAt || new Date().toISOString();
      events.push(n);
    }
    saveLocal();
    var saved = getById(n.id);
    pushCloud(saved || n);
    // Dual-write to PlanSlayer plan_events so Plan calendar/list sees Hunt events
    try { pushPlanCloud(saved || n); } catch (eDp) {}
    return saved;
  }

  function hardDelete(id) {
    var ev = getById(id);
    // Also try match by plan_ dual id
    if (!ev) {
      ev = events.find(function (e) {
        return e && (String(e.planEventId) === String(id) || String(e.id) === 'plan_' + String(id));
      }) || null;
    }
    if (!ev) return false;
    if (!isCreator(ev)) return false;
    var delIds = [ev.id];
    if (ev.planEventId) {
      delIds.push(ev.planEventId);
      delIds.push('plan_' + ev.planEventId);
    }
    markDeletedIds(delIds);
    events = events.filter(function (e) {
      if (!e) return false;
      if (String(e.id) === String(ev.id)) return false;
      if (ev.planEventId && e.planEventId && String(e.planEventId) === String(ev.planEventId)) return false;
      if (ev.planEventId && String(e.id) === 'plan_' + String(ev.planEventId)) return false;
      return !isDeleted(e);
    });
    delIds.forEach(function (d) { delete localHides[String(d)]; });
    saveLocal();
    try {
      var sb = global.RegSlayerCloud && global.RegSlayerCloud.getClient && global.RegSlayerCloud.getClient();
      if (sb) {
        // Hunt/Reg calendar cloud row
        sb.from('map_calendar_events').delete().eq('id', ev.id).then(function () {});
        // Also delete any dual-write rows for this plan event (other id shapes)
        if (ev.planEventId) {
          sb.from('map_calendar_events').select('id, hunt_link').then(function (res) {
            if (!res || !res.data) return;
            res.data.forEach(function (row) {
              if (!row || !row.id) return;
              var pe = row.hunt_link && row.hunt_link.planEventId;
              if (String(row.id) === String(ev.id) ||
                  String(row.id) === 'plan_' + String(ev.planEventId) ||
                  (pe && String(pe) === String(ev.planEventId))) {
                sb.from('map_calendar_events').delete().eq('id', row.id).then(function () {});
              }
            });
          }).catch(function () {});
          // Plan cloud event (same account)
          sb.from('plan_events').delete().eq('id', ev.planEventId).then(function () {}).catch(function () {});
        }
      }
    } catch (e) {}
    // Host app: strip map pins + repaint
    try {
      if (typeof global.onCalendarEventHardDeleted === 'function') {
        global.onCalendarEventHardDeleted(ev);
      }
    } catch (eH) {}
    return true;
  }

  function migrateLegacyDayMap(dayMap) {
    if (!dayMap || typeof dayMap !== 'object') return;
    Object.keys(dayMap).forEach(function (ds) {
      var arr = dayMap[ds];
      if (!Array.isArray(arr)) return;
      arr.forEach(function (old) {
        if (!old) return;
        var id = old.id || uid();
        if (getById(id)) return;
        upsert({
          id: id,
          text: old.text || 'Event',
          color: old.color || '#e59a18',
          startDate: ds,
          endDate: ds,
          mapScope: 'personal',
          locationId: old.locationId || null,
          weapon: old.weapon || null,
          land: old.land || null,
          creatorUserId: myId(),
          _localOnly: true
        });
      });
    });
  }

  function rowToEvent(row) {
    if (!row) return null;
    var n = normalize({
      id: row.id,
      text: row.name || row.text,
      color: row.color,
      startDate: row.start_date,
      endDate: row.end_date,
      mapScope: row.map_scope,
      sharedMapId: row.shared_map_id,
      privateMapId: row.private_map_id || (row.hunt_link && row.hunt_link.privateMapId) || null,
      lat: row.lat,
      lng: row.lng,
      locationLabel: row.location_label,
      locationId: row.hunt_link && row.hunt_link.locationId,
      weapon: row.hunt_link && row.hunt_link.weapon,
      land: row.hunt_link && row.hunt_link.land,
      creatorUserId: row.creator_user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hunt_link: row.hunt_link || null,
      planEventId: row.hunt_link && row.hunt_link.planEventId,
      planListId: row.hunt_link && row.hunt_link.planListId,
      inviteCode: row.hunt_link && row.hunt_link.inviteCode,
      members: row.hunt_link && row.hunt_link.members,
      listPack: row.hunt_link && row.hunt_link.listPack,
      _fromPlanSlayer: row.hunt_link && row.hunt_link.fromPlanSlayer
    });
    // Mirror Plan list pack into local bridge so View list works after cloud pull
    if (n && n.listPack) {
      try {
        var bag = JSON.parse(localStorage.getItem('slayer_event_lists_v1') || '{}') || {};
        var pack = n.listPack;
        if (n.planEventId) bag[String(n.planEventId)] = pack;
        bag['hunt:' + String(n.id)] = pack;
        if (n.planListId) bag['list:' + String(n.planListId)] = pack;
        bag[String(n.id)] = pack;
        localStorage.setItem('slayer_event_lists_v1', JSON.stringify(bag));
      } catch (eBag) {}
    }
    return n;
  }

  function eventToRow(ev) {
    return {
      id: ev.id,
      creator_user_id: ev.creatorUserId || myId(),
      name: ev.text,
      color: ev.color,
      start_date: ev.startDate,
      end_date: ev.endDate,
      map_scope: ev.mapScope || 'personal',
      shared_map_id: ev.sharedMapId || null,
      private_map_id: ev.privateMapId || null,
      lat: ev.lat,
      lng: ev.lng,
      location_label: ev.locationLabel,
      hunt_link: {
        locationId: ev.locationId,
        weapon: ev.weapon,
        land: ev.land,
        privateMapId: ev.privateMapId || null,
        planEventId: ev.planEventId || null,
        planListId: ev.planListId || null,
        inviteCode: ev.inviteCode || null,
        members: Array.isArray(ev.members) ? ev.members : [],
        listPack: ev.listPack || null,
        fromPlanSlayer: !!ev._fromPlanSlayer
      },
      updated_at: new Date().toISOString()
    };
  }

  function pushCloud(ev) {
    try {
      var sb = global.RegSlayerCloud && global.RegSlayerCloud.getClient && global.RegSlayerCloud.getClient();
      var uid = myId();
      if (!sb || !uid || !ev) return;
      var row = eventToRow(ev);
      if (!row.creator_user_id) row.creator_user_id = uid;
      // UUID ids from server; local ids may not be uuid — skip cloud if not uuid-like
      var isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(ev.id));
      if (!isUuid) {
        // insert without id, then rewrite local id if returned
        var ins = Object.assign({}, row);
        delete ins.id;
        sb.from('map_calendar_events').insert(ins).select('*').maybeSingle()
          .then(function (res) {
            if (res && res.data && res.data.id) {
              var oldId = ev.id;
              var n = rowToEvent(res.data);
              events = events.filter(function (e) { return String(e.id) !== String(oldId); });
              events.push(n);
              saveLocal();
            }
          })
          .catch(function () {});
        return;
      }
      sb.from('map_calendar_events').upsert(row).then(function () {}).catch(function () {});
    } catch (e) {}
  }

  function mergeEvent(n) {
    if (!n || !n.id) return;
    // Never resurrect a deleted event
    if (isDeleted(n)) return;
    // Prefer match by id, then by planEventId (Plan dual-write may rewrite UUID) (#78)
    var idx = events.findIndex(function (e) {
      if (!e) return false;
      if (String(e.id) === String(n.id)) return true;
      if (n.planEventId && e.planEventId && String(e.planEventId) === String(n.planEventId)) return true;
      return false;
    });
    if (idx >= 0) {
      var local = events[idx];
      if (new Date(n.updatedAt || 0) >= new Date(local.updatedAt || 0)) {
        var merged = Object.assign({}, local, n, { id: n.id || local.id });
        // Keep richer listPack (Plan items) if incoming row omitted / emptied it
        try {
          var incPack = n.listPack && n.listPack.columns ? n.listPack : null;
          var locPack = local.listPack && local.listPack.columns ? local.listPack : null;
          function packItemCount(p) {
            var c = 0;
            if (!p || !p.columns) return 0;
            p.columns.forEach(function (col) { c += (col && col.items ? col.items.length : 0); });
            return c;
          }
          if ((!incPack || packItemCount(incPack) === 0) && locPack && packItemCount(locPack) > 0) {
            merged.listPack = locPack;
          } else if (incPack && packItemCount(incPack) > 0) {
            merged.listPack = incPack;
          }
          if (!merged.planListId && local.planListId) merged.planListId = local.planListId;
        } catch (ePk) {}
        events[idx] = merged;
      } else if (n.listPack && n.listPack.columns && n.listPack.columns.length) {
        // Even if older stamp, adopt richer packing pack from Plan
        try {
          var locN = 0;
          (local.listPack && local.listPack.columns || []).forEach(function (c) {
            locN += (c && c.items ? c.items.length : 0);
          });
          var incN = 0;
          n.listPack.columns.forEach(function (c) {
            incN += (c && c.items ? c.items.length : 0);
          });
          if (incN > locN) {
            local.listPack = n.listPack;
            if (n.planListId) local.planListId = n.planListId;
          }
        } catch (eR) {}
      }
    } else {
      events.push(n);
    }
  }

  function pullCloud() {
    try {
      var sb = global.RegSlayerCloud && global.RegSlayerCloud.getClient && global.RegSlayerCloud.getClient();
      var uid = myId();
      if (!sb || !uid) return Promise.resolve();
      var liveMapIds = {};
      var livePlanIds = {};
      return sb.from('map_calendar_events').select('*').then(function (res) {
        if (res.error || !res.data) return;
        res.data.forEach(function (row) {
          var n = rowToEvent(row);
          if (!n) return;
          if (isDeleted(n)) return;
          liveMapIds[String(n.id)] = true;
          if (n.planEventId) livePlanIds[String(n.planEventId)] = true;
          mergeEvent(n);
        });
        saveLocal();
      }).then(function () {
        // Also pull Plan cloud events into Hunt calendar (#78 account link)
        return sb.rpc('list_my_plan_events').then(function (res) {
          if (!res || res.error || !res.data) return;
          (res.data || []).forEach(function (pev) {
            if (!pev || !pev.id) return;
            if (isDeleted(pev.id) || isDeleted('plan_' + pev.id)) return;
            function ymd(iso) {
              if (!iso) return null;
              var d = new Date(iso);
              if (isNaN(d.getTime())) return null;
              return localYmd(d);
            }
            var start = ymd(pev.start_at) || ymd(pev.created_at);
            if (!start) return;
            var st = (pev.state && typeof pev.state === 'object') ? pev.state : {};
            var huntId = pev.hunt_event_id || st.hunt_event_id || ('plan_' + pev.id);
            var pack = st.namedListPack || null;
            livePlanIds[String(pev.id)] = true;
            liveMapIds[String(huntId)] = true;
            var nPlan = normalize({
              id: huntId,
              text: pev.name || 'Event',
              color: st.color || '#e59a18',
              startDate: start,
              endDate: ymd(pev.end_at) || start,
              lat: pev.lat != null ? pev.lat : null,
              lng: pev.lng != null ? pev.lng : null,
              locationLabel: pev.location_label || null,
              planEventId: String(pev.id),
              planListId: (pack && pack.listId) || null,
              listPack: pack,
              mapScope: st.mapScope || 'personal',
              sharedMapId: st.sharedMapId || null,
              privateMapId: st.privateMapId || null,
              creatorUserId: pev.owner_user_id || pev.creator_user_id || null,
              _fromPlanSlayer: true,
              updatedAt: pev.updated_at || new Date().toISOString()
            });
            mergeEvent(nPlan);
            // Mirror packing pack into bridge bag so List popup has items cross-origin
            if (nPlan && nPlan.listPack && nPlan.listPack.columns) {
              try {
                var bagP = JSON.parse(localStorage.getItem('slayer_event_lists_v1') || '{}') || {};
                var pk = nPlan.listPack;
                bagP[String(pev.id)] = pk;
                bagP['hunt:' + String(huntId)] = pk;
                if (pk.listId) bagP['list:' + String(pk.listId)] = pk;
                bagP[String(huntId)] = pk;
                localStorage.setItem('slayer_event_lists_v1', JSON.stringify(bagP));
              } catch (eBagP) {}
            }
          });
          saveLocal();
        }).catch(function () {});
      }).then(function () {
        // Prune local events deleted remotely (stop ghost calendar dots / map pins)
        var before = events.length;
        events = events.filter(function (e) {
          if (!e) return false;
          if (isDeleted(e)) return false;
          // Plan dual-writes: drop if no longer in plan_events cloud
          if (e._fromPlanSlayer && e.planEventId && !livePlanIds[String(e.planEventId)]) {
            return false;
          }
          // Our cloud map_calendar rows: if we know the live set and this is ours, drop if missing
          if (e.creatorUserId && String(e.creatorUserId) === String(uid) &&
              !e._localOnly && Object.keys(liveMapIds).length > 0 &&
              !liveMapIds[String(e.id)] &&
              !(e.planEventId && livePlanIds[String(e.planEventId)])) {
            // Only prune UUID cloud ids (never prune un-pushed local drafts without plan link)
            if (/^[0-9a-f]{8}-/i.test(String(e.id)) || String(e.id).indexOf('plan_') === 0) {
              return false;
            }
          }
          return true;
        });
        if (events.length !== before) saveLocal();
      }).then(function () {
        return sb.from('map_calendar_event_hides').select('event_id').eq('user_id', uid);
      }).then(function (res) {
        if (res && res.data) {
          res.data.forEach(function (h) {
            if (h.event_id) localHides[String(h.event_id)] = true;
          });
          saveLocal();
        }
      }).then(function () {
        // Re-paint dots after cloud merge (#78 desktop parity)
        try {
          if (typeof global.renderCalendar === 'function') global.renderCalendar();
          if (typeof global.updateEventsList === 'function') global.updateEventsList();
          if (typeof global.drawPinsOnMap === 'function') global.drawPinsOnMap();
          if (typeof global.onCalendarEventsChanged === 'function') global.onCalendarEventsChanged();
        } catch (eRepaint) {}
      }).catch(function () {});
    } catch (e) {
      return Promise.resolve();
    }
  }

  function beginLocationPick(ctx) {
    pendingLocationPick = ctx || null;
  }
  function cancelLocationPick() {
    pendingLocationPick = null;
  }
  function getPendingLocationPick() {
    return pendingLocationPick;
  }
  function applyLocationPick(lat, lng, label) {
    if (!pendingLocationPick) return null;
    var pick = pendingLocationPick;
    pendingLocationPick = null;
    var id = pick.eventId || pick.draftId;
    var ev = getById(id);
    if (ev) {
      ev.lat = lat;
      ev.lng = lng;
      if (label) ev.locationLabel = label;
      return upsert(ev);
    }
    // Draft only — return coords for form to hold
    return { draft: true, id: id, lat: lat, lng: lng, locationLabel: label || null, name: pick.name };
  }

  function init(legacyDayMap) {
    if (ready) return;
    loadLocal();
    if (legacyDayMap && !events.length) migrateLegacyDayMap(legacyDayMap);
    // Seed demos only if completely empty
    if (!events.length) {
      events = [
        normalize({
          id: 'e1', text: 'Bankhead Camp Opening', color: '#e59a18',
          startDate: '2026-11-14', endDate: '2026-11-14',
          mapScope: 'personal', locationId: 5, weapon: 'Primitive', land: 'Public'
        }),
        normalize({
          id: 'e2', text: 'Talladega Gun Hunt Trip', color: '#d94136',
          startDate: '2026-11-21', endDate: '2026-11-21',
          mapScope: 'personal', locationId: 6, weapon: 'Gun', land: 'Public'
        })
      ].filter(Boolean);
      saveLocal();
    }
    ready = true;
    // Soft pull when cloud available
    setTimeout(function () { pullCloud(); }, 800);
  }

  global.RegSlayerCalendarEvents = {
    STORAGE_KEY: STORAGE_KEY,
    init: init,
    localYmd: localYmd,
    parseYmd: parseYmd,
    uid: uid,
    all: function () { return events.slice(); },
    eventsForDay: eventsForDay,
    eventsForDayDots: eventsForDayDots,
    getById: getById,
    upsert: upsert,
    hardDelete: hardDelete,
    hideForMe: hideForMe,
    unhideForMe: unhideForMe,
    isCreator: isCreator,
    isHidden: isHidden,
    isDeleted: isDeleted,
    markDeletedIds: markDeletedIds,
    myId: myId,
    activeSharedMapId: activeSharedMapId,
    beginLocationPick: beginLocationPick,
    cancelLocationPick: cancelLocationPick,
    getPendingLocationPick: getPendingLocationPick,
    applyLocationPick: applyLocationPick,
    pullCloud: pullCloud,
    saveLocal: saveLocal
  };
})(typeof window !== 'undefined' ? window : this);
