const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Fix footer logo paths in root-level HTML files
const rootHtmlFiles = [
  'about.html',
  'contact.html',
  'cookie-policy.html',
  'developers.html',
  'disclaimer.html',
  'dmca.html',
  'faq.html',
  'gdpr.html',
  'index.html',
  'privacy.html',
  'terms.html'
];

console.log('Fixing root-level footer logo paths...');
for (const file of rootHtmlFiles) {
  const filePath = path.join(ROOT_DIR, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace src="../assets/images/logo.png" with src="assets/images/logo.png"
    if (content.includes('src="../assets/images/logo.png"')) {
      content = content.replace('src="../assets/images/logo.png"', 'src="assets/images/logo.png"');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`- Fixed logo path in: ${file}`);
    } else {
      console.log(`- Logo path already correct or not found in: ${file}`);
    }
  } else {
    console.error(`File not found: ${filePath}`);
  }
}

// 2. Fix specific broken media links in gameDistribution/ folder
const gameDistFixes = [
  {
    file: 'gameDistribution/2048-NumStack.html',
    from: '../game/2048-NumStack/gallery/v1.mp4',
    to: '../game/2048-NumStack/gallery/v1.mov'
  },
  {
    file: 'gameDistribution/Adam-And-Eve-5-Part-1.html',
    from: '../game/Adam And Eve 5 - part 1/gallery/v1.mp4',
    to: '../game/Adam And Eve 5 - part 1/gallery/v1.mov'
  },
  {
    file: 'gameDistribution/Adam-And-Eve-6.html',
    from: '../game/Adam And Eve 6/gallery/p3.png',
    to: '../game/Adam And Eve 6/gallery/p2.png'
  },
  {
    file: 'gameDistribution/Water-Sort-Puzzle.html',
    from: '../game/water-sort-puzzle/gallery/v1.mp4',
    to: '../game/water-sort-puzzle/gallery/v1.mov'
  },
  {
    file: 'gameDistribution/Spacecraft.html',
    from: '../game/Spacecraft/Spacecraft.png',
    to: '../game/Spacecraft/images/thumb.png'
  }
];

console.log('\nFixing game distribution media paths...');
for (const fix of gameDistFixes) {
  const filePath = path.join(ROOT_DIR, fix.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(fix.from)) {
      content = content.replace(fix.from, fix.to);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`- Fixed media path in: ${fix.file}`);
    } else {
      console.log(`- Path already fixed or not found in: ${fix.file}`);
    }
  } else {
    console.error(`File not found: ${filePath}`);
  }
}

console.log('\nAll fixes completed!');
