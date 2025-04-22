/**
 * Agent Lee - Gemini Integration
 * 
 * Integrates Google Gemini 2.5 Pro Preview with Agent Lee
 * for in-browser AI processing without backend API requirements.
 */

class AgentLeeGemini {
  constructor() {
    this.initialized = false;
    this.model = null;
    this.apiKey = null; // Will be loaded from localStorage if available
    this.fallbackEnabled = false;
  }

  /**
   * Initialize the Gemini integration
   */
  async init() {
    if (this.initialized) return true;
    
    console.log("Initializing Agent Lee Gemini integration...");
    
    try {
      // Load the Gemini SDK
      await this.loadGeminiSDK();
      
      // Try to load API key from localStorage
      this.apiKey = localStorage.getItem('gemini_api_key');
      
      // Initialize the model
      if (this.apiKey) {
        this.model = await this.initializeModel();
        this.initialized = true;
        console.log("Gemini integration initialized successfully");
        return true;
      } else {
        console.warn("No Gemini API key found. Please set one in settings.");
        return false;
      }
    } catch (error) {
      console.error("Failed to initialize Gemini:", error);
      return false;
    }
  }

  /**
   * Load the Gemini SDK
   */
  async loadGeminiSDK() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.generativeai) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://ai.google.dev/api/js/ai_gemini.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Gemini SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize the Gemini model
   */
  async initializeModel() {
    const genAI = window.google.generativeai;
    genAI.configure({ apiKey: this.apiKey });
    
    // Use Gemini 2.5 Pro Preview
    return genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview" });
  }

  /**
   * Process user input with Gemini
   * @param {string} input - User input text
   * @param {object} context - Optional context information
   * @returns {Promise<string>} - AI response
   */
  async processInput(input, context = {}) {
    if (!this.initialized) {
      const success = await this.init();
      if (!success) {
        return this.handleFallback(input, context);
      }
    }
    
    try {
      // Create chat history if available in context
      const history = context.conversationHistory || [];
      
      // Create prompt with agent personality and context
      const agentName = window.AgentLee.agents[window.AgentLee.currentAgent].name;
      const systemPrompt = `You are ${agentName}, an AI assistant for Rapid Web Development. 
                           Be helpful, concise, and friendly. Current page section: ${context.currentSection || 'unknown'}.`;
      
      // Generate response
      const result = await this.model.generateContent({
        contents: [
          { role: "system", parts: [{ text: systemPrompt }] },
          ...history.map(msg => ({ 
            role: msg.sender === 'agent' ? "model" : "user", 
            parts: [{ text: msg.text }] 
          })),
          { role: "user", parts: [{ text: input }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      });
      
      return result.response.text();
    } catch (error) {
      console.error("Gemini processing error:", error);
      return this.handleFallback(input, context);
    }
  }

  /**
   * Handle fallback to other models if Gemini fails
   */
  async handleFallback(input, context) {
    if (!this.fallbackEnabled) {
      return "I'm having trouble connecting to my AI services. Please try again later or check your internet connection.";
    }
    
    // Implement fallback logic here (OpenAI or Claude)
    console.warn("Using fallback AI service");
    
    // For now, return a simple response
    return "I'm currently operating in fallback mode with limited capabilities. Please check your Gemini API key in settings.";
  }

  /**
   * Set the API key
   * @param {string} apiKey - The Gemini API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('gemini_api_key', apiKey);
    this.initialized = false; // Force reinitialization with new key
    return this.init();
  }

  /**
   * Enable or disable fallback to other models
   * @param {boolean} enabled - Whether fallback is enabled
   */
  setFallbackEnabled(enabled) {
    this.fallbackEnabled = enabled;
    localStorage.setItem('gemini_fallback_enabled', enabled ? 'true' : 'false');
  }
}

// Create and initialize the Gemini integration
const agentLeeGemini = new AgentLeeGemini();

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for AgentLee to be available
  const checkInterval = setInterval(() => {
    if (window.AgentLee && window.AgentLee.initialized) {
      clearInterval(checkInterval);
      agentLeeGemini.init();
      
      // Add to AgentLee object
      window.AgentLee.gemini = agentLeeGemini;
      
      // Enhance handleCommand to use Gemini
      const originalHandleCommand = window.AgentLee.handleCommand;
      
      window.AgentLee.handleCommand = async function(command) {
        // First check if we should use memory/training system
        if (window.AgentLeeTraining) {
          const trainedResponse = window.AgentLeeTraining.findResponse(command);
          if (trainedResponse && trainedResponse.confidence > 0.8) {
            this.speak(trainedResponse.response);
            return;
          }
        }
        
        // Get conversation context
        const context = {
          currentSection: this.currentSection || 'unknown',
          conversationHistory: window.AgentLeeMemory ? 
            window.AgentLeeMemory.retrieveConversationHistory(5) : []
        };
        
        // Process with Gemini
        try {
          const response = await agentLeeGemini.processInput(command, context);
          this.speak(response);
          
          // Add to memory if available
          if (window.AgentLeeMemory) {
            window.AgentLeeMemory.addMemory(command, response, true, 'gemini');
          }
        } catch (error) {
          console.error("Failed to process with Gemini:", error);
          // Fall back to original handler
          originalHandleCommand.call(this, command);
        }
      };
    }
  }, 100);
});

// Export for global access
window.AgentLeeGemini = agentLeeGemini;