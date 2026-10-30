// Generator Dashboard JavaScript

let listings = [];
let bids = [];
let transactions = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  setupWasteForm();
  setMinDate();
});

// Set minimum date for pickup
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  const pickupDateInput = document.getElementById('pickupDate');
  if (pickupDateInput) {
    pickupDateInput.min = today;
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    await Promise.all([
      loadListings(),
      loadBids(),
      loadTransactions(),
      loadStats()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error loading dashboard data', 'error');
  }
}

// Load listings
async function loadListings() {
  try {
    const data = await apiGet('/api/generator/listings');
    listings = data.listings || [];
    displayListings();
  } catch (error) {
    console.error('Error loading listings:', { status: error.status, message: error.error || error });
    listings = [];
    displayListings();
  }
}

// Load bids
async function loadBids() {
  try {
    const data = await apiGet('/api/generator/bids');
    bids = data.bids || [];
    displayBids();
  } catch (error) {
    console.error('Error loading bids:', { status: error.status, message: error.error || error });
    bids = [];
    displayBids();
  }
}

// Load transactions
async function loadTransactions() {
  try {
    const data = await apiGet('/api/generator/transactions');
    transactions = data.transactions || [];
    displayTransactions();
  } catch (error) {
    console.error('Error loading transactions:', error);
    transactions = [];
    displayTransactions();
  }
}

// Load stats
async function loadStats() {
  try {
    const data = await apiGet('/api/generator/stats');
    updateStats(data);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Update stats display
function updateStats(data) {
  document.getElementById('totalListings').textContent = data.totalListings || 0;
  document.getElementById('pendingListings').textContent = data.pendingListings || 0;
  document.getElementById('totalEarnings').textContent = `KES ${(data.totalEarnings || 0).toLocaleString()}`;
  document.getElementById('activeBids').textContent = data.activeBids || 0;
}

// Setup waste form
function setupWasteForm() {
  const form = document.getElementById('wasteListingForm');
  if (!form) return;

  // Calculate pricing on input change
  const amountInput = document.getElementById('amountKg');
  const priceInput = document.getElementById('biddingPrice');

  [amountInput, priceInput].forEach(input => {
    if (input) {
      input.addEventListener('input', calculatePricing);
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitWasteListing();
  });
}

// Calculate pricing and commission
function calculatePricing() {
  const amount = parseFloat(document.getElementById('amountKg').value) || 0;
  const pricePerKg = parseFloat(document.getElementById('biddingPrice').value) || 0;
  const totalValue = amount * pricePerKg;

  // Calculate commission (5-8% based on total value)
  let commissionRate = 0.05; // 5% default
  if (totalValue >= 100000) {
    commissionRate = 0.05; // 5% for high value
  } else if (totalValue >= 50000) {
    commissionRate = 0.06; // 6% for medium-high value
  } else if (totalValue >= 10000) {
    commissionRate = 0.07; // 7% for medium value
  } else {
    commissionRate = 0.08; // 8% for low value
  }

  const commission = totalValue * commissionRate;
  const earnings = totalValue - commission;

  // Update display
  document.getElementById('totalAmountDisplay').textContent = `${amount} kg`;
  document.getElementById('pricePerKgDisplay').textContent = `KES ${pricePerKg.toLocaleString()}`;
  document.getElementById('totalValueDisplay').textContent = `KES ${totalValue.toLocaleString()}`;
  document.getElementById('commissionDisplay').textContent = `KES ${commission.toFixed(2)} (${(commissionRate * 100).toFixed(1)}%)`;
  document.getElementById('yourEarningsDisplay').textContent = `KES ${earnings.toFixed(2)}`;
}

// Submit waste listing
async function submitWasteListing() {
  const form = document.getElementById('wasteListingForm');
  
  // Validate form first
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const formData = new FormData(form);

  // Validate required fields
  const wasteType = formData.get('wasteType');
  const wasteQuality = formData.get('wasteQuality');
  const amount = parseFloat(formData.get('amountKg'));
  const pricePerKg = parseFloat(formData.get('biddingPrice'));
  const location = formData.get('location');

  if (!wasteType || !wasteQuality || !amount || !pricePerKg || !location) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  // Calculate commission
  const totalValue = amount * pricePerKg;
  
  let commissionRate = 0.05;
  if (totalValue >= 100000) {
    commissionRate = 0.05;
  } else if (totalValue >= 50000) {
    commissionRate = 0.06;
  } else if (totalValue >= 10000) {
    commissionRate = 0.07;
  } else {
    commissionRate = 0.08;
  }

  // Create FormData for file upload
  const submitData = new FormData(form);
  
  console.log('Submitting listing with images...');

  try {
    await apiFetch('/api/generator/listings', {
      method: 'POST',
      body: submitData
    });

    showNotification('Waste listing submitted successfully! Awaiting admin approval.', 'success');
    closeWasteForm();
    form.reset();
    loadDashboardData();
  } catch (error) {
    console.error('Error submitting listing:', error);
    showNotification(error.error || error.message || 'Error submitting listing', 'error');
  }
}

// Display listings
function displayListings(filter = 'all') {
  const container = document.getElementById('listingsContainer');
  if (!container) return;

  let filteredListings = listings;
  if (filter !== 'all') {
    filteredListings = listings.filter(l => l.status === filter);
  }

  if (filteredListings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box"></i>
        <p>No listings found</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredListings.map(listing => `
    <div class="listing-card">
      ${listing.imageUrls && listing.imageUrls.length > 0 ? `
        <div class="listing-images">
          ${listing.imageUrls.map(url => `
            <img src="${url}" alt="${listing.wasteType} waste" class="listing-image">
          `).join('')}
        </div>
      ` : ''}
      <div class="listing-header">
        <div class="listing-title">
          <h3>${listing.wasteType.charAt(0).toUpperCase() + listing.wasteType.slice(1)} Waste</h3>
          <span class="status-badge ${listing.status}">${listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}</span>
        </div>
      </div>
      <div class="listing-details">
        <div class="detail-item">
          <i class="fas fa-weight"></i>
          <span>${listing.amountKg} kg</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-star"></i>
          <span>Quality: ${listing.wasteQuality}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${listing.location}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-money-bill-wave"></i>
          <span>KES ${listing.biddingPrice}/kg</span>
        </div>
      </div>
      ${listing.description ? `<p style="color: #666; margin: 1rem 0;">${listing.description}</p>` : ''}
      <div class="listing-actions">
        <button class="btn-small btn-view" onclick="viewListing('${listing._id}')">
          <i class="fas fa-eye"></i> View Details
        </button>
        ${listing.status === 'pending' ? `
          <button class="btn-small btn-edit" onclick="editListing('${listing._id}')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-small btn-delete" onclick="deleteListing('${listing._id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Display bids
function displayBids() {
  const container = document.getElementById('bidsContainer');
  if (!container) return;

  if (bids.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-gavel"></i>
        <p>No bids received yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = bids.map(bid => `
    <div class="bid-card">
      <div class="bid-header">
        <div class="bidder-info">
          <h4>${bid.recyclerName || 'Recycler'}</h4>
          <span class="status-badge ${bid.status}">${bid.status}</span>
        </div>
        <div class="bid-amount">KES ${bid.bidAmount.toLocaleString()}</div>
      </div>
      <div class="bid-details">
        <div class="detail-item">
          <i class="fas fa-box"></i>
          <span>Listing: ${bid.listingId}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-calendar"></i>
          <span>${new Date(bid.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      ${bid.message ? `<p style="color: #666; margin: 1rem 0;">${bid.message}</p>` : ''}
      ${bid.status === 'pending' ? `
        <div class="bid-actions">
          <button class="btn-small btn-accept" onclick="acceptBid('${bid._id}')">
            <i class="fas fa-check"></i> Accept Bid
          </button>
          <button class="btn-small btn-reject" onclick="rejectBid('${bid._id}')">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Display transactions
function displayTransactions() {
  const container = document.getElementById('transactionsContainer');
  if (!container) return;

  if (transactions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>No transactions yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = transactions.map(transaction => `
    <div class="transaction-item">
      <div class="transaction-info">
        <h4>${transaction.description || 'Waste Sale'}</h4>
        <p>${new Date(transaction.date).toLocaleDateString()} • ${transaction.paymentMethod || 'M-Pesa'}</p>
      </div>
      <div class="transaction-amount">
        <strong>KES ${transaction.amount.toLocaleString()}</strong>
        <span class="status-badge ${transaction.status}">${transaction.status}</span>
      </div>
    </div>
  `).join('');
}

// Filter listings
function filterListings() {
  const filter = document.getElementById('listingFilter').value;
  displayListings(filter);
}

// Open waste form
function openWasteForm() {
  const modal = document.getElementById('wasteFormModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Close waste form
function closeWasteForm() {
  const modal = document.getElementById('wasteFormModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Quick action functions
function viewMyListings() {
  document.getElementById('listingsSection').scrollIntoView({ behavior: 'smooth' });
}

function viewBids() {
  document.getElementById('bidsSection').scrollIntoView({ behavior: 'smooth' });
}

function viewTransactions() {
  document.getElementById('transactionsSection').scrollIntoView({ behavior: 'smooth' });
}

// Accept bid
async function acceptBid(bidId) {
  if (!confirm('Are you sure you want to accept this bid?')) return;

  try {
    await apiPost(`/api/generator/bids/${bidId}/accept`, {});
    showNotification('Bid accepted successfully!', 'success');
    loadDashboardData();
  } catch (error) {
    console.error('Error accepting bid:', error);
    showNotification(error.error || 'Error accepting bid', 'error');
  }
}

// Reject bid
async function rejectBid(bidId) {
  if (!confirm('Are you sure you want to reject this bid?')) return;

  try {
    await apiPost(`/api/generator/bids/${bidId}/reject`, {});
    showNotification('Bid rejected', 'success');
    loadDashboardData();
  } catch (error) {
    console.error('Error rejecting bid:', error);
    showNotification(error.error || 'Error rejecting bid', 'error');
  }
}

// View listing
function viewListing(listingId) {
  const listing = listings.find(l => l._id === listingId);
  if (listing) {
    alert(`Listing Details:\n\nType: ${listing.wasteType}\nAmount: ${listing.amountKg} kg\nQuality: ${listing.wasteQuality}\nLocation: ${listing.location}\nPrice: KES ${listing.biddingPrice}/kg\nStatus: ${listing.status}`);
  }
}

// Edit listing
function editListing(listingId) {
  const listing = listings.find(l => l._id === listingId);
  if (listing && listing.status === 'pending') {
    // Populate form with listing data
    document.getElementById('wasteType').value = listing.wasteType;
    document.getElementById('wasteQuality').value = listing.wasteQuality;
    document.getElementById('amountKg').value = listing.amountKg;
    document.getElementById('biddingPrice').value = listing.biddingPrice;
    document.getElementById('location').value = listing.location;
    document.getElementById('description').value = listing.description || '';
    openWasteForm();
  }
}

// Delete listing
async function deleteListing(listingId) {
  if (!confirm('Are you sure you want to delete this listing?')) return;

  try {
    await apiDelete(`/api/generator/listings/${listingId}`);
    showNotification('Listing deleted successfully', 'success');
    loadDashboardData();
  } catch (error) {
    console.error('Error deleting listing:', error);
    showNotification(error.error || 'Error deleting listing', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Simple notification - can be enhanced with a toast library
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

// Close modal on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('wasteFormModal');
  if (modal && e.target === modal) {
    closeWasteForm();
  }
});