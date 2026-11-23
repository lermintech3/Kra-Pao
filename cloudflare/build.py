# สร้าง cloudflare/worker-full.js = worker.js + หน้าแอป (index.html) ในไฟล์เดียว
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
api = (root / 'cloudflare' / 'worker.js').read_text(encoding='utf-8')
api = api.replace('export default {', 'const API = {', 1)
out = f"""// Kra-Pap — แอป + API ในไฟล์เดียว (สร้างอัตโนมัติจาก build.py — อย่าแก้ไฟล์นี้ตรงๆ)
// วางทั้งไฟล์ใน Cloudflare Worker → Deploy → เปิด URL ของ Worker ได้เลย
// ต้องมี: D1 binding ชื่อ DB และ Secret ชื่อ HOUSE_KEY

{api}
const APP_HTML = {json.dumps(html, ensure_ascii=False)};

export default {{
  async fetch(req, env, ctx) {{
    const url = new URL(req.url);
    const h = {{ 'Cache-Control': 'no-cache' }};
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html'))
      return new Response(APP_HTML, {{ headers: {{ ...h, 'Content-Type': 'text/html; charset=utf-8' }} }});
    if (url.pathname === '/api-config.js')
      return new Response('window.D1_SAME_ORIGIN = true;', {{ headers: {{ ...h, 'Content-Type': 'text/javascript' }} }});
    if (url.pathname === '/firebase-config.js')
      return new Response('window.FIREBASE_CONFIG = null;', {{ headers: {{ ...h, 'Content-Type': 'text/javascript' }} }});
    if (url.pathname === '/health') return API.fetch(new Request(new URL('/', req.url), req), env, ctx);
    if (url.pathname === '/favicon.ico') return new Response(null, {{ status: 204 }});
    return API.fetch(req, env, ctx);
  }},
}};
"""
(root / 'cloudflare' / 'worker-full.js').write_text(out, encoding='utf-8')
print('worker-full.js', len(out.encode()), 'bytes')
