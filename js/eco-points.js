// Eco Points Widget JavaScript

let ecoPointsBalance = 0;
let ecoPointsHistory = [];
let ecoPointsStats = {};

// Load eco points data
async function loadEcoPoints() {
  try {
    const data = await apiGet('/api/eco-points');
    ecoPointsBalance = data.balance || 0;
    updateEcoPointsWidget();
  } catch (error) {
    console.error('Error loading eco points:', error);
  }
}

// Create and insert eco points widget
function createEcoPointsWidget() {
  const widget = document.getElementById('ecoPointsWidget');
  if (!widget) return;

  widget.innerHTML = `
    <div class="eco-points-widget">
      <div class="eco-points-header">
        <div class="eco-points-title">
          <i class="fas fa-leaf"></i>
          <span>Eco Points</span>
        </div>
        <button class="btn-eco" onclick="showEcoPointsModal()" style="padding: 0.5rem 1rem; flex: none;">
          <i class="fas fa-info-circle"></i>
        </button>
      </div>
      <div class="eco-points-balance">
        <div class="eco-points-amount" id="ecoPointsAmount">0</div>
        <div class="eco-points-label">Points Balance</div>
      </div>
      <div class="eco-points-actions">
        <button class="btn-eco" onclick="showEcoHistory()">
          <i class="fas fa-history"></i> History
        </button>
        <button class="btn-eco" onclick="showRedemptions()">
          <i class="fas fa-gift"></i> Redeem
        </button>
      </div>
    </div>
  `;

  updateEcoPointsWidget();
}

// Update eco points widget display
function updateEcoPointsWidget() {
  const amountEl = document.getElementById('ecoPointsAmount');
  if (amountEl) {
    amountEl.textContent = ecoPointsBalance.toLocaleString();
  }
}

// Show eco points modal with stats
async function showEcoPointsModal() {
  try {
    const data = await apiGet('/api/eco-points/stats');
    ecoPointsStats = data;

    const modal = document.createElement('div');
    modal.className = 'eco-points-modal active';
    modal.id = 'ecoPointsModal';
    modal.innerHTML = `
      <div class="eco-modal-content">
        <div class="eco-modal-header">
          <h2><i class="fas fa-leaf"></i> Eco Points Overview</h2>
          <button class="eco-modal-close" onclick="closeEcoModal()">&times;</button>
        </div>
        <div class="eco-modal-body">
          <div class="eco-stats-grid">
            <div class="eco-stat-card">
              <div class="eco-stat-value">${data.balance.toLocaleString()}</div>
              <div class="eco-stat-label">Current Balance</div>
            </div>
            <div class="eco-stat-card">
              <div class="eco-stat-value">${data.totalEarned.toLocaleString()}</div>
              <div class="eco-stat-label">Total Earned</div>
            </div>
            <div class="eco-stat-card">
              <div class="eco-stat-value">${data.totalRedeemed.toLocaleString()}</div>
              <div class="eco-stat-label">Total Redeemed</div>
            </div>
          </div>

          <div class="eco-activities-section">
            <h3><i class="fas fa-award"></i> How to Earn Points</h3>
            ${getEarnActivitiesHTML()}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error showing eco points modal:', error);
  }
}

// Get HTML for earn activities
function getEarnActivitiesHTML() {
  const activities = [
    { name: 'Create Listing', points: 10, icon: 'fa-box', desc: 'Post a new waste listing' },
    { name: 'Listing Approved', points: 20, icon: 'fa-check-circle', desc: 'Your listing gets approved' },
    { name: 'Complete Transaction', points: 50, icon: 'fa-handshake', desc: 'Successful waste exchange' },
    { name: 'Volunteer Hour', points: 25, icon: 'fa-heart', desc: 'One hour of volunteering' },
    { name: 'Volunteer Shift', points: 100, icon: 'fa-hands-helping', desc: 'Complete a volunteer shift' },
    { name: 'Report Dump Site', points: 15, icon: 'fa-exclamation-triangle', desc: 'Submit illegal dump report' },
    { name: 'Verified Report', points: 30, icon: 'fa-shield-check', desc: 'Your report gets verified' },
    { name: 'First Listing Bonus', points: 50, icon: 'fa-star', desc: 'Your first ever listing' },
    { name: 'First Transaction', points: 100, icon: 'fa-trophy', desc: 'Your first completed deal' },
  ];

  return activities.map(activity => `
    <div class="eco-activity-item">
      <div class="eco-activity-icon">
        <i class="fas ${activity.icon}"></i>
      </div>
      <div class="eco-activity-details">
        <div class="eco-activity-name">${activity.name}</div>
        <div class="eco-activity-desc">${activity.desc}</div>
      </div>
      <div class="eco-activity-points">+${activity.points}</div>
    </div>
  `).join('');
}

// Show transaction history
async function showEcoHistory() {
  try {
    const data = await apiGet('/api/eco-points/history');
    ecoPointsHistory = data.transactions || [];

    const modal = document.createElement('div');
    modal.className = 'eco-points-modal active';
    modal.id = 'ecoPointsModal';
    modal.innerHTML = `
      <div class="eco-modal-content">
        <div class="eco-modal-header">
          <h2><i class="fas fa-history"></i> Points History</h2>
          <button class="eco-modal-close" onclick="closeEcoModal()">&times;</button>
        </div>
        <div class="eco-modal-body">
          <div class="eco-history">
            ${ecoPointsHistory.length > 0 ? ecoPointsHistory.map(t => `
              <div class="eco-transaction">
                <div class="eco-transaction-info">
                  <div class="eco-transaction-desc">${t.description}</div>
                  <div class="eco-transaction-date">${new Date(t.createdAt).toLocaleString()}</div>
                </div>
                <div class="eco-transaction-points ${t.type}">
                  ${t.type === 'earn' ? '+' : '-'}${t.points}
                </div>
              </div>
            `).join('') : '<p style="text-align: center; color: #666; padding: 2rem;">No transactions yet</p>'}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error showing history:', error);
  }
}

