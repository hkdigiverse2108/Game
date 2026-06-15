const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMEDIST_DIR = path.join(ROOT_DIR, 'gameDistribution');
const BLOG_DIR = path.join(ROOT_DIR, 'blog');

if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
}

// HTML templates
const BLOG_HOME_TEMPLATE = `<!doctype html>
<html lang="en" class="dark">
<head>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8278748118891475" crossorigin="anonymous"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gaming Blog - Epic Games Hub</title>
  <meta name="description" content="Read the latest gaming guides, tips, reviews, and news on Epic Games Hub. Master puzzle games, endless runners, and browser titles.">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="assets/css/style.css" rel="stylesheet" />
  <script src="assets/js/cookie-consent.js" defer></script>
</head>
<body class="bg-background text-white antialiased selection:bg-primary/30 selection:text-white">
  <div class="mouse-cursor cursor-outer"></div>
  <div class="mouse-cursor cursor-inner"></div>

  <!-- Navigation -->
  <nav class="fixed top-0 w-full z-50 glass shadow-md">
    <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <a href="index.html" aria-label="Home" class="flex items-center gap-3 cursor-pointer group shrink-0">
        <div class="relative w-10 h-10 rounded-full flex items-center justify-center transform transition duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-neon" style="background-color: white;">
          <img src="assets/images/logo.png" alt="" style="max-width: 85%; max-height: 85%; object-fit: contain;">
        </div>
        <span class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight hidden sm:block">Epic Games Hub</span>
      </a>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="pt-[140px] pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-[70vh]">
    <h1 class="text-4xl sm:text-5xl font-black text-white mb-4">Epic Gaming Blog</h1>
    <p class="text-gray-400 text-lg mb-10">Your hub for the best browser game strategies, tips, guides, and updates.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="blog-grid">
      <!-- Article Cards Dynamically Placed Here -->
      {cards}
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-black/50 border-t border-white/5 pt-16 pb-8">
    <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <div class="relative w-10 h-10 rounded-full flex items-center justify-center" style="background-color: white;">
              <img src="assets/images/logo.png" alt="" style="max-width: 85%; max-height: 85%; object-fit: contain;">
            </div>
            <span class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight">Epic Games Hub</span>
          </div>
          <p class="text-gray-300 max-w-sm mb-6 leading-relaxed">Epic Games Hub is your ultimate destination for free online games. We test and add new thrilling games daily to keep you entertained without any downloads!</p>
          <div class="flex gap-4">
            <a href="https://www.facebook.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Facebook" class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary border border-white/5 hover:border-primary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="https://www.instagram.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Instagram" class="w-10 h-10 rounded-full bg-white/5 hover:bg-secondary border border-white/5 hover:border-secondary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h3 class="text-white font-bold mb-4 tracking-wide">About Epic Games Hub</h3>
          <ul class="space-y-3 text-gray-400 font-medium text-sm">
            <li><a href="about.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> About Us</a></li>
            <li><a href="blog.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Blog</a></li>
            <li><a href="developers.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Developers</a></li>
            <li><a href="faq.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> FAQ</a></li>
            <li><a href="contact.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Contact us</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-white font-bold mb-4 tracking-wide">Legal Information</h3>
          <ul class="space-y-3 text-gray-400 font-medium text-sm">
            <li><a href="privacy.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Privacy Policy</a></li>
            <li><a href="terms.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Terms of Service</a></li>
            <li><a href="cookie-policy.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Cookie Policy</a></li>
            <li><a href="disclaimer.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Disclaimer</a></li>
            <li><a href="gdpr.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> GDPR</a></li>
            <li><a href="dmca.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> DMCA</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 font-medium pb-4">
        <p>&copy; 2026 Epic Games Hub Games. All rights reserved. Games provided under licence via Game Distribution. All trademarks belong to their respective owners.</p>
      </div>
    </div>
  </footer>
  <script src="assets/js/index.js"></script>
</body>
</html>`;

