/**
 * Login System for Agent Lee
 * Handles user authentication and profile management
 */

class LoginSystem {
  constructor() {
    this.isLoggedIn = false;
    this.userData = {
      name: '',
      email: '',
      phone: '',
      company: '',
      loginTime: null,
      visits: 0
    };

    // Load user data from localStorage if available
    this.loadUserData();
  }

  /**
   * Initialize the login system
   */
  init() {
    // Create login modal if it doesn't exist
    if (!document.getElementById('login-modal')) {
      this.createLoginModal();
    }

    // Add event listeners
    this.addEventListeners();

    // Check if user is already logged in
    if (this.isLoggedIn) {
      // Update Agent Lee with user data
      this.updateAgentLeeWithUserData();
    }
    // Don't automatically show login modal - let Agent Lee appear first
  }

  /**
   * Create the login modal HTML
   */
  createLoginModal() {
    const modalHTML = `
      <div id="login-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-300">
        <div class="bg-indigo-900 border border-indigo-700 rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-white text-xl font-bold">Welcome to Rapid Web Development</h2>
            <button id="login-close" class="text-blue-300 hover:text-white">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </button>
          </div>

          <p class="text-blue-200 mb-4">Please sign in to get personalized assistance from Agent Lee</p>

          <form id="login-form" class="space-y-4">
            <div>
              <label for="login-name" class="block text-blue-300 text-sm mb-1">Your Name</label>
              <input type="text" id="login-name" class="w-full bg-indigo-800/50 text-white placeholder-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="John Doe" required>
            </div>

            <div>
              <label for="login-email" class="block text-blue-300 text-sm mb-1">Email Address</label>
              <input type="email" id="login-email" class="w-full bg-indigo-800/50 text-white placeholder-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="john@example.com" required>
            </div>

            <div>
              <label for="login-phone" class="block text-blue-300 text-sm mb-1">Phone Number (Optional)</label>
              <input type="tel" id="login-phone" class="w-full bg-indigo-800/50 text-white placeholder-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="(123) 456-7890">
            </div>

            <div>
              <label for="login-company" class="block text-blue-300 text-sm mb-1">Company (Optional)</label>
              <input type="text" id="login-company" class="w-full bg-indigo-800/50 text-white placeholder-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Acme Inc.">
            </div>

            <div class="flex items-center">
              <input type="checkbox" id="login-remember" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="login-remember" class="ml-2 block text-blue-300 text-sm">Remember me on this device</label>
            </div>

            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105">
              Sign In
            </button>

            <p class="text-xs text-blue-300 mt-2">
              By signing in, you agree to our <a href="#" class="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" class="text-blue-400 hover:underline">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    `;

    // Create a container for the modal
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;

    // Add to the document
    document.body.appendChild(modalContainer.firstElementChild);
  }

  /**
   * Add event listeners to the login modal
   */
  addEventListeners() {
    // Get modal elements
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginClose = document.getElementById('login-close');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    if (loginClose) {
      loginClose.addEventListener('click', () => {
        this.hideLoginModal();
      });
    }
  }

  /**
   * Handle login form submission
   */
  handleLogin() {
    // Get form values
    const nameInput = document.getElementById('login-name');
    const emailInput = document.getElementById('login-email');
    const phoneInput = document.getElementById('login-phone');
    const companyInput = document.getElementById('login-company');
    const rememberInput = document.getElementById('login-remember');

    if (nameInput && emailInput) {
      // Update user data
      this.userData.name = nameInput.value.trim();
      this.userData.email = emailInput.value.trim();
      this.userData.phone = phoneInput ? phoneInput.value.trim() : '';
      this.userData.company = companyInput ? companyInput.value.trim() : '';
      this.userData.loginTime = new Date().toISOString();
      this.userData.visits = this.userData.visits + 1;

      // Set logged in state
      this.isLoggedIn = true;

      // Save to localStorage if remember is checked
      if (rememberInput && rememberInput.checked) {
        this.saveUserData();
      }

      // Hide the login modal
      this.hideLoginModal();

      // Update Agent Lee with user data
      this.updateAgentLeeWithUserData();

      // Send login data to admin email
      this.sendLoginDataToAdmin();
    }
  }

  /**
   * Show the login modal
   */
  showLoginModal() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      // First remove hidden class, then set display to flex
      loginModal.classList.remove('hidden');
      loginModal.style.display = 'flex';

