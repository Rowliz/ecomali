// Admin Dashboard JavaScript

let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  await checkAdminAccess();
  personalizeDashboard();
  loadDashboardData();
});

// Check if user has admin access
async function checkAdminAccess() {
  try {
    // Check stored credentials from login (more reliable than /api/auth/me)
    const token = localStorage.getItem('token');
    const userRole = (localStorage.getItem('userRole') || '').toString().trim().toLowerCase();

    if (!token) {
      console.log('[Dashboard] No token, redirecting to login');
      window.location.href = '/admin/login.html';
      return;
    }

    // Check if user has admin privileges
    const allowedRoles = ['admin', 'super_admin', 'moderator'];
    console.log('[Dashboard] Checking access - Token present:', !!token, 'Role:', userRole, 'Allowed:', allowedRoles);

    if (!allowedRoles.includes(userRole)) {
      console.log('[Dashboard] Access denied - role not in allowed list');
      alert('Access denied. Admin privileges required.');
      window.location.href = '/index.html';
      return;
    }

    console.log('[Dashboard] Access granted for role:', userRole);

    // Fetch full user info for display
    try {
      const response = await apiGet('/api/auth/me');
      if (response && response.user) {
        currentUser = response.user;
      }
    } catch (error) {
      console.log('[Dashboard] Could not fetch full user info, but access granted based on stored role');
    }
  } catch (error) {
    console.error('Error checking admin access:', error);
    window.location.href = '/admin/login.html';
  }
}

