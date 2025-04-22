/**
 * Sentry Client Integration
 * Provides error monitoring for the client
 */

// Initialize Sentry
function initSentry() {
  try {
    if (typeof Sentry === 'undefined') {
      console.warn('Sentry not loaded. Error monitoring disabled.');
      return false;
    }
    
    Sentry.init({
      dsn: 'https://your-sentry-dsn.ingest.sentry.io/project-id',
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay()
      ],
      // Performance monitoring
      tracesSampleRate: 0.1,
      // Session replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    });
    
    console.log('Sentry initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
    return false;
  }
}

/**
 * Capture an exception in Sentry
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context for the error
 */
function captureException(error, context = {}) {
  try {
    if (typeof Sentry === 'undefined') {
      console.error('Sentry not loaded. Error not captured:', error);
      return;
    }
    
    Sentry.withScope(scope => {
      // Add additional context
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      
      // Capture the exception
      Sentry.captureException(error);
    });
  } catch (e) {
    console.error('Failed to capture exception in Sentry:', e);
  }
}

/**
 * Capture a message in Sentry
 * @param {string} message - The message to capture
 * @param {Object} context - Additional context for the message
 * @param {string} level - The severity level (fatal, error, warning, info, debug)
 */
function captureMessage(message, context = {}, level = 'info') {
  try {
    if (typeof Sentry === 'undefined') {
      console.log(`Sentry not loaded. Message not captured (${level}):`, message);
      return;
    }
    
    Sentry.withScope(scope => {
      // Add additional context
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      
      // Set the level
      scope.setLevel(level);
      
      // Capture the message
      Sentry.captureMessage(message);
    });
  } catch (e) {
    console.error('Failed to capture message in Sentry:', e);
  }
}

/**
 * Set user information in Sentry
 * @param {Object} user - The user information
 */
function setUser(user) {
  try {
    if (typeof Sentry === 'undefined') {
      console.log('Sentry not loaded. User not set:', user);
      return;
    }
    
    Sentry.setUser(user);
  } catch (e) {
    console.error('Failed to set user in Sentry:', e);
  }
}

// Initialize Sentry when the module is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initSentry();
    
    // Add global error handler
    window.addEventListener('error', (event) => {
      captureException(event.error || new Error(event.message), {
        source: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      captureException(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { source: 'unhandledrejection' }
      );
    });
  });
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.sentryCapture = {
    exception: captureException,
    message: captureMessage,
    setUser: setUser
  };
}
