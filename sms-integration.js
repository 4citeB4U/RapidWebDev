/**
 * SMS Integration Module
 * Provides functionality for sending SMS messages
 */

/**
 * Send an SMS message
 * @param {string} phone - The phone number to send to
 * @param {string} text - The message text
 * @returns {Promise<Object>} - The server response
 */
async function sendViaSms(phone, text) {
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message: text })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send SMS:', error);

    // Track error if analytics is available
    if (typeof window.trackApiError === 'function') {
      window.trackApiError('/api/send-sms', error.message);
    }

    throw error;
  }
}

/**
 * Send a welcome SMS
 * @param {Object} contact - The contact data
 * @returns {Promise<Object>} - The server response
 */
async function sendWelcomeSms(contact) {
  if (!contact.phone) {
    return Promise.reject(new Error('Phone number is required'));
  }

  const message = `Hi ${contact.name || 'there'}! Thanks for reaching out to Rapid Web Development. We've received your request and will be in touch soon.`;

  return sendViaSms(contact.phone, message);
}

/**
 * Send a callback confirmation SMS
 * @param {Object} contact - The contact data
 * @param {string} callbackTime - The callback time
 * @returns {Promise<Object>} - The server response
 */
async function sendCallbackSms(contact, callbackTime) {
  if (!contact.phone) {
    return Promise.reject(new Error('Phone number is required'));
  }

  const message = `Hi ${contact.name || 'there'}! Your callback with Rapid Web Development is scheduled for ${callbackTime}. We look forward to speaking with you!`;

  return sendViaSms(contact.phone, message);
}

/**
 * Send a reminder SMS
 * @param {Object} contact - The contact data
 * @param {string} reminderText - The reminder text
 * @returns {Promise<Object>} - The server response
 */
async function sendReminderSms(contact, reminderText) {
  if (!contact.phone) {
    return Promise.reject(new Error('Phone number is required'));
  }

  const message = `Hi ${contact.name || 'there'}! ${reminderText}`;

  return sendViaSms(contact.phone, message);
}

/**
 * Format a phone number for SMS sending
 * @param {string} phone - The phone number to format
 * @returns {string} - The formatted phone number
 */
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if the number already has a country code
  if (digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`;
  }

  // Add US country code if not present
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Return as is if we can't determine the format
  return phone;
}

/**
 * Validate a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
function isValidPhoneNumber(phone) {
  // Basic validation for US phone numbers
  const phoneRegex = /^\+?1?\s*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
  return phoneRegex.test(phone);
}
// Make functions available globally
if (typeof window !== 'undefined') {
  window.sendViaSms = sendViaSms;
  window.sendWelcomeSms = sendWelcomeSms;
  window.sendCallbackSms = sendCallbackSms;
  window.sendReminderSms = sendReminderSms;
  window.formatPhoneNumber = formatPhoneNumber;
  window.isValidPhoneNumber = isValidPhoneNumber;
}