      // Add a small delay before setting opacity for the transition to work
      setTimeout(() => {
        loginModal.style.opacity = '1';
      }, 10);
    }
  }

  /**
   * Hide the login modal
   */
  hideLoginModal() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      // First set opacity to 0 for fade-out effect
      loginModal.style.opacity = '0';

      // After transition completes, hide the modal and add hidden class
      setTimeout(() => {
        loginModal.style.display = 'none';
        loginModal.classList.add('hidden');
      }, 300);
    }
  }

  /**
   * Save user data to localStorage
   */
  saveUserData() {
    localStorage.setItem('user_logged_in', 'true');
    localStorage.setItem('user_data', JSON.stringify(this.userData));
  }

  /**
   * Load user data from localStorage
   */
  loadUserData() {
    const isLoggedIn = localStorage.getItem('user_logged_in') === 'true';
    const userData = localStorage.getItem('user_data');

    if (isLoggedIn && userData) {
      try {
        this.userData = JSON.parse(userData);
        this.isLoggedIn = true;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.isLoggedIn = false;
      }
    }
  }

  /**
   * Update Agent Lee with user data
   */
  updateAgentLeeWithUserData() {
    // Make user data available to Agent Lee
    if (window.agentLee) {
      window.agentLee.user = {
        name: this.userData.name,
        email: this.userData.email,
        phone: this.userData.phone,
        company: this.userData.company,
        isLoggedIn: this.isLoggedIn
      };

      // Update the user name display in Agent Lee
      window.agentLee.updateUserNameDisplay();

      // Greet the user by name
      if (this.userData.name) {
        window.agentLee.speak(`Hello, ${this.userData.name}! I'll remember you when you return.`);
      }
    }

    // Also update userProfile if it exists
    if (window.userProfile) {
      window.userProfile.setName(this.userData.name);
      window.userProfile.setEmail(this.userData.email);
      window.userProfile.setPhone(this.userData.phone);
      window.userProfile.setCompany(this.userData.company);
    }

    // Update localStorage for compatibility with existing code
    localStorage.setItem('userName', this.userData.name);
    localStorage.setItem('userEmail', this.userData.email);
    localStorage.setItem('returnVisitor', 'true');

    // Update user_name for Agent Lee compatibility
    localStorage.setItem('user_name', this.userData.name);
  }

  /**
   * Send login data to admin email
   */
  sendLoginDataToAdmin() {
    // Create email content
    const emailSubject = 'New User Login: ' + this.userData.name;
    const emailBody = `
      New user login on Rapid Web Development:

      Name: ${this.userData.name}
      Email: ${this.userData.email}
      Phone: ${this.userData.phone || 'Not provided'}
      Company: ${this.userData.company || 'Not provided'}
      Login Time: ${new Date(this.userData.loginTime).toLocaleString()}
      Visit Count: ${this.userData.visits}

      User Agent: ${navigator.userAgent}
      Screen Size: ${window.screen.width}x${window.screen.height}

      This email was automatically generated by Agent Lee.
    `;

    // Use EmailJS to send the email
    if (window.emailjs) {
      emailjs.send('default_service', 'template_login', {
        to_email: 'admin@example.com', // Replace with your email
        subject: emailSubject,
        message: emailBody
      })
      .then(function(response) {
        console.log('Email sent:', response.status, response.text);
      }, function(error) {
        console.error('Email send failed:', error);
      });
    } else {
      // Fallback to console log if EmailJS is not available
      console.log('Would send email:', emailSubject, emailBody);

      // Try to use fetch to send the data to a server
      try {
        fetch('/api/notify-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: emailSubject,
            message: emailBody,
            userData: this.userData
          })
        });
      } catch (error) {
        console.error('Failed to notify admin:', error);
      }
    }
  }

  /**
   * Log out the current user
   */
  logout() {
    this.isLoggedIn = false;
    this.userData = {
      name: '',
      email: '',
      phone: '',
      company: '',
      loginTime: null,
      visits: 0
    };

    // Clear localStorage
    localStorage.removeItem('user_logged_in');
    localStorage.removeItem('user_data');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user_name');

    // Update Agent Lee
    if (window.agentLee) {
      window.agentLee.user = {
        name: '',
        email: '',
        isLoggedIn: false
      };

      // Update the user name display
      window.agentLee.updateUserNameDisplay();

      // Inform the user they've been logged out
      window.agentLee.speak('You have been logged out. I hope to see you again soon!');
    }

    // Show login modal again
    this.showLoginModal();
  }
}

// Initialize the login system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.loginSystem = new LoginSystem();

  // Wait for the main content to load before showing login
  window.addEventListener('load', () => {
    // Use Intersection Observer to detect when hero section is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Hero section is visible, initialize login system after a longer delay
          // to allow Agent Lee to appear first
          setTimeout(() => {
            window.loginSystem.init();
          }, 10000); // Longer delay to ensure Agent Lee appears first

          // Stop observing once triggered
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 }); // Trigger when 30% of hero section is visible

    // Start observing the hero section
    const heroSection = document.querySelector('#hero, .hero, header, .header');
    if (heroSection) {
      observer.observe(heroSection);
    } else {
      // If no hero section found, initialize login system after a longer delay
      setTimeout(() => {
        window.loginSystem.init();
      }, 15000); // Much longer delay to ensure Agent Lee appears first
    }
  });
});
