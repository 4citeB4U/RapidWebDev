/**
 * Agent Manager Module
 * Coordinates multiple AI agents and manages context sharing between them
 */

import { getLastTranscripts } from './transcript-store.js';

// Agent types
export const AgentType = {
  CEO: 'ceo',
  SALES: 'sales',
  SUPPORT: 'support',
  LEARNING: 'learning',
  PRICING: 'pricing',
  ANIMATION: 'animation',
  RESOURCE: 'resource',
  SHOWCASE: 'showcase'
};

// Agent state
const agents = {};
let activeAgent = null;
let contextCache = {};
let userId = 'anonymous';
let sessionId = `session_${Date.now()}`;

/**
 * Register an agent with the manager
 * @param {string} type - The agent type
 * @param {Object} agent - The agent instance
 */
export function registerAgent(type, agent) {
  if (!Object.values(AgentType).includes(type)) {
    console.warn(`Unknown agent type: ${type}`);
  }
  
  agents[type] = agent;
  console.log(`Agent registered: ${type}`);
}

/**
 * Get an agent by type
 * @param {string} type - The agent type
 * @returns {Object} - The agent instance
 */
export function getAgent(type) {
  return agents[type];
}

/**
 * Set the active agent
 * @param {string} type - The agent type
 * @returns {Object} - The active agent instance
 */
export function setActiveAgent(type) {
  if (!agents[type]) {
    console.warn(`Agent not found: ${type}`);
    return null;
  }
  
  activeAgent = type;
  console.log(`Active agent set: ${type}`);
  
  return agents[type];
}

/**
 * Get the active agent
 * @returns {Object} - The active agent instance
 */
export function getActiveAgent() {
  return activeAgent ? agents[activeAgent] : null;
}

/**
 * Get the active agent type
 * @returns {string} - The active agent type
 */
export function getActiveAgentType() {
  return activeAgent;
}

/**
 * Set the user ID
 * @param {string} id - The user ID
 */
export function setUserId(id) {
  userId = id;
  console.log(`User ID set: ${id}`);
}

/**
 * Get the user ID
 * @returns {string} - The user ID
 */
export function getUserId() {
  return userId;
}

/**
 * Set the session ID
 * @param {string} id - The session ID
 */
export function setSessionId(id) {
  sessionId = id;
  console.log(`Session ID set: ${id}`);
}

/**
 * Get the session ID
 * @returns {string} - The session ID
 */
export function getSessionId() {
  return sessionId;
}

/**
 * Handle a user command
 * @param {string} command - The user command
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The agent response
 */
export async function handleCommand(command, options = {}) {
  try {
    // Get the active agent
    const agent = getActiveAgent();
    
    if (!agent) {
      console.warn('No active agent to handle command');
      return { error: true, message: 'No active agent available' };
    }
    
    // Get context for the command
    const context = await getContextForCommand(command);
    
    // Handle the command with context
    const response = await agent.handleCommand(command, {
      ...options,
      context,
      userId,
      sessionId
    });
    
    // Update context cache with the response
    updateContextCache(command, response);
    
    return response;
  } catch (error) {
    console.error('Failed to handle command:', error);
    return { error: true, message: 'Failed to process your request' };
  }
}

/**
 * Get context for a command
 * @param {string} command - The user command
 * @returns {Promise<Object>} - The context object
 */
async function getContextForCommand(command) {
  try {
    // Get recent transcripts for the user
    const recentTranscripts = await getLastTranscripts(userId, 5);
    
    // Get cached context
    const cachedContext = contextCache[userId] || {};
    
    // Build context object
    const context = {
      recentInteractions: recentTranscripts.map(t => ({
        role: t.role,
        text: t.text,
        timestamp: t.timestamp
      })),
      userPreferences: cachedContext.userPreferences || {},
      currentPage: cachedContext.currentPage || 'home',
      previousCommands: cachedContext.previousCommands || [],
      sessionData: cachedContext.sessionData || {}
    };
    
    return context;
  } catch (error) {
    console.error('Failed to get context for command:', error);
    return {};
  }
}

/**
 * Update the context cache with new information
 * @param {string} command - The user command
 * @param {Object} response - The agent response
 */
