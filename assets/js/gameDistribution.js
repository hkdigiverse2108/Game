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

  window.addEventListener("mousemove", (e) => {
    const overGame = e.target && (e.target.closest && (e.target.closest('iframe') || e.target.closest('#game-frame') || e.target.closest('canvas')));
    if (overGame) {
      inner.style.visibility = "hidden";
      outer.style.visibility = "hidden";
      return;
    }
    inner.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    outer.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
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

  inner.style.visibility = "visible";
  outer.style.visibility = "visible";

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
