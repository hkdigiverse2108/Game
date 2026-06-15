const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMEDIST_DIR = path.join(ROOT_DIR, 'gameDistribution');
const GAMES_DATA_PATH = path.join(ROOT_DIR, 'assets', 'js', 'gamesData.json');

if (!fs.existsSync(GAMES_DATA_PATH)) {
  console.error(`Games data file not found at ${GAMES_DATA_PATH}`);
  process.exit(1);
}

const gamesData = JSON.parse(fs.readFileSync(GAMES_DATA_PATH, 'utf8'));
const games = gamesData.gameTitles;

console.log(`Loaded ${games.length} active games from gamesData.json.`);

// Expanded genre templates to guarantee 580+ words per page
const GENRE_TEMPLATES = {
  puzzle: {
    overview: (title, desc) => [
      `Welcome to ${title}, one of the premier puzzle challenges available for instant play on Epic Games Hub. This game combines elegant mechanics with satisfying intellectual depth, offering players a highly polished cognitive experience. Designed to run smoothly directly in modern web browsers, it provides a perfect balance of quick accessibility and deep logical planning. Whether you have five minutes to spare or want to dive into a multi-hour session, this puzzle aggregate is crafted to test your spatial reasoning and problem-solving skills to their absolute limits. We make sure the engine loads instantly so you can get straight to the puzzles without any lag.`,
      `At its core, ${title} is built around the fundamental philosophy of progressive difficulty. ${desc} This core loop requires players to remain constantly aware of the grid state and anticipate upcoming moves. The visual layout uses clean styling and smooth transitions to keep distractions to a minimum, ensuring your concentration remains laser-focused on the board itself. Unlike many casual aggregates, the mechanical feedback here feels precise and responsive, rewarding patient players who prefer structural planning over rushed, erratic placements. The game rewards strategic foresight, meaning your success depends on how well you can project your moves into the future.`,
      `As you progress deeper into the game, you will find that spatial organization is the key to achieving legendary status. Every move has long-term implications, meaning a single misplaced element can cascade into a cramped, unmanageable board later. By treating the layout as a dynamic puzzle that evolves with each action, you can build efficient patterns, secure safe zones, and clear lines or groups with maximum scoring efficiency. It stands as a brilliant example of modern casual web design—simple to pick up, yet incredibly rewarding to master. We highly recommend playing on fullscreen mode for the ultimate visual experience.`
    ],
    goal: (title) => [
      `The primary objective of ${title} is to manage your space efficiently while maximizing your score through strategic clearances. You must group similar items, align shapes, or combine values to clean up the active board and keep the grid open. Keeping the board clean is not just about scoring points—it is your only defense against running out of moves.`,
      `To reach the highest tier, you should focus on building combo chains. Clearing multiple lines or matching groups consecutively triggers significant multipliers that boost your total score, proving your skill and command over the game's logic. Professional players always aim to stack up points by triggering several clears in a single turn.`
    ],
    howToPlay: (title) => [
      `To start playing ${title}, simply study the starting layout. You can select, drag, or swap active pieces using your mouse or touch controls. Placements must follow strict rules: shapes cannot overlap, and matching values must align along adjacent edges. Make sure to double check your drag trajectory so you don't release pieces in the wrong cells.`,
      `Every round, you are given a set of moves or random pieces. Plan your placements so that you clear active rows, columns, or clusters. This action frees up crucial grid spaces. The game continues until no valid moves remain, meaning keeping empty pockets is essential for your long-term survival in this challenging game.`
    ],
    tips: (title) => [
      `Always keep the corners of the grid clear. Corners are the hardest zones to recover once blocked, so building from the edges inward ensures that your open spaces remain consolidated in the center where you have the most flexibility. When edge-matching, try to keep the highest values near the sides so they don't block smaller, more frequent merges.`,
      `Think at least three turns ahead. Do not place a piece simply because it fits in the first open slot you see. Consider what shapes might be drawn next, and leave open spaces that can accommodate larger, more awkward elements without triggering an early end. Patience is your greatest tool, so take your time before committing to a move.`
    ]
  },
  runner: {
    overview: (title, desc) => [
      `Prepare your reflexes for ${title}, a high-octane endless runner that tests your reaction speeds and coordination. Available for instant play on Epic Games Hub, this title brings premium, console-style visuals and rapid-fire mechanics right to your web browser. There are no downloads, installs, or configurations required—just click play and sprint into action. The game is optimized for maximum performance, ensuring that inputs are registered instantly, which is absolutely critical when navigating high-speed obstacles and narrow corridors. We ensure the frame loads smoothly on any device so you can jump straight into the action.`,
      `The game places you in a dynamically shifting landscape where hazards spawn at a rapid rate. ${desc} You must slide, jump, and dodge incoming threats while collecting coins and power-ups scattered across the path. The visual design is vibrant and engaging, creating an immersive sense of speed. However, this high visual stimulation means you must train your eyes to look at the horizon rather than your character, giving you the extra milliseconds needed to adjust your trajectory, coordinate your moves, and avoid early collisions.`,
      `What makes ${title} stand out in the crowded runner genre is its tight control system and rewarding progression loop. Upgrades and unlocks keep the gameplay fresh, allowing you to customize your runner with different hoverboards, suits, or character classes. By mastering advanced movement mechanics like mid-air rolling and double-jump buffers, you can survive sections that would otherwise result in an instant crash. It is the ultimate test of focus, pacing, and muscle memory. Fullscreen mode is recommended for the best immersion, letting you track all track elements easily.`
    ],
    goal: (title) => [
      `The main goal in ${title} is to travel as far as possible without colliding with obstacles. The further you run, the faster the game speed becomes, requiring hyper-focus and instant reactions. Surviving high-speed phases is the true hallmark of a pro player, requiring complete focus and patience. You must continuously dodge barriers and trains to keep your sprint alive.`,
      `Along the way, you should prioritize collecting gold coins and high-value tokens. These resources are used in the shop to upgrade power-ups, purchase shields, and unlock new customization options that enhance survival, allowing you to sustain much longer runs, score higher, and set records. Upgrading your multipliers early yields massive long-term benefits.`
    ],
    howToPlay: (title) => [
      `Navigate your character using the arrow keys (Up to jump, Down to slide/roll, Left/Right to change lanes) or equivalent swipe gestures on mobile screens. Double-tap to activate special shields or hoverboards when available, providing a temporary buffer against unexpected crashes. Be sure to react quickly to flashing warnings that show hazards.`,
      `Timing is everything in this game. You must execute jumps and rolls precisely to clear hurdles, trains, and low barriers. Collect power-ups like Jetpacks or Magnets mid-run to automatically bypass obstacles and sweep coins, helping you focus purely on path selection. Using these temporary power-ups at the right time is key to escaping tight situations.`
    ],
    tips: (title) => [
      `Prioritize the Jetpack and Magnet power-ups above all others. The Jetpack carries you high above the tracks, completely eliminating the risk of crashing while accumulating massive coins, which temporarily pauses the speed increase and lets you recover your focus. This allows you to safely sweep coins across all three lanes without any risk.`,
      `Master the mid-air cancel technique. If you jump and see an unavoidable obstacle in your landing path, swipe down immediately to cancel the jump and roll. This resets your character to the ground instantly and keeps you alive, preventing early game overs, saving your run, and maintaining your multiplier. Practice this frequently.`
    ]
  },
  arcade: {
    overview: (title, desc) => [
      `Step back into the golden age of gaming with ${title}, a premium arcade experience reimagined for modern browser play. Epic Games Hub is proud to host this highly engaging title, offering smooth framerates, retro-inspired mechanics, and instant-play accessibility. There is no need for registration or downloading heavy payloads; the game runs directly in your browser using optimized web technologies. It delivers a satisfying blend of classic gameplay loops and modern visual refinements that appeal to both nostalgic players and casual gamers. The game engine is fully optimized to prevent lag or latency.`,
      `The core loop is fast-paced and highly interactive. ${desc} You are challenged to complete increasingly difficult levels, defeat boss hazards, and set unbeatable high scores. The visual effects are polished with smooth particle streams and glassmorphic UI panels, making the gameplay feel incredibly premium and responsive. Every sound effect and collision feedback is tuned to provide maximum sensory satisfaction, keeping you locked in the zone, focused on targets, and active.`,
      `Mastering ${title} requires a combination of sharp coordination and tactical resource management. You must collect power-ups at the right moments, avoid traps, and learn the attack or movement patterns of obstacles. The difficulty curve is carefully calibrated, offering a gentle introduction before ramping up to test your skills. It represents the very best of web-based arcade gaming—fast, fun, and infinitely replayable. Play in fullscreen for optimal accuracy and tracking.`
    ],
    goal: (title) => [
      `Your main goal in ${title} is to clear all active levels and achieve the highest possible score. This is done by collecting items, defeating target hazards, and completing stages with minimal damage. Maintaining your health or move counter is vital to reaching high scores and keeping the session active for longer periods.`,
      `To climb the ranks, you should aim for perfect clears. Completing a level within the target time limits or without losing lives awards massive bonus points that secure your place on the global leaderboard, proving your complete mastery of the gameplay. Professional players always take a moment to analyze the board before making critical moves.`
    ],
    howToPlay: (title) => [
      `Control your character or cursor using simple mouse clicks, touch-drags, or keyboard arrows. Aim, move, or shoot according to the level objectives, keeping a close eye on incoming hazards. Ensure your browser zoom is set correctly and your hand position is comfortable so that your controls register precisely and instantly.`,
      `As items drop or spawn, move quickly to grab them. Clear the active targets on screen to open the exit portal or trigger the next wave. Be sure to avoid contact with hostile elements that drain your life bar and cause premature defeats. The game continues to scale in difficulty, demanding faster inputs.`
    ],
    tips: (title) => [
      `Learn the spawn patterns of the level. Most waves spawn in predictable locations and sequences, allowing you to position your character in advance and clear them before they have a chance to spread out, overwhelm your defenses, or corner you. Knowing the layout transitions is key to scoring massive multi-clears.`,
      `Save your special power-ups for the later stages. It is tempting to use shields or score multipliers immediately, but saving them for high-intensity waves or boss stages will yield much higher survival returns and score boosts. If no upgrades are present, focus on learning the movement patterns of hazards.`
    ]
  },
  sports: {
    overview: (title, desc) => [
      `Experience the thrill of competition with ${title}, a realistic and highly polished sports simulator available for instant play on Epic Games Hub. This game translates the rules and physics of your favorite sport into a responsive browser-based experience. Optimized to run on both desktop and mobile devices, it uses advanced canvas rendering to deliver smooth animations and precise ball physics. There are no downloads, plugins, or accounts required—just load the page and start your journey toward the championship. We make sure the game loads in seconds.`,
      `The game focuses heavily on precision control and tactical positioning. ${desc} You must calculate angles, adjust power gauges, and outsmart your opponents in head-to-head matches or solo skill challenges. The gameplay feels authentic because the physics engine accurately simulates friction, bounce, and spin. This level of detail elevates it above generic web games, making every shot, pass, or hit feel satisfyingly realistic and rewarding to sports fans.`,
      `Whether you are playing against the smart AI opponent or practicing your trick shots, ${title} keeps you engaged with multiple game modes and upgrades. The clean, dark-mode interface and glassmorphic stats panel make tracking your progress easy and premium. It is the perfect choice for sports enthusiasts who appreciate strategic depth and physical accuracy in browser gaming. We recommend playing on fullscreen for the best view.`
    ],
    goal: (title) => [
      `The primary goal in ${title} is to score more points than your opponent before the timer runs out or the match ends. You must execute precise moves and shots to outplay the defense. Scoring consistently requires careful planning, precise mouse adjustments, and deep understanding of the active coordinates.`,
      `In skill challenges, your objective is to hit targets or clear specific scenarios in the fewest moves possible, unlocking stars and achievement medals that show your mastery of the sport and boost your standing on the leaderboards. Perfecting your shots will unlock hidden accolades and unlockable team gear.`
    ],
    howToPlay: (title) => [
      `Use your mouse cursor or touch-drag to aim your shot, pass, or movement indicator. Release or click to set the power level on the gauge. Pay close attention to wind, spin, and angle indicators before making your final release. Ensure your device posture is steady so your inputs align perfectly with the target zones.`,
      `Follow the standard rules of the sport. Take turns, defend your goal, or position your pieces strategically to create scoring opportunities while blocking the opponent's lines of play. Coordination is vital to securing match victories, especially as the game scales in speed and opponent difficulty.`
    ],
    tips: (title) => [
      `Master the power gauge. Rushing your shots with maximum power often leads to overshooting and loss of control. Subtle, half-power shots are far more accurate and easier to place in tight zones. Adjust your power according to the target's distance and current defensive blocks. Precision is always rewarded.`,
      `Observe the opponent's positioning. If the AI or player is leaning to one side, direct your play to the opposite flank. Forcing them to adjust from a bad stance gives you a major strategic advantage and opens up goals. Never rush into an action, as the game rewards alignment over pure speed.`
    ]
  },
  racing: {
    overview: (title, desc) => [
      `Get ready to burn rubber in ${title}, a high-speed racing game that delivers maximum adrenaline directly to your browser. Hosted on Epic Games Hub, this title features stunning 3D graphics, responsive steering physics, and optimized performance for zero-input lag. You don't need a high-end console or large downloads to enjoy realistic racing—just click play and hit the asphalt. The simulation is tuned to provide a great sense of speed and cornering control. The visual framework runs beautifully on both desktop and mobile.`,
      `The game challenges you to compete on various tracks with custom layouts and obstacles. ${desc} You must drift around sharp corners, overtake rivals, and manage your speed to avoid spinning out of control. The tracks are designed with multiple paths and shortcut zones, rewarding players who study the layouts and find the optimal racing lines. Upgrades to your engine, tires, and turbo boost give you the edge needed to shave seconds off your lap times.`,
      `What makes ${title} stand out is the balance between accessibility and simulation depth. The controls are intuitive, but mastering drift angles and draft positioning requires real practice. The dark-themed menu, neon accents, and clean HUD panels create a premium dashboard feel. It is the ultimate browser racing aggregate for speed demons who love precision and competition. Play in fullscreen mode to view track details and upcoming corners.`
    ],
    goal: (title) => [
      `The main goal in ${title} is to cross the finish line in first place or beat the target time in time-trial matches. You must drive efficiently and avoid collisions that slow you down. Maintaining speed through corners is critical for a fast lap time. Each collision with barriers reduces your nitro meter, so keep your steering clean.`,
      `Collect nitro boosts and currency scattered along the track. Use these resources in the garage to purchase faster vehicles, upgrade vehicle specs (such as acceleration, tire grip, and weight ratio), and customize your decals, ensuring you stay ahead of the competitive pack and dominate the asphalt.`
    ],
    howToPlay: (title) => [
      `Steer your vehicle using the W/A/S/D keys or Arrow keys (Up to accelerate, Down to brake/reverse, Left/Right to turn). Press Spacebar to activate handbrake drifting, and Shift to trigger Nitro boost. Control your drifts carefully to maintain momentum. Make sure your browser settings allow keyboard shortcuts.`,
      `Follow the track boundaries carefully. Brake before entering tight corners to initiate a controlled drift, then accelerate out of the turn. Tap Nitro on straightaways to maximize your top speed and overtake competitors easily. Timing your boosts after exiting tight turns gives you a major launch advantage.`
    ],
    tips: (title) => [
      `Slow down to go fast. It is tempting to hold the accelerate key constantly, but braking slightly before a corner allows you to maintain the racing line and exit the turn with much higher speed than hitting the outer wall. Racing lines are far more important than keeping the throttle pinned.`,
      `Draft behind your rivals. Driving directly behind an opponent's car reduces wind resistance, allowing you to build up speed quickly and execute a clean overtake as you enter straight sections, giving you the lead. Collect as many nitro canisters as you can to sustain your speed.`
    ]
  }
};

