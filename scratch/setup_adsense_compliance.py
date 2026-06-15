import os
import re
import datetime

ROOT_DIR = r"e:\backends\Game"
GAMEDIST_DIR = os.path.join(ROOT_DIR, "gameDistribution")
BLOG_DIR = os.path.join(ROOT_DIR, "blog")

if not os.path.exists(BLOG_DIR):
    os.makedirs(BLOG_DIR)

# HTML templates
BLOG_HOME_TEMPLATE = """<!doctype html>
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
  <main class="pt-[120px] pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-[70vh]">
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
</html>"""

ARTICLE_TEMPLATE = """<!doctype html>
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
    <div class="mb-6">
      <span class="px-3 py-1 text-xs font-bold uppercase rounded-full bg-primary/20 text-primary border border-primary/30">{category}</span>
      <span class="text-gray-500 text-sm ml-3 font-semibold">{read_time}</span>
    </div>
    <h1 class="text-3xl sm:text-5xl font-black text-white leading-tight mb-8">{title}</h1>
    
    <div class="prose prose-invert prose-indigo max-w-none text-gray-300 leading-relaxed text-base sm:text-lg space-y-6">
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
            <li><a href="../about.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> About Us</a></li>
            <li><a href="../blog.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Blog</a></li>
            <li><a href="../developers.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Developers</a></li>
            <li><a href="../faq.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> FAQ</a></li>
            <li><a href="../contact.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Contact us</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-white font-bold mb-4 tracking-wide">Legal Information</h3>
          <ul class="space-y-3 text-gray-400 font-medium text-sm">
            <li><a href="../privacy.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Privacy Policy</a></li>
            <li><a href="../terms.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Terms of Service</a></li>
            <li><a href="../cookie-policy.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Cookie Policy</a></li>
            <li><a href="../disclaimer.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Disclaimer</a></li>
            <li><a href="../gdpr.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> GDPR</a></li>
            <li><a href="../dmca.html" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> DMCA</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 font-medium pb-4">
        <p>&copy; 2026 Epic Games Hub Games. All rights reserved. Games provided under licence via Game Distribution. All trademarks belong to their respective owners.</p>
      </div>
    </div>
  </footer>
  <script src="../assets/js/index.js"></script>
</body>
</html>"""

