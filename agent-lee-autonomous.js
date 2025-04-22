/**
 * Agent Lee Autonomous Training
 * 
 * This module adds autonomous training capabilities to Agent Lee,
 * allowing it to learn from site content, user interactions, and streaming data.
 */

// Autonomous training system
const AgentLeeAutonomous = {
  // Training configuration
  config: {
    // How often to run autonomous training (in milliseconds)
    trainingInterval: 3600000, // 1 hour
    
    // Maximum number of items to process in each training cycle
    maxItemsPerCycle: 50,
    
    // Minimum confidence threshold for learning
    confidenceThreshold: 0.7,
    
    // Whether to enable autonomous training
    enabled: true
  },
  
  // Initialize the autonomous training system
  init: function() {
    console.log("Initializing Agent Lee Autonomous Training...");
    
    // Load configuration from localStorage
    this.loadConfig();
    
    // Set up training data sources
    this.setupDataSources();
    
    // Start autonomous training cycle
    if (this.config.enabled) {
      this.startTrainingCycle();
    }
    
    console.log("Agent Lee Autonomous Training initialized successfully");
  },
  
  // Load configuration from localStorage
  loadConfig: function() {
    const savedConfig = localStorage.getItem('agentLeeAutonomousConfig');
    
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsedConfig };
      } catch (error) {
        console.error("Error parsing autonomous training config:", error);
      }
    }
  },
  
  // Save configuration to localStorage
  saveConfig: function() {
    localStorage.setItem('agentLeeAutonomousConfig', JSON.stringify(this.config));
  },
  
  // Set up training data sources
  setupDataSources: function() {
    this.dataSources = {
      // Site content source
      siteContent: {
        name: "Site Content",
        description: "Learns from the content of the website",
        enabled: true,
        lastProcessed: 0,
        processor: this.processSiteContent.bind(this)
      },
      
      // User interactions source
      userInteractions: {
        name: "User Interactions",
        description: "Learns from user interactions with Agent Lee",
        enabled: true,
        lastProcessed: 0,
        processor: this.processUserInteractions.bind(this)
      },
      
      // DOM changes source
      domChanges: {
        name: "DOM Changes",
        description: "Learns from changes to the page content",
        enabled: true,
        lastProcessed: 0,
        processor: this.processDOMChanges.bind(this)
      }
    };
    
    // Set up DOM mutation observer
    this.setupMutationObserver();
  },
  
  // Set up mutation observer to track DOM changes
  setupMutationObserver: function() {
    this.domChanges = [];
    
    // Create a mutation observer
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Only track significant content changes
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if added nodes contain significant content
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if this is a significant element (heading, paragraph, list, etc.)
              if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'DL', 'TABLE'].includes(node.tagName)) {
                this.domChanges.push({
                  element: node,
                  content: node.textContent,
                  timestamp: Date.now()
                });
              }
            }
          });
        }
      });
    });
    
    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
  
  // Start the autonomous training cycle
  startTrainingCycle: function() {
    console.log("Starting autonomous training cycle...");
    
    // Run initial training
    this.runTrainingCycle();
    
    // Set up interval for regular training
    this.trainingInterval = setInterval(() => {
      this.runTrainingCycle();
    }, this.config.trainingInterval);
  },
  
  // Run a training cycle
  runTrainingCycle: function() {
    console.log("Running autonomous training cycle...");
    
    // Process each enabled data source
    Object.values(this.dataSources).forEach(source => {
      if (source.enabled) {
        try {
          source.processor();
          source.lastProcessed = Date.now();
        } catch (error) {
          console.error(`Error processing ${source.name}:`, error);
        }
      }
    });
    
    // Update training stats
    if (window.AgentLeeTraining) {
      window.AgentLeeTraining.updateAnalytics();
    }
    
    console.log("Autonomous training cycle completed");
  },
  
  // Process site content
  processSiteContent: function() {
    console.log("Processing site content...");
    
    // Get all headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Process each heading and its content
    headings.forEach(heading => {
      const headingText = heading.textContent.trim();
      
      if (headingText.length < 5) return; // Skip very short headings
      
      // Get the content following this heading
      const content = this.getContentAfterHeading(heading);
      
      if (content && content.length > 20) {
        // Create question-answer pairs
        const questions = this.generateQuestionsFromHeading(headingText);
        
        // Store each question-answer pair
        questions.forEach(question => {
          window.AgentLeeTraining.storeKnowledge(
            question,
            content.substring(0, 500), // Limit length
            'site-content'
          );
        });
      }
    });
    
    // Process lists
    const lists = document.querySelectorAll('ul, ol');
    
    lists.forEach(list => {
      // Get the heading before this list
      const heading = this.getHeadingBeforeElement(list);
      
      if (heading) {
        const headingText = heading.textContent.trim();
        const listItems = Array.from(list.querySelectorAll('li')).map(li => li.textContent.trim());
        
        if (listItems.length > 0) {
          // Create a list response
          const response = `${headingText}:\n${listItems.map(item => `• ${item}`).join('\n')}`;
          
          // Generate questions
          const questions = [
            `What are the ${headingText.toLowerCase()}?`,
            `List the ${headingText.toLowerCase()}`,
            `Tell me about ${headingText.toLowerCase()}`
          ];
          
          // Store each question-answer pair
          questions.forEach(question => {
            window.AgentLeeTraining.storeKnowledge(
              question,
              response,
              'site-content'
            );
          });
        }
      }
    });
  },
  
  // Get content after a heading
  getContentAfterHeading: function(heading) {
    let content = [];
    let currentElement = heading.nextElementSibling;
    
    // Collect content until the next heading or end of parent
    while (currentElement && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(currentElement.tagName)) {
      // Skip empty elements and non-content elements
      if (currentElement.textContent.trim() && 
          !['SCRIPT', 'STYLE', 'META', 'LINK'].includes(currentElement.tagName)) {
        content.push(currentElement.textContent.trim());
      }
      
      currentElement = currentElement.nextElementSibling;
    }
    
    return content.join(' ');
  },
  
  // Get the heading before an element
  getHeadingBeforeElement: function(element) {
    let currentElement = element.previousElementSibling;
    
    while (currentElement) {
      if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(currentElement.tagName)) {
        return currentElement;
      }
      
      currentElement = currentElement.previousElementSibling;
    }
    
    return null;
  },
  
  // Generate questions from a heading
  generateQuestionsFromHeading: function(heading) {
    const questions = [
      `What is ${heading}?`,
      `Tell me about ${heading}`,
      `Explain ${heading}`
    ];
    
    // Add more specific questions based on heading content
    if (heading.toLowerCase().includes('how')) {
      questions.push(`How do I ${heading.toLowerCase().replace('how to ', '').replace('how ', '')}?`);
    }
    
    if (heading.toLowerCase().includes('why')) {
      questions.push(`Why ${heading.toLowerCase().replace('why ', '')}?`);
    }
    
    return questions;
  },
  
  // Process user interactions
  processUserInteractions: function() {
    console.log("Processing user interactions...");
    
    // Get user interaction history from localStorage
    const userHistory = localStorage.getItem('agentLeeUserHistory');
    
    if (userHistory) {
      try {
        const history = JSON.parse(userHistory);
        
        // Process recent interactions
        const recentInteractions = history.slice(-this.config.maxItemsPerCycle);
        
        recentInteractions.forEach(interaction => {
          // Only process user inputs
          if (interaction.sender === 'user') {
            // Find the corresponding agent response
            const responseIndex = history.findIndex((item, index) => {
              return index > history.indexOf(interaction) && item.sender === 'agent';
            });
            
            if (responseIndex !== -1) {
              const response = history[responseIndex];
              
              // Learn from this interaction if it wasn't already processed
              if (!interaction.processed) {
                window.AgentLeeTraining.learnFromInteraction(
                  interaction.text,
                  response.text,
                  true, // Assume it was successful
                  'user-interactions'
                );
                
                // Mark as processed
                interaction.processed = true;
              }
            }
          }
        });
        
        // Save updated history
        localStorage.setItem('agentLeeUserHistory', JSON.stringify(history));
      } catch (error) {
        console.error("Error processing user interactions:", error);
      }
    }
  },
  
  // Process DOM changes
  processDOMChanges: function() {
    console.log("Processing DOM changes...");
    
    // Process recent DOM changes
    const recentChanges = this.domChanges.slice(-this.config.maxItemsPerCycle);
    
    recentChanges.forEach(change => {
      const content = change.content.trim();
      
      if (content.length > 20) {
        // Try to determine what this content is about
        const topic = this.inferTopicFromContent(content);
        
        if (topic) {
          // Generate a question based on the topic
          const question = `What about ${topic}?`;
          
          // Store this knowledge
          window.AgentLeeTraining.storeKnowledge(
            question,
            content.substring(0, 500), // Limit length
            'dom-changes'
          );
        }
      }
    });
    
    // Clear processed changes
    this.domChanges = this.domChanges.slice(this.config.maxItemsPerCycle);
  },
  
  // Infer a topic from content
  inferTopicFromContent: function(content) {
    // Simple topic extraction - get the first few words
    const words = content.split(/\s+/);
    
    if (words.length > 2) {
      // Use first 3-5 words as the topic
      return words.slice(0, Math.min(5, words.length)).join(' ');
    }
    
    return null;
  },
  
  // Enable or disable autonomous training
  setEnabled: function(enabled) {
    this.config.enabled = enabled;
    
    if (enabled && !this.trainingInterval) {
      this.startTrainingCycle();
    } else if (!enabled && this.trainingInterval) {
      clearInterval(this.trainingInterval);
      this.trainingInterval = null;
    }
    
    // Save config
    this.saveConfig();
  },
  
  // Get training status
  getStatus: function() {
    return {
      enabled: this.config.enabled,
      lastTrainingCycle: Math.max(...Object.values(this.dataSources).map(source => source.lastProcessed)),
      dataSources: Object.values(this.dataSources).map(source => ({
        name: source.name,
        enabled: source.enabled,
        lastProcessed: source.lastProcessed
      })),
      domChangesQueued: this.domChanges.length
    };
  }
};

// Initialize the autonomous training system when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for AgentLee and AgentLeeTraining to be available
  const checkInterval = setInterval(() => {
    if (window.AgentLee && window.AgentLeeTraining) {
      clearInterval(checkInterval);
      AgentLeeAutonomous.init();
      
      // Add to AgentLee object
      window.AgentLee.autonomous = AgentLeeAutonomous;
    }
  }, 100);
});
