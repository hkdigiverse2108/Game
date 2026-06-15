const fs = require('fs');
const path = require('path');

const GAMEDIST_DIR = path.resolve(__dirname, '..', 'gameDistribution');
const files = fs.readdirSync(GAMEDIST_DIR).filter(f => f.endsWith('.html'));

console.log(`Verifying word counts for ${files.length} game HTML files...`);

let allValid = true;
let totalWordCount = 0;

for (const file of files) {
  const filePath = path.join(GAMEDIST_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract content between the description boundaries
  const blockRegex = /(<div class="[^"]*border-t border-white\/5[^"]*">)(.*?)(<div class="mt-[46] grid grid-cols-2 sm:grid-cols-4 gap-3">|<div class="[^"]*gallery-scroll[^"]*">)/s;
  const match = content.match(blockRegex);
  
  if (match) {
    const textBlock = match[2];
    // Strip HTML tags
    const plainText = textBlock.replace(/<[^>]+>/g, ' ');
    // Split by whitespace and filter out empty strings
    const words = plainText.trim().split(/\s+/).filter(w => w.length > 0);
    const count = words.length;
    totalWordCount += count;
    
    if (count < 500) {
      console.error(`FAIL: ${file} has only ${count} words.`);
      allValid = false;
    } else {
      console.log(`PASS: ${file} (${count} words)`);
    }
  } else {
    console.error(`ERROR: Could not match description block in ${file}`);
    allValid = false;
  }
}

console.log(`\nVerification Summary:`);
console.log(`Total games checked: ${files.length}`);
console.log(`Average word count: ${(totalWordCount / files.length).toFixed(1)} words`);
if (allValid) {
  console.log(`ALL FILES PASS THE 500-WORD MINIMUM REQUIREMENT!`);
} else {
  console.error(`SOME FILES FAILED THE CHECK. PLEASE INVESTIGATE.`);
  process.exit(1);
}
