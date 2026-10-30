// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on login page or dashboard
    if (document.querySelector('.admin-login-page')) {
        setupAdminLogin();
    } else if (document.querySelector('.admin-dashboard')) {
        setupAdminDashboard();
    }
});

// Admin Login Page
function setupAdminLogin() {
    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Show loading
            const submitBtn = this.querySelector('.btn-login');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            submitBtn.disabled = true;
            
            try {
                // Simulate authentication
                await authenticateAdmin(username, password);
                
                // Redirect to dashboard
                window.location.href = '/admin/dashboard.html';
                
            } catch (error) {
                // Show error
                showLoginError(error.message);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Forgot password modal
    const forgotLink = document.querySelector('.forgot-password');
    const forgotModal = document.getElementById('forgotPasswordModal');
    
    if (forgotLink && forgotModal) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(forgotModal);
        });
    }
    
    // Close modal
    const closeBtns = document.querySelectorAll('.modal-close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Forgot password form
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate password reset
            setTimeout(() => {
                alert(`Password reset link sent to ${email}. Check your email.`);
                closeModal(forgotModal);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                forgotForm.reset();
            }, 1500);
        });
    }
}

async function authenticateAdmin(username, password) {
    try {
        // Use the real API authentication on the backend
        const response = await apiPost('/api/auth/login', { username, password });
        
        if (response && response.token) {
            const normalizedRole = response.user?.role ? response.user.role.toString().trim().toLowerCase() : '';
            
            // Allow admin roles: admin, super_admin, moderator
            const allowedAdminRoles = ['admin', 'super_admin', 'moderator'];
            console.log('[Admin Auth] Role check:', normalizedRole, 'Allowed:', allowedAdminRoles);
            if (!allowedAdminRoles.includes(normalizedRole)) {
                throw new Error('Access denied. Admin privileges required.');
            }

            // Store token and user info with normalized role + admin flags
            localStorage.setItem('token', response.token);
            localStorage.setItem('userRole', normalizedRole);
            localStorage.setItem('userInfo', JSON.stringify(response.user));
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', response.user.username || response.user.email || '');
            
            console.log('[Admin Auth] Stored credentials:', {
                token: response.token ? 'present' : 'missing',
                userRole: normalizedRole,
                adminLoggedIn: 'true'
            });
            
            return {
                success: true,
                token: response.token,
                user: response.user
            };
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        // Handle API errors
        if (error.error) {
            throw new Error(error.error);
        }
        throw new Error('Authentication failed. Please check your credentials.');
    }
}

function showLoginError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fas fa-exclamation-triangle"></i>
            <h4 style="margin: 0; font-size: 1rem;">Login Failed</h4>
        </div>
        <p style="margin: 0; font-size: 0.9rem;">${message}</p>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Admin Dashboard
function setupAdminDashboard() {
    // Check login state
    checkAdminLogin();
    
    // Setup sidebar toggle
    setupSidebar();
    
    // Setup user menu
    setupUserMenu();
    
    // Setup notification bell
    setupNotifications();
    
    // Setup quick actions dropdown
    setupQuickActions();
    
    // Setup dashboard charts (if on dashboard)
    if (document.querySelector('.dashboard-content')) {
        setupDashboardCharts();
    }
    
    // Setup real-time updates
    setupRealTimeUpdates();
}

async function checkAdminLogin() {
    // Check if user has valid token and is admin
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    
    console.log('[Admin Check] Checking login:', {
        hasToken: !!token,
        storedRole: storedRole,
        adminLoggedIn: adminLoggedIn
    });
    
    if (!token) {
        console.log('[Admin Check] No token, redirecting to login');
        window.location.href = '/admin/login.html';
        return;
    }
    
    // Validate admin role from stored role (token response)
    const normalizedRole = (storedRole || '').toString().trim().toLowerCase();
    const allowedAdminRoles = ['admin', 'super_admin', 'moderator'];
    
    if (!allowedAdminRoles.includes(normalizedRole)) {
        console.log('[Admin Check] Role not allowed:', normalizedRole);
        window.location.href = '/admin/login.html';
        return;
    }
    
    if (!adminLoggedIn || adminLoggedIn !== 'true') {
        console.log('[Admin Check] adminLoggedIn not true:', adminLoggedIn);
        window.location.href = '/admin/login.html';
        return;
    }
    
    console.log('[Admin Check] Access granted for role:', normalizedRole);
    
    // Update username display
    const username = localStorage.getItem('adminUsername');
    const userElements = document.querySelectorAll('.user-profile h4, .user-info h4');
    userElements.forEach(el => {
        if (el.textContent === 'Admin User') {
            el.textContent = username || 'Admin User';
        }
    });
}

function setupSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const adminSidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && adminSidebar) {
        sidebarToggle.addEventListener('click', function() {
            adminSidebar.classList.toggle('open');
        });
    }
    
    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992 && adminSidebar && adminSidebar.classList.contains('open')) {
            if (!e.target.closest('.admin-sidebar') && !e.target.closest('.sidebar-toggle')) {
                adminSidebar.classList.remove('open');
            }
        }
    });
}

