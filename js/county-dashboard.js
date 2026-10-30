// County Dashboard JavaScript

let currentCounty = 'kirinyaga';
let currentPeriod = 'monthly';
let wasteChart = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  setupSelectors();
  loadDashboardData();
});

// Setup county and period selectors
function setupSelectors() {
  const countySelect = document.getElementById('countySelect');
  const periodSelect = document.getElementById('periodSelect');

  if (countySelect) {
    countySelect.addEventListener('change', (e) => {
      currentCounty = e.target.value;
      loadDashboardData();
    });
  }

  if (periodSelect) {
    periodSelect.addEventListener('change', (e) => {
      currentPeriod = e.target.value;
      loadDashboardData();
    });
  }
}

// Load all dashboard data
async function loadDashboardData() {
  try {
    await Promise.all([
      loadOverviewStats(),
      loadUserStats(),
      loadWasteBreakdown(),
      loadGeographicData(),
      loadOperationsData(),
      loadRecyclerPerformance(),
      loadAgentActivity(),
      loadComplianceRisks(),
      loadFinancialData(),
      loadEnvironmentalImpact()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// Load overview statistics
async function loadOverviewStats() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/stats?period=${currentPeriod}`);
    
    document.getElementById('wasteGenerated').textContent = (data.wasteGenerated || 0).toFixed(2);
    document.getElementById('wasteCollected').textContent = (data.wasteCollected || 0).toFixed(2);
    document.getElementById('wasteRecycled').textContent = (data.wasteRecycled || 0).toFixed(2);
    
    const recyclingRate = data.wasteGenerated > 0 
      ? ((data.wasteRecycled / data.wasteGenerated) * 100).toFixed(1)
      : 0;
    document.getElementById('recyclingRate').textContent = `${recyclingRate}%`;
  } catch (error) {
    console.error('Error loading overview stats:', error);
  }
}

// Load user statistics
async function loadUserStats() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/users`);
    
    document.getElementById('activeGenerators').textContent = data.generators || 0;
    document.getElementById('activeRecyclers').textContent = data.recyclers || 0;
    document.getElementById('activeAgents').textContent = data.agents || 0;
  } catch (error) {
    console.error('Error loading user stats:', error);
  }
}

// Load and display waste breakdown
async function loadWasteBreakdown() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/waste-breakdown?period=${currentPeriod}`);
    
    const categories = {
      plastic: data.plastic || 0,
      organic: data.organic || 0,
      paper: data.paper || 0,
      metal: data.metal || 0,
      glass: data.glass || 0,
      ewaste: data.ewaste || 0
    };

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

    // Update list
    Object.keys(categories).forEach(cat => {
      const value = categories[cat];
      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      
      document.getElementById(`${cat}Value`).textContent = `${value.toFixed(2)} tons`;
      document.getElementById(`${cat}Percent`).textContent = `${percent}%`;
    });

    // Create chart
    createWasteChart(categories);
  } catch (error) {
    console.error('Error loading waste breakdown:', error);
  }
}

// Create waste breakdown chart
function createWasteChart(data) {
  const ctx = document.getElementById('wasteBreakdownChart');
  if (!ctx) return;

  if (wasteChart) {
    wasteChart.destroy();
  }

  wasteChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Plastic', 'Organic', 'Paper', 'Metal', 'Glass', 'E-waste'],
      datasets: [{
        data: [data.plastic, data.organic, data.paper, data.metal, data.glass, data.ewaste],
        backgroundColor: [
          '#2196F3',
          '#4CAF50',
          '#FF9800',
          '#9E9E9E',
          '#00BCD4',
          '#F44336'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Load geographic data
async function loadGeographicData() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/geographic`);
    
    document.getElementById('highVolumeZones').textContent = data.highVolumeZones || 0;
    document.getElementById('collectionPoints').textContent = data.collectionPoints || 0;
    document.getElementById('dumpingHotspots').textContent = data.dumpingHotspots || 0;
    document.getElementById('recyclerLocations').textContent = data.recyclerLocations || 0;
  } catch (error) {
    console.error('Error loading geographic data:', error);
  }
}

