// Admin Users Management JavaScript

let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
let usersPerPage = 20;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
    setupSidebar();
    setupCreateUserForm();
});

// Check admin access
async function checkAdminAccess() {
    try {
        const response = await apiGet('/api/auth/me');
        if (!response || !response.user) {
            window.location.href = '/admin/login.html';
            return;
        }

        if (response.user.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/index.html';
            return;
        }

        document.getElementById('adminName').textContent = response.user.name || 'Admin';
    } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = '/admin/login.html';
    }
}

// Load users
async function loadUsers(role = '') {
    try {
        showLoading();
        const params = new URLSearchParams({ limit: '1000' });
        if (role) params.append('role', role);
        const data = await apiGet(`/api/admin/users?${params.toString()}`);
        allUsers = data.users || [];
        filteredUsers = [...allUsers];
        updateStats();
        // Apply status filter after fetching role-filtered data
        applyFilters();
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users');
    }
}

// Update statistics
function updateStats() {
    const total = allUsers.length;
    const active = allUsers.filter(u => u.status === 'active').length;
    const recyclers = allUsers.filter(u => u.role === 'recycler').length;
    const generators = allUsers.filter(u => u.role === 'generator').length;

    document.getElementById('totalUsers').textContent = total;
    document.getElementById('activeUsers').textContent = active;
    document.getElementById('recyclerCount').textContent = recyclers;
    document.getElementById('generatorCount').textContent = generators;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchUsers').addEventListener('input', handleSearch);
    document.getElementById('roleFilter').addEventListener('change', async (e) => {
        const role = e.target.value || '';
        await loadUsers(role);
    });
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('editUserForm').addEventListener('submit', handleEditSubmit);
}

// Create user form handler
function setupCreateUserForm() {
    const form = document.getElementById('createUserForm');
    if (!form) return;

    // Dynamically inject admin roles if Super Admin
    if (window.hasRole && window.hasRole('super_admin')) {
        const roleSelect = document.getElementById('createUserRole');
        // Check if admin options already exist to avoid duplicates if re-run
        if (!roleSelect.querySelector('option[value="finance_admin"]')) {
            const adminRoles = [
                { val: 'finance_admin', label: 'Finance Admin' },
                { val: 'operations_admin', label: 'Operations Admin' },
                { val: 'compliance_admin', label: 'Compliance Admin' },
                { val: 'tech_admin', label: 'Tech Admin' },
                { val: 'support_admin', label: 'Support Admin' },
                { val: 'county_admin', label: 'County Admin' },
                { val: 'super_admin', label: 'Super Admin' },
                { val: 'admin', label: 'General Admin' }
            ];

            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '── Administration ──';
            roleSelect.appendChild(separator);

            adminRoles.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.val;
                opt.textContent = r.label;
                roleSelect.appendChild(opt);
            });
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('createUserName').value.trim();
        const email = document.getElementById('createUserEmail').value.trim();
        const username = document.getElementById('createUserUsername').value.trim();
        const password = document.getElementById('createUserPassword').value;
        const role = document.getElementById('createUserRole').value;

        try {
            await apiPost('/api/admin/users', { name, email, username, password, role });
            showNotification('User created successfully!', 'success');
            closeCreateUserModal();
            loadUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            showNotification(error.error || 'Failed to create user', 'error');
        }
    });
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (query === '') {
        filteredUsers = [...allUsers];
    } else {
        filteredUsers = allUsers.filter(user => {
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const username = (user.username || '').toLowerCase();
            return name.includes(query) || email.includes(query) || username.includes(query);
        });
    }

    applyFilters();
}

// Apply filters
function applyFilters() {
    const role = document.getElementById('roleFilter').value;
    const status = document.getElementById('statusFilter').value;

    let results = [...filteredUsers];

    if (role) {
        results = results.filter(u => u.role === role);
    }

    if (status) {
        results = results.filter(u => u.status === status);
    }

    filteredUsers = results;
    currentPage = 1;
    displayUsers();
}