// Load dashboard data
async function loadDashboardData() {
  const role = (localStorage.getItem('userRole') || '').toLowerCase();

  try {
    const promises = [loadStats()];

    // Add role-specific data loading
    if (role === 'finance_admin' || role === 'super_admin' || role === 'admin') {
      promises.push(loadPendingWalletTxns());
      promises.push(loadFinanceDetailed());
    }

    if (role === 'compliance_admin' || role === 'super_admin' || role === 'admin') {
      promises.push(loadRecentDumpReports());
      promises.push(loadComplianceStats());
    }

    if (role === 'operations_admin' || role === 'super_admin' || role === 'admin') {
      promises.push(loadPendingListings());
    }

    if (role === 'tech_admin' || role === 'super_admin' || role === 'admin') {
      promises.push(loadRecentUsers());
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error loading dashboard data', 'error');
  }
}

function personalizeDashboard() {
  const role = (localStorage.getItem('userRole') || '').toLowerCase();
  const greeting = document.getElementById('dashboardGreeting');
  const subtitle = document.getElementById('dashboardSubtitle');

  const roleDisplayNames = {
    'super_admin': 'System Master',
    'admin': 'General Administrator',
    'finance_admin': 'Finance Administrator',
    'compliance_admin': 'Compliance & Safety Officer',
    'operations_admin': 'Operations Manager',
    'tech_admin': 'Technical Administrator'
  };

  const roleSubtitles = {
    'finance_admin': 'Monitoring revenue, payouts, and wallet health.',
    'compliance_admin': 'Tracking environmental impact and dump site resolutions.',
    'operations_admin': 'Managing listings, recyclers, and platform activity.',
    'tech_admin': 'Overseeing user accounts and system configuration.'
  };

  if (greeting) {
    const name = currentUser?.name || 'Admin';
    greeting.textContent = `Welcome, ${name} (${roleDisplayNames[role] || 'Administrator'})`;
  }

  if (subtitle && roleSubtitles[role]) {
    subtitle.textContent = roleSubtitles[role];
  }

  // Show/Hide sections based on role
  if (role === 'finance_admin') {
    document.getElementById('financeSection')?.show(); // Need a helper or manually set style
    document.getElementById('revenueStatCard').style.display = 'flex';
    toggleSection('financeSection', true);
  } else if (role === 'compliance_admin') {
    toggleSection('complianceSection', true);
  } else if (role === 'super_admin' || role === 'admin') {
    toggleSection('financeSection', true);
    toggleSection('complianceSection', true);
    toggleSection('complianceSection', true);
    document.getElementById('revenueStatCard').style.display = 'flex';
    toggleSection('adminHubSection', true);
  }
}

function toggleSection(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? 'block' : 'none';
}

// Load statistics
async function loadStats() {
  try {
    // Get users count
    const usersData = await apiGet('/api/admin/users?limit=1');
    document.getElementById('totalUsers').textContent = usersData.total || 0;

    // Get pending listings
    const listingsData = await apiGet('/api/admin/listings/pending?limit=1');
    document.getElementById('pendingListings').textContent = listingsData.total || 0;

    // Get recyclers count
    const recyclersData = await apiGet('/api/admin/users?role=recycler&limit=1');
    document.getElementById('totalRecyclers').textContent = recyclersData.total || 0;

    // Get transactions count
    const transactionsData = await apiGet('/api/admin/transactions?limit=1');
    document.getElementById('totalTransactions').textContent = transactionsData.total || 0;

    // Get pending wallet transactions count
    const walletData = await apiGet('/api/admin/wallet/stats');
    document.getElementById('pendingWalletTxns').textContent = walletData.byStatus?.pending || 0;

    // Finance/SuperAdmin only: Revenue
    const role = (localStorage.getItem('userRole') || '').toLowerCase();
    if (role === 'finance_admin' || role === 'super_admin' || role === 'admin') {
      const revenueData = await apiGet('/api/admin/revenue');
      const revEl = document.getElementById('totalRevenue');
      if (revEl && revenueData.period) {
        revEl.textContent = `KES ${revenueData.period.totalRevenue?.toLocaleString() || 0}`;
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load pending listings
async function loadPendingListings() {
  try {
    const data = await apiGet('/api/admin/listings/pending?limit=10');
    const tbody = document.getElementById('pendingListingsBody');

    if (!data.listings || data.listings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No pending listings</td></tr>';
      return;
    }

    tbody.innerHTML = data.listings.map(listing => `
      <tr>
        <td>${listing._id.substring(0, 8)}...</td>
        <td>${listing.generatorId?.name || 'Unknown'}</td>
        <td>${listing.wasteType.charAt(0).toUpperCase() + listing.wasteType.slice(1)}</td>
        <td>${listing.amountKg} kg</td>
        <td>KES ${listing.biddingPrice.toLocaleString()}</td>
        <td>${listing.location || 'N/A'}</td>
        <td>${new Date(listing.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn-small btn-success" onclick="approveListing('${listing._id}')">
            <i class="fas fa-check"></i> Approve
          </button>
          <button class="btn-small btn-danger" onclick="rejectListing('${listing._id}')">
            <i class="fas fa-times"></i> Reject
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading pending listings:', error);
    document.getElementById('pendingListingsBody').innerHTML =
      '<tr><td colspan="8" class="text-center">Error loading listings</td></tr>';
  }
}

// Load recent users
async function loadRecentUsers() {
  try {
    const data = await apiGet('/api/admin/users?limit=10');
    const tbody = document.getElementById('recentUsersBody');

    if (!data.users || data.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
      return;
    }

    tbody.innerHTML = data.users.map(user => `
      <tr>
        <td>${user.name || 'N/A'}</td>
        <td>${user.email || 'N/A'}</td>
        <td><span class="role-badge ${user.role}">${user.role || 'member'}</span></td>
        <td><span class="status-badge ${user.status || 'pending'}">${user.status || 'pending'}</span></td>
        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn-small" onclick="viewUser('${user._id}')">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading recent users:', error);
    document.getElementById('recentUsersBody').innerHTML =
      '<tr><td colspan="6" class="text-center">Error loading users</td></tr>';
  }
}

// Load pending wallet transactions
async function loadPendingWalletTxns() {
  if (!window.hasPermission || !window.hasPermission('transactions:read')) return;

  try {
    const data = await apiGet('/api/admin/wallet/transactions?status=pending&limit=5');
    const tbody = document.getElementById('pendingWalletTxnsBody');
    if (!tbody) return;

    if (!data.transactions || data.transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No pending transactions</td></tr>';
      return;
    }

    tbody.innerHTML = data.transactions.map(t => `
      <tr>
        <td>${new Date(t.createdAt).toLocaleDateString()}</td>
        <td>${t.user?.name || 'Unknown'} (${t.user?.role || 'N/A'})</td>
        <td><span class="type-badge type-${t.type}">${t.type}</span></td>
        <td>KES ${t.amount.toLocaleString()}</td>
        <td><span class="status-badge status-${t.status}">${t.status}</span></td>
        <td>
          <a href="wallet-transactions.html" class="btn-small">Review</a>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading wallet transactions:', error);
    const tbody = document.getElementById('pendingWalletTxnsBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading transactions</td></tr>';
  }
}

// Load recent dump reports
async function loadRecentDumpReports() {
  if (!window.hasPermission || !window.hasPermission('reports:read') && !window.hasPermission('reports:read')) return; // Check reports:read as proxy or specific if defined

  try {
    const data = await apiGet('/api/admin/dump-reports?limit=5');
    const tbody = document.getElementById('recentDumpReportsBody');
    if (!tbody) return;

    if (!data.reports || data.reports.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No reports found</td></tr>';
      return;
    }

    tbody.innerHTML = data.reports.map(r => `
      <tr>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
        <td>${r.location}</td>
        <td>${r.county}</td>
        <td><span class="severity-badge severity-${r.severity}">${r.severity}</span></td>
        <td><span class="status-badge status-${r.status}">${r.status}</span></td>
        <td>
          <a href="dump-reports.html" class="btn-small">View</a>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading dump reports:', error);
    const tbody = document.getElementById('recentDumpReportsBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading reports</td></tr>';
  }
}

// Specialized Finance Loading
async function loadFinanceDetailed() {
  try {
    const data = await apiGet('/api/admin/revenue/breakdown?limit=10');
    const tbody = document.getElementById('financeDetailedBody');
    if (!tbody) return;

    if (!data.transactions || data.transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No recent financial records</td></tr>';
      return;
    }

    tbody.innerHTML = data.transactions.map(t => `
      <tr>
        <td>#${t._id.substring(t._id.length - 6)}</td>
        <td>${t.user?.name || 'N/A'}</td>
        <td class="text-success">KES ${t.amount.toLocaleString()}</td>
        <td class="text-muted">KES ${t.platformFee.toLocaleString()}</td>
        <td>${new Date(t.date).toLocaleDateString()}</td>
        <td><span class="status-badge status-completed">Completed</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading finance details:', error);
  }
}

// Specialized Compliance Loading
async function loadComplianceStats() {
  try {
    const data = await apiGet('/api/admin/dump-reports/stats');
    const severityEl = document.getElementById('severityStats');
    const resolutionBar = document.getElementById('resolutionBar');
    const resolutionStats = document.getElementById('resolutionStats');

    if (severityEl && data.bySeverity) {
      severityEl.innerHTML = data.bySeverity.map(s => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>${s._id.charAt(0).toUpperCase() + s._id.slice(1)}</span>
          <span class="badge ${s._id === 'high' ? 'danger' : s._id === 'medium' ? 'warning' : 'info'}">${s.count}</span>
        </div>
      `).join('');
    }

    if (resolutionBar && resolutionStats) {
      const total = data.total || 0;
      const resolved = data.resolved || 0;
      const percent = total > 0 ? (resolved / total) * 100 : 0;
      resolutionBar.style.width = `${percent}%`;
      resolutionStats.textContent = `${resolved}/${total} Issues Resolved (${Math.round(percent)}%)`;
    }
  } catch (error) {
    console.error('Error loading compliance stats:', error);
  }
}

// Approve listing
async function approveListing(listingId) {
  if (!confirm('Are you sure you want to approve this listing?')) return;

  try {
    await apiPost(`/api/admin/listings/${listingId}/approve`, {});
    showNotification('Listing approved successfully!', 'success');
    loadDashboardData();
  } catch (error) {
    console.error('Error approving listing:', error);
    showNotification(error.error || 'Failed to approve listing', 'error');
  }
}

// Reject listing
async function rejectListing(listingId) {
  const reason = prompt('Please provide a reason for rejection (optional):');

  try {
    await apiPost(`/api/admin/listings/${listingId}/reject`, { reason: reason || '' });
    showNotification('Listing rejected', 'success');
    loadDashboardData();
  } catch (error) {
    console.error('Error rejecting listing:', error);
    showNotification(error.error || 'Failed to reject listing', 'error');
  }
}

// View user
function viewUser(userId) {
  window.location.href = `users.html?id=${userId}`;
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    z-index: 10001;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Make functions available globally
window.approveListing = approveListing;
window.rejectListing = rejectListing;
window.viewUser = viewUser;