// Load operations data
async function loadOperationsData() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/operations?period=${currentPeriod}`);
    
    document.getElementById('pickupsCompleted').textContent = data.pickupsCompleted || 0;
    document.getElementById('pickupsMissed').textContent = data.pickupsMissed || 0;
    document.getElementById('avgTurnaround').textContent = `${data.avgTurnaround || 0}h`;
    document.getElementById('wasteBacklog').textContent = data.wasteBacklog || 0;
  } catch (error) {
    console.error('Error loading operations data:', error);
  }
}

// Load recycler performance
async function loadRecyclerPerformance() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/recycler-performance?period=${currentPeriod}`);
    
    document.getElementById('activeRecyclersCount').textContent = data.activeCount || 0;
    document.getElementById('avgVolumePerRecycler').textContent = `${(data.avgVolume || 0).toFixed(2)} tons`;
    document.getElementById('complianceRate').textContent = `${data.complianceRate || 0}%`;
    document.getElementById('reliabilityScore').textContent = `${(data.reliabilityScore || 0).toFixed(1)}/10`;
    document.getElementById('rejectedLoads').textContent = data.rejectedLoads || 0;
  } catch (error) {
    console.error('Error loading recycler performance:', error);
  }
}

// Load agent activity
async function loadAgentActivity() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/agent-activity?period=${currentPeriod}`);
    
    document.getElementById('activeAgentsCount').textContent = data.activeCount || 0;
    document.getElementById('uploadsVerified').textContent = data.uploadsVerified || 0;
    document.getElementById('siteInspections').textContent = data.siteInspections || 0;
    document.getElementById('communityEngagements').textContent = data.communityEngagements || 0;
  } catch (error) {
    console.error('Error loading agent activity:', error);
  }
}

// Load compliance and risk flags
async function loadComplianceRisks() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/compliance-risks`);
    
    document.getElementById('unverifiedUploads').textContent = `${data.unverifiedUploads || 0} pending verification`;
    document.getElementById('repeatedMissed').textContent = `${data.repeatedMissed || 0} instances`;
    document.getElementById('illegalDumping').textContent = `${data.illegalDumping || 0} active reports`;
    document.getElementById('nonCompliant').textContent = `${data.nonCompliant || 0} flagged`;
  } catch (error) {
    console.error('Error loading compliance risks:', error);
  }
}

// Load financial data
async function loadFinancialData() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/financial?period=${currentPeriod}`);
    
    document.getElementById('wasteValue').textContent = `KES ${(data.wasteValue || 0).toLocaleString()}`;
    document.getElementById('paymentsProcessed').textContent = `KES ${(data.paymentsProcessed || 0).toLocaleString()}`;
    document.getElementById('avgPricePlastic').textContent = `KES ${(data.avgPricePlastic || 0).toFixed(2)}/kg`;
    document.getElementById('avgPriceMetal').textContent = `KES ${(data.avgPriceMetal || 0).toFixed(2)}/kg`;
    document.getElementById('operationalCosts').textContent = `KES ${(data.operationalCosts || 0).toLocaleString()}`;
  } catch (error) {
    console.error('Error loading financial data:', error);
  }
}

// Load environmental impact
async function loadEnvironmentalImpact() {
  try {
    const data = await apiGet(`/api/county/${currentCounty}/environmental-impact?period=${currentPeriod}`);
    
    document.getElementById('wasteDiverted').textContent = `${(data.wasteDiverted || 0).toFixed(2)} tons`;
    document.getElementById('co2Avoided').textContent = `${(data.co2Avoided || 0).toLocaleString()} kg`;
    document.getElementById('riskReduction').textContent = `${data.riskReduction || 0}%`;
  } catch (error) {
    console.error('Error loading environmental impact:', error);
  }
}
