// Partners Dashboard JavaScript

let projects = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

// Load dashboard data
async function loadDashboardData() {
  try {
    await Promise.all([
      loadProjects(),
      loadStats()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error loading dashboard data', 'error');
  }
}

// Load projects
async function loadProjects() {
  try {
    const data = await apiGet('/api/partners/projects');
    projects = data.projects || [];
    displayProjects();
  } catch (error) {
    console.error('Error loading projects:', error);
    projects = [];
    displayProjects();
  }
}

// Load stats
async function loadStats() {
  try {
    const data = await apiGet('/api/partners/stats');
    updateStats(data);
  } catch (error) {
    console.error('Error loading stats:', error);
    // Set default values
    updateStats({
      activeProjects: 0,
      peopleReached: 0,
      wasteDiverted: 0,
      impactScore: 0
    });
  }
}

// Update stats display
function updateStats(data) {
  document.getElementById('activeProjects').textContent = data.activeProjects || 0;
  document.getElementById('peopleReached').textContent = (data.peopleReached || 0).toLocaleString();
  document.getElementById('wasteDiverted').textContent = `${(data.wasteDiverted || 0).toLocaleString()} kg`;
  document.getElementById('impactScore').textContent = `${data.impactScore || 0}%`;
}

// Display projects
function displayProjects() {
  const container = document.getElementById('projectsContainer');
  if (!container) return;

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-project-diagram"></i>
        <p>No active projects</p>
        <p style="margin-top: 1rem; font-size: 0.9rem; color: #999;">Contact us to start your first partnership project</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map(project => `
    <div class="project-card">
      <div class="project-header">
        <div class="project-title">
          <h3>${project.name}</h3>
          <p>${project.description || 'No description'}</p>
        </div>
        <span class="project-status ${project.status}">${project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span>
      </div>
      <div class="project-details">
        <p><strong>Start Date:</strong> ${new Date(project.startDate).toLocaleDateString()}</p>
        ${project.endDate ? `<p><strong>End Date:</strong> ${new Date(project.endDate).toLocaleDateString()}</p>` : ''}
        ${project.budget ? `<p><strong>Budget:</strong> KES ${project.budget.toLocaleString()}</p>` : ''}
      </div>
    </div>
  `).join('');
}

// Open new project modal
function openNewProjectModal() {
  showNotification('Please contact partnerships@ecomaliexchange.co.ke to start a new project', 'info');
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
    max-width: 400px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