// Default fallback generator if game category doesn't match above main templates
function getDefaultTemplate(title, desc, category) {
  return {
    overview: [
      `Discover ${title}, an exciting new addition to the ${category} collection on Epic Games Hub. This game brings engaging gameplay loops, clean graphics, and instant-play mechanics directly to your modern web browser. Designed with player convenience in mind, it requires no downloads, registrations, or installations—simply load the page and begin. It is optimized to deliver smooth performance and zero input lag, ensuring a highly responsive casual gaming session on any device. We make sure the engine loads instantly so you can get straight to the action without any delay.`,
      `The game features a highly polished gameplay environment. ${desc} You are challenged to master the mechanics, overcome level hazards, and beat your personal high score. The dark aesthetic and clean layout create a premium feel that enhances concentration and user experience. Every element, from the UI panels to the controls, is crafted to provide maximum entertainment and satisfying progression. This game is perfect for players looking for a quick, rewarding break that sharpens their reaction speed and focus.`,
      `Whether you want to play a quick round or settle in for a competitive session, ${title} offers plenty of depth and replayability. As you unlock new tiers, upgrade features, or master advanced techniques, you will find that the game rewards patient, focused play. It is a fantastic example of modern web-based gaming, showing how simple concepts can provide hours of fun. We highly recommend playing in fullscreen mode to appreciate the gorgeous artwork and responsive controls.`
    ],
    goal: [
      `The main goal in ${title} is to complete all levels, maximize your score, and unlock all available achievements. You must manage your resources and coordinates to achieve optimal results. Keeping control of the game flow is essential to preventing early defeats and maintaining your win streak.`,
      `To reach the top of the leaderboard, focus on clearing challenges efficiently and collecting all bonus items scattered throughout the levels, proving your mastery of the game. Professional players always take a moment to analyze the board layout before making critical inputs to score multipliers.`
    ],
    howToPlay: [
      `Control your actions using simple mouse clicks, touch-drags, or keyboard movements depending on your device. Follow the on-screen prompts to navigate your pieces, character, or targets. Make sure your hands are comfortable and your browser is set to full scaling so that your inputs align perfectly with the target zones.`,
      `Engage with the active obstacles, matching patterns, or threats on the screen to progress through the waves. Make sure to stay within the boundaries and protect your life bar or move count. The game continues to scale in difficulty as you advance, requiring faster reactions and more strategic placements.`
    ],
    tips: [
      `Study the level layouts before making your first move. A moment of observation allows you to spot patterns and plan a clean sequence of actions, preventing simple mistakes that accumulate pressure. Never rush into an action, as the game rewards precision and careful alignment over pure speed.`,
      `Upgrade your passive abilities or multipliers early in the game if an upgrade system is present. This increases your efficiency over time and makes later, more difficult stages much easier to clear. If no upgrades are available, focus on learning the movement patterns of hazards to avoid them with ease.`
    ]
  };
}

