/**
 * ============================================
 * Eco-Mali Exchange Limited - Main JavaScript
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // Configuration
    // ============================================
    const CONFIG = {
        scrollThreshold: 50,
        counterSpeed: 200,
        debounceDelay: 250,
        animationDuration: 500
    };

    // ============================================
    // Initialize on DOM Ready
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        try {
            initMobileMenu();
            initNavbarScroll();
            initAnimatedCounters();
            initSmoothScrolling();
            initAccessibility();
            initLogout();
            
            console.log('✓ Eco-Mali Exchange initialized successfully');
        } catch (error) {
            console.error('✗ Error initializing main functionality:', error);
            // Send to error tracking service in production
            if (window.Sentry) {
                Sentry.captureException(error);
            }
        }
    });

    /**
     * Mobile Menu Toggle with Accessibility
     */
    function initMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!hamburger || !navMenu) return;
        
        hamburger.addEventListener('click', function() {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', !isExpanded);
            
            // Prevent body scroll when menu is open
            if (!isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !hamburger.contains(event.target)) {
                if (navMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                hamburger.focus();
            }
        });
    }

    /**
     * Navbar scroll effect
     */
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        let lastScroll = 0;
        const scrollThreshold = 50;
        
        function handleScroll() {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            if (currentScroll > scrollThreshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }
        
        // Throttle scroll events for performance
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Animated Counter for Impact Metrics
     */
    function initAnimatedCounters() {
        const counters = document.querySelectorAll('.metric h3[data-count]');
        if (counters.length === 0) return;
        
        const speed = 200;
        let hasAnimated = false;
        
        const startCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            const count = parseInt(counter.innerText.replace(/\D/g, ''), 10) || 0;
            const increment = target / speed;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment).toLocaleString();
                requestAnimationFrame(() => startCounter(counter));
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        
        // Use Intersection Observer for performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    counters.forEach(counter => {
                        counter.innerText = '0';
                        startCounter(counter);
                    });
                    observer.disconnect();
                }
            });
        }, { 
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });
        
        const impactSection = document.querySelector('.impact-metrics');
        if (impactSection) {
            observer.observe(impactSection);
        }
    }

    /**
     * Smooth scrolling for anchor links
     */
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Accessibility enhancements
     */
    function initAccessibility() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: #2E7D32;
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 10000;
        `;
        skipLink.addEventListener('focus', function() {
            this.style.top = '0';
        });
        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content landmark if it doesn't exist
        const mainContent = document.querySelector('main, [role="main"]');
        if (!mainContent) {
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.setAttribute('id', 'main-content');
                hero.setAttribute('role', 'main');
            }
        }
        
        // Keyboard navigation for cards
        const cards = document.querySelectorAll('.about-card, .step');
        cards.forEach(card => {
            if (card.tagName !== 'A' && !card.querySelector('a')) {
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'article');
            }
        });
    }

    /**
     * Performance: Lazy load images
     */
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * Logout functionality
     */
    function initLogout() {
        // Handle logout buttons with data-logout attribute
        // This is a fallback in case session.js isn't loaded
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('[data-logout]');
            if (!btn) return;
            
            e.preventDefault();
            
            // Clear all user data
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminUsername');
            
            // Redirect to auth page
            window.location.href = '/auth.html';
        });
    }

    /**
     * Error handling for missing elements
     */
    window.addEventListener('error', function(event) {
        console.error('JavaScript error:', event.error);
        // Could send to error tracking service in production
    });

})();