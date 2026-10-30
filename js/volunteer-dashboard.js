// Volunteer Dashboard JavaScript

let volunteers = [];
let activities = [];
let recognition = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  setupTabs();
  setupActivityForm();
  setupBroadcastForm();
  setupFilters();
});

// Load all dashboard data
async function loadDashboardData() {
  try {
    await Promise.all([
      loadStats(),
      loadVolunteers(),
      loadActivities(),
      loadRecognition(),
      loadImpact(),
      loadCompliance()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// Load dashboard stats
async function loadStats() {
  try {
    const data = await apiGet('/api/volunteers/stats');
    document.getElementById('totalVolunteers').textContent = data.total || 0;
    document.getElementById('newVolunteers').textContent = data.newThisMonth || 0;
    document.getElementById('activeVolunteers').textContent = data.active || 0;
    document.getElementById('dropOffRate').textContent = `${data.dropOffRate || 0}%`;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load volunteers list
async function loadVolunteers() {
  try {
    const data = await apiGet('/api/volunteers');
    volunteers = data.volunteers || [];
    displayVolunteers();
  } catch (error) {
    console.error('Error loading volunteers:', error);
    volunteers = [];
    displayVolunteers();
  }
}

// Display volunteers table
function displayVolunteers() {
  const tbody = document.getElementById('volunteersTableBody');
  
  if (volunteers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No volunteers found</td></tr>';
    return;
  }

  tbody.innerHTML = volunteers.map(vol => `
    <tr>
      <td>
        <div class="volunteer-name">
          <strong>${vol.name || 'N/A'}</strong>
          <small>${vol.volunteerId || 'No ID'}</small>
        </div>
      </td>
      <td>${vol.location?.county || 'N/A'} / ${vol.location?.ward || 'N/A'}</td>
      <td>
        <div class="skills-tags">
          ${(vol.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </td>
      <td>${vol.coordinator || 'Unassigned'}</td>
      <td>${vol.lastActivity ? new Date(vol.lastActivity).toLocaleDateString() : 'Never'}</td>
      <td><span class="badge ${vol.status === 'active' ? 'badge-success' : 'badge-secondary'}">${vol.status || 'inactive'}</span></td>
      <td>
        <button class="btn-sm btn-primary" onclick="viewVolunteer('${vol._id}')"><i class="fas fa-eye"></i></button>
      </td>
    </tr>
  `).join('');
}

// Load activities
async function loadActivities() {
  try {
    const data = await apiGet('/api/volunteers/activities');
    activities = data.activities || [];
    updateActivityCounts();
  } catch (error) {
    console.error('Error loading activities:', error);
  }
}

// Update activity counts
function updateActivityCounts() {
  const counts = {
    cleanup: 0,
    awareness: 0,
    sorting: 0,
    youth: 0,
    meeting: 0
  };

  activities.forEach(act => {
    if (counts.hasOwnProperty(act.type)) {
      counts[act.type]++;
    }
  });

  document.getElementById('cleanupsCount').textContent = counts.cleanup;
  document.getElementById('awarenessCount').textContent = counts.awareness;
  document.getElementById('sortingCount').textContent = counts.sorting;
  document.getElementById('youthCount').textContent = counts.youth;
  document.getElementById('meetingsCount').textContent = counts.meeting;
}

// Load recognition data
async function loadRecognition() {
  try {
    const data = await apiGet('/api/volunteers/recognition');
    recognition = data;
    displayTopVolunteers('monthly');
    updateBadgeCounts();
  } catch (error) {
    console.error('Error loading recognition:', error);
  }
}

// Display top volunteers
function displayTopVolunteers(period) {
  const containerId = period === 'monthly' ? 'topVolunteersMonthly' : 'topVolunteersQuarterly';
  const container = document.getElementById(containerId);
  const volunteers = recognition[period] || [];

  if (volunteers.length === 0) {
    container.innerHTML = '<p class="text-center">No data available</p>';
    return;
  }

  container.innerHTML = volunteers.map((vol, index) => `
    <div class="top-volunteer-card">
      <div class="rank rank-${index + 1}">${index + 1}</div>
      <div class="volunteer-info">
        <h4>${vol.name}</h4>
        <p>${vol.hours || 0} hours • ${vol.activities || 0} activities</p>
      </div>
      <div class="volunteer-badge">
        <i class="fas fa-trophy ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}"></i>
      </div>
    </div>
  `).join('');
}

// Update badge counts
function updateBadgeCounts() {
  document.getElementById('bronzeCount').textContent = `${recognition.badges?.bronze || 0} volunteers`;
  document.getElementById('silverCount').textContent = `${recognition.badges?.silver || 0} volunteers`;
  document.getElementById('goldCount').textContent = `${recognition.badges?.gold || 0} volunteers`;
}

// Load impact metrics
async function loadImpact() {
  try {
    const data = await apiGet('/api/volunteers/impact');
    document.getElementById('totalHours').textContent = data.hours || 0;
    document.getElementById('wasteCollected').textContent = `${data.wasteKg || 0} kg`;
    document.getElementById('householdsEngaged').textContent = data.households || 0;
    document.getElementById('sitesCovered').textContent = data.sites || 0;
  } catch (error) {
    console.error('Error loading impact:', error);
  }
}

// Load compliance data
async function loadCompliance() {
  try {
    const data = await apiGet('/api/volunteers/compliance');
    document.getElementById('conductCompliance').textContent = `${data.codeOfConduct || 0}% compliance`;
    document.getElementById('childProtection').textContent = `${data.childProtection || 0}% compliance`;
    document.getElementById('healthSafety').textContent = `${data.healthSafety || 0}% compliance`;
    document.getElementById('dataConsent').textContent = `${data.dataConsent || 0}% compliance`;
  } catch (error) {
    console.error('Error loading compliance:', error);
  }
}

// Setup tabs
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Update active states
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${tab}-tab`).classList.add('active');
      
      // Load data for specific tab
      if (tab === 'monthly') displayTopVolunteers('monthly');
      if (tab === 'quarterly') displayTopVolunteers('quarterly');
    });
  });
}

// Setup activity form
function setupActivityForm() {
  const form = document.getElementById('activityForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitActivity();
  });
}

// Submit activity
async function submitActivity() {
  const form = document.getElementById('activityForm');
  const formData = new FormData(form);

  const data = {
    activityType: formData.get('activityType'),
    activityDate: formData.get('activityDate'),
    hoursSpent: parseFloat(formData.get('hoursSpent')),
    location: formData.get('location'),
    participants: parseInt(formData.get('participants')) || 0,
    wasteAmount: parseFloat(formData.get('wasteAmount')) || 0,
    notes: formData.get('activityNotes')
  };

  try {
    await apiPost('/api/volunteers/activities', data);
    showNotification('Activity logged successfully!', 'success');
    closeLogActivity();
    form.reset();
    loadDashboardData();
  } catch (error) {
    console.error('Error logging activity:', error);
    showNotification(error.error || 'Failed to log activity', 'error');
  }
}

// Setup broadcast form
function setupBroadcastForm() {
  const form = document.getElementById('broadcastForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendBroadcast();
  });
}

// Send broadcast
async function sendBroadcast() {
  const form = document.getElementById('broadcastForm');
  const formData = new FormData(form);

  const data = {
    messageType: formData.get('messageType'),
    subject: formData.get('messageSubject'),
    body: formData.get('messageBody'),
    targetAudience: formData.get('targetAudience')
  };

  try {
    await apiPost('/api/volunteers/broadcast', data);
    showNotification('Broadcast sent successfully!', 'success');
    closeBroadcast();
    form.reset();
  } catch (error) {
    console.error('Error sending broadcast:', error);
    showNotification(error.error || 'Failed to send broadcast', 'error');
  }
}

// Setup filters
function setupFilters() {
  const searchInput = document.getElementById('searchVolunteers');
  const skillFilter = document.getElementById('filterSkill');
  const statusFilter = document.getElementById('filterStatus');

  if (searchInput) {
    searchInput.addEventListener('input', filterVolunteers);
  }
  if (skillFilter) {
    skillFilter.addEventListener('change', filterVolunteers);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterVolunteers);
  }
}

// Filter volunteers
function filterVolunteers() {
  const searchTerm = document.getElementById('searchVolunteers').value.toLowerCase();
  const skillFilter = document.getElementById('filterSkill').value;
  const statusFilter = document.getElementById('filterStatus').value;

  const filtered = volunteers.filter(vol => {
    const matchesSearch = !searchTerm || 
      vol.name?.toLowerCase().includes(searchTerm) ||
      vol.volunteerId?.toLowerCase().includes(searchTerm);
    
    const matchesSkill = !skillFilter || vol.skills?.includes(skillFilter);
    const matchesStatus = !statusFilter || vol.status === statusFilter;

    return matchesSearch && matchesSkill && matchesStatus;
  });

  displayFilteredVolunteers(filtered);
}

// Display filtered volunteers
function displayFilteredVolunteers(filtered) {
  const tbody = document.getElementById('volunteersTableBody');
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No volunteers match the filters</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(vol => `
    <tr>
      <td>
        <div class="volunteer-name">
          <strong>${vol.name || 'N/A'}</strong>
          <small>${vol.volunteerId || 'No ID'}</small>
        </div>
      </td>
      <td>${vol.location?.county || 'N/A'} / ${vol.location?.ward || 'N/A'}</td>
      <td>
        <div class="skills-tags">
          ${(vol.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </td>
      <td>${vol.coordinator || 'Unassigned'}</td>
      <td>${vol.lastActivity ? new Date(vol.lastActivity).toLocaleDateString() : 'Never'}</td>
      <td><span class="badge ${vol.status === 'active' ? 'badge-success' : 'badge-secondary'}">${vol.status || 'inactive'}</span></td>
      <td>
        <button class="btn-sm btn-primary" onclick="viewVolunteer('${vol._id}')"><i class="fas fa-eye"></i></button>
      </td>
    </tr>
  `).join('');
}

// Modal functions
function showLogActivity() {
  document.getElementById('logActivityModal').style.display = 'flex';
}

function closeLogActivity() {
  document.getElementById('logActivityModal').style.display = 'none';
}

function showBroadcast() {
  document.getElementById('broadcastModal').style.display = 'flex';
}

function closeBroadcast() {
  document.getElementById('broadcastModal').style.display = 'none';
}

function showRecognition() {
  // Scroll to recognition section
  document.querySelector('.recognition-section').scrollIntoView({ behavior: 'smooth' });
}

function showReports() {
  window.location.href = '/reports.html';
}

function viewVolunteer(id) {
  window.location.href = `/portal/volunteer/profile.html?id=${id}`;
}

// Notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
