// pages/api/auth/logout.js
import { clearTokenCookie } from '../../../lib/session';

export default function handler(req, res) {
  clearTokenCookie(res);
  res.status(200).json({ ok: true });
}
