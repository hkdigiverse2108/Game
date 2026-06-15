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
    hukumMode: "closed", // "closed" or "open"
    difficulty: "medium", // "easy" | "medium" | "hard"
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
    isDealing: false,
    visualCardCounts: [0, 0, 0, 0],
    tableTheme: "green",
    waitingForTrickTransition: false // Blocks clicking during evaluations/sweeps
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
    });
  });

  document.querySelectorAll("[data-diff]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-diff]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.difficulty = btn.dataset.diff;
    });
  });

  document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-theme]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.tableTheme = btn.dataset.theme;
      applyTableTheme(state.tableTheme);
    });
  });

  document.getElementById("start-game-btn").addEventListener("click", startGame);
  document.getElementById("sort-hand-btn").addEventListener("click", () => {
    if (state.isDealing || state.hukumSelectionPhase) return;
    sortHand(PLAYER_HUMAN);
    renderPlayerHand();
  });
  document.getElementById("play-again-btn").addEventListener("click", restartToMenu);
  document.getElementById("exit-btn").addEventListener("click", restartToMenu);

  // Hukum suit selector overlay click listeners
  document.querySelectorAll(".suit-select-btn-large").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!state.hukumSelectionPhase || state.hukum.secretChooser !== PLAYER_HUMAN) return;
      selectHukumSuit(btn.dataset.suit);
    });
  });

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

  // 1. Start Game Configuration
  function startGame() {
    const nameInput = document.getElementById("player-name").value.trim();
    state.playerName = nameInput || "Player";
    PLAYER_LABELS[PLAYER_HUMAN] = state.playerName;

    setupOverlay.classList.add("hidden");
    gameLayout.classList.remove("hidden");
    gameoverOverlay.classList.add("hidden");

    // Randomize dealer at the start of the session
    state.dealer = Math.floor(Math.random() * 4);

    resetGameState();
    applyTableTheme(state.tableTheme);
    initRound();
  }

  function resetGameState() {
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

    // Reset turn explicitly to the player to the right of the dealer
    state.turn = (state.dealer + 1) % 4;

    // Hide Hukum selector overlay in case it was open
    if (hukumSelectOverlayEl) {
      hukumSelectOverlayEl.classList.add("hidden");
    }

    // Clear any active AI timers
    if (state.aiTimer) {
      clearTimeout(state.aiTimer);
      state.aiTimer = null;
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
    if (logBoxEl) {
      logBoxEl.innerHTML = `<div class="log-entry system">Welcome, ${state.playerName}! Starting new round.</div>`;
    }
    
    // Reset Hukum display
    updateHukumStatusUI();
  }

  // Helper: pause execution
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  function getRelativePos(el) {
    const boardEl = document.getElementById("board-container");
    const boardRect = boardEl.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - boardRect.left,
      y: rect.top + rect.height / 2 - boardRect.top
    };
  }

  // Parallel staggered dealing engine
  async function dealCardsStaggered(cardsToDeal, staggerMs = 60) {
    // Pre-calculate and cache target positions to prevent layout thrashing (forced synchronous reflows)
    const boardEl = document.getElementById("board-container");
    if (!boardEl) return;
    
    const deckEl = document.getElementById("deck-stack");
    const deckPos = deckEl ? getRelativePos(deckEl) : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Cache slot positions
    const slotPositions = {};
    const ids = ["", "slot-opp1", "slot-partner", "slot-opp2"];
    for (let p = 1; p < 4; p++) {
      const el = document.getElementById(ids[p]);
      if (el) {
        slotPositions[p] = getRelativePos(el);
      }
    }
    
    // Cache human hand card positions
    const handCardPositions = new Map();
    pHandEl.querySelectorAll(".hand-card").forEach(cardEl => {
      const suit = cardEl.dataset.suit;
      const value = cardEl.dataset.value;
      if (suit && value) {
        handCardPositions.set(`${suit}-${value}`, getRelativePos(cardEl));
      }
    });
    
    // Default position for human hand container
    const handContainerEl = document.querySelector(".bottom-hand-container");
    const handContainerPos = handContainerEl ? getRelativePos(handContainerEl) : { x: window.innerWidth / 2, y: window.innerHeight - 100 };
    
    const cachedPositions = {
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
      const boardEl = document.getElementById("board-container");
      
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

  // 2. Initialize Round (Deal 5 Cards first, Choose Hukum, then remaining 8)
  async function initRound() {
    state.isDealing = true;

    // Generate standard 52 deck
    state.deck = [];
    SUITS.forEach(suit => {
      VALUES.forEach(val => {
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

    addLog(`<b>${PLAYER_LABELS[state.dealer]}</b> is dealing the cards...`, "system");

    // Deal first 5 cards to each player (total 20 cards) in memory first
    let nextPlayer = (state.dealer + 1) % 4;
    const firstDealCards = [];
    for (let round = 0; round < 5; round++) {
      for (let offset = 0; offset < 4; offset++) {
        const playerIdx = (nextPlayer + offset) % 4;
        const card = state.deck.shift();
        state.hands[playerIdx].push(card);
        firstDealCards.push({ playerIdx, card });
      }
    }

    // Sort human hand
    sortHand(PLAYER_HUMAN);

    // Render human hand with all 5 cards hidden initially
    renderPlayerHand(true);

    // Deal first 5 cards with 60ms stagger in parallel
    await dealCardsStaggered(firstDealCards, 60);

    // Auto sort AI hands
    for (let p = 1; p < 4; p++) {
      sortHand(p);
    }

    // Keep state.isDealing = true to block hand interaction during Hukum selection and the remaining deal

    // Trigger Hukum selection
    if (state.hukumMode === "closed") {
      state.hukum.secretChooser = (state.dealer + 1) % 4;
      addLog(`<b>${PLAYER_LABELS[state.hukum.secretChooser]}</b> must choose the secret Hukum suit.`, "system");
      
      if (state.hukum.secretChooser === PLAYER_HUMAN) {
        state.hukumSelectionPhase = true;
        indicatorLblEl.textContent = "SELECT A SUIT FOR HUKUM (TRUMP)";
        indicatorLblEl.style.color = "var(--color-accent)";
        addLog("It is your turn to select the secret Hukum. Choose a suit from the overlay.", "system");
        updateHukumStatusUI();
        showHukumSelectionOverlay();
      } else {
        // AI chooses secret Hukum
        state.hukumSelectionPhase = false;
        const aiChooser = state.hukum.secretChooser;
        // AI chooses the suit of which it has the most cards in its 5 cards
        const suitCounts = {};
        state.hands[aiChooser].forEach(c => {
          suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
        });
        let bestSuit = SUITS[0].id;
        let maxCount = 0;
        for (const suit in suitCounts) {
          if (suitCounts[suit] > maxCount) {
            maxCount = suitCounts[suit];
            bestSuit = suit;
          }
        }
        state.hukum.secretSuit = bestSuit;
        addLog(`${PLAYER_LABELS[aiChooser]} chose a secret Hukum suit.`, "system");
        updateHukumStatusUI();
        
        // Deal remaining cards after a short delay
        setTimeout(dealRemainingCards, 500);
      }
    } else {
      addLog("Hukum mode is Open. The first suit cut will determine the trump.", "system");
      updateHukumStatusUI();
      // Deal remaining cards after a short delay
      setTimeout(dealRemainingCards, 500);
    }
  }

  function showHukumSelectionOverlay() {
    if (!hukumSelectOverlayEl) return;
    
    // In Mendi, the player selects the Hukum from the 5 cards in their hand.
    const playerSuits = new Set(state.hands[PLAYER_HUMAN].map(c => c.suit));
    
    hukumSelectOverlayEl.querySelectorAll(".suit-select-btn-large").forEach(btn => {
      const suitId = btn.dataset.suit;
      if (playerSuits.has(suitId)) {
        btn.disabled = false;
        btn.classList.remove("disabled");
      } else {
        btn.disabled = true;
        btn.classList.add("disabled");
      }
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
    
    // Deal the remaining 8 cards
    setTimeout(dealRemainingCards, 300);
  }

  async function dealRemainingCards() {
    state.isDealing = true;

    const deckStackEl = document.getElementById("deck-stack");
    let nextPlayer = (state.dealer + 1) % 4;

    const remainingCards = [];
    const humanNewCards = [];
    // Deal the remaining 32 cards (8 to each of the 4 players)
    for (let round = 0; round < 8; round++) {
      for (let offset = 0; offset < 4; offset++) {
        const playerIdx = (nextPlayer + offset) % 4;
        const card = state.deck.shift();
        state.hands[playerIdx].push(card);
        remainingCards.push({ playerIdx, card });
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

    // Staggered parallel deal of remaining 32 cards (40ms stagger)
    await dealCardsStaggered(remainingCards, 40);

    state.isDealing = false;
    addLog("Remaining cards dealt. The round begins!", "system");
    
    if (deckStackEl) {
      deckStackEl.classList.add("hidden");
    }

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
  function animateDealtCards() {
    renderPlayerHand();
    updatePlayerCardCountsHUD();
  }

  function renderPlayerHand(cardsToHide = null) {
    pHandEl.innerHTML = "";
    
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

    state.hands[PLAYER_HUMAN].forEach((card, idx) => {
      const wrapper = document.createElement("div");
      wrapper.className = "card-wrapper hand-card";
      wrapper.style.zIndex = 10 + idx;
      wrapper.dataset.suit = card.suit;
      wrapper.dataset.value = card.value;
      wrapper.cardData = card;

      // Hide if requested
      if (cardsToHide) {
        if (cardsToHide === true || (Array.isArray(cardsToHide) && cardsToHide.some(c => c.suit === card.suit && c.value === card.value))) {
          wrapper.classList.add("dealt-hidden");
        }
      }

      // Check playability
      const playable = isCardPlayable(PLAYER_HUMAN, card);
      if (!playable && state.currentTrick.length > 0 && state.turn === PLAYER_HUMAN) {
        wrapper.classList.add("unplayable");
      }

      const inner = document.createElement("div");
      inner.className = "card-inner";

      const front = document.createElement("div");
      front.className = `card-front ${card.suit}`;
      front.innerHTML = `
        <div class="card-corner top">
          <span>${card.name}</span>
          <span>${card.symbol}</span>
        </div>
        <div class="card-center-suit">${card.symbol}</div>
        <div class="card-corner bottom">
          <span>${card.name}</span>
          <span>${card.symbol}</span>
        </div>
      `;

      const back = document.createElement("div");
      back.className = "card-back";

      inner.appendChild(front);
      inner.appendChild(back);
      wrapper.appendChild(inner);
      pHandEl.appendChild(wrapper);

      // Play card click
      wrapper.addEventListener("click", () => {
        if (state.isDealing) return;
        if (state.hukumSelectionPhase) return;
        if (state.turn !== PLAYER_HUMAN || !playable || !state.gameActive || state.waitingForTrickTransition) return;
        playHumanCard(card, idx, wrapper);
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
    const tx = rect.left - centerRect.left;
    const ty = rect.top - centerRect.top;

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
    front.innerHTML = `
      <div class="card-corner top">
        <span>${cardToPlay.name}</span>
        <span>${cardToPlay.symbol}</span>
      </div>
      <div class="card-center-suit">${cardToPlay.symbol}</div>
      <div class="card-corner bottom">
        <span>${cardToPlay.name}</span>
        <span>${cardToPlay.symbol}</span>
      </div>
    `;

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
    }

    state.currentTrick.push({
      player: aiIdx,
      card: cardToPlay,
      el: wrapper
    });

    addLog(`${PLAYER_LABELS[aiIdx]} played ${cardToPlay.name} of ${cardToPlay.suitName} ${cardToPlay.symbol}`, "ai");

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
    
    const tx = rect.left - centerRect.left + (rect.width/2) - 38;
    const ty = rect.top - centerRect.top + (rect.height/2) - 55;
    
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
      const partnerWins = isPartnerWinning();
      if (partnerWins) {
        // Discard a 10 (Mendi) to partner, or play low card to save strength
        const tenCard = suitCards.find(c => c.value === 10);
        if (tenCard) return tenCard;
        return suitCards[suitCards.length - 1]; // Low card
      } else {
        // Try to beat current high card
        const currentHigh = getCurrentTrickHighCard();
        const winningCards = suitCards.filter(c => c.value > currentHigh.value);
        if (winningCards.length > 0) {
          // Play lowest winning card to win the trick efficiently
          return winningCards[winningCards.length - 1];
        }
        // Cannot win, play lowest card
        return suitCards[suitCards.length - 1];
      }
    }

    // If cannot follow suit (Cut opportunity)
    // Closed Hukum Mode check
    if (state.hukumMode === "closed" && !state.hukum.revealed) {
      // If trick contains a 10 (Mendi) and we want to win it
      const containsTen = state.currentTrick.some(t => t.card.value === 10);
      if (containsTen && !isPartnerWinning()) {
        // Reveal Hukum!
        revealClosedHukum(playerIdx);
        // After reveal, filter cards of revealed hukum if they exist
        const hukumCards = state.hands[playerIdx].filter(c => c.suit === state.hukum.suit);
        if (hukumCards.length > 0) {
          return hukumCards[0]; // Cut with highest trump
        }
      }
    } else if (state.hukum.revealed) {
      // Trump is already revealed, play trump card to cut if partner isn't winning
      if (!isPartnerWinning()) {
        const trumps = validCards.filter(c => c.suit === state.hukum.suit);
        if (trumps.length > 0) {
          return trumps[0]; // Play highest trump to win
        }
      }
    } else if (state.hukumMode === "open") {
      // Open mode: first discard determines Hukum!
      // Select the suit of which the AI has the most cards in hand (to make it trump)
      const suitCounts = {};
      validCards.forEach(c => {
        suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
      });
      let bestSuit = validCards[0].suit;
      let maxCount = 0;
      for (const suit in suitCounts) {
        if (suitCounts[suit] > maxCount) {
          maxCount = suitCounts[suit];
          bestSuit = suit;
        }
      }
      const bestSuitCards = validCards.filter(c => c.suit === bestSuit);
      const discard = bestSuitCards[bestSuitCards.length - 1];
      setOpenHukum(discard.suit, playerIdx);
      return discard;
    }

    // Default fallback: play lowest value card
    return validCards[validCards.length - 1];
  }

  function isPartnerWinning() {
    if (state.currentTrick.length === 0) return false;
    
    // Evaluate who is winning so far
    let bestPlay = state.currentTrick[0];
    for (let i = 1; i < state.currentTrick.length; i++) {
      const play = state.currentTrick[i];
      if (compareTwoCards(play.card, bestPlay.card) > 0) {
        bestPlay = play;
      }
    }
    
    // Partner of playerIdx turn is (turn + 2) % 4
    // If the active player is turn, their partner is (turn + 2) % 4
    const partnerIdx = (state.turn + 2) % 4;
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
    // Trump suit check
    if (state.hukum.revealed) {
      if (cardA.suit === state.hukum.suit && cardB.suit !== state.hukum.suit) return 1;
      if (cardB.suit === state.hukum.suit && cardA.suit !== state.hukum.suit) return -1;
      if (cardA.suit === state.hukum.suit && cardB.suit === state.hukum.suit) {
        return cardA.value - cardB.value;
      }
    }

    // Lead suit check
    if (cardA.suit === state.leadSuit && cardB.suit !== state.leadSuit) return 1;
    if (cardB.suit === state.leadSuit && cardA.suit !== state.leadSuit) return -1;
    
    // Values check
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
          hukumIconEl.textContent = "🔒";
          hukumIconEl.style.color = "#ffffff";
          hukumTextEl.textContent = "Secret Set";
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
    } else {
      state.tricksWon.opponentTeam++;
      oppScoreEl.textContent = state.scores.opponentTeam;
    }

    // Track tricks won by individual players
    state.tricksWonByPlayer[winnerIdx]++;
    updatePlayerTricksHUD();

    // Sweep card elements to winner avatar
    animateTrickSweep(winnerIdx);

    // Set next trick leader
    state.turn = winnerIdx;
    state.tricksPlayed++;

    // Check end of round
    if (state.tricksPlayed < 13) {
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
    const slot = document.querySelector(`.player-slot[id="slot-${getPlayerSlotId(winnerIdx)}"]`);
    if (!slot) return;
    const rect = slot.getBoundingClientRect();
    const centerRect = trickPileEl.getBoundingClientRect();
    
    const tx = rect.left - centerRect.left + (rect.width/2) - 38;
    const ty = rect.top - centerRect.top + (rect.height/2) - 55;

    state.currentTrick.forEach(play => {
      play.el.style.transform = `translate(${tx}px, ${ty}px) scale(0.2)`;
      play.el.style.opacity = "0";
    });
  }

  // 8. End Game and Score Tallies
  function endGameRound() {
    state.gameActive = false;
    
    const teamMendis = state.scores.playerTeam;
    const oppMendis = state.scores.opponentTeam;
    
    // Resolve ties in Mendis (2-2) by looking at trick counts
    let isVictory = false;
    if (teamMendis > oppMendis) {
      isVictory = true;
    } else if (teamMendis === oppMendis) {
      isVictory = state.tricksWon.playerTeam > state.tricksWon.opponentTeam;
    }

    let isKot = (teamMendis === 4) || (oppMendis === 4);

    winStatusLblEl.textContent = isVictory ? "VICTORY!" : "DEFEAT";
    winStatusLblEl.className = `neon-text font-digit ${isVictory ? '' : 'color-red'}`;

    let msg = `You captured ${teamMendis} Mendis (10s)`;
    if (isKot) {
      msg = isVictory ? "🏆 MENDIKOT (CLEAN SWEEP) ACHIEVED!" : "💀 OPPONENTS TOOK ALL 4 MENDIS (KOT)";
    }
    gameoverMessageEl.textContent = msg;

    statMendisCapturedEl.textContent = `${teamMendis} / 4`;
    statTricksWonEl.textContent = `${state.tricksWon.playerTeam} / 13`;
    statKotStatusEl.textContent = isKot ? "Yes" : "No";

    // Determine if dealer's team won the round
    const dealerTeam = getTeam(state.dealer); // 0 for player/partner, 1 for opponents
    const winningTeam = isVictory ? 0 : 1;
    
    if (dealerTeam !== winningTeam) {
      // Dealer's team lost, deal passes to the right
      state.dealer = (state.dealer + 1) % 4;
      addLog(`Dealer team lost the round. Deal passes to <b>${PLAYER_LABELS[state.dealer]}</b>.`, "system");
    } else {
      addLog(`Dealer team won the round. <b>${PLAYER_LABELS[state.dealer]}</b> retains the deal.`, "system");
    }

    gameoverOverlay.classList.remove("hidden");
  }

  function restartToMenu() {
    if (state.aiTimer) {
      clearTimeout(state.aiTimer);
      state.aiTimer = null;
    }
    gameoverOverlay.classList.add("hidden");
    gameLayout.classList.add("hidden");
    setupOverlay.classList.remove("hidden");
  }

  // System Logs Handler
  function addLog(text, type = "default") {
    console.log(`[Mendi Log - ${type}]`, text);
    if (!logBoxEl) return;
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.innerHTML = text;
    logBoxEl.appendChild(entry);
    
    // Auto scroll to bottom
    logBoxEl.scrollTop = logBoxEl.scrollHeight;
  }
})();
