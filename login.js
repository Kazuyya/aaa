import { check } from './_auth.js';
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const c = req.method === 'POST' ? check(req) : 405;
  res.status(c).json({ ok: c === 200 });
}
