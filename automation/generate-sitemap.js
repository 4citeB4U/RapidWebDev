/**
 * Sitemap Generator
 * Generates a comprehensive sitemap.xml file that includes all HTML pages
 * with current lastmod dates.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

// Configuration
const config = {
  host: 'https://rapidwebdevelop.com',
  outputFile: 'sitemap.xml',
  directories: [
    '.', // Root directory
    'seo-keywords',
    'web-marketing-seo',
    'blog-scheduled-posts'
  ],
  fileExtensions: ['.html', '.htm'],
  excludePatterns: [
    /^indexbackup\.html$/i,
    /^test/i,
    /^draft/i,
    /^_/
  ],
  changefreq: {
    default: 'monthly',
    root: 'weekly',
    blog: 'weekly',
    seo: 'monthly'
  },
  priority: {
    default: '0.5',
    root: '1.0',
    blog: '0.8',
    seo: '0.6'
  }
};

/**
 * Get all HTML files in a directory and its subdirectories
 * @param {string} dir - The directory to search
 * @returns {Promise<Array>} - Array of file paths
 */
async function getHtmlFiles(dir) {
  const files = [];
  
  // Read the directory
  const entries = await readdir(dir, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip excluded files
    if (config.excludePatterns.some(pattern => pattern.test(entry.name))) {
      continue;
    }
    
    if (entry.isDirectory()) {
      // Recursively search subdirectories
      const subFiles = await getHtmlFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      // Check if the file has an HTML extension
      const ext = path.extname(entry.name).toLowerCase();
      if (config.fileExtensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Generate a sitemap URL entry
 * @param {string} filePath - The file path
 * @param {Date} modDate - The modification date
 * @returns {string} - The sitemap URL entry
 */
function generateUrlEntry(filePath, modDate) {
  // Convert Windows path separators to URL format
  const urlPath = filePath.replace(/\\/g, '/');
  
  // Format the date as YYYY-MM-DD
  const lastmod = modDate.toISOString().split('T')[0];
  
  // Determine changefreq and priority based on the file path
  let changefreq = config.changefreq.default;
  let priority = config.priority.default;
  
  if (filePath === './index.html') {
    changefreq = config.changefreq.root;
    priority = config.priority.root;
  } else if (filePath.includes('blog')) {
    changefreq = config.changefreq.blog;
    priority = config.priority.blog;
  } else if (filePath.includes('seo-keywords')) {
    changefreq = config.changefreq.seo;
    priority = config.priority.seo;
  }
  
  // Generate the URL
  const url = `${config.host}/${urlPath === './index.html' ? '' : urlPath}`;
  
  // Return the sitemap URL entry
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Generate the sitemap
 */
async function generateSitemap() {
  try {
    console.log('Generating sitemap...');
    
    // Get all HTML files
    const allFiles = [];
    for (const dir of config.directories) {
      const files = await getHtmlFiles(dir);
      allFiles.push(...files);
    }
    
    console.log(`Found ${allFiles.length} HTML files`);
    
    // Generate URL entries
    const urlEntries = [];
    for (const file of allFiles) {
      const fileStat = await stat(file);
      const entry = generateUrlEntry(file, fileStat.mtime);
      urlEntries.push(entry);
    }
    
    // Generate the sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;
    
    // Write the sitemap to a file
    await writeFile(config.outputFile, sitemap);
    
    console.log(`Sitemap generated successfully: ${config.outputFile}`);
    console.log(`Total URLs: ${urlEntries.length}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

// Run the sitemap generator
generateSitemap();
