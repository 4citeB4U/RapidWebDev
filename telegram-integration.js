/**
 * Telegram Integration Module
 * Provides functionality for interacting with Telegram
 */

/**
 * Send a message via Telegram
 * @param {string} chatId - The chat ID to send to
 * @param {string} text - The message text
 * @returns {Promise<Object>} - The server response
 */
async function sendViaTelegram(chatId, text) {
  try {
    const response = await fetch('/api/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message: text })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    
    // Track error if analytics is available
    if (typeof window.trackApiError === 'function') {
      window.trackApiError('/api/send-telegram', error.message);
    }
    
    throw error;
  }
}

/**
 * Generate a Telegram deep link
 * @param {string} botUsername - The bot username
 * @param {string} startParam - The start parameter (optional)
 * @returns {string} - The Telegram deep link
 */
function generateTelegramLink(botUsername = 'Lee2912bot', startParam = '') {
  const baseUrl = 'https://t.me/';
  
  if (startParam) {
    return `${baseUrl}${botUsername}?start=${encodeURIComponent(startParam)}`;
  }
  
  return `${baseUrl}${botUsername}`;
}

/**
 * Open Telegram chat
 * @param {string} botUsername - The bot username
 * @param {string} startParam - The start parameter (optional)
 */
function openTelegramChat(botUsername = 'Lee2912bot', startParam = '') {
  const telegramLink = generateTelegramLink(botUsername, startParam);
  window.open(telegramLink, '_blank');
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.sendViaTelegram = sendViaTelegram;
  window.generateTelegramLink = generateTelegramLink;
  window.openTelegramChat = openTelegramChat;
}