// Display users
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
        updatePagination();
        return;
    }

    const start = (currentPage - 1) * usersPerPage;
    const end = start + usersPerPage;
    const pageUsers = filteredUsers.slice(start, end);

    tbody.innerHTML = pageUsers.map(user => `
        <tr>
            <td>${escapeHtml(user.name || 'N/A')}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.username || '-')}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td><span class="status-badge ${user.status || 'active'}">${user.status || 'active'}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-view" onclick="viewUser('${user._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-small btn-edit" onclick="editUser('${user._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${user.status === 'active' ?
            `<button class="btn-small btn-delete" onclick="suspendUser('${user._id}')">
                            <i class="fas fa-ban"></i> Suspend
                        </button>` :
            `<button class="btn-small btn-activate" onclick="activateUser('${user._id}')">
                            <i class="fas fa-check"></i> Activate
                        </button>`
        }
                </div>
            </td>
        </tr>
    `).join('');

    updatePagination();
}

// View user details
function viewUser(userId) {
    const user = allUsers.find(u => u._id === userId);
    if (!user) return;

    const modal = document.getElementById('userDetailModal');
    const body = document.getElementById('userDetailBody');

    body.innerHTML = `
        <div class="user-detail-grid">
            <div class="user-detail-item">
                <span class="user-detail-label">Name</span>
                <span class="user-detail-value">${escapeHtml(user.name || 'N/A')}</span>
            </div>
            <div class="user-detail-item">
                <span class="user-detail-label">Email</span>
                <span class="user-detail-value">${escapeHtml(user.email)}</span>
            </div>
            <div class="user-detail-item">
                <span class="user-detail-label">Username</span>
                <span class="user-detail-value">${escapeHtml(user.username || '-')}</span>
            </div>
            <div class="user-detail-item">
                <span class="user-detail-label">Role</span>
                <span class="user-detail-value"><span class="role-badge ${user.role}">${user.role}</span></span>
            </div>
            <div class="user-detail-item">
                <span class="user-detail-label">Status</span>
                <span class="user-detail-value"><span class="status-badge ${user.status || 'active'}">${user.status || 'active'}</span></span>
            </div>
            <div class="user-detail-item">
                <span class="user-detail-label">Joined</span>
                <span class="user-detail-value">${new Date(user.createdAt).toLocaleString()}</span>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Edit user
function editUser(userId) {
    const user = allUsers.find(u => u._id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = user._id;
    document.getElementById('editUserName').value = user.name || '';
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserStatus').value = user.status || 'active';

    document.getElementById('editUserModal').classList.add('active');
}

// Handle edit submit
async function handleEditSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const role = document.getElementById('editUserRole').value;
    const status = document.getElementById('editUserStatus').value;

    try {
        // Note: You'll need to add a PATCH /api/admin/users/:id endpoint to the backend
        await apiPatch(`/api/admin/users/${userId}`, { name, email, role, status });
        showNotification('User updated successfully!', 'success');
        closeEditModal();
        loadUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification(error.error || 'Failed to update user', 'error');
    }
}

// Suspend user
async function suspendUser(userId) {
    if (!confirm('Are you sure you want to suspend this user?')) return;

    try {
        await apiPatch(`/api/admin/users/${userId}`, { status: 'suspended' });
        showNotification('User suspended', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error suspending user:', error);
        showNotification(error.error || 'Failed to suspend user', 'error');
    }
}

// Activate user
async function activateUser(userId) {
    try {
        await apiPatch(`/api/admin/users/${userId}`, { status: 'active' });
        showNotification('User activated', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error activating user:', error);
        showNotification(error.error || 'Failed to activate user', 'error');
    }
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
        <i class="fas fa-chevron-left"></i> Previous
    </button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span>...</span>';
        }
    }

    // Next button
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
        Next <i class="fas fa-chevron-right"></i>
    </button>`;

    pagination.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    displayUsers();
}

// Close modals
function closeUserModal() {
    document.getElementById('userDetailModal').classList.remove('active');
}

function closeEditModal() {
    document.getElementById('editUserModal').classList.remove('active');
}

// Setup sidebar toggle
function setupSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');

    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// Utility functions
function showLoading() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading users...</td></tr>';
}

function showError(message) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: #f44336;">${escapeHtml(message)}</td></tr>`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.viewUser = viewUser;
window.editUser = editUser;
window.suspendUser = suspendUser;
window.activateUser = activateUser;
window.changePage = changePage;
window.closeUserModal = closeUserModal;
window.closeEditModal = closeEditModal;
// Create user modal controls are defined inline in users.html