function updateContextCache(command, response) {
  // Get current cache for the user
  const currentCache = contextCache[userId] || {
    userPreferences: {},
    previousCommands: [],
    sessionData: {}
  };
  
  // Update previous commands
  const previousCommands = [
    ...currentCache.previousCommands,
    {
      command,
      response: response.message || response,
      timestamp: Date.now()
    }
  ].slice(-10); // Keep only the last 10 commands
  
  // Update context cache
  contextCache[userId] = {
    ...currentCache,
    previousCommands,
    lastCommand: command,
    lastResponse: response.message || response,
    lastInteraction: Date.now()
  };
}

/**
 * Set user preferences
 * @param {Object} preferences - The user preferences
 */
export function setUserPreferences(preferences) {
  // Get current cache for the user
  const currentCache = contextCache[userId] || {
    userPreferences: {},
    previousCommands: [],
    sessionData: {}
  };
  
  // Update user preferences
  contextCache[userId] = {
    ...currentCache,
    userPreferences: {
      ...currentCache.userPreferences,
      ...preferences
    }
  };
  
  console.log('User preferences updated:', preferences);
}

/**
 * Get user preferences
 * @returns {Object} - The user preferences
 */
export function getUserPreferences() {
  const currentCache = contextCache[userId] || {};
  return currentCache.userPreferences || {};
}

/**
 * Set the current page
 * @param {string} page - The current page
 */
export function setCurrentPage(page) {
  // Get current cache for the user
  const currentCache = contextCache[userId] || {
    userPreferences: {},
    previousCommands: [],
    sessionData: {}
  };
  
  // Update current page
  contextCache[userId] = {
    ...currentCache,
    currentPage: page,
    pageHistory: [
      ...(currentCache.pageHistory || []),
      { page, timestamp: Date.now() }
    ].slice(-10) // Keep only the last 10 pages
  };
  
  console.log('Current page set:', page);
}

/**
 * Get the current page
 * @returns {string} - The current page
 */
export function getCurrentPage() {
  const currentCache = contextCache[userId] || {};
  return currentCache.currentPage || 'home';
}

/**
 * Set session data
 * @param {string} key - The data key
 * @param {any} value - The data value
 */
export function setSessionData(key, value) {
  // Get current cache for the user
  const currentCache = contextCache[userId] || {
    userPreferences: {},
    previousCommands: [],
    sessionData: {}
  };
  
  // Update session data
  contextCache[userId] = {
    ...currentCache,
    sessionData: {
      ...currentCache.sessionData,
      [key]: value
    }
  };
}

/**
 * Get session data
 * @param {string} key - The data key
 * @returns {any} - The data value
 */
export function getSessionData(key) {
  const currentCache = contextCache[userId] || {};
  const sessionData = currentCache.sessionData || {};
  return sessionData[key];
}

/**
 * Clear session data
 */
export function clearSessionData() {
  // Get current cache for the user
  const currentCache = contextCache[userId] || {
    userPreferences: {},
    previousCommands: [],
    sessionData: {}
  };
  
  // Clear session data
  contextCache[userId] = {
    ...currentCache,
    sessionData: {}
  };
  
  console.log('Session data cleared');
}

/**
 * Get all agents
 * @returns {Object} - All registered agents
 */
export function getAllAgents() {
  return { ...agents };
}

/**
 * Initialize the agent manager
 * @returns {Promise<void>} - Resolves when initialization is complete
 */
export async function initAgentManager() {
  try {
    // Generate a new session ID
    sessionId = `session_${Date.now()}`;
    
    // Try to get user ID from localStorage
    if (typeof localStorage !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        userId = storedUserId;
      } else {
        // Generate a new user ID
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('user_id', userId);
      }
    }
    
    console.log('Agent Manager initialized');
    console.log('User ID:', userId);
    console.log('Session ID:', sessionId);
    
    // Set Agent Lee as the default active agent
    if (agents[AgentType.CEO]) {
      setActiveAgent(AgentType.CEO);
    }
  } catch (error) {
    console.error('Failed to initialize Agent Manager:', error);
  }
}

// Initialize the agent manager when the module is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initAgentManager().catch(console.error);
  });
}
