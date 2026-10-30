// Profile Management JavaScript

let currentUser = null;
let isEditMode = false;

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  const editBtn = document.getElementById('editProfileBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const profileForm = document.getElementById('profileForm');

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      toggleEditMode(true);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      toggleEditMode(false);
      loadProfile(); // Reload to reset form
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
}

// Load user profile
async function loadProfile() {
  try {
    const user = await apiGet('/api/auth/me');
    if (user && user.user) {
      currentUser = user.user;
      displayProfile(user.user);
    } else {
      showNotification('Failed to load profile', 'error');
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showNotification('Error loading profile. Please try again.', 'error');
  }
}

// Display profile in view mode
function displayProfile(user) {
  // Basic info
  document.getElementById('profileName').textContent = user.name || 'Not set';
  document.getElementById('profileEmail').textContent = user.email || 'Not set';
  document.getElementById('profilePhone').textContent = user.phone || 'Not set';
  
  const roleBadge = document.getElementById('profileRole');
  if (roleBadge) {
    roleBadge.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member';
    roleBadge.className = `role-badge ${user.role || 'member'}`;
  }

  // Avatar
  const avatarImg = document.getElementById('profileAvatarImg');
  if (avatarImg) {
    if (user.profile && user.profile.avatar) {
      avatarImg.src = user.profile.avatar;
    } else {
      // Use UI Avatars as fallback
      const name = encodeURIComponent(user.name || user.username || 'User');
      avatarImg.src = `https://ui-avatars.com/api/?name=${name}&background=2E7D32&color=fff&size=120`;
    }
  }

  // View mode fields
  document.getElementById('viewName').textContent = user.name || '-';
  document.getElementById('viewUsername').textContent = user.username || '-';
  document.getElementById('viewEmail').textContent = user.email || '-';
  document.getElementById('viewPhone').textContent = user.phone || '-';
  document.getElementById('viewDateOfBirth').textContent = 
    user.profile && user.profile.dateOfBirth 
      ? new Date(user.profile.dateOfBirth).toLocaleDateString() 
      : '-';
  document.getElementById('viewGender').textContent = 
    user.profile && user.profile.gender 
      ? user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1) 
      : '-';
  
  // Location
  document.getElementById('viewCounty').textContent = 
    user.profile && user.profile.location && user.profile.location.county 
      ? user.profile.location.county 
      : '-';
  document.getElementById('viewSubCounty').textContent = 
    user.profile && user.profile.location && user.profile.location.subCounty 
      ? user.profile.location.subCounty 
      : '-';
  document.getElementById('viewWard').textContent = 
    user.profile && user.profile.location && user.profile.location.ward 
      ? user.profile.location.ward 
      : '-';
  
  // Bio
  document.getElementById('viewBio').textContent = 
    user.profile && user.profile.bio 
      ? user.profile.bio 
      : 'No bio available';

  // Member profile
  if (user.role === 'member' && user.memberProfile) {
    document.getElementById('memberProfileSection').style.display = 'block';
    document.getElementById('viewMembershipType').textContent = 
      user.memberProfile.membershipType 
        ? user.memberProfile.membershipType.charAt(0).toUpperCase() + user.memberProfile.membershipType.slice(1) 
        : '-';
    document.getElementById('viewMembershipNumber').textContent = 
      user.memberProfile.membershipNumber || '-';
    document.getElementById('viewPoints').textContent = 
      user.memberProfile.points || 0;
    document.getElementById('viewWasteDiverted').textContent = 
      user.memberProfile.wasteDiverted || 0;
  }

  // Recycler profile
  if (user.role === 'recycler' && user.recyclerProfile) {
    document.getElementById('recyclerProfileSection').style.display = 'block';
    document.getElementById('viewBusinessName').textContent = 
      user.recyclerProfile.businessName || '-';
    document.getElementById('viewBusinessRegistration').textContent = 
      user.recyclerProfile.businessRegistration || '-';
    document.getElementById('viewNemaLicense').textContent = 
      user.recyclerProfile.nemaLicense || '-';
    
    const verificationStatus = document.getElementById('viewVerificationStatus');
    if (user.recyclerProfile.verified) {
      verificationStatus.innerHTML = '<span class="status-badge approved">Verified</span>';
    } else {
      verificationStatus.innerHTML = '<span class="status-badge pending">Pending Verification</span>';
    }
  }
}

