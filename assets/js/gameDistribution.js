// Fullscreen toggle
function toggleFullscreen() {
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

// Load related games from gamesData.json
async function loadRelatedGames() {
  try {
    const isSubdir = window.location.pathname.includes("/gameDistribution/") || window.location.pathname.includes("/game/");
    const basePath = isSubdir ? "../" : "./";
    const res = await fetch(basePath + "assets/js/gamesData.json");
    // const res = await fetch("../assets/js/gamesData.json");
    const data = await res.json();

    const container = document.getElementById("related-games");

    // current game find karo
    const currentGame = data.gameTitles.find((g) => g.id.includes(gameId));

    if (!currentGame) return;

    const currentCategories = currentGame.categories || [];

    // FILTER: same category vala games
    const games = data.gameTitles
      .filter((g) => {
        if (g.id === currentGame.id) return false;

        // check if ANY category matches
        return g.categories?.some((cat) => currentCategories.includes(cat));
      })
      .slice(0, 8);

    // render
    container.innerHTML = games
      .map(
        (game) => `
          <a href="../${game.gameUrl}" class="related-card group flex items-center gap-3 p-2 bg-surface/40 hover:bg-surface/80 border border-white/5 hover:border-primary/30 rounded-2xl transition-all duration-200">
            
            <div class="w-14 h-12 rounded-xl overflow-hidden shrink-0 relative">
              <img src="../${game.thumbnailUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
          
            <div class="flex-1 min-w-0">
              <p class="text-white text-xs font-bold truncate">${game.gameTitle}</p>
              <p class="text-gray-500 text-[10px] mt-0.5 capitalize">
                ${(game.categories || ["game"])[0]}
              </p>
            </div>
          
          </a>
        `,
      )
      .join("");
  } catch (e) {
    console.warn("Error:", e);
  }
}

function renderSeriesCard(otherVersion) {
  return `
      <a href="../${otherVersion.gameUrl}" class="group flex items-center gap-4 px-4 py-3 bg-surface/40 hover:bg-surface/80 border border-white/5 hover:border-primary/30 rounded-2xl transition-all duration-200 w-full shadow-lg">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 relative bg-black/20 border border-white/5 shadow-md">
          <img src="../${otherVersion.thumbnailUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="${otherVersion.gameTitle}" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-xs sm:text-sm font-bold truncate leading-tight">${otherVersion.gameTitle}</p>
          <p class="text-gray-500 text-[10px] sm:text-xs mt-0.5 uppercase tracking-wide">Play now</p>
        </div>
      </a>
    `;
}

function renderSeriesMore({ sectionId, containerId, currentGame, data, seriesKey }) {
  const section = document.getElementById(sectionId);
  const container = document.getElementById(containerId);
  if (!section || !container || !currentGame) return;

  const otherVersion = data.gameTitles.find((g) => g.series === seriesKey && g.id !== currentGame.id);
  if (!otherVersion) return;

  section.classList.remove("hidden");
  container.innerHTML = renderSeriesCard(otherVersion);
}

// Subway Surfers-only cross-version section
async function loadSubwaySurfersMore() {
  try {
    if (!gameId || !gameId.startsWith("subway-surfers")) return;

    const section = document.getElementById("subway-surfers-more-section");
    const container = document.getElementById("subway-surfers-more");
    if (!section || !container) return;

    const isSubdir = window.location.pathname.includes("/gameDistribution/") || window.location.pathname.includes("/game/");
    const basePath = isSubdir ? "../" : "./";
    const res = await fetch(basePath + "assets/js/gamesData.json");
    const data = await res.json();

    // Subway Surfers has multiple variants, so use the exact page variant ID.
    const currentVariantId = gameId.includes("vegas-queen") ? "subway-surfers-vegas-queen" : "subway-surfers-new-york";
    const currentGame = data.gameTitles.find((g) => g.id === currentVariantId);
    if (!currentGame) return;

    renderSeriesMore({
      sectionId: "subway-surfers-more-section",
      containerId: "subway-surfers-more",
      currentGame,
      data,
      seriesKey: "subway-surfers",
    });
  } catch (e) {
    console.warn("Error:", e);
  }
}

// Car Parking series section
async function loadCarParkingMore() {
  try {
    if (!gameId || !["car-parking", "park-out"].includes(gameId)) return;

    const isSubdir = window.location.pathname.includes("/gameDistribution/") || window.location.pathname.includes("/game/");
    const basePath = isSubdir ? "../" : "./";
    const res = await fetch(basePath + "assets/js/gamesData.json");
    const data = await res.json();

    const currentVariantId = gameId === "park-out" ? "park-out" : "car-parking";
    const currentSeriesGame = data.gameTitles.find((g) => g.id === currentVariantId);
    if (!currentSeriesGame) return;

    renderSeriesMore({
      sectionId: "car-parking-more-section",
      containerId: "car-parking-more",
      currentGame: currentSeriesGame,
      data,
      seriesKey: "car-parking",
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
  window.addEventListener("mousemove", (e) => {
    inner.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    outer.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
  $("body").on("mouseenter", "a, button, .cursor-pointer", function () {
    inner.classList.add("cursor-hover");
    outer.classList.add("cursor-hover");
  });
  $("body").on("mouseleave", "a, button, .cursor-pointer", function () {
    inner.classList.remove("cursor-hover");
    outer.classList.remove("cursor-hover");
  });
  inner.style.visibility = "visible";
  outer.style.visibility = "visible";
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
  const isSubdir = window.location.pathname.includes("/gameDistribution/") || window.location.pathname.includes("/game/");
  const basePath = isSubdir ? "../" : "./";
  const res = await fetch(basePath + "assets/js/gamesData.json");
  // const res = await fetch("../assets/js/gamesData.json");
  const data = await res.json();

  // current game (title match karo)
  const currentGame = data.gameTitles.find((g) => g.id.includes(gameId));

  if (!currentGame) return;

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
  document.getElementById("play-overlay").style.display = "none";

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
  if (!document.fullscreenElement && !document.webkitFullscreenElement && window.innerWidth < 768) {
    document.getElementById("play-overlay").style.display = "";
  }
}
document.addEventListener("fullscreenchange", handleFullscreenExit);
document.addEventListener("webkitfullscreenchange", handleFullscreenExit);

$(document).ready(function () {
  mousecursor();
  loadRelatedGames();
  loadGameDetails();
  loadSubwaySurfersMore();
  loadCarParkingMore();
});