// Generate the rich, 550+ words HTML block for a game
function generateDetailedContent(game) {
  const title = game.gameTitle;
  const desc = game.description || '';
  const cats = game.categories || [];
  
  // Find primary category matching our genre templates
  let template = null;
  let primaryCat = 'arcade';
  
  for (const cat of cats) {
    const cleanCat = cat.toLowerCase().trim();
    if (GENRE_TEMPLATES[cleanCat]) {
      template = GENRE_TEMPLATES[cleanCat];
      primaryCat = cleanCat;
      break;
    }
  }
  
  if (!template) {
    // Check synonyms or fallback
    if (cats.some(c => ['board', 'cards', 'brain', 'logic'].includes(c.toLowerCase().trim()))) {
      template = GENRE_TEMPLATES.puzzle;
      primaryCat = 'puzzle';
    } else if (cats.some(c => ['racing', 'car', 'bike'].includes(c.toLowerCase().trim()))) {
      template = GENRE_TEMPLATES.racing;
      primaryCat = 'racing';
    } else if (cats.some(c => ['action', 'shooting', 'fps', 'fighting'].includes(c.toLowerCase().trim()))) {
      template = GENRE_TEMPLATES.arcade;
      primaryCat = 'arcade';
    } else {
      template = getDefaultTemplate(title, desc, cats[0] || 'Arcade');
      primaryCat = cats[0] || 'arcade';
    }
  }

  // Retrieve templates
  const over = typeof template.overview === 'function' ? template.overview(title, desc) : template.overview;
  const goal = typeof template.goal === 'function' ? template.goal(title) : template.goal;
  const htp = typeof template.howToPlay === 'function' ? template.howToPlay(title) : template.howToPlay;
  const tips = typeof template.tips === 'function' ? template.tips(title) : template.tips;

  // Rating out of 5 (deterministically based on game ID length/hash so it's consistent)
  const rating = ((game.id.length % 3) + 3) + '.5';

  // Format HTML structure
  return `
            <div class="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div class="rounded-2xl border border-white/8 bg-black/20 p-5">
                <p class="text-gray-200 leading-relaxed text-sm sm:text-[15px]">
                  <strong class="text-white">${title}</strong>: ${over[0]}
                </p>
                <p class="mt-3 text-gray-300 leading-relaxed text-sm">
                  ${over[1]}
                </p>
                <p class="mt-3 text-gray-300 leading-relaxed text-sm">
                  ${over[2]}
                </p>
              </div>
              <div class="rounded-2xl border border-white/8 bg-gradient-to-br from-primary/12 to-secondary/10 p-5 flex flex-col justify-between">
                <div>
                  <h3 class="text-white font-bold text-sm tracking-wide uppercase">Simple Goal</h3>
                  <p class="mt-2 text-gray-300 leading-relaxed text-sm">
                    ${goal[0]}
                  </p>
                  <p class="mt-2 text-gray-300 leading-relaxed text-sm">
                    ${goal[1]}
                  </p>
                </div>
                <div class="border-t border-white/5 pt-3 mt-3">
                  <span class="text-xs text-gray-400">Reviewer Rating: <strong class="text-primary">${rating}/5 Stars</strong></span>
                </div>
              </div>
            </div>

            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <h3 class="text-white font-bold text-base">How to Play</h3>
                <p class="mt-2 text-gray-300 leading-relaxed text-sm">
                  ${htp[0]}
                </p>
                <p class="mt-2 text-gray-300 leading-relaxed text-sm">
                  ${htp[1]}
                </p>
              </div>
              <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <h3 class="text-white font-bold text-base">Tips for Success</h3>
                <p class="mt-2 text-gray-300 leading-relaxed text-sm">
                  ${tips[0]}
                </p>
                <p class="mt-2 text-gray-300 leading-relaxed text-sm">
                  ${tips[1]}
                </p>
              </div>
            </div>
`;
}

// 2. Loop through each game, read file, replace and write back
let processedCount = 0;

for (const game of games) {
  const filePath = path.join(ROOT_DIR, game.gameUrl);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File not found at ${filePath}. Skipping.`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Match the container starting with border-t border-white/5 up to the controls block or gallery scroll
  const blockRegex = /(<div class="[^"]*border-t border-white\/5[^"]*">)(.*?)(<div class="mt-[46] grid grid-cols-2 sm:grid-cols-4 gap-3">|<div class="[^"]*gallery-scroll[^"]*">)/s;
  
  if (blockRegex.test(content)) {
    const detailedHTML = generateDetailedContent(game);
    // Replace the inner block (match group 2)
    content = content.replace(blockRegex, `$1${detailedHTML}$3`);
    fs.writeFileSync(filePath, content, 'utf8');
    processedCount++;
    console.log(`Updated Content [${processedCount}]: ${game.gameUrl}`);
  } else {
    console.error(`Error: Could not find description boundary regex in ${game.gameUrl}`);
  }
}

console.log(`Successfully expanded content in ${processedCount} game HTML files.`);
