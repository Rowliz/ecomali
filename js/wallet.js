/**
 * Wallet UI Component
 * Can be included in any dashboard
 */

// API helpers for wallet
async function getWalletBalance() {
  const response = await fetch('/api/wallet/balance', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to get balance');
  return response.json();
}

async function getTransactionStatus(transactionId) {
  const response = await fetch(`/api/wallet/status/${transactionId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to get transaction status');
  return response.json();
}

async function getWalletTransactions(limit = 20, skip = 0) {
  const response = await fetch(`/api/wallet/transactions?limit=${limit}&skip=${skip}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to get transactions');
  return response.json();
}

async function depositToWallet(amount, description = '') {
  const paymentMethod = document.getElementById('depositMethod')?.value || 'mpesa';
  const phoneNumber = document.getElementById('depositPhone')?.value || '';
  const accountNumber = document.getElementById('depositAccount')?.value || '';

  const response = await fetch('/api/wallet/deposit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      description,
      paymentMethod,
      phoneNumber,
      accountNumber
    })
  });
  if (!response.ok) {
    try {
      const error = await response.json();
      console.error('Deposit failed:', error);
      throw new Error(error.details || error.error || 'Failed to deposit');
    } catch (e) {
      const text = await response.text();
      console.error('Deposit failed (non-JSON):', text);
      throw new Error('Service unavailable or endpoint not reachable');
    }
  }
  return response.json();
}

async function withdrawFromWallet(amount, description = '') {
  const paymentMethod = document.getElementById('withdrawMethod')?.value || 'mpesa';
  const phoneNumber = document.getElementById('withdrawPhone')?.value || '';
  const accountNumber = document.getElementById('withdrawAccount')?.value || '';

  const response = await fetch('/api/wallet/withdraw', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      description,
      paymentMethod,
      phoneNumber,
      accountNumber
    })
  });
  if (!response.ok) {
    try {
      const error = await response.json();
      console.error('Withdrawal failed:', error);
      throw new Error(error.details || error.error || 'Failed to withdraw');
    } catch (e) {
      const text = await response.text();
      console.error('Withdrawal failed (non-JSON):', text);
      throw new Error('Service unavailable or endpoint not reachable');
    }
  }
  return response.json();
}

