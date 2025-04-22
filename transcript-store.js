/**
 * Transcript Store Module
 * Provides persistent storage for conversation transcripts using IndexedDB
 */

// Database configuration
const DB_NAME = 'TranscriptDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

/**
 * Open the IndexedDB database
 * @returns {Promise<IDBDatabase>} - The database instance
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        
        // Create indexes for efficient querying
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Save a transcript entry to the database
 * @param {Object} entry - The transcript entry to save
 * @returns {Promise<number>} - The ID of the saved entry
 */
export async function saveTranscript(entry) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Add timestamp if not provided
      const entryWithTimestamp = {
        ...entry,
        timestamp: entry.timestamp || Date.now()
      };
      
      const request = store.add(entryWithTimestamp);
      
      request.onsuccess = (event) => {
        resolve(event.target.result); // Return the generated ID
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to save transcript:', error);
    return Promise.reject(error);
  }
}

/**
 * Get a transcript entry by ID
 * @param {number} id - The transcript entry ID
 * @returns {Promise<Object>} - The transcript entry
 */
export async function getTranscript(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to get transcript:', error);
    return Promise.reject(error);
  }
}

/**
 * Get all transcript entries for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - All transcript entries for the user
 */
export async function getUserTranscripts(userId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('userId');
      const request = index.getAll(userId);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to get user transcripts:', error);
    return Promise.reject(error);
  }
}

/**
 * Get the last N transcript entries for a user
 * @param {string} userId - The user ID
 * @param {number} count - The number of entries to retrieve
 * @returns {Promise<Array>} - The last N transcript entries for the user
 */
export async function getLastTranscripts(userId, count = 5) {
  try {
    const allTranscripts = await getUserTranscripts(userId);
    
    // Sort by timestamp in descending order and take the first N
    return allTranscripts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  } catch (error) {
    console.error('Failed to get last transcripts:', error);
    return Promise.reject(error);
  }
}

/**
 * Get all transcript entries for a session
 * @param {string} sessionId - The session ID
 * @returns {Promise<Array>} - All transcript entries for the session
 */
export async function getSessionTranscripts(sessionId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('sessionId');
      const request = index.getAll(sessionId);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to get session transcripts:', error);
    return Promise.reject(error);
  }
}

/**
 * Delete all transcript entries for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - The number of deleted entries
 */
export async function deleteUserTranscripts(userId) {
  try {
    const transcripts = await getUserTranscripts(userId);
    const db = await openDB();
    
    let deletedCount = 0;
    
    for (const transcript of transcripts) {
      await new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(transcript.id);
        
        request.onsuccess = () => {
          deletedCount++;
          resolve();
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Failed to delete user transcripts:', error);
    return Promise.reject(error);
  }
}

/**
 * Sync transcripts with the server
 * @param {Array} transcripts - The transcripts to sync
 * @returns {Promise<Object>} - The sync result
 */
export async function syncTranscripts(transcripts) {
  try {
    const response = await fetch('/api/transcripts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transcripts)
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to sync transcripts:', error);
    return Promise.reject(error);
  }
}

/**
 * Handle a new message and save it to the transcript store
 * @param {string} role - The role of the sender (user, agent, system)
 * @param {string} text - The message text
 * @param {Blob} audioBlob - Optional audio recording of the message
 * @param {string} userId - The user ID
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} - The saved transcript entry
 */
export async function handleMessage(role, text, audioBlob = null, userId = 'anonymous', sessionId = null) {
  try {
    // Create transcript entry
    const entry = {
      role,
      text,
      userId,
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp: Date.now()
    };
    
    // Save transcript locally
    const entryId = await saveTranscript(entry);
    
    // Try to sync with server
    try {
      await fetch('/api/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...entry,
          localId: entryId
        })
      });
      
      // If there's an audio blob, upload it separately
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, `transcript_${entryId}.webm`);
        formData.append('transcriptId', entryId);
        formData.append('userId', userId);
        
        await fetch('/api/transcripts/audio', {
          method: 'POST',
          body: formData
        });
      }
    } catch (syncError) {
      console.warn('Failed to sync transcript with server:', syncError);
      // Continue since we've saved locally
    }
    
    return { ...entry, id: entryId };
  } catch (error) {
    console.error('Failed to handle message:', error);
    throw error;
  }
}

// Initialize the database when the module is loaded
openDB().catch(error => {
  console.warn('Transcript store initialization failed:', error);
});
