// Lightweight API wrapper that injects Authorization header when token is present
// Adapts automatically to any host. Rules:
// - If window.ECO_MALI_API_BASE_URL is set, use that (no trailing slash).
// - Otherwise, auto-detect based on environment
// - Production (render.com): Use API subdomain or same origin
// - Local development: Use localhost:3000
function resolveApiBaseUrl() {
  const override = (window.ECO_MALI_API_BASE_URL || '').trim();
  if (override) {
    return override.replace(/\/+$/, '');
  }

  const hostname = window.location.hostname;

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }

  // Render: prefer same-origin "/api" so static service rewrites to API
  if (hostname.endsWith('onrender.com')) {
    return '';
  }

  // Default: same-origin (backend serves frontend)
  return '';
}

async function apiFetch(path, options = {}) {
  const API_URL = resolveApiBaseUrl();
  const fullPath = path.startsWith('/') ? `${API_URL}${path}` : path;

  // Debug log for API calls (comment out in production if too noisy)
  console.debug('API Call:', {
    method: options.method || 'GET',
    fullPath,
    hostname: window.location.hostname,
    hasToken: !!localStorage.getItem('token')
  });

  const token = localStorage.getItem('token');
  const headers = Object.assign({}, options.headers || {});
  if (token) headers['Authorization'] = 'Bearer ' + token;
  // Ensure JSON content-type for non-FormData bodies (including pre-stringified JSON)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  const res = await fetch(fullPath, Object.assign({}, options, { headers }));
  if (res.status === 401) {
    // token invalid or expired
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    const path = window.location.pathname;
    const isAuthPage = path.includes('auth.html') || path.includes('/admin/login.html');

    if (!isAuthPage) {
      const returnTo = encodeURIComponent(path + window.location.search);
      const isAdmin = path.includes('/admin/');
      window.location.href = isAdmin ? `/admin/login.html?returnTo=${returnTo}` : `/auth.html?returnTo=${returnTo}`;
    }
    throw { error: 'Unauthorized' };
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!res.ok) throw { ...json, status: res.status };
    return json;
  }
  // fallback to text
  const text = await res.text();
  if (!res.ok) throw { error: text, status: res.status };
  return text;
}

// convenience shortcuts
function apiGet(path) { return apiFetch(path, { method: 'GET' }); }
function apiPost(path, body) { return apiFetch(path, { method: 'POST', body: JSON.stringify(body) }); }
function apiPatch(path, body) { return apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }); }
function apiDelete(path) { return apiFetch(path, { method: 'DELETE' }); }