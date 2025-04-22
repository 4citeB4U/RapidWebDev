/**
 * Badge UI System
 * Provides UI components for displaying badges and achievements
 */

// Badge UI class
class BadgeUI {
  constructor() {
    this.badgeSystem = window.BadgeSystem;
    this.isInitialized = false;
    this.badgeContainer = null;
    this.achievementContainer = null;
    this.badgeColors = {
      1: { bg: '#3b82f6', text: '#ffffff' }, // Explorer - Blue
      2: { bg: '#8b5cf6', text: '#ffffff' }, // Enthusiast - Purple
      3: { bg: '#10b981', text: '#ffffff' }, // Contributor - Green
      4: { bg: '#f59e0b', text: '#ffffff' }, // Advocate - Amber
      5: { bg: '#ef4444', text: '#ffffff' }  // Elite - Red
    };
  }

  /**
   * Initialize the badge UI
   * @returns {Promise} - Resolves when initialization is complete
   */
  async initialize() {
    if (this.isInitialized) return Promise.resolve();

    try {
      // Wait for badge system to initialize
      if (!this.badgeSystem.isInitialized) {
        await this.badgeSystem.initialize();
      }

      // Create badge container if it doesn't exist
      if (!document.getElementById('badge-container')) {
        this.createBadgeContainer();
      } else {
        this.badgeContainer = document.getElementById('badge-container');
      }

      // Create achievement notification container if it doesn't exist
      if (!document.getElementById('achievement-container')) {
        this.createAchievementContainer();
      } else {
        this.achievementContainer = document.getElementById('achievement-container');
      }

      // Set up badge update callback
      this.badgeSystem.setOnBadgeUpdate((level) => {
        this.updateBadgeDisplay(level);
        this.showBadgeLevelUpNotification(level);
      });

      // Set up achievement earned callback
      this.badgeSystem.setOnAchievementEarned((achievement) => {
        this.showAchievementNotification(achievement);
      });

      // Initial badge display
      this.updateBadgeDisplay(this.badgeSystem.getCurrentBadgeLevel());

      this.isInitialized = true;
      console.log('Badge UI initialized');

      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize badge UI:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Create the badge container
   * @private
   */
  createBadgeContainer() {
    this.badgeContainer = document.createElement('div');
    this.badgeContainer.id = 'badge-container';
    this.badgeContainer.className = 'fixed top-4 left-4 z-40 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-lg cursor-pointer';
    this.badgeContainer.title = 'Your membership badge';
    
    // Add click handler to show badge details
    this.badgeContainer.addEventListener('click', () => {
      this.showBadgeDetails();
    });
    
    document.body.appendChild(this.badgeContainer);
  }

  /**
   * Create the achievement notification container
   * @private
   */
  createAchievementContainer() {
    this.achievementContainer = document.createElement('div');
    this.achievementContainer.id = 'achievement-container';
    this.achievementContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(this.achievementContainer);
  }

  /**
   * Update the badge display
   * @param {number} level - The badge level
   */
  updateBadgeDisplay(level) {
    if (!this.badgeContainer) return;

    // Clear existing content
    this.badgeContainer.innerHTML = '';

    // Get badge colors
    const colors = this.badgeColors[level] || this.badgeColors[1];

    // Create badge icon
    const badgeIcon = document.createElement('div');
    badgeIcon.className = 'w-8 h-8 rounded-full flex items-center justify-center animate-pulse-custom';
    badgeIcon.style.backgroundColor = colors.bg;
    badgeIcon.style.color = colors.text;
    badgeIcon.innerHTML = `<span class="font-bold">${level}</span>`;
    
    // Create badge label
    const badgeLabel = document.createElement('span');
    badgeLabel.className = 'text-sm font-medium text-white hidden sm:inline-block';
    badgeLabel.textContent = this.badgeSystem.getBadgeLevelName(level);
    
    // Add to container
    this.badgeContainer.appendChild(badgeIcon);
    this.badgeContainer.appendChild(badgeLabel);
    
    // Add appropriate animations based on level
    switch (level) {
      case 1: // Explorer
        badgeIcon.classList.add('animate-pulse');
        break;
      case 2: // Enthusiast
        badgeIcon.classList.add('animate-pulse');
        this.badgeContainer.classList.add('btn-glow');
        break;
      case 3: // Contributor
        badgeIcon.classList.add('animate-pulse');
        this.badgeContainer.classList.add('btn-glow');
        break;
      case 4: // Advocate
        badgeIcon.classList.add('animate-pulse');
        this.badgeContainer.classList.add('btn-glow');
        this.badgeContainer.classList.add('btn-shimmer');
        break;
      case 5: // Elite
        badgeIcon.classList.add('animate-pulse');
        badgeIcon.classList.add('animate-bounce-custom');
        this.badgeContainer.classList.add('btn-glow');
        this.badgeContainer.classList.add('btn-shimmer');
        break;
    }
  }

  /**
   * Show a notification when a badge level up occurs
   * @param {number} level - The new badge level
   */
  showBadgeLevelUpNotification(level) {
    const levelName = this.badgeSystem.getBadgeLevelName(level);
    const colors = this.badgeColors[level] || this.badgeColors[1];
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-900/90 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/20 text-center max-w-md animate-fade-in';
    
    notification.innerHTML = `
      <div class="mb-4">
        <div class="w-20 h-20 rounded-full mx-auto flex items-center justify-center animate-pulse-custom" style="background-color: ${colors.bg}; color: ${colors.text}">
          <span class="text-2xl font-bold">${level}</span>
        </div>
      </div>
      <h3 class="text-xl font-bold mb-2">Badge Level Up!</h3>
      <p class="text-lg mb-4">Congratulations! You are now a <span class="font-bold" style="color: ${colors.bg}">${levelName}</span></p>
      <p class="text-sm text-gray-300">Keep exploring to earn more achievements</p>
      <button class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Continue</button>
    `;
    
    // Add click handler to close notification
    notification.querySelector('button').addEventListener('click', () => {
      document.body.removeChild(notification);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
    
    document.body.appendChild(notification);
    
    // Play a sound if available
    if (window.badgeLevelUpSound) {
      window.badgeLevelUpSound.play().catch(e => console.warn('Could not play badge level up sound:', e));
    }
  }

  /**
   * Show a notification when an achievement is earned
   * @param {Object} achievement - The achievement object
   */
  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'bg-indigo-900/80 backdrop-blur-md p-4 rounded-lg shadow-lg border border-indigo-500/30 animate-fade-in max-w-xs';
    
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="bg-blue-500 p-2 rounded-full shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
            <path d="M12 15l-2 5l9-13l-5 2l-2 6z"/>
            <path d="M16 7l-7 7"/>
          </svg>
        </div>
        <div>
          <h4 class="font-bold text-sm">Achievement Unlocked!</h4>
          <p class="text-blue-200 text-xs">${achievement.name}</p>
        </div>
      </div>
    `;
    
    // Add to container
    this.achievementContainer.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (this.achievementContainer.contains(notification)) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        
        setTimeout(() => {
          if (this.achievementContainer.contains(notification)) {
            this.achievementContainer.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
    
    // Play a sound if available
    if (window.achievementSound) {
      window.achievementSound.play().catch(e => console.warn('Could not play achievement sound:', e));
    }
  }

  /**
   * Show badge details modal
   */
  showBadgeDetails() {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-md flex items-center justify-center p-4';
    
    // Get current badge level and achievements
    const level = this.badgeSystem.getCurrentBadgeLevel();
    const levelName = this.badgeSystem.getBadgeLevelName(level);
    const colors = this.badgeColors[level] || this.badgeColors[1];
    
    // Create modal content
    modal.innerHTML = `
      <div class="bg-indigo-900/80 rounded-xl shadow-2xl border border-indigo-700/50 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-2xl font-bold">Your Badge</h2>
          <button class="bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-white" id="close-badge-modal">✕</button>
        </div>
        
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full flex items-center justify-center animate-pulse-custom" style="background-color: ${colors.bg}; color: ${colors.text}">
            <span class="text-2xl font-bold">${level}</span>
          </div>
          <div>
            <h3 class="text-xl font-bold">${levelName}</h3>
            <p class="text-blue-300">Level ${level} of 5</p>
          </div>
        </div>
        
        <div class="mb-6">
          <h4 class="font-semibold text-lg mb-2">Badge Levels</h4>
          <div class="grid grid-cols-5 gap-2">
            ${Object.keys(this.badgeColors).map(lvl => {
              const isActive = parseInt(lvl) <= level;
              const lvlColors = this.badgeColors[lvl];
              const lvlName = this.badgeSystem.getBadgeLevelName(parseInt(lvl));
              return `
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center mb-1 ${isActive ? 'animate-pulse-custom' : 'opacity-50'}" 
                       style="background-color: ${lvlColors.bg}; color: ${lvlColors.text}">
                    <span class="font-bold">${lvl}</span>
                  </div>
                  <span class="text-xs ${isActive ? 'text-white' : 'text-gray-400'}">${lvlName}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold text-lg mb-2">Recent Achievements</h4>
          <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
            ${this.badgeSystem.achievements.length > 0 
              ? this.badgeSystem.achievements.slice(-5).reverse().map(achievement => `
                <div class="bg-indigo-800/50 p-3 rounded-lg">
                  <div class="flex items-start gap-3">
                    <div class="bg-blue-500/30 p-1.5 rounded-full shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-300">
                        <path d="M12 15l-2 5l9-13l-5 2l-2 6z"/>
                        <path d="M16 7l-7 7"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-sm">${achievement.name}</p>
                      <p class="text-blue-200 text-xs">${new Date(achievement.earnedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              `).join('')
              : '<p class="text-gray-400 text-sm italic">No achievements yet. Keep exploring!</p>'
            }
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-indigo-700/50">
          <p class="text-sm text-blue-200">Keep exploring the site to earn more achievements and level up your badge!</p>
        </div>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(modal);
    
    // Add close handler
    document.getElementById('close-badge-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Record a page visit achievement
   * @param {string} pageName - The name of the page
   */
  recordPageVisit(pageName) {
    if (!this.isInitialized) {
      this.initialize().then(() => {
        this.badgeSystem.recordAchievement(
          window.ACHIEVEMENT_TYPES.PAGE_VISIT,
          `Visited ${pageName}`,
          { page: pageName }
        );
      });
    } else {
      this.badgeSystem.recordAchievement(
        window.ACHIEVEMENT_TYPES.PAGE_VISIT,
        `Visited ${pageName}`,
        { page: pageName }
      );
    }
  }

  /**
   * Record an interaction achievement
   * @param {string} interactionName - The name of the interaction
   * @param {Object} details - Additional details about the interaction
   */
  recordInteraction(interactionName, details = {}) {
    if (!this.isInitialized) {
      this.initialize().then(() => {
        this.badgeSystem.recordAchievement(
          window.ACHIEVEMENT_TYPES.INTERACTION,
          interactionName,
          details
        );
      });
    } else {
      this.badgeSystem.recordAchievement(
        window.ACHIEVEMENT_TYPES.INTERACTION,
        interactionName,
        details
      );
    }
  }

  /**
   * Record a content view achievement
   * @param {string} contentName - The name of the content
   * @param {Object} details - Additional details about the content
   */
  recordContentView(contentName, details = {}) {
    if (!this.isInitialized) {
      this.initialize().then(() => {
        this.badgeSystem.recordAchievement(
          window.ACHIEVEMENT_TYPES.CONTENT_VIEW,
          `Viewed ${contentName}`,
          details
        );
      });
    } else {
      this.badgeSystem.recordAchievement(
        window.ACHIEVEMENT_TYPES.CONTENT_VIEW,
        `Viewed ${contentName}`,
        details
      );
    }
  }

  /**
   * Record a feature use achievement
   * @param {string} featureName - The name of the feature
   * @param {Object} details - Additional details about the feature
   */
  recordFeatureUse(featureName, details = {}) {
    if (!this.isInitialized) {
      this.initialize().then(() => {
        this.badgeSystem.recordAchievement(
          window.ACHIEVEMENT_TYPES.FEATURE_USE,
          `Used ${featureName}`,
          details
        );
      });
    } else {
      this.badgeSystem.recordAchievement(
        window.ACHIEVEMENT_TYPES.FEATURE_USE,
        `Used ${featureName}`,
        details
      );
    }
  }

  /**
   * Record a special achievement
   * @param {string} achievementName - The name of the achievement
   * @param {Object} details - Additional details about the achievement
   */
  recordSpecialAchievement(achievementName, details = {}) {
    if (!this.isInitialized) {
      this.initialize().then(() => {
        this.badgeSystem.recordAchievement(
          window.ACHIEVEMENT_TYPES.SPECIAL,
          achievementName,
          details
        );
      });
    } else {
      this.badgeSystem.recordAchievement(
        window.ACHIEVEMENT_TYPES.SPECIAL,
        achievementName,
        details
      );
    }
  }
}

// Create and export a singleton instance
window.BadgeUI = new BadgeUI();

// Initialize the badge UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load achievement sounds
  window.achievementSound = new Audio('assets/sounds/achievement.mp3');
  window.badgeLevelUpSound = new Audio('assets/sounds/level-up.mp3');
  
  // Preload sounds
  window.achievementSound.load();
  window.badgeLevelUpSound.load();
  
  // Initialize badge UI
  window.BadgeUI.initialize().catch(error => {
    console.warn('Badge UI initialization failed:', error);
  });
  
  // Record page visit achievement
  const currentPage = window.location.hash.replace('#', '') || 'home';
  window.BadgeUI.recordPageVisit(currentPage);
  
  // Listen for hash changes to record page visits
  window.addEventListener('hashchange', () => {
    const newPage = window.location.hash.replace('#', '') || 'home';
    window.BadgeUI.recordPageVisit(newPage);
  });
});
