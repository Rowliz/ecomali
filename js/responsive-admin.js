
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.admin-sidebar');
    // Try to find an existing toggle button, or create one if not found (though HTML injection should handle it)
    let toggleBtn = document.getElementById('sidebarToggle');

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.classList.toggle('sidebar-open');
        });

        // Close when clicking overlay
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        });

        // Close when clicking a link on mobile
        const navLinks = sidebar.querySelectorAll('a, .nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.classList.remove('sidebar-open');
                }
            });
        });
    } else {
        // Optional: Log if elements are missing, but expected on some pages
        // console.log('Sidebar toggle or sidebar element not found');
    }

    // Handle resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) {
            sidebar?.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    });
});