const ARTICLE_TEMPLATE = `<!doctype html>
<html lang="en" class="dark">
<head>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8278748118891475" crossorigin="anonymous"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} - Epic Games Hub Blog</title>
  <meta name="description" content="{summary}">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="../assets/css/style.css" rel="stylesheet" />
  <script src="../assets/js/cookie-consent.js" defer></script>
</head>
<body class="bg-background text-white antialiased selection:bg-primary/30 selection:text-white">
  <div class="mouse-cursor cursor-outer"></div>
  <div class="mouse-cursor cursor-inner"></div>

  <!-- Navigation -->
  <nav class="fixed top-0 w-full z-50 glass shadow-md">
    <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <a href="../index.html" aria-label="Home" class="flex items-center gap-3 cursor-pointer group shrink-0">
        <div class="relative w-10 h-10 rounded-full flex items-center justify-center transform transition duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-neon" style="background-color: white;">
          <img src="../assets/images/logo.png" alt="" style="max-width: 85%; max-height: 85%; object-fit: contain;">
        </div>
        <span class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight hidden sm:block">Epic Games Hub</span>
      </a>
      <a href="../blog.html" class="px-5 py-2 rounded-2xl border font-bold text-sm bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white transition-all">Back to Blog</a>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="pt-[140px] pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[70vh]">
    <div class="mb-6 font-sans">
      <span class="px-3 py-1 text-xs font-bold uppercase rounded-full bg-primary/20 text-primary border border-primary/30">{category}</span>
      <span class="text-gray-500 text-sm ml-3 font-semibold">{read_time}</span>
    </div>
    <h1 class="text-3xl sm:text-5xl font-black text-white leading-tight mb-8 font-sans">{title}</h1>
    
    <div class="prose prose-invert prose-indigo max-w-none text-gray-300 leading-relaxed text-base sm:text-lg space-y-6 font-sans">
      {body_html}
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-black/50 border-t border-white/5 pt-16 pb-8">
    <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <div class="relative w-10 h-10 rounded-full flex items-center justify-center" style="background-color: white;">
              <img src="../assets/images/logo.png" alt="" style="max-width: 85%; max-height: 85%; object-fit: contain;">
            </div>
            <span class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight">Epic Games Hub</span>
          </div>
          <p class="text-gray-300 max-w-sm mb-6 leading-relaxed font-sans">Epic Games Hub is your ultimate destination for free online games. We test and add new thrilling games daily to keep you entertained without any downloads!</p>
          <div class="flex gap-4">
            <a href="https://www.facebook.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Facebook" class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary border border-white/5 hover:border-primary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="https://www.instagram.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Instagram" class="w-10 h-10 rounded-full bg-white/5 hover:bg-secondary border border-white/5 hover:border-secondary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h3 class="text-white font-bold mb-4 tracking-wide font-sans">About Epic Games Hub</h3>
          <ul class="space-y-3 text-gray-400 font-medium text-sm font-sans">
            <li><a href="../about.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> About Us</a></li>
            <li><a href="../blog.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Blog</a></li>
            <li><a href="../developers.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Developers</a></li>
            <li><a href="../faq.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> FAQ</a></li>
            <li><a href="../contact.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Contact us</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-white font-bold mb-4 tracking-wide font-sans">Legal Information</h3>
          <ul class="space-y-3 text-gray-400 font-medium text-sm font-sans">
            <li><a href="../privacy.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Privacy Policy</a></li>
            <li><a href="../terms.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Terms of Service</a></li>
            <li><a href="../cookie-policy.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Cookie Policy</a></li>
            <li><a href="../disclaimer.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Disclaimer</a></li>
            <li><a href="../gdpr.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> GDPR</a></li>
            <li><a href="../dmca.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> DMCA</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 font-medium pb-4 font-sans">
        <p>&copy; 2026 Epic Games Hub Games. All rights reserved. Games provided under licence via Game Distribution. All trademarks belong to their respective owners.</p>
      </div>
    </div>
  </footer>
  <script src="../assets/js/index.js"></script>
</body>
</html>`;

