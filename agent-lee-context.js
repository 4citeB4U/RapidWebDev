/**
 * Agent Lee Context Module
 * Enhances Agent Lee with context awareness and personalization
 */

import { handleMessage } from './transcript-store.js';
import * as AgentManager from './agent-manager.js';

// Context types
export const ContextType = {
  USER_PROFILE: 'user_profile',
  CONVERSATION_HISTORY: 'conversation_history',
  PAGE_CONTEXT: 'page_context',
  PREFERENCES: 'preferences',
  SYSTEM: 'system'
};

// Context store
const contextStore = {
  userProfiles: {},
  conversationHistory: {},
  pageContexts: {},
  preferences: {},
  systemContext: {}
};

/**
 * Initialize Agent Lee context
 * @param {string} userId - The user ID
 * @returns {Promise<void>} - Resolves when initialization is complete
 */
export async function initContext(userId) {
  try {
    // Set user ID in Agent Manager
    AgentManager.setUserId(userId);
    
    // Initialize user profile if it doesn't exist
    if (!contextStore.userProfiles[userId]) {
      contextStore.userProfiles[userId] = {
        id: userId,
        name: null,
        email: null,
        phone: null,
        interests: [],
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        visitCount: 1
      };
    } else {
      // Update existing user profile
      contextStore.userProfiles[userId] = {
        ...contextStore.userProfiles[userId],
        lastSeen: Date.now(),
        visitCount: (contextStore.userProfiles[userId].visitCount || 0) + 1
      };
    }
    
    // Initialize conversation history if it doesn't exist
    if (!contextStore.conversationHistory[userId]) {
      contextStore.conversationHistory[userId] = [];
    }
    
    // Initialize preferences if they don't exist
    if (!contextStore.preferences[userId]) {
      contextStore.preferences[userId] = {
        voice: 'default',
        speechRate: 1,
        theme: 'default',
        notifications: true
      };
    }
    
    console.log('Agent Lee context initialized for user:', userId);
  } catch (error) {
    console.error('Failed to initialize Agent Lee context:', error);
  }
}

/**
 * Update user profile
 * @param {string} userId - The user ID
 * @param {Object} profileData - The profile data to update
 * @returns {Object} - The updated user profile
 */
export function updateUserProfile(userId, profileData) {
  // Get current profile
  const currentProfile = contextStore.userProfiles[userId] || {
    id: userId,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    visitCount: 1
  };
  
  // Update profile
  contextStore.userProfiles[userId] = {
    ...currentProfile,
    ...profileData,
    lastSeen: Date.now()
  };
  
  console.log('User profile updated:', userId);
  
  return contextStore.userProfiles[userId];
}

/**
 * Get user profile
 * @param {string} userId - The user ID
 * @returns {Object} - The user profile
 */
export function getUserProfile(userId) {
  return contextStore.userProfiles[userId] || null;
}

/**
 * Add conversation entry
 * @param {string} userId - The user ID
 * @param {string} role - The role (user, agent, system)
 * @param {string} text - The message text
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} - The conversation entry
 */
export async function addConversationEntry(userId, role, text, metadata = {}) {
  try {
    // Create entry
    const entry = {
      role,
      text,
      timestamp: Date.now(),
      metadata
    };
    
    // Initialize conversation history if it doesn't exist
    if (!contextStore.conversationHistory[userId]) {
      contextStore.conversationHistory[userId] = [];
    }
    
    // Add entry to conversation history
    contextStore.conversationHistory[userId].push(entry);
    
    // Limit conversation history to 100 entries
    if (contextStore.conversationHistory[userId].length > 100) {
      contextStore.conversationHistory[userId] = contextStore.conversationHistory[userId].slice(-100);
    }
    
    // Save to transcript store
    await handleMessage(
      role,
      text,
      metadata.audioBlob || null,
      userId,
      AgentManager.getSessionId()
    );
    
    return entry;
  } catch (error) {
    console.error('Failed to add conversation entry:', error);
    throw error;
  }
}

/**
 * Get conversation history
 * @param {string} userId - The user ID
 * @param {number} limit - The maximum number of entries to return
 * @returns {Array} - The conversation history
 */
export function getConversationHistory(userId, limit = 10) {
  const history = contextStore.conversationHistory[userId] || [];
  return history.slice(-limit);
}

/**
 * Set page context
 * @param {string} pageId - The page ID
 * @param {Object} context - The page context
 */
export function setPageContext(pageId, context) {
  contextStore.pageContexts[pageId] = {
    ...contextStore.pageContexts[pageId],
    ...context,
    updatedAt: Date.now()
  };
  
  console.log('Page context updated:', pageId);
}

/**
 * Get page context
 * @param {string} pageId - The page ID
 * @returns {Object} - The page context
 */
export function getPageContext(pageId) {
  return contextStore.pageContexts[pageId] || null;
}

/**
 * Set user preferences
 * @param {string} userId - The user ID
 * @param {Object} preferences - The preferences to set
 * @returns {Object} - The updated preferences
 */
