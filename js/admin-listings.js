// Admin Listings Management JavaScript

let allListings = [];
let currentPage = 1;
let itemsPerPage = 20;
let currentFilter = 'all';
let currentSearch = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
  loadListings();
});

// Check admin access
async function checkAdminAccess() {
  try {
    const response = await apiGet('/api/auth/me');
    if (!response || !response.user || response.user.role !== 'admin') {
      window.location.href = '/admin/login.html';
      return;
    }
  } catch (error) {
    window.location.href = '/admin/login.html';
  }
}

// Load all listings
async function loadListings() {
  try {
    // Load all listings (no status filter)
    const data = await apiGet('/api/admin/listings?limit=1000');
    allListings = data.listings || [];
    
    displayListings();
    updateListingsCount();
  } catch (error) {
    console.error('Error loading listings:', error);
    document.getElementById('listingsBody').innerHTML = 
      '<tr><td colspan="11" class="text-center">Error loading listings. Please try again.</td></tr>';
    showNotification('Error loading listings', 'error');
  }
}

// Display listings
function displayListings() {
  const tbody = document.getElementById('listingsBody');
  
  // Filter listings
  let filtered = allListings;
  
  // Filter by status
  if (currentFilter !== 'all') {
    filtered = filtered.filter(l => l.status === currentFilter);
  }
  
  // Filter by search
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filtered = filtered.filter(l => 
      l.wasteType?.toLowerCase().includes(searchLower) ||
      l.location?.toLowerCase().includes(searchLower) ||
      l.generatorId?.name?.toLowerCase().includes(searchLower) ||
      l._id?.toLowerCase().includes(searchLower)
    );
  }
  
  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filtered.slice(startIndex, endIndex);
  
  if (paginatedListings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="text-center">No listings found</td></tr>';
    updatePagination(0, 0);
    return;
  }
  
  tbody.innerHTML = paginatedListings.map(listing => {
    const generatorName = listing.generatorId?.name || listing.generatorId?.username || 'Unknown';
    const statusClass = listing.status || 'pending';
    const statusBadge = getStatusBadge(listing.status);
    
    return `
      <tr>
        <td><code>${listing._id.substring(0, 8)}...</code></td>
        <td>${generatorName}</td>
        <td>${capitalizeFirst(listing.wasteType)}</td>
        <td>${capitalizeFirst(listing.wasteQuality || 'N/A')}</td>
        <td>${listing.amountKg || 0} kg</td>
        <td>KES ${(listing.biddingPrice || 0).toLocaleString()}</td>
        <td>KES ${(listing.totalValue || 0).toLocaleString()}</td>
        <td>${listing.location || 'N/A'}</td>
        <td>${statusBadge}</td>
        <td>${new Date(listing.createdAt).toLocaleDateString()}</td>
        <td>
          <div class="action-buttons">
            ${listing.status === 'pending' ? `
              <button class="btn-small btn-success" onclick="approveListing('${listing._id}')" title="Approve">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn-small btn-danger" onclick="rejectListing('${listing._id}')" title="Reject">
                <i class="fas fa-times"></i>
              </button>
            ` : ''}
            <button class="btn-small btn-info" onclick="viewListing('${listing._id}')" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  updatePagination(filtered.length, totalPages);
}

// Get status badge HTML
function getStatusBadge(status) {
  const badges = {
    pending: '<span class="status-badge pending">Pending</span>',
    approved: '<span class="status-badge approved">Approved</span>',
    active: '<span class="status-badge active">Active</span>',
    sold: '<span class="status-badge sold">Sold</span>',
    rejected: '<span class="status-badge rejected">Rejected</span>',
    cancelled: '<span class="status-badge cancelled">Cancelled</span>'
  };
  return badges[status] || '<span class="status-badge">Unknown</span>';
}

// Capitalize first letter
function capitalizeFirst(str) {
  if (!str) return 'N/A';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Filter listings
function filterListings() {
  currentFilter = document.getElementById('statusFilter').value;
  currentSearch = document.getElementById('searchListings').value;
  currentPage = 1; // Reset to first page
  displayListings();
}

// Update listings count
function updateListingsCount() {
  const count = allListings.length;
  document.getElementById('listingsCount').textContent = `${count} listing${count !== 1 ? 's' : ''}`;
}

// Update pagination
function updatePagination(totalItems, totalPages) {
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '<div class="pagination-controls">';
  
  // Previous button
  html += `<button class="btn-pagination" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
    <i class="fas fa-chevron-left"></i> Previous
  </button>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `<button class="btn-pagination ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += '<span class="pagination-ellipsis">...</span>';
    }
  }
  
  // Next button
  html += `<button class="btn-pagination" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
    Next <i class="fas fa-chevron-right"></i>
  </button>`;
  
  html += '</div>';
  html += `<div class="pagination-info">Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}</div>`;
  
  pagination.innerHTML = html;
}

// Change page
function changePage(page) {
  if (page < 1) return;
  currentPage = page;
  displayListings();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Approve listing
async function approveListing(listingId) {
  if (!confirm('Are you sure you want to approve this listing?')) return;

  try {
    await apiPost(`/api/admin/listings/${listingId}/approve`, {});
    showNotification('Listing approved successfully!', 'success');
    loadListings();
  } catch (error) {
    console.error('Error approving listing:', error);
    showNotification(error.error || 'Failed to approve listing', 'error');
  }
}

// Reject listing
async function rejectListing(listingId) {
  const reason = prompt('Please provide a reason for rejection (optional):');
  
  try {
    await apiPost(`/api/admin/listings/${listingId}/reject`, { reason: reason || '' });
    showNotification('Listing rejected', 'success');
    loadListings();
  } catch (error) {
    console.error('Error rejecting listing:', error);
    showNotification(error.error || 'Failed to reject listing', 'error');
  }
}

// View listing details
function viewListing(listingId) {
  const listing = allListings.find(l => l._id === listingId);
  if (listing) {
    const details = `
Listing Details:

ID: ${listing._id}
Generator: ${listing.generatorId?.name || 'Unknown'}
Waste Type: ${capitalizeFirst(listing.wasteType)}
Quality: ${capitalizeFirst(listing.wasteQuality)}
Amount: ${listing.amountKg} kg
Price: KES ${listing.biddingPrice}/kg
Total Value: KES ${listing.totalValue?.toLocaleString()}
Location: ${listing.location || 'N/A'}
Description: ${listing.description || 'N/A'}
Status: ${listing.status}
Created: ${new Date(listing.createdAt).toLocaleString()}
    `.trim();
    
    alert(details);
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#059669' : type === 'error' ? '#DC2626' : '#2563EB'};
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

// Make functions available globally
window.approveListing = approveListing;
window.rejectListing = rejectListing;
window.viewListing = viewListing;
window.filterListings = filterListings;
window.changePage = changePage;

