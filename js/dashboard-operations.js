// Operations Dashboard Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Permission check
    if (!window.hasRole || (!window.hasRole('operations_admin') && !window.hasRole('super_admin') && !window.hasRole('admin'))) {
        // Handled by common scripts or redirect here
    }

    loadOpsStats();
    loadPendingListings();
    loadRecyclers();
});

async function loadOpsStats() {
    try {
        // 1. Pending Listings
        const listingsData = await apiGet('/api/admin/listings/pending?limit=1');
        document.getElementById('pendingListingsCount').textContent = listingsData.total || 0;

        // 2. Transporters (Using Recyclers count as proxy for logistics partners for now)
        const recyclersData = await apiGet('/api/admin/users?role=recycler&limit=1');
        document.getElementById('activeTransporters').textContent = recyclersData.total || 0;

        // 3. Open Disputes (Mock for now, or check reports?)
        // Let's use 'investigating' status dump reports as a proxy for operational issues
        const disputesData = await apiGet('/api/admin/dump-reports?status=investigating&limit=1');
        document.getElementById('openDisputes').textContent = disputesData.total || 0;

    } catch (e) {
        console.error('Error loading ops stats', e);
    }
}

async function loadPendingListings() {
    try {
        const data = await apiGet('/api/admin/listings/pending?limit=10');
        const tbody = document.getElementById('pendingListingsBody');

        if (!data.listings || data.listings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No pending listings</td></tr>';
            return;
        }

        tbody.innerHTML = data.listings.map(l => `
            <tr>
                <td><small>...${l._id.slice(-6)}</small></td>
                <td>${l.generatorId?.name || 'Unknown'}</td>
                <td>${l.wasteType}</td>
                <td>${l.amountKg} kg</td>
                <td>${l.location || 'N/A'}</td>
                <td>${new Date(l.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn-small btn-success" onclick="quickApprove('${l._id}')"><i class="fas fa-check"></i></button>
                    <button class="btn-small btn-danger" onclick="quickReject('${l._id}')"><i class="fas fa-times"></i></button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('Error loading pending listings', e);
        document.getElementById('pendingListingsBody').innerHTML = '<tr><td colspan="7" class="text-center">Error loading listings</td></tr>';
    }
}

async function loadRecyclers() {
    try {
        const data = await apiGet('/api/admin/users?role=recycler&limit=5');
        const tbody = document.getElementById('recyclersBody');

        if (!data.users || data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No active recyclers</td></tr>';
            return;
        }

        tbody.innerHTML = data.users.map(u => `
            <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="status-badge ${u.status}">${u.status}</span></td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('Error loading recyclers', e);
    }
}

// Quick Actions
window.quickApprove = async (id) => {
    if (!confirm('Approve this listing?')) return;
    try {
        await apiPost(`/api/admin/listings/${id}/approve`, {});
        loadPendingListings();
        loadOpsStats(); // Refresh count
    } catch (e) {
        alert('Failed to approve');
    }
};

window.quickReject = async (id) => {
    if (!confirm('Reject this listing?')) return;
    try {
        await apiPost(`/api/admin/listings/${id}/reject`, {});
        loadPendingListings();
        loadOpsStats(); // Refresh count
    } catch (e) {
        alert('Failed to reject');
    }
};
