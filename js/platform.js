// Platform Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize demo map
    initDemoMap();
    
    // Beta signup form handling
    const betaForms = document.querySelectorAll('.beta-signup, .beta-form');
    betaForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]');
            if (email && email.value) {
                alert('Thank you for joining the beta program! We\'ll contact you soon.');
                this.reset();
            }
        });
    });
    
    // Demo form interactions
    const demoButtons = document.querySelectorAll('.demo-btn');
    demoButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert('In the actual platform, you would upload a photo here.');
        });
    });
    
    // Animate impact meter
    const meter = document.querySelector('.meter-fill');
    if (meter) {
        setTimeout(() => {
            meter.style.width = '75%';
        }, 500);
    }
    
    // Platform feature tabs/interactivity
    initPlatformFeatures();
});

function initDemoMap() {
    const mapDemo = document.getElementById('map-demo');
    if (!mapDemo) return;
    
    try {
        // Create a simple demo map (Kirinyaga area)
        const map = L.map('map-demo').setView([-0.5, 37.3], 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add demo markers for dumpsites
        const demoMarkers = [
            { lat: -0.52, lng: 37.28, title: 'Kutus Dumpsite' },
            { lat: -0.48, lng: 37.32, title: 'Kerugoya Market Waste' },
            { lat: -0.55, lng: 37.25, title: 'Kagio Informal Dump' }
        ];
        
        demoMarkers.forEach(marker => {
            L.marker([marker.lat, marker.lng])
                .addTo(map)
                .bindPopup(`<b>${marker.title}</b><br>Reported: 15/03/2024<br>Status: Pending cleanup`);
        });
        
        // Add a circle for service area
        L.circle([-0.5, 37.3], {
            color: '#2E7D32',
            fillColor: '#2E7D32',
            fillOpacity: 0.1,
            radius: 5000
        }).addTo(map);
        
    } catch (error) {
        console.log('Map initialization error:', error);
        mapDemo.innerHTML = '<div style="text-align: center; padding: 2rem;">Map preview unavailable. Interactive maps will work in the actual platform.</div>';
    }
}

function initPlatformFeatures() {
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Demo recycler list sorting
    const recyclerList = document.querySelector('.recycler-list');
    if (recyclerList) {
        setTimeout(() => {
            // Simulate price updates
            const prices = recyclerList.querySelectorAll('.recycler-demo span:last-child');
            prices.forEach(price => {
                const current = price.textContent;
                const num = parseInt(current.match(/\d+/)[0]);
                const newPrice = num + Math.floor(Math.random() * 3);
                price.textContent = `Ksh ${newPrice}/kg`;
            });
        }, 3000);
    }
}

// Simulate real-time updates
function updateDemoStats() {
    const stats = document.querySelectorAll('.stat-demo strong');
    if (stats.length > 0) {
        setInterval(() => {
            stats.forEach(stat => {
                const current = parseInt(stat.textContent.replace(/[^\d]/g, ''));
                const increment = Math.floor(Math.random() * 5);
                stat.textContent = (current + increment).toLocaleString();
            });
        }, 5000);
    }
}

// Initialize stats updater
setTimeout(updateDemoStats, 2000);