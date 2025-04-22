/**
 * Agent Lee One-Shot Learning
 * 
 * This module adds one-shot learning capabilities to Agent Lee,
 * allowing it to learn from single examples and user corrections.
 */

// One-shot learning system
const AgentLeeOneShot = {
  // Patterns for detecting teachable moments
  teachablePatterns: {
    correction: [
      /no,?\s+(that'?s|thats|is|was)\s+(?:not|incorrect|wrong)/i,
      /that'?s\s+(?:not|incorrect|wrong)/i,
      /you'?re\s+(?:wrong|incorrect|mistaken)/i,
      /(?:wrong|incorrect|nope|no)/i
    ],
    teaching: [
      /(?:remember|note|learn)\s+that\s+(.*)/i,
      /when\s+(?:I|someone|user)\s+(?:say|says|ask|asks)\s+(.*?)\s+(?:you|agent lee)\s+should\s+(.*)/i,
      /if\s+(?:I|someone|user)\s+(?:say|says|ask|asks)\s+(.*?)\s+(?:you|agent lee)\s+should\s+(.*)/i,
      /(?:you|agent lee)\s+should\s+(?:say|respond|answer)\s+(.*?)\s+when\s+(?:I|someone|user)\s+(.*)/i
    ],
    question: [
      /what\s+(?:is|are|does|do)\s+(.*)\?/i,
      /how\s+(?:do|does|can|could|would|should)\s+(.*)\?/i,
      /why\s+(?:is|are|does|do|can|could|would|should)\s+(.*)\?/i,
      /(?:tell|show)\s+me\s+(?:about|how)\s+(.*)\?/i
    ]
  },
  
  // Initialize the one-shot learning system
  init: function() {
    console.log("Initializing Agent Lee One-Shot Learning...");
    
    // Set up conversation memory
    this.conversationMemory = [];
    
    // Enhance the handleCommand function to detect teachable moments
    this.enhanceCommandHandler();
    
    console.log("Agent Lee One-Shot Learning initialized successfully");
  },
  
  // Enhance the command handler to detect teachable moments
  enhanceCommandHandler: function() {
    const originalHandleCommand = window.handleCommand;
    
    window.handleCommand = (text) => {
      // Add to conversation memory
      this.addToConversationMemory(text, 'user');
      
      // Check if this is a teachable moment
      const teachableMoment = this.detectTeachableMoment(text);
      
      if (teachableMoment) {
        // Handle the teachable moment
        this.handleTeachableMoment(teachableMoment, text);
      } else {
        // Use the original handler
        originalHandleCommand(text);
      }
    };
    
    // Also enhance the AgentLee.speak function to track responses
    const originalSpeak = window.AgentLee.speak;
    
    window.AgentLee.speak = (text, options = {}) => {
      // Call the original function
      originalSpeak(text, options);
      
      // Add to conversation memory
      this.addToConversationMemory(text, 'agent');
    };
  },
  
  // Add to conversation memory
  addToConversationMemory: function(text, sender) {
    this.conversationMemory.push({
      text: text,
      sender: sender,
      timestamp: Date.now()
    });
    
    // Limit memory size
    if (this.conversationMemory.length > 20) {
      this.conversationMemory.shift();
    }
  },
  
  // Detect if this is a teachable moment
  detectTeachableMoment: function(text) {
    // Check for correction patterns
    for (const pattern of this.teachablePatterns.correction) {
      if (pattern.test(text)) {
        return { type: 'correction', pattern: pattern };
      }
    }
    
    // Check for teaching patterns
    for (const pattern of this.teachablePatterns.teaching) {
      if (pattern.test(text)) {
        return { type: 'teaching', pattern: pattern };
      }
    }
    
    // Check for question patterns that might be worth remembering
    for (const pattern of this.teachablePatterns.question) {
      if (pattern.test(text)) {
        return { type: 'question', pattern: pattern };
      }
    }
    
    return null;
  },
  
  // Handle a teachable moment
  handleTeachableMoment: function(teachableMoment, text) {
    switch (teachableMoment.type) {
      case 'correction':
        this.handleCorrection(text);
        break;
      case 'teaching':
        this.handleTeaching(text, teachableMoment.pattern);
        break;
      case 'question':
        // Just pass through to normal handler, but flag for potential learning
        window.handleCommand(text);
        break;
    }
  },
  
  // Handle a correction
  handleCorrection: function(text) {
    // Get the last agent response
    const lastAgentResponse = this.getLastAgentResponse();
    
    if (!lastAgentResponse) {
      addMessage("I'm not sure what you're correcting. Could you provide the correct information?", 'agent');
      return;
    }
    
    // Get the last user input (before this correction)
    const lastUserInput = this.getLastUserInput(1); // Skip the current correction
    
    if (!lastUserInput) {
      addMessage("I'm not sure what you're correcting. Could you provide the correct information?", 'agent');
      return;
    }
    
    // Ask for the correct response
    addMessage(`I apologize for my mistake. What would be the correct response to "${lastUserInput.text}"?`, 'agent');
    
    // Set up a flag to capture the next user input as the correction
    window.awaitingCorrection = {
      originalInput: lastUserInput.text,
      incorrectResponse: lastAgentResponse.text
    };
    
    // Override handleCommand temporarily to capture the correction
    const originalHandleCommand = window.handleCommand;
    
    window.handleCommand = (correctionText) => {
      if (window.awaitingCorrection) {
        // Learn from this correction
        AgentLeeTraining.storeKnowledge(
          window.awaitingCorrection.originalInput,
          correctionText,
          'corrections'
        );
        
        // Confirm learning
        addMessage(`Thank you for teaching me! I'll remember that "${window.awaitingCorrection.originalInput}" should be answered with "${correctionText}".`, 'agent');
        
        // Show learning indicator
        this.showLearningIndicator();
        
        // Reset
        window.awaitingCorrection = null;
        window.handleCommand = originalHandleCommand;
      } else {
        // Normal handling
        originalHandleCommand(correctionText);
      }
    };
  },
  
  // Handle explicit teaching
  handleTeaching: function(text, pattern) {
    let input, response;
    
    // Extract input and response based on pattern
    if (/when\s+(?:I|someone|user)\s+(?:say|says|ask|asks)\s+(.*?)\s+(?:you|agent lee)\s+should\s+(.*)/i.test(text)) {
      const matches = text.match(/when\s+(?:I|someone|user)\s+(?:say|says|ask|asks)\s+(.*?)\s+(?:you|agent lee)\s+should\s+(.*)/i);
      input = matches[1].trim();
      response = matches[2].trim();
    } else if (/if\s+(?:I|someone|user)\s+(?:say|says|ask|asks)\s+(.*?)\s+(?:you|agent lee)\s+should\s+(.*)/i.test(text)) {
      const matches = text.match(/if\s+(?:I|someone|user)\s+(?:say|says|ask|asks)\s+(.*?)\s+(?:you|agent lee)\s+should\s+(.*)/i);
      input = matches[1].trim();
      response = matches[2].trim();
    } else if (/(?:you|agent lee)\s+should\s+(?:say|respond|answer)\s+(.*?)\s+when\s+(?:I|someone|user)\s+(.*)/i.test(text)) {
      const matches = text.match(/(?:you|agent lee)\s+should\s+(?:say|respond|answer)\s+(.*?)\s+when\s+(?:I|someone|user)\s+(.*)/i);
      response = matches[1].trim();
      input = matches[2].trim();
    } else if (/(?:remember|note|learn)\s+that\s+(.*)/i.test(text)) {
      // This is a fact to remember, not a Q&A pair
      const matches = text.match(/(?:remember|note|learn)\s+that\s+(.*)/i);
      const fact = matches[1].trim();
      
      // Store as a fact
      AgentLeeTraining.storeKnowledge(
        `What is ${fact.split(' ').slice(0, 3).join(' ')}?`,
        fact,
        'facts'
      );
      
      // Confirm learning
      addMessage(`I'll remember that ${fact}.`, 'agent');
      
      // Show learning indicator
      this.showLearningIndicator();
      
      return;
    }
    
    if (input && response) {
      // Store this teaching
      AgentLeeTraining.storeKnowledge(input, response, 'taught');
      
      // Confirm learning
      addMessage(`I've learned that when you say "${input}", I should respond with "${response}".`, 'agent');
      
      // Show learning indicator
      this.showLearningIndicator();
    } else {
      // Couldn't parse the teaching
      addMessage("I'm not sure what you're trying to teach me. Could you rephrase it as 'When I say X, you should say Y'?", 'agent');
    }
  },
  
  // Get the last agent response
  getLastAgentResponse: function() {
    for (let i = this.conversationMemory.length - 1; i >= 0; i--) {
      if (this.conversationMemory[i].sender === 'agent') {
        return this.conversationMemory[i];
      }
    }
    
    return null;
  },
  
  // Get the last user input (skipping a number of recent ones)
  getLastUserInput: function(skip = 0) {
    let skipped = 0;
    
    for (let i = this.conversationMemory.length - 1; i >= 0; i--) {
      if (this.conversationMemory[i].sender === 'user') {
        if (skipped >= skip) {
          return this.conversationMemory[i];
        }
        skipped++;
      }
    }
    
    return null;
  },
  
  // Show learning indicator
  showLearningIndicator: function() {
    const indicator = document.getElementById('learning-indicator');
    
    if (indicator) {
      indicator.style.opacity = '1';
      
      // Hide after 2 seconds
      setTimeout(() => {
        indicator.style.opacity = '0';
      }, 2000);
    }
  }
};

// Initialize the one-shot learning system when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for AgentLee and AgentLeeTraining to be available
  const checkInterval = setInterval(() => {
    if (window.AgentLee && window.AgentLeeTraining) {
      clearInterval(checkInterval);
      AgentLeeOneShot.init();
    }
  }, 100);
});
