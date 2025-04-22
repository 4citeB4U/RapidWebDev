/**
 * Agent Lee Memory Management
 * 
 * This module adds advanced memory management capabilities to Agent Lee,
 * including short-term and long-term memory, memory consolidation,
 * and relevance scoring.
 */

// Memory management system
const AgentLeeMemory = {
  // Memory configuration
  config: {
    // Maximum number of short-term memories
    maxShortTermMemories: 100,
    
    // Maximum number of long-term memories
    maxLongTermMemories: 1000,
    
    // Threshold for promoting to long-term memory
    promotionThreshold: 0.7,
    
    // Decay rate for memory relevance
    relevanceDecayRate: 0.01,
    
    // Interval for memory consolidation (in milliseconds)
    consolidationInterval: 86400000 // 24 hours
  },
  
  // Memory storage
  memories: {
    shortTerm: [],
    longTerm: []
  },
  
  // Initialize the memory management system
  init: async function() {
    console.log("Initializing Agent Lee Memory Management...");
    
    // Load memories from IndexedDB
    await this.loadMemories();
    
    // Start memory consolidation process
    this.startMemoryConsolidation();
    
    console.log("Agent Lee Memory Management initialized successfully");
  },
  
  // Load memories from IndexedDB
  loadMemories: async function() {
    if (!window.AgentLeeTraining || !window.AgentLeeTraining.db) {
      console.error("AgentLeeTraining database not available");
      return;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = window.AgentLeeTraining.db.transaction(["memories"], "readonly");
      const store = transaction.objectStore("memories");
      const index = store.index("relevance");
      
      // Get short-term memories (lower relevance)
      const shortTermRequest = index.getAll(IDBKeyRange.upperBound(this.config.promotionThreshold), this.config.maxShortTermMemories);
      
      shortTermRequest.onsuccess = (event) => {
        this.memories.shortTerm = event.target.result;
        console.log(`Loaded ${this.memories.shortTerm.length} short-term memories`);
      };
      
      // Get long-term memories (higher relevance)
      const longTermRequest = index.getAll(IDBKeyRange.lowerBound(this.config.promotionThreshold), this.config.maxLongTermMemories);
      
      longTermRequest.onsuccess = (event) => {
        this.memories.longTerm = event.target.result;
        console.log(`Loaded ${this.memories.longTerm.length} long-term memories`);
      };
      
      transaction.oncomplete = () => {
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error("Error loading memories:", event.target.error);
        reject(event.target.error);
      };
    });
  },
  
  // Start memory consolidation process
  startMemoryConsolidation: function() {
    console.log("Starting memory consolidation process...");
    
    // Run initial consolidation
    this.consolidateMemories();
    
    // Set up interval for regular consolidation
    setInterval(() => {
      this.consolidateMemories();
    }, this.config.consolidationInterval);
  },
  
  // Consolidate memories
  consolidateMemories: function() {
    console.log("Consolidating memories...");
    
    // Update relevance scores
    this.updateRelevanceScores();
    
    // Promote memories that exceed the threshold
    this.promoteMemories();
    
    // Prune excess memories
    this.pruneMemories();
    
    // Save changes to IndexedDB
    this.saveMemories();
    
    console.log("Memory consolidation completed");
  },
  
  // Update relevance scores for all memories
  updateRelevanceScores: function() {
    const now = Date.now();
    
    // Update short-term memories
    this.memories.shortTerm.forEach(memory => {
      // Calculate age factor (newer memories are more relevant)
      const ageInDays = (now - memory.timestamp) / (1000 * 60 * 60 * 24);
      const ageFactor = Math.exp(-this.config.relevanceDecayRate * ageInDays);
      
      // Calculate access factor (more frequently accessed memories are more relevant)
      const accessFactor = Math.log(memory.accessCount + 1) / Math.log(10);
      
      // Calculate success factor (successful interactions are more relevant)
      const successFactor = memory.wasSuccessful ? 1.2 : 0.8;
      
      // Update relevance score
      memory.relevance = Math.min(0.95, (memory.relevance * 0.7) + (ageFactor * 0.1) + (accessFactor * 0.1) + (successFactor * 0.1));
    });
    
    // Update long-term memories (slower decay)
    this.memories.longTerm.forEach(memory => {
      // Calculate age factor (slower decay for long-term memories)
      const ageInDays = (now - memory.timestamp) / (1000 * 60 * 60 * 24);
      const ageFactor = Math.exp(-this.config.relevanceDecayRate * 0.5 * ageInDays);
      
      // Calculate access factor
      const accessFactor = Math.log(memory.accessCount + 1) / Math.log(10);
      
      // Update relevance score (slower decay)
      memory.relevance = Math.min(0.99, (memory.relevance * 0.8) + (ageFactor * 0.1) + (accessFactor * 0.1));
    });
  },
  
  // Promote memories that exceed the threshold
  promoteMemories: function() {
    // Find memories to promote
    const memoriesToPromote = this.memories.shortTerm.filter(memory => 
      memory.relevance >= this.config.promotionThreshold
    );
    
    if (memoriesToPromote.length > 0) {
      console.log(`Promoting ${memoriesToPromote.length} memories to long-term memory`);
      
      // Move to long-term memory
      this.memories.longTerm = this.memories.longTerm.concat(memoriesToPromote);
      
      // Remove from short-term memory
      this.memories.shortTerm = this.memories.shortTerm.filter(memory => 
        memory.relevance < this.config.promotionThreshold
      );
    }
  },
  
  // Prune excess memories
  pruneMemories: function() {
    // Sort by relevance (descending)
    this.memories.shortTerm.sort((a, b) => b.relevance - a.relevance);
    this.memories.longTerm.sort((a, b) => b.relevance - a.relevance);
    
    // Prune excess memories
    if (this.memories.shortTerm.length > this.config.maxShortTermMemories) {
      this.memories.shortTerm = this.memories.shortTerm.slice(0, this.config.maxShortTermMemories);
    }
    
    if (this.memories.longTerm.length > this.config.maxLongTermMemories) {
      this.memories.longTerm = this.memories.longTerm.slice(0, this.config.maxLongTermMemories);
    }
  },
  
  // Save memories to IndexedDB
  saveMemories: function() {
    if (!window.AgentLeeTraining || !window.AgentLeeTraining.db) {
      console.error("AgentLeeTraining database not available");
      return;
    }
    
    const transaction = window.AgentLeeTraining.db.transaction(["memories"], "readwrite");
    const store = transaction.objectStore("memories");
    
    // Clear existing memories
    store.clear();
    
    // Add all memories
    const allMemories = [...this.memories.shortTerm, ...this.memories.longTerm];
    
    allMemories.forEach(memory => {
      store.add(memory);
    });
    
    transaction.oncomplete = () => {
      console.log(`Saved ${allMemories.length} memories to database`);
    };
    
    transaction.onerror = (event) => {
      console.error("Error saving memories:", event.target.error);
    };
  },
  
  // Add a new memory
  addMemory: function(input, response, wasSuccessful, category) {
    // Calculate initial relevance score
    const initialRelevance = wasSuccessful ? 0.6 : 0.3;
    
    const memory = {
      input: input,
      response: response,
      wasSuccessful: wasSuccessful,
      category: category,
      timestamp: Date.now(),
      relevance: initialRelevance,
      accessCount: 1
    };
    
    // Add to short-term memory
    this.memories.shortTerm.push(memory);
    
    // Consolidate if short-term memory is getting full
    if (this.memories.shortTerm.length >= this.config.maxShortTermMemories) {
      this.consolidateMemories();
    }
    
    return memory;
  },
  
  // Retrieve memories related to input
  retrieveRelatedMemories: function(input, maxResults = 5) {
    const cleanInput = input.toLowerCase().trim();
    const allMemories = [...this.memories.longTerm, ...this.memories.shortTerm];
    
    // Calculate relevance to the input for each memory
    const scoredMemories = allMemories.map(memory => {
      const relevanceToInput = this.calculateRelevanceToInput(cleanInput, memory);
      return {
        ...memory,
        relevanceToInput: relevanceToInput,
        combinedScore: memory.relevance * 0.4 + relevanceToInput * 0.6
      };
    });
    
    // Sort by combined score (descending)
    scoredMemories.sort((a, b) => b.combinedScore - a.combinedScore);
    
    // Return top results
    const results = scoredMemories.slice(0, maxResults);
    
    // Increment access count for retrieved memories
    results.forEach(result => {
      const memory = allMemories.find(m => m.input === result.input && m.response === result.response);
      if (memory) {
        memory.accessCount++;
      }
    });
    
    return results;
  },
  
  // Calculate relevance of a memory to the input
  calculateRelevanceToInput: function(input, memory) {
    const memoryInput = memory.input.toLowerCase().trim();
    
    // Exact match
    if (input === memoryInput) {
      return 1.0;
    }
    
    // Contains input
    if (memoryInput.includes(input)) {
      return 0.9;
    }
    
    // Input contains memory
    if (input.includes(memoryInput)) {
      return 0.8;
    }
    
    // Calculate word overlap
    const inputWords = input.split(/\s+/);
    const memoryWords = memoryInput.split(/\s+/);
    
    let matchCount = 0;
    inputWords.forEach(word => {
      if (memoryWords.includes(word)) {
        matchCount++;
      }
    });
    
    const overlapScore = matchCount / Math.max(inputWords.length, memoryWords.length);
    
    return overlapScore;
  },
  
  // Get memory statistics
  getStats: function() {
    return {
      shortTermCount: this.memories.shortTerm.length,
      longTermCount: this.memories.longTerm.length,
      totalCount: this.memories.shortTerm.length + this.memories.longTerm.length,
      averageShortTermRelevance: this.calculateAverageRelevance(this.memories.shortTerm),
      averageLongTermRelevance: this.calculateAverageRelevance(this.memories.longTerm),
      categoryBreakdown: this.getCategoryBreakdown()
    };
  },
  
  // Calculate average relevance
  calculateAverageRelevance: function(memories) {
    if (memories.length === 0) return 0;
    
    const sum = memories.reduce((total, memory) => total + memory.relevance, 0);
    return (sum / memories.length).toFixed(2);
  },
  
  // Get category breakdown
  getCategoryBreakdown: function() {
    const categories = {};
    const allMemories = [...this.memories.shortTerm, ...this.memories.longTerm];
    
    allMemories.forEach(memory => {
      const category = memory.category || 'uncategorized';
      
      if (!categories[category]) {
        categories[category] = 0;
      }
      
      categories[category]++;
    });
    
    return categories;
  }
};

