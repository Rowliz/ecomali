// Compliance Dashboard Logic

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.hasRole || (!window.hasRole('compliance_admin') && !window.hasRole('super_admin') && !window.hasRole('admin'))) {
        // Handle redirect
    }
    loadComplianceStats();
    loadPrioritySites();
});

async function loadComplianceStats() {
    try {
        // 1. Critical Sites
        const criticalData = await apiGet('/api/admin/dump-reports?severity=critical');
        document.getElementById('highRiskSites').textContent = criticalData.total || 0;

        // 2. Resolved this month (Mock/Estimate from 'resolved' status total)
        // Ideally API needs a date filter for reliable monthly stats
        const resolvedData = await apiGet('/api/admin/dump-reports?status=resolved');
        document.getElementById('resolvedIssues').textContent = resolvedData.total || 0;

        // 3. Score - Mock for now
        document.getElementById('complianceScore').textContent = 'Active';

        // Load visual widgets data
        // For severity breakdown
        const allReports = await apiGet('/api/admin/dump-reports?limit=100'); // Get sample
        if (allReports.reports) {
            renderSeverityWidget(allReports.reports);
        }

    } catch (e) {
        console.error('Error loading compliance stats', e);
    }
}

async function loadPrioritySites() {
    try {
        // High, Critical & Pending/Investigating
        const data = await apiGet('/api/admin/dump-reports?status=pending&limit=10'); // Simplification
        const tbody = document.getElementById('prioritySitesBody');

        if (!data.reports || data.reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No priority sites pending</td></tr>';
            return;
        }

        // Filter client side for higher severity if needed, or rely on API sort?
        // Let's just show what we got
        tbody.innerHTML = data.reports.map(r => `
            <tr>
                <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                <td>${r.location}</td>
                <td>${r.county}</td>
                <td><span class="status-badge status-${r.status}">${r.status}</span></td>
                <td><span class="severity-badge severity-${r.severity}">${r.severity}</span></td>
                <td><a href="dump-reports.html?id=${r._id}" class="btn-small">Investigate</a></td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('Error loading priority sites', e);
        document.getElementById('prioritySitesBody').innerHTML = '<tr><td colspan="6" class="text-center">Error loading data</td></tr>';
    }
}

function renderSeverityWidget(reports) {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    reports.forEach(r => {
        if (counts[r.severity] !== undefined) counts[r.severity]++;
    });

    const html = Object.keys(counts).map(k => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="text-transform: capitalize;">${k}</span>
            <span class="badge ${k === 'critical' ? 'danger' : k === 'high' ? 'warning' : 'primary'}">${counts[k]}</span>
        </div>
    `).join('');

    document.getElementById('severityWidget').innerHTML = html;
}
