/**
 * PlanEventsListsKit — PlanSlayer event cards + floating lists for Hunt (TestOfflineHunt)
 *
 * Source of truth for list/event UX: Desktop/PlanSlayer (APP_VERSION pin there).
 * Storage (shared with PlanSlayer when same browser profile):
 *   - plan_slayer_free_lists_v1
 *   - slayer_event_lists_v1
 *   - reg_slayer_cal_events_v2 (Hunt calendar — via host helpers)
 *
 * Host hooks (optional window functions):
 *   goToEventLocation, startEditEventById, hideEventFromMyCalendar,
 *   deleteEventForEveryone, openQuickLoadMenu, showAppCopyToast,
 *   RegSlayerCalendarEvents
 */
(function (global) {
  'use strict';

  var FREE_LISTS_KEY = 'plan_slayer_free_lists_v1';
  var SLAYER_EVENT_LISTS_KEY = 'slayer_event_lists_v1';
  var PLAN_EVENTS_KEY = 'plan_slayer_events_v1';
  var PLAN_CHORES_KEY = 'plan_slayer_chores_v1';
  var HUNT_CAL_KEY = 'reg_slayer_cal_events_v2';
  var ME_KEY = 'plan_slayer_my_id_v1';
  var DEFAULT_COL_COLORS = { font: '#f0f4ee', tab: '#2a3222', bg: '#0a0c09' };
  var COL_COLOR_PRESETS = ['#000000', '#ffffff', '#2563eb', '#dc2626', '#facc15', '#e59a18', '#16a34a', '#9333ea'];

  var state = {
    activeEventId: null,
    activeListId: null,
    expandedItemId: null,
    floatOpen: false,
    focusEventId: null,
    activeColId: null, // #122 mobile: single active section tab
    colOpts: { listId: null, colId: null, slot: 'tab' }
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function uid() {
    return 'ps_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }
  function loadJson(key, fb) {
    try {
      var r = localStorage.getItem(key);
      return r ? JSON.parse(r) : fb;
    } catch (e) { return fb; }
  }
  function saveJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) { return false; }
  }
  function myId() {
    try {
      if (global.supabaseAuthUser && global.supabaseAuthUser.id) return String(global.supabaseAuthUser.id);
    } catch (e) {}
    try {
      var a = localStorage.getItem('sb-grvhmktqzrivbqbczkii-auth-token');
      if (a) {
        var j = JSON.parse(a);
        if (j && j.user && j.user.id) return String(j.user.id);
      }
    } catch (e2) {}
    var local = loadJson(ME_KEY, null);
    if (local && local.id) return String(local.id);
    var id = 'local_' + Math.random().toString(36).slice(2, 9);
    saveJson(ME_KEY, { id: id });
    return id;
  }
  function myName() {
    try {
      if (global.supabaseAuthUser && global.supabaseAuthUser.user_metadata) {
        return global.supabaseAuthUser.user_metadata.display_name ||
          global.supabaseAuthUser.email || 'Me';
      }
    } catch (e) {}
    return 'Me';
  }
  function toast(msg) {
    if (typeof global.showAppCopyToast === 'function') {
      try { global.showAppCopyToast(String(msg)); return; } catch (e) {}
    }
    try { console.info('[PlanKit]', msg); } catch (e2) {}
  }

  /* ——— Countdown (PlanSlayer) ——— */
  function countdownParts(startAt, endAt) {
    if (!startAt) return null;
    var start = new Date(startAt);
    if (isNaN(start.getTime())) return null;
    var end = endAt ? new Date(endAt) : null;
    var now = new Date();
    if (end && !isNaN(end.getTime()) && now >= start && now <= end) {
      return { mode: 'now', text: 'Happening now!', urgent: false };
    }
    if (now >= start && (!end || isNaN(end.getTime()))) {
      return { mode: 'now', text: 'Happening now!', urgent: false };
    }
    if (end && !isNaN(end.getTime()) && now > end) return { mode: 'past', text: '', urgent: false };
    if (now > start && (!end || isNaN(end.getTime()))) return { mode: 'past', text: '', urgent: false };
    var ms = start - now;
    if (ms <= 0) return { mode: 'now', text: 'Happening now!', urgent: false };
    var sec = Math.floor(ms / 1000);
    var days = Math.floor(sec / 86400);
    sec -= days * 86400;
    var hours = Math.floor(sec / 3600);
    sec -= hours * 3600;
    var mins = Math.floor(sec / 60);
    var text = '';
    if (days > 0) text = days + 'd ' + hours + 'h';
    else if (hours > 0) text = hours + 'h ' + mins + 'm';
    else text = mins + 'm';
    return { mode: 'live', text: text, urgent: days === 0 && hours < 12 };
  }
  function countdownHtml(startAt, endAt) {
    var p = countdownParts(startAt, endAt);
    if (!p) return '';
    if (p.mode === 'now') return '<span class="cd cd-now">Happening now!</span>';
    if (p.mode === 'past') return '';
    return '<span class="cd cd-live' + (p.urgent ? ' is-urgent' : '') +
      '"><span class="cd-tminus">T minus</span> ' + esc(p.text) + '</span>';
  }

  function huntEventStartIso(ev) {
    if (!ev) return null;
    if (ev.start_at) return ev.start_at;
    if (ev.startDate) {
      var t = ev.startTime || '00:00';
      return ev.startDate + 'T' + (t.length === 5 ? t + ':00' : t);
    }
    return null;
  }
  function huntEventEndIso(ev) {
    if (!ev) return null;
    if (ev.end_at) return ev.end_at;
    if (ev.endDate) {
      var t = ev.endTime || '23:59';
      return ev.endDate + 'T' + (t.length === 5 ? t + ':00' : t);
    }
    return huntEventStartIso(ev);
  }
  function huntEventName(ev) {
    return (ev && (ev.text || ev.name || 'Event')) || 'Event';
  }

  /* ——— Lists store ——— */
  function loadFreeListsStore() {
    var s = loadJson(FREE_LISTS_KEY, null) || {};
    if (!s.named) s.named = [];
    return s;
  }
  function saveFreeListsStore(store) {
    return saveJson(FREE_LISTS_KEY, store);
  }
  function loadSlayerBag() {
    return loadJson(SLAYER_EVENT_LISTS_KEY, {}) || {};
  }
  function allNamedLists() {
    var store = loadFreeListsStore();
    return (store.named || []).filter(function (n) { return n && n.id; });
  }
  function findNamedListById(id) {
    if (!id) return null;
    return allNamedLists().find(function (n) { return String(n.id) === String(id); }) || null;
  }
  function packSnapshotFromList(list) {
    if (!list) return null;
    return {
      listId: list.id,
      name: list.name,
      eventId: list.eventId || null,
      eventName: list.name,
      members: list.members || [],
      // Shared pack only — never put private My checklist rows in the cloud pack (#113)
      columns: (list.columns || []).filter(function (c) {
        return c && String(c.id) !== 'personal';
      }).map(function (c) {
        return {
          id: c.id,
          name: c.name,
          items: (c.items || []).map(function (it) {
            return {
              id: it.id, title: it.title, qty: it.qty, claims: it.claims || {},
              qualifier: it.qualifier, priority: it.priority, highlight: it.highlight,
              highlight_color: it.highlight_color, notes: it.notes,
              due_mode: it.due_mode, due_days: it.due_days
            };
          }),
          minimized: !!c.minimized,
          colors: c.colors || null
        };
      }),
      invite_code: list.invite_code || null,
      updated_at: list.updated_at || new Date().toISOString()
    };
  }

  /**
   * #113 Phase A: dual-write packing pack onto Hunt calendar cloud + Plan namedListPack
   * so cross-origin sites share the same event list.
   */
  function pushListPackToCloud(list) {
    if (!list || !list.id) return;
    var snap = packSnapshotFromList(list);
    if (!snap) return;
    try {
      var CE = global.RegSlayerCalendarEvents;
      var ev = null;
      if (CE && typeof CE.getById === 'function' && list.eventId) {
        ev = CE.getById(list.eventId);
      }
      if (!ev && CE && typeof CE.all === 'function' && list.eventId) {
        var all = CE.all() || [];
        ev = all.find(function (e) {
          if (!e) return false;
          if (String(e.id) === String(list.eventId)) return true;
          if (e.planEventId && String(e.planEventId) === String(list.eventId)) return true;
          if (e.planListId && String(e.planListId) === String(list.id)) return true;
        }) || null;
      }
      if (ev && typeof CE.upsert === 'function') {
        ev.listPack = snap;
        ev.planListId = list.id;
        if (list.eventId && String(list.eventId).indexOf('plan_') !== 0 &&
            /^[0-9a-f]{8}-/i.test(String(list.eventId)) === false &&
            !ev.planEventId) {
          // keep local link
        }
        try { CE.upsert(ev); } catch (eU) { console.warn('pushListPack calendar', eU); }
      }
    } catch (eCal) { console.warn('pushListPackToCloud cal', eCal); }

    // Plan cloud: update plan_events.state.namedListPack when we know planEventId
    try {
      var sb = global.RegSlayerCloud && global.RegSlayerCloud.getClient && global.RegSlayerCloud.getClient();
      if (!sb) return;
      var planId = null;
      if (ev && ev.planEventId) planId = String(ev.planEventId);
      else if (list.eventId && String(list.eventId).indexOf('plan_') === 0) {
        planId = String(list.eventId).slice(5);
      }
      // Do not treat Hunt calendar UUIDs as plan_events ids
      if (!planId || !/^[0-9a-f]{8}-/i.test(planId)) return;
      sb.from('plan_events').select('id,state').eq('id', planId).maybeSingle()
        .then(function (res) {
          if (!res || res.error || !res.data) {
            // try match via hunt_event_id field if present
            return;
          }
          var st = res.data.state || {};
          if (typeof st !== 'object') st = {};
          st.namedListPack = snap;
          return sb.from('plan_events').update({
            state: st,
            updated_at: new Date().toISOString()
          }).eq('id', planId);
        }).catch(function (eP) { console.warn('pushListPack plan', eP); });
    } catch (eSb) {}
  }

  function saveNamedList(list) {
    if (!list || !list.id) return false;
    var store = loadFreeListsStore();
    var i = (store.named || []).findIndex(function (n) { return String(n.id) === String(list.id); });
    list.updated_at = new Date().toISOString();
    if (i >= 0) store.named[i] = list;
    else store.named.push(list);
    // Mirror into slayer bridge for Hunt View list / Plan dual-read
    try {
      var bag = loadSlayerBag();
      var snap = packSnapshotFromList(list);
      bag['list:' + list.id] = snap;
      if (list.eventId) bag[String(list.eventId)] = snap;
      saveJson(SLAYER_EVENT_LISTS_KEY, bag);
    } catch (eM) {}
    var ok = saveFreeListsStore(store);
    // #113: push shared pack to cloud (best-effort)
    try {
      if (list.eventId) pushListPackToCloud(list);
    } catch (ePush) {}
    return ok;
  }
  function ensureColumns(list) {
    if (!list.columns || !list.columns.length) {
      list.columns = [
        { id: 'todo', name: 'To do', items: [], colors: Object.assign({}, DEFAULT_COL_COLORS) },
        { id: 'buy', name: 'To buy', items: [], colors: Object.assign({}, DEFAULT_COL_COLORS) },
        { id: 'bring', name: 'To bring', items: [], colors: Object.assign({}, DEFAULT_COL_COLORS) }
      ];
    }
    // Event packing packs get private My checklist (Plan parity)
    var wantPersonal = !!(list.eventId || (list.members && list.members.length > 1));
    var hasPersonal = (list.columns || []).some(function (c) { return c && String(c.id) === 'personal'; });
    if (wantPersonal && !hasPersonal) {
      list.columns.push({
        id: 'personal', name: 'My checklist', items: [],
        colors: { font: '#f0f4ee', tab: '#2a3a4a', bg: '#0a1014' }
      });
    }
    list.columns.forEach(function (c) {
      if (!c.items) c.items = [];
      if (!c.colors) c.colors = Object.assign({}, DEFAULT_COL_COLORS);
      c.items.forEach(function (it) {
        if (!it.id) it.id = uid();
        if (!it.claims || typeof it.claims !== 'object') it.claims = {};
      });
    });
    return list;
  }

  function listKindLabel(id) {
    if (id === 'todo') return 'To do';
    if (id === 'buy') return 'To buy';
    if (id === 'bring') return 'To bring';
    if (id === 'personal') return 'My checklist';
    return id || 'Section';
  }
  function shareIconSvg() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.9M15.4 6.6l-6.8 3.9"/></svg>';
  }

  /** Import PlanSlayer events + chores into Hunt calendar storage (same login / same browser). */
  function syncPlanIntoHuntCalendar() {
    function ymdFromIso(iso) {
      if (!iso) return null;
      var d = new Date(iso);
      if (isNaN(d.getTime())) return null;
      var y = d.getFullYear();
      var m = d.getMonth() + 1;
      var day = d.getDate();
      return y + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
    }
    var n = 0;
    var CE = global.RegSlayerCalendarEvents;
    function putRow(row) {
      if (!row || !row.id || !row.startDate) return;
      n++;
      if (CE && typeof CE.upsert === 'function') {
        try { CE.upsert(row); return; } catch (eU) {}
      }
      // Fallback: raw localStorage merge
      var raw = [];
      try { raw = JSON.parse(localStorage.getItem(HUNT_CAL_KEY) || '[]'); } catch (e) { raw = []; }
      if (!Array.isArray(raw)) raw = [];
      var idx = raw.findIndex(function (x) { return x && String(x.id) === String(row.id); });
      if (idx >= 0) raw[idx] = Object.assign({}, raw[idx], row);
      else raw.push(row);
      try { localStorage.setItem(HUNT_CAL_KEY, JSON.stringify(raw)); } catch (eW) {}
    }
    var planEv = loadJson(PLAN_EVENTS_KEY, []);
    if (Array.isArray(planEv)) {
      planEv.forEach(function (ev) {
        if (!ev || !ev.id) return;
        var huntId = ev.hunt_event_id || ('plan_' + ev.id);
        var start = ymdFromIso(ev.start_at) || ymdFromIso(ev.created_at);
        if (!start) return;
        putRow({
          id: huntId,
          text: ev.name || 'Event',
          color: (ev.state && ev.state.color) || '#e59a18',
          startDate: start,
          endDate: ymdFromIso(ev.end_at) || start,
          lat: ev.lat != null ? ev.lat : null,
          lng: ev.lng != null ? ev.lng : null,
          locationLabel: ev.location_label || null,
          planEventId: String(ev.id),
          planListId: ev.planListId || null,
          inviteCode: ev.invite_code || null,
          mapScope: 'personal',
          _fromPlanSlayer: true
        });
      });
    }
    var chores = loadJson(PLAN_CHORES_KEY, []);
    if (Array.isArray(chores)) {
      chores.forEach(function (ch) {
        if (!ch || !ch.id || ch.done) return;
        var start = ymdFromIso(ch.start_at);
        if (!start) return;
        putRow({
          id: 'chore_' + ch.id,
          text: ch.name || 'Chore',
          color: ch.color || '#6a8ab8',
          startDate: start,
          endDate: ymdFromIso(ch.end_at) || start,
          isChore: true,
          planChoreId: String(ch.id),
          mapScope: 'personal',
          _fromPlanSlayer: true
        });
      });
    }
    try {
      if (typeof global.renderCalendar === 'function') global.renderCalendar();
      if (typeof global.updateEventsList === 'function') global.updateEventsList();
    } catch (eU) {}
    return n;
  }

  function syncListsFromStorage() {
    // Re-read free lists + bridge bag (Plan may have updated them)
    var nLists = allNamedLists().length;
    var bag = loadSlayerBag();
    var bagN = bag ? Object.keys(bag).length : 0;
    return { lists: nLists, bridge: bagN };
  }

  function countPackItems(cols) {
    var n = 0;
    (cols || []).forEach(function (c) { n += (c && c.items ? c.items.length : 0); });
    return n;
  }

  /** Resolve best listPack for a Hunt event from event row + bridge bag. */
  function resolvePackForEvent(ev) {
    if (!ev) return null;
    var bag = loadSlayerBag();
    var pack = null;
    if (ev.listPack && (ev.listPack.columns || ev.listPack.name)) pack = ev.listPack;
    else if (ev.planListId && bag['list:' + ev.planListId]) pack = bag['list:' + ev.planListId];
    else if (bag['hunt:' + ev.id]) pack = bag['hunt:' + ev.id];
    else if (bag[String(ev.id)]) pack = bag[String(ev.id)];
    else if (ev.planEventId && bag[String(ev.planEventId)]) pack = bag[String(ev.planEventId)];
    else if (ev.planEventId && bag['list:' + ev.planEventId]) pack = bag['list:' + ev.planEventId];
    return pack && (pack.columns || pack.name) ? pack : null;
  }

  /** Write pack into bridge bag under stable keys for cross-site / re-open. */
  function writePackToBag(ev, pack) {
    if (!ev || !pack) return;
    try {
      var bag = loadSlayerBag();
      if (ev.planEventId) bag[String(ev.planEventId)] = pack;
      bag['hunt:' + String(ev.id)] = pack;
      if (ev.planListId) bag['list:' + String(ev.planListId)] = pack;
      if (pack.listId) bag['list:' + String(pack.listId)] = pack;
      bag[String(ev.id)] = pack;
      saveJson(SLAYER_EVENT_LISTS_KEY, bag);
    } catch (eB) {}
  }

  /**
   * Merge cloud/local pack into free-lists store (prefer richer / newer pack).
   * #107: never keep a stale empty list when bag/cloud has items.
   */
  function mergePackIntoNamedList(existing, pack, ev) {
    if (!pack) return existing || null;
    var personalCol = null;
    if (existing && existing.columns) {
      personalCol = existing.columns.find(function (c) { return c && String(c.id) === 'personal'; }) || null;
    }
    var packTs = pack.updated_at ? new Date(pack.updated_at).getTime() : 0;
    var localTs = existing && existing.updated_at ? new Date(existing.updated_at).getTime() : 0;
    var packItems = countPackItems(pack.columns);
    var localItems = existing ? countPackItems(existing.columns) : 0;
    var preferPack = !existing || packItems > localItems || (packTs && packTs >= localTs && packItems >= localItems);
    if (!preferPack && existing) return ensureColumns(existing);

    var list = {
      id: (existing && existing.id) || pack.listId || (ev && ('bridge_' + ev.id)) || uid(),
      name: pack.name || (existing && existing.name) || (ev ? huntEventName(ev) + ' · lists' : 'List'),
      eventId: (pack.eventId || (existing && existing.eventId) || (ev && (ev.planEventId || ev.id))) || null,
      members: pack.members || (existing && existing.members) || [],
      invite_code: pack.invite_code || (existing && existing.invite_code) || null,
      columns: (pack.columns || []).map(function (c) {
        return {
          id: c.id || uid(),
          name: c.name || c.id,
          items: (c.items || []).map(function (it) {
            return Object.assign({ id: it.id || uid(), claims: it.claims || {} }, it);
          }),
          minimized: !!c.minimized,
          colors: c.colors || null
        };
      }),
      updated_at: pack.updated_at || (existing && existing.updated_at) || new Date().toISOString()
    };
    // Keep private My checklist if pack omitted it
    if (personalCol) {
      var hasP = (list.columns || []).some(function (c) { return c && String(c.id) === 'personal'; });
      if (!hasP) list.columns.push(personalCol);
    }
    ensureColumns(list);
    saveNamedList(list);
    if (ev) writePackToBag(ev, {
      listId: list.id,
      name: list.name,
      eventId: list.eventId,
      columns: list.columns.filter(function (c) { return c && String(c.id) !== 'personal'; }),
      updated_at: list.updated_at
    });
    return list;
  }

  function findExistingListForEvent(ev) {
    if (!ev) return null;
    var named = allNamedLists();
    var hit = named.find(function (n) {
      return n && n.eventId && String(n.eventId) === String(ev.id);
    });
    if (hit) return hit;
    if (ev.planListId) {
      hit = named.find(function (n) { return String(n.id) === String(ev.planListId); });
      if (hit) return hit;
    }
    if (ev.planEventId) {
      hit = named.find(function (n) {
        return n && n.eventId && String(n.eventId) === String(ev.planEventId);
      });
      if (hit) return hit;
    }
    return null;
  }

  /** #107: pull plan_events.state.namedListPack into bag + free lists */
  function pullPlanNamedListPacks() {
    try {
      var sb = global.RegSlayerCloud && global.RegSlayerCloud.getClient && global.RegSlayerCloud.getClient();
      if (!sb) return Promise.resolve(0);
      return sb.rpc('list_my_plan_events').then(function (res) {
        if (!res || res.error || !res.data) return 0;
        var n = 0;
        (res.data || []).forEach(function (pev) {
          if (!pev || !pev.id) return;
          var pack = (pev.state && pev.state.namedListPack) || null;
          if (!pack || !pack.columns) return;
          var fakeEv = {
            id: pev.hunt_event_id || ('plan_' + pev.id),
            planEventId: String(pev.id),
            planListId: pack.listId || null,
            text: pev.name || 'Event',
            listPack: pack
          };
          writePackToBag(fakeEv, pack);
          mergePackIntoNamedList(findExistingListForEvent(fakeEv), pack, fakeEv);
          n++;
        });
        return n;
      }).catch(function () { return 0; });
    } catch (e) {
      return Promise.resolve(0);
    }
  }

  /** After calendar cloud pull: re-merge every event listPack into free lists */
  function materializeAllEventListPacks() {
    var n = 0;
    try {
      var CE = global.RegSlayerCalendarEvents;
      var all = CE && typeof CE.all === 'function' ? CE.all() : [];
      (all || []).forEach(function (ev) {
        if (!ev) return;
        var pack = resolvePackForEvent(ev);
        if (!pack) return;
        mergePackIntoNamedList(findExistingListForEvent(ev), pack, ev);
        n++;
      });
    } catch (eM) {}
    return n;
  }

  function refreshFloatAfterSync() {
    try {
      if (state.focusEventId && global.RegSlayerCalendarEvents &&
          typeof global.RegSlayerCalendarEvents.getById === 'function') {
        var fev = global.RegSlayerCalendarEvents.getById(state.focusEventId);
        if (fev) {
          var fl = findListForHuntEvent(fev);
          if (fl) state.activeListId = fl.id;
        }
      }
    } catch (eF) {}
    if (state.floatOpen) {
      renderFloatNav();
      renderFloatMain();
    }
    try {
      if (typeof global.renderCalendar === 'function') global.renderCalendar();
      if (typeof global.updateEventsList === 'function') global.updateEventsList();
    } catch (eR) {}
  }

  /**
   * #107 Sync on list float: pull cloud calendar + Plan namedListPack,
   * merge into free lists, refresh open float for this event.
   */
  function runFullSync() {
    toast('Syncing lists from cloud…');
    var nCal = 0;
    var cloudOk = false;
    function afterLocal() {
      try { nCal = syncPlanIntoHuntCalendar(); } catch (e1) { console.warn(e1); }
      try { syncListsFromStorage(); } catch (e2) {}
      try { materializeAllEventListPacks(); } catch (e3) {}
      refreshFloatAfterSync();
      toast(
        (cloudOk ? 'Synced from cloud' : 'Synced local Plan data') +
        (nCal ? (' · ' + nCal + ' calendar rows') : '')
      );
      return nCal;
    }
    var chain = Promise.resolve();
    try {
      if (global.RegSlayerCalendarEvents && typeof global.RegSlayerCalendarEvents.pullCloud === 'function') {
        chain = chain.then(function () {
          return Promise.resolve(global.RegSlayerCalendarEvents.pullCloud()).then(function () {
            cloudOk = true;
          }).catch(function () {});
        });
      }
    } catch (eP) {}
    chain = chain.then(function () {
      return pullPlanNamedListPacks().then(function (nP) {
        if (nP) cloudOk = true;
      });
    });
    return chain.then(function () { return afterLocal(); }).catch(function (err) {
      console.warn('runFullSync', err);
      afterLocal();
      toast('Sync finished with errors — check connection');
      return nCal;
    });
  }
  function findListForHuntEvent(ev) {
    if (!ev) return null;
    var existing = findExistingListForEvent(ev);
    var pack = resolvePackForEvent(ev);
    // Prefer merge when pack has data (stale local empty list fix — #107)
    if (pack) {
      return mergePackIntoNamedList(existing, pack, ev);
    }
    if (existing) return ensureColumns(existing);
    // Create empty packing list linked to this Hunt event
    var created = {
      id: uid(),
      name: huntEventName(ev) + ' · lists',
      eventId: String(ev.id),
      columns: [
        { id: 'todo', name: 'To do', items: [] },
        { id: 'buy', name: 'To buy', items: [] },
        { id: 'bring', name: 'To bring', items: [] }
      ],
      created_at: new Date().toISOString()
    };
    saveNamedList(created);
    return created;
  }
  function personalListsOnly() {
    return allNamedLists().filter(function (n) {
      return !n.eventId && !n.isPersonalEventList && !n.personalForEventId;
    });
  }
  function eventLinkedLists() {
    return allNamedLists().filter(function (n) {
      return !!(n.eventId || n.isPersonalEventList || n.personalForEventId);
    });
  }

  /* ——— Claims / Got it / Drop ——— */
  function claimsFilled(item) {
    var need = Math.max(1, Number(item.qty) || 1);
    var total = 0;
    var parts = [];
    Object.keys(item.claims || {}).forEach(function (uid) {
      var q = Number(item.claims[uid]) || 0;
      if (q > 0) {
        total += q;
        parts.push({ uid: uid, qty: q });
      }
    });
    return { need: need, total: total, parts: parts };
  }
  function isItemAccounted(item) {
    var c = claimsFilled(item);
    return c.total >= c.need;
  }
  function myClaimQty(item) {
    var me = myId();
    return Number((item.claims || {})[me] || (item.claims || {})[String(me)] || 0);
  }
  function clearMyClaims(item) {
    if (!item.claims) item.claims = {};
    var me = myId();
    delete item.claims[me];
    delete item.claims[String(me)];
  }
  function memberColorMap(list) {
    var map = {};
    var palette = ['#e59a18', '#3b82f6', '#16a34a', '#9333ea', '#ef4444', '#0ea5e9', '#a34a4a', '#4a6d9a'];
    if (list && list.memberColors && typeof list.memberColors === 'object') {
      Object.keys(list.memberColors).forEach(function (k) {
        if (list.memberColors[k]) map[String(k)] = list.memberColors[k];
      });
    }
    (list && list.members || []).forEach(function (m, i) {
      if (!m) return;
      var id = String(m.user_id || m.id || '');
      if (!id) return;
      if (!map[id]) map[id] = m.arrow_color || m.color || palette[i % palette.length];
    });
    // Me always has a color
    var me = myId();
    if (!map[me]) {
      try {
        var saved = localStorage.getItem('plan_slayer_my_color_v1');
        if (saved && /^#/.test(saved)) map[me] = saved;
      } catch (e) {}
      if (!map[me]) map[me] = '#a34a4a';
    }
    return map;
  }
  function colorForUid(list, uid) {
    var map = memberColorMap(list);
    var id = String(uid || '');
    if (map[id]) return map[id];
    var palette = ['#e59a18', '#3b82f6', '#16a34a', '#9333ea', '#ef4444', '#0ea5e9'];
    var h = 0;
    for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return palette[Math.abs(h) % palette.length];
  }
  function setMemberColorOnList(list, uid, hex) {
    if (!list || !uid || !hex) return false;
    if (!list.memberColors) list.memberColors = {};
    list.memberColors[String(uid)] = hex;
    if (!Array.isArray(list.members)) list.members = [];
    var m = list.members.find(function (x) {
      return x && String(x.user_id || x.id) === String(uid);
    });
    if (m) m.arrow_color = hex;
    else {
      list.members.push({
        user_id: String(uid),
        display_name: String(uid) === String(myId()) ? myName() : 'Member',
        arrow_color: hex,
        role: String(uid) === String(myId()) ? 'owner' : 'member'
      });
    }
    if (String(uid) === String(myId())) {
      try { localStorage.setItem('plan_slayer_my_color_v1', hex); } catch (e) {}
    }
    return saveNamedList(list);
  }
  function ensureListHasMe(list) {
    if (!list) return;
    if (!Array.isArray(list.members)) list.members = [];
    var me = myId();
    if (!list.members.some(function (m) { return m && String(m.user_id) === String(me); })) {
      list.members.unshift({
        user_id: me,
        display_name: myName(),
        arrow_color: colorForUid(list, me),
        role: 'owner'
      });
    }
    if (!list.owner_id) list.owner_id = me;
  }

  function claimFaceStyle(item, list) {
    var c = claimsFilled(item);
    if (!c.parts.length) {
      return 'background:linear-gradient(180deg,#2a3224 0%,#1a2018 45%,#12160f 100%);';
    }
    var stops = [];
    var at = 0;
    c.parts.forEach(function (p) {
      var w = (p.qty / Math.max(c.need, c.total)) * 100;
      var col = colorForUid(list, p.uid);
      var a = at;
      var b = Math.min(100, at + w);
      stops.push(col + ' ' + a.toFixed(1) + '%');
      stops.push(col + ' ' + b.toFixed(1) + '%');
      at = b;
    });
    if (at < 99.5) {
      stops.push('#1a2018 ' + at.toFixed(1) + '%');
      stops.push('#12160f 100%');
    }
    return 'background:linear-gradient(90deg,' + stops.join(',') + ');';
  }

  function renderItemRow(item, colId, list) {
    if (!item || !item.id) return '';
    if (!item.claims) item.claims = {};
    var mine = myClaimQty(item);
    var done = isItemAccounted(item);
    var hasClaim = claimsFilled(item).parts.length > 0;
    var exp = state.expandedItemId === item.id ? ' is-expanded' : '';
    var full = (done ? ' is-full is-complete' : '') + (hasClaim ? ' is-claimed' : '');
    var showDrop = done && mine > 0;
    var face = claimFaceStyle(item, list);
    var titleColor = done ? '#4ade80' : '#f0f4ee';
    return (
      '<div class="list-item' + exp + full + '" style="' + face + '" data-item-id="' + esc(item.id) +
        '" data-col-id="' + esc(colId) + '">' +
        '<div class="li-row">' +
          '<button type="button" class="li-face" data-act="expand">' +
            '<span class="li-title" style="color:' + titleColor + '">' + esc(item.title || 'Item') + '</span>' +
            ((item.qty || 1) > 1 ? ' <span class="li-qty">×' + (item.qty || 1) + '</span>' : '') +
          '</button>' +
          '<div class="li-actions">' +
            (showDrop
              ? '<button type="button" class="btn-got btn-drop is-on" data-act="drop">Drop</button>'
              : '<button type="button" class="btn-got' + (mine > 0 ? ' is-on' : '') +
                '" data-act="got">Got it!</button>') +
          '</div>' +
        '</div>' +
        '<div class="li-detail">' +
          '<div class="field-row">' +
            '<div class="field" style="flex:1 1 140px"><label>Title</label>' +
              '<input data-f="title" value="' + esc(item.title || '') + '" /></div>' +
            '<div class="field" style="width:72px"><label>Qty</label>' +
              '<input data-f="qty" type="number" min="1" value="' + (item.qty || 1) + '" /></div>' +
            '<div class="field" style="width:100px"><label>Priority</label>' +
              '<select data-f="priority">' +
                '<option value="0"' + (!item.priority ? ' selected' : '') + '>Normal</option>' +
                '<option value="1"' + (item.priority == 1 ? ' selected' : '') + '>High</option>' +
                '<option value="2"' + (item.priority == 2 ? ' selected' : '') + '>Urgent</option>' +
              '</select></div>' +
          '</div>' +
          '<div style="margin-top:8px"><label>Note</label>' +
            '<textarea data-f="notes" placeholder="Add a note…">' + esc(item.notes || '') + '</textarea></div>' +
          '<label style="display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12px">' +
            '<input type="checkbox" data-f="highlight" ' + (item.highlight ? 'checked' : '') + ' /> Highlight</label>' +
          '<div class="li-detail-actions">' +
            '<button type="button" class="btn-item-del" data-act="del">Delete</button>' +
            '<button type="button" class="btn-primary" data-act="save-detail">Save</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderTriad(list) {
    list = ensureColumns(list);
    // #122: pick active column for mobile tab layout (Plan parity)
    var cols = (list.columns || []).filter(function (c) { return c && !c.minimized; });
    if (!cols.length) cols = list.columns || [];
    if (!state.activeColId || !cols.some(function (c) { return String(c.id) === String(state.activeColId); })) {
      state.activeColId = cols[0] ? cols[0].id : 'todo';
    }
    var tabsHtml = '<div class="ps-col-tabs" role="tablist" aria-label="List sections">';
    (list.columns || []).forEach(function (col) {
      if (!col || col.minimized) return;
      var cid = col.id || 'todo';
      var on = String(cid) === String(state.activeColId);
      tabsHtml +=
        '<button type="button" role="tab" class="ps-col-tab' + (on ? ' is-active' : '') +
          '" data-ps-col-tab="' + esc(cid) + '" aria-selected="' + (on ? 'true' : 'false') + '">' +
          esc(col.name || listKindLabel(cid)) +
        '</button>';
    });
    tabsHtml += '</div>';

    var html = tabsHtml + '<div class="list-triad" data-list-id="' + esc(list.id) + '">';
    (list.columns || []).forEach(function (col) {
      if (!col) return;
      var cid = col.id || 'todo';
      var colors = col.colors || DEFAULT_COL_COLORS;
      var isClassic = cid === 'todo' || cid === 'buy' || cid === 'bring';
      var isPersonal = String(cid) === 'personal';
      var isActiveCol = String(cid) === String(state.activeColId);
      // Minimized section → thin restore tab
      if (col.minimized) {
        html +=
          '<div class="list-col is-minimized" data-col-kind="' + esc(cid) + '">' +
            '<button type="button" class="list-col-mini-label" data-col-restore="' + esc(cid) +
              '" title="Expand ' + esc(col.name || listKindLabel(cid)) + '">' +
              esc(col.name || listKindLabel(cid)) +
            '</button></div>';
        return;
      }
      var colItems = Array.isArray(col.items) ? col.items : [];
      // My checklist: show items I claimed on other columns + private rows
      if (isPersonal) {
        var me = myId();
        var claimed = [];
        var seen = {};
        (list.columns || []).forEach(function (c) {
          if (!c || String(c.id) === 'personal') return;
          (c.items || []).forEach(function (it) {
            if (!it || !it.id) return;
            var q = Number((it.claims || {})[me] || 0);
            if (q > 0 && !seen[it.id]) {
              seen[it.id] = true;
              claimed.push(it);
            }
          });
        });
        colItems.forEach(function (it) {
          if (it && it.id && !seen[it.id]) claimed.push(it);
        });
        colItems = claimed;
      }
      var sectionDone = colItems.length > 0 && colItems.every(function (it) {
        try { return isItemAccounted(it); } catch (e) { return false; }
      });
      var body = colItems.map(function (it) {
        return renderItemRow(it, cid, list);
      }).join('') || '<p class="empty">Nothing here yet.</p>';
      var titleColor = sectionDone ? '#4ade80' : (isClassic ? 'var(--accent, #e59a18)' : (colors.font || '#f0f4ee'));
      html +=
        '<div class="list-col' + (isPersonal ? ' list-col-personal' : '') +
          (isClassic ? ' list-col-classic' : '') +
          (isActiveCol ? ' is-active-col' : '') +
          '" data-col-kind="' + esc(cid) + '" ' +
          'style="--col-font:' + esc(colors.font || '#f0f4ee') + ';--col-tab:' + esc(colors.tab || '#2a3222') +
          ';--col-bg:' + esc(colors.bg || '#0a0c09') + ';">' +
          '<div class="list-col-head" style="background:' +
            (isClassic ? 'linear-gradient(180deg,#3a3420,#2a2418)' : esc(colors.tab || '#2a3222')) + ';">' +
            '<span class="list-col-title" style="color:' + esc(titleColor) + '">' +
              (sectionDone ? '✓ ' : '') + esc(col.name || listKindLabel(cid)) +
            '</span>' +
            '<div class="list-col-head-actions">' +
              '<button type="button" class="btn-icon list-col-opt" data-col-options="' + esc(cid) +
                '" title="Section options">⚙</button>' +
              '<button type="button" class="btn-icon list-share-ico" data-col-share="' + esc(cid) +
                '" title="Share this section">' + shareIconSvg() + '</button>' +
              '<button type="button" class="btn-icon" data-col-minimize="' + esc(cid) +
                '" title="Minimize">−</button>' +
            '</div>' +
          '</div>' +
          '<div class="list-col-body" style="background:' + esc(colors.bg || '#0a0c09') +
            ';color:' + esc(colors.font || '#f0f4ee') + ';">' + body + '</div>' +
          '<div class="list-col-add">' +
            (isPersonal
              ? '<span class="muted" style="font-size:10px;padding-right:4px;white-space:nowrap">Private · you only</span>'
              : '') +
            '<input type="text" class="list-col-add-input" data-col-add-input="' + esc(cid) +
              '" placeholder="' + (isPersonal ? 'Add private item…' : 'Type item, press Enter…') +
              '" autocomplete="off" />' +
            /* #120/#122 Plan parity: camera on every section incl. My checklist */
            '<button type="button" class="btn-icon list-ocr-cam" data-ocr-list="' + esc(cid) +
              '" title="Photo / file → list items">📷</button>' +
            '<button type="button" class="list-col-add-btn" data-col-add="' + esc(cid) + '">Add</button>' +
          '</div>' +
        '</div>';
    });
    html += '</div>';
    return html;
  }

  /* ——— Section options modal (PlanSlayer-style) ——— */
  function ensureColOptsDom() {
    if ($('ps-col-options-modal')) return;
    var ov = document.createElement('div');
    ov.id = 'ps-col-options-modal';
    ov.className = 'ps-modal-overlay';
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML =
      '<div class="ps-modal" role="dialog" style="max-width:380px">' +
        '<h3 id="ps-col-opt-title">Section options</h3>' +
        '<div class="field"><label for="ps-col-opt-name">Section name</label>' +
          '<input id="ps-col-opt-name" type="text" style="text-transform:capitalize" /></div>' +
        '<div class="ps-modal-actions" style="justify-content:flex-start;margin-bottom:12px">' +
          '<button type="button" class="btn btn-primary" id="ps-col-opt-save-name">Save name</button>' +
        '</div>' +
        '<p class="muted" style="font-size:12px;margin:0 0 8px">Customize this section only:</p>' +
        '<div class="ps-col-opt-slots" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">' +
          '<button type="button" class="btn is-active" data-ps-color-slot="tab">Tab</button>' +
          '<button type="button" class="btn" data-ps-color-slot="font">Font</button>' +
          '<button type="button" class="btn" data-ps-color-slot="bg">Background</button>' +
        '</div>' +
        '<div id="ps-col-opt-swatches" class="ps-col-opt-swatches"></div>' +
        '<div class="field" style="display:flex;align-items:center;gap:10px;margin-top:10px">' +
          '<label style="margin:0">Custom color</label>' +
          '<input type="color" id="ps-col-opt-wheel" value="#e59a18" />' +
        '</div>' +
        '<div class="ps-modal-actions" style="margin-top:16px">' +
          '<button type="button" class="btn" style="color:#fca5a5" id="ps-col-opt-delete">Delete section</button>' +
          '<button type="button" class="btn" id="ps-col-opt-close">Close</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closeColOptions();
    });
    $('ps-col-opt-close').onclick = closeColOptions;
    $('ps-col-opt-save-name').onclick = function () {
      var list = findNamedListById(state.colOpts.listId);
      var col = list && (list.columns || []).find(function (c) {
        return String(c.id) === String(state.colOpts.colId);
      });
      if (!list || !col) return;
      var nm = ($('ps-col-opt-name') && $('ps-col-opt-name').value) || '';
      nm = String(nm).trim();
      if (!nm) { toast('Enter a name'); return; }
      col.name = nm.charAt(0).toUpperCase() + nm.slice(1);
      saveNamedList(list);
      closeColOptions();
      renderFloatMain();
      toast('Section renamed');
    };
    $('ps-col-opt-delete').onclick = function () {
      var list = findNamedListById(state.colOpts.listId);
      var cid = state.colOpts.colId;
      if (!list || !cid) return;
      if (cid === 'todo' || cid === 'buy' || cid === 'bring' || cid === 'personal') {
        toast('Can’t delete classic sections');
        return;
      }
      if (!window.confirm('Delete this section and its items?')) return;
      list.columns = (list.columns || []).filter(function (c) { return String(c.id) !== String(cid); });
      saveNamedList(list);
      closeColOptions();
      renderFloatMain();
      toast('Section deleted');
    };
    ov.querySelectorAll('[data-ps-color-slot]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.colOpts.slot = b.getAttribute('data-ps-color-slot') || 'tab';
        ov.querySelectorAll('[data-ps-color-slot]').forEach(function (x) {
          x.classList.toggle('is-active', x === b);
        });
      });
    });
    function paintSwatches(selected) {
      var row = $('ps-col-opt-swatches');
      if (!row) return;
      row.innerHTML = COL_COLOR_PRESETS.map(function (c) {
        return '<button type="button" class="ps-swatch' + (c === selected ? ' selected' : '') +
          '" data-ps-swatch="' + c + '" style="background:' + c +
          (c === '#ffffff' ? ';box-shadow:inset 0 0 0 1px #666' : '') + '"></button>';
      }).join('');
    }
    function applyColor(hex) {
      var list = findNamedListById(state.colOpts.listId);
      var col = list && (list.columns || []).find(function (c) {
        return String(c.id) === String(state.colOpts.colId);
      });
      if (!list || !col) return;
      if (!col.colors) col.colors = Object.assign({}, DEFAULT_COL_COLORS);
      var slot = state.colOpts.slot || 'tab';
      col.colors[slot] = hex;
      saveNamedList(list);
      paintSwatches(hex);
      if ($('ps-col-opt-wheel')) $('ps-col-opt-wheel').value = hex;
      renderFloatMain();
    }
    ov.addEventListener('click', function (e) {
      var s = e.target.closest && e.target.closest('[data-ps-swatch]');
      if (s) applyColor(s.getAttribute('data-ps-swatch'));
    });
    var wheel = $('ps-col-opt-wheel');
    if (wheel) {
      wheel.addEventListener('input', function () { applyColor(wheel.value); });
    }
    ov._paintSwatches = paintSwatches;
  }
  function openColOptions(listId, colId) {
    ensureColOptsDom();
    var list = findNamedListById(listId);
    var col = list && (list.columns || []).find(function (c) { return String(c.id) === String(colId); });
    if (!list || !col) return;
    state.colOpts = { listId: list.id, colId: col.id, slot: 'tab' };
    if ($('ps-col-opt-title')) {
      $('ps-col-opt-title').textContent = 'Section options · ' + (col.name || listKindLabel(col.id));
    }
    if ($('ps-col-opt-name')) $('ps-col-opt-name').value = col.name || listKindLabel(col.id);
    var hex = (col.colors && col.colors.tab) || DEFAULT_COL_COLORS.tab;
    var ov = $('ps-col-options-modal');
    if (ov && ov._paintSwatches) ov._paintSwatches(hex);
    if ($('ps-col-opt-wheel')) $('ps-col-opt-wheel').value = hex;
    ov.classList.add('is-open');
    ov.setAttribute('aria-hidden', 'false');
  }
  function closeColOptions() {
    var ov = $('ps-col-options-modal');
    if (ov) {
      ov.classList.remove('is-open');
      ov.setAttribute('aria-hidden', 'true');
    }
  }
  function shareSection(listId, colId) {
    var list = findNamedListById(listId);
    var col = list && (list.columns || []).find(function (c) { return String(c.id) === String(colId); });
    if (!list || !col) return;
    var lines = [(list.name || 'List') + ' · ' + (col.name || listKindLabel(col.id)), ''];
    (col.items || []).forEach(function (it) {
      if (!it) return;
      var c = claimsFilled(it);
      var mark = c.total >= c.need ? '[x]' : '[ ]';
      lines.push(mark + ' ' + (it.title || 'Item') + (it.qty > 1 ? ' ×' + it.qty : ''));
    });
    var text = lines.join('\n');
    if (navigator.share) {
      navigator.share({ title: list.name || 'List', text: text }).catch(function () {
        copyText(text);
      });
    } else {
      copyText(text);
    }
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Section copied'); });
    } else {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        toast('Section copied');
      } catch (e) { toast('Could not copy'); }
    }
  }

  /* ——— Float window ——— */
  function ensureFloatDom() {
    if ($('ps-list-float')) return;
    var backdrop = document.createElement('div');
    backdrop.id = 'ps-list-float-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
    var el = document.createElement('div');
    el.id = 'ps-list-float';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="ps-float-head" id="ps-list-float-head">' +
        '<div style="min-width:0;flex:1">' +
          '<div class="ps-float-title" id="ps-list-float-title">Lists</div>' +
          '<div class="ps-float-sub" id="ps-list-float-sub">Same list as PlanSlayer · Got it! · sections · Sync</div>' +
        '</div>' +
        '<button type="button" class="ps-float-settings" id="ps-list-float-settings" title="List settings">Settings</button>' +
        '<button type="button" class="ps-float-sync" id="ps-list-float-sync" title="Sync lists &amp; events from PlanSlayer">Sync</button>' +
        '<button type="button" class="ps-float-close" id="ps-list-float-close" title="Minimize back to List">×</button>' +
      '</div>' +
      '<div class="ps-float-body">' +
        '<nav class="ps-float-nav" id="ps-list-float-nav"></nav>' +
        '<div class="ps-float-main" id="ps-list-float-main"></div>' +
      '</div>';
    document.body.appendChild(el);
    backdrop.addEventListener('click', closeListFloat);
    $('ps-list-float-close').addEventListener('click', closeListFloat);
    $('ps-list-float-sync').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      runFullSync();
    });
    $('ps-list-float-settings').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openListSettings();
    });
    // Drag float by head
    var drag = null;
    $('ps-list-float-head').addEventListener('pointerdown', function (e) {
      if (e.target && e.target.closest && e.target.closest('button')) return;
      var box = $('ps-list-float');
      var r = box.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
      box.style.transform = 'none';
      box.style.left = r.left + 'px';
      box.style.top = r.top + 'px';
      try { e.target.setPointerCapture(e.pointerId); } catch (eC) {}
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var box = $('ps-list-float');
      if (!box) return;
      box.style.left = Math.max(8, drag.left + (e.clientX - drag.x)) + 'px';
      box.style.top = Math.max(8, drag.top + (e.clientY - drag.y)) + 'px';
    });
    window.addEventListener('pointerup', function () { drag = null; });
    // Nav + triad events
    el.addEventListener('click', onFloatClick);
    el.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var inp = e.target && e.target.closest && e.target.closest('[data-col-add-input]');
      if (!inp) return;
      e.preventDefault();
      submitAdd(inp.getAttribute('data-col-add-input'), inp);
    });
  }

  function renderFloatNav(preferListId) {
    var nav = $('ps-list-float-nav');
    if (!nav) return;
    var personal = personalListsOnly();
    var eventLists = eventLinkedLists();
    var html = '';
    html += '<div class="ps-nav-label">Personal lists</div>';
    if (!personal.length) html += '<p class="empty" style="padding:6px">None yet — create in PlanSlayer or open an event List.</p>';
    else {
      personal.forEach(function (n) {
        var on = String(n.id) === String(state.activeListId);
        html += '<button type="button" class="ps-nav-item' + (on ? ' is-active' : '') +
          '" data-open-list="' + esc(n.id) + '">' + esc(n.name || 'List') + '</button>';
      });
    }
    html += '<div class="ps-nav-label">Event lists</div>';
    if (!eventLists.length) html += '<p class="empty" style="padding:6px">None yet</p>';
    else {
      eventLists.forEach(function (n) {
        var on = String(n.id) === String(state.activeListId);
        html += '<button type="button" class="ps-nav-item' + (on ? ' is-active' : '') +
          '" data-open-list="' + esc(n.id) + '">' + esc(n.name || 'List') + '</button>';
      });
    }
    nav.innerHTML = html;
  }

  function renderMembersBar(list) {
    ensureListHasMe(list);
    var mems = list.members || [];
    if (!mems.length) return '';
    var html = '<div class="ps-list-members-bar" aria-label="List members">';
    mems.forEach(function (m) {
      if (!m) return;
      var id = String(m.user_id || m.id || '');
      var name = m.display_name || m.username || 'Member';
      var col = colorForUid(list, id);
      var isMe = String(id) === String(myId());
      html +=
        '<button type="button" class="ps-member-chip" data-member-color="' + esc(id) +
          '" data-member-name="' + esc(name) + '" title="Change color for ' + esc(name) + '">' +
          '<span class="ps-member-dot" style="background:' + esc(col) + '"></span>' +
          esc(isMe ? (name + ' (you)') : name) +
        '</button>';
    });
    html += '</div>';
    return html;
  }

  function renderFloatMain() {
    var main = $('ps-list-float-main');
    if (!main) return;
    var list = findNamedListById(state.activeListId);
    if (!list) {
      main.innerHTML = '<div class="ps-float-empty">Select a list on the left — or open <strong>List</strong> from an event to create its packing pack.</div>';
      return;
    }
    ensureColumns(list);
    ensureListHasMe(list);
    var title = $('ps-list-float-title');
    if (title) title.textContent = list.name || 'List';
    var cd = '';
    // If list is event-linked, show countdown from Hunt calendar event if present
    if (list.eventId && global.RegSlayerCalendarEvents) {
      try {
        var ev = global.RegSlayerCalendarEvents.getById(list.eventId);
        if (ev) cd = countdownHtml(huntEventStartIso(ev), huntEventEndIso(ev));
      } catch (e) {}
    }
    main.innerHTML =
      '<div class="ps-float-main-title">' + esc(list.name || 'List') + '</div>' +
      (cd ? ('<div class="ps-float-main-cd">' + cd + '</div>') : '') +
      renderMembersBar(list) +
      '<div class="ps-float-triad-wrap">' + renderTriad(list) + '</div>';
  }

  /* ——— List settings (Plan-style) + member color popup ——— */
  function ensureListSettingsDom() {
    if ($('ps-list-settings-modal')) return;
    var ov = document.createElement('div');
    ov.id = 'ps-list-settings-modal';
    ov.className = 'ps-modal-overlay';
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML =
      '<div class="ps-modal" role="dialog" style="max-width:400px">' +
        '<h3>List settings</h3>' +
        '<div class="field"><label for="ps-list-set-name">List name</label>' +
          '<input id="ps-list-set-name" type="text" style="text-transform:capitalize" /></div>' +
        '<label class="ps-check-row"><input type="checkbox" id="ps-list-set-expense" /> Show expenses on this list</label>' +
        '<div class="section-label" style="margin:12px 0 6px;font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase">Members · tap to change claim color</div>' +
        '<div id="ps-list-set-members" class="ps-list-set-members"></div>' +
        '<p class="muted" style="font-size:11px;margin:8px 0 0">Claim colors show on Got it! bars. Your color also saves as My Color for PlanSlayer.</p>' +
        '<div class="ps-modal-actions" style="margin-top:16px;flex-wrap:wrap">' +
          '<button type="button" class="btn" style="color:#fca5a5" id="ps-list-set-delete">Delete list</button>' +
          '<button type="button" class="btn btn-accent" id="ps-list-set-share">Share</button>' +
          '<button type="button" class="btn" id="ps-list-set-cancel">Cancel</button>' +
          '<button type="button" class="btn btn-primary" id="ps-list-set-save">Save</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closeListSettings();
    });
    $('ps-list-set-cancel').onclick = closeListSettings;
    $('ps-list-set-save').onclick = function () {
      var list = getActiveList();
      if (!list) return;
      var nm = ($('ps-list-set-name') && $('ps-list-set-name').value) || '';
      nm = String(nm).trim();
      if (nm) list.name = nm.charAt(0).toUpperCase() + nm.slice(1);
      list.showExpense = !!($('ps-list-set-expense') && $('ps-list-set-expense').checked);
      saveNamedList(list);
      closeListSettings();
      renderFloatNav();
      renderFloatMain();
      toast('List settings saved');
    };
    $('ps-list-set-delete').onclick = function () {
      var list = getActiveList();
      if (!list) return;
      if (!window.confirm('Delete “' + (list.name || 'list') + '” permanently?')) return;
      var store = loadFreeListsStore();
      store.named = (store.named || []).filter(function (n) {
        return n && String(n.id) !== String(list.id);
      });
      saveFreeListsStore(store);
      state.activeListId = (store.named[0] && store.named[0].id) || null;
      closeListSettings();
      renderFloatNav();
      renderFloatMain();
      toast('List deleted');
    };
    $('ps-list-set-share').onclick = function () {
      var list = getActiveList();
      if (!list) return;
      var code = list.invite_code;
      if (!code) {
        code = String(Math.floor(100000 + Math.random() * 900000));
        list.invite_code = code;
        saveNamedList(list);
      }
      var text = 'Join my Plan list “' + (list.name || 'List') + '” · code ' + code;
      copyText(text);
      toast('Invite code copied: ' + code);
    };
    ov.addEventListener('click', function (e) {
      var chip = e.target.closest && e.target.closest('[data-member-color]');
      if (!chip) return;
      openMemberColorPopup(
        chip.getAttribute('data-member-color'),
        chip.getAttribute('data-member-name') || 'Member'
      );
    });
  }
  function openListSettings() {
    var list = getActiveList();
    if (!list) {
      toast('Open a list first');
      return;
    }
    ensureListSettingsDom();
    ensureListHasMe(list);
    if ($('ps-list-set-name')) $('ps-list-set-name').value = list.name || '';
    if ($('ps-list-set-expense')) $('ps-list-set-expense').checked = list.showExpense === true;
    var box = $('ps-list-set-members');
    if (box) {
      box.innerHTML = (list.members || []).map(function (m) {
        if (!m) return '';
        var id = String(m.user_id || m.id || '');
        var name = m.display_name || m.username || 'Member';
        var col = colorForUid(list, id);
        var isMe = String(id) === String(myId());
        return '<button type="button" class="ps-member-chip ps-member-chip-lg" data-member-color="' +
          esc(id) + '" data-member-name="' + esc(name) + '">' +
          '<span class="ps-member-dot" style="background:' + esc(col) + '"></span>' +
          esc(isMe ? name + ' (you)' : name) +
          (m.role === 'owner' ? ' · owner' : '') +
          '</button>';
      }).join('') || '<p class="muted" style="font-size:12px">Just you</p>';
    }
    var ov = $('ps-list-settings-modal');
    ov.classList.add('is-open');
    ov.setAttribute('aria-hidden', 'false');
  }
  function closeListSettings() {
    var ov = $('ps-list-settings-modal');
    if (ov) {
      ov.classList.remove('is-open');
      ov.setAttribute('aria-hidden', 'true');
    }
  }

  function ensureMemberColorDom() {
    if ($('ps-member-color-modal')) return;
    var ov = document.createElement('div');
    ov.id = 'ps-member-color-modal';
    ov.className = 'ps-modal-overlay';
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML =
      '<div class="ps-modal" role="dialog" style="max-width:340px">' +
        '<h3 id="ps-member-color-title">Member color</h3>' +
        '<p class="muted" style="font-size:12px;margin:0 0 10px">Claim color on this list’s Got it! bars</p>' +
        '<div id="ps-member-color-swatches" class="ps-col-opt-swatches" style="margin-bottom:10px"></div>' +
        '<div class="field" style="display:flex;align-items:center;gap:10px">' +
          '<button type="button" class="btn" id="ps-member-color-wheel-btn">Color wheel</button>' +
          '<input type="color" id="ps-member-color-wheel" value="#e59a18" style="width:48px;height:36px" />' +
        '</div>' +
        '<div class="ps-modal-actions" style="margin-top:14px">' +
          '<button type="button" class="btn" id="ps-member-color-cancel">Cancel</button>' +
          '<button type="button" class="btn btn-primary" id="ps-member-color-save">Save color</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    ov._pending = { uid: null, name: '', hex: '#e59a18' };
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closeMemberColorPopup();
      var s = e.target.closest && e.target.closest('[data-ps-mem-swatch]');
      if (s) {
        ov._pending.hex = s.getAttribute('data-ps-mem-swatch');
        paintMemSwatches(ov._pending.hex);
        if ($('ps-member-color-wheel')) $('ps-member-color-wheel').value = ov._pending.hex;
      }
    });
    $('ps-member-color-cancel').onclick = closeMemberColorPopup;
    $('ps-member-color-save').onclick = function () {
      var list = getActiveList();
      if (!list || !ov._pending.uid) return;
      setMemberColorOnList(list, ov._pending.uid, ov._pending.hex);
      closeMemberColorPopup();
      // Refresh settings members + main bar
      if ($('ps-list-settings-modal') && $('ps-list-settings-modal').classList.contains('is-open')) {
        openListSettings();
      }
      renderFloatMain();
      toast('Color updated for ' + (ov._pending.name || 'member'));
    };
    var wheelBtn = $('ps-member-color-wheel-btn');
    var wheel = $('ps-member-color-wheel');
    if (wheelBtn && wheel) {
      wheelBtn.onclick = function () { try { wheel.click(); } catch (e) {} };
      wheel.addEventListener('input', function () {
        ov._pending.hex = wheel.value;
        paintMemSwatches(ov._pending.hex);
      });
    }
    function paintMemSwatches(selected) {
      var row = $('ps-member-color-swatches');
      if (!row) return;
      row.innerHTML = COL_COLOR_PRESETS.map(function (c) {
        return '<button type="button" class="ps-swatch' + (c === selected ? ' selected' : '') +
          '" data-ps-mem-swatch="' + c + '" style="background:' + c +
          (c === '#ffffff' ? ';box-shadow:inset 0 0 0 1px #666' : '') + '"></button>';
      }).join('');
    }
    ov._paintMemSwatches = paintMemSwatches;
  }
  function openMemberColorPopup(uid, name) {
    var list = getActiveList();
    if (!list || !uid) return;
    ensureMemberColorDom();
    var ov = $('ps-member-color-modal');
    var hex = colorForUid(list, uid);
    ov._pending = { uid: String(uid), name: name || 'Member', hex: hex };
    if ($('ps-member-color-title')) {
      $('ps-member-color-title').textContent =
        (String(uid) === String(myId()) ? 'My color' : 'Color for ' + (name || 'Member'));
    }
    if (ov._paintMemSwatches) ov._paintMemSwatches(hex);
    if ($('ps-member-color-wheel')) $('ps-member-color-wheel').value = hex;
    ov.classList.add('is-open');
    ov.setAttribute('aria-hidden', 'false');
  }
  function closeMemberColorPopup() {
    var ov = $('ps-member-color-modal');
    if (ov) {
      ov.classList.remove('is-open');
      ov.setAttribute('aria-hidden', 'true');
    }
  }

  function openListFloat(opts) {
    opts = opts || {};
    ensureFloatDom();
    state.floatOpen = true;
    if (opts.event) {
      state.focusEventId = opts.event.id;
      var list = findListForHuntEvent(opts.event);
      if (list) state.activeListId = list.id;
    }
    if (opts.listId) state.activeListId = opts.listId;
    if (!state.activeListId) {
      var all = allNamedLists();
      if (all[0]) state.activeListId = all[0].id;
    }
    renderFloatNav();
    renderFloatMain();
    var box = $('ps-list-float');
    var bd = $('ps-list-float-backdrop');
    if (box) {
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
    }
    if (bd) {
      bd.classList.add('is-open');
      bd.setAttribute('aria-hidden', 'false');
    }
  }

  function closeListFloat() {
    state.floatOpen = false;
    state.expandedItemId = null;
    var box = $('ps-list-float');
    var bd = $('ps-list-float-backdrop');
    if (box) {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
    }
    if (bd) {
      bd.classList.remove('is-open');
      bd.setAttribute('aria-hidden', 'true');
    }
    // Minimize back into List button — event card stays expanded if it was
    toast('List minimized — tap List under T minus to reopen');
  }

  function getActiveList() {
    return findNamedListById(state.activeListId);
  }
  function findItemInList(list, itemId) {
    if (!list) return null;
    ensureColumns(list);
    for (var i = 0; i < (list.columns || []).length; i++) {
      var c = list.columns[i];
      var idx = (c.items || []).findIndex(function (x) { return String(x.id) === String(itemId); });
      if (idx >= 0) return { col: c, item: c.items[idx], index: idx, colId: c.id };
    }
    return null;
  }

  function submitAdd(colId, inp) {
    var list = getActiveList();
    if (!list || !colId) return;
    ensureColumns(list);
    var title = inp ? String(inp.value || '').trim() : '';
    if (!title) { toast('Type an item name first'); return; }
    var col = list.columns.find(function (c) { return String(c.id) === String(colId); });
    if (!col) return;
    col.items.push({
      id: uid(),
      title: title.charAt(0).toUpperCase() + title.slice(1),
      qty: 1,
      claims: {},
      priority: 0,
      qualifier: 'other',
      notes: '',
      created_at: new Date().toISOString()
    });
    saveNamedList(list);
    if (inp) inp.value = '';
    renderFloatMain();
  }

  function onFloatClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var nav = t.closest('[data-open-list]');
    if (nav) {
      state.activeListId = nav.getAttribute('data-open-list');
      state.expandedItemId = null;
      renderFloatNav();
      renderFloatMain();
      return;
    }

    // #122 mobile section tabs (Plan single-column layout)
    var colTab = t.closest('[data-ps-col-tab]');
    if (colTab) {
      e.preventDefault();
      state.activeColId = colTab.getAttribute('data-ps-col-tab');
      state.expandedItemId = null;
      renderFloatMain();
      return;
    }

    // Camera / photo → items (Plan parity; OCR best on PlanSlayer)
    var ocrBtn = t.closest('[data-ocr-list]');
    if (ocrBtn) {
      e.preventDefault();
      e.stopPropagation();
      var ocrCol = ocrBtn.getAttribute('data-ocr-list');
      try {
        if (typeof global.planListOcrFromPhoto === 'function') {
          global.planListOcrFromPhoto(state.activeListId, ocrCol);
          return;
        }
      } catch (eO) {}
      // Lightweight file pick: each line of a .txt becomes an item; images → toast to Plan OCR
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*,text/plain';
      inp.style.display = 'none';
      document.body.appendChild(inp);
      inp.onchange = function () {
        var file = inp.files && inp.files[0];
        inp.remove();
        if (!file) return;
        if (file.type && file.type.indexOf('image') === 0) {
          toast('Photo OCR: open this list on PlanSlayer and use the camera for handwriting. Text files work here.');
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          var text = String(reader.result || '');
          var lines = text.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
          if (!lines.length) { toast('No lines found'); return; }
          var list = getActiveList();
          if (!list) return;
          ensureColumns(list);
          var col = (list.columns || []).find(function (c) { return String(c.id) === String(ocrCol); });
          if (!col) return;
          if (!col.items) col.items = [];
          lines.forEach(function (line) {
            col.items.push({
              id: uid(),
              title: line.charAt(0).toUpperCase() + line.slice(1),
              qty: 1,
              claims: {},
              created_at: new Date().toISOString()
            });
          });
          saveNamedList(list);
          renderFloatMain();
          toast('Added ' + lines.length + ' item' + (lines.length === 1 ? '' : 's') + ' from file');
        };
        reader.readAsText(file);
      };
      inp.click();
      return;
    }

    // Member color chip (bar or settings)
    var memChip = t.closest('[data-member-color]');
    if (memChip && !t.closest('#ps-list-settings-modal')) {
      e.preventDefault();
      e.stopPropagation();
      openMemberColorPopup(
        memChip.getAttribute('data-member-color'),
        memChip.getAttribute('data-member-name') || 'Member'
      );
      return;
    }

    // Section options / share / minimize (Plan parity)
    var opt = t.closest('[data-col-options]');
    if (opt) {
      e.preventDefault();
      e.stopPropagation();
      openColOptions(state.activeListId, opt.getAttribute('data-col-options'));
      return;
    }
    var shr = t.closest('[data-col-share]');
    if (shr) {
      e.preventDefault();
      e.stopPropagation();
      shareSection(state.activeListId, shr.getAttribute('data-col-share'));
      return;
    }
    var mini = t.closest('[data-col-minimize]');
    if (mini) {
      e.preventDefault();
      e.stopPropagation();
      var listM = getActiveList();
      var colM = listM && (listM.columns || []).find(function (c) {
        return String(c.id) === String(mini.getAttribute('data-col-minimize'));
      });
      if (listM && colM) {
        colM.minimized = true;
        saveNamedList(listM);
        renderFloatMain();
      }
      return;
    }
    var restore = t.closest('[data-col-restore]');
    if (restore) {
      e.preventDefault();
      e.stopPropagation();
      var listR = getActiveList();
      var colR = listR && (listR.columns || []).find(function (c) {
        return String(c.id) === String(restore.getAttribute('data-col-restore'));
      });
      if (listR && colR) {
        colR.minimized = false;
        saveNamedList(listR);
        renderFloatMain();
      }
      return;
    }

    var addBtn = t.closest('[data-col-add]');
    if (addBtn) {
      var colId = addBtn.getAttribute('data-col-add');
      var wrap = addBtn.closest('.list-col-add');
      var inp = wrap && wrap.querySelector('input');
      submitAdd(colId, inp);
      return;
    }

    var row = t.closest('.list-item');
    if (!row) return;
    if (t.closest('.li-detail input, .li-detail select, .li-detail textarea, .li-detail label')) return;

    var actBtn = t.closest('[data-act]');
    var action = actBtn ? actBtn.getAttribute('data-act') : 'expand';
    var itemId = row.getAttribute('data-item-id');
    var list = getActiveList();
    var hit = findItemInList(list, itemId);
    if (!hit) return;
    var item = hit.item;

    if (action === 'expand' || action === 'face') {
      state.expandedItemId = state.expandedItemId === itemId ? null : itemId;
      renderFloatMain();
      return;
    }
    if (action === 'got') {
      if (!item.claims) item.claims = {};
      if (isItemAccounted(item) && myClaimQty(item) > 0) {
        clearMyClaims(item);
        toast('Dropped — back on the list');
      } else if (myClaimQty(item) > 0) {
        clearMyClaims(item);
      } else {
        item.claims[myId()] = Math.max(1, Number(item.qty) || 1) >= 1 ? 1 : 1;
        // For qty 1 claim 1; multi still claims 1 for now (qty modal later)
        if (Math.max(1, Number(item.qty) || 1) === 1) item.claims[myId()] = 1;
        else item.claims[myId()] = 1;
      }
      saveNamedList(list);
      renderFloatMain();
      return;
    }
    if (action === 'drop') {
      clearMyClaims(item);
      saveNamedList(list);
      toast('Dropped — back on the list');
      renderFloatMain();
      return;
    }
    if (action === 'del') {
      if (!confirm('Delete “' + (item.title || 'item') + '”?')) return;
      hit.col.items.splice(hit.index, 1);
      if (state.expandedItemId === itemId) state.expandedItemId = null;
      saveNamedList(list);
      renderFloatMain();
      return;
    }
    if (action === 'save-detail') {
      var titleEl = row.querySelector('[data-f="title"]');
      var qtyEl = row.querySelector('[data-f="qty"]');
      var priEl = row.querySelector('[data-f="priority"]');
      var notesEl = row.querySelector('[data-f="notes"]');
      var hlEl = row.querySelector('[data-f="highlight"]');
      if (titleEl) item.title = String(titleEl.value || '').trim() || item.title;
      if (qtyEl) item.qty = Math.max(1, parseInt(qtyEl.value, 10) || 1);
      if (priEl) item.priority = parseInt(priEl.value, 10) || 0;
      if (notesEl) item.notes = notesEl.value || '';
      if (hlEl) item.highlight = !!hlEl.checked;
      state.expandedItemId = null;
      saveNamedList(list);
      renderFloatMain();
      toast('Saved');
      return;
    }
  }

  /* ——— Day events list (replaces Hunt dropdown cards) ——— */
  function renderDayEventsHtml(dayEvents, hiddenDay) {
    var htmlOut = '';
    if (dayEvents && dayEvents.length) {
      htmlOut = dayEvents.map(function (ev) {
        var id = String(ev.id);
        var active = String(state.activeEventId) === id;
        var name = huntEventName(ev);
        var startIso = huntEventStartIso(ev);
        var endIso = huntEventEndIso(ev);
        var cd = countdownHtml(startIso, endIso);
        var range = (ev.startDate === ev.endDate || !ev.endDate)
          ? (ev.startDate || '')
          : ((ev.startDate || '') + ' → ' + (ev.endDate || ''));
        var scopeLabel = ev.mapScope === 'shared' ? 'Shared map'
          : (ev.mapScope === 'all' ? 'All my maps' : 'Personal');
        var isCreator = true;
        try {
          if (global.RegSlayerCalendarEvents && global.RegSlayerCalendarEvents.isCreator) {
            isCreator = global.RegSlayerCalendarEvents.isCreator(ev);
          }
        } catch (eC) {}
        var color = ev.color || '#e59a18';
        var metaBits = [];
        if (range) metaBits.push(range);
        if (scopeLabel) metaBits.push(scopeLabel);
        return (
          '<div class="ps-event-card-wrap">' +
            '<div class="ps-event-card' + (active ? ' is-active' : '') + '" data-ps-open-event="' + esc(id) +
              '" style="border-left-color:' + esc(color) + '" role="button" tabindex="0">' +
              '<div class="ec-top">' +
                '<strong class="ec-name">' + esc(name) + '</strong>' +
                (cd ? ('<span class="ec-countdown">' + cd + '</span>') : '') +
                '<span class="ec-actions">' +
                  (isCreator
                    ? ('<button type="button" class="ec-edit-btn" data-ps-edit-event="' + esc(id) +
                      '">Edit event</button>')
                    : '') +
                  '<button type="button" class="ec-list-btn" data-ps-open-list="' + esc(id) +
                    '" title="Open packing list">\u2713 List</button>' +
                '</span>' +
              '</div>' +
              (metaBits.length ? ('<div class="ec-meta">' + esc(metaBits.join(' · ')) + '</div>') : '') +
              '<div class="ps-event-detail" data-ps-detail="' + esc(id) + '">' +
                (ev.lat != null
                  ? '<div class="ps-loc-hint">📍 Location set — opens on map when you select this event</div>'
                  : '<div class="ps-loc-hint muted">No pin yet — Edit event → Add location</div>') +
                '<div class="ps-action-row">' +
                  '<button type="button" data-ps-hide="' + esc(id) + '">Hide</button>' +
                  (isCreator
                    ? ('<button type="button" class="ps-danger" data-ps-del="' + esc(id) + '">Delete</button>')
                    : '') +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');
    }
    if (hiddenDay && hiddenDay.length) {
      htmlOut += '<div class="ps-hidden-label">Hidden</div>';
      htmlOut += hiddenDay.map(function (ev) {
        return '<button type="button" class="ps-hidden-chip" data-ps-unhide="' +
          esc(ev.id) + '" title="Tap to unhide">' + esc(huntEventName(ev)) + '</button>';
      }).join('');
    }
    return htmlOut;
  }

  function wireDayListClicks(root) {
    if (!root || root._psWired) return;
    root._psWired = true;
    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      var edit = t.closest('[data-ps-edit-event]');
      if (edit) {
        e.preventDefault();
        e.stopPropagation();
        var eid = edit.getAttribute('data-ps-edit-event');
        if (typeof global.startEditEventById === 'function') global.startEditEventById(eid);
        return;
      }
      var openList = t.closest('[data-ps-open-list]');
      if (openList) {
        e.preventDefault();
        e.stopPropagation();
        var idL = openList.getAttribute('data-ps-open-list');
        var evL = global.RegSlayerCalendarEvents && global.RegSlayerCalendarEvents.getById(idL);
        openListFloat({ event: evL || { id: idL, text: 'Event' } });
        return;
      }
      var hide = t.closest('[data-ps-hide]');
      if (hide) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof global.hideEventFromMyCalendar === 'function') {
          global.hideEventFromMyCalendar(hide.getAttribute('data-ps-hide'));
        }
        return;
      }
      var del = t.closest('[data-ps-del]');
      if (del) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof global.deleteEventForEveryone === 'function') {
          global.deleteEventForEveryone(del.getAttribute('data-ps-del'));
        }
        return;
      }
      var unh = t.closest('[data-ps-unhide]');
      if (unh) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof global.unhideEventOnMyCalendar === 'function') {
          global.unhideEventOnMyCalendar(unh.getAttribute('data-ps-unhide'));
        }
        return;
      }
      var card = t.closest('[data-ps-open-event]');
      if (card) {
        var id = card.getAttribute('data-ps-open-event');
        var wasActive = String(state.activeEventId) === String(id);
        state.activeEventId = wasActive ? null : id;
        // Selecting an event with a focus pin → jump map there (no Quick Load menu)
        if (!wasActive && global.RegSlayerCalendarEvents) {
          try {
            var evOpen = global.RegSlayerCalendarEvents.getById(id);
            if (evOpen && evOpen.lat != null && evOpen.lng != null &&
                typeof global.goToEventLocation === 'function') {
              global.goToEventLocation(id);
            }
          } catch (eGo) {}
        }
        if (typeof global.updateEventsList === 'function') {
          try { global.updateEventsList(); return; } catch (eU) {}
        }
        root.querySelectorAll('.ps-event-card').forEach(function (el) {
          el.classList.toggle('is-active', el.getAttribute('data-ps-open-event') === state.activeEventId);
        });
      }
    });
  }

  /**
   * Replace Hunt's calendar-events-list contents with Plan-style cards.
   * Call from updateEventsList after computing dayEvents / hiddenDay.
   */
  function paintDayEventsList(dayEvents, hiddenDay) {
    var list = $('calendar-events-list');
    if (!list) return false;
    var box = $('calendar-events-section');
    // #97: ensure host section is visible when we paint cards
    if (box && ((dayEvents && dayEvents.length) || (hiddenDay && hiddenDay.length))) {
      try {
        box.style.display = 'block';
        box.classList.remove('events-box--empty');
      } catch (eB) {}
    }
    // Allow re-wire after full list HTML replace
    list._psWired = false;
    list.innerHTML = renderDayEventsHtml(dayEvents || [], hiddenDay || []) ||
      '<p class="empty" style="color:var(--muted);font-size:12px">No trips on this day.</p>';
    wireDayListClicks(list);
    return true;
  }

  // Live countdown tick for cards + float
  setInterval(function () {
    try {
      document.querySelectorAll('#calendar-events-list .ps-event-card.is-active, #ps-list-float.is-open').forEach(function () {});
      // Light refresh of visible countdowns via re-paint only when float closed & active event
      if (!state.floatOpen && state.activeEventId && typeof global.updateEventsList === 'function') {
        // skip full re-render every 15s — host countdown optional
      }
    } catch (e) {}
  }, 30000);

  // Auto-import Plan events/chores into Hunt calendar on load (same browser profile)
  // Delayed passes: host may assign window.renderCalendar after first paint (#78)
  // Also force calendar cloud pull so cross-origin Plan events appear when signed in
  function bootSyncCalendar() {
    try { syncPlanIntoHuntCalendar(); } catch (e1) {}
    try {
      if (global.RegSlayerCalendarEvents && typeof global.RegSlayerCalendarEvents.pullCloud === 'function') {
        global.RegSlayerCalendarEvents.pullCloud();
      }
    } catch (e2) {}
  }
  try {
    setTimeout(bootSyncCalendar, 800);
    setTimeout(bootSyncCalendar, 2200);
    setTimeout(bootSyncCalendar, 5000);
  } catch (eBoot) {}

  global.PlanEventsListsKit = {
    version: '1.1.0-testofflinehunt',
    paintDayEventsList: paintDayEventsList,
    openListFloat: openListFloat,
    closeListFloat: closeListFloat,
    findListForHuntEvent: findListForHuntEvent,
    countdownHtml: countdownHtml,
    sync: runFullSync,
    syncPlanIntoHuntCalendar: syncPlanIntoHuntCalendar,
    getState: function () { return state; }
  };

  // Ensure float DOM on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureFloatDom);
  } else {
    try { ensureFloatDom(); } catch (e) {}
  }
})(typeof window !== 'undefined' ? window : this);
