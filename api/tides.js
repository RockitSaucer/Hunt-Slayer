/**
 * Today's tide times for Saint Catherines Sound Entrance (Tideschart.com chart data).
 * GET /api/tides?date=YYYYMMDD
 * Server-fetches the public SVG (browser calls to tideschart.com hang / never resolve).
 */

const CHART_SLUG = 'St_-Catherines-Sound-Entrance-Chatham-County-Georgia-United-States';
const CHART_ID = '30022218';
const SOURCE = 'https://www.tideschart.com/United-States/Georgia/Chatham-County/St_-Catherines-Sound-Entrance/';

let mem = { key: '', at: 0, body: null };
const MEM_MS = 20 * 60 * 1000;

function ymdEastern(d) {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return fmt.format(d || new Date()).replace(/-/g, '');
  } catch (e) {
    const n = d || new Date();
    return String(n.getUTCFullYear()) + String(n.getUTCMonth() + 1).padStart(2, '0') + String(n.getUTCDate()).padStart(2, '0');
  }
}

function parseDateParam(raw) {
  const s = String(raw || '').replace(/[^\d]/g, '').slice(0, 8);
  return /^\d{8}$/.test(s) ? s : ymdEastern();
}

function parseTideTimesFromSvg(svgText) {
  const svg = String(svgText || '');
  const ticks = [];
  svg.replace(/<g class="tick"[^>]*transform="translate\(0,([0-9.]+)\)"[\s\S]{0,220}?<text[^>]*>([-\d.]+)<\/text>/g, function (_, y, ft) {
    ticks.push({ y: parseFloat(y), ft: parseFloat(ft) });
    return _;
  });
  ticks.sort(function (a, b) { return a.y - b.y; });
  function ftAt(y) {
    if (ticks.length < 2 || !isFinite(y)) return null;
    let a = ticks[0];
    let b = ticks[1];
    if (y <= ticks[0].y) {
      a = ticks[0];
      b = ticks[1];
    } else if (y >= ticks[ticks.length - 1].y) {
      a = ticks[ticks.length - 2];
      b = ticks[ticks.length - 1];
    } else {
      for (let i = 0; i < ticks.length - 1; i++) {
        if (y >= ticks[i].y && y <= ticks[i + 1].y) {
          a = ticks[i];
          b = ticks[i + 1];
          break;
        }
      }
    }
    const tfrac = (b.y === a.y) ? 0 : (y - a.y) / (b.y - a.y);
    return a.ft + tfrac * (b.ft - a.ft);
  }
  const events = [];
  svg.replace(/transform="translate\(([-\d.]+),([-\d.]+)\)"\s+fill="(#[0-9a-fA-F]+)"[\s\S]{0,400}?<text text-anchor="middle" y="-11">([^<]+)<\/text>/g, function (_, x, y, fill, time) {
    events.push({
      x: parseFloat(x),
      y: parseFloat(y),
      kind: String(fill).toLowerCase() === '#e74c3c' ? 'Low' : 'High',
      time: String(time).trim()
    });
    return _;
  });
  let today = events.filter(function (e) { return isFinite(e.x) && e.x < 452; });
  if (!today.length) today = events.slice(0, 4);
  return today.map(function (e) {
    const ft = ftAt(e.y);
    return {
      kind: e.kind,
      time: e.time,
      height: (ft != null && isFinite(ft)) ? Math.round(ft * 100) / 100 : null
    };
  });
}

function json(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(JSON.stringify(obj));
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    json(res, 405, { ok: false, error: 'GET only' });
    return;
  }

  let date = '';
  try {
    const u = new URL(req.url, 'http://localhost');
    date = parseDateParam(u.searchParams.get('date'));
  } catch (eQ) {
    date = parseDateParam(req.query && req.query.date);
  }

  const now = Date.now();
  if (mem.body && mem.key === date && now - mem.at < MEM_MS) {
    json(res, 200, mem.body);
    return;
  }

  const chartUrl = 'https://www.tideschart.com/tide-charts/en/' + CHART_SLUG + '-tide-chart-' + CHART_ID + '-ft.svg?date=' + date;
  let svg = '';
  try {
    const r = await fetch(chartUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; HuntSlayer/9.0; +https://huntslayer.com)',
        accept: 'image/svg+xml,*/*'
      }
    });
    if (!r.ok) throw new Error('chart ' + r.status);
    svg = await r.text();
  } catch (eFetch) {
    json(res, 502, { ok: false, error: 'Could not load tide times', source: SOURCE, date: date });
    return;
  }

  const events = parseTideTimesFromSvg(svg);
  const body = {
    ok: events.length > 0,
    date: date,
    events: events,
    source: SOURCE
  };
  mem = { key: date, at: now, body: body };
  json(res, events.length ? 200 : 502, body);
};
