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

// ── Prediction endpoints ──────────────────────────────────────────────────────

export const predictionAPI = {
  /**
   * Predict emotion from image file upload.
   * Returns { success, message, data: { emotion, confidence, ... } }
   */
  predictFromImage: (formData) => {
    const token = getToken();
    return fetch(`${API}/predict/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(res => res.json());
  },

  /**
   * Predict emotion from webcam frame (base64).
   * Returns { success, data: { emotion, confidence, ... } }
   */
  predictFromWebcam: (frameData) => post('/predict/webcam', { frame: frameData }),
};

// ── Consent endpoints ─────────────────────────────────────────────────────────

export const consentAPI = {
  /**
   * Get current user's consent settings
   * Returns { success, data: { cameraConsent, storageConsent } }
   */
  getConsent: () => get('/consent'),

  /**
   * Update consent settings
   * Returns { success, data: { cameraConsent, storageConsent } }
   */
  updateConsent: (cameraConsent, storageConsent) => 
    put('/consent', { cameraConsent, storageConsent }),

  /**
   * Withdraw all consent
   */
  withdrawConsent: () => post('/consent/withdraw'),
};

export const todoAPI = {
  getTodos: () => get('/todos'),
  createTodo: (title) => post('/todos', { title }),
  updateTodo: (todoId, payload) => put(`/todos/${todoId}`, payload),
  deleteTodo: (todoId) => del(`/todos/${todoId}`),
};

// ── Admin endpoints ───────────────────────────────────────────────────────────

export const adminAPI = {
  /**
   * Get system-wide statistics (total users, predictions, etc.)
   * Returns { success, data: { users, predictions, emotionDistribution } }
   */
  getSystemStats: () => get('/admin/stats'),

  /**
   * Get paginated list of all users with optional search
   * Returns { success, data: { users, total, page, pages } }
   */
  getUsers: (page = 1, limit = 20, search = '') =>
    get(`/admin/users?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`),

  /**
   * Update user status (activate/deactivate)
   * Returns { success, message, data: user }
   */
  updateUserStatus: (userId, isActive) =>
    put(`/admin/users/${userId}/status`, { isActive }),

  /**
   * Get audit logs with filtering and pagination
   * Returns { success, data: { logs, total, page, pages } }
   */
  getLogs: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.append(key, value);
    });
    return get(`/admin/logs${params.toString() ? '?' + params.toString() : ''}`);
  },

  /**
   * Get audit statistics for a given time period
   * Returns { success, data: { ... } }
   */
  getLogStats: (days = 30) => get(`/admin/logs/stats?days=${days}`),

  /**
   * Get inference service health and configuration status
   * Returns { success, data: { health, config } }
   */
  getInferenceStatus: () => get('/admin/inference/status'),
};