function generate_article_body(slug, title) {
  if (slug === 'solitaire-classic-guide') {
    return `
    <p class="lead text-gray-200 font-semibold mb-6">Solitaire, specifically the Klondike variation, is one of the most popular and enduring card games in history, now available to play instantly on Epic Games Hub. While it is often played for relaxation, winning consistently requires a deep understanding of card probability, sequence planning, and layout management. In this masterclass guide, we'll outline the complete rules, advanced strategies, and professional tips to dramatically increase your win rate.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">1. The Fundamentals of Klondike Solitaire</h2>
    <p class="mb-4">To win at Solitaire, you must build four foundation piles (one for each suit) in ascending order from Ace to King: Ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, Jack, Queen, and King. The board itself consists of the tableau (seven piles of cards with the top card face-up), the stock pile (face-down cards used for drawing), and the waste pile (where drawn cards are placed).</p>
    <p class="mb-4">Cards within the tableau can be moved and stacked in descending order with alternating colors (e.g., a red 6 on top of a black 7). Any empty space created in the tableau can only be filled by a King, or a sequence starting with a King. Understanding this constraint is crucial for layout management.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">2. The Strategic Playbook: 5 Golden Rules</h2>
    <ul class="list-disc pl-6 mb-4 space-y-2">
      <li><strong>Examine the Tableau First:</strong> Before drawing your very first card from the stock pile, carefully analyze the tableau. If you have any immediate moves available to reveal face-down cards or move cards to the foundations, execute them first. This maximizes your starting options.</li>
      <li><strong>Prioritize the Largest Columns:</strong> When deciding which columns to clear or move, always target the columns containing the most face-down cards. Revealing these hidden cards is the single most important factor in keeping your run alive.</li>
      <li><strong>Do Not Empty Tableau Slots Prematurely:</strong> Clearing a column completely creates an empty space. However, unless you have a King ready to occupy that slot, emptying it is a mistake. It reduces your sorting space. Only empty a column when a King is waiting to move into it.</li>
      <li><strong>Avoid Moving Cards to Foundations Too Quickly:</strong> While it is satisfying to move cards to the foundation piles, doing so can trap other cards. For instance, if you move both black 2s to the foundations, you can no longer stack red Aces or red 3s in the tableau. Keep cards on the tableau as long as they can help you build sequences.</li>
      <li><strong>Play from the Waste Pile Wisely:</strong> The waste pile represents your external reserve. When you have a choice between playing a card from the tableau or playing a card from the waste pile, always choose the tableau card. Clearing the tableau reveals hidden cards; clearing the waste pile does not.</li>
    </ul>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">3. Summary Verdict</h2>
    <p class="mb-4">Classic Solitaire is a game of patience, logic, and foresight. By prioritizing hidden cards, managing empty slots, and holding back cards from foundations when necessary, you can turn a game of chance into a game of skill. Shuffle up, play smart, and watch your win-rate soar on Epic Games Hub!</p>
    `;
  } else if (slug === 'tic-tac-toe-strategy') {
    return `
    <p class="lead text-gray-200 font-semibold mb-6">Tic Tac Toe is a timeless game of strategy and logic. Under perfect play from both participants, Tic Tac Toe will always end in a draw. However, when playing against casual players or AI, understanding the mathematical decision trees of the grid allows you to exploit minor mistakes and secure a victory. In this guide, we'll break down the exact opening traps and defensive blocks for both Player 1 and Player 2.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">1. Opening Strategy as Player 1 (The Corner Trap)</h2>
    <p class="mb-4">If you go first, the absolute best opening move is to play in a <strong>corner square</strong>. A corner start is mathematically superior to a center start. Starting in the corner gives your opponent the most opportunities to make a critical mistake. If they do not respond by playing in the center, you can force an unavoidable win.</p>
    <p class="mb-4">If they play on any side square (not the center), you can secure a win by playing in another corner on your second turn. This creates a double-threat (two paths of two) that cannot be blocked simultaneously. For example, if you place an X in the top-left corner, and they place an O in the top-middle, you should place an X in the bottom-left or top-right, creating a dual threat.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">2. Defensive Strategy as Player 2 (The Center Block)</h2>
    <p class="mb-4">If your opponent plays first and goes in the corner, you must immediately play in the <strong>center square</strong>. Playing anywhere else is an instant loss under perfect play. The center square is the only position that blocks the corner opening traps.</p>
    <p class="mb-4">If they start in the center, your best response is to play in a <strong>corner square</strong>. This limits their diagonal paths and gives you the highest chance of forcing a draw or catching them off-guard in the corners on subsequent turns.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">3. Decision Matrix for Perfect Play</h2>
    <table class="w-full text-left border-collapse border border-white/10 my-6 text-sm">
      <thead>
        <tr class="bg-white/5">
          <th class="p-3 border border-white/10 font-bold">Turn order</th>
          <th class="p-3 border border-white/10 font-bold">Opponent's Move</th>
          <th class="p-3 border border-white/10 font-bold">Your Optimal Move</th>
          <th class="p-3 border border-white/10 font-bold">Outcome</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-3 border border-white/10 text-emerald-400 font-bold">Player 1 (First)</td>
          <td class="p-3 border border-white/10">None</td>
          <td class="p-3 border border-white/10 text-emerald-400 font-bold">Corner Square</td>
          <td class="p-3 border border-white/10">Forces opponent to play Center or lose.</td>
        </tr>
        <tr class="bg-white/[0.02]">
          <td class="p-3 border border-white/10 text-indigo-400 font-bold">Player 2 (Second)</td>
          <td class="p-3 border border-white/10">Corner</td>
          <td class="p-3 border border-white/10 text-indigo-400 font-bold">Center Square</td>
          <td class="p-3 border border-white/10">Prevents immediate traps, aims for Draw.</td>
        </tr>
        <tr>
          <td class="p-3 border border-white/10 text-purple-400 font-bold">Player 2 (Second)</td>
          <td class="p-3 border border-white/10">Center</td>
          <td class="p-3 border border-white/10 text-purple-400 font-bold">Corner Square</td>
          <td class="p-3 border border-white/10">Blocks diagonal paths, aims for Draw.</td>
        </tr>
      </tbody>
    </table>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">4. Summary Verdict</h2>
    <p class="mb-4">Tic Tac Toe is a game of pattern recognition. By memorizing the corner-opening traps and the mandatory center-response block, you will become completely invincible at Tic Tac Toe. Challenge your friends or test your skills against the AI on Epic Games Hub!</p>
    `;
  } else if (slug === 'carrom-board-guide') {
    return `
    <p class="lead text-gray-200 font-semibold mb-6">Carrom is a beloved traditional tabletop game of strike-and-pocket, popular across South Asia and the Middle East, and now available to play digitally on Epic Games Hub. Often called "finger billiards," Carrom requires precision, spatial angles, and tactical foresight. In this beginner-friendly guide, we cover the essential rules, shooting styles, and pro tips to help you master the board.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">1. The Objective and Board Layout</h2>
    <p class="mb-4">A standard Carrom board consists of 9 white carrom men (worth 10 points or designated for Player 1), 9 black carrom men (worth 5 points or designated for Player 2), 1 red Queen (worth 3 points or a special bonus), and 1 larger, heavier Striker. The objective is to strike and pocket your designated color carrom men into the corner pockets before your opponent does.</p>
    <p class="mb-4">The Queen is the most valuable piece on the board. You can pocket the Queen at any point after pocketing your first piece, but she must be "covered"—meaning you must pocket another of your designated pieces immediately on the next shot. If you fail to cover the Queen, she returns to the center of the board.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">2. Striking Techniques and Finger Styles</h2>
    <p class="mb-4">Mastering the physical strike is key to accuracy. Here are the three primary finger flick styles used by top players:</p>
    <ul class="list-disc pl-6 mb-4 space-y-2">
      <li><strong>Index Finger Flick:</strong> Place your hand flat on the board behind the baseline. Rest the index finger against your thumb, and flick it forward using the tension to strike the center of the Striker. This style offers the highest accuracy for straight shots.</li>
      <li><strong>Thumb Flick (Thumb Shot):</strong> Place your thumb behind the Striker and use your index or middle finger to hold it back, releasing the thumb forward like a spring. This style is excellent for generating high power and breaking the cluster.</li>
      <li><strong>Scissors Grip:</strong> Rest your hand sideways and use your index and middle fingers in a scissors-pinching motion to flick the striker. This style is highly comfortable for angled shots and cut shots.</li>
    </ul>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">3. Pro Tips for Digital Dominance</h2>
    <ul class="list-disc pl-6 mb-4 space-y-2">
      <li><strong>Control Your Speed:</strong> Pocketing pieces does not always require maximum force. Gentle tap shots are far more controllable and prevent the Striker from bouncing off the board or falling into a pocket (a foul).</li>
      <li><strong>Utilize the Board Borders (Rebound Shots):</strong> If a direct path is blocked, use the wooden borders of the board to rebound the Striker at a 45-degree angle to hit targets from behind.</li>
      <li><strong>Clear Obstacles First:</strong> Focus on pocketing the pieces that are near the pockets first. This frees up the board and prevents your opponent from using them as defensive shields.</li>
    </ul>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">4. Summary Verdict</h2>
    <p class="mb-4">Digital Carrom Master on Epic Games Hub combines the physics of the traditional board game with smooth, intuitive browser controls. By practicing your flick styles and focusing on the Queen cover rule, you can dominate matches easily. Jump in and start striking!</p>
    `;
  } else if (slug === 'checkers-legend-strategy') {
    return `
    <p class="lead text-gray-200 font-semibold mb-6">Checkers, also known as draughts, is a classic board game that tests your tactical positioning and piece exchange strategy. While the rules are simple—move diagonally and jump over opponent pieces to capture them—playing at a high level requires anticipating your opponent's responses and maintaining solid board control. In this guide, we reveal the core openings, defensive formations, and end-game strategies to win at Checkers Legend on Epic Games Hub.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">1. The Golden Rule of Checkers: Control the Center</h2>
    <p class="mb-4">A common mistake made by beginners is moving all their pieces along the edges (the flanks) of the board to keep them safe from capture. While the edge squares are safe, they offer no mobility. A piece on the edge can only move in one direction. To win, you must control the **center eight squares** of the board. Controlling the center gives your pieces maximum mobility, allowing them to advance, block, and jump in multiple directions.</p>
    <p class="mb-4">Keep your pieces in a tight, supporting cluster. Unsupported pieces that advance alone are easy targets for your opponent's jumping traps.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">2. Keeping the Back Row Intact</h2>
    <p class="mb-4">Your back row (the four squares closest to you) is your primary defense. As long as these pieces remain on their starting squares, your opponent cannot crown any of their pieces as Kings. Keep your back row intact as long as possible. Only move them when you have no other viable moves or when you need to block an opponent's piece that has broken through your mid-board lines.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">3. The Power of Kings</h2>
    <p class="mb-4">When a piece reaches the opposite end of the board, it is crowned a **King**. Kings can move and jump diagonally both forward and backward, making them incredibly powerful. Prioritize advancing at least one or two pieces to the back row early to crown them. A single King can dominate the board, hunt down opposing pieces, and block escape routes.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">4. Sacrificing for Position (The Forced Capture)</h2>
    <p class="mb-4">In checkers, captures are mandatory. If a jump is available, the player must take it. You can use this rule to your advantage by intentionally sacrificing a piece. By placing one of your pieces in a position where your opponent is forced to jump it, you can pull their piece out of position, opening up a path for a double-jump or crowning a King of your own. Always calculate the exchanges before making a move.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">5. Summary Verdict</h2>
    <p class="mb-4">Checkers Legend is a battle of positioning and forced moves. By controlling the center, protecting your back row, and planning smart piece sacrifices, you can defeat any opponent. Start a match on Epic Games Hub and test your checkers mastery today!</p>
    `;
  } else if (slug === 'wood-block-strategy') {
    return `
    <p class="lead text-gray-200 font-semibold mb-6">Wood Block is a deceptively simple grid puzzle game available on Epic Games Hub. To score high and prevent the board from filling up, players must master block placement, spatial clearance, and long-term grid strategy. In this article, we cover the exact strategies, tips, and techniques to help you beat your high score and maintain a clean board.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">1. The Golden Rule of Wood Block: Prevent Isolation</h2>
    <p class="mb-4">Unlike games like Tetris where blocks fall dynamically, Wood Block allows you to place shapes anywhere on a 10x10 grid. The greatest threat to your run is block isolation—leaving empty single squares scattered around the grid. These tiny gaps are extremely difficult to fill because single-square pieces are rarely drawn. Always place blocks flush against existing shapes to create solid, contiguous areas.</p>
    <p class="mb-4">To prevent isolation, prioritize filling corners and edges first. Building from the corners inward ensures that your open space remains consolidated in the center, giving you maximum flexibility when large, awkward shapes (like the 3x3 square or the 5-block straight line) are drawn.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">2. Spatial Analysis and Board Management</h2>
    <p class="mb-4">Every round, you are presented with three random blocks. You must place all three before receiving the next set. This mechanic is critical: <strong>always analyze all three shapes before placing a single block.</strong> Plan your order of placement to ensure they don't block each other. A common mistake is placing the first two blocks in a way that leaves no valid room for the third, resulting in an immediate game over.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">3. Clearing Rows vs. Columns</h2>
    <p class="mb-4">Clearing a line removes all blocks in that line, freeing up space. While clearing single lines keeps you alive, the real point boosts come from <strong>combos</strong>—clearing multiple rows or columns simultaneously. Let's look at the risk-reward profile of different line clearing strategies:</p>
    <table class="w-full text-left border-collapse border border-white/10 my-6 text-sm">
      <thead>
        <tr class="bg-white/5">
          <th class="p-3 border border-white/10 font-bold">Strategy</th>
          <th class="p-3 border border-white/10 font-bold">Complexity</th>
          <th class="p-3 border border-white/10 font-bold">Reward Level</th>
          <th class="p-3 border border-white/10 font-bold">Risk Factor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-3 border border-white/10 text-emerald-400 font-bold">Single-Line Clear</td>
          <td class="p-3 border border-white/10">Low</td>
          <td class="p-3 border border-white/10 text-gray-400">Low Points</td>
          <td class="p-3 border border-white/10 text-emerald-400 font-bold">Very Low</td>
        </tr>
        <tr class="bg-white/[0.02]">
          <td class="p-3 border border-white/10 text-yellow-400 font-bold">Double Combo</td>
          <td class="p-3 border border-white/10">Medium</td>
          <td class="p-3 border border-white/10 text-yellow-400 font-bold">Medium Points</td>
          <td class="p-3 border border-white/10 text-yellow-400 font-bold">Low</td>
        </tr>
        <tr>
          <td class="p-3 border border-white/10 text-red-400 font-bold">Triple / Quad Combo</td>
          <td class="p-3 border border-white/10">High</td>
          <td class="p-3 border border-white/10 text-red-400 font-bold">Massive Points</td>
          <td class="p-3 border border-white/10 text-red-400 font-bold">High</td>
        </tr>
      </tbody>
    </table>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">4. Top 5 Tips for Grid Dominance</h2>
    <ul class="list-disc pl-6 mb-4 space-y-2">
      <li><strong>Leave Room for the 3x3:</strong> The 3x3 square is the largest block in the game. Always maintain at least one 3x3 open space on your board, otherwise a sudden draw of this block will instantly end your game.</li>
      <li><strong>Clear Lines Early:</strong> Don't hoard blocks to try to build a massive 5-line combo if your board is already 70% full. Clear lines early to reduce grid pressure.</li>
      <li><strong>Manage Your Colors:</strong> While block colors are aesthetic, keeping similar shapes grouped together makes it easier to recognize empty patterns visually.</li>
      <li><strong>Think Ahead:</strong> Always assume the next set of blocks will contain at least one awkward corner piece. Keep your edges free of jagged shapes.</li>
      <li><strong>Stay Calm:</strong> There is no time limit in Wood Block. Take your time to study the grid and find the absolute best fit for your shapes.</li>
    </ul>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">5. Verdict</h2>
    <p class="mb-4">Wood Block is a test of patience and spatial awareness. By avoiding single-square gaps, planning placements in sets of three, and keeping space open for large shapes, you can achieve incredibly high scores. It's the perfect relaxing puzzle game that trains your brain with every move!</p>
    `;
  } else {
    return `
    <p class="lead text-gray-200 font-semibold mb-6">Welcome to our featured blog post about <strong>{title}</strong>. In this article, our team of gaming analysts explores the key strategies, design philosophies, and updates surrounding this popular title on Epic Games Hub.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">1. Introduction to the Topic</h2>
    <p class="mb-4">The landscape of browser-based gaming is changing rapidly in 2026. High-quality web technologies like WebAssembly, HTML5, and Canvas render console-quality experiences without any lag, download times, or login requirements. This makes titles in this category highly popular among casual and core gamers alike who want to jump into action immediately.</p>
    <p class="mb-4">Understanding the core mechanics of your favorite games is the first step to mastering them. Whether you are dealing with physics-based puzzles, endless runners, or strategic multiplayer boards, a solid theoretical understanding of the gameplay loop is crucial to setting high scores and outplaying your competitors.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">2. Core Mechanics Analysis</h2>
    <p class="mb-4">When we look at the primary interface of these games, the design emphasizes accessibility. Most browser games utilize mouse-clicks, touch-drags, or basic keyboard arrows. This low barrier of entry, however, hides a high skill ceiling. For instance, in racing simulations, understanding cornering angles and braking distances separates casual players from top-tier speedrunners. Similarly, in match-3 puzzle layouts, recognizing matches of 4 or 5 blocks early lets you trigger massive chain combos that clear entire screens.</p>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">3. Comparative Performance Analysis</h2>
    <table class="w-full text-left border-collapse border border-white/10 my-6 text-sm">
      <thead>
        <tr class="bg-white/5">
          <th class="p-3 border border-white/10 font-bold">Gameplay Aspect</th>
          <th class="p-3 border border-white/10 font-bold">Casual Mode</th>
          <th class="p-3 border border-white/10 font-bold">Pro Mode</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-3 border border-white/10 text-emerald-400 font-bold">Reaction Speed</td>
          <td class="p-3 border border-white/10">Standard reaction (~250ms)</td>
          <td class="p-3 border border-white/10">Anticipatory action (&lt;150ms)</td>
        </tr>
        <tr class="bg-white/[0.02]">
          <td class="p-3 border border-white/10 text-indigo-400 font-bold">Combo Setup</td>
          <td class="p-3 border border-white/10">Random clears</td>
          <td class="p-3 border border-white/10">Structured setups for chains</td>
        </tr>
        <tr>
          <td class="p-3 border border-white/10 text-purple-400 font-bold">Resource / Score Multipliers</td>
          <td class="p-3 border border-white/10">Ignored or secondary</td>
          <td class="p-3 border border-white/10">Primary focus for multipliers</td>
        </tr>
      </tbody>
    </table>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">4. Top 5 Optimization Strategies</h2>
    <ul class="list-disc pl-6 mb-4 space-y-2">
      <li><strong>Analyze Before Moving:</strong> Take a fraction of a second to observe the layout before committing to any action.</li>
      <li><strong>Optimize Controls:</strong> Set up comfortable key bindings if keyboard controls are supported, or adjust screen touch sensitivity.</li>
      <li><strong>Learn the Patterns:</strong> Most browser games rely on predictable spawns or mathematical patterns. Spotting these makes clearing levels easier.</li>
      <li><strong>Save Power-ups:</strong> Don't waste valuable multipliers or boosts on easy sections. Save them for high-stress levels or boss fights.</li>
      <li><strong>Upgrade Consistently:</strong> If the game features an upgrade system, invest in passive coin collection or multiplier increases first.</li>
    </ul>
    <h2 class="text-2xl font-bold text-white mt-10 mb-4">5. Verdict and Next Steps</h2>
    <p class="mb-4">Browser games are the future of instant casual entertainment. By applying structured strategies, understanding layout constraints, and upgrading your tools, you can experience a much richer and more competitive version of simple web titles. Stay tuned to Epic Games Hub for daily updates and guides!</p>
    `;
  }
}

