/**
 * Content Security Policy Configuration
 * Provides a standardized CSP configuration for both meta tag and .htaccess
 */

// Base CSP directives
const baseDirectives = {
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
};

/**
 * Generate a CSP string for meta tag
 * @returns {string} - CSP string for meta tag
 */
function generateMetaCSP() {
  const directives = [];
  
  for (const [directive, sources] of Object.entries(baseDirectives)) {
    directives.push(`${directive} ${sources.join(' ')}`);
  }
  
  return directives.join('; ');
}

/**
 * Generate a CSP string for .htaccess
 * @returns {string} - CSP string for .htaccess
 */
function generateHtaccessCSP() {
  const directives = [];
  
  for (const [directive, sources] of Object.entries(baseDirectives)) {
    directives.push(`${directive} ${sources.join(' ')}`);
  }
  
  return directives.join('; ');
}

/**
 * Update the CSP in the meta tag
 * @param {string} htmlContent - The HTML content
 * @returns {string} - Updated HTML content
 */
function updateMetaCSP(htmlContent) {
  const cspString = generateMetaCSP();
  
  // Regular expression to find the CSP meta tag
  const cspMetaRegex = /<meta[^>]*content=['"](default-src[^'"]*)['"][^>]*http-equiv=['"]Content-Security-Policy['"][^>]*>/i;
  
  // Check if the CSP meta tag exists
  if (cspMetaRegex.test(htmlContent)) {
    // Replace the existing CSP meta tag
    return htmlContent.replace(cspMetaRegex, `<meta content="${cspString}" http-equiv="Content-Security-Policy"/>`);
  } else {
    // Add a new CSP meta tag after the last meta tag
    return htmlContent.replace(/<\/head>/i, `<meta content="${cspString}" http-equiv="Content-Security-Policy"/>\n</head>`);
  }
}

/**
 * Update the CSP in the .htaccess file
 * @param {string} htaccessContent - The .htaccess content
 * @returns {string} - Updated .htaccess content
 */
function updateHtaccessCSP(htaccessContent) {
  const cspString = generateHtaccessCSP();
  
  // Regular expression to find the CSP header
  const cspHeaderRegex = /Header\s+(?:always\s+)?set\s+Content-Security-Policy\s+["']([^"']+)["']/i;
  
  // Check if the CSP header exists
  if (cspHeaderRegex.test(htaccessContent)) {
    // Replace the existing CSP header
    return htaccessContent.replace(cspHeaderRegex, `Header always set Content-Security-Policy "${cspString}"`);
  } else {
    // Add a new CSP header in the <IfModule mod_headers.c> section
    if (htaccessContent.includes('<IfModule mod_headers.c>')) {
      return htaccessContent.replace(/<IfModule mod_headers\.c>/i, `<IfModule mod_headers.c>\n  Header always set Content-Security-Policy "${cspString}"`);
    } else {
      // Add a new <IfModule mod_headers.c> section
      return htaccessContent + `\n\n# Content Security Policy\n<IfModule mod_headers.c>\n  Header always set Content-Security-Policy "${cspString}"\n</IfModule>`;
    }
  }
}

// Export the functions if running in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    baseDirectives,
    generateMetaCSP,
    generateHtaccessCSP,
    updateMetaCSP,
    updateHtaccessCSP
  };
}
