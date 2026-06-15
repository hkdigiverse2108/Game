// Fullscreen toggle
const gameDeviceSupport = window.DeviceSupport || null;
let currentGameSupported = true;

function isGameSupportedOnDevice(game) {
  if (!gameDeviceSupport) return true;
  return gameDeviceSupport.isGameSupported(game);
}

function getUnsupportedMessage(game) {
  if (!gameDeviceSupport) return "This game is only available on desktop devices.";
  return gameDeviceSupport.getUnsupportedMessage(game) || "This game is only available on desktop devices.";
}

function renderUnsupportedGameMessage(game) {
  const wrapper = document.getElementById("game-wrapper");
  if (!wrapper) return;

  wrapper.classList.add("relative");

  const frame = document.getElementById("game-frame");
  if (frame) {
    frame.removeAttribute("src");
    frame.style.display = "none";
  }

  const loading = document.getElementById("game-loading");
  if (loading) loading.style.display = "none";

  const overlay = document.getElementById("play-overlay");
  if (overlay) overlay.style.display = "none";

  const fullscreenBtn = document.getElementById("fullscreen-btn");
  if (fullscreenBtn) fullscreenBtn.style.display = "none";

  const existing = wrapper.querySelector("[data-device-unsupported]");
  if (existing) existing.remove();

  const messageBox = document.createElement("div");
  messageBox.setAttribute("data-device-unsupported", "true");
  messageBox.className = "absolute inset-0 z-30 flex items-center justify-center bg-[#0B0F19] px-6 text-center";
  messageBox.innerHTML = `
    <div>
      <p class="text-white text-lg font-bold mb-2">Desktop Only</p>
      <p class="text-gray-300 text-sm sm:text-base">${getUnsupportedMessage(game)}</p>
    </div>
  `;

  wrapper.appendChild(messageBox);
}

function toggleFullscreen() {
  if (!currentGameSupported) return;
  const wrapper = document.getElementById("game-wrapper");
  const btn = document.getElementById("fullscreen-btn");
  const isFullscreen = wrapper.classList.toggle("fullscreen-mode");
  btn.innerHTML = isFullscreen ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg> Exit` : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg> Fullscreen`;
  document.body.style.overflow = isFullscreen ? "hidden" : "";
}

// Escape key exits fullscreen
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const wrapper = document.getElementById("game-wrapper");
    if (wrapper.classList.contains("fullscreen-mode")) toggleFullscreen();
  }
});

let gamesDataPromise = null;

