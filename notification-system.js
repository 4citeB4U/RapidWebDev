/**
 * Notification System Module
 * Provides functionality for push notifications and in-app notifications
 */

// Configuration
const VAPID_PUBLIC_KEY = 'BLBz4TKmvJdFfTlHD9QLOqQMFgqWEZ_PuRgjZ_yCbuCcV9h-q8M9UY4Jh0pBJEgtX3fVgFRQYPJX9EC33K3h8vA';

// State
let swRegistration = null;
let isSubscribed = false;
let notificationPermission = 'default';

/**
 * Initialize the notification system
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
export async function initNotifications() {
  try {
    // Check if service workers and push messaging are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }
    
    // Check notification permission
    notificationPermission = Notification.permission;
    
    // Register service worker
    swRegistration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered:', swRegistration);
    
    // Check if already subscribed
    const subscription = await swRegistration.pushManager.getSubscription();
    isSubscribed = subscription !== null;
    
    console.log('Notification system initialized, subscription status:', isSubscribed);
    return true;
  } catch (error) {
    console.error('Failed to initialize notification system:', error);
    return false;
  }
}

/**
 * Request permission for notifications
 * @returns {Promise<string>} - The permission status
 */
export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported in this browser');
      return 'denied';
    }
    
    // Request permission
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * Subscribe to push notifications
 * @returns {Promise<PushSubscription>} - The push subscription
 */
export async function subscribeToPushNotifications() {
  try {
    if (!swRegistration) {
      throw new Error('Service Worker not registered');
    }
    
    // Get permission if not already granted
    if (notificationPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }
    
    // Subscribe to push notifications
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    
    console.log('User subscribed to push notifications:', subscription);
    isSubscribed = true;
    
    // Send subscription to server
    await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 * @returns {Promise<boolean>} - Whether unsubscription was successful
 */
export async function unsubscribeFromPushNotifications() {
  try {
    if (!swRegistration) {
      throw new Error('Service Worker not registered');
    }
    
    // Get current subscription
    const subscription = await swRegistration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('No subscription to unsubscribe from');
      isSubscribed = false;
      return true;
    }
    
    // Unsubscribe
    const result = await subscription.unsubscribe();
    
    if (result) {
      console.log('User unsubscribed from push notifications');
      isSubscribed = false;
      
      // Remove subscription from server
      await removeSubscriptionFromServer(subscription);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Send a subscription to the server
 * @param {PushSubscription} subscription - The push subscription
 * @returns {Promise<Object>} - The server response
 */
async function sendSubscriptionToServer(subscription) {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
    throw error;
  }
}

/**
 * Remove a subscription from the server
 * @param {PushSubscription} subscription - The push subscription
 * @returns {Promise<Object>} - The server response
 */
async function removeSubscriptionFromServer(subscription) {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to remove subscription from server:', error);
    throw error;
  }
}

/**
 * Show an in-app notification
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (info, success, warning, error)
 * @param {number} duration - The notification duration in milliseconds
 * @returns {Object} - The notification object
 */
export function showNotification(title, message, type = 'info', duration = 5000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Add notification content
  notification.innerHTML = `
    <div class="notification-header">
      <h3>${title}</h3>
      <button class="notification-close">&times;</button>
    </div>
    <div class="notification-body">
      <p>${message}</p>
    </div>
  `;
  
  // Add notification to container
  let container = document.getElementById('notification-container');
  
  if (!container) {
    // Create container if it doesn't exist
    container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
  }
  
  container.appendChild(notification);
  
  // Add close button event listener
  const closeButton = notification.querySelector('.notification-close');
  closeButton.addEventListener('click', () => {
    removeNotification(notification);
  });
  
  // Auto-remove after duration
  const timeoutId = setTimeout(() => {
    removeNotification(notification);
  }, duration);
  
  // Return notification object
  return {
    element: notification,
    close: () => {
      clearTimeout(timeoutId);
      removeNotification(notification);
    }
  };
}

/**
 * Remove a notification element
 * @param {HTMLElement} notification - The notification element
 */
function removeNotification(notification) {
  // Add fade-out class
  notification.classList.add('notification-fade-out');
  
  // Remove after animation
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    
    // Remove container if empty
    const container = document.getElementById('notification-container');
    if (container && container.children.length === 0) {
      container.parentNode.removeChild(container);
    }
  }, 300);
}

/**
 * Convert a base64 string to a Uint8Array
 * @param {string} base64String - The base64 string
 * @returns {Uint8Array} - The Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Check if the user is subscribed to push notifications
 * @returns {boolean} - Whether the user is subscribed
 */
export function isPushSubscribed() {
  return isSubscribed;
}

/**
 * Get the current notification permission
 * @returns {string} - The notification permission
 */
export function getNotificationPermission() {
  return notificationPermission;
}

// Initialize the notification system when the module is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initNotifications().catch(console.error);
  });
}
