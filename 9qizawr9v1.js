/**
 * Agent Lee Enhanced - Improved Speech Recognition and Synthesis
 *
 * Features:
 * - Robust error handling with the Agent Lee Error Handling module
 * - Offline capabilities
 * - Enhanced listening with timeouts
 * - Network status monitoring
 */

// ———————— Initialization ————————
// Load error handling module
document.addEventListener('DOMContentLoaded', function() {
  if (!window.AgentLeeErrorHandling) {
    const errorScript = document.createElement('script');
    errorScript.src = 'agent-lee-error-handling.js';
    document.head.appendChild(errorScript);
  }
});

// Check browser support
if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
  showErrorModal("Speech recognition is not supported in your browser.");
  disableMicButton();
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;

let aiIsSpeaking = false;
let voices = [];
let isOnline = navigator.onLine;

// Load voices when available
speechSynthesis.onvoiceschanged = () => {
  try {
    voices = speechSynthesis.getVoices();
    console.log('Voices loaded:', voices.length);
  } catch (error) {
    if (window.AgentLeeErrorHandling) {
      window.AgentLeeErrorHandling.handleAgentLeeError(
        window.AgentLeeErrorHandling.ErrorTypes.INITIALIZATION,
        error,
        window.AgentLeeErrorHandling.ErrorSeverity.WARNING,
        "Voice loading issue detected. Using default voice."
      );
    } else {
      console.warn('Voice loading error:', error);
    }
  }
};

// Network status monitoring
window.addEventListener('online', () => {
  isOnline = true;
  agentSpeak("Connection restored. Back online.");
});
window.addEventListener('offline', () => {
  isOnline = false;
  agentSpeak("Connection lost. Switching to limited offline mode.");
});

// ———————— Error Handling ————————
function handleRecognitionError(error) {
  const micButton = document.getElementById('voice-input-button');
  if (micButton) {
    micButton.classList.remove('listening');
  }

  let message;
  if (window.AgentLeeErrorHandling) {
    message = window.AgentLeeErrorHandling.handleAgentLeeError(
      window.AgentLeeErrorHandling.ErrorTypes.SPEECH_RECOGNITION,
      error,
      window.AgentLeeErrorHandling.ErrorSeverity.WARNING,
      null,
      () => {
        // Fallback action: reset recognition state
        if (recognition.recognizing) {
          try {
            recognition.abort();
          } catch (e) {
            console.warn('Failed to abort recognition:', e);
          }
        }
      }
    );
  } else {
    console.error('Recognition Error:', error);
    message = "Speech recognition error: ";
    switch(error.error) {
      case 'no-speech':
        message += "No speech detected.";
        break;
      case 'audio-capture':
        message += "Microphone not available.";
        break;
      case 'not-allowed':
        message += "Microphone permission denied.";
        break;
      default:
        message += "Please try again.";
    }
  }

  showStatusMessage(message);
}

function handleSynthesisError(error) {
  aiIsSpeaking = false;

  let message;
  if (window.AgentLeeErrorHandling) {
    message = window.AgentLeeErrorHandling.handleAgentLeeError(
      window.AgentLeeErrorHandling.ErrorTypes.SPEECH_SYNTHESIS,
      error,
      window.AgentLeeErrorHandling.ErrorSeverity.WARNING,
      "Speech synthesis failed. Showing text response.",
      () => {
        // Fallback action: cancel any ongoing speech
        try {
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
        } catch (e) {
          console.warn('Failed to cancel speech synthesis:', e);
        }
      }
    );
  } else {
    console.error('Synthesis Error:', error);
    message = "Speech synthesis failed. Showing text response.";
  }

  showStatusMessage(message);
}

// ———————— Enhanced Listening ————————
const LISTEN_TIMEOUT = 5000;
let listenTimeout;

