let rawData = null; // Object mapping IDs to games
let categoriesConfig = [];
let currentFilteredGames = []; // Array of active games
let currentCount = 0;
let currentTagFilter = "all";
const deviceSupport = window.DeviceSupport || null;

function isGameSupportedOnDevice(game) {
  if (!deviceSupport) return true;
  return deviceSupport.isGameSupported(game);
}

// DOM Elements
const grid = document.getElementById("game-grid");
const categoriesContainer = document.getElementById("categories-container");
const loadMoreBtn = document.getElementById("load-more-btn");
const secondaryFilters = document.getElementById("secondary-filters");

function parseCategoryId(name) {
  // Strips emojis and formatting so "✨ For You" becomes "for you"
  return name
    .replace(/[^\w\s]|_/g, "")
    .trim()
    .toLowerCase();
}

function renderCategories() {
  categoriesContainer.innerHTML = categoriesConfig
    .filter((cat) => cat.isTop)
    .map((cat) => {
      const catId = parseCategoryId(cat.name);
      return `
        <button data-id="${catId}" class="px-5 py-2 rounded-2xl border font-semibold text-sm whitespace-nowrap transition-all duration-300
        ${cat.active ? "bg-primary/20 text-indigo-300 border-primary/40 shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-105" : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"}">
            ${cat.name}
        </button>
      `;
    })
    .join("");
}

function filterGames() {
  const activeCatObj = categoriesConfig.find((c) => c.active) || categoriesConfig[0];
  const activeCat = parseCategoryId(activeCatObj.name);

  // Transform object to array format and filter by category and tags
  currentFilteredGames = rawData.gameTitles.filter((game) => {
    if (!isGameSupportedOnDevice(game)) return false;

    // Category Check
    let matchCat = false;
    if (game.categories) {
      const gameCats = game.categories.map((c) => c.toLowerCase());
      matchCat = gameCats.includes(activeCat);
    }

    // Tag Check
    let matchTag = true;
    if (currentTagFilter !== "all") {
      if (game.tags) {
        const gameTags = game.tags.map((t) => t.toLowerCase());
        matchTag = gameTags.includes(currentTagFilter);
      } else {
        matchTag = false;
      }
    }

    return matchCat && matchTag;
  });
}
const getSpanClass = (index) => {
  const pattern = [
    "col-span-2 row-span-2", // hero
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
  ];

  const selected = pattern[index % pattern.length];

  return `col-span-1 row-span-1 ${selected}`;
};
function generateGamesHtml(count) {
  let html = "";

  const gamesToRender = currentFilteredGames.slice(currentCount, currentCount + count);

  gamesToRender.forEach((game, index) => {
    // Preserve layout logic
    const layoutIndex = currentCount + index;
    const spanClass = getSpanClass(layoutIndex);
    const hue1 = (layoutIndex * 37) % 360;
    const bgGradient = `linear-gradient(135deg, hsl(${hue1}, 80%, 30%), hsl(${(hue1 + 60) % 360}, 80%, 15%))`;

    let badgesHtml = "";
    if (game.tags && game.tags.length > 0) {
      const tag = game.tags[0].toUpperCase();
      const badgeColor = tag === "HOT" ? "bg-red-500" : tag === "NEW" ? "bg-emerald-500" : "bg-primary";
      badgesHtml = `
            <div class="absolute top-3 right-3 sm:top-4 sm:right-4 ${badgeColor} text-white text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-3 py-1 rounded-full shadow-lg z-20 tracking-wider">
                ${tag}
            </div>
        `;
    }

    // Now converted into a clickable anchor link mapping to gameUrl
    html += `
        <a href="${game.gameUrl || "#"}" class="game-card block ${spanClass} aspect-square group relative rounded-[1.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-neon transition-all duration-300 hover:z-10" style="animation-delay: ${index * 0.05}s">
            
            <div class="absolute inset-0" style="background: ${bgGradient}"></div>
            
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.15]" 
                 style="background-image: url('${game.thumbnailUrl}'); opacity: 0.8; mix-blend-mode: overlay;">
            </div>
            
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.12]" 
                 style="background-image: url('${game.thumbnailUrl}'); opacity: 0.9;">
            </div>
              <div class="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>

              <div class="absolute bottom-0 left-0 w-full p-4 sm:p-5 transform translate-y-3 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-300">

                  <div class="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 pointer-events-none">
                    <h3 class="text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight truncate">
                        ${game.gameTitle}
                    </h3>

                  </div>
              </div>
            ${badgesHtml}
        </a>
        `;
  });

  return html;
}

// <div class="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>

// <div class="absolute bottom-0 left-0 w-full p-4 sm:p-5 transform translate-y-3 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
//     <h3 class="text-white font-bold text-base sm:text-lg lg:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight truncate">
//         ${game.gameTitle}
//     </h3>

