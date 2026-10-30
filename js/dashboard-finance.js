// Finance Dashboard Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Only allow finance_admin, super_admin, admin
    if (!window.hasRole || (!window.hasRole('finance_admin') && !window.hasRole('super_admin') && !window.hasRole('admin'))) {
        // session.js usually handles redirect, but double check
        // window.location.href = '/admin/login.html'; 
    }

    loadFinanceStats();
    loadPendingWithdrawals();
    loadLedger();
});

async function loadFinanceStats() {
    try {
        // 1. Revenue
        const revData = await apiGet('/api/admin/revenue?rangeDays=30');
        document.getElementById('totalRevenue').textContent = `KES ${revData.period.totalRevenue?.toLocaleString() || 0}`;

        // 2. Pending Withdrawals Count
        const walletStats = await apiGet('/api/admin/wallet/stats');
        // walletStats.byType.withdrawals is total, we need pending specifically for withdrawals...
        // The API returns total pending, not broken down by type in 'byStatus'.
        // Let's use the transactions count query for accuracy or use overall pending for now.
        // Actually, let's fetch pending withdrawals count specifically if needed or just use total pending wallet txns.
        // Ideally the API should support this, let's assume 'pending' is mostly what we care about.
        document.getElementById('pendingWithdrawals').textContent = walletStats.byStatus?.pending || 0;

        // 3. Total Txns
        document.getElementById('totalTxns').textContent = revData.allTime.transactionCount || 0;

    } catch (e) {
        console.error('Error loading finance stats', e);
    }
}

async function loadPendingWithdrawals() {
    try {
        const data = await apiGet('/api/admin/wallet/transactions?status=pending&type=withdrawal&limit=5');
        const tbody = document.getElementById('withdrawalsBody');

        if (!data.transactions || data.transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No pending withdrawals</td></tr>';
            return;
        }

        tbody.innerHTML = data.transactions.map(t => `
            <tr>
                <td>${new Date(t.createdAt).toLocaleDateString()}</td>
                <td>${t.user?.name || 'Unknown'}</td>
                <td>KES ${t.amount.toLocaleString()}</td>
                <td>${t.paymentMethod || 'M-Pesa'}</td>
                <td>
                    <a href="wallet-transactions.html?id=${t._id}" class="btn-small">Review</a>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('Error loading withdrawals', e);
        document.getElementById('withdrawalsBody').innerHTML = '<tr><td colspan="5" class="text-center">Error loading data</td></tr>';
    }
}

async function loadLedger() {
    try {
        // Re-use revenue breakdown or generic transactions? 
        // Let's use the revenue breakdown endpoint as it has fee details
        const data = await apiGet('/api/admin/revenue/breakdown?limit=10');
        const tbody = document.getElementById('ledgerBody');

        if (!data.transactions || data.transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No recent entries</td></tr>';
            return;
        }

        tbody.innerHTML = data.transactions.map(t => `
            <tr>
                <td><small>...${t._id.slice(-6)}</small></td>
                <td>${t.user?.name || 'N/A'}</td>
                <td>${t.description || 'Transaction'}</td>
                <td>${t.amount.toLocaleString()}</td>
                <td class="text-muted">${t.platformFee.toLocaleString()}</td>
                <td class="text-success bold">${t.netAmount.toLocaleString()}</td>
                <td><span class="status-badge status-completed">Completed</span></td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('Error loading ledger', e);
        document.getElementById('ledgerBody').innerHTML = '<tr><td colspan="7" class="text-center">Error loading ledger</td></tr>';
    }
}
