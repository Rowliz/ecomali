/**
 * Eco-Mali Exchange Limited - Authentication JavaScript
 * Auth talks to the same API as the rest of the app (js/api.js).
 * We reuse apiPost from js/api.js so it works on any host/domain.
 */



(function () {
    'use strict';
    // Supabase removed
    // State management
    let currentForm = 'login'; // Default to login form
    let isSubmitting = false;

    /**
     * Initialize authentication functionality
     */
    function init() {
        // Check URL hash or parameter to determine which form to show
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash;

        if (urlParams.get('mode') === 'login' || hash === '#login') {
            currentForm = 'login';
            showLoginForm();
        } else if (urlParams.get('mode') === 'signup' || hash === '#signup') {
            currentForm = 'signup';
            showSignupForm();
        } else if (urlParams.get('mode') === 'forgot-password' || hash === '#forgot-password') {
            currentForm = 'forgot';
            showForgotPasswordForm();
        } else if (urlParams.get('mode') === 'reset-password' || hash === '#reset-password') {
            currentForm = 'reset';
            showResetPasswordForm();
        } else {
            // Default to login form
            showLoginForm();
        }

        setupFormSwitching();
        setupPasswordToggle();
        setupPasswordStrength();
        setupFormValidation();
        setupSocialAuth();
        setupFormSubmission();
        setupAccessibility();
    }

    function hideAllForms() {
        const forms = ['loginForm', 'signupForm', 'forgotPasswordForm', 'resetPasswordForm'];
        forms.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
        });
    }

    function showLoginForm() {
        hideAllForms();
        const loginForm = document.getElementById('loginForm');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');

        if (loginForm) {
            loginForm.classList.add('active');
            currentForm = 'login';
            if (authTitle) authTitle.textContent = 'Welcome Back';
            if (authSubtitle) authSubtitle.textContent = 'Sign in to your account to continue';
        }
    }

    function showSignupForm() {
        hideAllForms();
        const signupForm = document.getElementById('signupForm');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');

        if (signupForm) {
            signupForm.classList.add('active');
            currentForm = 'signup';
            if (authTitle) authTitle.textContent = 'Create Account';
            if (authSubtitle) authSubtitle.textContent = 'Join Eco-Mali Exchange and start making an impact';
        }
    }

    function showForgotPasswordForm() {
        hideAllForms();
        const forgotForm = document.getElementById('forgotPasswordForm');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');

        if (forgotForm) {
            forgotForm.classList.add('active');
            currentForm = 'forgot';
            if (authTitle) authTitle.textContent = 'Reset Password';
            if (authSubtitle) authSubtitle.textContent = 'Enter your email to receive a reset link';
        }
    }

    function showResetPasswordForm() {
        hideAllForms();
        const resetForm = document.getElementById('resetPasswordForm');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');

        if (resetForm) {
            resetForm.classList.add('active');
            currentForm = 'reset';
            if (authTitle) authTitle.textContent = 'Set New Password';
            if (authSubtitle) authSubtitle.textContent = 'Choose a strong password for your account';
        }
    }

    /**
     * Form switching between login and signup
     */
    function setupFormSwitching() {
        const switchToSignup = document.getElementById('switchToSignup');
        const switchToLogin = document.getElementById('switchToLogin');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        // Forgot password switching
        const forgotLink = document.querySelector('.forgot-link');
        const backToLogin = document.getElementById('backToLogin');

        if (switchToSignup) {
            switchToSignup.addEventListener('click', () => {
                showSignupForm();
                clearMessages();
                signupForm.reset();
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                showLoginForm();
                clearMessages();
                loginForm.reset();
            });
        }

        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                showForgotPasswordForm();
                clearMessages();
            });
        }

        if (backToLogin) {
            backToLogin.addEventListener('click', () => {
                showLoginForm();
                clearMessages();
            });
        }
    }

    /**
     * Password visibility toggle
     */
    function setupPasswordToggle() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', function () {
                const input = this.parentElement.querySelector('input[type="password"], input[type="text"]');
                if (!input) return;

                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';

                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }

                this.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            });
        });
    }

    /**
     * Real-time password strength indicator
     */
    function setupPasswordStrength() {
        const passwordInput = document.getElementById('signupPassword');
        if (!passwordInput) return;

        passwordInput.addEventListener('input', function () {
            const password = this.value;
            checkPasswordStrength(password);
        });
    }

    function checkPasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        const requirements = document.querySelectorAll('.password-requirements li');

        if (!strengthFill || !strengthText) return;

        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Update requirement indicators
        requirements.forEach(req => {
            const requirement = req.getAttribute('data-requirement');
            if (checks[requirement]) {
                req.classList.add('valid');
            } else {
                req.classList.remove('valid');
            }
        });

        // Calculate strength
        const score = Object.values(checks).filter(Boolean).length;
        strengthFill.className = 'strength-fill';

        if (password.length === 0) {
            strengthText.textContent = 'Password strength';
            return;
        }

        if (score <= 2) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak password';
            strengthText.style.color = 'var(--error)';
        } else if (score <= 4) {
            strengthFill.classList.add('medium');
            strengthText.textContent = 'Medium strength';
            strengthText.style.color = 'var(--warning)';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong password';
            strengthText.style.color = 'var(--success)';
        }
    }

    /**
     * Real-time form validation
     */
    function setupFormValidation() {
        // Email validation
        const emailInput = document.getElementById('signupEmail');
        if (emailInput) {
            emailInput.addEventListener('blur', function () {
                validateEmail(this);
            });
        }

        // Username validation
        const usernameInput = document.getElementById('signupUsername');
        if (usernameInput) {
            usernameInput.addEventListener('blur', function () {
                validateUsername(this);
            });
        }
    }

    function validateEmail(input) {
        const feedback = document.getElementById('emailFeedback');
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!feedback) return;

        if (email.length === 0) {
            feedback.textContent = '';
            feedback.className = 'input-feedback';
            return;
        }

        if (emailRegex.test(email)) {
            feedback.textContent = '✓ Valid email address';
            feedback.className = 'input-feedback success';
        } else {
            feedback.textContent = '✗ Please enter a valid email address';
            feedback.className = 'input-feedback error';
        }
    }

    function validateUsername(input) {
        const feedback = document.getElementById('usernameFeedback');
        const username = input.value.trim();
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

        if (!feedback) return;

        if (username.length === 0) {
            feedback.textContent = '';
            feedback.className = 'input-feedback';
            return;
        }

        if (username.length < 3) {
            feedback.textContent = '✗ Username must be at least 3 characters';
            feedback.className = 'input-feedback error';
        } else if (username.length > 20) {
            feedback.textContent = '✗ Username must be less than 20 characters';
            feedback.className = 'input-feedback error';
        } else if (!usernameRegex.test(username)) {
            feedback.textContent = '✗ Username can only contain letters, numbers, and underscores';
            feedback.className = 'input-feedback error';
        } else {
            feedback.textContent = '✓ Username available';
            feedback.className = 'input-feedback success';
        }
    }

    /**
     * Social authentication handlers
     */
    function setupSocialAuth() {
        document.querySelectorAll('.btn-social').forEach(btn => {
            btn.addEventListener('click', function () {
                const provider = this.getAttribute('data-provider');
                handleSocialAuth(provider);
            });
        });
    }

    async function handleSocialAuth(provider) {
        try {
            showMessage('loginMessage', `Connecting to ${provider}...`, 'info');

            // In production, this would redirect to OAuth provider
            // For now, we'll simulate the flow
            const providers = {
                google: {
                    name: 'Google',
                    url: '/api/auth/google',
                    color: '#DB4437'
                },
                facebook: {
                    name: 'Facebook',
                    url: '/api/auth/facebook',
                    color: '#4267B2'
                },
                microsoft: {
                    name: 'Microsoft',
                    url: '/api/auth/microsoft',
                    color: '#00A4EF'
                }
            };

            const providerInfo = providers[provider];
            if (!providerInfo) {
                throw new Error('Unknown provider');
            }

            // Redirect to OAuth endpoint
            // In production, this would be:
            // window.location.href = providerInfo.url;

            // For demo purposes, show a message
            showMessage('loginMessage',
                `${providerInfo.name} authentication will be available soon. Please use email/password for now.`,
                'info'
            );

        } catch (error) {
            showMessage('loginMessage', `Failed to connect with ${provider}. Please try again.`, 'error');
            console.error('Social auth error:', error);
        }
    }

    /**
     * Form submission handlers
     */
    function setupFormSubmission() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const forgotForm = document.getElementById('forgotPasswordForm');
        const resetForm = document.getElementById('resetPasswordForm');

        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        if (signupForm) {
            signupForm.addEventListener('submit', handleSignup);
        }

        if (forgotForm) {
            forgotForm.addEventListener('submit', handleForgotPassword);
        }

        if (resetForm) {
            resetForm.addEventListener('submit', handleResetPassword);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        if (isSubmitting) return;

        const form = e.target;
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData);
        const submitBtn = form.querySelector('.btn-auth');

        // Accept both 'email' and 'username' as the email field (for compatibility with form)
        const email = (payload.email || payload.username || '').toString().trim();
        const password = (payload.password || '').toString();

        if (email.length === 0 || password.length === 0) {
            showMessage('loginMessage', 'Please enter both email and password.', 'error');
            return;
        }

        try {
            isSubmitting = true;
            setButtonLoading(submitBtn, true);
            showMessage('loginMessage', 'Signing you in...', 'info');
            // Use server-side login API
            const result = await apiPost('/api/auth/login', { email, password });
            if (!result || !result.token) {
                throw new Error(result.message || 'Login failed. No token received.');
            }
            localStorage.setItem('token', result.token);
            const userRole = result.user?.role || result.role || 'user';
            localStorage.setItem('userRole', userRole);
            const permissions = result.user?.permissions || [];
            localStorage.setItem('userPermissions', JSON.stringify(permissions));
            showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                const params = new URLSearchParams(window.location.search);
                let returnTo = params.get('returnTo');

                // Safety check: Don't redirect back to auth pages or outside domains
                if (returnTo) {
                    const isAuthPage = returnTo.includes('auth.html') || returnTo.includes('login.html');
                    const isRelative = returnTo.startsWith('/') && !returnTo.startsWith('//');
                    if (isAuthPage || !isRelative) {
                        returnTo = null;
                    }
                }

                if (returnTo) {
                    window.location.href = returnTo;
                } else {
                    redirectUser(userRole);
                }
            }, 400);
        } catch (error) {
            let msg = 'Login failed. Please try again.';
            if (typeof error === 'string') {
                msg = error;
            } else if (error && typeof error === 'object') {
                msg = error.message || error.error || error.details || error.reason || msg;
            }
            showMessage('loginMessage', msg, 'error');
        } finally {
            isSubmitting = false;
            setButtonLoading(submitBtn, false);
        }
    }
    async function handleSignup(e) {
        e.preventDefault();
        if (isSubmitting) return;

        const form = e.target;
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData);
        const submitBtn = form.querySelector('.btn-auth');

        try {
            isSubmitting = true;
            setButtonLoading(submitBtn, true);
            showMessage('signupMessage', 'Creating your account...', 'info');
            // Use server-side signup API
            const result = await apiPost('/api/auth/register', payload);
            if (!result || !result.token) {
                // Backend returns { token, user } on success, or { error } on failure
                throw new Error(result.message || 'Signup failed.');
            }
            showMessage('signupMessage', 'Signup successful! Please log in.', 'success');
            setTimeout(() => {
                window.location.href = '/auth.html?mode=login';
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);
            let msg = error.message;
            if (msg && msg.includes("security purposes")) {
                msg = "Too many attempts. Please wait a minute before trying again.";
            }
            showMessage('signupMessage', msg, 'error');
        } finally {
            isSubmitting = false;
            setButtonLoading(submitBtn, false);
        }
    }

    async function handleForgotPassword(e) {
        e.preventDefault();
        if (isSubmitting) return;

        const form = e.target;
        const submitBtn = form.querySelector('.btn-auth');
        const emailInput = document.getElementById('forgotEmail');
        const email = emailInput.value.trim();

        if (!email) {
            showMessage('forgotMessage', 'Please enter your email address.', 'error');
            return;
        }

        try {
            isSubmitting = true;
            setButtonLoading(submitBtn, true);
            showMessage('forgotMessage', 'Sending reset link...', 'info');

            // Backend endpoint
            const result = await apiPost('/api/auth/forgot-password', { email });

            // Show the token if provided (Dev Mode)
            let msg = result.message || 'Check your email for the reset link.';
            if (result.debug_token) {
                msg += ` TOKEN: ${result.debug_token}`;
            }

            showMessage('forgotMessage', msg, 'success');
            form.reset();

        } catch (error) {
            let msg = 'Request failed. Please try again.';
            if (error && error.error) msg = error.error;
            showMessage('forgotMessage', msg, 'error');
        } finally {
            isSubmitting = false;
            setButtonLoading(submitBtn, false);
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();
        if (isSubmitting) return;

        const form = e.target;
        const submitBtn = form.querySelector('.btn-auth');
        const token = document.getElementById('resetToken').value.trim();
        const newPassword = document.getElementById('newPassword').value;

        if (!token || !newPassword) {
            showMessage('resetMessage', 'Token and new password match are required.', 'error');
            return;
        }

        try {
            isSubmitting = true;
            setButtonLoading(submitBtn, true);
            showMessage('resetMessage', 'Resetting password...', 'info');

            const result = await apiPost('/api/auth/reset-password', { token, newPassword });

            if (result.token) {
                // Auto-login successful
                localStorage.setItem('token', result.token);
                const userRole = result.user?.role || result.role || 'user';
                localStorage.setItem('userRole', userRole);
                const permissions = result.user?.permissions || [];
                localStorage.setItem('userPermissions', JSON.stringify(permissions));

                showMessage('resetMessage', 'Password reset successful! Logging you in...', 'success');
                setTimeout(() => {
                    redirectUser(userRole);
                }, 1000);
            } else {
                showMessage('resetMessage', result.message || 'Password reset successful! Redirecting to login...', 'success');

                setTimeout(() => {
                    showLoginForm();
                    showMessage('loginMessage', 'Please login with your new password.', 'success');
                }, 2000);
            }

        } catch (error) {
            let msg = 'Reset failed. Please try again.';
            if (error && error.error) msg = error.error;
            showMessage('resetMessage', msg, 'error');
        } finally {
            isSubmitting = false;
            setButtonLoading(submitBtn, false);
        }
    }

    /**
     * Utility functions
     */
    function isStrongPassword(password) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(password);
    }

    function showMessage(elementId, message, type = 'info') {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.textContent = message;
        element.className = `form-message show ${type}`;
        element.setAttribute('role', 'alert');
    }

    function clearMessages() {
        document.querySelectorAll('.form-message').forEach(el => {
            el.textContent = '';
            el.className = 'form-message';
            el.removeAttribute('role');
        });
    }

    function setButtonLoading(button, loading) {
        if (!button) return;

        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    function redirectUser(role) {
        const normalizedRole = role ? role.toString().trim().toLowerCase() : '';
        console.log('Redirecting user with role:', normalizedRole);
        const redirects = {
            admin: '/admin/dashboard.html',
            super_admin: '/admin/dashboard.html',
            operations_admin: '/admin/dashboard-operations.html',
            finance_admin: '/admin/dashboard-finance.html',
            compliance_admin: '/admin/dashboard-compliance.html',
            support_admin: '/admin/dashboard-support.html',
            tech_admin: '/admin/dashboard-tech.html',
            county_admin: '/admin/dashboard-county.html',
            county_agent: '/admin/dashboard-county.html', // Alias
            moderator: '/admin/dashboard.html',
            recycler: '/portal/recycler/dashboard.html',
            generator: '/portal/generator/dashboard.html',
            partner: '/portal/partners/dashboard.html',
            volunteer: '/portal/volunteer/dashboard.html',
            county: '/admin/dashboard-county.html', // Legacy support
            member: '/portal/generator/dashboard.html'
        };

        const redirect = redirects[normalizedRole] || '/portal/generator/dashboard.html';
        console.log('Redirect URL:', redirect);
        window.location.href = redirect;
    }

    /**
     * Accessibility enhancements
     */
    function setupAccessibility() {
        // Focus management
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', function () {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function () {
                this.parentElement.classList.remove('focused');
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                clearMessages();
            }
        });
    }

    // Initialize when DOM is ready
    // Initialize when DOM is ready (Supabase removed)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export functions for external use
    window.auth = {
        logout: function () {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/auth.html';
        },
        isAuthenticated: function () {
            return !!localStorage.getItem('token');
        },
        getToken: function () {
            return localStorage.getItem('token');
        },
        getUserRole: function () {
            return localStorage.getItem('userRole');
        }
    };

})();