export function setUserPreferences(userId, preferences) {
  // Get current preferences
  const currentPreferences = contextStore.preferences[userId] || {
    voice: 'default',
    speechRate: 1,
    theme: 'default',
    notifications: true
  };
  
  // Update preferences
  contextStore.preferences[userId] = {
    ...currentPreferences,
    ...preferences
  };
  
  // Update preferences in Agent Manager
  AgentManager.setUserPreferences(contextStore.preferences[userId]);
  
  console.log('User preferences updated:', userId);
  
  return contextStore.preferences[userId];
}

/**
 * Get user preferences
 * @param {string} userId - The user ID
 * @returns {Object} - The user preferences
 */
export function getUserPreferences(userId) {
  return contextStore.preferences[userId] || {
    voice: 'default',
    speechRate: 1,
    theme: 'default',
    notifications: true
  };
}

/**
 * Set system context
 * @param {string} key - The context key
 * @param {any} value - The context value
 */
export function setSystemContext(key, value) {
  contextStore.systemContext[key] = value;
  console.log('System context updated:', key);
}

/**
 * Get system context
 * @param {string} key - The context key
 * @returns {any} - The context value
 */
export function getSystemContext(key) {
  return contextStore.systemContext[key];
}

/**
 * Get all system context
 * @returns {Object} - All system context
 */
export function getAllSystemContext() {
  return { ...contextStore.systemContext };
}

/**
 * Generate personalized greeting
 * @param {string} userId - The user ID
 * @returns {string} - The personalized greeting
 */
export function generatePersonalizedGreeting(userId) {
  try {
    // Get user profile
    const profile = getUserProfile(userId);
    
    if (!profile) {
      return "Hello! How can I help you today?";
    }
    
    // Get current hour
    const hour = new Date().getHours();
    
    // Determine time of day
    let timeOfDay = "day";
    if (hour < 12) {
      timeOfDay = "morning";
    } else if (hour < 18) {
      timeOfDay = "afternoon";
    } else {
      timeOfDay = "evening";
    }
    
    // Generate greeting
    let greeting = `Good ${timeOfDay}`;
    
    // Add name if available
    if (profile.name) {
      greeting += `, ${profile.name}`;
    }
    
    // Add return visitor message
    if (profile.visitCount > 1) {
      greeting += "! Welcome back. How can I assist you today?";
    } else {
      greeting += "! How can I help you today?";
    }
    
    return greeting;
  } catch (error) {
    console.error('Failed to generate personalized greeting:', error);
    return "Hello! How can I help you today?";
  }
}

/**
 * Extract user information from text
 * @param {string} text - The text to extract from
 * @param {string} userId - The user ID
 * @returns {Object} - The extracted information
 */
export function extractUserInfo(text, userId) {
  const info = {};
  
  // Extract name
  const namePatterns = [
    /my name is ([A-Za-z]+)/i,
    /i am ([A-Za-z]+)/i,
    /i'm ([A-Za-z]+)/i,
    /call me ([A-Za-z]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      info.name = match[1];
      break;
    }
  }
  
  // Extract email
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailPattern);
  if (emailMatch) {
    info.email = emailMatch[0];
  }
  
  // Extract phone
  const phonePattern = /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;
  const phoneMatch = text.match(phonePattern);
  if (phoneMatch) {
    info.phone = phoneMatch[0];
  }
  
  // Extract interests
  const interestPatterns = [
    /interested in ([^.]+)/i,
    /looking for ([^.]+)/i,
    /need help with ([^.]+)/i,
    /want to ([^.]+)/i
  ];
  
  for (const pattern of interestPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      info.interests = [match[1].trim()];
      break;
    }
  }
  
  // Update user profile if information was extracted
  if (Object.keys(info).length > 0) {
    updateUserProfile(userId, info);
  }
  
  return info;
}

/**
 * Process user input with context
 * @param {string} text - The user input
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The processed result
 */
export async function processInputWithContext(text, userId) {
  try {
    // Extract user information
    extractUserInfo(text, userId);
    
    // Add to conversation history
    await addConversationEntry(userId, 'user', text);
    
    // Get context for processing
    const context = {
      profile: getUserProfile(userId),
      history: getConversationHistory(userId, 5),
      preferences: getUserPreferences(userId),
      currentPage: AgentManager.getCurrentPage(),
      systemContext: getAllSystemContext()
    };
    
    // Process with Agent Manager
    const response = await AgentManager.handleCommand(text, { context });
    
    // Add agent response to conversation history
    if (response && !response.error) {
      const responseText = response.message || response;
      await addConversationEntry(userId, 'agent', responseText);
    }
    
    return response;
  } catch (error) {
    console.error('Failed to process input with context:', error);
    return { error: true, message: 'Failed to process your request' };
  }
}

// Initialize context when the module is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Try to get user ID from Agent Manager
    const userId = AgentManager.getUserId();
    
    if (userId) {
      initContext(userId).catch(console.error);
    }
  });
}
