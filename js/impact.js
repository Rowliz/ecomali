// Impact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initCharts();
    
    // Initialize map
    initImpactMap();
    
    // Setup map filter buttons
    setupMapFilters();
    
    // Setup interactive elements
    setupInteractivity();
    
    // Initialize before/after sliders
    initBeforeAfterSliders();
});

function initCharts() {
    // Waste Type Chart
    const wasteCtx = document.getElementById('wasteTypeChart');
    if (wasteCtx) {
        new Chart(wasteCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Plastic', 'Paper & Cardboard', 'E-Waste', 'Organic', 'Metals', 'Others'],
                datasets: [{
                    data: [45, 25, 10, 12, 5, 3],
                    backgroundColor: [
                        '#2E7D32',
                        '#4CAF50',
                        '#FF9800',
                        '#8BC34A',
                        '#2196F3',
                        '#9E9E9E'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Growth Chart
    const growthCtx = document.getElementById('growthChart');
    if (growthCtx) {
        new Chart(growthCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Waste Diverted (kg)',
                        data: [450, 520, 610, 730, 820, 950, 1050, 1200, 1350, 1500, 1700, 1850],
                        borderColor: '#2E7D32',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Youth Engaged',
                        data: [25, 30, 45, 55, 65, 80, 95, 110, 130, 150, 180, 210],
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
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
                            text: 'Quantity'
                        }
                    }
                }
            }
        });
    }
    
    // Youth Chart
    const youthCtx = document.getElementById('youthChart');
    if (youthCtx) {
        new Chart(youthCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Cleanups', 'Training', 'Digital Work', 'Advocacy', 'Entrepreneurship'],
                datasets: [{
                    label: 'Youth Participation',
                    data: [85, 65, 45, 55, 35],
                    backgroundColor: [
                        '#2E7D32',
                        '#4CAF50',
                        '#8BC34A',
                        '#CDDC39',
                        '#FFEB3B'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Youth'
                        }
                    }
                }
            }
        });
    }
    
    // Community Chart
    const communityCtx = document.getElementById('communityChart');
    if (communityCtx) {
        new Chart(communityCtx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Kutus', 'Kerugoya', 'Kagio', 'Sagana', 'Wanguru', 'Mwea'],
                datasets: [
                    {
                        label: '2022 Reach',
                        data: [65, 45, 30, 20, 15, 25],
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderWidth: 2
                    },
                    {
                        label: '2025 Reach',
                        data: [85, 70, 60, 45, 40, 65],
                        borderColor: '#2E7D32',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }
}

function initImpactMap() {
    const mapElement = document.getElementById('impactMap');
    if (!mapElement) return;
    
    try {
        // Create map centered on Kirinyaga
        const map = L.map('impactMap').setView([-0.5, 37.3], 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add different types of markers
        const markers = {
            hotspot: [
                { lat: -0.52, lng: 37.28, title: 'Kutus Market Dumpsite', size: 1000 },
                { lat: -0.55, lng: 37.25, title: 'Kagio Informal Dump', size: 800 },
                { lat: -0.48, lng: 37.32, title: 'Kerugoya River Bank', size: 600 }
            ],
            cleaned: [
                { lat: -0.53, lng: 37.29, title: 'Kutus Cleaned 2025', size: 500 },
                { lat: -0.56, lng: 37.26, title: 'Kagio Cleaned 2025', size: 400 },
                { lat: -0.67, lng: 37.2, title: 'Sagana Cleanup', size: 300 }
            ],
            monitoring: [
                { lat: -0.5, lng: 37.3, title: 'Central Monitoring Zone', size: 700 },
                { lat: -0.58, lng: 37.27, title: 'River Thiba Watch', size: 400 }
            ],
            recycler: [
                { lat: -0.51, lng: 37.29, title: 'Green Recyclers Ltd', size: 200 },
                { lat: -0.49, lng: 37.31, title: 'EcoPlast Kenya', size: 200 },
                { lat: -0.54, lng: 37.26, title: 'Kirinyaga Waste Solutions', size: 200 },
                { lat: -0.6, lng: 37.4, title: 'Mwea Paper Mill', size: 200 }
            ]
        };
        
        // Store marker references
        window.mapMarkers = {};
        
        // Add all markers initially
        Object.entries(markers).forEach(([type, points]) => {
            window.mapMarkers[type] = [];
            points.forEach(point => {
                const color = {
                    hotspot: '#FF5722',
                    cleaned: '#4CAF50',
                    monitoring: '#FFC107',
                    recycler: '#2196F3'
                }[type];
                
                const marker = L.circleMarker([point.lat, point.lng], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7,
                    radius: 8 + (point.size / 200)
                })
                .addTo(map)
                .bindPopup(`<b>${point.title}</b><br>Type: ${type}<br>Size: ${point.size}kg diverted`);
                
                window.mapMarkers[type].push(marker);
            });
        });
        
        // Store map reference
        window.impactMap = map;
        
    } catch (error) {
        console.log('Impact map initialization error:', error);
        mapElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Interactive impact map will be available with full data integration.</div>';
    }
}

function setupMapFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            // Show/hide markers based on filter
            if (window.mapMarkers && window.impactMap) {
                Object.entries(window.mapMarkers).forEach(([type, markers]) => {
                    markers.forEach(marker => {
                        if (filter === 'all' || filter === type) {
                            if (!window.impactMap.hasLayer(marker)) {
                                marker.addTo(window.impactMap);
                            }
                        } else {
                            if (window.impactMap.hasLayer(marker)) {
                                window.impactMap.removeLayer(marker);
                            }
                        }
                    });
                });
            }
        });
    });
}

