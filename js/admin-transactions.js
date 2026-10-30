// Admin Transactions page logic

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
  setupSidebar();
  document.getElementById('statusFilter').addEventListener('change', loadTransactions);
  document.getElementById('methodFilter').addEventListener('change', loadTransactions);
  document.getElementById('exportCsv').addEventListener('click', exportCsv);
  loadTransactions();
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

async function loadTransactions() {
  const status = document.getElementById('statusFilter').value;
  const method = document.getElementById('methodFilter').value;
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (method) query.set('method', method);

  const tbody = document.getElementById('transactionsBody');
  tbody.innerHTML = '<tr><td colspan="8" class="text-center">Loading transactions...</td></tr>';

  try {
    const data = await apiGet(`/api/admin/transactions?limit=100${query.toString() ? '&' + query.toString() : ''}`);
    const rows = data.transactions || [];
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No transactions found</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(t => `
      <tr>
        <td>${t._id}</td>
        <td>${t.userId || '-'}</td>
        <td>${escapeHtml(t.description)}</td>
        <td>${formatCurrency(t.amount)}</td>
        <td><span class="status-badge ${t.status}">${t.status}</span></td>
        <td>${escapeHtml(t.paymentMethod)}</td>
        <td>${new Date(t.date).toLocaleString()}</td>
        <td>
          <div class="action-buttons">
            ${t.status !== 'completed' ? `<button class="btn-small btn-mark-paid" onclick="markPaid('${t._id}')"><i class="fas fa-check"></i> Mark Paid</button>` : ''}
            ${t.status !== 'refunded' ? `<button class="btn-small btn-refund" onclick="refund('${t._id}')"><i class="fas fa-undo"></i> Refund</button>` : ''}
            ${t.status !== 'failed' ? `<button class="btn-small btn-fail" onclick="markFailed('${t._id}')"><i class="fas fa-times"></i> Fail</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color:#f44336;">${escapeHtml(e.error || 'Failed to load transactions')}</td></tr>`;
  }
}

async function markPaid(id) { await updateTransaction(id, { status: 'completed' }); }
async function refund(id) { await updateTransaction(id, { status: 'refunded' }); }
async function markFailed(id) { await updateTransaction(id, { status: 'failed' }); }

async function updateTransaction(id, body) {
  try {
    await apiPatch(`/api/admin/transactions/${id}`, body);
    showNotification('Transaction updated', 'success');
    loadTransactions();
  } catch (e) {
    showNotification(e.error || 'Failed to update transaction', 'error');
  }
}

function exportCsv() {
  const status = document.getElementById('statusFilter').value;
  const method = document.getElementById('methodFilter').value;
  const url = '/api/admin/transactions/export' + (status || method ? `?${new URLSearchParams({ status, method })}` : '');
  window.open(url, '_blank');
}

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text ?? ''; return div.innerHTML; }
function formatCurrency(value) { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value || 0); }

window.markPaid = markPaid;
window.refund = refund;
window.markFailed = markFailed;