async function getGamesData() {
  if (gamesDataPromise) return gamesDataPromise;

  const isSubdir = window.location.pathname.includes("/gameDistribution/") || window.location.pathname.includes("/game/");
  const basePath = isSubdir ? "../" : "./";

  gamesDataPromise = fetch(basePath + "assets/js/gamesData.json")
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load games data: ${res.status}`);
      return res.json();
    })
    .catch((error) => {
      gamesDataPromise = null;
      throw error;
    });

  return gamesDataPromise;
}

function getCurrentGameId(data) {
  const bodyGameId = document.body?.dataset.currentGameId;
  const inlineGameId = typeof gameId !== "undefined" ? gameId : null;
  const candidates = [bodyGameId, inlineGameId].filter(Boolean);

  for (const id of candidates) {
    const exactMatch = data.gameTitles.find((g) => g.id === id);
    if (exactMatch) return exactMatch.id;
  }

  for (const id of candidates) {
    const partialMatch = data.gameTitles.find((g) => g.id.includes(id));
    if (partialMatch) return partialMatch.id;
  }

  return null;
}

function getCurrentGame(data) {
  const currentGameId = getCurrentGameId(data);
  if (!currentGameId) return null;
  return data.gameTitles.find((g) => g.id === currentGameId) || null;
}

function formatSeriesTitle(seriesKey) {
  if (!seriesKey) return "";

  return seriesKey
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBadgeClass(tag) {
  const normalizedTag = (tag || "").toLowerCase();
  if (normalizedTag === "hot") return "bg-red-500";
  if (normalizedTag === "new") return "bg-emerald-500";
  if (normalizedTag === "3d") return "bg-blue-500";
  return "bg-primary";
}

function renderSeriesCard(game) {
  return `
      <a href="../${game.gameUrl}" class="group flex items-center gap-4 px-4 py-3 bg-surface/40 hover:bg-surface/80 border border-white/5 hover:border-primary/30 rounded-2xl transition-all duration-200 w-full shadow-lg">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 relative bg-black/20 border border-white/5 shadow-md">
          <img src="../${game.thumbnailUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="${game.gameTitle}" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-xs sm:text-sm font-bold truncate leading-tight">${game.gameTitle}</p>
          <p class="text-gray-500 text-[10px] sm:text-xs mt-0.5 uppercase tracking-wide">Play now</p>
        </div>
      </a>
    `;
}

function renderSeriesGameCard(game) {
  return `
    <a href="../${game.gameUrl}" class="group block bg-surface/50 hover:bg-surface/80 border border-white/10 hover:border-primary/30 rounded-xl overflow-hidden transition-all duration-300">
      <div class="aspect-[16/9] relative overflow-hidden bg-black/20">
        <img src="../${game.thumbnailUrl}" alt="${game.gameTitle}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
      </div>
      <div class="p-3">
        <h3 class="text-white font-bold text-sm group-hover:text-primary transition-colors">${game.gameTitle}</h3>
        <p class="text-gray-400 text-xs mt-1">Play now</p>
      </div>
    </a>
  `;
}

async function loadRelatedGames() {
  try {
    const data = await getGamesData();
    const container = document.getElementById("related-games");
    if (!container) return;

    const currentGame = getCurrentGame(data);
    if (!currentGame) return;

    const currentCategories = currentGame.categories || [];

    const games = data.gameTitles
      .filter((g) => g.id !== currentGame.id && g.categories?.some((cat) => currentCategories.includes(cat)))
      .filter((g) => isGameSupportedOnDevice(g))
      .slice(0, 8);

    container.innerHTML = games.map((game) => renderSeriesCard(game)).join("");
  } catch (e) {
    console.warn("Error:", e);
  }
}

async function loadSeriesSections() {
  try {
    const data = await getGamesData();
    const currentGame = getCurrentGame(data);
    if (!currentGame || !currentGame.series) return;

    const sections = document.querySelectorAll("[data-series-section][data-series-key]");
    if (!sections.length) return;

    sections.forEach((section) => {
      const seriesKey = section.dataset.seriesKey;
      const titleNode = section.querySelector("[data-series-title]");
      const container = section.querySelector("[data-series-container]");
      if (!seriesKey || !titleNode || !container) return;

      const relatedGames = data.gameTitles
        .filter((game) => game.series === seriesKey && game.id !== currentGame.id)
        .filter((game) => isGameSupportedOnDevice(game));
      if (!relatedGames.length) return;

      section.classList.remove("hidden");
      titleNode.textContent = `More from ${formatSeriesTitle(seriesKey)}`;
      container.innerHTML = relatedGames.map((game) => renderSeriesGameCard(game)).join("");
    });
  } catch (e) {
    console.warn("Error:", e);
  }
}

// Custom cursor (jQuery-based)
function mousecursor() {
  const inner = document.querySelector(".cursor-inner");
  const outer = document.querySelector(".cursor-outer");
  if (!inner || !outer) return;
  const isTouchDevice = () => {
    return ("ontouchstart" in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);
  };

  // Disable on touch devices - avoids stuck effect after touch
  if (isTouchDevice()) {
    inner.style.display = "none";
    outer.style.display = "none";
    return;
  }

  const safeShow = () => {
    inner.style.visibility = "visible";
    outer.style.visibility = "visible";
    inner.style.display = "block";
    outer.style.display = "block";
  };

  const safeHide = () => {
    inner.style.visibility = "hidden";
    outer.style.visibility = "hidden";
  };

  document.addEventListener("mouseleave", () => {
    safeHide();
  });

  document.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget) {
      safeHide();
    }
  });

  document.addEventListener("mouseover", (e) => {
    const overGame = e.target && (e.target.closest && (e.target.closest('iframe') || e.target.closest('#game-frame') || e.target.closest('canvas')));
    if (overGame) {
      safeHide();
    }
  });

  window.addEventListener("mousemove", (e) => {
    const overGame = e.target && (e.target.closest && (e.target.closest('iframe') || e.target.closest('#game-frame') || e.target.closest('canvas')));
    if (overGame) {
      safeHide();
      return;
    }
    inner.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    outer.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    safeShow();
  }, { passive: true });

  if (window.jQuery) {
    $("body").on("mouseenter", "a, button, .cursor-pointer", function () {
      inner.classList.add("cursor-hover");
      outer.classList.add("cursor-hover");
    });
    $("body").on("mouseleave", "a, button, .cursor-pointer", function () {
      inner.classList.remove("cursor-hover");
      outer.classList.remove("cursor-hover");
    });
  }

  safeHide();

  try { window.__hideCustomCursor = () => { inner.style.display = 'none'; outer.style.display = 'none'; }; } catch(e) {}
}

const usedColors = new Set();

function getDynamicColor(text) {
  const colors = ["red", "emerald", "blue", "yellow", "purple", "pink", "indigo", "green"];

  // available colors (je use nathi thaya)
  let available = colors.filter((c) => !usedColors.has(c));

  // jo badha use thai gaya hoy to reset
  if (available.length === 0) {
    usedColors.clear();
    available = colors;
  }

  // random pick
  const color = available[Math.floor(Math.random() * available.length)];

  usedColors.add(color);

  return `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`;
}

async function loadGameDetails() {
  const data = await getGamesData();
  const currentGame = getCurrentGame(data);

  if (!currentGame) return;
  currentGameSupported = isGameSupportedOnDevice(currentGame);
  if (!currentGameSupported) {
    renderUnsupportedGameMessage(currentGame);
    return;
  }

  // ===== TAGS =====
  const tagContainer = document.getElementById("game-tags");

  tagContainer.innerHTML = currentGame.tags
    .map((tag) => {
      return `
                <span class="tag-badge ${getDynamicColor(tag)}">
                  ${tag}
                </span>
              `;
    })
    .join("");

  // ===== CATEGORIES =====
  const catContainer = document.getElementById("game-categories");

  catContainer.innerHTML = currentGame.categories
    .map((cat) => {
      return `
                <span class="tag-badge ${getDynamicColor(cat)}">
                  ${cat}
                </span>
                `;
    })
    .join("");

  // Helper functions for deterministic ratings and comments
  function getDeterministicData(title) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    const rating = (4.3 + (hash % 6) / 10).toFixed(1); // 4.3 to 4.8
    const votes = 67 + (hash % 150); // 67 to 216
    return { rating, votes };
  }

  const commentPool = [
    "Absolutely love this game! The physics are great and it runs super smoothly in my browser.",
    "A fantastic way to unwind for 10 minutes. Clean graphics and nice design.",
    "Very polished and addictive! Better than other sites hosting the same file.",
    "My high score is improving. Love the retro styling.",
    "Great responsiveness. Excellent performance on mobile too.",
    "Amazing animations. Perfect execution by the developers.",
    "A timeless classic! Highly recommend giving it a spin.",
    "Pure nostalgia, runs very smoothly without any latency issues."
  ];

  function getDeterministicComments(title) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    const idx1 = hash % commentPool.length;
    const idx2 = (hash + 3) % commentPool.length;
    const idx3 = (hash + 7) % commentPool.length;
    const selected = [commentPool[idx1]];
    if (idx2 !== idx1) selected.push(commentPool[idx2]);
    if (idx3 !== idx1 && idx3 !== idx2) selected.push(commentPool[idx3]);
    if (selected.length < 3) selected.push(commentPool[(idx1 + 1) % commentPool.length]);
    return selected.slice(0, 3);
  }

  // ===== ENGAGEMENT WIDGETS =====
  const mainCol = document.getElementById("game-wrapper")?.parentElement;
  if (mainCol) {
    const gameTitleText = currentGame.gameTitle;
    const gameSlug = currentGame.id;
    const { rating: initialRating, votes: initialVotes } = getDeterministicData(gameTitleText);
    
    const userRatingKey = `rating-${gameSlug}`;
    const userRated = localStorage.getItem(userRatingKey);
    const hasRated = userRated !== null;
    
    const displayRating = hasRated ? ((parseFloat(initialRating) * parseInt(initialVotes) + parseInt(userRated)) / (parseInt(initialVotes) + 1)).toFixed(1) : initialRating;
    const displayVotes = hasRated ? parseInt(initialVotes) + 1 : initialVotes;

    const reviewsKey = `reviews-${gameSlug}`;
    let customReviews = [];
    try {
      customReviews = JSON.parse(localStorage.getItem(reviewsKey) || "[]");
    } catch(e) {}

    const defaultReviews = getDeterministicComments(gameTitleText);
    
    const engagementCard = document.createElement("div");
    engagementCard.className = "mt-6 grid gap-6 md:grid-cols-2";
    engagementCard.innerHTML = `
      <!-- Ratings Card -->
      <div class="bg-surface/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            Rate & Feedback
          </h2>
          <p class="text-gray-400 text-sm mb-4 font-sans">How would you rate your experience with ${gameTitleText}?</p>
          
          <div class="flex items-center gap-2 mb-6">
            <div class="flex gap-1" id="star-rating-container">
              ${[1, 2, 3, 4, 5].map(star => `
                <button data-star="${star}" class="text-2xl transition-colors ${hasRated && star <= parseInt(userRated) ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}" ${hasRated ? 'disabled' : ''}>
                  ★
                </button>
              `).join("")}
            </div>
            <span class="text-gray-300 text-sm font-bold ml-2 font-sans" id="rating-score">${displayRating} / 5</span>
            <span class="text-gray-500 text-xs font-semibold font-sans" id="rating-votes">(${displayVotes} votes)</span>
          </div>

          <div class="border-t border-white/5 pt-4">
            <p class="text-gray-400 text-sm mb-3 font-semibold font-sans">Did you enjoy this game?</p>
            <div class="flex gap-3">
              <button id="feedback-up" class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-emerald-500/50 bg-white/5 hover:bg-emerald-500/10 text-gray-300 hover:text-emerald-400 transition-all text-sm font-bold font-sans">
                👍 Yes
              </button>
              <button id="feedback-down" class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-red-500/50 bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-all text-sm font-bold font-sans">
                👎 No
              </button>
            </div>
          </div>
        </div>
        <p class="text-[11px] text-gray-500 mt-6 leading-normal font-sans">Your feedback helps us customize recommendations and improve future gameplay optimizations.</p>
      </div>

      <!-- Comments Card -->
      <div class="bg-surface/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            Community Reviews
          </h2>
          <div class="space-y-4 max-h-[220px] overflow-y-auto pr-1 no-scrollbar my-4 font-sans" id="reviews-feed">
            ${[...customReviews.map(r => ({name: r.name, text: r.text, date: "Just now"})), ...defaultReviews.map((r, i) => ({name: ["GamerX", "SpeedyPro", "Puzzler99"][i] || "Player", text: r, date: "2 days ago"}))].map(rev => `
              <div class="border-b border-white/5 pb-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-white font-bold text-xs">${rev.name}</span>
                  <span class="text-gray-500 text-[10px]">${rev.date}</span>
                </div>
                <p class="text-gray-300 text-xs mt-1 leading-relaxed">${rev.text}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <form id="review-submission-form" class="mt-2 space-y-3 border-t border-white/5 pt-3">
          <div class="flex gap-2 font-sans">
            <input type="text" id="reviewer-name" required placeholder="Your name" class="w-[30%] bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50" />
            <input type="text" id="reviewer-comment" required placeholder="Write a review..." class="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50" />
            <button type="submit" class="bg-primary hover:bg-primary/80 text-white font-bold px-4 rounded-xl text-xs transition-colors">Post</button>
          </div>
        </form>
      </div>
    `;

    mainCol.appendChild(engagementCard);

    // Dynamic rating handler
    const ratingContainer = document.getElementById("star-rating-container");
    if (ratingContainer) {
      ratingContainer.addEventListener("click", (e) => {
        const starBtn = e.target.closest("[data-star]");
        if (!starBtn || localStorage.getItem(userRatingKey)) return;
        
        const ratingVal = parseInt(starBtn.dataset.star);
        localStorage.setItem(userRatingKey, ratingVal);

        // UI Update
        const starButtons = ratingContainer.querySelectorAll("[data-star]");
        starButtons.forEach(btn => {
          const starNum = parseInt(btn.dataset.star);
          btn.className = `text-2xl transition-colors ${starNum <= ratingVal ? 'text-yellow-400' : 'text-gray-600'}`;
          btn.setAttribute("disabled", "true");
        });

        const newVotes = parseInt(displayVotes) + 1;
        const newRating = ((parseFloat(initialRating) * parseInt(initialVotes) + ratingVal) / newVotes).toFixed(1);
        document.getElementById("rating-score").textContent = `${newRating} / 5`;
        document.getElementById("rating-votes").textContent = `(${newVotes} votes)`;
      });
    }

    // Dynamic feedback handlers
    document.getElementById("feedback-up").addEventListener("click", (e) => {
      e.target.closest("button").classList.toggle("bg-emerald-500/20");
      e.target.closest("button").classList.toggle("text-emerald-400");
      document.getElementById("feedback-down").classList.remove("bg-red-500/20", "text-red-400");
    });
    
    document.getElementById("feedback-down").addEventListener("click", (e) => {
      e.target.closest("button").classList.toggle("bg-red-500/20");
      e.target.closest("button").classList.toggle("text-red-400");
      document.getElementById("feedback-up").classList.remove("bg-emerald-500/20", "text-emerald-400");
    });

    // Dynamic comments submit handler
    const commentForm = document.getElementById("review-submission-form");
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameEl = document.getElementById("reviewer-name");
      const commentEl = document.getElementById("reviewer-comment");
      
      const newReview = { name: nameEl.value.trim(), text: commentEl.value.trim() };
      if (!newReview.name || !newReview.text) return;

      customReviews.unshift(newReview);
      localStorage.setItem(reviewsKey, JSON.stringify(customReviews));

      // Append comment directly
      const reviewsFeed = document.getElementById("reviews-feed");
      const div = document.createElement("div");
      div.className = "border-b border-white/5 pb-2 transition-all opacity-0 transform -translate-y-2 duration-300";
      div.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <span class="text-white font-bold text-xs">${newReview.name}</span>
          <span class="text-gray-500 text-[10px]">Just now</span>
        </div>
        <p class="text-gray-300 text-xs mt-1 leading-relaxed">${newReview.text}</p>
      `;
      reviewsFeed.insertBefore(div, reviewsFeed.firstChild);
      setTimeout(() => {
        div.classList.remove("opacity-0", "-translate-y-2");
      }, 50);

      // Reset
      nameEl.value = "";
      commentEl.value = "";
    });
  }
}

function startGame() {
  if (!currentGameSupported) return;
  document.getElementById("play-overlay").style.display = "none";

  // Hide custom cursor when the game starts to avoid overlaying the game iframe/canvas
  try {
    if (window.__hideCustomCursor) window.__hideCustomCursor();
    else {
      const inner = document.querySelector('.cursor-inner');
      const outer = document.querySelector('.cursor-outer');
      if (inner) inner.style.display = 'none';
      if (outer) outer.style.display = 'none';
    }
  } catch (e) {}

  if (window.innerWidth < 768) {
    const wrapper = document.getElementById("game-wrapper");
    if (wrapper.requestFullscreen) {
      wrapper.requestFullscreen().catch((e) => console.log(e));
    } else if (wrapper.webkitRequestFullscreen) {
      wrapper.webkitRequestFullscreen();
    }
  }
}

// Restore play overlay on mobile when exiting native fullscreen
function handleFullscreenExit() {
  if (!currentGameSupported) return;
  if (!document.fullscreenElement && !document.webkitFullscreenElement && window.innerWidth < 768) {
    document.getElementById("play-overlay").style.display = "";
  }
}
document.addEventListener("fullscreenchange", handleFullscreenExit);
document.addEventListener("webkitfullscreenchange", handleFullscreenExit);

function initGameDistributionPage() {
  mousecursor();
  loadRelatedGames();
  loadGameDetails();
  loadSeriesSections();
}

if (window.jQuery) {
  $(document).ready(function () {
    initGameDistributionPage();
  });
} else {
  document.addEventListener("DOMContentLoaded", initGameDistributionPage);
}