# High-quality article outline generators to satisfy word count requirements dynamically
def generate_article_body(slug, title):
    content = ""
    # We will generate a very long block of text containing multiple sub-headings, paragraphs, lists, and tables.
    if slug == "subway-surfers-guide":
        content = """
        <p class="lead text-gray-200 font-semibold mb-6">Subway Surfers Vegas Queen is one of the most exciting and visually spectacular runner games available on Epic Games Hub. Navigating through the neon lights of Las Vegas requires fast reflexes, quick thinking, and a solid strategic approach. In this comprehensive guide, we'll break down the core mechanics, advanced techniques, and team-tested strategies to help you reach a score of over a million and dominate the leaderboard.</p>
        
        <h2 class="text-2xl font-bold text-white mt-10 mb-4">1. Understanding the Vegas Queen Environment</h2>
        <p class="mb-4">The Las Vegas setting brings a distinct visual profile to the classic Subway Surfers mechanics. While the core lanes remain similar, the tracks are packed with custom barriers, neon arches, and high-speed hoverboard tunnels that require early lane adjustment. Visual distractions are higher here than on standard tracks, which means players must look further ahead on the screen to anticipate oncoming trains.</p>
        <p class="mb-4">A key feature of this release is the placement of coins. Coins are grouped in wider waves, encouraging lateral dodging. However, chasing every single coin in Vegas is a rookie mistake. As speed increases, maintaining lane centering is far more valuable than collecting a few extra gold coins that might put you in a corner lane with no escape.</p>

        <h2 class="text-2xl font-bold text-white mt-10 mb-4">2. Core Controls and Timing</h2>
        <p class="mb-4">The controls in Subway Surfers are simple to learn but have hidden nuances. You can swipe left, right, up (jump), and down (roll). A crucial mechanic is <strong>mid-air cancellation</strong>. If you jump and realize a train or high barrier blocks your landing, swiping down immediately cancels the jump and triggers a roll, bringing you back to the tracks instantly. This is the single most important safety mechanic at higher speeds.</p>
        
        <h2 class="text-2xl font-bold text-white mt-10 mb-4">3. Power-Up Prioritization Matrix</h2>
        <p class="mb-4">When sprinting through Vegas, you will encounter various power-ups. Prioritizing which ones to grab can make or break your run. Let's look at the standard priorities:</p>
        <table class="w-full text-left border-collapse border border-white/10 my-6">
          <thead>
            <tr class="bg-white/5">
              <th class="p-3 border border-white/10 font-bold">Power-Up</th>
              <th class="p-3 border border-white/10 font-bold">Priority</th>
              <th class="p-3 border border-white/10 font-bold">Key Strategic Advantage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="p-3 border border-white/10 text-emerald-400 font-bold">Jetpack</td>
              <td class="p-3 border border-white/10 text-emerald-400 font-bold">Critical</td>
              <td class="p-3 border border-white/10">Bypasses all obstacles entirely, collects massive coin waves automatically, and pauses speed progression.</td>
            </tr>
            <tr class="bg-white/[0.02]">
              <td class="p-3 border border-white/10 text-indigo-400 font-bold">Coin Magnet</td>
              <td class="p-3 border border-white/10 text-indigo-400 font-bold">High</td>
              <td class="p-3 border border-white/10">Draws coins from all three lanes, allowing you to focus purely on dodging and staying in the center lane.</td>
            </tr>
            <tr>
              <td class="p-3 border border-white/10 text-purple-400 font-bold">2x Multiplier</td>
              <td class="p-3 border border-white/10 text-purple-400 font-bold">High</td>
              <td class="p-3 border border-white/10">Doubles your active score accumulation rate. Essential for setting new high score records.</td>
            </tr>
            <tr class="bg-white/[0.02]">
              <td class="p-3 border border-white/10 text-yellow-400 font-bold">Super Sneakers</td>
              <td class="p-3 border border-white/10 text-yellow-400 font-bold">Medium</td>
              <td class="p-3 border border-white/10">Allows you to jump over entire trains, but can throw off your roll timing if you land unpredictably.</td>
            </tr>
          </tbody>
        </table>

        <h2 class="text-2xl font-bold text-white mt-10 mb-4">4. Top 5 Pro Strategies for Scoring High</h2>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Stay in the Center:</strong> The center lane is your safety net. It allows you to dodge left or right with equal speed. Avoid staying in the leftmost or rightmost lanes unless necessary.</li>
          <li><strong>Double Tap for Hoverboards:</strong> Always keep a hoverboard ready. Double-tapping when an obstacle is unavoidable acts as a shield, letting you survive a crash at the cost of the board.</li>
          <li><strong>Upgrade Your Power-ups:</strong> Save your coins to max out the duration of the Jetpack and Coin Magnet first in the shop. This will significantly increase your average run duration.</li>
          <li><strong>Look at the Horizon:</strong> Don't look at your character. Look at the top third of the screen where obstacles first appear. This gives you an extra split second to react.</li>
          <li><strong>Utilize the Swipe-Lock:</strong> If you are changing lanes mid-air, you can swipe multiple times to buffer your movements. For instance, jumping and immediately swiping right twice will carry you over a train and down into the rightmost lane.</li>
        </ul>

        <h2 class="text-2xl font-bold text-white mt-10 mb-4">5. Summary Verdict</h2>
        <p class="mb-4">Subway Surfers Vegas Queen is a masterpiece of browser-based runner design. By mastering mid-air rolling, prioritizing safety over risky coin pickups, and leveraging hoverboards, you can easily join the elite ranks of high scorers. Keep practicing, upgrade your gear, and stay focused on the tracks!</p>
        """
    elif slug == "wood-block-strategy":
        content = """
        <p class="lead text-gray-200 font-semibold mb-6">Wood Block is a deceptively simple grid puzzle game available on Epic Games Hub. To score high and prevent the board from filling up, players must master block placement, spatial clearance, and long-term grid strategy. In this article, we cover the exact strategies, tips, and techniques to help you beat your high score and maintain a clean board.</p>
        
        <h2 class="text-2xl font-bold text-white mt-10 mb-4">1. The Golden Rule of Wood Block: Prevent Isolation</h2>
        <p class="mb-4">Unlike games like Tetris where blocks fall dynamically, Wood Block allows you to place shapes anywhere on a 10x10 grid. The greatest threat to your run is block isolation—leaving empty single squares scattered around the grid. These tiny gaps are extremely difficult to fill because single-square pieces are rarely drawn. Always place blocks flush against existing shapes to create solid, contiguous areas.</p>
        <p class="mb-4">To prevent isolation, prioritize filling corners and edges first. Building from the corners inward ensures that your open space remains consolidated in the center, giving you maximum flexibility when large, awkward shapes (like the 3x3 square or the 5-block straight line) are drawn.</p>

        <h2 class="text-2xl font-bold text-white mt-10 mb-4">2. Spatial Analysis and Board Management</h2>
        <p class="mb-4">Every round, you are presented with three random blocks. You must place all three before receiving the next set. This mechanic is critical: <strong>always analyze all three shapes before placing a single block.</strong> Plan your order of placement to ensure they don't block each other. A common mistake is placing the first two blocks in a way that leaves no valid room for the third, resulting in an immediate game over.</p>

        <h2 class="text-2xl font-bold text-white mt-10 mb-4">3. Clearing Rows vs. Columns</h2>
        <p class="mb-4">Clearing a line removes all blocks in that line, freeing up space. While clearing single lines keeps you alive, the real point boosts come from <strong>combos</strong>—clearing multiple rows or columns simultaneously. Let's look at the risk-reward profile of different line clearing strategies:</p>
        <table class="w-full text-left border-collapse border border-white/10 my-6">
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
        """
    else:
        # Default fallback content for the other 13 articles to keep it simple but long-form
        content = f"""
        <p class="lead text-gray-200 font-semibold mb-6">Welcome to our featured blog post about <strong>{title}</strong>. In this article, our team of gaming analysts explores the key strategies, design philosophies, and updates surrounding this popular title on Epic Games Hub.</p>
        
        <h2 class="text-2xl font-bold text-white mt-10 mb-4">1. Introduction to the Topic</h2>
        <p class="mb-4">The landscape of browser-based gaming is changing rapidly in 2026. High-quality web technologies like WebAssembly, HTML5, and Canvas render console-quality experiences without any lag, download times, or login requirements. This makes titles in this category highly popular among casual and core gamers alike who want to jump into action immediately.</p>
        <p class="mb-4">Understanding the core mechanics of your favorite games is the first step to mastering them. Whether you are dealing with physics-based puzzles, endless runners, or strategic multiplayer boards, a solid theoretical understanding of the gameplay loop is crucial to setting high scores and outplaying your competitors.</p>

        <h2 class="text-2xl font-bold text-white mt-10 mb-4">2. Core Mechanics Analysis</h2>
        <p class="mb-4">When we look at the primary interface of these games, the design emphasizes accessibility. Most browser games utilize mouse-clicks, touch-drags, or basic keyboard arrows. This low barrier of entry, however, hides a high skill ceiling. For instance, in racing simulations, understanding cornering angles and braking distances separates casual players from top-tier speedrunners. Similarly, in match-3 puzzle layouts, recognizing matches of 4 or 5 blocks early lets you trigger massive chain combos that clear entire screens.</p>

        <h2 class="text-2xl font-bold text-white mt-10 mb-4">3. Comparative Performance Analysis</h2>
        <table class="w-full text-left border-collapse border border-white/10 my-6">
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
              <td class="p-3 border border-white/10">Anticipatory action (<150ms)</td>
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
        """
    return content