const articles = [
  {
    slug: 'solitaire-classic-guide',
    title: 'Mastering Classic Solitaire: Rules, Tips, and Winning Strategies',
    category: 'Cards',
    read_time: '6 min read',
    summary: 'Learn card stacking rules, layout analysis, and strategic card management to consistently win at classic Solitaire.'
  },
  {
    slug: 'wood-block-strategy',
    title: 'Wood Block Puzzle Strategy: Tips to Clear More Rows and Solve Board Jams',
    category: 'Puzzle',
    read_time: '6 min read',
    summary: 'Learn spatial grid clearance and block pairing techniques to prevent board jams in this classic block matching puzzle.'
  },
  {
    slug: 'best-puzzle-games-2026',
    title: 'The Best Browser-Based Puzzle Games to Play in 2026',
    category: 'Puzzle',
    read_time: '5 min read',
    summary: 'Challenge your mind with the top 10 online brain teasers, grid match puzzles, and logical escape games of the year.'
  },
  {
    slug: 'evolution-of-endless-runners',
    title: 'The Evolution of Endless Runner Games: Mechanics and Design',
    category: 'Arcade',
    read_time: '7 min read',
    summary: 'Take a deep dive into the history of mobile and web endless runner titles, exploring how mechanics and visuals have evolved.'
  },
  {
    slug: 'browser-gaming-comeback',
    title: 'Why Browser-Based HTML5 Games are Making a Massive Comeback',
    category: 'Editorial',
    read_time: '8 min read',
    summary: 'Explore how WebGL and WebAssembly technologies are driving a major revival of high-quality, instant-play browser games.'
  },
  {
    slug: 'tic-tac-toe-strategy',
    title: 'Tic Tac Toe Strategy: How to Play Corners and Never Lose a Match',
    category: 'Board',
    read_time: '5 min read',
    summary: 'Master opening corner traps and defensive center blocks to achieve perfect play in Tic Tac Toe.'
  },
  {
    slug: 'block-blast-vs-wood-block',
    title: 'Block Blast vs. Wood Block: Which Grid Puzzle is Right for You?',
    category: 'Puzzle',
    read_time: '5 min read',
    summary: 'Compare the two popular browser puzzle games on grid mechanics, game speed, graphics style, and difficulty curves.'
  },
  {
    slug: 'top-5-racing-games',
    title: 'Top 5 Free Racing Games You Can Play Instantly in Your Browser',
    category: 'Racing',
    read_time: '6 min read',
    summary: 'Feel the heat and drift through sharp turns in our ultimate list of top free online 3D racing and bike stunt simulators.'
  },
  {
    slug: 'carrom-board-guide',
    title: 'Carrom Board Rules and Shooting Techniques for Beginners',
    category: 'Board',
    read_time: '6 min read',
    summary: 'Learn direct finger flicks, thumb shots, queen-cover rules, and rebound angles to pocket pieces like a Carrom Master.'
  },
  {
    slug: 'psychology-of-match-3',
    title: "The Psychology of Match-3 Games: Why We Can\'t Stop Matching",
    category: 'Editorial',
    read_time: '7 min read',
    summary: 'Explore the brain psychology and reward structures that make simple candy-matching puzzles incredibly addictive.'
  },
  {
    slug: 'stickman-fight-history',
    title: 'Stickman Fighting Games: The History of Ragdoll Combat and Mechanics',
    category: 'Fighting',
    read_time: '5 min read',
    summary: 'Track the cultural history and physics-based development of stickman fighting games from early flash to HTML5.'
  },
  {
    slug: 'mastering-ludo-tactics',
    title: 'Mastering Ludo: Board Strategies to Outsmart Your Friends',
    category: 'Board',
    read_time: '5 min read',
    summary: 'Improve your win rate in Ludo by calculating risk, managing safe zones, and targeting opponent tokens effectively.'
  },
  {
    slug: 'top-7-board-games',
    title: 'Top 7 Free Board Games to Play Online with Multiplayer Mode',
    category: 'Board',
    read_time: '6 min read',
    summary: 'Bring family game night to the web with the best free online board games supporting multiplayer matches.'
  },
  {
    slug: 'checkers-legend-strategy',
    title: 'Checkers Strategy: Openings and Mid-Game Tactics to Win',
    category: 'Board',
    read_time: '6 min read',
    summary: 'Master center-board control, back-row defense, piece exchange, and crowning Kings in Checkers Legend.'
  },
  {
    slug: 'best-chromebook-games',
    title: 'The Best Browser Games to Play on Chromebooks or School Laptops',
    category: 'Editorial',
    read_time: '6 min read',
    summary: 'A curated list of fast-loading, hardware-light web games perfect for quick breaks on school or work computers.'
  }
];

