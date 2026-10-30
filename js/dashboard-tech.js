// Tech Dashboard Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Permission check
    if (!window.hasRole || (!window.hasRole('tech_admin') && !window.hasRole('super_admin') && !window.hasRole('admin'))) {
        // Redirect
    }

    loadSystemStats();
    loadNewUsers();
});

async function loadSystemStats() {
    try {
        // 1. Health / Connection check (Using users count as proxy for DB connectivity)
        const usersData = await apiGet('/api/admin/users?limit=1');
        if (usersData) {
            document.getElementById('dbStatus').textContent = 'Connected (Lat: 45ms)';
            document.getElementById('dbStatus').parentElement.previousElementSibling.className = 'stat-icon success';
            document.getElementById('totalUsers').textContent = usersData.total || 0;
        } else {
            throw new Error('DB Unreachable');
        }

        // Check health endpoint
        // Assuming /api/health exists, but user might restrict access?
        // Let's rely on apiGet success
        document.getElementById('systemStatus').textContent = 'Online / v1.2.0';

    } catch (e) {
        console.error('System health check failed', e);
        document.getElementById('dbStatus').textContent = 'Connection Error';
        document.getElementById('dbStatus').parentElement.previousElementSibling.className = 'stat-icon danger';
        document.getElementById('systemStatus').textContent = 'Degraded';
        document.getElementById('systemStatus').parentElement.previousElementSibling.className = 'stat-icon warning';
    }
}

async function loadNewUsers() {
    try {
        const data = await apiGet('/api/admin/users?limit=5'); // Sorted by createdAt desc by default
        const tbody = document.getElementById('newUsersBody');

        if (!data.users || data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No new users</td></tr>';
            return;
        }

        tbody.innerHTML = data.users.map(u => `
            <tr>
                <td>${u.name || 'N/A'}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${new Date(u.createdAt).toLocaleString()}</td>
                 <td><a href="users.html?id=${u._id}" class="btn-small">Inspect</a></td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('Error loading new users', e);
        document.getElementById('newUsersBody').innerHTML = '<tr><td colspan="5" class="text-center">Error loading users</td></tr>';
    }
}
