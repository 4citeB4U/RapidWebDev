/**
 * @fileoverview Agent Lee Implementation
 * 
 * Lee is the main navigation agent helping users understand and navigate
 * the RWB website.
 * 
 * @module AgentLee
 * @requires AIAnnotations
 * @requires AgentCore
 */

import { AgentComponent, Trackable, AISearchable } from './ai-annotations.js';

// #region Agent Lee Class Definition

/**
 * @class AgentLee
 * @extends AgentCore
 * @description Main navigation assistant for the website
 */
@AgentComponent({
  id: 'agent-lee',
  role: 'navigation',
  capabilities: ['site-navigation', 'user-assistance', 'feature-explanation'],
  version: '1.2.0'
})
@AISearchable({
  keywords: ['navigation', 'home', 'assistant', 'main agent', 'website guide'],
  description: 'Primary navigation assistant that helps users explore the website'
})
class AgentLee {
  /**
   * @constructor
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.name = 'Lee';
    this.role = 'Navigation Specialist';
    this.messageHistory = [];
    this.config = {
      greeting: "Hello! I'm Lee, your navigation assistant. How can I help you explore our website?",
      ...config
    };
    
    // Initialize the agent's knowledge base
    this.initializeKnowledge();
  }
  
  /**
   * @function initializeKnowledge
   * @description Sets up the agent's knowledge base
   * @private
   */
  initializeKnowledge() {
    this.knowledgeBase = {
      navigation: {
        home: { path: '#home', description: 'Main landing page' },
        pricing: { path: '#pricing', description: 'Service pricing options' },
        learning: { path: '#learning', description: 'Learning resources and documentation' },
        animations: { path: '#animations', description: 'Animation showcase and examples' }
      },
      features: [
        { id: 'rapid-dev', name: 'Rapid Development', description: 'Fast turnaround on web projects' },
        { id: 'ai-agents', name: 'AI Agents', description: 'Intelligent assistants for your website' },
        { id: 'responsive', name: 'Responsive Design', description: 'Mobile-friendly layouts' }
      ]
    };
  }
  
  /**
   * @function sendMessage
   * @description Processes a user message and generates a response
   * @param {string} message - The user's message text
   * @returns {Promise<string>} The agent's response
   * @public
   */
  @Trackable({ trackArgs: true })
  async sendMessage(message) {
    // Store the user message
    this.messageHistory.push({ role: 'user', content: message, timestamp: new Date() });
    
    // Process the message and generate a response
    const response = await this.generateResponse(message);
    
    // Store the agent's response
    this.messageHistory.push({ role: 'agent', content: response, timestamp: new Date() });
    
    return response;
  }
  
  /**
   * @function generateResponse
   * @description Generates a response to the user's message
   * @param {string} message - The user's message
   * @returns {Promise<string>} The agent's response
   * @private
   */
  async generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Navigation intent detection
    if (lowerMessage.includes('home') || lowerMessage.includes('main page')) {
      return `I can help you navigate to our home page. Just click [here](#home) or I can tell you about our main features.`;
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan')) {
      return `Our pricing plans are available on the pricing page. Would you like me to [take you there](#pricing)?`;
    }
    
    if (lowerMessage.includes('learn') || lowerMessage.includes('tutorial') || lowerMessage.includes('doc')) {
      return `We have great learning resources available. Let me [show you our learning center](#learning).`;
    }
    
    if (lowerMessage.includes('animate') || lowerMessage.includes('effect') || lowerMessage.includes('motion')) {
      return `Check out our animation showcase to see examples of what we can create. [View animations](#animations).`;
    }
    
    // Default response for other queries
    return `I'm here to help you navigate our website. You can ask about our home page, pricing, learning resources, or animations.`;
  }
  
  /**
   * @function getTranscript
   * @description Retrieves the conversation history
   * @returns {Array} Array of message objects
   * @public
   */
  @AISearchable({
    keywords: ['history', 'transcript', 'conversation', 'chat log'],
    description: 'Retrieves the conversation history between user and agent'
  })
  getTranscript() {
    return [...this.messageHistory];
  }
}

// #endregion Agent Lee Class Definition

// #region Agent Lee DOM Integration

/**
 * @function initAgentLee
 * @description Initializes Agent Lee and connects to the DOM
 * @returns {AgentLee} The initialized agent instance
 */
function initAgentLee() {
  const lee = new AgentLee();
  
  // DOM elements
  const messageInput = document.getElementById('agent-lee-message-input');
  const sendButton = document.getElementById('agent-lee-send-button');
  const chatMessages = document.getElementById('agent-lee-chat-messages');
  
  if (messageInput && sendButton && chatMessages) {
    // Add event listeners
    sendButton.addEventListener('click', async () => {
      const text = messageInput.value.trim();
      if (!text) return;
      
      // Display user message
      addMessageToChat(text, 'user');
      messageInput.value = '';
      
      // Get and display agent response
      const response = await lee.sendMessage(text);
      addMessageToChat(response, 'agent');
    });
    
    messageInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
      }
    });
    
    // Display initial greeting
    addMessageToChat(lee.config.greeting, 'agent');
  }
  
  /**
   * @function addMessageToChat
   * @description Adds a message to the chat UI
   * @param {string} text - Message text
   * @param {string} sender - 'user' or 'agent'
   * @private
   */
  function addMessageToChat(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'agent-message');
    
    // Handle markdown-like links in agent messages
    if (sender === 'agent') {
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-200 underline">$1</a>');
      messageElement.innerHTML = text;
    } else {
      messageElement.textContent = text;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Hide empty message if it exists
    const emptyMessage = document.getElementById('agent-lee-empty-message');
    if (emptyMessage) {
      emptyMessage.style.display = 'none';
    }
  }
  
  return lee;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if the card is visible
  const card = document.getElementById('agent-lee-card');
  if (card && card.style.display !== 'none') {
    window.agentLeeInstance = initAgentLee();
    console.log('[Agent System] Lee initialized');
  }
});

// #endregion Agent Lee DOM Integration

// Export the agent class
export default AgentLee;