//     <div class="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 pointer-events-none">
//         <span class="bg-primary text-white rounded-full p-1.5 sm:p-2 shadow-lg shadow-primary/30 inline-flex">
//             <svg class="w-3 h-3 sm:w-4 sm:h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
//         </span>
//         <span class="text-[10px] sm:text-xs font-bold tracking-wider text-indigo-200 drop-shadow-md">PLAY NOW</span>
//     </div>
// </div>

// <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
//     <div class="bg-white/20 backdrop-blur-sm p-4 rounded-full min-w-16 min-h-16 flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out shadow-2xl">
//          <svg class="w-8 h-8 text-white translate-x-1 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
//     </div>
// </div>

function loadItems(count) {
  if (!grid) return;

  const remaining = currentFilteredGames.length - currentCount;
  const actualCount = Math.min(count, remaining);

  if (actualCount <= 0) {
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = generateGamesHtml(actualCount);

  while (tempDiv.firstChild) {
    grid.appendChild(tempDiv.firstChild);
  }

  currentCount += actualCount;

  // Hide Load More button if we exhausted the category
  if (loadMoreBtn) {
    if (currentCount >= currentFilteredGames.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "inline-flex";
    }
  }
}

// Shared init function
async function initGameData() {
  if (rawData) return; // Already loaded
  try {
    const isSubdir = window.location.pathname.includes('/gameDistribution/') || window.location.pathname.includes('/game/');
    const basePath = isSubdir ? '../' : './';
    const response = await fetch(basePath + "assets/js/gamesData.json");
    rawData = await response.json();

    categoriesConfig = rawData.categories;

    if (categoriesContainer) {
        renderCategories();
    }
    if (grid) {
        filterGames();
        loadItems(50);
    }
  } catch (e) {
    console.error("Failed to load games data:", e);
    if (grid) {
        grid.innerHTML = `<div class="col-span-full py-20 text-center">
            <p class="text-red-400 font-bold mb-2">Error: Failed to load game data.</p>
            <p class="text-gray-400 text-sm">Please ensure you are viewing this via a local web server (like VS Code Live Server) because fetching JSON files locally via the block file:// protocol is not allowed by browsers.</p>
        </div>`;
    }
  }
}

// Initial load
window.addEventListener("DOMContentLoaded", initGameData);

// Handle bfcache (back/forward navigation) — DOMContentLoaded doesn't re-fire
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    // Page was restored from bfcache, re-init if needed
    rawData = null;
    initGameData();
  }
});

