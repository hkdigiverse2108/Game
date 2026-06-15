const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMEDIST_DIR = path.join(ROOT_DIR, 'gameDistribution');
const BLOG_DIR = path.join(ROOT_DIR, 'blog');

// Recursively find all HTML files
function findHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'scratch' || file === '_backup' || file === 'Game_backup' || file === 'game') {
      continue;
    }
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(ROOT_DIR);
console.log(`Found ${htmlFiles.length} HTML files to scan for broken links.\n`);

let brokenCount = 0;
let totalChecked = 0;

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const dirPath = path.dirname(htmlFile);

  // Regex to match href="..." and src="..."
  const linkRegex = /(?:href|src)="([^"]+)"/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    let link = match[1];

    // Strip hash fragments and query params
    const hashIndex = link.indexOf('#');
    if (hashIndex !== -1) {
      link = link.substring(0, hashIndex);
    }
    const queryIndex = link.indexOf('?');
    if (queryIndex !== -1) {
      link = link.substring(0, queryIndex);
    }

    link = link.trim();

    // Skip empty links (which were just # or ? something)
    if (!link) {
      continue;
    }

    // Skip external links, mailto, tel, javascript, etc.
    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('javascript:')) {
      continue;
    }

    // Skip absolute CDN links
    if (link.startsWith('//')) {
      continue;
    }

    totalChecked++;

    // Resolve target path relative to the HTML file directory
    let targetPath;
    if (link.startsWith('/')) {
      // Treat root-relative links relative to workspace ROOT_DIR
      targetPath = path.join(ROOT_DIR, link);
    } else {
      targetPath = path.resolve(dirPath, link);
    }

    // Check if the target file exists
    if (!fs.existsSync(targetPath)) {
      const relSrc = path.relative(ROOT_DIR, htmlFile);
      const relDest = path.relative(ROOT_DIR, targetPath);
      console.error(`BROKEN LINK in [${relSrc}]: "${link}" -> resolved to missing: "${relDest}"`);
      brokenCount++;
    }
  }
}

console.log(`\nLink Verification Summary:`);
console.log(`Total local links checked: ${totalChecked}`);
console.log(`Broken links found: ${brokenCount}`);

if (brokenCount > 0) {
  process.exit(1);
} else {
  console.log(`ALL LOCAL LINKS ARE VALID! NO BROKEN LINKS DETECTED.`);
}