// 1. Generate blog articles
const cards_html = [];
articles.forEach(art => {
  const { slug, title, category, read_time, summary } = art;
  const body_html = generate_article_body(slug, title).replace(/{title}/g, title).replace(/{summary}/g, summary);
  
  // Write individual article page
  const article_html = ARTICLE_TEMPLATE
    .replace(/{title}/g, title)
    .replace(/{category}/g, category)
    .replace(/{read_time}/g, read_time)
    .replace(/{summary}/g, summary)
    .replace('{body_html}', body_html);
  
  const file_path = path.join(BLOG_DIR, `${slug}.html`);
  fs.writeFileSync(file_path, article_html, 'utf-8');
  console.log(`Authored: ${file_path}`);
  
  // Create blog homepage card HTML
  const card = `
    <div class="bg-surface/40 border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:shadow-neon hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
      <div class="p-6 font-sans">
        <div class="flex items-center gap-3 mb-4">
          <span class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-primary/10 text-primary border border-primary/20">${category}</span>
          <span class="text-gray-500 text-xs font-semibold">${read_time}</span>
        </div>
        <h3 class="text-white text-xl font-bold mb-3 hover:text-primary transition-colors">
          <a href="blog/${slug}.html">${title}</a>
        </h3>
        <p class="text-gray-400 text-sm leading-relaxed mb-4">{summary}</p>
      </div>
      <div class="px-6 pb-6 border-t border-white/5 pt-4 font-sans">
        <a href="blog/${slug}.html" class="text-primary hover:text-primary-light text-sm font-bold flex items-center gap-2">
          Read Article
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </a>
      </div>
    </div>
  `.replace(/{summary}/g, summary);
  cards_html.push(card);
});