// Load more on click
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    const btnText = loadMoreBtn.querySelector("span");
    const svgIcon = loadMoreBtn.querySelector("svg");

    btnText.innerText = "Loading...";
    svgIcon.classList.remove("animate-bounce");
    svgIcon.classList.add("animate-spin");
    svgIcon.innerHTML = `<path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>`;

    setTimeout(() => {
      loadItems(30); // Add standard batch

      // Safety check if we hide it, we shouldn't attempt reset
      if (loadMoreBtn.style.display !== "none") {
        btnText.innerText = "Load More Games";
        svgIcon.classList.remove("animate-spin");
        svgIcon.classList.add("animate-bounce");
        svgIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>`;
      }
    }, 600);
  });
}

// Category clicking logic
if (categoriesContainer) {
  categoriesContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn) {
      const selectedId = btn.dataset.id;
      categoriesConfig.forEach((c) => (c.active = parseCategoryId(c.name) === selectedId));
      renderCategories();

      // Visual reload of grid
      if (grid) {
        grid.style.opacity = 0;
        setTimeout(() => {
          grid.innerHTML = "";
          currentCount = 0;
          filterGames();
          loadItems(50);
          grid.style.transition = "opacity 0.3s";
          grid.style.opacity = 1;
        }, 300);
      }
    }
  });
}

// Secondary filters clicking logic (Trending, New, Updated)
if (secondaryFilters) {
  secondaryFilters.addEventListener("click", (e) => {
    const btn = e.target.closest("button.secondary-btn");
    if (btn) {
      currentTagFilter = btn.dataset.tag;

      // Update active classes
      const allBtns = secondaryFilters.querySelectorAll(".secondary-btn");
      allBtns.forEach((b) => {
        if (b === btn) {
          b.classList.add("bg-white/10", "text-white", "shadow");
          b.classList.remove("text-gray-400", "hover:text-white", "hover:bg-white/5");
        } else {
          b.classList.remove("bg-white/10", "text-white", "shadow");
          b.classList.add("text-gray-400", "hover:text-white", "hover:bg-white/5");
        }
      });

      // Reload games
      grid.style.opacity = 0;
      setTimeout(() => {
        grid.innerHTML = "";
        currentCount = 0;
        filterGames();
        loadItems(50);
        grid.style.transition = "opacity 0.3s";
        grid.style.opacity = 1;
      }, 300);
    }
  });
}

// Search Logic
const searchInput = document.getElementById("search-input");
const searchDropdown = document.getElementById("search-dropdown");
const searchResultsContainer = document.getElementById("search-results-container");
const searchContainer = document.getElementById("search-container");

if (searchInput && searchDropdown && searchResultsContainer) {
  const renderSearchResults = (query) => {
    if (!query || !rawData) {
      searchDropdown.classList.add("hidden");
      searchDropdown.classList.remove("flex");
      return;
    }

    const lowerQuery = query.toLowerCase();

    // Filter Categories
    const matchingCats = categoriesConfig.filter((cat) => cat.name.toLowerCase().includes(lowerQuery));

    // Filter Games
    const matchingGames = rawData.gameTitles.filter((game) => {
      if (!isGameSupportedOnDevice(game)) return false;
      return game.gameTitle.toLowerCase().includes(lowerQuery);
    });

    let html = "";

    if (matchingCats.length === 0 && matchingGames.length === 0) {
      html = `<div class="text-center py-4 text-gray-400 text-sm">No results found for "${query}"</div>`;
    } else {
      // Render Categories
      // if (matchingCats.length > 0) {
      //     html += matchingCats.map(cat => {
      //         // Approximate game count for category
      //         const catId = parseCategoryId(cat.name);
      //         const count = rawData.gameTitles.filter(g => g.categories && g.categories.map(c=>c.toLowerCase()).includes(catId)).length;

      //         return `
      //         <a href="#" class="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors group">
      //             <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
      //             <span class="text-gray-200 font-semibold group-hover:text-white transition-colors">${cat.name}</span>
      //             <span class="text-primary font-bold ml-1">${count}</span>
      //         </a>
      //         `;
      //     }).join("");
      // }

      // Add a divider if both have results
      // if (matchingCats.length > 0 && matchingGames.length > 0) {
      //      html += `<div class="mx-4 my-2 border-b border-white/10"></div>`;
      // }

      // Render Games
      if (matchingGames.length > 0) {
        const isSubdir = window.location.pathname.includes('/gameDistribution/') || window.location.pathname.includes('/game/');
        const pathPrefix = isSubdir ? '../' : './';
        html += matchingGames
          .slice(0, 10)
          .map(
            (game) => `
                <a href="${pathPrefix}${game.gameUrl || "#"}" class="flex items-center gap-4 px-4 py-2 hover:bg-white/10 transition-colors group">
                    <div class="w-12 h-9 rounded bg-surface overflow-hidden shrink-0 shadow-md">
                        <img src="${pathPrefix}${game.thumbnailUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="${game.gameTitle}">
                    </div>
                    <span class="text-gray-200 text-xs sm:text-sm font-semibold group-hover:text-white transition-colors">${game.gameTitle}</span>
                </a>
            `,
          )
          .join("");
      }
    }

    searchResultsContainer.innerHTML = html;
    searchDropdown.classList.remove("hidden");
    searchDropdown.classList.add("flex");
  };

  searchInput.addEventListener("input", (e) => {
    renderSearchResults(e.target.value.trim());
  });

  searchInput.addEventListener("focus", (e) => {
    if (e.target.value.trim()) renderSearchResults(e.target.value.trim());
  });

  // Close dropdown on click outside
  document.addEventListener("click", (e) => {
    if (searchContainer && !searchContainer.contains(e.target)) {
      searchDropdown.classList.add("hidden");
      searchDropdown.classList.remove("flex");
    }
  });
}

function mousecursor() {
  const inner = document.querySelector(".cursor-inner");
  const outer = document.querySelector(".cursor-outer");
  if (!inner || !outer) return;

  const isTouchDevice = () => {
    return ("ontouchstart" in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);
  };

  // Disable custom cursor on touch devices to avoid stuck/touch issues
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
    // If over iframe / game frame / canvas - hide cursor to avoid interfering
    const overGame = e.target && (e.target.closest && (e.target.closest('iframe') || e.target.closest('#game-frame') || e.target.closest('canvas')));
    if (overGame) {
      safeHide();
      return;
    }

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    inner.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    outer.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    safeShow();
  }, { passive: true });

  if (window.jQuery) {
    $("body").on("mouseenter", "a, .cursor-pointer", function () {
      inner.classList.add("cursor-hover");
      outer.classList.add("cursor-hover");
    });

    $("body").on("mouseleave", "a, .cursor-pointer", function () {
      inner.classList.remove("cursor-hover");
      outer.classList.remove("cursor-hover");
    });
  }

  safeHide();

  // Expose a safe hide method for other scripts to call
  try {
    window.__hideCustomCursor = () => {
      inner.style.display = "none";
      outer.style.display = "none";
    };
  } catch (e) {}
}

if (window.jQuery) {
  $(document).ready(function () {
    mousecursor();
  });
} else {
  document.addEventListener("DOMContentLoaded", mousecursor);
}
