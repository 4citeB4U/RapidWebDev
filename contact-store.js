/**
 * Contact Store Module
 * Provides persistent storage for customer contacts using IndexedDB
 */

// Database configuration
const DB_NAME = 'ContactDB';
const DB_VERSION = 1;
const STORE_NAME = 'contacts';

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
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
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
 * Save a contact to the database
 * @param {Object} contact - The contact data to save
 * @returns {Promise<number>} - The ID of the saved contact
 */
export async function saveContact(contact) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Add timestamp if not provided
      const contactWithTimestamp = {
        ...contact,
        timestamp: contact.timestamp || Date.now()
      };
      
      const request = store.add(contactWithTimestamp);
      
      request.onsuccess = (event) => {
        resolve(event.target.result); // Return the generated ID
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to save contact:', error);
    return Promise.reject(error);
  }
}

/**
 * Get a contact by ID
 * @param {number} id - The contact ID
 * @returns {Promise<Object>} - The contact data
 */
export async function getContact(id) {
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
    console.error('Failed to get contact:', error);
    return Promise.reject(error);
  }
}

/**
 * Get all contacts from the database
 * @returns {Promise<Array>} - All contacts
 */
export async function getAllContacts() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to get all contacts:', error);
    return Promise.reject(error);
  }
}

/**
 * Update an existing contact
 * @param {Object} contact - The contact data to update (must include id)
 * @returns {Promise<void>} - Resolves when the contact is updated
 */
export async function updateContact(contact) {
  if (!contact.id) {
    return Promise.reject(new Error('Contact ID is required for update'));
  }
  
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Update the timestamp
      const updatedContact = {
        ...contact,
        updatedAt: Date.now()
      };
      
      const request = store.put(updatedContact);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to update contact:', error);
    return Promise.reject(error);
  }
}

/**
 * Delete a contact by ID
 * @param {number} id - The contact ID
 * @returns {Promise<void>} - Resolves when the contact is deleted
 */
export async function deleteContact(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return Promise.reject(error);
  }
}

/**
 * Search contacts by a field value
 * @param {string} field - The field to search
 * @param {any} value - The value to search for
 * @returns {Promise<Array>} - Matching contacts
 */
export async function searchContacts(field, value) {
  try {
    const allContacts = await getAllContacts();
    return allContacts.filter(contact => contact[field] === value);
  } catch (error) {
    console.error('Failed to search contacts:', error);
    return Promise.reject(error);
  }
}

// Initialize the database when the module is loaded
openDB().catch(error => {
  console.warn('Contact store initialization failed:', error);
});