function setupUserMenu() {
    const userMenu = document.querySelector('.user-menu img');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', function() {
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-menu')) {
                userDropdown.style.display = 'none';
            }
        });
    }
    
    // Logout functionality
    const logoutLinks = document.querySelectorAll('.logout-link, .btn-logout');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logoutAdmin();
        });
    });
}

function logoutAdmin() {
    // Clear login state
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    
    // Redirect to login
    window.location.href = 'login.html';
}

function setupNotifications() {
    const notificationBtn = document.querySelector('.btn-notification');
    const markAllReadBtn = document.querySelector('.mark-all-read');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            // In real app, this would show notifications dropdown
            console.log('Notifications clicked');
            
            // Mark as read
            const badge = this.querySelector('.notification-badge');
            if (badge) {
                badge.style.display = 'none';
            }
        });
    }
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            const unreadItems = document.querySelectorAll('.notification-item.unread');
            unreadItems.forEach(item => {
                item.classList.remove('unread');
            });
            
            // Update badge count
            const badges = document.querySelectorAll('.notification-badge');
            badges.forEach(badge => {
                badge.style.display = 'none';
            });
        });
    }
}

function setupQuickActions() {
    const quickActionBtns = document.querySelectorAll('.notification-action, .btn-action');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // In real app, this would show action menu
            const item = this.closest('.notification-item, tr');
            console.log('Action clicked for:', item);
            
            // Show action menu
            showActionMenu(this, item);
        });
    });
}