async function startListening() {
  if (aiIsSpeaking) {
    showStatusMessage("Please wait until I finish speaking.");
    return;
  }

  try {
    // Clear any previous timeout
    if (listenTimeout) {
      clearTimeout(listenTimeout);
    }

    // Start recognition
    recognition.start();

    // Update UI
    const micButton = document.getElementById('voice-input-button');
    if (micButton) {
      micButton.classList.add('listening');
    }

    // Clear any previous status messages
    showStatusMessage("");

    // Set timeout for listening
    listenTimeout = setTimeout(() => {
      try {
        recognition.stop();
        // No status message about the microphone
      } catch (e) {
        if (window.AgentLeeErrorHandling) {
          window.AgentLeeErrorHandling.handleAgentLeeError(
            window.AgentLeeErrorHandling.ErrorTypes.SPEECH_RECOGNITION,
            e,
            window.AgentLeeErrorHandling.ErrorSeverity.INFO,
            "Listening timed out."
          );
        } else {
          console.warn('Failed to stop recognition on timeout:', e);
        }
      }
    }, LISTEN_TIMEOUT);
  } catch (error) {
    if (window.AgentLeeErrorHandling) {
      const message = window.AgentLeeErrorHandling.handleAgentLeeError(
        window.AgentLeeErrorHandling.ErrorTypes.SPEECH_RECOGNITION,
        error,
        window.AgentLeeErrorHandling.ErrorSeverity.ERROR
      );
      showStatusMessage(message);
    } else {
      handleRecognitionError(error);
    }

    // Reset UI state
    const micButton = document.getElementById('voice-input-button');
    if (micButton) {
      micButton.classList.remove('listening');
    }
  }
}

recognition.onresult = (event) => {
  clearTimeout(listenTimeout);
  const transcript = event.results[0][0].transcript.trim();
  if (transcript) {
    addMessage('user', transcript);
    processUserInput(transcript);
  }
};

recognition.onend = () => {
  const micButton = document.getElementById('voice-input-button');
  if (micButton) {
    micButton.classList.remove('listening');
  }
  clearTimeout(listenTimeout);
};

recognition.onerror = (event) => {
  handleRecognitionError(event);
};

// ———————— Robust Speaking ————————
async function speak(text) {
  try {
    // Abort any ongoing recognition
    try {
      recognition.abort();
    } catch (e) {
      console.warn('Failed to abort recognition:', e);
    }

    // Cancel any ongoing speech
    try {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('Failed to cancel speech synthesis:', e);
    }

    aiIsSpeaking = true;
    const micButton = document.getElementById('voice-input-button');
    if (micButton) {
      micButton.classList.remove('listening');
    }

    const utter = new SpeechSynthesisUtterance(text);

    // Try to find a good voice
    if (voices.length > 0) {
      // First try to find a default voice
      utter.voice = voices.find(v => v.default);

      // If no default, try to find an English voice
      if (!utter.voice) {
        utter.voice = voices.find(v => v.lang && v.lang.startsWith('en'));
      }

      // If still no voice, use the first one
      if (!utter.voice) {
        utter.voice = voices[0];
      }
    }

    // Set up event handlers
    const speechPromise = new Promise((resolve, reject) => {
      utter.onend = () => {
        aiIsSpeaking = false;
        resolve();

        // Start listening automatically after a short delay
        // This creates a more natural conversation flow
        setTimeout(() => {
          // Only auto-start listening if we're not already listening
          if (!recognition.recognizing) {
            startListening();
          }
        }, 300);
      };

      utter.onerror = (event) => {
        aiIsSpeaking = false;
        reject(new Error(`Speech synthesis error: ${event.error || 'unknown error'}`));
      };
    });

    // Use safe speech synthesis if available
    if (window.AgentLeeErrorHandling) {
      await window.AgentLeeErrorHandling.safeSpeechSynthesis(utter);
    } else {
      speechSynthesis.speak(utter);
      await speechPromise;
    }

    addMessage('agent', text);
  } catch (error) {
    if (window.AgentLeeErrorHandling) {
      window.AgentLeeErrorHandling.handleAgentLeeError(
        window.AgentLeeErrorHandling.ErrorTypes.SPEECH_SYNTHESIS,
        error,
        window.AgentLeeErrorHandling.ErrorSeverity.WARNING
      );
    } else {
      handleSynthesisError(error);
    }

    aiIsSpeaking = false;
    addMessage('agent', text); // Fallback to text display
  }
}

