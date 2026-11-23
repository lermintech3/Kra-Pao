// Kra-Pap API — Cloudflare Worker ที่เชื่อมแอปกับฐานข้อมูล D1
// ต้องตั้งค่าใน Worker:  D1 binding ชื่อ DB  และ  Secret ชื่อ HOUSE_KEY (รหัสบ้าน)
// (ไม่บังคับ) Variable ชื่อ ALLOW_ORIGIN เช่น https://lermintech3.github.io

const COLS = ['tx', 'goals', 'bills', 'debts', 'meta'];
const ID_RE = /^[A-Za-z0-9_\-.:@+~]{1,200}$/;

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(req.url);
    if (url.pathname === '/' ) return json({ ok: true, app: 'kra-pap-api' });

    if (!env.DB) return json({ error: 'missing D1 binding "DB"' }, 500);
    if (!env.HOUSE_KEY) return json({ error: 'missing secret "HOUSE_KEY"' }, 500);
    const auth = req.headers.get('Authorization') || '';
    if (!safeEqual(auth, 'Bearer ' + env.HOUSE_KEY)) return json({ error: 'unauthorized' }, 401);

    const p = url.pathname.split('/').filter(Boolean);

    // GET /api/all?since=<ms>  → เอกสารที่เปลี่ยนหลังเวลานั้น
    if (req.method === 'GET' && p[0] === 'api' && p[1] === 'all') {
      const since = Number(url.searchParams.get('since')) || 0;
      const now = Date.now();
      const { results } = await env.DB
        .prepare('SELECT col, id, data, updated, deleted FROM docs WHERE updated > ? ORDER BY updated')
        .bind(since)
        .all();
      // ย้อนเวลา 5 วินาที เผื่อรายการที่เขียนพร้อมกัน (ข้อมูลซ้ำได้ ไม่เป็นไร)
      return json({ docs: results, now: now - 5000 });
    }

    // PUT / DELETE /api/doc/<collection>/<id>
    if (p[0] === 'api' && p[1] === 'doc' && p.length === 4) {
      const col = p[2], id = decodeURIComponent(p[3]);
      if (!COLS.includes(col) || !ID_RE.test(id)) return json({ error: 'bad path' }, 400);
      const now = Date.now();

      if (req.method === 'PUT') {
        const body = await req.text();
        if (body.length > 256000) return json({ error: 'too large' }, 413);
        try { const o = JSON.parse(body); if (!o || typeof o !== 'object' || Array.isArray(o)) throw 0; }
        catch (e) { return json({ error: 'bad json' }, 400); }
        await env.DB
          .prepare(`INSERT INTO docs (col, id, data, updated, deleted) VALUES (?, ?, ?, ?, 0)
                    ON CONFLICT (col, id) DO UPDATE SET data = excluded.data, updated = excluded.updated, deleted = 0`)
          .bind(col, id, body, now)
          .run();
        return json({ ok: true });
      }

      if (req.method === 'DELETE') {
        await env.DB
          .prepare(`INSERT INTO docs (col, id, data, updated, deleted) VALUES (?, ?, '{}', ?, 1)
                    ON CONFLICT (col, id) DO UPDATE SET data = '{}', updated = excluded.updated, deleted = 1`)
          .bind(col, id, now)
          .run();
        return json({ ok: true });
      }
    }

    return json({ error: 'not found' }, 404);
  },
};
