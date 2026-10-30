// Admin Reports page logic

let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  document.getElementById('refreshReports').addEventListener('click', refresh);
  document.getElementById('rangeDays').addEventListener('change', refresh);
  // initial load
  loadSummary();
  loadTimeseries(Number(document.getElementById('rangeDays').value));
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

function setupSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  }
}

async function refresh() {
  const rangeDays = Number(document.getElementById('rangeDays').value);
  await Promise.all([ loadSummary(), loadTimeseries(rangeDays) ]);
}

async function loadSummary() {
  try {
    const data = await apiGet('/api/admin/reports/summary');
    const u = data.users || {}; const l = data.listings || {}; const t = data.transactions || {};
    setText('totalUsers', u.total || 0);
    setText('totalListings', l.total || 0);
    setText('totalTransactions', t.total || 0);
    setText('totalAmount', formatCurrency(t.totalAmount || 0));
  } catch (e) {
    showNotification(e.error || 'Failed to load summary', 'error');
  }
}

async function loadTimeseries(rangeDays) {
  try {
    const data = await apiGet(`/api/admin/reports/timeseries?rangeDays=${rangeDays}`);
    const usersSeries = data.usersCreated || [];
    const listingsSeries = data.listingsCreated || [];
    const amountSeries = data.transactionsAmount || [];

    renderLineChart('usersChart', usersSeries, 'Signups');
    renderLineChart('listingsChart', listingsSeries, 'Listings');
    renderLineChart('amountChart', amountSeries, 'Amount (KES)', true);
  } catch (e) {
    showNotification(e.error || 'Failed to load timeseries', 'error');
  }
}

function renderLineChart(canvasId, series, label, isCurrency = false) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;

  const labels = series.map(p => p.day);
  const data = series.map(p => p.value);

  if (charts[canvasId]) charts[canvasId].destroy();
  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46,125,50,0.15)',
        tension: 0.2,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => isCurrency ? `Amount: ${formatCurrency(ctx.parsed.y)}` : `${label}: ${ctx.parsed.y}`
          }
        }
      }
    }
  });
}

function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function formatCurrency(value) { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value); }

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
