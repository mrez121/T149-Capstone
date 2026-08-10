// lib/session.js
// Simple JWT-based session using cookies — no extra packages needed beyond jsonwebtoken

import jwt    from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET  = process.env.JWT_SECRET || 'teamup-jwt-secret-key-2026';
const COOKIE_NAME = 'teamup_token';

export function createToken(student) {
  return jwt.sign(student, JWT_SECRET, { expiresIn: '24h' });
}

export function getTokenFromRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies[COOKIE_NAME] || null;
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function setTokenCookie(res, token) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge:   60 * 60 * 24, // 24 hours
    path:     '/',
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  }));
}

export function clearTokenCookie(res) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge:   0,
    path:     '/',
  }));
}

export function requireAuth(req, res) {
  const token   = getTokenFromRequest(req);
  const student = token ? verifyToken(token) : null;
  if (!student) {
    res.status(401).json({ error: 'Not logged in.' });
    return null;
  }
  return student;
}
