import { timingSafeEqual } from 'crypto';
// 200 = ok, 401 = password salah, 500 = ADMIN_PASSWORD belum diatur
export function check(req) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return 500;
  const a = Buffer.from(String(req.headers['x-admin-key'] || ''));
  const b = Buffer.from(pw);
  return a.length === b.length && timingSafeEqual(a, b) ? 200 : 401;
}