function setupInteractivity() {
    // Download report button
    const downloadBtn = document.querySelector('.btn-outline');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('In the live site, this would download the 2025 Annual Impact Report PDF.');
            // Simulate download
            const link = document.createElement('a');
            link.href = '#';
            link.download = 'Eco-Mali-Impact-Report-2025.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
    
    // Case study links
    const caseStudyLinks = document.querySelectorAll('.study-link');
    caseStudyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const studyTitle = this.closest('.case-study').querySelector('h3').textContent;
            alert(`Full case study for "${studyTitle}" would open in a new page.`);
        });
    });
    
    // Update live counters
    updateLiveCounters();
}

function initBeforeAfterSliders() {
    // This would be implemented with a proper slider library
    // For now, we'll add hover effects
    const baItems = document.querySelectorAll('.ba-item');
    baItems.forEach(item => {
        const images = item.querySelector('.ba-images');
        if (images) {
            images.addEventListener('mouseenter', function() {
                this.style.cursor = 'col-resize';
            });
            
            images.addEventListener('click', function() {
                alert('Interactive before/after slider would show here with drag functionality.');
            });
        }
    });
}

function updateLiveCounters() {
    // Animate hero stats
    const heroStats = document.querySelectorAll('.hero-stat h3');
    heroStats.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            current = Math.min(Math.floor(increment * step), target);
            
            // Format number with commas
            stat.textContent = current.toLocaleString() + 
                (stat.textContent.includes('+') ? '+' : '');
            
            if (step >= steps) {
                clearInterval(timer);
            }
        }, duration / steps);
    });
    
    // Update real-time stats every 30 seconds
    setInterval(() => {
        // Simulate new waste reported
        const wasteStat = document.querySelector('.hero-stat:nth-child(1) h3');
        if (wasteStat) {
            const current = parseInt(wasteStat.textContent.replace(/[^0-9]/g, ''));
            const increment = Math.floor(Math.random() * 50);
            wasteStat.textContent = (current + increment).toLocaleString() + '+';
        }
    }, 30000);
}

// Export functions if needed
window.updateImpactData = function(newData) {
    console.log('Impact data updated:', newData);
    // This function would be called when new impact data is available
};

// Initialize on window load
window.addEventListener('load', function() {
    // Add loading animation for charts
    const charts = document.querySelectorAll('canvas');
    charts.forEach(chart => {
        chart.style.opacity = '0';
        chart.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            chart.style.opacity = '1';
        }, 500);
    });
});