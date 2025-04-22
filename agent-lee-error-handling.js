/**
 * Agent Lee Error Handling Module
 * Provides robust error handling for Agent Lee's speech recognition and synthesis
 */

// Error types
const ErrorTypes = {
  SPEECH_RECOGNITION: 'speech_recognition',
  SPEECH_SYNTHESIS: 'speech_synthesis',
  AUDIO_PLAYBACK: 'audio_playback',
  INITIALIZATION: 'initialization',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
};

// Error severity levels
const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Handles errors in Agent Lee's operations
 * @param {string} type - The type of error from ErrorTypes
 * @param {Error} error - The original error object
 * @param {string} severity - The severity level from ErrorSeverity
 * @param {string} customMessage - Optional custom message to display to the user
 * @param {Function} fallbackAction - Optional fallback action to take
 */
function handleAgentLeeError(type, error, severity = ErrorSeverity.ERROR, customMessage = null, fallbackAction = null) {
  // Log the error with appropriate level
  const errorPrefix = `[Agent Lee ${severity.toUpperCase()}] [${type}]: `;
  
  switch (severity) {
    case ErrorSeverity.INFO:
      console.info(errorPrefix, error);
      break;
    case ErrorSeverity.WARNING:
      console.warn(errorPrefix, error);
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      console.error(errorPrefix, error);
      break;
    default:
      console.error(errorPrefix, error);
  }

  // Determine user-friendly message
  let userMessage = customMessage;
  if (!userMessage) {
    switch (type) {
      case ErrorTypes.SPEECH_RECOGNITION:
        userMessage = "I'm having trouble understanding you. Please try again.";
        break;
      case ErrorTypes.SPEECH_SYNTHESIS:
        userMessage = "I'm having trouble speaking right now.";
        break;
      case ErrorTypes.AUDIO_PLAYBACK:
        userMessage = "I'm having trouble playing audio.";
        break;
      case ErrorTypes.INITIALIZATION:
        userMessage = "I'm having trouble starting up.";
        break;
      case ErrorTypes.NETWORK:
        userMessage = "I'm having trouble connecting to the network.";
        break;
      default:
        userMessage = "Something went wrong. Please try again.";
    }
  }

  // Add error to log for debugging
  if (window.agentLeeErrorLog) {
    window.agentLeeErrorLog.push({
      timestamp: new Date().toISOString(),
      type,
      severity,
      message: error.message || 'No message',
      stack: error.stack,
      userMessage
    });
  } else {
    window.agentLeeErrorLog = [{
      timestamp: new Date().toISOString(),
      type,
      severity,
      message: error.message || 'No message',
      stack: error.stack,
      userMessage
    }];
  }

  // Execute fallback action if provided
  if (typeof fallbackAction === 'function') {
    try {
      fallbackAction();
    } catch (fallbackError) {
      console.error('[Agent Lee ERROR] Fallback action failed:', fallbackError);
    }
  }

  // Return the user message for display
  return userMessage;
}

/**
 * Wraps an async function with error handling
 * @param {Function} fn - The async function to wrap
 * @param {string} errorType - The type of error from ErrorTypes
 * @param {string} severity - The severity level from ErrorSeverity
 * @param {string} customMessage - Optional custom message to display to the user
 * @param {Function} fallbackAction - Optional fallback action to take
 * @returns {Function} - The wrapped function
 */
function withErrorHandling(fn, errorType, severity, customMessage, fallbackAction) {
  return async function(...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      const message = handleAgentLeeError(errorType, error, severity, customMessage, fallbackAction);
      return { error: true, message };
    }
  };
}

/**
 * Safe speech synthesis that handles errors
 * @param {SpeechSynthesisUtterance} utterance - The utterance to speak
 * @returns {Promise} - Resolves when speech is complete or rejects on error
 */
function safeSpeechSynthesis(utterance) {
  return new Promise((resolve, reject) => {
    try {
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported');
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Safe audio playback that handles errors
 * @param {HTMLAudioElement} audio - The audio element to play
 * @returns {Promise} - Resolves when audio is complete or rejects on error
 */
function safeAudioPlayback(audio) {
  return new Promise((resolve, reject) => {
    try {
      if (!audio) {
        throw new Error('Audio element is null or undefined');
      }

      const onEnd = () => {
        audio.removeEventListener('ended', onEnd);
        audio.removeEventListener('error', onError);
        resolve();
      };

      const onError = (event) => {
        audio.removeEventListener('ended', onEnd);
        audio.removeEventListener('error', onError);
        reject(new Error(`Audio playback error: ${event.error || 'unknown error'}`));
      };

      audio.addEventListener('ended', onEnd);
      audio.addEventListener('error', onError);
      
      // Handle promise rejection for browsers that support it
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          audio.removeEventListener('ended', onEnd);
          audio.removeEventListener('error', onError);
          reject(error);
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Export the module
window.AgentLeeErrorHandling = {
  ErrorTypes,
  ErrorSeverity,
  handleAgentLeeError,
  withErrorHandling,
  safeSpeechSynthesis,
  safeAudioPlayback
};