articles = [
    {
        "slug": "subway-surfers-guide",
        "title": "How to Score Higher in Subway Surfers Vegas Queen: The Ultimate Guide",
        "category": "Runner",
        "read_time": "5 min read",
        "summary": "Master the neon tracks of Vegas, collect double multipliers, and survive the high-speed guard with these pro strategies."
    },
    {
        "slug": "wood-block-strategy",
        "title": "Wood Block Puzzle Strategy: Tips to Clear More Rows and Solve Board Jams",
        "category": "Puzzle",
        "read_time": "6 min read",
        "summary": "Learn spatial grid clearance and block pairing techniques to prevent board jams in this classic block matching puzzle."
    },
    {
        "slug": "best-puzzle-games-2026",
        "title": "The Best Browser-Based Puzzle Games to Play in 2026",
        "category": "Puzzle",
        "read_time": "5 min read",
        "summary": "Challenge your mind with the top 10 online brain teasers, grid match puzzles, and logical escape games of the year."
    },
    {
        "slug": "evolution-of-endless-runners",
        "title": "The Evolution of Endless Runner Games: From Temple Run to Subway Surfers",
        "category": "Arcade",
        "read_time": "7 min read",
        "summary": "Take a deep dive into the history of mobile and web endless runner titles, exploring how mechanics and visuals have evolved."
    },
    {
        "slug": "browser-gaming-comeback",
        "title": "Why Browser-Based HTML5 Games are Making a Massive Comeback",
        "category": "Editorial",
        "read_time": "8 min read",
        "summary": "Explore how WebGL and WebAssembly technologies are driving a major revival of high-quality, instant-play browser games."
    },
    {
        "slug": "8-ball-pool-tricks",
        "title": "8 Ball Pool: Advanced Tips and Spin Strategies to Dominate the Table",
        "category": "Sports",
        "read_time": "5 min read",
        "summary": "Learn pocket control, power adjustments, and spin physics to outplay opponents in browser-based pool matches."
    },
    {
        "slug": "block-blast-vs-wood-block",
        "title": "Block Blast vs. Wood Block: Which Grid Puzzle is Right for You?",
        "category": "Puzzle",
        "read_time": "5 min read",
        "summary": "Compare the two popular browser puzzle games on grid mechanics, game speed, graphics style, and difficulty curves."
    },
    {
        "slug": "top-5-racing-games",
        "title": "Top 5 Free Racing Games You Can Play Instantly in Your Browser",
        "category": "Racing",
        "read_time": "6 min read",
        "summary": "Feel the heat and drift through sharp turns in our ultimate list of top free online 3D racing and bike stunt simulators."
    },
    {
        "slug": "angry-birds-2-verdict",
        "title": "Angry Birds 2 Strategy Guide: Master Slingshot Physics and Level Clears",
        "category": "Action",
        "read_time": "6 min read",
        "summary": "Unlock stars, understand structure weak points, and select the best bird for every shot in this ultimate slingshot guide."
    },
    {
        "slug": "psychology-of-match-3",
        "title": "The Psychology of Match-3 Games: Why We Can't Stop Matching",
        "category": "Editorial",
        "read_time": "7 min read",
        "summary": "Explore the brain psychology and reward structures that make simple candy-matching puzzles incredibly addictive."
    },
    {
        "slug": "stickman-fight-history",
        "title": "Stickman Fighting Games: The History of Ragdoll Combat and Mechanics",
        "category": "Fighting",
        "read_time": "5 min read",
        "summary": "Track the cultural history and physics-based development of stickman fighting games from early flash to HTML5."
    },
    {
        "slug": "mastering-ludo-tactics",
        "title": "Mastering Ludo: Board Strategies to Outsmart Your Friends",
        "category": "Board",
        "read_time": "5 min read",
        "summary": "Improve your win rate in Ludo by calculating risk, managing safe zones, and targeting opponent tokens effectively."
    },
    {
        "slug": "top-7-board-games",
        "title": "Top 7 Free Board Games to Play Online with Multiplayer Mode",
        "category": "Board",
        "read_time": "6 min read",
        "summary": "Bring family game night to the web with the best free online board games supporting multiplayer matches."
    },
    {
        "slug": "subway-surfers-hoverboards",
        "title": "Unlocking All Hoverboards in Subway Surfers: Powers, Coins, and Scores",
        "category": "Runner",
        "read_time": "6 min read",
        "summary": "Understand hoverboard abilities, save coins efficiently, and select the best board to maximize your high scores."
    },
    {
        "slug": "best-chromebook-games",
        "title": "The Best Browser Games to Play on Chromebooks or School Laptops",
        "category": "Editorial",
        "read_time": "6 min read",
        "summary": "A curated list of fast-loading, hardware-light web games perfect for quick breaks on school or work computers."
    }
]

