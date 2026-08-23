// pages/api/auth/logout.js
import { clearTokenCookie } from '../../../lib/session';

/**
 * @function handler
 * This function handles log out requests passed over HTTP
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default function handler(req, res) {
  clearTokenCookie(res);
  res.status(200).json({ ok: true });
}
