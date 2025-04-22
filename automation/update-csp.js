/**
 * Update Content Security Policy
 * Updates the CSP in both the meta tag and .htaccess file
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const cspConfig = require('../security/csp-config');

// Promisify fs functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configuration
const config = {
  htmlFile: 'index.html',
  htaccessFile: '.htaccess'
};

/**
 * Update the CSP in the HTML file
 */
async function updateHtmlCSP() {
  try {
    console.log(`Updating CSP in ${config.htmlFile}...`);
    
    // Read the HTML file
    const htmlContent = await readFile(config.htmlFile, 'utf8');
    
    // Update the CSP
    const updatedHtmlContent = cspConfig.updateMetaCSP(htmlContent);
    
    // Write the updated HTML file
    await writeFile(config.htmlFile, updatedHtmlContent);
    
    console.log(`CSP updated in ${config.htmlFile}`);
  } catch (error) {
    console.error(`Error updating CSP in ${config.htmlFile}:`, error);
  }
}

/**
 * Update the CSP in the .htaccess file
 */
async function updateHtaccessCSP() {
  try {
    console.log(`Updating CSP in ${config.htaccessFile}...`);
    
    // Read the .htaccess file
    const htaccessContent = await readFile(config.htaccessFile, 'utf8');
    
    // Update the CSP
    const updatedHtaccessContent = cspConfig.updateHtaccessCSP(htaccessContent);
    
    // Write the updated .htaccess file
    await writeFile(config.htaccessFile, updatedHtaccessContent);
    
    console.log(`CSP updated in ${config.htaccessFile}`);
  } catch (error) {
    console.error(`Error updating CSP in ${config.htaccessFile}:`, error);
  }
}

/**
 * Update the CSP in both files
 */
async function updateCSP() {
  try {
    console.log('Updating Content Security Policy...');
    
    // Update the CSP in the HTML file
    await updateHtmlCSP();
    
    // Update the CSP in the .htaccess file
    await updateHtaccessCSP();
    
    console.log('Content Security Policy updated successfully');
  } catch (error) {
    console.error('Error updating Content Security Policy:', error);
  }
}

// Run the CSP updater
updateCSP();