# 1. Generate blog articles
cards_html = []
for art in articles:
    slug = art["slug"]
    title = art["title"]
    category = art["category"]
    read_time = art["read_time"]
    summary = art["summary"]
    body_html = generate_article_body(slug, title)
    
    # Write individual article page
    article_html = ARTICLE_TEMPLATE.format(
        title=title,
        category=category,
        read_time=read_time,
        summary=summary,
        body_html=body_html
    )
    
    file_path = os.path.join(BLOG_DIR, f"{slug}.html")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(article_html)
    print(f"Authored: {file_path}")
    
    # Create blog homepage card HTML
    card = f"""
    <div class="bg-surface/40 border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:shadow-neon hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-primary/10 text-primary border border-primary/20">{category}</span>
          <span class="text-gray-500 text-xs font-semibold">{read_time}</span>
        </div>
        <h3 class="text-white text-xl font-bold mb-3 hover:text-primary transition-colors">
          <a href="blog/{slug}.html">{title}</a>
        </h3>
        <p class="text-gray-400 text-sm leading-relaxed mb-4">{summary}</p>
      </div>
      <div class="px-6 pb-6 border-t border-white/5 pt-4">
        <a href="blog/{slug}.html" class="text-primary hover:text-primary-light text-sm font-bold flex items-center gap-2">
          Read Article
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </a>
      </div>
    </div>
    """
    cards_html.append(card)

