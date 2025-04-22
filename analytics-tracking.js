/**
 * Analytics Tracking Module
 * Provides functions for tracking user interactions and events
 */

// Event categories
export const EventCategory = {
  AGENT: 'agent',
  CONTACT: 'contact',
  NAVIGATION: 'navigation',
  ENGAGEMENT: 'engagement',
  CONVERSION: 'conversion',
  ERROR: 'error'
};

// Event actions
export const EventAction = {
  // Agent events
  AGENT_INTERACTION: 'agent_interaction',
  AGENT_RESPONSE: 'agent_response',
  AGENT_ERROR: 'agent_error',
  AGENT_SWITCH: 'agent_switch',
  
  // Contact events
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  CONTACT_FORM_ERROR: 'contact_form_error',
  CALLBACK_SCHEDULED: 'callback_scheduled',
  
  // Navigation events
  PAGE_VIEW: 'page_view',
  SECTION_VIEW: 'section_view',
  EXTERNAL_LINK: 'external_link',
  
  // Engagement events
  BUTTON_CLICK: 'button_click',
  VIDEO_PLAY: 'video_play',
  VIDEO_COMPLETE: 'video_complete',
  DOCUMENT_DOWNLOAD: 'document_download',
  
  // Conversion events
  LEAD_CAPTURED: 'lead_captured',
  SIGNUP: 'signup',
  PURCHASE: 'purchase',
  
  // Error events
  FORM_ERROR: 'form_error',
  API_ERROR: 'api_error',
  JS_ERROR: 'js_error'
};

/**
 * Track an event using Google Analytics
 * @param {string} category - The event category
 * @param {string} action - The event action
 * @param {string} label - The event label
 * @param {number} value - The event value
 */
export function trackEvent(category, action, label = null, value = null) {
  try {
    // Check if gtag is available
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
      
      console.log(`Event tracked: ${category} / ${action} / ${label} / ${value}`);
    } else {
      console.warn('Google Analytics not available');
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Track a page view
 * @param {string} pagePath - The page path
 * @param {string} pageTitle - The page title
 */
export function trackPageView(pagePath, pageTitle) {
  try {
    // Check if gtag is available
    if (typeof gtag !== 'undefined') {
      gtag('config', window.GA_MEASUREMENT_ID, {
        page_path: pagePath,
        page_title: pageTitle
      });
      
      console.log(`Page view tracked: ${pagePath} / ${pageTitle}`);
    } else {
      console.warn('Google Analytics not available');
    }
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

/**
 * Track an agent interaction
 * @param {string} agentType - The agent type
 * @param {string} userInput - The user input
 */
export function trackAgentInteraction(agentType, userInput) {
  trackEvent(
    EventCategory.AGENT,
    EventAction.AGENT_INTERACTION,
    agentType,
    userInput.length
  );
}

/**
 * Track an agent response
 * @param {string} agentType - The agent type
 * @param {string} response - The agent response
 */
export function trackAgentResponse(agentType, response) {
  trackEvent(
    EventCategory.AGENT,
    EventAction.AGENT_RESPONSE,
    agentType,
    response.length
  );
}

/**
 * Track an agent error
 * @param {string} agentType - The agent type
 * @param {string} errorMessage - The error message
 */
export function trackAgentError(agentType, errorMessage) {
  trackEvent(
    EventCategory.AGENT,
    EventAction.AGENT_ERROR,
    agentType,
    null
  );
}

/**
 * Track a contact form submission
 * @param {string} formType - The form type
 * @param {Object} formData - The form data
 */
export function trackContactFormSubmit(formType, formData) {
  trackEvent(
    EventCategory.CONTACT,
    EventAction.CONTACT_FORM_SUBMIT,
    formType,
    null
  );
}

/**
 * Track a callback scheduled
 * @param {string} callbackTime - The callback time
 */
export function trackCallbackScheduled(callbackTime) {
  trackEvent(
    EventCategory.CONTACT,
    EventAction.CALLBACK_SCHEDULED,
    callbackTime,
    null
  );
}

/**
 * Track a lead captured
 * @param {string} source - The lead source
 * @param {string} leadId - The lead ID
 */
export function trackLeadCaptured(source, leadId) {
  trackEvent(
    EventCategory.CONVERSION,
    EventAction.LEAD_CAPTURED,
    source,
    null
  );
}

/**
 * Track a button click
 * @param {string} buttonId - The button ID
 * @param {string} buttonText - The button text
 */
export function trackButtonClick(buttonId, buttonText) {
  trackEvent(
    EventCategory.ENGAGEMENT,
    EventAction.BUTTON_CLICK,
    buttonId,
    null
  );
}

/**
 * Track a video play
 * @param {string} videoId - The video ID
 * @param {string} videoTitle - The video title
 */
export function trackVideoPlay(videoId, videoTitle) {
  trackEvent(
    EventCategory.ENGAGEMENT,
    EventAction.VIDEO_PLAY,
    videoId,
    null
  );
}

/**
 * Track a video complete
 * @param {string} videoId - The video ID
 * @param {string} videoTitle - The video title
 */
export function trackVideoComplete(videoId, videoTitle) {
  trackEvent(
    EventCategory.ENGAGEMENT,
    EventAction.VIDEO_COMPLETE,
    videoId,
    null
  );
}

/**
 * Track a document download
 * @param {string} documentId - The document ID
 * @param {string} documentTitle - The document title
 */
export function trackDocumentDownload(documentId, documentTitle) {
  trackEvent(
    EventCategory.ENGAGEMENT,
    EventAction.DOCUMENT_DOWNLOAD,
    documentId,
    null
  );
}

/**
 * Track a JavaScript error
 * @param {Error} error - The error object
 * @param {string} source - The error source
 */
export function trackJsError(error, source) {
  trackEvent(
    EventCategory.ERROR,
    EventAction.JS_ERROR,
    `${source}: ${error.message}`,
    null
  );
}

/**
 * Track an API error
 * @param {string} endpoint - The API endpoint
 * @param {string} errorMessage - The error message
 */
export function trackApiError(endpoint, errorMessage) {
  trackEvent(
    EventCategory.ERROR,
    EventAction.API_ERROR,
    `${endpoint}: ${errorMessage}`,
    null
  );
}

/**
 * Initialize error tracking
 */
export function initErrorTracking() {
  try {
    // Add global error handler
    window.addEventListener('error', (event) => {
      trackJsError(event.error, event.filename);
    });
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      trackJsError(
        new Error(event.reason || 'Unhandled Promise Rejection'),
        'Promise'
      );
    });
    
    console.log('Error tracking initialized');
  } catch (error) {
    console.error('Failed to initialize error tracking:', error);
  }
}

// Initialize error tracking when the module is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initErrorTracking();
  });
}