// Show redemption options
function showRedemptions() {
  const modal = document.createElement('div');
  modal.className = 'eco-points-modal active';
  modal.id = 'ecoPointsModal';
  modal.innerHTML = `
    <div class="eco-modal-content">
      <div class="eco-modal-header">
        <h2><i class="fas fa-gift"></i> Redeem Points</h2>
        <button class="eco-modal-close" onclick="closeEcoModal()">&times;</button>
      </div>
      <div class="eco-modal-body">
        <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <strong style="color: #2e7d32;">Your Balance: ${ecoPointsBalance.toLocaleString()} points</strong>
        </div>
        <div class="redemption-grid">
          <div class="redemption-card" onclick="redeemReward('Wallet Credit - KES 100', 500)">
            <div class="redemption-icon"><i class="fas fa-wallet"></i></div>
            <div class="redemption-name">Wallet Credit</div>
            <div class="redemption-cost">500 <span class="points-label">points</span></div>
            <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #666;">KES 100</div>
          </div>
          <div class="redemption-card" onclick="redeemReward('Wallet Credit - KES 250', 1000)">
            <div class="redemption-icon"><i class="fas fa-wallet"></i></div>
            <div class="redemption-name">Wallet Credit</div>
            <div class="redemption-cost">1000 <span class="points-label">points</span></div>
            <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #666;">KES 250</div>
          </div>
          <div class="redemption-card" onclick="redeemReward('Eco T-Shirt', 750)">
            <div class="redemption-icon"><i class="fas fa-tshirt"></i></div>
            <div class="redemption-name">Eco T-Shirt</div>
            <div class="redemption-cost">750 <span class="points-label">points</span></div>
          </div>
          <div class="redemption-card" onclick="redeemReward('Tree Planting Certificate', 300)">
            <div class="redemption-icon"><i class="fas fa-tree"></i></div>
            <div class="redemption-name">Tree Certificate</div>
            <div class="redemption-cost">300 <span class="points-label">points</span></div>
          </div>
          <div class="redemption-card" onclick="redeemReward('Eco Tote Bag', 400)">
            <div class="redemption-icon"><i class="fas fa-shopping-bag"></i></div>
            <div class="redemption-name">Eco Tote Bag</div>
            <div class="redemption-cost">400 <span class="points-label">points</span></div>
          </div>
          <div class="redemption-card" onclick="redeemReward('Discount Coupon - 10%', 200)">
            <div class="redemption-icon"><i class="fas fa-ticket-alt"></i></div>
            <div class="redemption-name">10% Discount</div>
            <div class="redemption-cost">200 <span class="points-label">points</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Redeem a reward
async function redeemReward(rewardName, points) {
  if (ecoPointsBalance < points) {
    alert(`Insufficient points! You need ${points} points but have ${ecoPointsBalance} points.`);
    return;
  }

  if (!confirm(`Redeem ${points} points for ${rewardName}?`)) {
    return;
  }

  try {
    await apiPost('/api/eco-points/redeem', {
      points,
      reward: rewardName,
      description: `Redeemed ${rewardName}`
    });

    alert(`Successfully redeemed ${rewardName}!`);
    closeEcoModal();
    loadEcoPoints(); // Refresh balance
  } catch (error) {
    console.error('Error redeeming reward:', error);
    alert(error.error || 'Failed to redeem reward');
  }
}

// Close eco points modal
function closeEcoModal() {
  const modal = document.getElementById('ecoPointsModal');
  if (modal) {
    modal.remove();
  }
}

// Initialize on page load (requires auth token and widget container)
document.addEventListener('DOMContentLoaded', () => {
  const hasWidget = !!document.getElementById('ecoPointsWidget');
  const hasToken = !!localStorage.getItem('token');
  if (!hasWidget || !hasToken) return;
  createEcoPointsWidget();
  loadEcoPoints();
});