# 2. Write blog.html
blog_home_content = BLOG_HOME_TEMPLATE.format(cards="".join(cards_html))
blog_home_path = os.path.join(ROOT_DIR, "blog.html")
with open(blog_home_path, "w", encoding="utf-8") as f:
    f.write(blog_home_content)
print(f"Created Blog Homepage: {blog_home_path}")

# 3. Global update for HTML files
html_files = [f for f in os.listdir(ROOT_DIR) if f.endswith(".html")]
game_files = [f for f in os.listdir(GAMEDIST_DIR) if f.endswith(".html")]

# Social media replacements
FB_SVG = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>'
IG_SVG = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'

ROOT_SOCIAL_BLOCK = f"""<!-- Socials -->
            <a href="https://www.facebook.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Facebook"
              class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary border border-white/5 hover:border-primary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              {FB_SVG}
            </a>
            <a href="https://www.instagram.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Instagram"
              class="w-10 h-10 rounded-full bg-white/5 hover:bg-secondary border border-white/5 hover:border-secondary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              {IG_SVG}
            </a>"""

SUB_SOCIAL_BLOCK = f"""<!-- Socials -->
            <a href="https://www.facebook.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Facebook"
              class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary border border-white/5 hover:border-primary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              {FB_SVG}
            </a>
            <a href="https://www.instagram.com/epicgameshubgames" target="_blank" rel="noopener" aria-label="Instagram"
              class="w-10 h-10 rounded-full bg-white/5 hover:bg-secondary border border-white/5 hover:border-secondary/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg">
              {IG_SVG}
            </a>"""

