/**
 * api.js — centralised HTTP client for all backend requests
 *
 * Base URL is handled automatically:
 *  - In development CRA proxies /api → http://localhost:5000  (via "proxy" in package.json)
 *  - In production set REACT_APP_API_URL=https://your-backend.com
 */

// In dev, CRA proxy (package.json "proxy") forwards /api/* → localhost:5000, so BASE=''.
// In production set REACT_APP_API_URL=https://your-backend.com (no trailing slash, no /api suffix).
const BASE = process.env.REACT_APP_API_URL || '';
const V    = process.env.REACT_APP_API_VERSION || 'v1';
const API  = `${BASE}/api/${V}`;

// ── Token helpers ─────────────────────────────────────────────────────────────

export const getToken  = ()        => localStorage.getItem('token');
export const setToken  = (t)       => localStorage.setItem('token', t);
export const clearToken = ()       => localStorage.removeItem('token');

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request(method, path, body = null, extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${API}${path}`, config);
  const data = await res.json();

  // Throw so callers can catch with a meaningful message
  if (!res.ok) {
    // Backend sends { message } or { errors: [...] }
    const msg =
      data.message ||
      (data.errors && data.errors.map((e) => e.message).join(', ')) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

// Convenience wrappers
const get  = (path)         => request('GET',    path);
const post = (path, body)   => request('POST',   path, body);
const put  = (path, body)   => request('PUT',    path, body);
const del  = (path)         => request('DELETE', path);

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const authAPI = {
  /**
   * Register a new user.
   * Returns { success, message, token, user }
   */
  register: (payload) => post('/auth/register', payload),

  /**
   * Login with email + password.
   * Returns { success, message, token, user }
   */
  login: (email, password) => post('/auth/login', { email, password }),

  /**
   * Logout (invalidates audit log on server).
   * Token must still be present in header.
   */
  logout: () => post('/auth/logout'),

  /** Get logged-in user's profile */
  getProfile: () => get('/auth/profile'),

  /** Update name / city / address / mobile */
  updateProfile: (payload) => put('/auth/profile', payload),
};

export default { get, post, put, del };