function showActionMenu(button, item) {
    // Create action menu
    const menu = document.createElement('div');
    menu.className = 'action-menu';
    menu.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #eee;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        min-width: 150px;
        z-index: 1000;
    `;
    
    const actions = [
        { icon: 'fa-eye', text: 'View Details' },
        { icon: 'fa-edit', text: 'Edit' },
        { icon: 'fa-trash', text: 'Delete' },
        { icon: 'fa-ban', text: 'Disable' }
    ];
    
    menu.innerHTML = actions.map(action => `
        <button class="action-menu-item" data-action="${action.text.toLowerCase()}">
            <i class="fas ${action.icon}"></i> ${action.text}
        </button>
    `).join('');
    
    // Position menu near button
    const rect = button.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    
    document.body.appendChild(menu);
    
    // Handle menu item clicks
    menu.addEventListener('click', function(e) {
        if (e.target.classList.contains('action-menu-item')) {
            const action = e.target.getAttribute('data-action');
            handleAction(action, item);
            menu.remove();
        }
    });
    
    // Close menu when clicking outside
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== button) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    });
}

function handleAction(action, item) {
    const itemType = item.classList.contains('notification-item') ? 'notification' : 'user';
    
    switch(action) {
        case 'view details':
            console.log(`Viewing ${itemType} details`);
            break;
        case 'edit':
            console.log(`Editing ${itemType}`);
            break;
        case 'delete':
            if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
                item.style.opacity = '0.5';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
            break;
        case 'disable':
            console.log(`Disabling ${itemType}`);
            break;
    }
}

function setupDashboardCharts() {
    // Waste Collection Chart
    const wasteCtx = document.getElementById('wasteChart');
    if (wasteCtx) {
        new Chart(wasteCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Plastic (kg)',
                        data: [320, 450, 380, 520],
                        borderColor: '#2E7D32',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Paper (kg)',
                        data: [180, 220, 250, 300],
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'E-Waste (kg)',
                        data: [45, 60, 55, 80],
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Kilograms'
                        }
                    }
                }
            }
        });
    }
    
    // User Growth Chart
    const userCtx = document.getElementById('userChart');
    if (userCtx) {
        new Chart(userCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'New Users',
                        data: [25, 40, 35, 50, 45, 60],
                        backgroundColor: '#2E7D32',
                        borderRadius: 5
                    },
                    {
                        label: 'Active Users',
                        data: [20, 35, 30, 45, 40, 55],
                        backgroundColor: '#4CAF50',
                        borderRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Users'
                        }
                    }
                }
            }
        });
    }
}

function setupRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(() => {
        updateLiveStats();
    }, 30000);
    
    // Simulate real-time notifications
    simulateRealTimeNotifications();
}

function updateLiveStats() {
    // Update user count
    const userStat = document.querySelector('.stat-card:nth-child(1) h3');
    if (userStat) {
        const current = parseInt(userStat.textContent);
        const increment = Math.floor(Math.random() * 3);
        userStat.textContent = current + increment;
    }
    
    // Update transaction count
    const transStat = document.querySelector('.stat-card:nth-child(4) h3');
    if (transStat) {
        const current = parseInt(transStat.textContent);
        const increment = Math.floor(Math.random() * 5);
        transStat.textContent = current + increment;
    }
    
    // Update active users
    const activeUsers = document.querySelector('.indicator.online').nextElementSibling;
    if (activeUsers) {
        const current = parseInt(activeUsers.textContent);
        const newCount = Math.max(1, current + Math.floor(Math.random() * 3) - 1);
        activeUsers.textContent = newCount + ' users';
    }
}

function simulateRealTimeNotifications() {
    // Add new notification every 2-5 minutes
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance
            addNewNotification();
        }
    }, 120000 + Math.random() * 180000); // 2-5 minutes
}

function addNewNotification() {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    const notifications = [
        {
            icon: 'fa-user-plus',
            title: 'New Registration',
            message: 'New member registered in the system',
            time: 'Just now'
        },
        {
            icon: 'fa-trash',
            title: 'Waste Report',
            message: 'New waste report submitted from community',
            time: 'Just now'
        },
        {
            icon: 'fa-exchange-alt',
            title: 'Transaction',
            message: 'New waste transaction completed',
            time: 'Just now'
        },
        {
            icon: 'fa-exclamation-triangle',
            title: 'System Alert',
            message: 'High traffic detected on platform',
            time: 'Just now'
        }
    ];
    
    const notification = notifications[Math.floor(Math.random() * notifications.length)];
    
    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-item unread';
    notificationItem.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${notification.icon}"></i>
        </div>
        <div class="notification-content">
            <h4>${notification.title}</h4>
            <p>${notification.message}</p>
            <span class="notification-time">${notification.time}</span>
        </div>
        <button class="notification-action">
            <i class="fas fa-ellipsis-v"></i>
        </button>
    `;
    
    notificationsList.insertBefore(notificationItem, notificationsList.firstChild);
    
    // Update badge count
    const badges = document.querySelectorAll('.notification-badge');
    badges.forEach(badge => {
        let count = parseInt(badge.textContent) || 0;
        count++;
        badge.textContent = count;
        badge.style.display = 'flex';
    });
    
    // Show desktop notification (if supported)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Eco-Mali Admin: ${notification.title}`, {
            body: notification.message,
            icon: '../images/logo.png'
        });
    }
}

// Request notification permission on page load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Export functions for use in other admin pages
window.adminLogout = logoutAdmin;
window.updateAdminStats = updateLiveStats;