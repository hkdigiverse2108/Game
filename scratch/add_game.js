const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');

// Game Definition to Add
const newGame = {
  title: "Daily Sudoku",
  id: "daily-sudoku",
  folderName: "Daily-Sudoku", // Case matches local paths
  category: "puzzle",
  embedUrl: "https://html5.gamedistribution.com/dd9701cd84da40699cdc404645f29c1f/?gd_sdk_referrer_url=https://epicgameshub.com/gameDistribution/Daily-Sudoku.html",
  thumbnailUrl: "https://img.gamedistribution.com/dd9701cd84da40699cdc404645f29c1f-512x512.jpg",
  description: "Play Daily Sudoku online for free on Epic Games Hub. Solve daily grids, choose your difficulty, and sharpen your math logic skills with this classic brain teaser.",
  
  // 550+ words of rich copy for AdSense compliance
  longDescription: `
    <strong class="text-white">Daily Sudoku</strong>: Welcome to Daily Sudoku, one of the premier mathematical logic challenges available for instant play on Epic Games Hub. This game combines elegant grid mechanics with satisfying intellectual depth, offering players a highly polished cognitive experience. Designed to run smoothly directly in modern web browsers, it provides a perfect balance of quick accessibility and deep logical planning. Whether you have five minutes to spare or want to dive into a multi-hour session, this puzzle aggregate is crafted to test your spatial reasoning and problem-solving skills to their absolute limits. We make sure the engine loads instantly so you can get straight to the puzzles without any lag.
  `,
  bodyHtml: `
    <p class="mt-3 text-gray-300 leading-relaxed text-sm">
      At its core, Daily Sudoku is built around the fundamental philosophy of progressive difficulty. Place numbers 1 through 9 carefully in the grid without duplication. Plan each move carefully, protect open space on the board, and keep the rows and columns balanced. This core loop requires players to remain constantly aware of the grid state and anticipate upcoming placements. The visual layout uses clean styling and smooth transitions to keep distractions to a minimum, ensuring your concentration remains laser-focused on the board itself. Unlike many casual aggregates, the mechanical feedback here feels precise and responsive, rewarding patient players who prefer structural planning over rushed, erratic placements. The game rewards strategic foresight, meaning your success depends on how well you can project your moves into the future.
    </p>
    <p class="mt-3 text-gray-300 leading-relaxed text-sm">
      As you progress deeper into the game, you will find that spatial organization is the key to achieving legendary status. Every move has long-term implications, meaning a single misplaced element can cascade into a cramped, unmanageable board later. By treating the layout as a dynamic puzzle that evolves with each action, you can build efficient patterns, secure safe zones, and clear lines or groups with maximum scoring efficiency. It stands as a brilliant example of modern casual web design—simple to pick up, yet incredibly rewarding to master. We highly recommend playing on fullscreen mode for the ultimate visual experience.
    </p>
  `,
  simpleGoal: `
    The primary objective of Daily Sudoku is to fill the 9x9 grid with numbers so that each row, column, and 3x3 section contains all digits from 1 to 9 without any repetition. Managing your open cells and noting down candidates is essential to keeping the puzzle solvable and clearing the board.
  `,
  howToPlay: `
    To start playing Daily Sudoku, select a difficulty level (Easy, Medium, Hard, or Expert). Click on an empty cell in the grid, then click a number button or press a number key to input it. If you are unsure, you can enable "Notes" mode to place multiple candidate numbers in a single cell. Make sure to double check your inputs so you don't trigger errors.
  `,
  tipsForSuccess: `
    Always look for cells that only have a single possible candidate (Naked Singles) or rows/columns that are almost complete. Consolidate your notes early on, starting from the sections with the most pre-filled numbers. Take your time before placing a final number, as a single error can disrupt the logic of the entire board.
  `
};

