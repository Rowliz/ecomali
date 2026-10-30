// Recycler Dashboard JavaScript

let listings = [];
let myBids = [];
let purchases = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  setupBidForm();
});

// Load dashboard data
async function loadDashboardData() {
  try {
    await Promise.all([
      loadListings(),
      loadMyBids(),
      loadPurchases(),
      loadStats()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error loading dashboard data', 'error');
  }
}

// Load available listings (approved only)
async function loadListings() {
  try {
    const data = await apiGet('/api/recycler/listings');
    listings = data.listings || [];
    displayListings();
  } catch (error) {
    console.error('Error loading listings:', error);
    listings = [];
    displayListings();
  }
}

// Load my bids
async function loadMyBids() {
  try {
    const data = await apiGet('/api/recycler/bids');
    myBids = data.bids || [];
    displayBids();
  } catch (error) {
    console.error('Error loading bids:', error);
    myBids = [];
    displayBids();
  }
}

// Load purchases
async function loadPurchases() {
  try {
    const data = await apiGet('/api/recycler/purchases');
    purchases = data.purchases || [];
    displayPurchases();
  } catch (error) {
    console.error('Error loading purchases:', error);
    purchases = [];
    displayPurchases();
  }
}

// Load stats
async function loadStats() {
  try {
    const data = await apiGet('/api/recycler/stats');
    updateStats(data);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Update stats display
function updateStats(data) {
  document.getElementById('availableListings').textContent = data.availableListings || 0;
  document.getElementById('myBids').textContent = data.myBids || 0;
  document.getElementById('acceptedBids').textContent = data.acceptedBids || 0;
  document.getElementById('totalPurchases').textContent = `KES ${(data.totalPurchases || 0).toLocaleString()}`;
}

// Setup bid form
function setupBidForm() {
  const form = document.getElementById('bidForm');
  if (!form) return;

  // Calculate total bid amount
  const bidAmountInput = document.getElementById('bidAmount');
  if (bidAmountInput) {
    bidAmountInput.addEventListener('input', calculateBidTotal);
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitBid();
  });
}

// Calculate bid total
function calculateBidTotal() {
  const listingId = document.getElementById('bidListingId').value;
  const listing = listings.find(l => l._id === listingId);
  if (!listing) return;

  const bidAmount = parseFloat(document.getElementById('bidAmount').value) || 0;
  const totalAmount = listing.amountKg * bidAmount;

  document.getElementById('bidWasteAmount').textContent = `${listing.amountKg} kg`;
  document.getElementById('bidPricePerKg').textContent = `KES ${bidAmount.toLocaleString()}`;
  document.getElementById('bidTotalAmount').textContent = `KES ${totalAmount.toLocaleString()}`;
}

// Display listings
function displayListings(filter = 'all', search = '') {
  const container = document.getElementById('listingsContainer');
  if (!container) return;

  let filteredListings = listings;

  // Filter by type
  if (filter !== 'all') {
    filteredListings = filteredListings.filter(l => l.wasteType === filter);
  }

  // Search by location
  if (search) {
    filteredListings = filteredListings.filter(l => 
      l.location.toLowerCase().includes(search.toLowerCase())
    );
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

  container.innerHTML = filteredListings.map(listing => {
    const hasBid = myBids.some(b => b.listingId === listing._id);
    return `
      <div class="listing-card">
        <div class="listing-header">
          <div class="listing-title">
            <h3>${listing.wasteType.charAt(0).toUpperCase() + listing.wasteType.slice(1)} Waste</h3>
            <span class="status-badge approved">Approved</span>
          </div>
        </div>
        <div class="listing-details">
          <div class="detail-item">
            <i class="fas fa-weight"></i>
            <span>${listing.amountKg} kg</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-star"></i>
            <span>Quality: ${listing.wasteQuality || 'Standard'}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${listing.location}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>${listing.pickupDate ? new Date(listing.pickupDate).toLocaleDateString() : 'Flexible'}</span>
          </div>
        </div>
        ${listing.description ? `<p style="color: #666; margin: 1rem 0;">${listing.description}</p>` : ''}
        <div class="listing-price">
          <div class="price-info">
            <strong>KES ${listing.biddingPrice}/kg</strong>
            <span>Minimum bid price</span>
          </div>
        </div>
        <div class="listing-actions">
          <button class="btn-small btn-view" onclick="viewListingDetails('${listing._id}')">
            <i class="fas fa-eye"></i> View Details
          </button>
          ${!hasBid ? `
            <button class="btn-small btn-bid" onclick="openBidModal('${listing._id}')">
              <i class="fas fa-gavel"></i> Place Bid
            </button>
          ` : `
            <button class="btn-small" disabled style="background: #ccc; color: #666;">
              <i class="fas fa-check"></i> Bid Placed
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// Display bids
function displayBids(filter = 'all') {
  const container = document.getElementById('bidsContainer');
  if (!container) return;

  let filteredBids = myBids;
  if (filter !== 'all') {
    filteredBids = myBids.filter(b => b.status === filter);
  }

  if (filteredBids.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-gavel"></i>
        <p>No bids found</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredBids.map(bid => {
    const listing = listings.find(l => l._id === bid.listingId);
    const canPay = bid.status === 'accepted';
    return `
      <div class="bid-card">
        <div class="bid-header">
          <div class="bid-info">
            <h4>${listing ? listing.wasteType.charAt(0).toUpperCase() + listing.wasteType.slice(1) + ' Waste' : 'Listing'}</h4>
            <p>${listing ? listing.location : 'N/A'}</p>
          </div>
          <div>
            <div class="bid-amount">KES ${bid.bidAmount.toLocaleString()}</div>
            <span class="status-badge ${bid.status}">${bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}</span>
          </div>
        </div>
        <div class="bid-details">
          <div class="detail-item">
            <i class="fas fa-box"></i>
            <span>${listing ? listing.amountKg + ' kg' : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>${new Date(bid.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        ${bid.message ? `<p style="color: #666; margin: 1rem 0;">${bid.message}</p>` : ''}
        ${canPay ? `
          <div class="bid-actions">
            <button class="btn-small btn-bid" onclick="payForBid('${bid._id}')">
              <i class="fas fa-credit-card"></i> Pay Now
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Display purchases
function displayPurchases() {
  const container = document.getElementById('purchasesContainer');
  if (!container) return;

  if (purchases.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-shopping-cart"></i>
        <p>No purchases yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = purchases.map(purchase => `
    <div class="purchase-card">
      <div class="purchase-header">
        <div class="purchase-info">
          <h4>${purchase.description || 'Waste Purchase'}</h4>
          <p>${new Date(purchase.date).toLocaleDateString()}</p>
        </div>
        <div class="purchase-amount">KES ${Number(purchase.amount || 0).toLocaleString()}</div>
      </div>
      <div class="purchase-details">
        <div class="detail-item">
          <i class="fas fa-wallet"></i>
          <span>Paid via Wallet</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-check-circle"></i>
          <span>${purchase.status || 'completed'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Payment modal controls
function openPaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) modal.classList.add('active');
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) modal.classList.remove('active');
}

// Handle payment submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('paymentForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById('payAmount').value);
    const description = document.getElementById('payDescription').value;

    if (!amount || amount <= 0) {
      showNotification('Enter a valid amount', 'error');
      return;
    }
    try {
      const result = await apiPost('/api/recycler/purchases', { amount, description });
      showNotification(`Payment successful! New wallet balance: KES ${result.walletBalance?.toLocaleString() || '0'}`, 'success');
      
      // Refresh wallet balance if widget exists
      if (window.walletWidget) {
        walletWidget.loadBalance();
      }
      
      closePaymentModal();
      loadDashboardData();
    } catch (error) {
      if (error.error && error.error.includes('Insufficient wallet balance')) {
        showNotification('Insufficient wallet balance. Please deposit funds first.', 'error');
        closePaymentModal();
        // Open wallet deposit modal if available
        if (window.walletWidget) {
          setTimeout(() => walletWidget.showDepositModal(), 500);
        }
      } else {
        showNotification(error.error || 'Failed to record payment', 'error');
      }
    }
  });
});

// Filter listings
function filterListings() {
  const filter = document.getElementById('listingFilter').value;
  const search = document.getElementById('searchListings').value;
  displayListings(filter, search);
}

// Filter bids
function filterBids() {
  const filter = document.getElementById('bidFilter').value;
  displayBids(filter);
}

// Pay for an accepted bid
async function payForBid(bidId) {
  if (!confirm('Payment will be deducted from your wallet. Continue?')) return;
  
  try {
    const result = await apiPost('/api/recycler/purchases/from-bid', { bidId });
    showNotification(`Payment successful! New wallet balance: KES ${result.walletBalance?.toLocaleString() || '0'}`, 'success');
    
    // Refresh wallet balance if widget exists
    if (window.walletWidget) {
      walletWidget.loadBalance();
    }
    
    loadDashboardData();
  } catch (error) {
    if (error.error && error.error.includes('Insufficient wallet balance')) {
      showNotification('Insufficient wallet balance. Please deposit funds first.', 'error');
      // Open wallet deposit modal if available
      if (window.walletWidget) {
        setTimeout(() => walletWidget.showDepositModal(), 500);
      }
    } else {
      showNotification(error.error || 'Failed to record payment', 'error');
    }
  }
}
window.payForBid = payForBid;

// Open bid modal
function openBidModal(listingId) {
  const listing = listings.find(l => l._id === listingId);
  if (!listing) return;

  document.getElementById('bidListingId').value = listingId;
  document.getElementById('bidAmount').value = listing.biddingPrice;
  document.getElementById('bidMessage').value = '';

  // Display listing preview
  const preview = document.getElementById('listingPreview');
  preview.innerHTML = `
    <h4>${listing.wasteType.charAt(0).toUpperCase() + listing.wasteType.slice(1)} Waste</h4>
    <p><strong>Amount:</strong> ${listing.amountKg} kg</p>
    <p><strong>Quality:</strong> ${listing.wasteQuality || 'Standard'}</p>
    <p><strong>Location:</strong> ${listing.location}</p>
    <p><strong>Minimum Bid:</strong> KES ${listing.biddingPrice}/kg</p>
  `;

  calculateBidTotal();

  const modal = document.getElementById('bidModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Close bid modal
function closeBidModal() {
  const modal = document.getElementById('bidModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Submit bid
async function submitBid() {
  const form = document.getElementById('bidForm');
  const formData = new FormData(form);

  const listingId = formData.get('listingId');
  const listing = listings.find(l => l._id === listingId);
  if (!listing) {
    showNotification('Listing not found', 'error');
    return;
  }

  const bidAmount = parseFloat(formData.get('bidAmount'));
  if (bidAmount < listing.biddingPrice) {
    showNotification(`Bid amount must be at least KES ${listing.biddingPrice}/kg`, 'error');
    return;
  }

  const data = {
    listingId: listingId,
    bidAmount: bidAmount,
    message: formData.get('message'),
    totalAmount: listing.amountKg * bidAmount
  };

  try {
    const result = await apiPost('/api/recycler/bids', data);
    showNotification('Bid placed successfully!', 'success');
    closeBidModal();
    form.reset();
    loadDashboardData();
  } catch (error) {
    console.error('Error submitting bid:', error);
    showNotification(error.error || 'Error placing bid', 'error');
  }
}

// Quick action functions
function viewAvailableListings() {
  document.getElementById('listingsSection').scrollIntoView({ behavior: 'smooth' });
}

function viewMyBids() {
  document.getElementById('bidsSection').scrollIntoView({ behavior: 'smooth' });
}

function viewPurchases() {
  document.getElementById('purchasesSection').scrollIntoView({ behavior: 'smooth' });
}

// View listing details
function viewListingDetails(listingId) {
  const listing = listings.find(l => l._id === listingId);
  if (listing) {
    alert(`Listing Details:\n\nType: ${listing.wasteType}\nAmount: ${listing.amountKg} kg\nQuality: ${listing.wasteQuality || 'Standard'}\nLocation: ${listing.location}\nPrice: KES ${listing.biddingPrice}/kg\nDescription: ${listing.description || 'N/A'}`);
  }
}

// View purchase details
function viewPurchaseDetails(purchaseId) {
  const purchase = purchases.find(p => p._id === purchaseId);
  if (purchase) {
    alert(`Purchase Details:\n\nType: ${purchase.listingType}\nAmount: ${purchase.amountKg} kg\nTotal: KES ${purchase.totalAmount}\nPayment: Wallet\nDate: ${new Date(purchase.date).toLocaleDateString()}\nStatus: ${purchase.status}`);
  }
}

// Show notification
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

// Close modal on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('bidModal');
  if (modal && e.target === modal) {
    closeBidModal();
  }
});

