/**
 * Callback Form Component
 * Provides a form for scheduling callbacks
 */

import { captureAndSync } from './contact-sync.js';
import { sendCallbackEmail } from './emailjs-templates.js';
import { sendCallbackSms, isValidPhoneNumber, formatPhoneNumber } from './sms-integration.js';

// Create a class for the callback form
class CallbackForm {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.form = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the callback form
   * @returns {Promise<void>} - Resolves when initialization is complete
   */
  async initialize() {
    try {
      // Get container
      this.container = document.getElementById(this.containerId);

      if (!this.container) {
        console.error(`Container not found: ${this.containerId}`);
        return;
      }

      // Create form
      this.form = document.createElement('form');
      this.form.className = 'callback-form bg-indigo-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-indigo-700/50';

      // Add form content
      this.form.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Schedule a Callback</h2>
        <p class="text-blue-200 mb-6">Fill out the form below and we'll call you back at your preferred time.</p>

        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium mb-1">Name</label>
            <input type="text" id="name" name="name" required
              class="w-full px-4 py-2 bg-indigo-800/50 border border-indigo-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name">
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium mb-1">Phone Number</label>
            <input type="tel" id="phone" name="phone" required
              class="w-full px-4 py-2 bg-indigo-800/50 border border-indigo-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your phone number">
          </div>

          <div>
            <label for="email" class="block text-sm font-medium mb-1">Email (optional)</label>
            <input type="email" id="email" name="email"
              class="w-full px-4 py-2 bg-indigo-800/50 border border-indigo-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your email address">
          </div>

          <div>
            <label for="callback-time" class="block text-sm font-medium mb-1">Preferred Callback Time</label>
            <input type="datetime-local" id="callback-time" name="callbackTime" required
              class="w-full px-4 py-2 bg-indigo-800/50 border border-indigo-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
            <label for="message" class="block text-sm font-medium mb-1">Message (optional)</label>
            <textarea id="message" name="message" rows="3"
              class="w-full px-4 py-2 bg-indigo-800/50 border border-indigo-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What would you like to discuss?"></textarea>
          </div>

          <div class="flex items-center">
            <input type="checkbox" id="send-sms" name="sendSms"
              class="w-4 h-4 text-blue-600 bg-indigo-800/50 border-indigo-600 rounded focus:ring-blue-500">
            <label for="send-sms" class="ml-2 text-sm font-medium">
              Send me a confirmation SMS
            </label>
          </div>

          <div class="pt-2">
            <button type="submit"
              class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors btn-glow">
              Schedule Callback
            </button>
          </div>
        </div>

        <div id="callback-form-message" class="mt-4 text-center hidden"></div>
      `;

      // Add form to container
      this.container.appendChild(this.form);

      // Add event listener for form submission
      this.form.addEventListener('submit', this.handleSubmit.bind(this));

      // Set minimum date for callback time
      const callbackTimeInput = this.form.querySelector('#callback-time');
      if (callbackTimeInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        callbackTimeInput.min = `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      this.isInitialized = true;
      console.log('Callback form initialized');
    } catch (error) {
      console.error('Failed to initialize callback form:', error);
    }
  }

  /**
   * Handle form submission
   * @param {Event} event - The submit event
   */
  async handleSubmit(event) {
    event.preventDefault();

    try {
      // Get form data
      const formData = new FormData(this.form);
      const name = formData.get('name');
      const phone = formData.get('phone');
      const email = formData.get('email');
      const callbackTime = formData.get('callbackTime');
      const message = formData.get('message');
      const sendSms = formData.get('sendSms') === 'on';

      // Validate form data
      if (!name || !phone || !callbackTime) {
        this.showMessage('Please fill out all required fields.', 'error');
        return;
      }

      // Validate phone number
      if (!isValidPhoneNumber(phone)) {
        this.showMessage('Please enter a valid phone number.', 'error');
        return;
      }

      // Format callback time
      const callbackDate = new Date(callbackTime);
      const formattedCallbackTime = callbackDate.toLocaleString();

      // Format phone number
      const formattedPhone = formatPhoneNumber(phone);

      // Create contact object
      const contact = {
        name,
        phone: formattedPhone,
        email: email || null,
        callbackTime: formattedCallbackTime,
        message: message || null,
        type: 'callback',
        status: 'pending',
        sendSms
      };

      // Show loading message
      this.showMessage('Scheduling your callback...', 'info');

      // Save contact
      await captureAndSync(contact);

      // Send confirmation email if email is provided
      if (email) {
        try {
          await sendCallbackEmail(contact, formattedCallbackTime);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }

      // Send confirmation SMS if requested
      if (sendSms) {
        try {
          await sendCallbackSms(contact, formattedCallbackTime);
        } catch (smsError) {
          console.error('Failed to send confirmation SMS:', smsError);
        }
      }

      // Track the event if analytics is available
      if (typeof window.trackCallbackScheduled === 'function') {
        window.trackCallbackScheduled(formattedCallbackTime);
      }

      // Show success message
      this.showMessage(`Thank you! We'll call you back at ${formattedCallbackTime}.`, 'success');

      // Reset form
      this.form.reset();
    } catch (error) {
      console.error('Failed to schedule callback:', error);
      this.showMessage('Failed to schedule callback. Please try again.', 'error');
    }
  }

  /**
   * Show a message in the form
   * @param {string} message - The message to show
   * @param {string} type - The message type (info, success, error)
   */
  showMessage(message, type = 'info') {
    const messageElement = this.form.querySelector('#callback-form-message');

    if (!messageElement) return;

    // Set message text
    messageElement.textContent = message;

    // Set message style
    messageElement.className = 'mt-4 text-center py-2 px-4 rounded-lg';

    switch (type) {
      case 'success':
        messageElement.classList.add('bg-green-600/50', 'text-white');
        break;
      case 'error':
        messageElement.classList.add('bg-red-600/50', 'text-white');
        break;
      case 'info':
      default:
        messageElement.classList.add('bg-blue-600/50', 'text-white');
        break;
    }

    // Show message
    messageElement.classList.remove('hidden');

    // Hide message after 5 seconds for success and info messages
    if (type !== 'error') {
      setTimeout(() => {
        messageElement.classList.add('hidden');
      }, 5000);
    }
  }
}

// Create and export a function to initialize the callback form
export function initCallbackForm(containerId) {
  const form = new CallbackForm(containerId);
  form.initialize().catch(console.error);
  return form;
}

// Initialize the callback form when the module is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Check if the container exists
    const container = document.getElementById('callback-form-container');

    if (container) {
      initCallbackForm('callback-form-container');
    }
  });
}
