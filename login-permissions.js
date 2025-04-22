// Combined Login and Permissions Component
// This component integrates user login with permissions management

// Function to initialize the login and permissions component
function initLoginPermissions() {
  // State management
  let isLoggedIn = localStorage.getItem('user_logged_in') === 'true';
  let email = localStorage.getItem('user_email') || '';
  let userName = localStorage.getItem('user_name') || '';
  let isLoading = false;
  let error = null;
  let userPermissions = JSON.parse(localStorage.getItem('user_permissions') || '["cookies"]');
  let badgeLevel = parseInt(localStorage.getItem('user_badge_level') || '1');

  // DOM elements
  const loginForm = document.getElementById('login-form');
  const permissionsSection = document.getElementById('permissions-section');
  const loggedInSection = document.getElementById('logged-in-section');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const errorMessage = document.getElementById('error-message');
  const permissionCheckboxes = document.querySelectorAll('.permission-checkbox');
  const badgeDisplay = document.getElementById('badge-display');
  const userNameDisplay = document.getElementById('user-name-display');
  const userEmailDisplay = document.getElementById('user-email-display');

  // Update UI based on login state
  function updateUI() {
    if (isLoggedIn) {
      if (loginForm) loginForm.style.display = 'none';
      if (loggedInSection) loggedInSection.style.display = 'block';
      if (userNameDisplay) userNameDisplay.textContent = userName;
      if (userEmailDisplay) userEmailDisplay.textContent = email;

      // Enable all permission checkboxes
      permissionCheckboxes.forEach(checkbox => {
        checkbox.disabled = false;
        checkbox.checked = userPermissions.includes(checkbox.id.replace('-checkbox', ''));
      });

      // Update badge display
      updateBadgeDisplay();

      // Update Agent Lee with user info
      if (window.AgentLee) {
        window.AgentLee.speak("Welcome back, " + userName + ". I'm here to help you.");
      }
    } else {
      if (loginForm) loginForm.style.display = 'block';
      if (loggedInSection) loggedInSection.style.display = 'none';

      // Disable login-required permission checkboxes
      permissionCheckboxes.forEach(checkbox => {
        if (checkbox.dataset.loginRequired === 'true') {
          checkbox.disabled = true;
          checkbox.checked = false;
        } else {
          checkbox.checked = userPermissions.includes(checkbox.id.replace('-checkbox', ''));
        }
      });
    }

    // Show/hide error message
    if (errorMessage) {
      if (error) {
        errorMessage.textContent = error;
        errorMessage.style.display = 'block';
      } else {
        errorMessage.style.display = 'none';
      }
    }

    // Update loading state
    if (loginButton) {
      loginButton.disabled = isLoading;
      loginButton.innerHTML = isLoading ?
        '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Signing in...' :
        'Sign in';
    }
  }

  // Update badge display
  function updateBadgeDisplay() {
    if (!badgeDisplay) return;

    // Clear existing badges
    badgeDisplay.innerHTML = '';

    // Add badge based on level
    const badge = document.createElement('div');
    badge.className = `h-8 w-8 rounded-full flex items-center justify-center text-xs ${
      badgeLevel === 1 ? 'bg-yellow-700 text-white' :
      badgeLevel === 2 ? 'bg-gray-300 text-gray-800 animate-pulse' :
      'bg-yellow-400 text-yellow-800'
    }`;
    badge.innerHTML = badgeLevel === 1 ? '1️⃣' : badgeLevel === 2 ? '2️⃣' : '3️⃣';
    badgeDisplay.appendChild(badge);

    // Add notification badge if enabled
    if (userPermissions.includes('notifications')) {
      const notificationBadge = document.createElement('div');
      notificationBadge.className = 'h-8 w-8 rounded-full bg-yellow-700 text-white flex items-center justify-center text-xs';
      notificationBadge.innerHTML = '4️⃣';
      badgeDisplay.appendChild(notificationBadge);
    }
  }

  // Handle login
  function handleLogin() {
    const emailValue = emailInput ? emailInput.value : '';
    const passwordValue = passwordInput ? passwordInput.value : '';

    if (!emailValue || !passwordValue) {
      error = 'Please fill in all fields';
      updateUI();
      return;
    }

    isLoading = true;
    error = null;
    updateUI();

    // Simulate API call
    setTimeout(() => {
      isLoggedIn = true;
      email = emailValue;
      userName = emailValue.split('@')[0]; // Extract name from email

      // Save to localStorage
      localStorage.setItem('user_logged_in', 'true');
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', userName);

      // Update Agent Lee's knowledge of the user
      if (window.AgentLee) {
        window.AgentLee.speak("Welcome, " + userName + "! I'll remember you when you return.");
      }

      isLoading = false;
      updateUI();
    }, 1500);
  }

  // Handle logout
  function handleLogout() {
    isLoggedIn = false;
    email = '';
    userName = '';
    badgeLevel = 1;
    userPermissions = ['cookies'];

    // Update localStorage
    localStorage.setItem('user_logged_in', 'false');
    localStorage.setItem('user_email', '');
    localStorage.setItem('user_name', '');
    localStorage.setItem('user_badge_level', '1');
    localStorage.setItem('user_permissions', JSON.stringify(userPermissions));

    updateUI();
  }

  // Handle permission change
  function handlePermissionChange(permissionId) {
    if (userPermissions.includes(permissionId)) {
      userPermissions = userPermissions.filter(p => p !== permissionId);
    } else {
      userPermissions.push(permissionId);

      // For demo: If user enables notifications, upgrade badge
      if (permissionId === 'notifications' && isLoggedIn) {
        badgeLevel = 2;
        localStorage.setItem('user_badge_level', '2');
      }
    }

    // Save to localStorage
    localStorage.setItem('user_permissions', JSON.stringify(userPermissions));

    updateUI();
  }

  // Add event listeners
  function addEventListeners() {
    // Login button
    if (loginButton) {
      loginButton.addEventListener('click', handleLogin);
    }

    // Logout button
    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }

    // Permission checkboxes
    permissionCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const permissionId = checkbox.id.replace('-checkbox', '');
        handlePermissionChange(permissionId);
      });
    });

    // Email and password inputs (for Enter key)
    if (emailInput) {
      emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    }
  }

  // Initialize
  function init() {
    updateUI();
    addEventListeners();
  }

  // Return public methods
  return {
    init,
    isLoggedIn: () => isLoggedIn,
    getUserName: () => userName,
    getUserEmail: () => email,
    getUserPermissions: () => userPermissions,
    getBadgeLevel: () => badgeLevel
  };
}

// Export for global access
window.LoginPermissions = initLoginPermissions();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.LoginPermissions.init();
});
