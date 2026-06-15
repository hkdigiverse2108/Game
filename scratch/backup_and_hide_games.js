const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKUP_DIR = path.resolve(ROOT_DIR, '..', 'Game_backup');

console.log(`Source directory: ${ROOT_DIR}`);
console.log(`Backup directory: ${BACKUP_DIR}`);

// Ensure backup directories exist
const backupGameDist = path.join(BACKUP_DIR, 'gameDistribution');
const backupGameAssets = path.join(BACKUP_DIR, 'game');
const backupBlog = path.join(BACKUP_DIR, 'blog');

fs.mkdirSync(backupGameDist, { recursive: true });
fs.mkdirSync(backupGameAssets, { recursive: true });
fs.mkdirSync(backupBlog, { recursive: true });

// Games to hide and back up
const gamesToBackup = [
  { id: 'subway-surfers-vegas-queen', html: 'SubwaySurfers-Vegas-Queen.html', dir: 'SubwaySurfers-Vegas-Queen' },
  { id: 'subway-surfers-new-york', html: 'SubwaySurfers.html', dir: 'SubwaySurfers' },
  { id: '8-ball-pool', html: '8BallPool.html', dir: '8BallPool' },
  { id: 'candy-crush', html: 'Candy-Crush.html', dir: 'candy crush' },
  { id: 'fruit-ninja', html: 'FruitNinja.html', dir: 'FruitNinja' },
  { id: 'angry-birds', html: 'AngryBirds.html', dir: 'AngryBirds' },
  { id: 'angry-birds-2', html: 'Angry-Birds-2.html', dir: 'angry birds 2' },
  { id: 'temple-run', html: 'Temple-Run.html', dir: 'temple-run' },
  { id: 'slither-io', html: 'Slither.html', dir: 'Slither.io' },
  { id: 'uno', html: 'Uno.html', dir: 'uno' },
  { id: 'stupid-zombies', html: 'Stupid-Zombies.html', dir: 'stupid-zombies' },
  { id: 'football-strike', html: 'Football-Strike.html', dir: 'Football Strike' }
];

// Blog articles to back up
const blogsToBackup = [
  'subway-surfers-guide.html',
  '8-ball-pool-tricks.html',
  'angry-birds-2-verdict.html',
  'subway-surfers-hoverboards.html'
];

// 1. Move game distribution HTML files
gamesToBackup.forEach(game => {
  const srcHtml = path.join(ROOT_DIR, 'gameDistribution', game.html);
  const destHtml = path.join(backupGameDist, game.html);
  if (fs.existsSync(srcHtml)) {
    try {
      fs.cpSync(srcHtml, destHtml);
      fs.rmSync(srcHtml, { force: true });
      console.log(`Backed up and removed html: ${game.html}`);
    } catch (e) {
      console.error(`Failed to move html file ${game.html}:`, e.message);
    }
  } else {
    console.log(`HTML file not found (already moved?): ${game.html}`);
  }
});

// 2. Move game asset folders
gamesToBackup.forEach(game => {
  if (game.dir) {
    const srcDir = path.join(ROOT_DIR, 'game', game.dir);
    const destDir = path.join(backupGameAssets, game.dir);
    if (fs.existsSync(srcDir)) {
      try {
        fs.cpSync(srcDir, destDir, { recursive: true });
        fs.rmSync(srcDir, { recursive: true, force: true });
        console.log(`Backed up and removed assets dir: ${game.dir}`);
      } catch (err) {
        console.error(`Failed to move directory ${game.dir}:`, err.message);
      }
    } else {
      console.log(`Assets dir not found (already moved?): ${game.dir}`);
    }
  }
});

// 3. Move blog articles
blogsToBackup.forEach(file => {
  const srcBlog = path.join(ROOT_DIR, 'blog', file);
  const destBlog = path.join(backupBlog, file);
  if (fs.existsSync(srcBlog)) {
    try {
      fs.cpSync(srcBlog, destBlog);
      fs.rmSync(srcBlog, { force: true });
      console.log(`Backed up and removed blog: ${file}`);
    } catch (e) {
      console.error(`Failed to move blog ${file}:`, e.message);
    }
  } else {
    console.log(`Blog file not found (already moved?): ${file}`);
  }
});

// 4. Update gamesData.json
const gamesDataFile = path.join(ROOT_DIR, 'assets', 'js', 'gamesData.json');
if (fs.existsSync(gamesDataFile)) {
  const data = JSON.parse(fs.readFileSync(gamesDataFile, 'utf8'));
  const beforeCount = data.gameTitles.length;
  const hideIds = gamesToBackup.map(g => g.id);
  data.gameTitles = data.gameTitles.filter(g => !hideIds.includes(g.id));
  const afterCount = data.gameTitles.length;
  fs.writeFileSync(gamesDataFile, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated gamesData.json (Removed ${beforeCount - afterCount} titles, now ${afterCount} titles remaining)`);
} else {
  console.error(`gamesData.json not found at ${gamesDataFile}`);
}

console.log('Backup and hide completed successfully!');
