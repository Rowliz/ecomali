// Contact Page JavaScript

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    initContactMap();
    
    // Setup form handling with professional validation
    setupContactForm();
    
    // Setup emergency reporting
    setupEmergencyReporting();
    
    // Setup newsletter subscription
    setupNewsletter();
    
    // Setup quick report modal
    setupQuickReportModal();
    
    // Setup interactive elements
    setupInteractivity();
});

/**
 * Initialize contact map with error handling
 */
function initContactMap() {
    const mapElement = document.getElementById('contactMap');
    if (!mapElement) return;
    
    try {
        // Create map centered on Eco-Mali Exchange Limited office in Kutus
        const map = L.map('contactMap').setView([-0.515, 37.282], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add marker for Eco-Mali Exchange Limited office
        const officeIcon = L.divIcon({
            className: 'custom-office-icon',
            html: '<div style="background: #2E7D32; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"><i class="fas fa-recycle"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
        
        L.marker([-0.515, 37.282], { icon: officeIcon })
            .addTo(map)
            .bindPopup(`
                <b>Eco-Mali Exchange Limited Headquarters</b><br>
                Green Innovation Hub<br>
                Kutus Town, Kirinyaga County<br>
                <small><i>Open Monday-Friday: 8:00 AM - 5:00 PM</i></small>
            `)
            .openPopup();
        
        // Add nearby points of interest
        const poi = [
            { lat: -0.516, lng: 37.281, title: 'Kutus Market', type: 'market' },
            { lat: -0.514, lng: 37.283, title: 'Kutus Bus Stage', type: 'transport' },
            { lat: -0.517, lng: 37.284, title: 'County Offices', type: 'government' },
            { lat: -0.513, lng: 37.28, title: 'Recycling Center', type: 'recycling' }
        ];
        
        poi.forEach(point => {
            const icon = L.divIcon({
                className: 'custom-poi-icon',
                html: `<div style="background: ${getPOIColor(point.type)}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; border: 2px solid white;"><i class="fas ${getPOIIcon(point.type)}"></i></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });
            
            L.marker([point.lat, point.lng], { icon: icon })
                .addTo(map)
                .bindPopup(`<b>${point.title}</b><br>${getPOIDescription(point.type)}`);
        });
        
        // Add a circle for approximate service area
        L.circle([-0.515, 37.282], {
            color: '#2E7D32',
            fillColor: '#2E7D32',
            fillOpacity: 0.1,
            radius: 500
        }).addTo(map).bindPopup('Primary service area');
        
    } catch (error) {
        console.log('Map initialization error:', error);
        mapElement.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: #f8f9fa; border-radius: 10px;">
                <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: #666; margin-bottom: 1rem;"></i>
                <h3 style="color: #333; margin-bottom: 0.5rem;">Map Unavailable</h3>
                <p style="color: #666;">Interactive map requires internet connection.</p>
                <p style="color: #666; margin-top: 1rem;">
                    <strong>Our Location:</strong><br>
                    Green Innovation Hub, Kutus Town<br>
                    Kirinyaga County, Kenya
                </p>
            </div>
        `;
    }
}

function getPOIColor(type) {
    const colors = {
        market: '#FF9800',
        transport: '#2196F3',
        government: '#9C27B0',
        recycling: '#2E7D32'
    };
    return colors[type] || '#666';
}

function getPOIIcon(type) {
    const icons = {
        market: 'fa-shopping-cart',
        transport: 'fa-bus',
        government: 'fa-landmark',
        recycling: 'fa-recycle'
    };
    return icons[type] || 'fa-map-marker';
}

function getPOIDescription(type) {
    const descriptions = {
        market: 'Major waste generation point',
        transport: 'Public transport hub',
        government: 'County government offices',
        recycling: 'Waste collection point'
    };
    return descriptions[type] || 'Point of interest';
}

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const formStatus = document.getElementById('formStatus');
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateContactForm()) {
            return;
        }
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            organization: document.getElementById('organization').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            newsletter: document.querySelector('input[name="newsletter"]').checked,
            timestamp: new Date().toISOString()
        };
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // In a real implementation, this would be an API call
            // For now, we'll simulate API call
            await simulateAPICall('/api/contact', formData);
            
            // Show success message
            showFormStatus('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
            
            // Reset form
            contactForm.reset();
            
            // Send confirmation email (simulated)
            sendConfirmationEmail(formData);
            
        } catch (error) {
            // Show error message
            showFormStatus('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
            console.error('Form submission error:', error);
            
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Form validation
    function validateContactForm() {
        let isValid = true;
        const requiredFields = contactForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                markFieldAsInvalid(field, 'This field is required');
            } else {
                markFieldAsValid(field);
                
                // Additional validation for email
                if (field.type === 'email' && field.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value)) {
                        isValid = false;
                        markFieldAsInvalid(field, 'Please enter a valid email address');
                    }
                }
                
                // Additional validation for phone
                if (field.id === 'phone' && field.value) {
                    const phoneRegex = /^[0-9+\-\s]{10,}$/;
                    if (!phoneRegex.test(field.value)) {
                        isValid = false;
                        markFieldAsInvalid(field, 'Please enter a valid phone number');
                    }
                }
            }
        });
        
        return isValid;
    }
    
    function markFieldAsInvalid(field, message) {
        field.style.borderColor = '#f44336';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const error = document.createElement('div');
        error.className = 'field-error';
        error.style.color = '#f44336';
        error.style.fontSize = '0.8rem';
        error.style.marginTop = '0.25rem';
        error.textContent = message;
        field.parentNode.appendChild(error);
    }
    
    function markFieldAsValid(field) {
        field.style.borderColor = '#4CAF50';
        
        // Remove error message
        const error = field.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
    }
    
    function showFormStatus(message, type) {
        if (!formStatus) return;
        
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
}

function setupEmergencyReporting() {
    const emergencyBtn = document.getElementById('quickReportBtn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openQuickReportModal();
        });
    }
    
    // Setup emergency phone link
    const emergencyPhone = document.querySelector('.btn-emergency');
    if (emergencyPhone) {
        emergencyPhone.addEventListener('click', function(e) {
            // Track emergency call (in real app, this would be analytics)
            console.log('Emergency call initiated');
            
            if (!confirm('Call emergency hotline: +254 797 240 399?')) {
                e.preventDefault();
            }
        });
    }
}

function setupNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Show loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Subscribing...';
        submitBtn.disabled = true;
        
        // Simulate subscription
        setTimeout(() => {
            // Show success message
            alert('Thank you for subscribing to our newsletter! You\'ll receive updates soon.');
            
            // Reset form
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Track subscription (in real app, this would be analytics)
            console.log('Newsletter subscription:', email);
            
        }, 1000);
    });
}

function setupQuickReportModal() {
    const modal = document.getElementById('quickReportModal');
    const closeBtn = modal.querySelector('.modal-close');
    const quickReportForm = document.getElementById('quickReportForm');
    
    // Close modal on X click
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // Handle quick report form submission
    quickReportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const reportData = {
            type: document.getElementById('reportType').value,
            location: document.getElementById('reportLocation').value,
            description: document.getElementById('reportDescription').value,
            timestamp: new Date().toISOString(),
            urgent: true
        };
        
        // Show loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Reporting...';
        submitBtn.disabled = true;
        
        // Simulate report submission
        setTimeout(() => {
            // Show success
            alert('Emergency report submitted! Our team will respond immediately.');
            
            // Reset and close
            this.reset();
            closeModal();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // In real app, this would trigger notifications to response team
            console.log('Emergency Report Submitted:', reportData);
            
            // Show confirmation
            showEmergencyConfirmation(reportData);
            
        }, 1500);
    });
}

function openQuickReportModal() {
    const modal = document.getElementById('quickReportModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Auto-focus first field
    setTimeout(() => {
        const firstField = modal.querySelector('input, select, textarea');
        if (firstField) firstField.focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('quickReportModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    
    // Reset form
    const form = document.getElementById('quickReportForm');
    if (form) form.reset();
}

function showEmergencyConfirmation(reportData) {
    // Create confirmation notification
    const confirmation = document.createElement('div');
    confirmation.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff5722;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    confirmation.innerHTML = `
        <h4 style="margin: 0 0 0.5rem 0;">🚨 Emergency Report Confirmed</h4>
        <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">
            Type: ${reportData.type}<br>
            Location: ${reportData.location}
        </p>
        <p style="margin: 0; font-size: 0.8rem; opacity: 0.9;">
            Response team has been notified. Keep this location accessible.
        </p>
    `;
    
    document.body.appendChild(confirmation);
    
    // Remove after 10 seconds
    setTimeout(() => {
        confirmation.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => confirmation.remove(), 300);
    }, 10000);
}

function setupInteractivity() {
    // Make phone numbers clickable
    document.querySelectorAll('.phone-item strong, .contact-details p:has(.fa-phone)').forEach(element => {
        const phoneNumber = element.textContent || element.querySelector('strong')?.textContent;
        if (phoneNumber && phoneNumber.match(/[\d\s\+\-]{10,}/)) {
            element.style.cursor = 'pointer';
            element.title = 'Click to call';
            element.addEventListener('click', function() {
                if (confirm(`Call ${phoneNumber.trim()}?`)) {
                    window.location.href = `tel:${phoneNumber.trim()}`;
                }
            });
        }
    });
    
    // Make emails clickable
    document.querySelectorAll('.email-item a, .contact-details p:has(.fa-envelope)').forEach(element => {
        const email = element.textContent || element.querySelector('a')?.textContent;
        if (email && email.includes('@')) {
            element.style.cursor = 'pointer';
            element.title = 'Click to email';
            if (!element.tagName === 'A') {
                element.addEventListener('click', function() {
                    window.location.href = `mailto:${email.trim()}`;
                });
            }
        }
    });
    
    // FAQ links functionality
    document.querySelectorAll('.faq-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const question = this.querySelector('h4').textContent;
            alert(`In the full site, this would navigate to detailed information about: "${question}"`);
        });
    });
    
    // Get directions button
    const directionsBtn = document.querySelector('.btn-secondary .fa-directions');
    if (directionsBtn) {
        directionsBtn.closest('.btn-secondary').addEventListener('click', function(e) {
            // In real app, this would open Google Maps
            console.log('Opening directions to Eco-Mali Exchange Limited office');
        });
    }
}

// Helper function to simulate API call
function simulateAPICall(endpoint, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() < 0.9) {
                resolve({
                    success: true,
                    message: 'Form submitted successfully',
                    data: data
                });
            } else {
                reject(new Error('Network error. Please try again.'));
            }
        }, 1500);
    });
}

// Helper function to simulate confirmation email
function sendConfirmationEmail(formData) {
    console.log('Confirmation email sent to:', formData.email);
    // In real app, this would trigger an email service
}

// Export functions if needed
window.openContactModal = openQuickReportModal;
window.submitEmergencyReport = function(data) {
    // This would be called from other pages
    console.log('Emergency report from external:', data);
};