async function getPaymentMethods() {
  const response = await fetch('/api/wallet/payment-methods', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.paymentMethods || [];
}

// Wallet UI Component
class WalletWidget {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
    // Prevent duplicate render if script initializes twice
    if (this.container.dataset.initialized === 'true') {
      return;
    }
    this.container.dataset.initialized = 'true';
    this.paymentMethods = [];
    this.loadPaymentMethods();
    this.render();
    this.loadBalance();
  }

  async loadPaymentMethods() {
    try {
      this.paymentMethods = await getPaymentMethods();
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="wallet-widget">
        <div class="wallet-header">
          <h3><i class="fas fa-wallet"></i> Wallet</h3>
        </div>
        <div class="wallet-balance">
          <div class="balance-label">Available Balance</div>
          <div class="balance-amount" id="walletBalance">
            <span class="currency">KES</span>
            <span class="amount">0.00</span>
          </div>
        </div>
        <div class="wallet-actions">
          <button class="btn-primary" onclick="walletWidget.showDepositModal()">
            <i class="fas fa-plus"></i> Deposit
          </button>
          <button class="btn-secondary" onclick="walletWidget.showWithdrawModal()">
            <i class="fas fa-minus"></i> Withdraw
          </button>
          <button class="btn-secondary" onclick="walletWidget.showHistory()">
            <i class="fas fa-history"></i> History
          </button>
        </div>
      </div>

      <!-- Deposit Modal -->
      <div id="depositModal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close" onclick="walletWidget.closeDepositModal()">&times;</span>
          <h2>Deposit Funds</h2>
          <form id="depositForm" onsubmit="walletWidget.handleDeposit(event)">
            <div class="form-group">
              <label>Amount (KES)</label>
              <input type="number" id="depositAmount" required min="1" step="0.01" placeholder="Enter amount">
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select id="depositMethod" onchange="walletWidget.updateDepositFields()" required>
                <option value="">Select payment method</option>
              </select>
            </div>
            <div class="form-group" id="depositPhoneGroup" style="display: none;">
              <label>Phone Number</label>
              <input type="tel" id="depositPhone" placeholder="e.g., 0712345678">
            </div>
            <div class="form-group" id="depositAccountGroup" style="display: none;">
              <label>Account Number</label>
              <input type="text" id="depositAccount" placeholder="Enter account number">
            </div>
            <div class="form-group">
              <label>Description (optional)</label>
              <input type="text" id="depositDescription" placeholder="e.g., Initial deposit">
            </div>
            <button type="submit" class="btn-primary">Initiate Deposit</button>
          </form>
        </div>
      </div>

      <!-- Withdraw Modal -->
      <div id="withdrawModal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close" onclick="walletWidget.closeWithdrawModal()">&times;</span>
          <h2>Withdraw Funds</h2>
          <form id="withdrawForm" onsubmit="walletWidget.handleWithdraw(event)">
            <div class="form-group">
              <label>Amount (KES)</label>
              <input type="number" id="withdrawAmount" required min="1" step="0.01" placeholder="Enter amount">
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select id="withdrawMethod" onchange="walletWidget.updateWithdrawFields()" required>
                <option value="">Select payment method</option>
              </select>
            </div>
            <div class="form-group" id="withdrawPhoneGroup" style="display: none;">
              <label>Phone Number</label>
              <input type="tel" id="withdrawPhone" placeholder="e.g., 0712345678">
            </div>
            <div class="form-group" id="withdrawAccountGroup" style="display: none;">
              <label>Account Number</label>
              <input type="text" id="withdrawAccount" placeholder="Enter account number">
            </div>
            <div class="form-group">
              <label>Description (optional)</label>
              <input type="text" id="withdrawDescription" placeholder="e.g., Bank transfer">
            </div>
            <button type="submit" class="btn-primary">Request Withdrawal</button>
          </form>
        </div>
      </div>

      <!-- History Modal -->
      <div id="historyModal" class="modal" style="display: none;">
        <div class="modal-content modal-large">
          <span class="close" onclick="walletWidget.closeHistoryModal()">&times;</span>
          <h2>Wallet Transaction History</h2>
          <div id="transactionHistory"></div>
        </div>
      </div>
    `;
  }

  async loadBalance() {
    try {
      const data = await getWalletBalance();
      const amountEl = this.container.querySelector('.balance-amount .amount');
      if (amountEl) {
        amountEl.textContent = (data.balance || 0).toLocaleString('en-KE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    } catch (error) {
      console.error('Load balance error:', error);
    }
  }

  populatePaymentMethods() {
    const depositSelect = document.getElementById('depositMethod');
    const withdrawSelect = document.getElementById('withdrawMethod');

    if (depositSelect && this.paymentMethods.length > 0) {
      depositSelect.innerHTML = '<option value="">Select payment method</option>' +
        this.paymentMethods.map(m =>
          `<option value="${m.id}"><i class="fas fa-${m.icon}"></i> ${m.name}</option>`
        ).join('');
    }

    if (withdrawSelect && this.paymentMethods.length > 0) {
      withdrawSelect.innerHTML = '<option value="">Select payment method</option>' +
        this.paymentMethods.map(m =>
          `<option value="${m.id}"><i class="fas fa-${m.icon}"></i> ${m.name}</option>`
        ).join('');
    }
  }

  updateDepositFields() {
    const method = document.getElementById('depositMethod').value;
    const phoneGroup = document.getElementById('depositPhoneGroup');
    const accountGroup = document.getElementById('depositAccountGroup');
    const phoneInput = document.getElementById('depositPhone');
    const accountInput = document.getElementById('depositAccount');

    // Hide all fields first
    phoneGroup.style.display = 'none';
    accountGroup.style.display = 'none';
    phoneInput.removeAttribute('required');
    accountInput.removeAttribute('required');

    // Show relevant fields based on method
    if (method === 'mpesa' || method === 'airtel') {
      phoneGroup.style.display = 'block';
      phoneInput.setAttribute('required', 'required');
    } else if (method === 'bank' || method === 'equity' || method === 'kcb') {
      accountGroup.style.display = 'block';
      accountInput.setAttribute('required', 'required');
    }
  }

  updateWithdrawFields() {
    const method = document.getElementById('withdrawMethod').value;
    const phoneGroup = document.getElementById('withdrawPhoneGroup');
    const accountGroup = document.getElementById('withdrawAccountGroup');
    const phoneInput = document.getElementById('withdrawPhone');
    const accountInput = document.getElementById('withdrawAccount');

    // Hide all fields first
    phoneGroup.style.display = 'none';
    accountGroup.style.display = 'none';
    phoneInput.removeAttribute('required');
    accountInput.removeAttribute('required');

    // Show relevant fields based on method
    if (method === 'mpesa' || method === 'airtel') {
      phoneGroup.style.display = 'block';
      phoneInput.setAttribute('required', 'required');
    } else if (method === 'bank' || method === 'equity' || method === 'kcb') {
      accountGroup.style.display = 'block';
      accountInput.setAttribute('required', 'required');
    }
  }

  showDepositModal() {
    this.populatePaymentMethods();
    document.getElementById('depositModal').style.display = 'flex';
  }

  closeDepositModal() {
    document.getElementById('depositModal').style.display = 'none';
    document.getElementById('depositForm').reset();
    document.getElementById('depositPhoneGroup').style.display = 'none';
    document.getElementById('depositAccountGroup').style.display = 'none';
  }

  showWithdrawModal() {
    this.populatePaymentMethods();
    document.getElementById('withdrawModal').style.display = 'flex';
  }

  closeWithdrawModal() {
    document.getElementById('withdrawModal').style.display = 'none';
    document.getElementById('withdrawForm').reset();
    document.getElementById('withdrawPhoneGroup').style.display = 'none';
    document.getElementById('withdrawAccountGroup').style.display = 'none';
  }

  async handleDeposit(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const description = document.getElementById('depositDescription').value;
    const paymentMethod = document.getElementById('depositMethod').value;
    const submitBtn = document.getElementById('depositForm').querySelector('button[type="submit"]');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Initiating STK Push...';

      const result = await depositToWallet(amount, description);

      if (paymentMethod === 'mpesa' && result.transaction?.checkoutRequestId) {
        submitBtn.textContent = 'Check your phone for PIN prompt...';

        // Start polling for status
        const transactionId = result.transaction._id;
        let pollCount = 0;
        const maxPolls = 20; // 60 seconds (3s * 20)

        const pollInterval = setInterval(async () => {
          pollCount++;
          try {
            const statusData = await getTransactionStatus(transactionId);

            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              alert(`Success! KES ${amount.toLocaleString()} deposited to your wallet.`);
              this.loadBalance();
              this.closeDepositModal();
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              alert(`Payment failed: ${statusData.description || 'Transaction was cancelled or timed out'}.`);
              submitBtn.disabled = false;
              submitBtn.textContent = 'Initiate Deposit';
            } else if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              alert('Payment is still pending. We will update your balance once confirmation is received.');
              this.closeDepositModal();
            }
          } catch (pollError) {
            console.error('Polling error:', pollError);
          }
        }, 3000); // Poll every 3 seconds

      } else {
        // Normal flow (bank transfer etc)
        alert(result.message || 'Deposit initiated successfully! Waiting for approval.');
        this.closeDepositModal();
      }

      this.loadBalance();
    } catch (error) {
      alert(error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Initiate Deposit';
    }
  }

  async handleWithdraw(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const description = document.getElementById('withdrawDescription').value;

    try {
      const result = await withdrawFromWallet(amount, description);
      alert(result.message || 'Withdrawal successful!');
      this.closeWithdrawModal();
      this.loadBalance();
    } catch (error) {
      alert(error.message);
    }
  }

  async showHistory() {
    const modal = document.getElementById('historyModal');
    modal.style.display = 'flex';

    try {
      const data = await getWalletTransactions(50, 0);
      const historyDiv = document.getElementById('transactionHistory');

      if (!data.transactions || data.transactions.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No transactions yet</p>';
        return;
      }

      const html = `
        <table class="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Balance After</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.map(tx => `
              <tr>
                <td>${new Date(tx.createdAt).toLocaleString()}</td>
                <td><span class="tx-type tx-${tx.type}">${tx.type}</span></td>
                <td>${tx.description}</td>
                <td class="${tx.type === 'withdrawal' || tx.type === 'purchase' ? 'negative' : 'positive'}">
                  ${tx.type === 'withdrawal' || tx.type === 'purchase' ? '-' : '+'}
                  KES ${tx.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </td>
                <td>KES ${tx.balanceAfter.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                <td><span class="status-${tx.status}">${tx.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      historyDiv.innerHTML = html;
    } catch (error) {
      document.getElementById('transactionHistory').innerHTML =
        `<p class="error">Failed to load history: ${error.message}</p>`;
    }
  }

  closeHistoryModal() {
    document.getElementById('historyModal').style.display = 'none';
  }
}

// Global instance
let walletWidget;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const walletContainer = document.getElementById('walletWidget');
  if (walletContainer) {
    walletWidget = new WalletWidget('walletWidget');
  }
});