// ———————— Offline Capabilities ————————
const cachedResponses = {
  "help": "In offline mode, I can provide basic assistance. Try asking about emergency procedures.",
  "emergency": "Call 112 on satellite phone. Move to safe zone."
};
<!-- Add this inside each agent card div, before the buttons -->
<div class="messages-container h-32 overflow-y-auto w-full bg-slate-800 rounded p-2 text-white text-sm"></div>
async function processUserInput(text, agentType = 'lee') {
  try {
    // Handle offline mode
    if (!isOnline) {
      const response = cachedResponses[text.toLowerCase()]
      || "I'm offline. Basic help available.";
      await agentSpeak(response, agentType);
      return;
    }

    // Check for navigation commands
    const lowerText = text.toLowerCase();

    // Handle navigation requests
    if (lowerText.includes('go to pricing') || lowerText.includes('show pricing') || lowerText.includes('click pricing')) {
      if (window.EnhancedAgentLee.navigate('pricing')) {
        await agentSpeak("I've navigated to the pricing page. Here you can see our different service packages.", agentType);
        return;
      }
    }
    
    // Check for agent-specific responses based on agentType
    if (agentType === 'sales') {
      // Sales agent specific responses
      if (lowerText.includes('discount') || lowerText.includes('pricing') || lowerText.includes('cost')) {
        await agentSpeak("I can help you with our pricing options. We have several plans starting at $29/month with a 20% discount for annual subscriptions.", agentType);
        return;
      }
    } else if (agentType === 'resource') {
      // Resource agent specific responses
      if (lowerText.includes('tutorial') || lowerText.includes('guide') || lowerText.includes('learn')) {
        await agentSpeak("I can help you find learning resources. We have comprehensive guides and tutorials in our documentation section.", agentType);
        return;
      }
    } else if (agentType === 'showcase') {
      // Showcase agent specific responses
      if (lowerText.includes('demo') || lowerText.includes('example') || lowerText.includes('showcase')) {
        await agentSpeak("Let me show you some examples of what our platform can do. We have several showcase projects in our gallery.", agentType);
        return;
      }
    }

    // Handle other page navigation
    for (const pageId in window.EnhancedAgentLee.siteStructure.pages) {
      const page = window.EnhancedAgentLee.siteStructure.pages[pageId];
      if (lowerText.includes(`go to ${pageId}`) || lowerText.includes(`show ${pageId}`) || lowerText.includes(`click ${pageId}`)) {
        if (window.EnhancedAgentLee.navigate(pageId)) {
          await agentSpeak(`I've navigated to the ${page.title} page.`);
          return;
        }
      }
    }

    // Remember user's name if they introduce themselves
    if (lowerText.includes('my name is') || lowerText.includes('i am') || lowerText.includes("i'm")) {
      let name = '';

      if (lowerText.includes('my name is')) {
        name = text.substring(text.toLowerCase().indexOf('my name is') + 11).trim();
      } else if (lowerText.includes('i am')) {
        name = text.substring(text.toLowerCase().indexOf('i am') + 4).trim();
      } else if (lowerText.includes("i'm")) {
        name = text.substring(text.toLowerCase().indexOf("i'm") + 4).trim();
      }

      // Extract just the first name
      if (name) {
        name = name.split(' ')[0];
        try {
          localStorage.setItem('user_name', name);
          await agentSpeak(`Nice to meet you, ${name}! How can I help you today?`);
          return;
        } catch (storageError) {
          // Handle localStorage errors
          if (window.AgentLeeErrorHandling) {
            window.AgentLeeErrorHandling.handleAgentLeeError(
              window.AgentLeeErrorHandling.ErrorTypes.UNKNOWN,
              storageError,
              window.AgentLeeErrorHandling.ErrorSeverity.WARNING,
              "I couldn't save your name, but I'll remember it for this session."
            );
          } else {
            console.warn('Failed to save user name:', storageError);
          }
          await agentSpeak(`Nice to meet you, ${name}! How can I help you today?`);
          return;
        }
      }
    }

    // Check for callback requests
    if (lowerText.includes('schedule callback') ||
        lowerText.includes('call me back') ||
        lowerText.includes('call back') ||
        lowerText.includes('schedule a call')) {
      await agentSpeak("I'd be happy to schedule a callback for you. Let me bring up the form.");
      showCallbackForm();
      return;
    }

    // Check for SMS-related requests
    if (lowerText.includes('send sms') ||
        lowerText.includes('text me') ||
        lowerText.includes('send me a text') ||
        lowerText.includes('send a message to my phone')) {
      // Extract phone number if present
      let phone = null;
      const phonePattern = /\b(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;
      const phoneMatch = text.match(phonePattern);

      // Extract message content if present
      let message = null;
      const messagePatterns = [
        /saying\s+["'](.+?)["']/i,
        /message\s+["'](.+?)["']/i,
        /text\s+["'](.+?)["']/i,
        /content\s+["'](.+?)["']/i
      ];

      for (const pattern of messagePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          message = match[1];
          break;
        }
      }

      // If we have both phone and message, send directly
      if (phone && message) {
        await agentSpeak(`I'll send an SMS to ${phone} with your message.`);
        const success = await sendDirectSms(phone, message);

        if (success) {
          await agentSpeak('SMS sent successfully!');
        } else {
          await agentSpeak('I had trouble sending the SMS. Would you like to try using the form instead?');
          showCallbackForm();
        }
        return;
      }

      // If we only have the phone, show the form
      if (phoneMatch) {
        phone = phoneMatch[0];
        await agentSpeak(`I'll send an SMS to ${phone}. Let me bring up the form.`);
      } else {
        await agentSpeak("I'd be happy to send you an SMS. Please provide your phone number in the form.");
      }

      showCallbackForm();
      return;
    }

    // Check for Telegram-related requests
    if (lowerText.includes('telegram') ||
        lowerText.includes('chat bot') ||
        lowerText.includes('chatbot') ||
        lowerText.includes('message me on telegram')) {

      // Extract chat ID if present
      let chatId = null;
      const chatIdPattern = /chat[\s_-]?id[:\s]+([\d-]+)/i;
      const chatIdMatch = text.match(chatIdPattern);

      if (chatIdMatch && chatIdMatch[1]) {
        chatId = chatIdMatch[1];
      }

      // Extract message content if present
      let message = null;
      const messagePatterns = [
        /saying\s+["'](.+?)["']/i,
        /message\s+["'](.+?)["']/i,
        /text\s+["'](.+?)["']/i,
        /content\s+["'](.+?)["']/i
      ];

      for (const pattern of messagePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          message = match[1];
          break;
        }
      }

      // If we have both chat ID and message, send directly
      if (chatId && message && typeof window.sendViaTelegram === 'function') {
        await agentSpeak(`I'll send a Telegram message to chat ID ${chatId} with your message.`);

        try {
          await window.sendViaTelegram(chatId, message);
          await agentSpeak('Telegram message sent successfully!');
        } catch (error) {
          await agentSpeak(`I had trouble sending the Telegram message: ${error.message}`);
        }
        return;
      }

      // If the user just wants to chat on Telegram
      if (lowerText.includes('chat with you on telegram') ||
          lowerText.includes('talk to you on telegram') ||
          lowerText.includes('message you on telegram')) {

        const telegramLink = typeof window.generateTelegramLink === 'function'
          ? window.generateTelegramLink('Lee2912bot')
          : 'https://t.me/Lee2912bot';

        await agentSpeak(`You can chat with me on Telegram by clicking this link: ${telegramLink}`);

        // Open Telegram chat if requested
        if (lowerText.includes('open telegram') || lowerText.includes('launch telegram')) {
          if (typeof window.openTelegramChat === 'function') {
            window.openTelegramChat('Lee2912bot');
          } else {
            window.open(telegramLink, '_blank');
          }
        }

        return;
      }

      // Default response for Telegram requests
      await agentSpeak("I'm available on Telegram! You can chat with me by searching for @Lee2912bot or clicking the Telegram button.");
      return;
    }

    // Check for trained responses
    if (window.checkTrainedResponses) {
      const trainedResponse = window.checkTrainedResponses(text);
      if (trainedResponse) {
        await agentSpeak(trainedResponse);
        return;
      }
    }

    // Existing online processing logic
    if (window.handleCommand) {
      await window.handleCommand(text);
    } else {
      await agentSpeak("I'm not sure how to help with that. Could you try asking about our services, pricing, or website features?");
    }

  } catch (error) {
    if (window.AgentLeeErrorHandling) {
      const message = window.AgentLeeErrorHandling.handleAgentLeeError(
        window.AgentLeeErrorHandling.ErrorTypes.UNKNOWN,
        error,
        window.AgentLeeErrorHandling.ErrorSeverity.ERROR,
        "I encountered an error processing your request. Please try again."
      );
      await agentSpeak(message);
    } else {
      console.error('Processing Error:', error);
      await agentSpeak("I encountered an error processing your request. Please try again.");
    }
  }
}

// ———————— UI Integration ————————
async function agentSpeak(text, agentType = 'lee') {
  try {
    // Cancel any ongoing speech
    try {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    } catch (e) {
      if (window.AgentLeeErrorHandling) {
        window.AgentLeeErrorHandling.handleAgentLeeError(
          window.AgentLeeErrorHandling.ErrorTypes.SPEECH_SYNTHESIS,
          e,
          window.AgentLeeErrorHandling.ErrorSeverity.INFO
        );
      } else {
        console.warn('Failed to cancel speech synthesis:', e);
      }
    }

    // Speak the text
    await speak(text);

    // No need to add message here as speak() already does it
  } catch (error) {
    if (window.AgentLeeErrorHandling) {
      window.AgentLeeErrorHandling.handleAgentLeeError(
        window.AgentLeeErrorHandling.ErrorTypes.SPEECH_SYNTHESIS,
        error,
        window.AgentLeeErrorHandling.ErrorSeverity.ERROR
      );
    } else {
      console.error('Agent speak error:', error);
    }

    // Ensure the message is displayed even if speech fails
    addMessage('agent', text);
  }
}

/**
 * Show the callback form
 */
function showCallbackForm() {
  try {
    // Get the callback form container
    const container = document.getElementById('callback-form-container');

    if (!container) {
      console.error('Callback form container not found');
      return;
    }

    // Show the container
    container.classList.remove('hidden');

    // Initialize the form if not already initialized
    if (typeof window.initCallbackForm === 'function') {
      window.initCallbackForm('callback-form-container');
    } else {
      console.error('Callback form initialization function not found');
    }

    // Add event listener to close the form when clicking outside
    const closeOnOutsideClick = (event) => {
      if (event.target === container) {
        hideCallbackForm();
        document.removeEventListener('click', closeOnOutsideClick);
      }
    };

    // Add the event listener after a short delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick);
    }, 100);

    // Track the event
    if (typeof window.trackButtonClick === 'function') {
      window.trackButtonClick('callback-form', 'Show Callback Form');
    }
  } catch (error) {
    console.error('Failed to show callback form:', error);
  }
}

/**
 * Hide the callback form
 */
function hideCallbackForm() {
  try {
    // Get the callback form container
    const container = document.getElementById('callback-form-container');

    if (!container) {
      return;
    }

    // Hide the container
    container.classList.add('hidden');
  } catch (error) {
    console.error('Failed to hide callback form:', error);
  }
}

/**
 * Send an SMS message directly
 * @param {string} phone - The phone number to send to
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} - Whether the SMS was sent successfully
 */
async function sendDirectSms(phone, message) {
  try {
    // Validate phone number
    if (typeof window.isValidPhoneNumber === 'function' && !window.isValidPhoneNumber(phone)) {
      showStatusMessage('Invalid phone number format');
      return false;
    }

    // Format phone number
    const formattedPhone = typeof window.formatPhoneNumber === 'function'
      ? window.formatPhoneNumber(phone)
      : phone;

    // Show status message
    showStatusMessage('Sending SMS...');

    // Send SMS
    if (typeof window.sendViaSms === 'function') {
      await window.sendViaSms(formattedPhone, message);

      // Show success message
      showStatusMessage('SMS sent successfully');

      // Track the event if analytics is available
      if (typeof window.trackButtonClick === 'function') {
        window.trackButtonClick('direct-sms', 'Send Direct SMS');
      }

      return true;
    } else {
      throw new Error('SMS sending function not available');
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);

    // Show error message
    showStatusMessage('Failed to send SMS. Please try again.');

    // Track error if analytics is available
    if (typeof window.trackApiError === 'function') {
      window.trackApiError('/api/send-sms', error.message);
    }

    return false;
  }
}

// Helper functions for UI integration
function showStatusMessage(message) {
  if (window.addMessage) {
    window.addMessage(message, 'agent', false); // Don't speak status messages
  } else {
    console.log("Status:", message);
  }
}

function showErrorModal(message) {
  if (window.addMessage) {
    window.addMessage(message, 'agent');
  } else {
    alert(message);
  }
}

function disableMicButton() {
  const micButton = document.getElementById('voice-input-button');
  if (micButton) {
    micButton.disabled = true;
    micButton.classList.add('opacity-50');
    micButton.title = "Speech recognition not supported";
  }
}

function addMessage(sender, text) {
  if (window.addMessage) {
    window.addMessage(text, sender);
  } else {
    console.log(`${sender}: ${text}`);
  }
}

// Initialize without initial greeting
// We'll let the user initiate the conversation instead of automatically greeting

// Site structure information for navigation and UI understanding
const siteStructure = {
  pages: {
    home: { id: 'home', title: 'Home', path: '#home' },
    about: { id: 'about', title: 'About Us', path: '#about' },
    pricing: { id: 'pricing', title: 'Pricing', path: '#pricing' },
    learning: { id: 'learning', title: 'Learning Center', path: '#learning' },
    showcase: { id: 'showcase', title: 'Showcase', path: '#showcase' },
    contact: { id: 'contact', title: 'Contact', path: '#contact' }
  },
  navigation: {
    goToPage: (pageId) => {
      const page = siteStructure.pages[pageId];
      if (page) {
        window.location.hash = page.path;
        return true;
      }
      return false;
    },
    getCurrentPage: () => {
      const hash = window.location.hash.replace('#', '');
      return hash || 'home';
    }
  },
  ui: {
    buttons: {
      pricing: { selector: 'a[href="#pricing"]', text: 'Pricing' },
      contact: { selector: 'a[href="#contact"]', text: 'Contact' },
      learning: { selector: 'a[href="#learning"]', text: 'Learning' },
      showcase: { selector: 'a[href="#showcase"]', text: 'Showcase' }
    }
  }
};

// Update agentSpeak to support multiple agents
async function agentSpeak(text, agentType = 'lee') {
  try {
    // Cancel any ongoing speech
    try {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    } catch (e) {
      if (window.AgentLeeErrorHandling) {
        window.AgentLeeErrorHandling.handleAgentLeeError(
          window.AgentLeeErrorHandling.ErrorTypes.SPEECH_SYNTHESIS,
          e,
          window.AgentLeeErrorHandling.ErrorSeverity.INFO
        );
      } else {
        console.warn('Failed to cancel speech synthesis:', e);
      }
    }

    // Speak the text
    await speak(text);

    // No need to add message here as speak() already does it
  } catch (error) {
    if (window.AgentLeeErrorHandling) {
      window.AgentLeeErrorHandling.handleAgentLeeError(
        window.AgentLeeErrorHandling.ErrorTypes.SPEECH_SYNTHESIS,
        error,
        window.AgentLeeErrorHandling.ErrorSeverity.ERROR
      );
    } else {
      console.error('Agent speak error:', error);
    }

    // Ensure the message is displayed even if speech fails
    addMessage('agent', text);
  }
}

/**
 * Show the callback form
 */
function showCallbackForm() {
  try {
    // Get the callback form container
    const container = document.getElementById('callback-form-container');

    if (!container) {
      console.error('Callback form container not found');
      return;
    }

    // Show the container
    container.classList.remove('hidden');

    // Initialize the form if not already initialized
    if (typeof window.initCallbackForm === 'function') {
      window.initCallbackForm('callback-form-container');
    } else {
      console.error('Callback form initialization function not found');
    }

    // Add event listener to close the form when clicking outside
    const closeOnOutsideClick = (event) => {
      if (event.target === container) {
        hideCallbackForm();
        document.removeEventListener('click', closeOnOutsideClick);
      }
    };

    // Add the event listener after a short delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick);
    }, 100);

    // Track the event
    if (typeof window.trackButtonClick === 'function') {
      window.trackButtonClick('callback-form', 'Show Callback Form');
    }
  } catch (error) {
    console.error('Failed to show callback form:', error);
  }
}

/**
 * Hide the callback form
 */
function hideCallbackForm() {
  try {
    // Get the callback form container
    const container = document.getElementById('callback-form-container');

    if (!container) {
      return;
    }

    // Hide the container
    container.classList.add('hidden');
  } catch (error) {
    console.error('Failed to hide callback form:', error);
  }
}

/**
 * Send an SMS message directly
 * @param {string} phone - The phone number to send to
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} - Whether the SMS was sent successfully
 */
async function sendDirectSms(phone, message) {
  try {
    // Validate phone number
    if (typeof window.isValidPhoneNumber === 'function' && !window.isValidPhoneNumber(phone)) {
      showStatusMessage('Invalid phone number format');
      return false;
    }

    // Format phone number
    const formattedPhone = typeof window.formatPhoneNumber === 'function'
      ? window.formatPhoneNumber(phone)
      : phone;

    // Show status message
    showStatusMessage('Sending SMS...');

    // Send SMS
    if (typeof window.sendViaSms === 'function') {
      await window.sendViaSms(formattedPhone, message);

      // Show success message
      showStatusMessage('SMS sent successfully');

      // Track the event if analytics is available
      if (typeof window.trackButtonClick === 'function') {
        window.trackButtonClick('direct-sms', 'Send Direct SMS');
      }

      return true;
    } else {
      throw new Error('SMS sending function not available');
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);

    // Show error message
    showStatusMessage('Failed to send SMS. Please try again.');

    // Track error if analytics is available
    if (typeof window.trackApiError === 'function') {
      window.trackApiError('/api/send-sms', error.message);
    }

    return false;
  }
}

// Helper functions for UI integration
function showStatusMessage(message) {
  if (window.addMessage) {
    window.addMessage(message, 'agent', false); // Don't speak status messages
  } else {
    console.log("Status:", message);
  }
}

function showErrorModal(message) {
  if (window.addMessage) {
    window.addMessage(message, 'agent');
  } else {
    alert(message);
  }
}

function disableMicButton() {
  const micButton = document.getElementById('voice-input-button');
  if (micButton) {
    micButton.disabled = true;
    micButton.classList.add('opacity-50');
    micButton.title = "Speech recognition not supported";
  }
}

function addMessage(sender, text) {
  if (window.addMessage) {
    window.addMessage(text, sender);
  } else {
    console.log(`${sender}: ${text}`);
  }
}

// Initialize without initial greeting
// We'll let the user initiate the conversation instead of automatically greeting

// Site structure information for navigation and UI understanding
const siteStructure = {
  pages: {
    home: { id: 'home', title: 'Home', path: '#home' },
    about: { id: 'about', title: 'About Us', path: '#about' },
    pricing: { id: 'pricing', title: 'Pricing', path: '#pricing' },
    learning: { id: 'learning', title: 'Learning Center', path: '#learning' },
    showcase: { id: 'showcase', title: 'Showcase', path: '#showcase' },
    contact: { id: 'contact', title: 'Contact', path: '#contact' }
  },
  navigation: {
    goToPage: (pageId) => {
      const page = siteStructure.pages[pageId];
      if (page) {
        window.location.hash = page.path;
        return true;
      }
      return false;
    },
    getCurrentPage: () => {
      const hash = window.location.hash.replace('#', '');
      return hash || 'home';
    }
  },
  ui: {
    buttons: {
      pricing: { selector: 'a[href="#pricing"]', text: 'Pricing' },
      contact: { selector: 'a[href="#contact"]', text: 'Contact' },
      learning: { selector: 'a[href="#learning"]', text: 'Learning' },
      showcase: { selector: 'a[href="#showcase"]', text: 'Showcase' }
    }
  }
};

// Export the enhanced speech recognition system
window.EnhancedAgentLee = {
  recognition,
  startListening,
  speak,
  agentSpeak,
  isOnline: () => isOnline,
  siteStructure: siteStructure,
  navigate: (pageId) => siteStructure.navigation.goToPage(pageId)
};