// Initialize the memory management system when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for AgentLee and AgentLeeTraining to be available
  const checkInterval = setInterval(() => {
    if (window.AgentLee && window.AgentLeeTraining) {
      clearInterval(checkInterval);
      AgentLeeMemory.init();
      
      // Add to AgentLee object
      window.AgentLee.memory = AgentLeeMemory;
      
      // Enhance AgentLeeTraining.storeMemory to use the memory management system
      const originalStoreMemory = window.AgentLeeTraining.storeMemory;
      
      window.AgentLeeTraining.storeMemory = function(input, response, wasSuccessful, category) {
        // Call original function
        originalStoreMemory.call(this, input, response, wasSuccessful, category);
        
        // Also add to memory management system
        AgentLeeMemory.addMemory(input, response, wasSuccessful, category);
      };
      
      // Enhance handleCommand to use memory retrieval
      const originalHandleCommand = window.handleCommand;
      
      window.handleCommand = function(text) {
        // First check if we have relevant memories
        const relatedMemories = AgentLeeMemory.retrieveRelatedMemories(text, 3);
        
        // If we have highly relevant memories, use them to inform the response
        if (relatedMemories.length > 0 && relatedMemories[0].combinedScore > 0.8) {
          const topMemory = relatedMemories[0];
          
          // Use the memory directly if it's an exact match
          if (topMemory.combinedScore > 0.9) {
            addMessage(topMemory.response, 'agent');
            return;
          }
        }
        
        // If no highly relevant memories, use the original handler
        originalHandleCommand(text);
      };
    }
  }, 100);
});
