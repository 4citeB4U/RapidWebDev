/**
 * Contact Sync Module
 * Provides functionality to synchronize contacts with the server
 */

import { saveContact, updateContact, getAllContacts } from './contact-store.js';

// Configuration
const API_ENDPOINT = '/api/contacts';
const SYNC_INTERVAL = 60000; // 1 minute
let syncIntervalId = null;
let isSyncing = false;

/**
 * Capture contact information and sync with server
 * @param {Object} contact - The contact data to save
 * @returns {Promise<Object>} - The saved contact with ID
 */
export async function captureAndSync(contact) {
  try {
    // 1. Save locally first for offline resilience
    const contactId = await saveContact({
      ...contact,
      timestamp: Date.now(),
      synced: false
    });
    
    // 2. Attempt to sync with server
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...contact,
          localId: contactId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      // Get the server response
      const serverResponse = await response.json();
      
      // Update local record with server ID and synced status
      await updateContact({
        id: contactId,
        serverId: serverResponse.id,
        synced: true,
        syncedAt: Date.now()
      });
      
      console.log('Contact synced successfully:', contactId);
      return { ...contact, id: contactId, serverId: serverResponse.id };
    } catch (syncError) {
      console.error('Failed to sync contact with server:', syncError);
      // We still return the contact since it was saved locally
      return { ...contact, id: contactId };
    }
  } catch (error) {
    console.error('Failed to capture and sync contact:', error);
    throw error;
  }
}

/**
 * Sync all unsynced contacts with the server
 * @returns {Promise<Array>} - Array of sync results
 */
export async function syncUnsynced() {
  if (isSyncing) {
    console.log('Sync already in progress, skipping...');
    return [];
  }
  
  isSyncing = true;
  
  try {
    // Get all contacts
    const allContacts = await getAllContacts();
    
    // Filter unsynced contacts
    const unsynced = allContacts.filter(contact => !contact.synced);
    
    if (unsynced.length === 0) {
      console.log('No unsynced contacts to sync');
      isSyncing = false;
      return [];
    }
    
    console.log(`Syncing ${unsynced.length} unsynced contacts...`);
    
    // Sync each unsynced contact
    const syncResults = await Promise.allSettled(
      unsynced.map(async (contact) => {
        try {
          const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...contact,
              localId: contact.id
            })
          });
          
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          
          // Get the server response
          const serverResponse = await response.json();
          
          // Update local record with server ID and synced status
          await updateContact({
            id: contact.id,
            serverId: serverResponse.id,
            synced: true,
            syncedAt: Date.now()
          });
          
          return { success: true, contactId: contact.id, serverId: serverResponse.id };
        } catch (error) {
          console.error(`Failed to sync contact ${contact.id}:`, error);
          return { success: false, contactId: contact.id, error: error.message };
        }
      })
    );
    
    console.log('Sync completed:', syncResults);
    isSyncing = false;
    return syncResults;
  } catch (error) {
    console.error('Failed to sync unsynced contacts:', error);
    isSyncing = false;
    throw error;
  }
}

/**
 * Start automatic background syncing
 */
export function startAutoSync() {
  if (syncIntervalId) {
    console.log('Auto sync already running');
    return;
  }
  
  console.log(`Starting auto sync every ${SYNC_INTERVAL / 1000} seconds`);
  
  // Perform initial sync
  syncUnsynced().catch(console.error);
  
  // Set up interval for regular syncing
  syncIntervalId = setInterval(() => {
    syncUnsynced().catch(console.error);
  }, SYNC_INTERVAL);
  
  // Add event listeners for online/offline status
  window.addEventListener('online', () => {
    console.log('Back online, syncing contacts...');
    syncUnsynced().catch(console.error);
  });
}

/**
 * Stop automatic background syncing
 */
export function stopAutoSync() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('Auto sync stopped');
  }
}

// Initialize auto sync when the module is loaded
if (navigator.onLine) {
  startAutoSync();
}
