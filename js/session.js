// Session guard for protected pages
document.addEventListener('DOMContentLoaded', async () => {
  // If an element with data-protect is present, enforce authentication
  const protect = document.querySelector('[data-protect]');
  if (!protect) return;
  const required = protect.getAttribute('data-protect'); // optional comma-separated roles
  const token = localStorage.getItem('token');

  if (!token) {
    // redirect to login with return url
    // Avoid redirect loop if already on login page
    const isAuthPage = window.location.pathname.includes('auth.html') || window.location.pathname.includes('/admin/login.html');
    if (isAuthPage) return;

    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    // Check if this is an admin page
    if (window.location.pathname.includes('/admin/')) {
      window.location.href = '/admin/login.html?returnTo=' + returnTo;
    } else {
      window.location.href = '/auth.html?returnTo=' + returnTo;
    }
    return;
  }

  if (required) {
    const role = (localStorage.getItem('userRole') || '').trim().toLowerCase();
    const allowed = required.split(',').map(s => s.trim().toLowerCase());
    console.log('[Session] Role check - User:', role, 'Required:', allowed);

    // If the role is missing or not in the allowed list, redirect based on context
    if (!role || !allowed.includes(role)) {
      console.log('[Session] Role not allowed, redirecting');
      if (window.location.pathname.includes('/admin/')) {
        window.location.href = '/admin/login.html';
      } else {
        window.location.href = '/auth.html';
      }
      console.log('[Session] Role check passed');
    }
  }

  // Enforce granular permissions (hide UI elements)
  checkPermissions();
});

function checkPermissions() {
  const permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
  const isSuperAdmin = permissions.includes('*:*');

  document.querySelectorAll('[data-permission]').forEach(el => {
    const required = el.getAttribute('data-permission');
    if (isSuperAdmin) return;

    if (!permissions.includes(required)) {
      console.log(`[RBAC] Hiding element requiring ${required}`);
      el.style.display = 'none';
    }
  });
}

function hasPermission(required) {
  const permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
  if (permissions.includes('*:*')) return true;
  return permissions.includes(required);
}

// Make accessible globally
// Make accessible globally
window.hasPermission = hasPermission;

function hasRole(roleToCheck) {
  const currentRole = (localStorage.getItem('userRole') || '').toLowerCase();
  if (roleToCheck === currentRole) return true;
  return false;
}
window.hasRole = hasRole;


// Logout function (no Supabase)
function handleLogout() {
  localStorage.clear();
  window.location.href = '/auth.html';
}

// Auto-wire logout buttons with data-logout (works for dynamically created elements too)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-logout]');
  if (!btn) return;
  e.preventDefault();
  handleLogout();
});

// Make logout function available globally
window.handleLogout = handleLogout;