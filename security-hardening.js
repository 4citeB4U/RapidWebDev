/**
 * Security Hardening Module
 * Provides functions for enhancing security of the application
 */

// Configuration
const SECURITY_CONFIG = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "https://cdn.tailwindcss.com",
      "https://unpkg.com",
      "https://js.stripe.com",
      "'unsafe-inline'",
      "https://www.googletagmanager.com"
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'connect-src': ["'self'", "https:", "wss:"],
    'img-src': ["'self'", "data:", "blob:", "https://placehold.co"],
    'media-src': ["'self'", "https:", "data:", "blob:"],
    'font-src': ["'self'", "https:", "data:"],
    'frame-src': ["'self'", "https://www.youtube.com", "https://js.stripe.com"]
  },
  
  // Permissions Policy
  permissionsPolicy: {
    'camera': ["'self'"],
    'microphone': ["'self'"],
    'geolocation': ["'none'"],
    'interest-cohort': ["'none'"]
  },
  
  // Referrer Policy
  referrerPolicy: 'strict-origin-when-cross-origin',
  
  // Frame Options
  frameOptions: 'SAMEORIGIN',
  
  // XSS Protection
  xssProtection: '1; mode=block',
  
  // Content Type Options
  contentTypeOptions: 'nosniff'
};

/**
 * Apply security headers via meta tags
 */
export function applySecurityMetaTags() {
  try {
    // Generate CSP string
    const cspString = Object.entries(SECURITY_CONFIG.csp)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    
    // Generate Permissions Policy string
    const permissionsPolicyString = Object.entries(SECURITY_CONFIG.permissionsPolicy)
      .map(([directive, sources]) => `${directive}=${sources.join(' ')}`)
      .join(', ');
    
    // Create meta tags
    const metaTags = [
      {
        httpEquiv: 'Content-Security-Policy',
        content: cspString
      },
      {
        httpEquiv: 'Permissions-Policy',
        content: permissionsPolicyString
      },
      {
        httpEquiv: 'Referrer-Policy',
        content: SECURITY_CONFIG.referrerPolicy
      },
      {
        httpEquiv: 'X-Frame-Options',
        content: SECURITY_CONFIG.frameOptions
      },
      {
        httpEquiv: 'X-XSS-Protection',
        content: SECURITY_CONFIG.xssProtection
      },
      {
        httpEquiv: 'X-Content-Type-Options',
        content: SECURITY_CONFIG.contentTypeOptions
      }
    ];
    
    // Add meta tags to head
    metaTags.forEach(metaTag => {
      // Check if meta tag already exists
      const existingTag = document.querySelector(`meta[http-equiv="${metaTag.httpEquiv}"]`);
      
      if (existingTag) {
        // Update existing tag
        existingTag.setAttribute('content', metaTag.content);
      } else {
        // Create new tag
        const tag = document.createElement('meta');
        tag.setAttribute('http-equiv', metaTag.httpEquiv);
        tag.setAttribute('content', metaTag.content);
        document.head.appendChild(tag);
      }
    });
    
    console.log('Security meta tags applied');
  } catch (error) {
    console.error('Failed to apply security meta tags:', error);
  }
}

/**
 * Sanitize HTML string
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - The sanitized HTML string
 */
export function sanitizeHtml(html) {
  try {
    // Create a new DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove potentially dangerous elements and attributes
    const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'style'];
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeyup', 'onkeypress'];
    
    // Remove dangerous elements
    dangerousElements.forEach(elementName => {
      const elements = doc.querySelectorAll(elementName);
      elements.forEach(element => {
        element.parentNode.removeChild(element);
      });
    });
    
    // Remove dangerous attributes from all elements
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(element => {
      dangerousAttributes.forEach(attrName => {
        if (element.hasAttribute(attrName)) {
          element.removeAttribute(attrName);
        }
      });
      
      // Remove javascript: URLs
      if (element.hasAttribute('href') && element.getAttribute('href').toLowerCase().startsWith('javascript:')) {
        element.setAttribute('href', '#');
      }
      
      if (element.hasAttribute('src') && element.getAttribute('src').toLowerCase().startsWith('javascript:')) {
        element.removeAttribute('src');
      }
    });
    
    // Return sanitized HTML
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Failed to sanitize HTML:', error);
    return '';
  }
}

/**
 * Encrypt data using AES-GCM
 * @param {string} data - The data to encrypt
 * @param {string} password - The password to use for encryption
 * @returns {Promise<string>} - The encrypted data as a base64 string
 */
export async function encryptData(data, password) {
  try {
    // Convert password to key
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Generate initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt data
    const dataBuffer = encoder.encode(data);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      dataBuffer
    );
    
    // Combine salt, iv, and encrypted data
    const result = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode.apply(null, result));
  } catch (error) {
    console.error('Failed to encrypt data:', error);
    throw error;
  }
}

/**
 * Decrypt data using AES-GCM
 * @param {string} encryptedData - The encrypted data as a base64 string
 * @param {string} password - The password to use for decryption
 * @returns {Promise<string>} - The decrypted data
 */
export async function decryptData(encryptedData, password) {
  try {
    // Convert base64 to array buffer
    const encryptedBytes = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    // Extract salt, iv, and encrypted data
    const salt = encryptedBytes.slice(0, 16);
    const iv = encryptedBytes.slice(16, 28);
    const data = encryptedBytes.slice(28);
    
    // Convert password to key
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    throw error;
  }
}

/**
 * Generate a secure random password
 * @param {number} length - The password length
 * @returns {string} - The generated password
 */
export function generatePassword(length = 16) {
  try {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(randomValues[i] % charset.length);
    }
    
    return password;
  } catch (error) {
    console.error('Failed to generate password:', error);
    throw error;
  }
}

/**
 * Validate input against XSS attacks
 * @param {string} input - The input to validate
 * @returns {boolean} - Whether the input is safe
 */
export function isInputSafe(input) {
  try {
    // Check for common XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+=/gi,
      /\bdata:/gi
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to validate input:', error);
    return false;
  }
}

/**
 * Initialize security features
 */
export function initSecurity() {
  try {
    // Apply security meta tags
    applySecurityMetaTags();
    
    console.log('Security features initialized');
  } catch (error) {
    console.error('Failed to initialize security features:', error);
  }
}

// Initialize security features when the module is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initSecurity();
  });
}