// Toggle edit mode
function toggleEditMode(edit) {
  isEditMode = edit;
  const viewSection = document.getElementById('profileView');
  const editSection = document.getElementById('profileEdit');
  const editBtn = document.getElementById('editProfileBtn');

  if (edit) {
    viewSection.style.display = 'none';
    editSection.style.display = 'block';
    editBtn.style.display = 'none';
    populateEditForm(currentUser);
  } else {
    viewSection.style.display = 'block';
    editSection.style.display = 'none';
    editBtn.style.display = 'block';
  }
}

// Populate edit form
function populateEditForm(user) {
  document.getElementById('editName').value = user.name || '';
  document.getElementById('editPhone').value = user.phone || '';
  document.getElementById('editDateOfBirth').value = 
    user.profile && user.profile.dateOfBirth 
      ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] 
      : '';
  document.getElementById('editGender').value = 
    user.profile && user.profile.gender ? user.profile.gender : '';
  
  // Location
  document.getElementById('editCounty').value = 
    user.profile && user.profile.location && user.profile.location.county 
      ? user.profile.location.county 
      : '';
  document.getElementById('editSubCounty').value = 
    user.profile && user.profile.location && user.profile.location.subCounty 
      ? user.profile.location.subCounty 
      : '';
  document.getElementById('editWard').value = 
    user.profile && user.profile.location && user.profile.location.ward 
      ? user.profile.location.ward 
      : '';
  
  // Bio
  document.getElementById('editBio').value = 
    user.profile && user.profile.bio ? user.profile.bio : '';

  // Member profile
  if (user.role === 'member') {
    document.getElementById('memberProfileEditSection').style.display = 'block';
    document.getElementById('editMembershipType').value = 
      user.memberProfile && user.memberProfile.membershipType 
        ? user.memberProfile.membershipType 
        : '';
  }

  // Recycler profile
  if (user.role === 'recycler') {
    document.getElementById('recyclerProfileEditSection').style.display = 'block';
    document.getElementById('editBusinessName').value = 
      user.recyclerProfile && user.recyclerProfile.businessName 
        ? user.recyclerProfile.businessName 
        : '';
    document.getElementById('editBusinessRegistration').value = 
      user.recyclerProfile && user.recyclerProfile.businessRegistration 
        ? user.recyclerProfile.businessRegistration 
        : '';
    document.getElementById('editNemaLicense').value = 
      user.recyclerProfile && user.recyclerProfile.nemaLicense 
        ? user.recyclerProfile.nemaLicense 
        : '';
  }
}

// Handle profile update
async function handleProfileUpdate(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    profile: {
      dateOfBirth: formData.get('dateOfBirth') || null,
      gender: formData.get('gender') || null,
      bio: formData.get('bio') || '',
      location: {
        county: formData.get('county') || '',
        subCounty: formData.get('subCounty') || '',
        ward: formData.get('ward') || ''
      }
    }
  };

  // Add role-specific fields
  if (currentUser.role === 'member') {
    data.memberProfile = {
      membershipType: formData.get('membershipType') || null
    };
  }

  if (currentUser.role === 'recycler') {
    data.recyclerProfile = {
      businessName: formData.get('businessName') || '',
      businessRegistration: formData.get('businessRegistration') || '',
      nemaLicense: formData.get('nemaLicense') || ''
    };
  }

  try {
    const result = await apiPost('/api/users/profile', data);
    showNotification('Profile updated successfully!', 'success');
    currentUser = result.user;
    toggleEditMode(false);
    loadProfile(); // Reload to show updated data
  } catch (error) {
    console.error('Error updating profile:', error);
    showNotification(error.error || 'Failed to update profile', 'error');
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