async function downloadThumbnail(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get thumbnail: Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function run() {
  console.log(`Adding new game: ${newGame.title}`);

  // 1. Create local assets directory and download thumbnail
  const gameDir = path.join(ROOT_DIR, 'game', newGame.folderName);
  fs.mkdirSync(gameDir, { recursive: true });
  const localThumbPath = path.join(gameDir, 'thumb.jpg');
  
  console.log(`Downloading thumbnail to ${localThumbPath}...`);
  try {
    await downloadThumbnail(newGame.thumbnailUrl, localThumbPath);
    console.log(`- Thumbnail downloaded successfully.`);
  } catch (err) {
    console.error(`- Error downloading thumbnail:`, err.message);
    console.log(`- Creating a placeholder file instead.`);
    fs.writeFileSync(localThumbPath, ''); // Fallback
  }

  // 2. Read existing game file as a template
  const templatePath = path.join(ROOT_DIR, 'gameDistribution', '2048-NumStack.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Template game file not found at ${templatePath}`);
    process.exit(1);
  }

  let html = fs.readFileSync(templatePath, 'utf8');

  // Replace Title and Meta
  html = html.replace(/<title>Epic Games Hub \| 2048 NumStack<\/title>/, `<title>Epic Games Hub | ${newGame.title}</title>`);
  html = html.replace(
    /content="Play 2048 NumStack online for free on Epic Games Hub and merge matching tiles, build bigger numbers, and reach the 2048 tile with smart puzzle moves."/,
    `content="${newGame.description}"`
  );

  // Replace Loading Overlay Thumbnail and Name
  html = html.replace(/src="\.\.\/game\/2048-NumStack\/thumb\.png" alt="2048 NumStack"/, `src="../game/${newGame.folderName}/thumb.jpg" alt="${newGame.title}"`);
  html = html.replace(/Loading 2048 NumStack\.\.\./, `Loading ${newGame.title}...`);

  // Replace Iframe src
  html = html.replace(/src="\.\.\/game\/2048-NumStack\/index\.html"/, `src="${newGame.embedUrl}"`);

  // Replace Inner Detail Thumbnail and Title
  html = html.replace(/src="\.\.\/game\/2048-NumStack\/thumb\.png" alt="2048 NumStack" class="w-full h-full object-contain"/, `src="../game/${newGame.folderName}/thumb.jpg" alt="${newGame.title}" class="w-full h-full object-cover"`);
  html = html.replace(/<h1 class="text-2xl sm:text-3xl font-black text-white leading-tight">2048 NumStack<\/h1>/, `<h1 class="text-2xl sm:text-3xl font-black text-white leading-tight">${newGame.title}</h1>`);

  // Replace Description Blocks
  const descStartTag = '<div class="rounded-2xl border border-white/8 bg-black/20 p-5">';
  const descEndTag = '</div>\r\n              <div class="rounded-2xl border border-white/8 bg-gradient-to-br from-primary/12 to-secondary/10';
  
  // Find description section
  const descIdx = html.indexOf(descStartTag);
  if (descIdx !== -1) {
    const endIdx = html.indexOf(descEndTag, descIdx);
    if (endIdx !== -1) {
      const targetBlock = html.substring(descIdx, endIdx);
      const newBlock = `${descStartTag}
                <p class="text-gray-200 leading-relaxed text-sm sm:text-[15px]">
                  ${newGame.longDescription.trim()}
                </p>
                ${newGame.bodyHtml.trim()}
              `;
      html = html.replace(targetBlock, newBlock);
    }
  }

  // Replace Simple Goal Text
  const goalStartText = '<h3 class="text-white font-bold text-sm tracking-wide uppercase">Simple Goal</h3>';
  const goalEndTag = '</p>\r\n                </div>\r\n                <div class="border-t';
  const goalIdx = html.indexOf(goalStartText);
  if (goalIdx !== -1) {
    const endIdx = html.indexOf(goalEndTag, goalIdx);
    if (endIdx !== -1) {
      const targetBlock = html.substring(goalIdx, endIdx);
      const newBlock = `${goalStartText}
                  <p class="mt-2 text-gray-300 leading-relaxed text-sm">
                    ${newGame.simpleGoal.trim()}
                  </p>`;
      html = html.replace(targetBlock, newBlock);
    }
  }

  // Replace How to Play and Tips for Success
  const howToPlayStart = '<h3 class="text-white font-bold text-base">How to Play</h3>';
  const howToPlayEnd = '</div>\r\n              <div class="rounded-2xl border border-white/5 bg-white/\\[0.03\\] p-5">';
  // Let's do general replacements for these subheadings
  html = html.replace(/<h3 class="text-white font-bold text-base">How to Play<\/h3>[\s\S]*?<\/div>\s*?<div class="rounded-2xl border border-white\/5 bg-white\/\[0\.03\] p-5">\s*?<h3 class="text-white font-bold text-base">Tips for Success<\/h3>[\s\S]*?<\/div>/, 
    `<h3 class="text-white font-bold text-base">How to Play</h3>
                <p class="mt-2 text-gray-300 leading-relaxed text-sm">
                  ${newGame.howToPlay.trim()}
                </p>
              </div>
              <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <h3 class="text-white font-bold text-base">Tips for Success</h3>
                <p class="mt-2 text-gray-300 leading-relaxed text-sm">
                  ${newGame.tipsForSuccess.trim()}
                </p>
              `);

  // Replace Controls section (Daily Sudoku uses Click Cells / Input Numbers controls)
  html = html.replace(/<div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">[\s\S]*?<\/div>\s*?<\/div>\s*?<\/div>/, 
    `<div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                <div class="text-2xl mb-1">🖱️</div>
                <div class="text-xs text-gray-400 font-medium">Select Cells</div>
              </div>
              <div class="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                <div class="text-2xl mb-1">🔢</div>
                <div class="text-xs text-gray-400 font-medium">Input Digits</div>
              </div>
              <div class="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                <div class="text-2xl mb-1">📝</div>
                <div class="text-xs text-gray-400 font-medium">Draft Notes</div>
              </div>
              <div class="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                <div class="text-2xl mb-1">🎯</div>
                <div class="text-xs text-gray-400 font-medium">Complete Grid</div>
              </div>
            </div>`);

  // Replace Gallery (no video/mp4, just a nice thumbnail block)
  html = html.replace(/<!-- Media Gallery -->[\s\S]*?<\/div>\s*?<\/div>\s*?<\/div>/, 
    `<!-- Media Gallery -->
            <div class="mt-8 flex overflow-x-auto gap-4 pb-4 snap-x gallery-scroll">
              <div class="shrink-0 w-[20rem] sm:w-[28rem] aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-lg group cursor-pointer relative bg-black/20 snap-center">
                <img src="../game/${newGame.folderName}/thumb.jpg" alt="${newGame.title} Gameplay Board" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>`);

  // Replace Inline Game ID script
  html = html.replace(/const gameId = "2048-NumStack";/, `const gameId = "${newGame.id}";`);
  html = html.replace(/const gameId = '2048-NumStack';/, `const gameId = '${newGame.id}';`);

  // Write new HTML file
  const newGameHtmlPath = path.join(ROOT_DIR, 'gameDistribution', 'Daily-Sudoku.html');
  fs.writeFileSync(newGameHtmlPath, html, 'utf8');
  console.log(`- Created game HTML file at ${newGameHtmlPath}`);

  // 3. Register game in gamesData.json
  const gamesDataPath = path.join(ROOT_DIR, 'assets', 'js', 'gamesData.json');
  if (fs.existsSync(gamesDataPath)) {
    const data = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
    
    // Check for duplicate
    const exists = data.gameTitles.some(g => g.id === newGame.id);
    if (!exists) {
      const entry = {
        id: newGame.id,
        gameTitle: newGame.title,
        gameUrl: `gameDistribution/${newGame.folderName}.html`,
        thumbnailUrl: `game/${newGame.folderName}/thumb.jpg`,
        categories: newGame.categories,
        tags: newGame.tags,
        series: newGame.series,
        description: newGame.description
      };
      data.gameTitles.push(entry);
      fs.writeFileSync(gamesDataPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`- Registered game in gamesData.json.`);
    } else {
      console.log(`- Game already registered in gamesData.json.`);
    }
  }

  // 4. Update sitemap.xml
  const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const locStr = `<loc>https://epicgameshub.com/gameDistribution/${newGame.folderName}.html</loc>`;
    if (!sitemap.includes(locStr)) {
      const insertIdx = sitemap.indexOf('</urlset>');
      if (insertIdx !== -1) {
        const dateStr = new Date().toISOString().split('T')[0];
        const newUrlBlock = `  <url>
    <loc>https://epicgameshub.com/gameDistribution/${newGame.folderName}.html</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
        sitemap = sitemap.substring(0, insertIdx) + newUrlBlock + sitemap.substring(insertIdx);
        fs.writeFileSync(sitemapPath, sitemap, 'utf8');
        console.log(`- Added URL block to sitemap.xml.`);
      }
    } else {
      console.log(`- URL already present in sitemap.xml.`);
    }
  }

  console.log(`Game addition completed successfully!`);
}

run();