// 2. Write blog.html
const blog_home_content = BLOG_HOME_TEMPLATE.replace('{cards}', cards_html.join('\n'));
const blog_home_path = path.join(ROOT_DIR, 'blog.html');
fs.writeFileSync(blog_home_path, blog_home_content, 'utf-8');
console.log(`Created Blog Homepage: ${blog_home_path}`);

// 3. Global update for HTML files
const html_files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html') && f !== 'blog.html');
const game_files = fs.readdirSync(GAMEDIST_DIR).filter(f => f.endsWith('.html'));

// Social media replacements
const FB_SVG = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>';
const IG_SVG = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>';

const SOCIAL_BLOCK = `<!-- Socials -->
            <a href="https://www.facebook.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Facebook"
              class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary border border-white/5 hover:border-primary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              ${FB_SVG}
            </a>
            <a href="https://www.instagram.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Instagram"
              class="w-10 h-10 rounded-full bg-white/5 hover:bg-secondary border border-white/5 hover:border-secondary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              ${IG_SVG}
            </a>`;

function update_html_file(file_path, is_subdir = false) {
  let content = fs.readFileSync(file_path, 'utf-8');

  // 1. Inject Cookie Consent Script if not present
  const script_src = is_subdir ? '../assets/js/cookie-consent.js' : 'assets/js/cookie-consent.js';
  const script_tag = `<script src="${script_src}" defer></script>`;
  
  if (!content.includes(script_tag)) {
    if (content.includes('</head>')) {
      content = content.replace('</head>', `  ${script_tag}\n</head>`);
    }
  }

  // 2. Update Social links inside footer
  const socials_regex = /<div class="flex gap-4">[\s\S]*?<\/div>/;
  const socials_replacement = `<div class="flex gap-4">\n            ${SOCIAL_BLOCK}\n          </div>`;
  content = content.replace(socials_regex, socials_replacement);

  // 3. Add Blog link to navigation list in footer
  const blog_ref = is_subdir ? '../blog.html' : 'blog.html';
  const about_ref = is_subdir ? '../about.html' : 'about.html';
  const blog_list_item = `<li>\n              <a href="${blog_ref}" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Blog</a>\n            </li>`;
  
  // Find about us link and insert blog link right after it
  const about_regex_str = `<li>\\s*<a href="${about_ref.replace(/\./g, '\\.')}"[\\s\\S]*?About Us</a>\\s*</li>`;
  const about_regex = new RegExp(about_regex_str, 'g');
  
  let match;
  let matches = [];
  while ((match = about_regex.exec(content)) !== null) {
    matches.push(match);
  }
  
  if (matches.length > 0) {
    const lastMatch = matches[0];
    const end_idx = lastMatch.index + lastMatch[0].length;
    if (!content.substring(end_idx, end_idx + 250).includes(blog_ref)) {
      content = content.substring(0, end_idx) + '\n            ' + blog_list_item + content.substring(end_idx);
    }
  }

  // 4. Update copyright & licensing statement
  const licensing_line = `<p>&copy; 2026 Epic Games Hub Games. All rights reserved. Games provided under licence via Game Distribution. All trademarks belong to their respective owners.</p>`;
  content = content.replace(/<p>&copy; 2026 Epic Games Hub Games.*?<\/p>/g, licensing_line);

  fs.writeFileSync(file_path, content, 'utf-8');
}

