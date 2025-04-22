/**
 * Badge System with IndexedDB
 * Provides persistent storage for user badges and achievements
 */

// Database configuration
const DB_CONFIG = {
  name: 'BadgeDB',
  version: 1,
  stores: {
    badges: { keyPath: 'id', autoIncrement: false },
    achievements: { keyPath: 'id', autoIncrement: true }
  }
};

// Badge levels
const BADGE_LEVELS = {
  EXPLORER: 1,
  ENTHUSIAST: 2,
  CONTRIBUTOR: 3,
  ADVOCATE: 4,
  ELITE: 5
};

// Achievement types
const ACHIEVEMENT_TYPES = {
  PAGE_VISIT: 'page_visit',
  INTERACTION: 'interaction',
  CONTENT_VIEW: 'content_view',
  FEATURE_USE: 'feature_use',
  SPECIAL: 'special'
};

// Badge system class
class BadgeSystem {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.currentBadgeLevel = BADGE_LEVELS.EXPLORER;
    this.achievements = [];
    this.onBadgeUpdate = null;
    this.onAchievementEarned = null;
  }

  /**
   * Initialize the badge system
   * @returns {Promise} - Resolves when initialization is complete
   */
  async initialize() {
    if (this.isInitialized) return Promise.resolve();

    try {
      // Open the database
      this.db = await this._openDatabase();
      
      // Load current badge level
      const badgeData = await this.getBadge('currentLevel');
      if (badgeData) {
        this.currentBadgeLevel = badgeData.level;
      } else {
        // Initialize with level 1 if not found
        await this.saveBadge('currentLevel', {
          level: BADGE_LEVELS.EXPLORER,
          earnedAt: new Date().toISOString()
        });
      }

      // Load achievements
      this.achievements = await this.getAllAchievements();
      
      this.isInitialized = true;
      console.log('Badge system initialized with level:', this.currentBadgeLevel);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize badge system:', error);
      
      // Fallback to localStorage if IndexedDB fails
      this._initializeLocalStorageFallback();
      
      return Promise.reject(error);
    }
  }

  /**
   * Fallback to localStorage if IndexedDB is not available
   * @private
   */
  _initializeLocalStorageFallback() {
    try {
      const storedLevel = localStorage.getItem('badgeLevel');
      if (storedLevel) {
        this.currentBadgeLevel = parseInt(storedLevel, 10);
      } else {
        localStorage.setItem('badgeLevel', BADGE_LEVELS.EXPLORER);
      }
      
      const storedAchievements = localStorage.getItem('achievements');
      if (storedAchievements) {
        this.achievements = JSON.parse(storedAchievements);
      } else {
        localStorage.setItem('achievements', JSON.stringify([]));
      }
      
      this.isInitialized = true;
      console.log('Badge system initialized with localStorage fallback, level:', this.currentBadgeLevel);
    } catch (error) {
      console.error('Failed to initialize localStorage fallback:', error);
    }
  }

  /**
   * Open the IndexedDB database
   * @private
   * @returns {Promise<IDBDatabase>} - The database instance
   */
  _openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser'));
        return;
      }

      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('badges')) {
          db.createObjectStore('badges', DB_CONFIG.stores.badges);
        }
        
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', DB_CONFIG.stores.achievements);
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  /**
   * Save a badge to the database
   * @param {string} id - The badge ID
   * @param {Object} data - The badge data
   * @returns {Promise} - Resolves when the badge is saved
   */
  async saveBadge(id, data) {
    if (!this.isInitialized) await this.initialize();

    try {
      if (this.db) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['badges'], 'readwrite');
          const store = transaction.objectStore('badges');
          
          const badge = {
            id,
            ...data
          };
          
          const request = store.put(badge);
          
          request.onsuccess = () => {
            this.currentBadgeLevel = data.level;
            
            // Trigger badge update callback if provided
            if (typeof this.onBadgeUpdate === 'function') {
              this.onBadgeUpdate(this.currentBadgeLevel);
            }
            
            resolve();
          };
          
          request.onerror = (event) => {
            reject(event.target.error);
          };
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem('badgeLevel', data.level);
        this.currentBadgeLevel = data.level;
        
        // Trigger badge update callback if provided
        if (typeof this.onBadgeUpdate === 'function') {
          this.onBadgeUpdate(this.currentBadgeLevel);
        }
        
        return Promise.resolve();
      }
    } catch (error) {
      console.error('Failed to save badge:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Get a badge from the database
   * @param {string} id - The badge ID
   * @returns {Promise<Object>} - The badge data
   */
  async getBadge(id) {
    if (!this.isInitialized) await this.initialize();

    try {
      if (this.db) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['badges'], 'readonly');
          const store = transaction.objectStore('badges');
          const request = store.get(id);
          
          request.onsuccess = (event) => {
            resolve(event.target.result);
          };
          
          request.onerror = (event) => {
            reject(event.target.error);
          };
        });
      } else {
        // Fallback to localStorage
        const level = localStorage.getItem('badgeLevel');
        if (level) {
          return Promise.resolve({
            id: 'currentLevel',
            level: parseInt(level, 10),
            earnedAt: localStorage.getItem('badgeEarnedAt') || new Date().toISOString()
          });
        }
        return Promise.resolve(null);
      }
    } catch (error) {
      console.error('Failed to get badge:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Record a new achievement
   * @param {string} type - The achievement type
   * @param {string} name - The achievement name
   * @param {Object} details - Additional details about the achievement
   * @returns {Promise} - Resolves when the achievement is recorded
   */
  async recordAchievement(type, name, details = {}) {
    if (!this.isInitialized) await this.initialize();

    try {
      const achievement = {
        type,
        name,
        details,
        earnedAt: new Date().toISOString()
      };

      if (this.db) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['achievements'], 'readwrite');
          const store = transaction.objectStore('achievements');
          
          const request = store.add(achievement);
          
          request.onsuccess = (event) => {
            // Add the achievement to the local cache
            achievement.id = event.target.result;
            this.achievements.push(achievement);
            
            // Check if this achievement should trigger a badge level up
            this._checkForBadgeLevelUp();
            
            // Trigger achievement earned callback if provided
            if (typeof this.onAchievementEarned === 'function') {
              this.onAchievementEarned(achievement);
            }
            
            resolve(achievement);
          };
          
          request.onerror = (event) => {
            reject(event.target.error);
          };
        });
      } else {
        // Fallback to localStorage
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        achievement.id = achievements.length + 1;
        achievements.push(achievement);
        localStorage.setItem('achievements', JSON.stringify(achievements));
        
        // Update local cache
        this.achievements.push(achievement);
        
        // Check if this achievement should trigger a badge level up
        this._checkForBadgeLevelUp();
        
        // Trigger achievement earned callback if provided
        if (typeof this.onAchievementEarned === 'function') {
          this.onAchievementEarned(achievement);
        }
        
        return Promise.resolve(achievement);
      }
    } catch (error) {
      console.error('Failed to record achievement:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Get all achievements from the database
   * @returns {Promise<Array>} - All achievements
   */
  async getAllAchievements() {
    if (!this.isInitialized) await this.initialize();

    try {
      if (this.db) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['achievements'], 'readonly');
          const store = transaction.objectStore('achievements');
          const request = store.getAll();
          
          request.onsuccess = (event) => {
            resolve(event.target.result);
          };
          
          request.onerror = (event) => {
            reject(event.target.error);
          };
        });
      } else {
        // Fallback to localStorage
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        return Promise.resolve(achievements);
      }
    } catch (error) {
      console.error('Failed to get all achievements:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Check if the user should level up based on achievements
   * @private
   */
  _checkForBadgeLevelUp() {
    // Count achievements by type
    const counts = {};
    this.achievements.forEach(achievement => {
      counts[achievement.type] = (counts[achievement.type] || 0) + 1;
    });

    // Determine new badge level based on achievement counts
    let newLevel = this.currentBadgeLevel;

    // Level 2: ENTHUSIAST - At least 5 total achievements
    if (this.achievements.length >= 5 && newLevel < BADGE_LEVELS.ENTHUSIAST) {
      newLevel = BADGE_LEVELS.ENTHUSIAST;
    }

    // Level 3: CONTRIBUTOR - At least 10 total achievements with at least 3 different types
    if (this.achievements.length >= 10 && 
        Object.keys(counts).length >= 3 && 
        newLevel < BADGE_LEVELS.CONTRIBUTOR) {
      newLevel = BADGE_LEVELS.CONTRIBUTOR;
    }

    // Level 4: ADVOCATE - At least 20 total achievements with at least 4 different types
    if (this.achievements.length >= 20 && 
        Object.keys(counts).length >= 4 && 
        newLevel < BADGE_LEVELS.ADVOCATE) {
      newLevel = BADGE_LEVELS.ADVOCATE;
    }

    // Level 5: ELITE - At least 30 total achievements with all types and at least 5 SPECIAL achievements
    if (this.achievements.length >= 30 && 
        Object.keys(counts).length >= Object.keys(ACHIEVEMENT_TYPES).length && 
        (counts[ACHIEVEMENT_TYPES.SPECIAL] || 0) >= 5 && 
        newLevel < BADGE_LEVELS.ELITE) {
      newLevel = BADGE_LEVELS.ELITE;
    }

    // Update badge level if it changed
    if (newLevel > this.currentBadgeLevel) {
      this.saveBadge('currentLevel', {
        level: newLevel,
        earnedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Get the current badge level
   * @returns {number} - The current badge level
   */
  getCurrentBadgeLevel() {
    return this.currentBadgeLevel;
  }

  /**
   * Get the badge level name
   * @param {number} level - The badge level
   * @returns {string} - The badge level name
   */
  getBadgeLevelName(level = this.currentBadgeLevel) {
    switch (level) {
      case BADGE_LEVELS.EXPLORER:
        return 'Explorer';
      case BADGE_LEVELS.ENTHUSIAST:
        return 'Enthusiast';
      case BADGE_LEVELS.CONTRIBUTOR:
        return 'Contributor';
      case BADGE_LEVELS.ADVOCATE:
        return 'Advocate';
      case BADGE_LEVELS.ELITE:
        return 'Elite Member';
      default:
        return 'Unknown';
    }
  }

  /**
   * Set a callback function to be called when the badge level changes
   * @param {Function} callback - The callback function
   */
  setOnBadgeUpdate(callback) {
    if (typeof callback === 'function') {
      this.onBadgeUpdate = callback;
    }
  }

  /**
   * Set a callback function to be called when a new achievement is earned
   * @param {Function} callback - The callback function
   */
  setOnAchievementEarned(callback) {
    if (typeof callback === 'function') {
      this.onAchievementEarned = callback;
    }
  }
}

// Create and export a singleton instance
window.BadgeSystem = new BadgeSystem();

// Constants export
window.BADGE_LEVELS = BADGE_LEVELS;
window.ACHIEVEMENT_TYPES = ACHIEVEMENT_TYPES;

// Initialize the badge system when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.BadgeSystem.initialize().catch(error => {
    console.warn('Badge system initialization failed, using fallback:', error);
  });
});
