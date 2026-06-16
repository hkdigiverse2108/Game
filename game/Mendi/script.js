/* script.js - Mendi (Mendikot) */

(function () {
  "use strict";

  // Game Constants
  const SUITS = [
    { id: "spades", symbol: "♠", isRed: false, name: "Spades" },
    { id: "hearts", symbol: "♥", isRed: true, name: "Hearts" },
    { id: "clubs", symbol: "♣", isRed: false, name: "Clubs" },
    { id: "diamonds", symbol: "♦", isRed: true, name: "Diamonds" }
  ];

  const VALUES = [
    { value: 2, name: "2" },
    { value: 3, name: "3" },
    { value: 4, name: "4" },
    { value: 5, name: "5" },
    { value: 6, name: "6" },
    { value: 7, name: "7" },
    { value: 8, name: "8" },
    { value: 9, name: "9" },
    { value: 10, name: "10" },
    { value: 11, name: "J" },
    { value: 12, name: "Q" },
    { value: 13, name: "K" },
    { value: 14, name: "A" }
  ];

  // Players Map
  // 0: Human Player, 1: Opponent 1 (Left), 2: Partner (Top), 3: Opponent 2 (Right)
  const PLAYER_HUMAN = 0;
  const PLAYER_OPP1 = 1;
  const PLAYER_PARTNER = 2;
  const PLAYER_OPP2 = 3;

  const PLAYER_LABELS = ["You", "Opponent 1", "Partner", "Opponent 2"];

  // Game State
  const state = {
    playerName: "Player",
    logs: [],
    hukumMode: "closed", // "closed" or "open"
    difficulty: "medium", // "easy" | "medium" | "hard"
    deckType: "stripped", // "stripped" (7 to Ace) or "full" (2 to Ace)
    numDecks: 2, // 1 | 2 | 3 | 4
    cardsPerHand: 16, // Calculated dynamically
    tricksPerRound: 16, // Calculated dynamically
    totalMendis: 8, // Calculated dynamically (4 * numDecks)
    deck: [],
    hands: [[], [], [], []], // Dealt cards
    hukum: {
      suit: null, // Revealed trump suit
      revealed: false,
      secretSuit: null, // Pre-selected suit in Closed Mode
      secretChooser: null
    },
    turn: PLAYER_OPP1, // Who leads the trick
    dealer: PLAYER_HUMAN, // Dealer index
    leadSuit: null, // Suit of first card in trick
    currentTrick: [], // Played cards: { player: 0..3, card: cardObj, el: DOMElement }
    tricksPlayed: 0,
    scores: {
      playerTeam: 0,  // Number of 10s (Mendis) captured
      opponentTeam: 0
    },
    mendisCollected: {
      playerTeam: [],  // Suit list of captured 10s
      opponentTeam: []
    },
    tricksWon: {
      playerTeam: 0,
      opponentTeam: 0
    },
    tricksWonByPlayer: [0, 0, 0, 0],
    gameActive: false,
    hukumSelectionPhase: false,
    aiTimer: null,
    dealTimer: null,
    isDealing: false,
    visualCardCounts: [0, 0, 0, 0],
    tableTheme: "green",
    waitingForTrickTransition: false, // Blocks clicking during evaluations/sweeps
    lastHandContainerWidth: 600 // Cache for container width to prevent 0px clientWidth layout glitches
  };

  // DOM Elements Cache
  const setupOverlay = document.getElementById("setup-overlay");
  const gameLayout = document.getElementById("game-layout");
  const gameoverOverlay = document.getElementById("gameover-overlay");
  const hukumSelectOverlayEl = document.getElementById("hukum-select-overlay");
  
  const pHandEl = document.getElementById("player-hand");
  const trickPileEl = document.getElementById("trick-pile");
  const logBoxEl = document.getElementById("game-logs");
  const hukumDisplayEl = document.getElementById("hukum-display");
  const hukumIconEl = document.getElementById("hukum-icon");
  const hukumTextEl = document.getElementById("hukum-text");
  const hukumAlertMsgEl = document.getElementById("hukum-alert-msg");
  
  const pScoreEl = document.getElementById("player-score");
  const oppScoreEl = document.getElementById("opponent-score");
  const pMendiCardsEl = document.getElementById("player-mendi-cards");
  const oppMendiCardsEl = document.getElementById("opponent-mendi-cards");
  const pTricksScoreEl = document.getElementById("player-tricks-score");
  const oppTricksScoreEl = document.getElementById("opponent-tricks-score");
  
  const indicatorLblEl = document.getElementById("player-indicator-lbl");
  
  const statMendisCapturedEl = document.getElementById("stat-mendis-captured");
  const statTricksWonEl = document.getElementById("stat-tricks-won");
  const statKotStatusEl = document.getElementById("stat-kot-status");
  const winStatusLblEl = document.getElementById("win-status-lbl");
  const gameoverMessageEl = document.getElementById("gameover-message");

  // Setup Button Listeners
  document.querySelectorAll("[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-mode]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.hukumMode = btn.dataset.mode;
      saveGameState();
    });
  });

  document.querySelectorAll("[data-diff]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-diff]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.difficulty = btn.dataset.diff;
      saveGameState();
    });
  });

  function updateMenuSettingsAvailability() {
    const fullDeckBtn = document.getElementById("deck-type-full");
    const decks3Btn = document.getElementById("decks-3");
    const decks4Btn = document.getElementById("decks-4");

    if (state.deckType === "full") {
      // Decks 3 and 4 are not allowed, disable them
      if (decks3Btn) decks3Btn.disabled = true;
      if (decks4Btn) decks4Btn.disabled = true;
      
      // If current numDecks is 3 or 4, force it to 2 (default)
      if (state.numDecks > 2) {
        state.numDecks = 2;
        document.querySelectorAll("[data-decks]").forEach(b => {
          b.classList.remove("active");
          if (b.dataset.decks === "2") {
            b.classList.add("active");
          }
        });
      }
    } else {
      // All decks are allowed, enable them
      if (decks3Btn) decks3Btn.disabled = false;
      if (decks4Btn) decks4Btn.disabled = false;
    }

    if (state.numDecks > 2) {
      // Full deck is not allowed, disable it
      if (fullDeckBtn) fullDeckBtn.disabled = true;
      
      // If current deckType is full, force it to stripped
      if (state.deckType === "full") {
        state.deckType = "stripped";
        document.querySelectorAll("[data-decktype]").forEach(b => {
          b.classList.remove("active");
          if (b.dataset.decktype === "stripped") {
            b.classList.add("active");
          }
        });
      }
    } else {
      // Full deck is allowed, enable it
      if (fullDeckBtn) fullDeckBtn.disabled = false;
    }
  }

  document.querySelectorAll("[data-decktype]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-decktype]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.deckType = btn.dataset.decktype;
      updateMenuSettingsAvailability();
      saveGameState();
    });
  });

  document.querySelectorAll("[data-decks]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-decks]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.numDecks = parseInt(btn.dataset.decks, 10);
      updateMenuSettingsAvailability();
      saveGameState();
    });
  });

  document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-theme]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.tableTheme = btn.dataset.theme;
      applyTableTheme(state.tableTheme);
      saveGameState();
    });
  });

  const playerNameInput = document.getElementById("player-name");
  if (playerNameInput) {
    playerNameInput.addEventListener("change", () => {
      state.playerName = playerNameInput.value.trim() || "Player";
      saveGameState();
    });
  }

  // Run initial settings check to make sure they are in sync at startup
  updateMenuSettingsAvailability();

  document.getElementById("start-game-btn").addEventListener("click", startGame);
  document.getElementById("sort-hand-btn").addEventListener("click", () => {
    if (state.isDealing || state.hukumSelectionPhase) return;
    sortHand(PLAYER_HUMAN);
    renderPlayerHand();
  });
  document.getElementById("play-again-btn").addEventListener("click", restartToMenu);
  document.getElementById("exit-btn").addEventListener("click", restartToMenu);

  // Dismiss card selection when clicking outside the player hand
  document.addEventListener("click", (e) => {
    if (pHandEl && !pHandEl.contains(e.target)) {
      deselectActiveCard();
    }
  });

  function deselectActiveCard() {
    if (!pHandEl) return;
    const selected = pHandEl.querySelector(".hand-card.selected");
    if (selected) {
      selected.classList.remove("selected");
      const idx = Array.from(pHandEl.children).indexOf(selected);
      if (idx !== -1) {
        selected.style.zIndex = 10 + idx;
      }
    }
  }

  // Hukum suit selector overlay click listeners
  document.querySelectorAll(".suit-select-btn-large").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!state.hukumSelectionPhase || state.hukum.secretChooser !== PLAYER_HUMAN) return;
      selectHukumSuit(btn.dataset.suit);
    });
  });

  const cancelHukumBtn = document.getElementById("cancel-hukum-btn");
  if (cancelHukumBtn) {
    cancelHukumBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to cancel and exit to the main menu? Your current session progress will be lost.")) {
        state.hukumSelectionPhase = false;
        if (hukumSelectOverlayEl) {
          hukumSelectOverlayEl.classList.add("hidden");
        }
        restartToMenu();
      }
    });
  }

  const themeBtn = document.getElementById("theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const themes = ["green", "crimson", "royal"];
      let nextIdx = (themes.indexOf(state.tableTheme) + 1) % themes.length;
      state.tableTheme = themes[nextIdx];
      applyTableTheme(state.tableTheme);
      
      // Update active toggle button in setup overlay as well
      document.querySelectorAll("[data-theme]").forEach(btn => {
        if (btn.dataset.theme === state.tableTheme) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
      saveGameState();
    });
  }

  function applyTableTheme(theme) {
    const boardContainer = document.getElementById("board-container");
    if (!boardContainer) return;
    boardContainer.classList.remove("theme-green", "theme-crimson", "theme-royal");
    boardContainer.classList.add(`theme-${theme}`);
    
    const themeBtn = document.getElementById("theme-btn");
    if (themeBtn) {
      const names = { green: "Classic Green", crimson: "Crimson Velvet", royal: "Royal Blue" };
      themeBtn.textContent = `Theme: ${names[theme] || "Classic Green"}`;
    }
  }

  // Helper: Get Team Index (0: Player/Partner, 1: Opponents)
  function getTeam(playerIdx) {
    return (playerIdx === PLAYER_HUMAN || playerIdx === PLAYER_PARTNER) ? 0 : 1;
  }

  function startGame() {
    const nameInput = document.getElementById("player-name").value.trim();
    state.playerName = nameInput || "Player";
    PLAYER_LABELS[PLAYER_HUMAN] = state.playerName;

    // Update player avatar label and scoreboard team label on the board
    const playerLblEl = document.querySelector(".slot-bottom-avatar .player-lbl");
    if (playerLblEl) {
      playerLblEl.textContent = state.playerName;
    }
    const scoreboardUsLbl = document.getElementById("scoreboard-us-lbl");
    if (scoreboardUsLbl) {
      scoreboardUsLbl.textContent = `${state.playerName}:`;
    }

    // Calculate cards per hand, tricks per round and total Mendis dynamically
    const cardsPerDeck = state.deckType === "stripped" ? 32 : 52;
    state.cardsPerHand = (cardsPerDeck * state.numDecks) / 4;
    state.tricksPerRound = state.cardsPerHand;
    state.totalMendis = 4 * state.numDecks;

    setupOverlay.classList.add("hidden");
    gameLayout.classList.remove("hidden");
    gameoverOverlay.classList.add("hidden");

    // Recalculate board scale to fit window
    resizeBoard();

    // Randomize dealer at the start of the session
    state.dealer = Math.floor(Math.random() * 4);

    resetGameState();
    applyTableTheme(state.tableTheme);
    initRound();
    saveGameState();
  }

  function resetGameState() {
    if (indicatorLblEl) {
      indicatorLblEl.textContent = "";
      indicatorLblEl.style.color = "var(--color-primary)";
    }
    state.scores.playerTeam = 0;
    state.scores.opponentTeam = 0;
    state.mendisCollected.playerTeam = [];
    state.mendisCollected.opponentTeam = [];
    state.tricksWon.playerTeam = 0;
    state.tricksWon.opponentTeam = 0;
    state.tricksWonByPlayer = [0, 0, 0, 0];
    state.tricksPlayed = 0;
    state.hukum.suit = null;
    state.hukum.secretSuit = null;
    state.hukum.revealed = false;
    state.hukum.secretChooser = null;
    state.currentTrick = [];
    state.leadSuit = null;
    state.gameActive = true;
    state.waitingForTrickTransition = false;
    state.isDealing = false;
    state.hukumSelectionPhase = false;

    // Reset turn explicitly to the player to the right of the dealer
    state.turn = (state.dealer + 1) % 4;

    // Hide Hukum selector overlay in case it was open
    if (hukumSelectOverlayEl) {
      hukumSelectOverlayEl.classList.add("hidden");
    }

    // Clear any active AI or deal timers
    if (state.aiTimer) {
      clearTimeout(state.aiTimer);
      state.aiTimer = null;
    }
    if (state.dealTimer) {
      clearTimeout(state.dealTimer);
      state.dealTimer = null;
    }

    // Show deck stack at start
    const deckStackEl = document.getElementById("deck-stack");
    if (deckStackEl) {
      deckStackEl.classList.remove("hidden", "shuffling");
    }

    // Reset player tricks count on the board
    updatePlayerTricksHUD();

    // Reset HUD views
    pScoreEl.textContent = "0";
    oppScoreEl.textContent = "0";
    pMendiCardsEl.innerHTML = "";
    oppMendiCardsEl.innerHTML = "";
    if (pTricksScoreEl) pTricksScoreEl.textContent = `0/${state.tricksPerRound}`;
    if (oppTricksScoreEl) oppTricksScoreEl.textContent = `0/${state.tricksPerRound}`;
    state.logs = [];
    addLog(`Welcome, ${state.playerName}! Starting new round.`, "system");
    
    // Reset Hukum display
    updateHukumStatusUI();
  }

  // Helper: pause execution
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  function getRelativePos(el, boardRect = null) {
    const boardEl = document.getElementById("board-container");
    if (!boardEl && !boardRect) {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    const actualBoardRect = boardRect || boardEl.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - (actualBoardRect ? actualBoardRect.left : 0),
      y: rect.top + rect.height / 2 - (actualBoardRect ? actualBoardRect.top : 0)
    };
  }

  // Parallel staggered dealing engine
  async function dealCardsStaggered(cardsToDeal, staggerMs = 60) {
    // Pre-calculate and cache target positions to prevent layout thrashing (forced synchronous reflows)
    const boardEl = document.getElementById("board-container");
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();
    
    const deckEl = document.getElementById("deck-stack");
    const deckPos = deckEl ? getRelativePos(deckEl, boardRect) : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Cache slot positions
    const slotPositions = {};
    const ids = ["", "slot-opp1", "slot-partner", "slot-opp2"];
    for (let p = 1; p < 4; p++) {
      const el = document.getElementById(ids[p]);
      if (el) {
        slotPositions[p] = getRelativePos(el, boardRect);
      }
    }
    
    // Cache human hand card positions
    const handCardPositions = new Map();
    pHandEl.querySelectorAll(".hand-card").forEach(cardEl => {
      const suit = cardEl.dataset.suit;
      const value = cardEl.dataset.value;
      if (suit && value) {
        handCardPositions.set(`${suit}-${value}`, getRelativePos(cardEl, boardRect));
      }
    });
    
    // Default position for human hand container
    const handContainerEl = document.querySelector(".bottom-hand-container");
    const handContainerPos = handContainerEl ? getRelativePos(handContainerEl, boardRect) : { x: window.innerWidth / 2, y: window.innerHeight - 100 };
    
    const cachedPositions = {
      boardEl: boardEl,
      deck: deckPos,
      slots: slotPositions,
      handCards: handCardPositions,
      handContainer: handContainerPos
    };

    for (let i = 0; i < cardsToDeal.length; i++) {
      const { playerIdx, card } = cardsToDeal[i];
      if (!state.gameActive) return; // Exit if game exited during deal
      animateSingleCardDeal(playerIdx, card, cachedPositions);
      await delay(staggerMs);
    }
    
    // Wait for the last card to finish its flight completely (500ms transition minus last stagger step)
    const remainingFlightTime = Math.max(0, 500 - staggerMs);
    await delay(remainingFlightTime);
  }

  function animateSingleCardDeal(playerIdx, card, cachedPositions) {
    return new Promise(resolve => {
      const boardEl = cachedPositions.boardEl;
      
      const deckPos = cachedPositions.deck;
      
      // Target element position
      let targetPos;
      let targetCardEl = null;
      if (playerIdx === PLAYER_HUMAN) {
        targetCardEl = pHandEl.querySelector(`[data-suit="${card.suit}"][data-value="${card.value}"]`);
        const key = `${card.suit}-${card.value}`;
        targetPos = cachedPositions.handCards.get(key) || cachedPositions.handContainer;
      } else {
        targetPos = cachedPositions.slots[playerIdx] || deckPos;
      }
      
      // Create flying card back
      const flyer = document.createElement("div");
      flyer.className = "dealing-card";
      flyer.style.left = `${deckPos.x - 38}px`;
      flyer.style.top = `${deckPos.y - 55}px`;
      flyer.style.transform = "scale(1) rotate(0deg)";
      boardEl.appendChild(flyer);
      
      // Animate to target in next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (playerIdx === PLAYER_HUMAN) {
            flyer.style.left = `${targetPos.x - 38}px`;
            flyer.style.top = `${targetPos.y - 55}px`;
            flyer.style.transform = "scale(1) rotate(360deg)";
          } else {
            flyer.style.left = `${targetPos.x - 38}px`;
            flyer.style.top = `${targetPos.y - 55}px`;
            flyer.style.transform = "scale(0.25) rotate(360deg)";
            flyer.style.opacity = "0.15";
          }
        });
      });
      
      // Resolve immediately to let dealing cascade run in parallel
      resolve();
      
      // Clean up flyer and show actual card / increment counts
      setTimeout(() => {
        state.visualCardCounts[playerIdx]++;
        updatePlayerCardCountsHUD(state.visualCardCounts);
        
        if (playerIdx === PLAYER_HUMAN) {
          if (targetCardEl) {
            targetCardEl.classList.remove("dealt-hidden");
          }
        }
        flyer.remove();
      }, 500);
    });
  }

  // 2. Initialize Round (Closed Hukum selection at start, then deal all)
  async function initRound() {
    state.isDealing = true;

    // Generate deck based on selected options
    state.deck = [];
    const activeValues = state.deckType === "stripped" ? VALUES.filter(v => v.value >= 7) : VALUES;
    
    for (let d = 0; d < state.numDecks; d++) {
      SUITS.forEach(suit => {
        activeValues.forEach(val => {
          state.deck.push({
            suit: suit.id,
            symbol: suit.symbol,
            isRed: suit.isRed,
            suitName: suit.name,
            value: val.value,
            name: val.name
          });
        });
      });
    }

    // Reset hands
    state.hands = [[], [], [], []];
    state.visualCardCounts = [0, 0, 0, 0];
    pHandEl.innerHTML = "";
    updatePlayerCardCountsHUD(state.visualCardCounts);

    // Show shuffling deck animation
    const deckStackEl = document.getElementById("deck-stack");
    if (deckStackEl) {
      deckStackEl.classList.remove("hidden");
      deckStackEl.classList.add("shuffling");
    }

    // Play shuffle animation for 1.0 second (faster and snappier)
    await delay(1000);
    
    if (deckStackEl) {
      deckStackEl.classList.remove("shuffling");
    }
    await delay(150);

    // Shuffle the deck in memory
    shuffle(state.deck);

    // Trigger Hukum selection before dealing if in Closed Mode
    if (state.hukumMode === "closed") {
      state.hukum.secretChooser = (state.dealer + 1) % 4;
      updateHukumStatusUI();

      if (state.hukum.secretChooser === PLAYER_HUMAN) {
        state.hukumSelectionPhase = true;
        indicatorLblEl.textContent = "SELECT A SUIT FOR HUKUM (TRUMP)";
        indicatorLblEl.style.color = "var(--color-accent)";
        addLog("Closed Mode: Choose the Hukum suit before cards are dealt.", "system");
        showHukumSelectionOverlay();
        saveGameState();
      } else {
        state.hukumSelectionPhase = false;
        const chooserName = PLAYER_LABELS[state.hukum.secretChooser];
        indicatorLblEl.textContent = `${chooserName.toUpperCase()} IS CHOOSING HUKUM...`;
        indicatorLblEl.style.color = "var(--color-accent)";
        addLog(`Closed Mode: ${chooserName} is choosing the secret Hukum.`, "system");
        
        // Let AI choose secretly after a snappier 1 second delay
        state.dealTimer = setTimeout(() => {
          state.dealTimer = null;
          const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)].id;
          state.hukum.secretSuit = randomSuit;
          state.hukumSelectionPhase = false;
          
          indicatorLblEl.textContent = "";
          indicatorLblEl.style.color = "var(--color-primary)";
          addLog(`${chooserName} has chosen a secret Hukum.`, "hukum");
          updateHukumStatusUI();
          saveGameState();
          
          dealAllCards();
        }, 1000);
      }
    } else {
      addLog("Hukum mode is Open. The first suit cut will determine the trump.", "system");
      updateHukumStatusUI();
      dealAllCards();
    }
  }

  function showHukumSelectionOverlay() {
    if (!hukumSelectOverlayEl) return;
    
    // Allow selecting any suit freely
    hukumSelectOverlayEl.querySelectorAll(".suit-select-btn-large").forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("disabled");
    });
    hukumSelectOverlayEl.classList.remove("hidden");
  }

  function selectHukumSuit(suitId) {
    state.hukum.secretSuit = suitId;
    state.hukumSelectionPhase = false;
    
    if (hukumSelectOverlayEl) {
      hukumSelectOverlayEl.classList.add("hidden");
    }
    
    // Hide Hukum selection prompt
    indicatorLblEl.textContent = "";
    indicatorLblEl.style.color = "var(--color-primary)";
    
    const suitObj = SUITS.find(s => s.id === suitId);
    addLog(`You selected ${suitObj.name} ${suitObj.symbol} as secret Hukum.`, "hukum");
    updateHukumStatusUI();
    saveGameState();
    
    // Deal all cards
    state.dealTimer = setTimeout(() => {
      state.dealTimer = null;
      dealAllCards();
    }, 300);
  }

  async function dealAllCards() {
    if (!state.gameActive) return;
    state.isDealing = true;
    state.hukumSelectionPhase = false;

    addLog(`<b>${PLAYER_LABELS[state.dealer]}</b> is dealing the cards...`, "system");

    const deckStackEl = document.getElementById("deck-stack");
    let nextPlayer = (state.dealer + 1) % 4;

    const dealCardsList = [];
    const humanNewCards = [];
    
    // Deal all cards dynamically
    const totalCount = state.cardsPerHand;
    for (let round = 0; round < totalCount; round++) {
      for (let offset = 0; offset < 4; offset++) {
        const playerIdx = (nextPlayer + offset) % 4;
        const card = state.deck.shift();
        state.hands[playerIdx].push(card);
        dealCardsList.push({ playerIdx, card });
        if (playerIdx === PLAYER_HUMAN) {
          humanNewCards.push(card);
        }
      }
    }

    // Sort everyone's hand
    for (let p = 0; p < 4; p++) {
      sortHand(p);
    }

    // Render player hand with newly dealt cards hidden
    renderPlayerHand(humanNewCards);
    updatePlayerCardCountsHUD(state.visualCardCounts);

    // Staggered parallel deal of all cards (40ms stagger)
    await dealCardsStaggered(dealCardsList, 40);

    state.isDealing = false;
    addLog("All cards dealt. The round begins!", "system");
    
    if (deckStackEl) {
      deckStackEl.classList.add("hidden");
    }

    saveGameState();

    // Start tricks
    startTrickCycle();
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function sortHand(playerIdx) {
    const suitOrder = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
    state.hands[playerIdx].sort((a, b) => {
      if (a.suit !== b.suit) {
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return b.value - a.value; // High cards first
    });
  }

  // 3. UI Animation helpers
  let feedbackTimeout = null;
  function showFeedback(message) {
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
    }
    indicatorLblEl.textContent = message;
    indicatorLblEl.style.color = "#ff3344"; // Warning red
    
    feedbackTimeout = setTimeout(() => {
      updateHUDIndicator();
    }, 1500);
  }

  function shakeElement(el) {
    el.classList.add("shake-anim", "no-hover");
    setTimeout(() => {
      el.classList.remove("shake-anim", "no-hover");
    }, 350);
  }

  const pipPositions = {
    2: [[1,2], [5,2]],
    3: [[1,2], [3,2], [5,2]],
    4: [[1,1], [1,3], [5,1], [5,3]],
    5: [[1,1], [1,3], [3,2], [5,1], [5,3]],
    6: [[1,1], [1,3], [3,1], [3,3], [5,1], [5,3]],
    7: [[1,1], [1,3], [2,2], [3,1], [3,3], [5,1], [5,3]],
    8: [[1,1], [1,3], [2,2], [3,1], [3,3], [4,2], [5,1], [5,3]],
    9: [[1,1], [1,3], [2,1], [2,3], [3,2], [4,1], [4,3], [5,1], [5,3]],
    10: [[1,1], [1,3], [2,2], [2,1], [2,3], [4,1], [4,3], [4,2], [5,1], [5,3]]
  };

  function getCardFrontHTML(card) {
    let centerHTML = "";
    if (card.value === 14) { // Ace
      centerHTML = `<div class="card-center ace"><span class="center-suit-large">${card.symbol}</span></div>`;
    } else if (card.value >= 11 && card.value <= 13) { // Jack, Queen, King
      let courtIcon = "⚔️"; // Jack
      if (card.value === 12) courtIcon = "👑"; // Queen
      if (card.value === 13) courtIcon = "👑"; // King
      centerHTML = `
        <div class="card-center court-card">
          <div class="court-art">
            <span class="court-symbol">${courtIcon}</span>
          </div>
        </div>
      `;
    } else { // Numbered cards
      const pips = pipPositions[card.value] || [];
      centerHTML = `<div class="card-center pips-grid">`;
      for (let r = 1; r <= 5; r++) {
        for (let c = 1; c <= 3; c++) {
          const hasPip = pips.some(p => p[0] === r && p[1] === c);
          if (hasPip) {
            const rotateClass = (r > 3 || (r === 3 && c === 2 && card.value === 3)) ? "rotate-180" : "";
            centerHTML += `<span class="pip ${rotateClass}">${card.symbol}</span>`;
          } else {
            centerHTML += `<span></span>`;
          }
        }
      }
      centerHTML += `</div>`;
    }

    return `
      <div class="card-corner top">
        <span>${card.name}</span>
        <span>${card.symbol}</span>
      </div>
      ${centerHTML}
      <div class="card-corner bottom">
        <span>${card.name}</span>
        <span>${card.symbol}</span>
      </div>
    `;
  }

  function renderPlayerHand(cardsToHide = null) {
    // Add/remove not-my-turn class based on state
    if (state.turn === PLAYER_HUMAN && 
        state.gameActive && 
        !state.isDealing && 
        !state.hukumSelectionPhase && 
        !state.waitingForTrickTransition) {
      pHandEl.classList.remove("not-my-turn");
    } else {
      pHandEl.classList.add("not-my-turn");
    }

    const currentHand = state.hands[PLAYER_HUMAN];
    const existingElements = Array.from(pHandEl.querySelectorAll(".hand-card"));

    // Calculate negative margin dynamically based on available container width
    if (pHandEl.clientWidth > 0) {
      state.lastHandContainerWidth = pHandEl.clientWidth;
    }
    const containerWidth = state.lastHandContainerWidth;
    const cardWidth = 76;
    const numCards = currentHand.length;
    let margin = -10; // Default minimal overlap
    
    if (numCards > 1) {
      // Leave a tiny buffer of 24px (12px padding on each side)
      const targetWidth = containerWidth - 24;
      const totalNoOverlap = cardWidth * numCards;
      if (totalNoOverlap > targetWidth) {
        const overlapNeeded = (totalNoOverlap - targetWidth) / (numCards - 1);
        // Limit overlap so cards don't completely hide each other (max overlap 68px, leaving 8px visible)
        margin = -Math.min(68, Math.max(10, overlapNeeded));
      }
    }
    
    // Check if we can just update existing DOM elements instead of full rebuild
    const matchesState = existingElements.length === currentHand.length && 
                          existingElements.every((el, idx) => {
                            const c = currentHand[idx];
                            return el.dataset.suit === c.suit && el.dataset.value == c.value;
                          });

    if (matchesState && !cardsToHide) {
      // Just update playability classes, z-index and margins in-place
      existingElements.forEach((wrapper, idx) => {
        const card = currentHand[idx];
        wrapper.cardData = card; // Update reference to be safe
        if (!isCardPlayable(PLAYER_HUMAN, card) && state.currentTrick.length > 0 && state.turn === PLAYER_HUMAN) {
          wrapper.classList.add("unplayable");
          wrapper.classList.remove("selected"); // Deselect if card becomes unplayable
        } else {
          wrapper.classList.remove("unplayable");
        }
        wrapper.style.zIndex = wrapper.classList.contains("selected") ? 200 : 10 + idx;
        
        if (idx < currentHand.length - 1) {
          wrapper.style.marginRight = `${margin}px`;
        } else {
          wrapper.style.marginRight = "0px";
        }
      });
      return;
    }

    // Full rebuild
    pHandEl.innerHTML = "";

    currentHand.forEach((card, idx) => {
      const wrapper = document.createElement("div");
      wrapper.className = "card-wrapper hand-card";
      wrapper.style.zIndex = 10 + idx;
      wrapper.dataset.suit = card.suit;
      wrapper.dataset.value = card.value;
      wrapper.cardData = card;

      if (idx < currentHand.length - 1) {
        wrapper.style.marginRight = `${margin}px`;
      } else {
        wrapper.style.marginRight = "0px";
      }

      // Hide if requested
      if (cardsToHide) {
        if (cardsToHide === true || (Array.isArray(cardsToHide) && cardsToHide.some(c => c.suit === card.suit && c.value === card.value))) {
          wrapper.classList.add("dealt-hidden");
        }
      }

      // Check playability
      if (!isCardPlayable(PLAYER_HUMAN, card) && state.currentTrick.length > 0 && state.turn === PLAYER_HUMAN) {
        wrapper.classList.add("unplayable");
      }

      const inner = document.createElement("div");
      inner.className = "card-inner";

      const front = document.createElement("div");
      front.className = `card-front ${card.suit}`;
      front.innerHTML = getCardFrontHTML(card);

      const back = document.createElement("div");
      back.className = "card-back";

      inner.appendChild(front);
      inner.appendChild(back);
      wrapper.appendChild(inner);
      pHandEl.appendChild(wrapper);

      // Play card click
      wrapper.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent document-level click listener from immediately deselecting
        if (state.isDealing || state.hukumSelectionPhase || !state.gameActive || state.waitingForTrickTransition) return;
        if (state.turn !== PLAYER_HUMAN) {
          showFeedback("Wait for your turn!");
          shakeElement(wrapper);
          return;
        }

        // Re-evaluate playability live at click time, not from closure
        const clickedCard = wrapper.cardData;
        const isPlayable = isCardPlayable(PLAYER_HUMAN, clickedCard);

        if (!isPlayable) {
          deselectActiveCard();
          showFeedback("Must follow lead suit!");
          shakeElement(wrapper);
          return;
        }

        // Two-step card selection
        if (!wrapper.classList.contains("selected")) {
          deselectActiveCard();
          wrapper.classList.add("selected");
          wrapper.style.zIndex = 200;
          return;
        }

        // Card is already selected, so play it
        wrapper.classList.remove("selected");

        // Re-find the current index live at click time
        const currentIdx = state.hands[PLAYER_HUMAN].findIndex(
          c => c.suit === clickedCard.suit && c.value === clickedCard.value
        );
        if (currentIdx === -1) return; // Card already played, ignore

        playHumanCard(clickedCard, currentIdx, wrapper);
      });
    });
  }

  function updatePlayerCardCountsHUD(customCounts = null) {
    const humanCount = customCounts ? customCounts[PLAYER_HUMAN] : state.hands[PLAYER_HUMAN].length;
    const partnerCount = customCounts ? customCounts[PLAYER_PARTNER] : state.hands[PLAYER_PARTNER].length;
    const opp1Count = customCounts ? customCounts[PLAYER_OPP1] : state.hands[PLAYER_OPP1].length;
    const opp2Count = customCounts ? customCounts[PLAYER_OPP2] : state.hands[PLAYER_OPP2].length;

    const humanCountEl = document.querySelector(".slot-bottom-avatar .card-count");
    if (humanCountEl) humanCountEl.textContent = humanCount;

    const partnerCountEl = document.querySelector("#slot-partner .card-count");
    if (partnerCountEl) partnerCountEl.textContent = partnerCount;

    const opp1CountEl = document.querySelector("#slot-opp1 .card-count");
    if (opp1CountEl) opp1CountEl.textContent = opp1Count;

    const opp2CountEl = document.querySelector("#slot-opp2 .card-count");
    if (opp2CountEl) opp2CountEl.textContent = opp2Count;
  }

  function updatePlayerTricksHUD() {
    const humanTricksEl = document.querySelector(".slot-bottom-avatar .tricks-count");
    if (humanTricksEl) humanTricksEl.textContent = state.tricksWonByPlayer[PLAYER_HUMAN];

    const partnerTricksEl = document.querySelector("#slot-partner .tricks-count");
    if (partnerTricksEl) partnerTricksEl.textContent = state.tricksWonByPlayer[PLAYER_PARTNER];

    const opp1TricksEl = document.querySelector("#slot-opp1 .tricks-count");
    if (opp1TricksEl) opp1TricksEl.textContent = state.tricksWonByPlayer[PLAYER_OPP1];

    const opp2TricksEl = document.querySelector("#slot-opp2 .tricks-count");
    if (opp2TricksEl) opp2TricksEl.textContent = state.tricksWonByPlayer[PLAYER_OPP2];
  }

  // 4. Game Turn Cycle Engine
  function startTrickCycle() {
    if (!state.gameActive) return;
    state.currentTrick = [];
    state.leadSuit = null;
    state.waitingForTrickTransition = false;
    trickPileEl.innerHTML = "";
    
    updateHUDIndicator();
    
    // Trigger first turn
    if (state.turn !== PLAYER_HUMAN) {
      triggerAILogicalPlay();
    }
  }

  function updateHUDIndicator() {
    if (state.turn === PLAYER_HUMAN) {
      indicatorLblEl.textContent = "YOUR TURN (Select a card to play)";
      indicatorLblEl.style.color = "var(--color-primary)";
    } else {
      indicatorLblEl.textContent = `${PLAYER_LABELS[state.turn]}'s Turn...`;
      indicatorLblEl.style.color = "#8c9cb5";
    }
    renderPlayerHand();
  }

  function playHumanCard(card, handIdx, el) {
    // Calculate relative starting coordinates for smooth slide glide transition
    const rect = el.getBoundingClientRect();
    const centerRect = trickPileEl.getBoundingClientRect();
    const scale = document.getElementById("board-content").getBoundingClientRect().width / 1024 || 1;
    const tx = (rect.left - centerRect.left) / scale;
    const ty = (rect.top - centerRect.top) / scale;

    // Remove from hand array
    state.hands[PLAYER_HUMAN].splice(handIdx, 1);
    updatePlayerCardCountsHUD();
    
    // Play card animation
    el.classList.remove("hand-card");
    el.classList.add("trick-card");

    // Temporarily set transform to match its hand position exactly
    el.style.transform = `translate(${tx}px, ${ty}px) scale(1)`;
    
    // Move to center trick pile
    trickPileEl.appendChild(el);

    // Glide to its trick position in next frames
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        positionTrickCard(el, PLAYER_HUMAN);
      });
    });

    // Register card in current trick
    if (state.currentTrick.length === 0) {
      state.leadSuit = card.suit;
    } else {
      // Check if human is cutting
      if (card.suit !== state.leadSuit && !state.hukum.revealed) {
        if (state.hukumMode === "closed") {
          revealClosedHukum(PLAYER_HUMAN);
        } else if (state.hukumMode === "open") {
          setOpenHukum(card.suit, PLAYER_HUMAN);
        }
      }
    }

    state.currentTrick.push({
      player: PLAYER_HUMAN,
      card: card,
      el: el
    });

    addLog(`You played ${card.name} of ${card.suitName} ${card.symbol}`, "player");
    
    // Render hand to update unplayable overlays & apply not-my-turn classes immediately
    renderPlayerHand();
    
    saveGameState();
    
    if (state.currentTrick.length < 4) {
      // Proceed turn
      state.turn = (state.turn + 1) % 4;
      updateHUDIndicator();
      state.aiTimer = setTimeout(triggerAILogicalPlay, 600);
    } else {
      // Trick complete! Block human playing and wait for evaluation
      indicatorLblEl.textContent = "Completing trick...";
      indicatorLblEl.style.color = "#8c9cb5";
      pHandEl.classList.add("not-my-turn");
      state.aiTimer = setTimeout(evaluateTrickWinner, 1000);
    }
  }

  function triggerAILogicalPlay() {
    if (!state.gameActive) return;
    const aiIdx = state.turn;
    if (aiIdx === PLAYER_HUMAN) return; // Guard
    
    const cardToPlay = chooseAICard(aiIdx);
    
    // Remove card from hand
    const handIdx = state.hands[aiIdx].indexOf(cardToPlay);
    state.hands[aiIdx].splice(handIdx, 1);

    // Update avatar numbers
    updatePlayerCardCountsHUD();

    // Create and animate card DOM element
    const wrapper = document.createElement("div");
    wrapper.className = "card-wrapper trick-card flipped"; // Back side initially
    
    const inner = document.createElement("div");
    inner.className = "card-inner";

    const front = document.createElement("div");
    front.className = `card-front ${cardToPlay.suit}`;
    front.innerHTML = getCardFrontHTML(cardToPlay);

    const back = document.createElement("div");
    back.className = "card-back";

    inner.appendChild(front);
    inner.appendChild(back);
    wrapper.appendChild(inner);
    
    // Position card at AI's avatar initially
    positionCardAtAvatar(wrapper, aiIdx);
    trickPileEl.appendChild(wrapper);

    // Trigger flip and glide to center
    setTimeout(() => {
      wrapper.classList.remove("flipped");
      positionTrickCard(wrapper, aiIdx);
    }, 50);

    // Register card in current trick
    if (state.currentTrick.length === 0) {
      state.leadSuit = cardToPlay.suit;
    } else {
      // Check if AI is cutting
      if (cardToPlay.suit !== state.leadSuit && !state.hukum.revealed) {
        if (state.hukumMode === "closed") {
          revealClosedHukum(aiIdx);
        } else if (state.hukumMode === "open") {
          setOpenHukum(cardToPlay.suit, aiIdx);
        }
      }
    }

    state.currentTrick.push({
      player: aiIdx,
      card: cardToPlay,
      el: wrapper
    });

    addLog(`${PLAYER_LABELS[aiIdx]} played ${cardToPlay.name} of ${cardToPlay.suitName} ${cardToPlay.symbol}`, "ai");

    saveGameState();

    if (state.currentTrick.length < 4) {
      // Proceed turn
      state.turn = (state.turn + 1) % 4;
      updateHUDIndicator();
      if (state.turn !== PLAYER_HUMAN) {
        state.aiTimer = setTimeout(triggerAILogicalPlay, 600);
      }
    } else {
      // Trick complete! Block human playing and wait for evaluation
      indicatorLblEl.textContent = "Completing trick...";
      indicatorLblEl.style.color = "#8c9cb5";
      pHandEl.classList.add("not-my-turn");
      state.aiTimer = setTimeout(evaluateTrickWinner, 1000);
    }
  }

  function positionCardAtAvatar(el, playerIdx) {
    const slot = document.querySelector(`.player-slot[id="slot-${getPlayerSlotId(playerIdx)}"]`);
    if (!slot) return;
    const rect = slot.getBoundingClientRect();
    const centerRect = trickPileEl.getBoundingClientRect();
    
    const scale = document.getElementById("board-content").getBoundingClientRect().width / 1024 || 1;
    const tx = (rect.left - centerRect.left + (rect.width/2) - 38) / scale;
    const ty = (rect.top - centerRect.top + (rect.height/2) - 55) / scale;
    
    el.style.transform = `translate(${tx}px, ${ty}px) scale(0.6)`;
  }

  function getPlayerSlotId(idx) {
    if (idx === PLAYER_PARTNER) return "partner";
    if (idx === PLAYER_OPP1) return "opp1";
    if (idx === PLAYER_OPP2) return "opp2";
    return "player";
  }

  function positionTrickCard(el, playerIdx) {
    let angle = 0;
    let tx = 0;
    let ty = 0;

    switch (playerIdx) {
      case PLAYER_HUMAN: // Bottom
        angle = 0; ty = 50; break;
      case PLAYER_OPP1: // Left
        angle = -90; tx = -55; break;
      case PLAYER_PARTNER: // Top
        angle = 180; ty = -50; break;
      case PLAYER_OPP2: // Right
        angle = 90; tx = 55; break;
    }

    el.style.transform = `translate(${tx}px, ${ty}px) rotate(${angle}deg) scale(0.95)`;
  }

  // 5. Card Validity and AI Rules logic
  function isCardPlayable(playerIdx, card) {
    // If leading, any card is playable
    if (state.currentTrick.length === 0 || !state.leadSuit) return true;

    // Must follow suit if they have it
    const hasLeadSuit = state.hands[playerIdx].some(c => c.suit === state.leadSuit);
    if (hasLeadSuit) {
      return card.suit === state.leadSuit;
    }

    // Otherwise, can play any card (discard or cut)
    return true;
  }

  function chooseAICard(playerIdx) {
    const validCards = state.hands[playerIdx].filter(c => isCardPlayable(playerIdx, c));
    
    // Easy AI: plays random valid card
    if (state.difficulty === "easy") {
      return validCards[Math.floor(Math.random() * validCards.length)];
    }

    // Medium/Hard AI: Trick play logic
    // If leading the trick
    if (state.currentTrick.length === 0) {
      // Try to play Aces/Kings to win tricks and get Mendis
      const highCards = validCards.filter(c => c.value >= 13);
      if (highCards.length > 0) {
        return highCards[0];
      }
      // Or play a low card to safety
      return validCards[validCards.length - 1];
    }

    // If following suit
    const hasLeadSuit = state.hands[playerIdx].some(c => c.suit === state.leadSuit);
    if (hasLeadSuit) {
      // Find cards of lead suit
      const suitCards = validCards.filter(c => c.suit === state.leadSuit);
      
      // Look if partner is currently winning the trick
      const partnerWins = isPartnerWinning(playerIdx);
      if (partnerWins) {
        // Discard a 10 (Mendi) to partner, or play low card to save strength
        const tenCard = suitCards.find(c => c.value === 10);
        if (tenCard) return tenCard;
        return suitCards[suitCards.length - 1]; // Low card
      } else {
        const currentHigh = getCurrentTrickHighCard();
        const winningCards = suitCards.filter(c => compareTwoCards(c, currentHigh) > 0);
        if (winningCards.length > 0) {
          // Play lowest winning card to win the trick efficiently
          return winningCards[winningCards.length - 1];
        }
        // Cannot win, play lowest card
        return suitCards[suitCards.length - 1];
      }
    }

    // If cannot follow suit (Cut opportunity)
    if (state.hukum.revealed) {
      // Trump is already revealed, play trump card to cut if partner isn't winning
      if (state.hukum.suit && !isPartnerWinning(playerIdx)) {
        const trumps = validCards.filter(c => c.suit === state.hukum.suit);
        if (trumps.length > 0) {
          return trumps[trumps.length - 1]; // Play lowest trump to cut
        }
      }
    } else {
      // Hukum not yet revealed
      if (state.hukumMode === "closed") {
        // If trick contains a 10 (Mendi) and partner is not winning, cut if we are the secret chooser and have the secret suit
        const containsTen = state.currentTrick.some(t => t.card.value === 10);
        if (containsTen && !isPartnerWinning(playerIdx) && playerIdx === state.hukum.secretChooser) {
          const secretSuit = state.hukum.secretSuit;
          const secretCards = validCards.filter(c => c.suit === secretSuit);
          if (secretCards.length > 0) {
            return secretCards[0]; // Play highest secret trump to cut
          }
        }
      }
    }

    // Default fallback: play lowest value card
    return validCards[validCards.length - 1];
  }

  function isPartnerWinning(playerIdx) {
    if (state.currentTrick.length === 0) return false;
    
    // Evaluate who is winning so far
    let bestPlay = state.currentTrick[0];
    for (let i = 1; i < state.currentTrick.length; i++) {
      const play = state.currentTrick[i];
      if (compareTwoCards(play.card, bestPlay.card) > 0) {
        bestPlay = play;
      }
    }
    
    const partnerIdx = (playerIdx + 2) % 4;
    return bestPlay.player === partnerIdx;
  }

  function getCurrentTrickHighCard() {
    let bestPlay = state.currentTrick[0];
    for (let i = 1; i < state.currentTrick.length; i++) {
      const play = state.currentTrick[i];
      if (compareTwoCards(play.card, bestPlay.card) > 0) {
        bestPlay = play;
      }
    }
    return bestPlay.card;
  }

  function compareTwoCards(cardA, cardB) {
    const isTrumpA = state.hukum.revealed && cardA.suit === state.hukum.suit;
    const isTrumpB = state.hukum.revealed && cardB.suit === state.hukum.suit;

    // 1. Trump card checks
    if (isTrumpA && !isTrumpB) return 1;
    if (!isTrumpA && isTrumpB) return -1;
    if (isTrumpA && isTrumpB) {
      return cardA.value - cardB.value;
    }

    // 2. Lead suit checks
    const isLeadA = cardA.suit === state.leadSuit;
    const isLeadB = cardB.suit === state.leadSuit;

    if (isLeadA && !isLeadB) return 1;
    if (!isLeadA && isLeadB) return -1;
    if (isLeadA && isLeadB) {
      return cardA.value - cardB.value;
    }

    // 3. Fallback for off-suit cards:
    // If cardA is off-suit, it cannot beat cardB
    if (!isLeadA && !isTrumpA) return -1;
    // If cardB is off-suit (and cardA is not), cardA beats cardB
    if (!isLeadB && !isTrumpB) return 1;

    // Default value comparison if they are of the same suit
    return cardA.value - cardB.value;
  }

  function updateHukumStatusUI() {
    if (!hukumDisplayEl) return;
    
    if (state.hukum.revealed && state.hukum.suit) {
      const suitObj = SUITS.find(s => s.id === state.hukum.suit);
      hukumDisplayEl.className = `hukum-box select-none`;
      hukumDisplayEl.style.backgroundImage = "none";
      hukumDisplayEl.style.borderColor = suitObj.isRed ? "var(--color-red)" : "var(--color-primary)";
      hukumIconEl.textContent = suitObj.symbol;
      hukumIconEl.style.color = suitObj.isRed ? "var(--color-red)" : "var(--color-primary)";
      hukumTextEl.textContent = suitObj.name;
    } else {
      if (state.hukumMode === "open") {
        hukumDisplayEl.className = `hukum-box select-none`;
        hukumDisplayEl.style.backgroundImage = "none";
        hukumDisplayEl.style.borderColor = "rgba(255, 255, 255, 0.15)";
        hukumIconEl.textContent = "🔓";
        hukumIconEl.style.color = "var(--color-primary)";
        hukumTextEl.textContent = "First Cut";
      } else {
        // Closed Mode
        if (state.hukum.secretSuit) {
          // Selected but hidden
          hukumDisplayEl.className = `hukum-box card-back-bg select-none glow-success`;
          hukumDisplayEl.style.backgroundImage = "url('card_back.png')";
          hukumDisplayEl.style.borderColor = "var(--color-accent)";
          
          if (state.hukum.secretChooser === PLAYER_HUMAN) {
            const suitObj = SUITS.find(s => s.id === state.hukum.secretSuit);
            hukumIconEl.textContent = `🔒 ${suitObj.symbol}`;
            hukumIconEl.style.color = suitObj.isRed ? "var(--color-red)" : "#ffffff";
            hukumTextEl.textContent = suitObj.name;
          } else {
            hukumIconEl.textContent = "🔒";
            hukumIconEl.style.color = "#ffffff";
            hukumTextEl.textContent = "Secret Set";
          }
        } else {
          // Not selected yet
          hukumDisplayEl.className = `hukum-box card-back-bg select-none`;
          hukumDisplayEl.style.backgroundImage = "url('card_back.png')";
          hukumDisplayEl.style.borderColor = "var(--color-border)";
          hukumIconEl.textContent = "⏳";
          hukumIconEl.style.color = "#ffffff";
          hukumTextEl.textContent = "Choosing...";
        }
      }
    }
  }

  // 6. Hukum Reveal & Set mechanics
  function revealClosedHukum(playerIdx) {
    if (state.hukum.revealed) return;
    state.hukum.suit = state.hukum.secretSuit;
    state.hukum.revealed = true;

    // Show flash message
    hukumAlertMsgEl.textContent = `HUKUM: ${state.hukum.suit.toUpperCase()}`;
    hukumAlertMsgEl.classList.remove("hidden");
    
    updateHukumStatusUI();

    const suitObj = SUITS.find(s => s.id === state.hukum.suit);
    addLog(`${PLAYER_LABELS[playerIdx]} revealed the hidden Hukum suit: ${suitObj.name} ${suitObj.symbol}!`, "hukum");

    setTimeout(() => {
      hukumAlertMsgEl.classList.add("hidden");
    }, 1500);
  }

  function setOpenHukum(suitId, playerIdx) {
    if (state.hukum.revealed) return;
    state.hukum.suit = suitId;
    state.hukum.revealed = true;

    // Show flash message
    hukumAlertMsgEl.textContent = `HUKUM: ${suitId.toUpperCase()}`;
    hukumAlertMsgEl.classList.remove("hidden");
    
    updateHukumStatusUI();

    const suitObj = SUITS.find(s => s.id === suitId);
    addLog(`${PLAYER_LABELS[playerIdx]} cut the trick! Hukum suit set to: ${suitObj.name} ${suitObj.symbol}`, "hukum");

    setTimeout(() => {
      hukumAlertMsgEl.classList.add("hidden");
    }, 1500);
  }

  // 7. Evaluate Trick and Rounds
  function evaluateTrickWinner() {
    if (!state.gameActive) return;
    state.waitingForTrickTransition = true; // Blocks click interactions during transition

    let bestPlay = state.currentTrick[0];
    for (let i = 1; i < state.currentTrick.length; i++) {
      const play = state.currentTrick[i];
      if (compareTwoCards(play.card, bestPlay.card) > 0) {
        bestPlay = play;
      }
    }

    const winnerIdx = bestPlay.player;
    const winningTeam = getTeam(winnerIdx);
    
    // Add logs
    addLog(`${PLAYER_LABELS[winnerIdx]} wins the trick with ${bestPlay.card.name} of ${bestPlay.card.suitName}!`, "trick");

    // Gather Mendis (10s) inside this trick
    const mendis = state.currentTrick.filter(p => p.card.value === 10);
    mendis.forEach(p => {
      if (winningTeam === 0) {
        state.scores.playerTeam++;
        state.mendisCollected.playerTeam.push(p.card);
        appendMendiBadge(pMendiCardsEl, p.card);
      } else {
        state.scores.opponentTeam++;
        state.mendisCollected.opponentTeam.push(p.card);
        appendMendiBadge(oppMendiCardsEl, p.card);
      }
    });

    if (winningTeam === 0) {
      state.tricksWon.playerTeam++;
      pScoreEl.textContent = state.scores.playerTeam;
      if (pTricksScoreEl) pTricksScoreEl.textContent = `${state.tricksWon.playerTeam}/${state.tricksPerRound}`;
    } else {
      state.tricksWon.opponentTeam++;
      oppScoreEl.textContent = state.scores.opponentTeam;
      if (oppTricksScoreEl) oppTricksScoreEl.textContent = `${state.tricksWon.opponentTeam}/${state.tricksPerRound}`;
    }

    // Track tricks won by individual players
    state.tricksWonByPlayer[winnerIdx]++;
    updatePlayerTricksHUD();

    // Sweep card elements to winner avatar
    animateTrickSweep(winnerIdx);

    // Set next trick leader
    state.turn = winnerIdx;
    state.tricksPlayed++;

    saveGameState();

    // Check end of round
    if (state.tricksPlayed < state.tricksPerRound) {
      state.aiTimer = setTimeout(startTrickCycle, 700);
    } else {
      state.aiTimer = setTimeout(endGameRound, 1000);
    }
  }

  function appendMendiBadge(containerEl, card) {
    const badge = document.createElement("span");
    badge.className = `collected-card-icon ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : ''}`;
    badge.textContent = `10${card.symbol}`;
    containerEl.appendChild(badge);
  }

  function animateTrickSweep(winnerIdx) {
    let slot;
    if (winnerIdx === PLAYER_HUMAN) {
      slot = document.querySelector(".slot-bottom-avatar");
    } else {
      slot = document.getElementById(`slot-${getPlayerSlotId(winnerIdx)}`);
    }
    if (!slot) return;
    const rect = slot.getBoundingClientRect();
    const centerRect = trickPileEl.getBoundingClientRect();
    
    const scale = document.getElementById("board-content").getBoundingClientRect().width / 1024 || 1;
    const tx = (rect.left - centerRect.left + (rect.width/2) - 38) / scale;
    const ty = (rect.top - centerRect.top + (rect.height/2) - 55) / scale;

    state.currentTrick.forEach(play => {
      play.el.classList.add("flipped"); // Flip face down when swept
      play.el.style.transform = `translate(${tx}px, ${ty}px) scale(0.2)`;
      play.el.style.opacity = "0";
    });
  }

  // 8. End Game and Score Tallies
  function endGameRound() {
    state.gameActive = false;
    
    const teamMendis = state.scores.playerTeam;
    const oppMendis = state.scores.opponentTeam;
    const halfMendis = state.totalMendis / 2;
    
    let isVictory = false;
    let isDraw = false;
    if (teamMendis > halfMendis) {
      isVictory = true;
    } else if (teamMendis < halfMendis) {
      isVictory = false;
    } else {
      isDraw = true;
    }

    let isKot = (teamMendis === state.totalMendis) || (oppMendis === state.totalMendis);

    if (isDraw) {
      winStatusLblEl.textContent = "DRAW";
      winStatusLblEl.className = "neon-text font-digit";
      gameoverMessageEl.textContent = `Draw! Both teams captured ${halfMendis} Mendis.`;
      addLog(`Game ended in a draw. <b>${PLAYER_LABELS[state.dealer]}</b> retains the deal.`, "system");
    } else {
      winStatusLblEl.textContent = isVictory ? "VICTORY!" : "DEFEAT";
      winStatusLblEl.className = `neon-text font-digit ${isVictory ? '' : 'color-red'}`;

      let msg = `You captured ${teamMendis} / ${state.totalMendis} Mendis (10s)`;
      if (isKot) {
        msg = isVictory ? "🏆 MENDIKOT (CLEAN SWEEP) ACHIEVED!" : `💀 OPPONENTS TOOK ALL ${state.totalMendis} MENDIS (KOT)`;
      }
      gameoverMessageEl.textContent = msg;

      // Rotate the dealer clockwise at the end of each round (except on a draw, where the dealer retains the deal per standard Mendikot rules)
      state.dealer = (state.dealer + 1) % 4;
      addLog(`Round finished. Deal passes to <b>${PLAYER_LABELS[state.dealer]}</b>.`, "system");
    }

    statMendisCapturedEl.textContent = `${teamMendis} / ${state.totalMendis}`;
    statTricksWonEl.textContent = `${state.tricksWon.playerTeam} / ${state.tricksPerRound}`;
    statKotStatusEl.textContent = isKot ? "Yes" : "No";

    saveGameState();

    gameoverOverlay.classList.remove("hidden");
  }

  function restartToMenu() {
    state.gameActive = false;
    if (state.aiTimer) {
      clearTimeout(state.aiTimer);
      state.aiTimer = null;
    }
    if (state.dealTimer) {
      clearTimeout(state.dealTimer);
      state.dealTimer = null;
    }
    if (hukumSelectOverlayEl) {
      hukumSelectOverlayEl.classList.add("hidden");
    }
    gameoverOverlay.classList.add("hidden");
    gameLayout.classList.add("hidden");
    setupOverlay.classList.remove("hidden");
    saveGameState();
  }

  // System Logs Handler
  function addLog(text, type = "default") {
    console.log(`[Mendi Log - ${type}]`, text);
    if (state.logs) {
      state.logs.push({ text, type });
    }
    if (!logBoxEl) return;
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.innerHTML = text;
    logBoxEl.appendChild(entry);
    
    // Auto scroll to bottom
    logBoxEl.scrollTop = logBoxEl.scrollHeight;
  }

  function saveGameState() {
    if (!state.gameActive) {
      const settings = {
        playerName: state.playerName,
        hukumMode: state.hukumMode,
        difficulty: state.difficulty,
        deckType: state.deckType,
        numDecks: state.numDecks,
        tableTheme: state.tableTheme
      };
      localStorage.setItem("mendi_settings", JSON.stringify(settings));
      localStorage.removeItem("mendi_game_state");
      return;
    }

    const stateCopy = {
      ...state,
      aiTimer: null,
      dealTimer: null,
      currentTrick: state.currentTrick.map(play => ({
        player: play.player,
        card: play.card
      }))
    };
    localStorage.setItem("mendi_game_state", JSON.stringify(stateCopy));
  }

  function loadGameState() {
    const savedSettings = localStorage.getItem("mendi_settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        state.playerName = settings.playerName || "Player";
        state.hukumMode = settings.hukumMode || "closed";
        state.difficulty = settings.difficulty || "medium";
        state.deckType = settings.deckType || "stripped";
        state.numDecks = settings.numDecks || 2;
        state.tableTheme = settings.tableTheme || "green";

        document.getElementById("player-name").value = state.playerName;
        
        document.querySelectorAll("[data-mode]").forEach(b => {
          b.classList.toggle("active", b.dataset.mode === state.hukumMode);
        });
        document.querySelectorAll("[data-diff]").forEach(b => {
          b.classList.toggle("active", b.dataset.diff === state.difficulty);
        });
        document.querySelectorAll("[data-decktype]").forEach(b => {
          b.classList.toggle("active", b.dataset.decktype === state.deckType);
        });
        document.querySelectorAll("[data-decks]").forEach(b => {
          b.classList.toggle("active", parseInt(b.dataset.decks, 10) === state.numDecks);
        });
        document.querySelectorAll("[data-theme]").forEach(b => {
          b.classList.toggle("active", b.dataset.theme === state.tableTheme);
        });

        updateMenuSettingsAvailability();
      } catch (e) {
        console.error("Error loading settings", e);
      }
    }

    const savedState = localStorage.getItem("mendi_game_state");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.gameActive) {
          Object.assign(state, parsedState);

          PLAYER_LABELS[PLAYER_HUMAN] = state.playerName;
          const playerLblEl = document.querySelector(".slot-bottom-avatar .player-lbl");
          if (playerLblEl) playerLblEl.textContent = state.playerName;
          const scoreboardUsLbl = document.getElementById("scoreboard-us-lbl");
          if (scoreboardUsLbl) scoreboardUsLbl.textContent = `${state.playerName}:`;

          applyTableTheme(state.tableTheme);

          setupOverlay.classList.add("hidden");
          gameLayout.classList.remove("hidden");
          gameoverOverlay.classList.add("hidden");

          resizeBoard();

          trickPileEl.innerHTML = "";
          renderPlayerHand();
          updatePlayerCardCountsHUD();
          updatePlayerTricksHUD();

          pScoreEl.textContent = state.scores.playerTeam;
          oppScoreEl.textContent = state.scores.opponentTeam;
          if (pTricksScoreEl) pTricksScoreEl.textContent = `${state.tricksWon.playerTeam}/${state.tricksPerRound}`;
          if (oppTricksScoreEl) oppTricksScoreEl.textContent = `${state.tricksWon.opponentTeam}/${state.tricksPerRound}`;

          pMendiCardsEl.innerHTML = "";
          oppMendiCardsEl.innerHTML = "";
          state.mendisCollected.playerTeam.forEach(card => appendMendiBadge(pMendiCardsEl, card));
          state.mendisCollected.opponentTeam.forEach(card => appendMendiBadge(oppMendiCardsEl, card));

          if (logBoxEl) {
            logBoxEl.innerHTML = "";
            state.logs.forEach(log => {
              const entry = document.createElement("div");
              entry.className = `log-entry ${log.type}`;
              entry.innerHTML = log.text;
              logBoxEl.appendChild(entry);
            });
            logBoxEl.scrollTop = logBoxEl.scrollHeight;
          }

          state.currentTrick = state.currentTrick.map(play => {
            const wrapper = document.createElement("div");
            wrapper.className = "card-wrapper trick-card";
            
            const inner = document.createElement("div");
            inner.className = "card-inner";

            const front = document.createElement("div");
            front.className = `card-front ${play.card.suit}`;
            front.innerHTML = getCardFrontHTML(play.card);

            const back = document.createElement("div");
            back.className = "card-back";

            inner.appendChild(front);
            inner.appendChild(back);
            wrapper.appendChild(inner);

            trickPileEl.appendChild(wrapper);
            positionTrickCard(wrapper, play.player);

            return {
              player: play.player,
              card: play.card,
              el: wrapper
            };
          });

          updateHukumStatusUI();

          if (state.hukumSelectionPhase && state.hukum.secretChooser === PLAYER_HUMAN) {
            showHukumSelectionOverlay();
          } else if (state.hukumSelectionPhase) {
            const chooserName = PLAYER_LABELS[state.hukum.secretChooser];
            indicatorLblEl.textContent = `${chooserName.toUpperCase()} IS CHOOSING HUKUM...`;
            indicatorLblEl.style.color = "var(--color-accent)";
            
            state.dealTimer = setTimeout(() => {
              state.dealTimer = null;
              const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)].id;
              state.hukum.secretSuit = randomSuit;
              state.hukumSelectionPhase = false;
              
              indicatorLblEl.textContent = "";
              indicatorLblEl.style.color = "var(--color-primary)";
              addLog(`${chooserName} has chosen a secret Hukum.`, "hukum");
              updateHukumStatusUI();
              saveGameState();
              dealAllCards();
            }, 1000);
          } else if (state.isDealing) {
            state.isDealing = false;
            saveGameState();
            startTrickCycle();
          } else {
            updateHUDIndicator();
            if (state.turn !== PLAYER_HUMAN && !state.waitingForTrickTransition) {
              state.aiTimer = setTimeout(triggerAILogicalPlay, 800);
            } else if (state.currentTrick.length === 4) {
              indicatorLblEl.textContent = "Completing trick...";
              indicatorLblEl.style.color = "#8c9cb5";
              pHandEl.classList.add("not-my-turn");
              state.aiTimer = setTimeout(evaluateTrickWinner, 1000);
            }
          }
        }
      } catch (e) {
        console.error("Error loading game state", e);
      }
    }
  }

  function resizeBoard() {
    const container = document.getElementById("board-container");
    const content = document.getElementById("board-content");
    if (!container || !content) return;

    const targetWidth = 1024;
    const targetHeight = 700;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scaleX = containerWidth / targetWidth;
    const scaleY = containerHeight / targetHeight;
    const scale = Math.min(scaleX, scaleY);

    content.style.transform = `translate(-50%, -50%) scale(${scale})`;

    // Recalculate hand card margins and refresh layout on window resize
    if (state.gameActive && !state.isDealing) {
      renderPlayerHand();
    }
  }

  // Setup resize listeners
  window.addEventListener("resize", resizeBoard);

  // Load saved settings and game state on startup
  loadGameState();
})();
