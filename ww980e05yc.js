/**
 * Agent Lee Training System
 * 
 * This module implements a comprehensive training system for Agent Lee that enables:
 * 1. One-shot learning from user interactions
 * 2. Autonomous training from site content
 * 3. Memory management with short and long-term storage
 * 4. Knowledge categorization and retrieval
 * 5. Training analytics and improvement tracking
 */

// Main AgentLeeTraining object
const AgentLeeTraining = {
  // Knowledge base storage
  knowledgeBase: {
    // Core knowledge categories
    navigation: {},
    pricing: {},
    learning: {},
    showcase: {},
    faq: {},
    
    // User-specific knowledge
    userPreferences: {},
    
    // Training metadata
    trainingStats: {
      totalInteractions: 0,
      successfulResponses: 0,
      failedResponses: 0,
      knowledgeGrowth: []
    }
  },
  
  // Database connection
  db: null,
  
  /**
   * Initialize the training system
   * Sets up the database and loads existing knowledge
   */
  init: async function() {
    console.log("Initializing Agent Lee Training System...");
    
    // Initialize IndexedDB
    await this.initDatabase();
    
    // Load existing knowledge
    await this.loadKnowledge();
    
    // Initialize training analytics
    this.initAnalytics();
    
    console.log("Agent Lee Training System initialized successfully");
    return true;
  },
  
  /**
   * Initialize the IndexedDB database for persistent storage
   */
  initDatabase: function() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("AgentLeeKnowledgeBase", 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores for different types of knowledge
        if (!db.objectStoreNames.contains("knowledge")) {
          const knowledgeStore = db.createObjectStore("knowledge", { keyPath: "id", autoIncrement: true });
          knowledgeStore.createIndex("category", "category", { unique: false });
          knowledgeStore.createIndex("pattern", "pattern", { unique: false });
        }
        
        if (!db.objectStoreNames.contains("userPreferences")) {
          db.createObjectStore("userPreferences", { keyPath: "userId" });
        }
        
        if (!db.objectStoreNames.contains("trainingStats")) {
          db.createObjectStore("trainingStats", { keyPath: "id", autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains("memories")) {
          const memoriesStore = db.createObjectStore("memories", { keyPath: "id", autoIncrement: true });
          memoriesStore.createIndex("timestamp", "timestamp", { unique: false });
          memoriesStore.createIndex("relevance", "relevance", { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("Database initialized successfully");
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error("Database initialization error:", event.target.error);
        reject(event.target.error);
      };
    });
  },
  
  /**
   * Load existing knowledge from the database
   */
  loadKnowledge: async function() {
    if (!this.db) {
      console.error("Database not initialized");
      return false;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["knowledge", "userPreferences", "trainingStats"], "readonly");
      
      // Load knowledge
      const knowledgeStore = transaction.objectStore("knowledge");
      const knowledgeRequest = knowledgeStore.getAll();
      
      knowledgeRequest.onsuccess = (event) => {
        const knowledge = event.target.result;
        
        // Organize knowledge by category
        knowledge.forEach(item => {
          if (!this.knowledgeBase[item.category]) {
            this.knowledgeBase[item.category] = {};
          }
          
          this.knowledgeBase[item.category][item.pattern] = item.response;
        });
        
        console.log(`Loaded ${knowledge.length} knowledge items`);
      };
      
      // Load training stats
      const statsStore = transaction.objectStore("trainingStats");
      const statsRequest = statsStore.getAll();
      
      statsRequest.onsuccess = (event) => {
        const stats = event.target.result;
        
        if (stats.length > 0) {
          this.knowledgeBase.trainingStats = stats[stats.length - 1];
        }
        
        console.log("Loaded training stats");
      };
      
      transaction.oncomplete = () => {
        resolve(true);
      };
      
      transaction.onerror = (event) => {
        console.error("Error loading knowledge:", event.target.error);
        reject(event.target.error);
      };
    });
  },
  
  /**
   * Initialize training analytics
   */
  initAnalytics: function() {
    // Set up analytics if not already present
    if (!this.knowledgeBase.trainingStats.knowledgeGrowth.length) {
      this.knowledgeBase.trainingStats.knowledgeGrowth.push({
        timestamp: Date.now(),
        knowledgeCount: this.countKnowledgeItems(),
        categories: this.getCategoryCounts()
      });
    }
    
    // Schedule regular analytics updates
    setInterval(() => {
      this.updateAnalytics();
    }, 3600000); // Update every hour
  },
  
  /**
   * Count total knowledge items
   */
  countKnowledgeItems: function() {
    let count = 0;
    
    Object.keys(this.knowledgeBase).forEach(category => {
      if (typeof this.knowledgeBase[category] === 'object' && category !== 'trainingStats') {
        count += Object.keys(this.knowledgeBase[category]).length;
      }
    });
    
    return count;
  },
  
  /**
   * Get counts by category
   */
  getCategoryCounts: function() {
    const counts = {};
    
    Object.keys(this.knowledgeBase).forEach(category => {
      if (typeof this.knowledgeBase[category] === 'object' && category !== 'trainingStats') {
        counts[category] = Object.keys(this.knowledgeBase[category]).length;
      }
    });
    
    return counts;
  },
  
  /**
   * Update analytics data
   */
  updateAnalytics: function() {
    const currentStats = {
      timestamp: Date.now(),
      knowledgeCount: this.countKnowledgeItems(),
      categories: this.getCategoryCounts()
    };
    
    this.knowledgeBase.trainingStats.knowledgeGrowth.push(currentStats);
    
    // Limit history to last 30 days
    if (this.knowledgeBase.trainingStats.knowledgeGrowth.length > 720) { // 24 * 30 = 720 hourly records
      this.knowledgeBase.trainingStats.knowledgeGrowth.shift();
    }
    
    // Save updated stats to database
    this.saveTrainingStats();
  },
  
  /**
   * Save training stats to database
   */
  saveTrainingStats: function() {
    if (!this.db) return;
    
    const transaction = this.db.transaction(["trainingStats"], "readwrite");
    const store = transaction.objectStore("trainingStats");
    
    store.add({
      timestamp: Date.now(),
      totalInteractions: this.knowledgeBase.trainingStats.totalInteractions,
      successfulResponses: this.knowledgeBase.trainingStats.successfulResponses,
      failedResponses: this.knowledgeBase.trainingStats.failedResponses,
      knowledgeGrowth: this.knowledgeBase.trainingStats.knowledgeGrowth
    });
  },
  
  /**
   * Learn from user interaction (one-shot learning)
   * @param {string} input - User input
   * @param {string} response - System response
   * @param {boolean} wasSuccessful - Whether the response was successful
   * @param {string} category - Knowledge category
   */
  learnFromInteraction: function(input, response, wasSuccessful, category = "general") {
    // Update interaction stats
    this.knowledgeBase.trainingStats.totalInteractions++;
    
    if (wasSuccessful) {
      this.knowledgeBase.trainingStats.successfulResponses++;
    } else {
      this.knowledgeBase.trainingStats.failedResponses++;
    }
    
    // Only learn from successful interactions
    if (wasSuccessful) {
      // Extract patterns from input
      const patterns = this.extractPatterns(input);
      
      // Store each pattern with the response
      patterns.forEach(pattern => {
        this.storeKnowledge(pattern, response, category);
      });
    }
    
    // Save memory of this interaction
    this.storeMemory(input, response, wasSuccessful, category);
    
    return true;
  },
  
  /**
   * Extract patterns from user input for learning
   * @param {string} input - User input
   * @returns {Array} - Array of patterns
   */
  extractPatterns: function(input) {
    const patterns = [];
    
    // Clean and normalize input
    const cleanInput = input.toLowerCase().trim();
    patterns.push(cleanInput);
    
    // Extract key phrases (simplified version)
    const words = cleanInput.split(/\s+/);
    if (words.length > 3) {
      // Add pattern without stop words
      const stopWords = ["a", "an", "the", "is", "are", "was", "were", "be", "been", "being", 
                         "in", "on", "at", "to", "for", "with", "by", "about", "like", "through"];
      
      const filteredWords = words.filter(word => !stopWords.includes(word));
      if (filteredWords.length > 0) {
        patterns.push(filteredWords.join(" "));
      }
      
      // Add key phrases (first 3-5 words, last 3-5 words)
      if (words.length > 5) {
        patterns.push(words.slice(0, 5).join(" "));
        patterns.push(words.slice(-5).join(" "));
      }
    }
    
    return patterns;
  },
  
  /**
   * Store knowledge in the database
   * @param {string} pattern - Input pattern
   * @param {string} response - Response to store
   * @param {string} category - Knowledge category
   */
  storeKnowledge: function(pattern, response, category) {
    // Add to in-memory knowledge base
    if (!this.knowledgeBase[category]) {
      this.knowledgeBase[category] = {};
    }
    
    this.knowledgeBase[category][pattern] = response;
    
    // Store in database
    if (this.db) {
      const transaction = this.db.transaction(["knowledge"], "readwrite");
      const store = transaction.objectStore("knowledge");
      
      store.add({
        pattern: pattern,
        response: response,
        category: category,
        timestamp: Date.now()
      });
    }
  },
  
  /**
   * Store memory of an interaction
   * @param {string} input - User input
   * @param {string} response - System response
   * @param {boolean} wasSuccessful - Whether the response was successful
   * @param {string} category - Knowledge category
   */
  storeMemory: function(input, response, wasSuccessful, category) {
    // Calculate initial relevance score (higher for recent and successful interactions)
    const relevance = wasSuccessful ? 0.8 : 0.4;
    
    const memory = {
      input: input,
      response: response,
      wasSuccessful: wasSuccessful,
      category: category,
      timestamp: Date.now(),
      relevance: relevance,
      accessCount: 1
    };
    
    // Store in database
    if (this.db) {
      const transaction = this.db.transaction(["memories"], "readwrite");
      const store = transaction.objectStore("memories");
      
      store.add(memory);
    }
  },
  
  /**
   * Find response based on user input
   * @param {string} input - User input
   * @returns {Object} - Response object with text and confidence
   */
  findResponse: function(input) {
    const cleanInput = input.toLowerCase().trim();
    let bestMatch = null;
    let highestConfidence = 0;
    
    // Search through all categories
    Object.keys(this.knowledgeBase).forEach(category => {
      if (typeof this.knowledgeBase[category] === 'object' && category !== 'trainingStats') {
        // Search through patterns in this category
        Object.keys(this.knowledgeBase[category]).forEach(pattern => {
          const confidence = this.calculateConfidence(cleanInput, pattern);
          
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              response: this.knowledgeBase[category][pattern],
              category: category,
              confidence: confidence
            };
          }
        });
      }
    });
    
    // Return best match if confidence is high enough
    if (bestMatch && bestMatch.confidence > 0.6) {
      return bestMatch;
    }
    
    // No good match found
    return {
      response: null,
      confidence: 0
    };
  },
  
  /**
   * Calculate confidence score for a match
   * @param {string} input - User input
   * @param {string} pattern - Stored pattern
   * @returns {number} - Confidence score (0-1)
   */
  calculateConfidence: function(input, pattern) {
    // Exact match
    if (input === pattern) {
      return 1.0;
    }
    
    // Contains pattern
    if (input.includes(pattern)) {
      return 0.9;
    }
    
    // Pattern contains input
    if (pattern.includes(input)) {
      return 0.8;
    }
    
    // Calculate word overlap
    const inputWords = input.split(/\s+/);
    const patternWords = pattern.split(/\s+/);
    
    let matchCount = 0;
    inputWords.forEach(word => {
      if (patternWords.includes(word)) {
        matchCount++;
      }
    });
    
    const overlapScore = matchCount / Math.max(inputWords.length, patternWords.length);
    
    return overlapScore;
  },
  
  /**
   * Train from site content
   * Extracts content from the page and learns from it
   */
  trainFromSiteContent: function() {
    console.log("Training from site content...");
    
    // Extract content from main sections
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
      const sectionId = section.id || 'general';
      const headings = section.querySelectorAll('h1, h2, h3');
      
      headings.forEach(heading => {
        const headingText = heading.textContent.trim();
        const contentElements = this.getNextSiblings(heading);
        
        if (contentElements.length > 0) {
          // Combine content text
          const contentText = contentElements.map(el => el.textContent.trim()).join(' ');
          
          // Create a Q&A pair
          const question = `What is ${headingText}?`;
          const answer = contentText.substring(0, 200); // Limit length
          
          // Store this knowledge
          this.storeKnowledge(question, answer, sectionId);
          
          // Also store with alternative phrasings
          this.storeKnowledge(`Tell me about ${headingText}`, answer, sectionId);
          this.storeKnowledge(`Explain ${headingText}`, answer, sectionId);
        }
      });
    });
    
    // Extract FAQ content
    const faqItems = document.querySelectorAll('dt, .faq-question');
    
    faqItems.forEach(question => {
      const questionText = question.textContent.trim();
      let answerElement;
      
      if (question.tagName === 'DT') {
        answerElement = question.nextElementSibling;
      } else {
        answerElement = question.nextElementSibling || question.querySelector('.faq-answer');
      }
      
      if (answerElement) {
        const answerText = answerElement.textContent.trim();
        
        // Store this FAQ
        this.storeKnowledge(questionText, answerText, 'faq');
      }
    });
    
    console.log("Completed training from site content");
  },
  
  /**
   * Get next sibling elements until next heading
   * @param {Element} element - Starting element
   * @returns {Array} - Array of content elements
   */
  getNextSiblings: function(element) {
    const siblings = [];
    let nextElement = element.nextElementSibling;
    
    while (nextElement && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(nextElement.tagName)) {
      siblings.push(nextElement);
      nextElement = nextElement.nextElementSibling;
    }
    
    return siblings;
  },
  
  /**
   * Get training statistics
   * @returns {Object} - Training statistics
   */
  getTrainingStats: function() {
    return {
      totalInteractions: this.knowledgeBase.trainingStats.totalInteractions,
      successRate: this.knowledgeBase.trainingStats.totalInteractions > 0 
        ? (this.knowledgeBase.trainingStats.successfulResponses / this.knowledgeBase.trainingStats.totalInteractions * 100).toFixed(2) + '%'
        : '0%',
      knowledgeItems: this.countKnowledgeItems(),
      categoryCounts: this.getCategoryCounts(),
      growthRate: this.calculateGrowthRate()
    };
  },
  
  /**
   * Calculate knowledge growth rate
   * @returns {string} - Growth rate as percentage
   */
  calculateGrowthRate: function() {
    const growth = this.knowledgeBase.trainingStats.knowledgeGrowth;
    
    if (growth.length < 2) {
      return '0%';
    }
    
    const oldest = growth[0];
    const newest = growth[growth.length - 1];
    
    const growthRate = ((newest.knowledgeCount - oldest.knowledgeCount) / oldest.knowledgeCount) * 100;
    
    return growthRate.toFixed(2) + '%';
  },
  
  /**
   * Reset training data (for testing)
   */
  resetTraining: function() {
    if (confirm("Are you sure you want to reset all training data? This cannot be undone.")) {
      // Clear in-memory knowledge
      Object.keys(this.knowledgeBase).forEach(category => {
        if (typeof this.knowledgeBase[category] === 'object' && category !== 'trainingStats') {
          this.knowledgeBase[category] = {};
        }
      });
      
      // Reset training stats
      this.knowledgeBase.trainingStats = {
        totalInteractions: 0,
        successfulResponses: 0,
        failedResponses: 0,
        knowledgeGrowth: [{
          timestamp: Date.now(),
          knowledgeCount: 0,
          categories: {}
        }]
      };
      
      // Clear database
      if (this.db) {
        const transaction = this.db.transaction(["knowledge", "memories", "trainingStats"], "readwrite");
        
        transaction.objectStore("knowledge").clear();
        transaction.objectStore("memories").clear();
        transaction.objectStore("trainingStats").clear();
        
        transaction.oncomplete = () => {
          console.log("Training data reset successfully");
          alert("Training data has been reset successfully");
        };
      }
    }
  }
};

// Export the training system
window.AgentLeeTraining = AgentLeeTraining;
