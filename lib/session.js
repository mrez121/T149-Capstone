// lib/session.js
// Simple JWT-based session using cookies — no extra packages needed beyond jsonwebtoken

import jwt    from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET  = process.env.JWT_SECRET || 'teamup-jwt-secret-key-2026';
const COOKIE_NAME = 'teamup_token';

/**
 * @function createToken
 * @param {*} student - a json object representing the student and their information
 * @returns a JSON webtoken used for authentication across the session.
 */
export function createToken(student) {
  return jwt.sign(student, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * @function getTokenFromRequest
 * Extract a JSON web token from html request cookies
 * @param {*} req A html request header
 * @returns the JSON web token from the cookies array in the request
 */
export function getTokenFromRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies[COOKIE_NAME] || null;
}

/**
 * @function verifyToken
 * Verify that a provided JWT is actually for use with TeamUp
 * @param {*} token a JSON web token
 * @returns a verified JSON web token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * @function setTokenCookie
 * Sets the provided JWT into the response html response header for authentication use on other pages
 * @param {*} res - the html response to be sent back to the user's browser
 * @param {*} token - the JWT token to be embedded into the response
 */
export function setTokenCookie(res, token) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge:   60 * 60 * 24, // 24 hours
    path:     '/',
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  }));
}

/**
 * @function clearTokenCookie
 * Removes the JWT from the provided html response, removing the user's ability to be authenticated unless they login again.
 * @param {*} res the html response that having its JWT removed
 */
export function clearTokenCookie(res) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge:   0,
    path:     '/',
  }));
}

/**
 * @function requireAuth
 * Confirms that the user is authenticated with a valid JSON Web Token
 * @param {*} req the html request parameter sent by the user
 * @param {*} res the html response parameter sent by the user
 * @returns a verified student object that containst the student's information and the JWT attached to their session.
 */
export function requireAuth(req, res) {
  const token   = getTokenFromRequest(req);
  const student = token ? verifyToken(token) : null;
  if (!student) {
    res.status(401).json({ error: 'Not logged in.' });
    return null;
  }
  return student;
}
