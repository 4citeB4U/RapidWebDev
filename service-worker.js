/**
 * Service Worker
 * Handles push notifications, caching, and offline functionality
 */

// Cache name and files to cache
const CACHE_NAME = 'rapidwebdevelop-cache-v1';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/assets/css/animations.css',
  '/assets/css/accessibility.css',
  '/agent-lee.js',
  '/agent-lee-enhanced.js',
  '/agent-lee-error-handling.js',
  '/badge-store.js',
  '/badge-ui.js',
  '/contact-store.js',
  '/contact-sync.js',
  '/transcript-store.js',
  '/emailjs-templates.js',
  '/webrtc-signaling.js',
  '/notification-system.js',
  '/assets/mainpage/logo.png',
  '/assets/mainpage/agentsavatars/agentlee.png'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((fetchResponse) => {
            // Don't cache non-successful responses
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            
            // Clone the response
            const responseToCache = fetchResponse.clone();
            
            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return fetchResponse;
          });
      })
      .catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        
        // Return a fallback response for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        
        return new Response('Network error', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  let notificationData = {
    title: 'Notification',
    body: 'Something new happened!',
    icon: '/assets/mainpage/logo.png',
    badge: '/assets/mainpage/logo.png',
    tag: 'default',
    data: {}
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('[Service Worker] Failed to parse push data:', error);
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions || [],
      requireInteraction: notificationData.requireInteraction || false,
      renotify: notificationData.renotify || false,
      silent: notificationData.silent || false,
      vibrate: notificationData.vibrate || [200, 100, 200]
    })
  );
});

// Notification click event - handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();
  
  // Get notification data
  const notificationData = event.notification.data || {};
  const url = notificationData.url || '/';
  
  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if a window is already open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event received:', event.tag);
  
  if (event.tag === 'sync-contacts') {
    event.waitUntil(syncContacts());
  } else if (event.tag === 'sync-transcripts') {
    event.waitUntil(syncTranscripts());
  }
});

/**
 * Sync contacts with the server
 * @returns {Promise<void>} - Resolves when sync is complete
 */
async function syncContacts() {
  try {
    // Open IndexedDB
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('ContactDB', 1);
      request.onerror = reject;
      request.onsuccess = (event) => resolve(event.target.result);
    });
    
    // Get unsynced contacts
    const contacts = await new Promise((resolve, reject) => {
      const transaction = db.transaction(['contacts'], 'readonly');
      const store = transaction.objectStore('contacts');
      const request = store.getAll();
      request.onerror = reject;
      request.onsuccess = (event) => {
        const allContacts = event.target.result;
        const unsynced = allContacts.filter(contact => !contact.synced);
        resolve(unsynced);
      };
    });
    
    if (contacts.length === 0) {
      console.log('[Service Worker] No contacts to sync');
      return;
    }
    
    console.log(`[Service Worker] Syncing ${contacts.length} contacts`);
    
    // Sync each contact
    for (const contact of contacts) {
      try {
        const response = await fetch('/api/contacts', {
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
        
        const serverResponse = await response.json();
        
        // Update contact in IndexedDB
        await new Promise((resolve, reject) => {
          const transaction = db.transaction(['contacts'], 'readwrite');
          const store = transaction.objectStore('contacts');
          const request = store.put({
            ...contact,
            serverId: serverResponse.id,
            synced: true,
            syncedAt: Date.now()
          });
          request.onerror = reject;
          request.onsuccess = resolve;
        });
        
        console.log(`[Service Worker] Contact ${contact.id} synced successfully`);
      } catch (error) {
        console.error(`[Service Worker] Failed to sync contact ${contact.id}:`, error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync contacts:', error);
  }
}

/**
 * Sync transcripts with the server
 * @returns {Promise<void>} - Resolves when sync is complete
 */
async function syncTranscripts() {
  try {
    // Open IndexedDB
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('TranscriptDB', 1);
      request.onerror = reject;
      request.onsuccess = (event) => resolve(event.target.result);
    });
    
    // Get unsynced transcripts
    const transcripts = await new Promise((resolve, reject) => {
      const transaction = db.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const request = store.getAll();
      request.onerror = reject;
      request.onsuccess = (event) => {
        const allTranscripts = event.target.result;
        const unsynced = allTranscripts.filter(transcript => !transcript.synced);
        resolve(unsynced);
      };
    });
    
    if (transcripts.length === 0) {
      console.log('[Service Worker] No transcripts to sync');
      return;
    }
    
    console.log(`[Service Worker] Syncing ${transcripts.length} transcripts`);
    
    // Sync transcripts in batches of 10
    const batchSize = 10;
    for (let i = 0; i < transcripts.length; i += batchSize) {
      const batch = transcripts.slice(i, i + batchSize);
      
      try {
        const response = await fetch('/api/transcripts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(batch.map(transcript => ({
            ...transcript,
            localId: transcript.id
          })))
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const serverResponse = await response.json();
        
        // Update transcripts in IndexedDB
        for (let j = 0; j < batch.length; j++) {
          const transcript = batch[j];
          const serverData = serverResponse[j];
          
          await new Promise((resolve, reject) => {
            const transaction = db.transaction(['messages'], 'readwrite');
            const store = transaction.objectStore('messages');
            const request = store.put({
              ...transcript,
              serverId: serverData.id,
              synced: true,
              syncedAt: Date.now()
            });
            request.onerror = reject;
            request.onsuccess = resolve;
          });
        }
        
        console.log(`[Service Worker] Batch of ${batch.length} transcripts synced successfully`);
      } catch (error) {
        console.error('[Service Worker] Failed to sync transcript batch:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync transcripts:', error);
  }
}
