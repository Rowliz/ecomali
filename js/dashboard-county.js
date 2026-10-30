// County Dashboard Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Check permission
    if (!window.hasRole || (!window.hasRole('county_admin') && !window.hasRole('super_admin') && !window.hasRole('admin'))) {
        // Redirection handled by session/auth check usually
    }

    // Get current user to know which county
    const user = await apiGet('/api/auth/me');
    const countyName = user.user?.county || 'Unknown County'; // Assuming county field is on user model now

    document.getElementById('countyTitle').textContent = `${countyName} Dashboard`;
    document.getElementById('countySubtitle').textContent = `Overview for ${countyName} region.`;

    loadCountyStats(countyName);
    loadUrgentReports(countyName);
    loadLocalListings(countyName);
});

async function loadCountyStats(county) {
    try {
        // 1. Local Users
        // The API automatically scopes if I am a county admin, but if I'm super admin testing, I might need to pass county param?
        // Let's assume the API handles scoping implicitly for County Admin role.
        // For Super Admin viewing this, we might need a county selector, but for now let's rely on default behavior.
        const usersData = await apiGet('/api/admin/users?limit=1');
        document.getElementById('localUsersCount').textContent = usersData.total || 0;

        // 2. Dump Reports
        const reportsData = await apiGet('/api/admin/dump-reports?status=pending&limit=1');
        document.getElementById('dumpReportsCount').textContent = reportsData.total || 0;

        // 3. Listings
        const listingsData = await apiGet('/api/admin/listings?limit=1');
        document.getElementById('activeListingsCount').textContent = listingsData.total || 0;

    } catch (e) {
        console.error('Error loading county stats', e);
    }
}

async function loadUrgentReports(county) {
    try {
        const data = await apiGet('/api/admin/dump-reports?severity=critical&limit=5');
        const tbody = document.getElementById('urgentReportsBody');

        if (!data.reports || data.reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No critical reports</td></tr>';
            return;
        }

        tbody.innerHTML = data.reports.map(r => `
            <tr>
                <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                <td>${r.location}</td>
                <td><span class="badg badge-danger">Critical</span></td>
                <td>${r.status}</td>
                <td><a href="dump-reports.html?id=${r._id}" class="btn-small">View</a></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Error loading reports', e);
        document.getElementById('urgentReportsBody').innerHTML = '<tr><td colspan="5" class="text-center">Error loading reports</td></tr>';
    }
}

async function loadLocalListings(county) {
    try {
        const data = await apiGet('/api/admin/listings?limit=5'); // Scoped by backend
        const tbody = document.getElementById('localListingsBody');

        if (!data.listings || data.listings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent listings</td></tr>';
            return;
        }

        tbody.innerHTML = data.listings.map(l => `
            <tr>
                <td>${l.generatorId?.name || 'Unknown'}</td>
                <td>${l.wasteType}</td>
                <td>${l.amountKg} kg</td>
                <td>${l.location}</td>
                <td><span class="status-badge status-${l.status}">${l.status}</span></td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('Error loading listings', e);
        document.getElementById('localListingsBody').innerHTML = '<tr><td colspan="5" class="text-center">Error loading listings</td></tr>';
    }
}