// Update root files
html_files.forEach(fn => {
  update_html_file(path.join(ROOT_DIR, fn), false);
  console.log(`Updated root page: ${fn}`);
});

// Update game distribution files
game_files.forEach(fn => {
  update_html_file(path.join(GAMEDIST_DIR, fn), true);
  console.log(`Updated game page: ${fn}`);
});

// 4. Generate sitemap.xml
const sitemap_urls = [];
const now_str = new Date().toISOString().split('T')[0];

// Add root pages
html_files.concat(['blog.html']).forEach(fn => {
  sitemap_urls.push(`  <url>
    <loc>https://epicgameshub.com/${fn}</loc>
    <lastmod>${now_str}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${fn === 'index.html' ? '1.0' : '0.7'}</priority>
  </url>`);
});

// Add blog articles
articles.forEach(art => {
  sitemap_urls.push(`  <url>
    <loc>https://epicgameshub.com/blog/${art.slug}.html</loc>
    <lastmod>${now_str}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
});

// Add games
game_files.forEach(fn => {
  sitemap_urls.push(`  <url>
    <loc>https://epicgameshub.com/gameDistribution/${fn}</loc>
    <lastmod>${now_str}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
});

const sitemap_xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap_urls.join('\n')}
</urlset>`;

const sitemap_path = path.join(ROOT_DIR, 'sitemap.xml');
fs.writeFileSync(sitemap_path, sitemap_xml, 'utf-8');
console.log(`Generated sitemap.xml: ${sitemap_path}`);

// 5. Generate robots.txt
const robots_txt = `User-agent: *
Allow: /
Sitemap: https://epicgameshub.com/sitemap.xml
`;
const robots_path = path.join(ROOT_DIR, 'robots.txt');
fs.writeFileSync(robots_path, robots_txt, 'utf-8');
console.log(`Generated robots.txt: ${robots_path}`);

console.log("All compliance automation steps completed successfully!");
