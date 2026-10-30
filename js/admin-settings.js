// Admin Settings page logic

document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  loadSettings();
  document.getElementById('settingsForm').addEventListener('submit', handleSave);
});

async function checkAdminAccess() {
  try {
    const response = await apiGet('/api/auth/me');
    if (!response?.user || response.user.role !== 'admin') {
      alert('Access denied. Admin only.');
      window.location.href = '/admin/login.html';
      return;
    }
    document.getElementById('adminName').textContent = response.user.name || 'Admin';
  } catch (e) {
    window.location.href = '/admin/login.html';
  }
}

async function loadSettings() {
  try {
    const data = await apiGet('/api/admin/settings');
    const s = data.settings || {};
    setValue('platformName', s.platformName || 'Eco-Mali Exchange');
    setValue('supportEmail', s.supportEmail || 'support@example.com');
    setValue('jwtExpiryDays', s.jwtExpiryDays ?? 7);
    setValue('minLength', s.passwordPolicy?.minLength ?? 8);
    setChecked('requireNumber', !!s.passwordPolicy?.requireNumber);
    setChecked('requireUppercase', !!s.passwordPolicy?.requireUppercase);
    setChecked('partnersEnabled', !!s.features?.partnersEnabled);
    setChecked('volunteersEnabled', !!s.features?.volunteersEnabled);
  } catch (e) {
    showNotification(e.error || 'Failed to load settings', 'error');
  }
}

async function handleSave(e) {
  e.preventDefault();
  const body = {
    platformName: getValue('platformName'),
    supportEmail: getValue('supportEmail'),
    jwtExpiryDays: Number(getValue('jwtExpiryDays')),
    passwordPolicy: {
      minLength: Number(getValue('minLength')),
      requireNumber: getChecked('requireNumber'),
      requireUppercase: getChecked('requireUppercase'),
    },
    features: {
      partnersEnabled: getChecked('partnersEnabled'),
      volunteersEnabled: getChecked('volunteersEnabled'),
    },
  };

  try {
    const data = await apiPatch('/api/admin/settings', body);
    showNotification('Settings saved', 'success');
    // reload to reflect defaults/normalization
    loadSettings();
  } catch (e) {
    showNotification(e.error || 'Failed to save settings', 'error');
  }
}

function setupSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  }
}

// helpers
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function getValue(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function setChecked(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
function getChecked(id) { const el = document.getElementById(id); return el ? !!el.checked : false; }

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10001;
    padding: 0.75rem 1rem; border-radius: 6px; color: #fff;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}