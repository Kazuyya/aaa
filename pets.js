import { put, list } from '@vercel/blob';
import { check } from './_auth.js';

const FILE = 'pets.json';
const num = (v, a, b, d) => { v = +v; return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };
const img = s => (typeof s === 'string' && /^data:image\/(png|jpe?g|gif|webp);base64,/.test(s) ? s : null);
const clean = a => a.slice(0, 30).map(p => ({
  id: String(p.id || '').slice(0, 20) || Math.random().toString(36).slice(2),
  name: String(p.name || 'Pet').slice(0, 40),
  src: img(p.src),
  photo: img(p.photo),
  frames: Math.round(num(p.frames, 1, 64, 1)),
  fps: num(p.fps, 1, 60, 8),
  speed: num(p.speed, 0.1, 10, 1),
  scale: num(p.scale, 0.1, 8, 2),
  msg: String(p.msg || '').slice(0, 120),
  flip: !!p.flip,
})).filter(p => p.src);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: FILE, limit: 1 });
      if (!blobs.length) return res.status(200).json({ pets: null });
      const r = await fetch(blobs[0].url + '?t=' + Date.now());
      return res.status(200).json({ pets: await r.json() });
    }
    if (req.method === 'POST') {
      const c = check(req);
      if (c !== 200) return res.status(c).json({ error: c === 401 ? 'password salah' : 'ADMIN_PASSWORD belum diatur' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!Array.isArray(body)) return res.status(400).json({ error: 'format salah' });
      await put(FILE, JSON.stringify(clean(body)), {
        access: 'public', contentType: 'application/json',
        addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60,
      });
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
