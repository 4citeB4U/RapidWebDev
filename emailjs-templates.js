/**
 * EmailJS Templates Module
 * Provides functions to send emails using EmailJS templates
 */

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_id', // Replace with your EmailJS service ID
  userId: 'user_public_key', // Replace with your EmailJS user ID
  templates: {
    welcome: 'template_welcome',
    reminder: 'template_reminder',
    callback: 'template_callback',
    support: 'template_support',
    newsletter: 'template_newsletter'
  }
};

/**
 * Initialize EmailJS
 */
export function initEmailJS() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.userId);
    console.log('EmailJS initialized');
  } else {
    console.error('EmailJS not found. Make sure to include the EmailJS library.');
  }
}

/**
 * Send a welcome email to a new contact
 * @param {Object} contact - The contact data
 * @returns {Promise} - Resolves when the email is sent
 */
export function sendWelcomeEmail(contact) {
  if (typeof emailjs === 'undefined') {
    return Promise.reject(new Error('EmailJS not found'));
  }
  
  const templateParams = {
    user_name: contact.name,
    user_email: contact.email,
    user_phone: contact.phone || 'Not provided',
    services: Array.isArray(contact.interests) ? contact.interests.join(', ') : contact.interests || 'Not specified',
    timestamp: new Date().toLocaleString()
  };
  
  return emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templates.welcome,
    templateParams,
    EMAILJS_CONFIG.userId
  );
}

/**
 * Send a reminder email to a contact
 * @param {Object} contact - The contact data
 * @param {string} reminderDate - The reminder date
 * @param {string} reminderMessage - The reminder message
 * @returns {Promise} - Resolves when the email is sent
 */
export function sendReminderEmail(contact, reminderDate, reminderMessage = '') {
  if (typeof emailjs === 'undefined') {
    return Promise.reject(new Error('EmailJS not found'));
  }
  
  const templateParams = {
    user_name: contact.name,
    user_email: contact.email,
    reminder_date: reminderDate,
    reminder_message: reminderMessage || 'This is a friendly reminder about your recent inquiry.',
    timestamp: new Date().toLocaleString()
  };
  
  return emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templates.reminder,
    templateParams,
    EMAILJS_CONFIG.userId
  );
}

/**
 * Send a callback confirmation email
 * @param {Object} contact - The contact data
 * @param {string} callbackTime - The callback time
 * @returns {Promise} - Resolves when the email is sent
 */
export function sendCallbackEmail(contact, callbackTime) {
  if (typeof emailjs === 'undefined') {
    return Promise.reject(new Error('EmailJS not found'));
  }
  
  const templateParams = {
    user_name: contact.name,
    user_email: contact.email,
    user_phone: contact.phone || 'Not provided',
    callback_time: callbackTime,
    timestamp: new Date().toLocaleString()
  };
  
  return emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templates.callback,
    templateParams,
    EMAILJS_CONFIG.userId
  );
}

/**
 * Send a support email
 * @param {Object} contact - The contact data
 * @param {string} subject - The support subject
 * @param {string} message - The support message
 * @returns {Promise} - Resolves when the email is sent
 */
export function sendSupportEmail(contact, subject, message) {
  if (typeof emailjs === 'undefined') {
    return Promise.reject(new Error('EmailJS not found'));
  }
  
  const templateParams = {
    user_name: contact.name,
    user_email: contact.email,
    user_phone: contact.phone || 'Not provided',
    subject: subject,
    message: message,
    timestamp: new Date().toLocaleString()
  };
  
  return emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templates.support,
    templateParams,
    EMAILJS_CONFIG.userId
  );
}

/**
 * Send a newsletter email
 * @param {Array} contacts - The contacts to send the newsletter to
 * @param {string} subject - The newsletter subject
 * @param {string} content - The newsletter content
 * @returns {Promise<Array>} - Resolves with an array of results
 */
export async function sendNewsletterEmail(contacts, subject, content) {
  if (typeof emailjs === 'undefined') {
    return Promise.reject(new Error('EmailJS not found'));
  }
  
  const results = [];
  
  for (const contact of contacts) {
    const templateParams = {
      user_name: contact.name,
      user_email: contact.email,
      subject: subject,
      content: content,
      timestamp: new Date().toLocaleString()
    };
    
    try {
      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.newsletter,
        templateParams,
        EMAILJS_CONFIG.userId
      );
      
      results.push({
        success: true,
        contact: contact,
        result: result
      });
    } catch (error) {
      results.push({
        success: false,
        contact: contact,
        error: error
      });
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return results;
}

// Initialize EmailJS when the module is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initEmailJS();
  });
}
