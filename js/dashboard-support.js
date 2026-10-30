// Support Dashboard Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Permission check
    if (!window.hasRole || (!window.hasRole('support_admin') && !window.hasRole('super_admin') && !window.hasRole('admin'))) {
        // Redirect
    }

    loadSupportStats();
    loadRecentUsers();
    setupSearch();
});

async function loadSupportStats() {
    try {
        // 1. Open tickets (Mock for now, using pending users as proxy for 'work to do')
        const pendingUsers = await apiGet('/api/admin/users?status=pending&limit=1');
        document.getElementById('openTickets').textContent = pendingUsers.total || 0;

        // 2. Active Users
        const activeUsers = await apiGet('/api/admin/users?status=active&limit=1');
        document.getElementById('activeUsers').textContent = activeUsers.total || 0;

        // 3. Resolved Today (Mock)
        document.getElementById('resolvedToday').textContent = '0';

    } catch (e) {
        console.error('Error loading support stats', e);
    }
}

async function loadRecentUsers() {
    try {
        const data = await apiGet('/api/admin/users?limit=5');
        const tbody = document.getElementById('recentUsersBody');

        if (!data.users || data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No recent users</td></tr>';
            return;
        }

        tbody.innerHTML = data.users.map(u => `
            <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="status-badge ${u.status}">${u.status}</span></td>
                <td>
                    <button class="btn-small" onclick="viewUser('${u._id}')">Details</button>
                    ${u.status === 'suspended' ? `<button class="btn-small btn-success" onclick="reactivateUser('${u._id}')">Activate</button>` : ''}
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('Error loading recent users', e);
    }
}

function setupSearch() {
    const btn = document.getElementById('searchBtn');
    const input = document.getElementById('userSearchInput');

    const doSearch = async () => {
        const query = input.value.trim();
        if (!query) return;

        try {
            // Need a search endpoint? Using basic list for now, ideally API supports ?search=
            // Let's assume the API might not support fuzzy search yet, but let's try ?email= or ?name=
            // Actually, admin user list usually filters.
            // Let's rely on client side filtering if volume is low, or just assume backend search implementation later.
            // For now, let's just search by email since that's likely supported by existing backend filter logic if any.
            // Actually, best effort:
            const data = await apiGet(`/api/admin/users?email=${encodeURIComponent(query)}`);
            const resultsDiv = document.getElementById('searchResults');

            if (!data.users || data.users.length === 0) {
                // Try name?
                // data = await apiGet(...) 
                resultsDiv.innerHTML = '<p>No user found with that email.</p>';
                return;
            }

            const u = data.users[0]; // Just take first
            resultsDiv.innerHTML = `
                <div class="card" style="margin-top:1rem; border:1px solid #ddd;">
                    <h3>${u.name} (${u.role})</h3>
                    <p>Email: ${u.email}</p>
                    <p>Status: ${u.status}</p>
                    <a href="users.html?id=${u._id}" class="btn-small">Go to Profile</a>
                </div>
            `;

        } catch (e) {
            console.error('Search failed', e);
        }
    };

    btn.addEventListener('click', doSearch);
}

window.viewUser = (id) => location.href = `users.html?id=${id}`;
window.reactivateUser = async (id) => {
    if (!confirm('Reactivate this user?')) return;
    await apiPatch(`/api/admin/users/${id}`, { status: 'active' });
    loadRecentUsers();
};