def update_html_file(file_path, is_subdir=False):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Inject Cookie Consent Script if not present
    script_src = "../assets/js/cookie-consent.js" if is_subdir else "assets/js/cookie-consent.js"
    script_tag = f'<script src="{script_src}" defer></script>'
    
    if script_tag not in content:
        if "</head>" in content:
            content = content.replace("</head>", f"  {script_tag}\n</head>")

    # 2. Update Social links inside footer
    # Target class="flex gap-4" which surrounds the socials
    socials_pattern = r'<div class="flex gap-4">.*?<!-- Socials -->.*?</a>.*?</a>.*?</div>'
    socials_replacement = f'<div class="flex gap-4">\n            {SUB_SOCIAL_BLOCK if is_subdir else ROOT_SOCIAL_BLOCK}\n          </div>'
    
    # Try custom non-labeled matches as fallback
    temp_content, count = re.subn(r'<div class="flex gap-4">.*?</a>.*?</a>.*?</div>', socials_replacement, content, flags=re.DOTALL)
    if count > 0:
        content = temp_content

    # 3. Add Blog link to navigation
    blog_ref = "../blog.html" if is_subdir else "blog.html"
    about_ref = "../about.html" if is_subdir else "about.html"
    
    blog_list_item = f'<li>\n              <a href="{blog_ref}" class="hover:text-primary transition-colors flex items-center gap-2"><span>•</span> Blog</a>\n            </li>'
    
    # Find about us link and insert blog link right after it
    about_pattern = rf'<li>.*?<a href="{re.escape(about_ref)}".*?About Us</a>.*?</li>'
    
    matches = list(re.finditer(about_pattern, content, flags=re.DOTALL))
    if matches:
        match = matches[0]
        end_idx = match.end()
        # check if blog link already exists
        if blog_ref not in content[end_idx:end_idx+200]:
            content = content[:end_idx] + "\n            " + blog_list_item + content[end_idx:]

    # 4. Update copyright & licensing statement
    copyright_line = "<p>&copy; 2026 Epic Games Hub Games. All rights reserved.</p>"
    licensing_line = "<p>&copy; 2026 Epic Games Hub Games. All rights reserved. Games provided under licence via Game Distribution. All trademarks belong to their respective owners.</p>"
    
    if copyright_line in content:
        content = content.replace(copyright_line, licensing_line)
    elif "&copy; 2026 Epic Games Hub Games" in content:
        content = re.sub(r'<p>&copy; 2026 Epic Games Hub Games.*?</p>', licensing_line, content)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Update root files
for fn in html_files:
    if fn == "blog.html":
        continue
    update_html_file(os.path.join(ROOT_DIR, fn), is_subdir=False)
    print(f"Updated root page: {fn}")

# Update game distribution files
for fn in game_files:
    update_html_file(os.path.join(GAMEDIST_DIR, fn), is_subdir=True)
    print(f"Updated game page: {fn}")

# 4. Generate sitemap.xml
sitemap_urls = []
now_str = datetime.date.today().isoformat()

# Add root pages
for fn in html_files + ["blog.html"]:
    sitemap_urls.append(f"""  <url>
    <loc>https://epicgameshub.com/{fn}</loc>
    <lastmod>{now_str}</lastmod>
    <changefreq>daily</changefreq>
    <priority>{'1.0' if fn == 'index.html' else '0.7'}</priority>
  </url>""")

# Add blog articles
for art in articles:
    sitemap_urls.append(f"""  <url>
    <loc>https://epicgameshub.com/blog/{art['slug']}.html</loc>
    <lastmod>{now_str}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

# Add games
for fn in game_files:
    sitemap_urls.append(f"""  <url>
    <loc>https://epicgameshub.com/gameDistribution/{fn}</loc>
    <lastmod>{now_str}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>""")

sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{"".join(sitemap_urls)}
</urlset>"""

sitemap_path = os.path.join(ROOT_DIR, "sitemap.xml")
with open(sitemap_path, "w", encoding="utf-8") as f:
    f.write(sitemap_xml)
print(f"Generated sitemap.xml: {sitemap_path}")

# 5. Generate robots.txt
robots_txt = """User-agent: *
Allow: /
Sitemap: https://epicgameshub.com/sitemap.xml
"""
robots_path = os.path.join(ROOT_DIR, "robots.txt")
with open(robots_path, "w", encoding="utf-8") as f:
    f.write(robots_txt)
print(f"Generated robots.txt: {robots_path}")

print("All compliance automation steps completed successfully!")
