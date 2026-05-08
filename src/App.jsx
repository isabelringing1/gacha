import { useState, useEffect, useRef } from "react";
import {
  roll,
  rollMultiple,
  rollForPack,
  rollForBet,
  getPackCost,
  getRarity,
  getNextCharm,
  rollEventNumber,
  rollEvent,
  generateEnemyForLevel,
  generateCombatRewards,
  getFactors,
  getLevel,
  getLevelData,
} from "./Util";
import { UNLOCK_ENTRY_COST } from "./constants.js";
import ticket from "/ticket.png";
import keyIcon from "/key.png";

import "./App.css";

import NumberGrid from "./NumberGrid";
import Debug from "./Debug";
import Timer from "./Timer";
import SplashDisplayFront from "./SplashDisplayFront";
import SplashDisplayBack from "./SplashDisplayBack";
import PackShop from "./PackShop";
import OutOfHeartsContainer from "./OutOfHeartsContainer";
import MenusContainer from "./MenusContainer.jsx";
import CardPack from "./CardPack.jsx";
import CharmShop from "./CharmShop";
import Sportsbook from "./Sportsbook.jsx";
import MenuTooltip from "./MenuTooltip.jsx";
import EventBanner from "./EventBanner.jsx";
import Event from "./Event.jsx";
import History from "./History.jsx";
import Combat from "./Combat.jsx";
import AboutCombat from "./AboutCombat.jsx";
import About from "./About.jsx";
import ResetPopup from "./ResetPopup.jsx";
import Achievements from "./Achievements.jsx";
import WinPopup from "./WinPopup.jsx";
import packData from "./json/packs.json";

import arrow from "/arrow.png";
var hearts = "&diams;&#xfe0e;";
var diamonds = "&#x2660;&#xfe0e;";
var club = "&#x2663;&#xfe0e;";
var spade = "&#x2660;&#xfe0e;";

import {
  REFRESH_TIME,
  REFRESH_ENTRY_BASE_COST,
  BASE_MAX_DIAMONDS,
  BASE_MAX_HEARTS,
  PACK_LIFETIME,
  NUM_TABS,
  UNLOCK_PACK_SHOP_COST,
  UNLOCK_ACHIEVEMENTS_COST,
  UNLOCK_CHARM_SHOP_COST,
  UNLOCK_SPORTSBOOK_COST,
  UNLOCK_BATTLE_SHOP_COST,
  isMobile,
} from "./constants.js";
import { s } from "motion/react-client";

function App() {
  const [numbers, setNumbers] = useState({});
  const [rolls, setRolls] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [highlightedNumber, setHighlightedNumber] = useState(-1);
  const [rolledNumber, setRolledNumber] = useState(-1);
  const [diamonds, setDiamonds] = useState(BASE_MAX_DIAMONDS);
  const [hearts, setHearts] = useState(0);
  const [maxHearts, setMaxHearts] = useState(BASE_MAX_HEARTS);
  const [nextDiamondRefreshTime, setNextDiamondRefreshTime] = useState(null);
  const [showingRoll, setShowingRoll] = useState(-1);
  const [bigNumberQueue, setBigNumberQueue] = useState([]);
  const [currentPack, setCurrentPack] = useState(null);
  const [numPacksOpened, setNumPacksOpened] = useState(0);
  const [numRollButtonClicks, setNumRollButtonClicks] = useState(0);
  const [numBattles, setNumBattles] = useState(0);

  const [packShopState, setPackShopState] = useState("hidden"); //hidden, locked, unlocked
  const [packShopEntriesUnlocked, setPackShopEntriesUnlocked] = useState([
    true,
    true,
    false,
    false,
  ]);
  const [cardShopEntries, setCardShopEntries] = useState([
    null,
    null,
    null,
    null,
  ]);

  const [sportsbookState, setSportsbookState] = useState("hidden"); //hidden, locked, unlocked
  const [sportsbookEntries, setSportsbookEntries] = useState([null, null]);

  const [charmShopState, setCharmShopState] = useState("hidden");
  const [charmShopEntries, setCharmShopEntries] = useState([0, 0, 0, 0]);
  const [purchasedCharms, setPurchasedCharms] = useState([]);
  const [tenPullUnlocked, setTenPullUnlocked] = useState(false);
  const [multiRollHighlights, setMultiRollHighlights] = useState([]);
  const [multiRolledNumbers, setMultiRolledNumbers] = useState([]);
  const [claimedAchievements, setClaimedAchievements] = useState([]);
  const [achievementsState, setAchievementsState] = useState("hidden");
  const [animating, setAnimating] = useState(false);
  
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [showOutOfDiamonds, setShowOutOfDiamonds] = useState(false);
  const [maxDiamonds, setMaxDiamonds] = useState(BASE_MAX_DIAMONDS);
  const [highlightedNumbers, setHighlightedNumbers] = useState([]);
  const [badgedNumbers, setBadgedNumbers] = useState([]);
  const [mobileMenuIndex, setMobileMenuIndex] = useState(0);
  const [goal, setGoal] = useState(0);
  const [hoveredPack, setHoveredPack] = useState(null);
  const [mousePos, setMousePos] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [lastPackOpened, setLastPackOpened] = useState(null);
  const [rarityHighlightUnlocked, setRarityHighlightUnlocked] = useState(true);
  const [showCombat, setShowCombat] = useState(false);
  const [selectingIndex, setSelectingIndex] = useState(-1);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [combatUnlocked, setCombatUnlocked] = useState(false);
  const [combatState, setCombatState] = useState(() => {
    var enemyValue = generateEnemyForLevel(1);
    return {
      level: 1,
      team: [null, null, null],
      numberStates: {},
      combatLevel: 1,
      active: false,
      currentEnemyValue: enemyValue,
      levelRewards: generateCombatRewards(1, enemyValue),
      combatTickets: 3,
    };
  });
  const [combatHighScore, setCombatHighScore] = useState(null);
  const [clubs, setClubs] = useState(0);
  const [spades, setSpades] = useState(0);
  const [clubsUnlocked, setClubsUnlocked] = useState(false);
  const [heartsUnlocked, setHeartsUnlocked] = useState(false);
  const [spadesUnlocked, setSpadesUnlocked] = useState(false);
  const [keys, setKeys] = useState(0);
  const [keysUnlocked, setKeysUnlocked] = useState(false);
  const [showReequip, setShowReequip] = useState(false);
  const [isDraggingNumber, setIsDraggingNumber] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [hasShownWinPopup, setHasShownWinPopup] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [pendingWinPopup, setPendingWinPopup] = useState(false);
  const [combatButtonSeen, setCombatButtonSeen] = useState(false);
  const [outOfDiamondsSeen, setOutOfDiamondsSeen] = useState(false);
  const [ticketBoughtSeen, setTicketBoughtSeen] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [lastBattledLevel, setLastBattledLevel] = useState(0);
  const [diamondsUnlocked, setDiamondsUnlocked] = useState(false);
  const [battleShopState, setBattleShopState] = useState("unlocked");
  const winBattleRef = useRef(null);
  const [lockedNumbers, setLockedNumbers] = useState(() => {
    var locked = [];
    while (locked.length < 5) {
      var n = Math.floor(Math.random() * 100) + 1;
      if (!locked.includes(n)) {
        locked.push(n);
      }
    }
    return locked;
  });
  const [lockedRollCounts, setLockedRollCounts] = useState({});


  const saveDataRef = useRef();
  useEffect(() => {
    saveDataRef.current = saveData;
  });

  useEffect(() => {
    loadData();
    const onFocus = () => {
      console.log('User is back on the page, saving');
      saveDataRef.current();
    };
    window.addEventListener('focus', onFocus);

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onSpacePressed);
    return () => window.removeEventListener("keydown", onSpacePressed);
  }, [showingRoll, hearts, animating, bigNumberQueue]);

  const onSpacePressed = (e) => {
    if (e.key == " " && !isRollButtonDisabled()) {
      //rollNumber();
    }
  };

  useEffect(() => {
    if (rolls.length >= 25 && !combatUnlocked) {
      setCombatUnlocked(true);
      setCombatState((oldCombatState) => {
        return {
          ...oldCombatState,
          team: getInitialTeam(rolls, numbers),
        };
      });
    }
    if (rolls.length >= 3 && achievementsState == "hidden") {
      setAchievementsState("unlocked");
    }
    if (rolls.length >= 10 && packShopState == "hidden") {
      setPackShopState("locked");
    }
    if (
      rolls.length >= 15 &&
      bigNumberQueue.length == 0 &&
      charmShopState == "hidden"
    ) {
      setCharmShopState("locked");
    }
    if (
      rolls.length >= 30 &&
      bigNumberQueue.length == 0 &&
      sportsbookState == "hidden"
    ) {
      setSportsbookState("locked");
    }
  }, [rolls, bigNumberQueue]);

  useEffect(() => {
    if (spades > 0 && !spadesUnlocked) {
      setSpadesUnlocked(true);
    }
    if (spadesUnlocked) {
      var spadesContainer = document.getElementById("spades-container");
      if (spadesContainer) {
        pulse(spadesContainer);
      }
    }
  }, [spades]);

  useEffect(() => {
    var heartsContainer = document.getElementById("hearts-container");
    if (heartsContainer) {
      pulse(heartsContainer);
    }
  }, [hearts]);

  useEffect(() => {
    var clubsContainer = document.getElementById("clubs-container");
    if (clubsContainer) {
      pulse(clubsContainer);
    }
  }, [clubs]);

  useEffect(() => {
    var diamondsContainer = document.getElementById("diamonds-container");
    if (diamondsContainer) {
      pulse(diamondsContainer);
    }
  }, [diamonds]);

  function pulse(item) {
    item.classList.remove("pulse");
    void item.offsetWidth;
    item.classList.add("pulse");
  }

  useEffect(() => {
    if (!showWinPopup && Object.keys(numbers).length === 100 && lockedNumbers.length === 0 && !hasShownWinPopup) {
      if (currentPack) {
        setPendingWinPopup(true);
      } else {
        setShowWinPopup(true);
      }
    }
  }, [numbers, lockedNumbers]);

  useEffect(() => {
    if (pendingWinPopup && !currentPack && !hasShownWinPopup) {
      setPendingWinPopup(false);
      setShowWinPopup(true);
    }
  }, [currentPack]);

  useEffect(() => {
    if (keys > 0 && !keysUnlocked) {
      setKeysUnlocked(true);
    }
  }, [keys]);

  useEffect(() => {
    var keysContainer = document.getElementById("keys-container");
    if (keysContainer) {
      pulse(keysContainer);
    }
  }, [keys]);

  useEffect(() => {
    if (clubs > 0 && !clubsUnlocked) {
      setClubsUnlocked(true);
    }
  }, [clubs]);

  useEffect(() => {
    if (heartsUnlocked) return;
    for (var n in numbers) {
      var ld = getLevelData(numbers[n]);
      if (ld && ld.shields > 0) {
        setHeartsUnlocked(true);
        break;
      }
    }
  }, [numbers, heartsUnlocked]);

  const isCombatLoading =
    showCombat &&
    !!combatState.nextLevelUnlockTime &&
    now < combatState.nextLevelUnlockTime;

  useEffect(() => {
    if (
      combatState.nextLevelUnlockTime &&
      Date.now() < combatState.nextLevelUnlockTime
    ) {
      setBadgedNumbers([]);
      return;
    }
    var currentEnemy = getCurrentEnemy();
    var factors = getFactors(currentEnemy);
    setBadgedNumbers(factors);
  }, [combatState, now]);

  useEffect(() => {
    saveData();
  }, [
    numbers,
    cardShopEntries,
    timeMultiplier,
    diamonds,
    hearts,
    maxHearts,
    spades,
    clubs,
    maxDiamonds,
    mobileMenuIndex,
    currentEvent,
    rarityHighlightUnlocked,
    combatState,
    combatHighScore,
    combatUnlocked,
    clubsUnlocked,
    heartsUnlocked,
    spadesUnlocked,
    keys,
    keysUnlocked,
    claimedAchievements,
    achievementsState,
    diamondsUnlocked,
    hasShownWinPopup,
    combatButtonSeen,
    outOfDiamondsSeen,
    ticketBoughtSeen,
    lastBattledLevel,
    tenPullUnlocked,
    lockedRollCounts,
  ]);

  function saveData() {
    var newPlayerData = {
      numbers: numbers,
      rolls: rolls,
      hearts: hearts,
      maxHearts: maxHearts,
      nextHeartRefreshTime: nextDiamondRefreshTime,
      sportsbookState: sportsbookState,
      sportsbookEntries: sportsbookEntries,
      packShopState: packShopState,
      packShopEntriesUnlocked: packShopEntriesUnlocked,
      cardShopEntries: cardShopEntries,
      diamonds: diamonds,
      timeMultiplier: timeMultiplier,
      maxDiamonds: maxDiamonds,
      charmShopState: charmShopState,
      charmShopEntries: charmShopEntries,
      purchasedCharms: purchasedCharms,
      mobileMenuIndex: mobileMenuIndex,
      currentEvent: currentEvent,
      lastPackOpened: lastPackOpened,
      rarityHighlightUnlocked: rarityHighlightUnlocked,
      combatState: combatState,
      combatHighScore: combatHighScore,
      combatUnlocked: combatUnlocked,
      battleShopState: battleShopState,
      spades: spades,
      clubs: clubs,
      clubsUnlocked: clubsUnlocked,
      heartsUnlocked: heartsUnlocked,
      spadesUnlocked: spadesUnlocked,
      keys: keys,
      keysUnlocked: keysUnlocked,
      claimedAchievements: claimedAchievements,
      achievementsState: achievementsState,
      diamondsUnlocked: diamondsUnlocked,
      numPacksOpened: numPacksOpened,
      numRollButtonClicks: numRollButtonClicks,
      numBattles: numBattles,
      startTime: startTime,
      hasShownWinPopup: hasShownWinPopup,
      lockedNumbers: lockedNumbers,
      lockedRollCounts: lockedRollCounts,
      combatButtonSeen: combatButtonSeen,
      outOfDiamondsSeen: outOfDiamondsSeen,
      ticketBoughtSeen: ticketBoughtSeen,
      lastBattledLevel: lastBattledLevel,
      tenPullUnlocked: tenPullUnlocked,
    };
    console.log('Saving data', newPlayerData);
    var saveString = JSON.stringify(newPlayerData);
    localStorage.setItem("gacha", window.btoa(saveString));
  }

  function loadData() {
    var saveData = localStorage.getItem("gacha");

    if (saveData != null) {
      try {
        saveData = JSON.parse(window.atob(saveData));
        setNumbers(saveData.numbers);
        setRolls(saveData.rolls);
        setSportsbookState(saveData.sportsbookState);
        setPackShopState(saveData.packShopState);
        setPackShopEntriesUnlocked(saveData.packShopEntriesUnlocked);
        setCardShopEntries(saveData.cardShopEntries);
        setDiamonds(saveData.diamonds);
        setHearts(saveData.hearts);
        setMaxHearts(saveData.maxHearts != null ? saveData.maxHearts : BASE_MAX_HEARTS);
        setTimeMultiplier(saveData.timeMultiplier);
        setMaxDiamonds(saveData.maxDiamonds);
        setCharmShopState(saveData.charmShopState);
        var loadedCharmEntries = saveData.charmShopEntries || [];
        while (loadedCharmEntries.length < 4) loadedCharmEntries.push(0);
        setCharmShopEntries(loadedCharmEntries);
        setPurchasedCharms(saveData.purchasedCharms);
        if (isMobile) {
          setMobileMenuIndex(saveData.mobileMenuIndex);
        }
        setSportsbookEntries(saveData.sportsbookEntries);
        setCurrentEvent(saveData.currentEvent);
        setLastPackOpened(saveData.lastPackOpened);
        setRarityHighlightUnlocked(saveData.rarityHighlightUnlocked);
        saveData.combatState.active = false;
        setCombatState(saveData.combatState);
        if (saveData.combatState && !saveData.combatState.combatLevel) {
          var enemyValue = generateEnemyForLevel(1);
          setCombatState((prev) => ({
            ...prev,
            combatLevel: 1,
            currentEnemyValue: enemyValue,
            levelRewards: generateCombatRewards(1, enemyValue),
            active: false,
          }));
        }
        setCombatUnlocked(saveData.combatUnlocked);
        if (saveData.battleShopState) setBattleShopState(saveData.battleShopState);
        setCombatHighScore(saveData.combatHighScore);
        setSpades(saveData.spades);
        setClubs(saveData.clubs);
        setClubsUnlocked(saveData.clubsUnlocked);
        setHeartsUnlocked(saveData.heartsUnlocked);
        setSpadesUnlocked(saveData.spadesUnlocked);
        setKeys(saveData.keys || 0);
        setKeysUnlocked(saveData.keysUnlocked || false);
        setClaimedAchievements(saveData.claimedAchievements || []);
        setAchievementsState(saveData.achievementsState || "hidden");
        setDiamondsUnlocked(saveData.diamondsUnlocked || (saveData.rolls && saveData.rolls.length > 0));
        setNumPacksOpened(saveData.numPacksOpened || 0);
        setNumRollButtonClicks(saveData.numRollButtonClicks || 0);
        setNumBattles(saveData.numBattles || 0);
        setStartTime(saveData.startTime || null);
        setHasShownWinPopup(saveData.hasShownWinPopup || false);
        if (saveData.lockedNumbers) setLockedNumbers(saveData.lockedNumbers);
        setLockedRollCounts(saveData.lockedRollCounts || {});
        setCombatButtonSeen(saveData.combatButtonSeen || false);
        setOutOfDiamondsSeen(saveData.outOfDiamondsSeen || false);
        setTicketBoughtSeen(saveData.ticketBoughtSeen || false);
        setLastBattledLevel(
          saveData.lastBattledLevel != null
            ? saveData.lastBattledLevel
            : (saveData.combatState && saveData.combatState.combatLevel) || 0
        );
        setTenPullUnlocked(
          saveData.tenPullUnlocked || (saveData.purchasedCharms || []).includes("ten-pull")
        );
        var t = saveData.nextHeartRefreshTime - Date.now();
        if (saveData.nextHeartRefreshTime && t <= 0) {
          var numDiamondsGained = 0;
          while (t <= 0 && saveData.diamonds + numDiamondsGained < saveData.maxDiamonds) {
            numDiamondsGained++;
            t += REFRESH_TIME;
          }
          var newDiamonds = Math.min(saveData.maxDiamonds, saveData.diamonds + numDiamondsGained);
          setDiamonds(newDiamonds);
          if (newDiamonds < saveData.maxDiamonds) {
            setNextDiamondRefreshTime(Date.now() + t);
          } else {
            setNextDiamondRefreshTime(null);
          }
        } else {
          setNextDiamondRefreshTime(saveData.nextHeartRefreshTime);
        }
      } catch (e) {
        return null;
      }
      return saveData;
    }
    return null;
  }

  const refreshDiamonds = () => {
    setDiamonds(Math.min(maxDiamonds, diamonds + 1));
    if (diamonds >= maxDiamonds) {
      setNextDiamondRefreshTime(null);
    } else {
      setNextDiamondRefreshTime(nextDiamondRefreshTime + REFRESH_TIME);
    }
  };

  const rollNumber = (e, cheatNumber = -1) => {
    if (!startTime) setStartTime(Date.now());
    setNumRollButtonClicks(numRollButtonClicks + 1);
    if (diamonds <= 0 && cheatNumber == -1) {
      return;
    }
    var rolledNumber = cheatNumber;
    setSelectingIndex(-1);

    if (cheatNumber == -1) {
      if (!diamondsUnlocked) setDiamondsUnlocked(true);
      setDiamonds(diamonds - 1);
      if (!nextDiamondRefreshTime) {
        setNextDiamondRefreshTime(Date.now() + REFRESH_TIME);
      }
      rolledNumber = roll();
      if (rolls.length < 2) {
        while (lockedNumbers.includes(rolledNumber)) {
          rolledNumber = roll();
        }
      }
    }
    showRolledNumber(rolledNumber, false);
  };

  const isRollTenButtonDisabled = () => {
    return (
      showingRoll != -1 ||
      diamonds < 10 ||
      animating ||
      bigNumberQueue.length > 0 ||
      multiRollHighlights.length > 0 ||
      multiRolledNumbers.length > 0
    );
  };

  const rollTen = () => {
    if (isRollTenButtonDisabled()) return;
    if (!startTime) setStartTime(Date.now());
    setNumRollButtonClicks(numRollButtonClicks + 1);
    if (!diamondsUnlocked) setDiamondsUnlocked(true);
    setDiamonds(diamonds - 10);
    if (!nextDiamondRefreshTime) {
      setNextDiamondRefreshTime(Date.now() + REFRESH_TIME);
    }

    var rolledNumbers = [];
    for (var i = 0; i < 10; i++) {
      rolledNumbers.push(roll());
    }

    setShowingRoll(0); // block other rolls during animation

    var T = 1500 * timeMultiplier; // total animation duration: all 10 rolls resolve at T
    var minDelay = 5 * timeMultiplier;
    var maxDelay = 300 * timeMultiplier;

    var currentCells = new Array(10).fill(null);
    var finishedCount = 0;

    var updateHighlights = () => {
      var set = new Set();
      for (var k = 0; k < 10; k++) {
        if (currentCells[k] != null) set.add(currentCells[k]);
      }
      setMultiRollHighlights(Array.from(set));
    };

    rolledNumbers.forEach((r, rollIdx) => {
      var total = r;
      if (r <= 30) total += 100;

      // Pre-compute cumulative eased delays for this roll, then scale so the
      // final tick lands at exactly T (so all 10 rolls resolve simultaneously).
      var rawDelays = [];
      var rawSum = 0;
      for (var i = 1; i <= total; i++) {
        var progress = i / total;
        var d = minDelay + (maxDelay - minDelay) * Math.pow(progress, 8);
        rawSum += d;
        rawDelays.push(rawSum);
      }
      var scale = rawSum > 0 ? T / rawSum : 1;

      for (var step = 1; step <= total; step++) {
        ((stepCaptured) => {
          var scheduledTime = rawDelays[stepCaptured - 1] * scale;
          setTimeout(() => {
            var cell = ((stepCaptured - 1) % 100) + 1;
            currentCells[rollIdx] = cell;
            updateHighlights();

            if (stepCaptured === total) {
              finishedCount++;
              if (finishedCount === 10) {
                // Hold highlights briefly, then settle to rolled numbers, then queue big numbers
                setTimeout(() => {
                  setMultiRollHighlights([]);
                  setMultiRolledNumbers(rolledNumbers);
                  setTimeout(() => {
                    setMultiRolledNumbers([]);
                    setShowingRoll(-1);
                    var newBigNumbers = rolledNumbers.map((n) => ({ n: n, fromPack: true }));
                    setBigNumberQueue((prev) => [...prev, ...newBigNumbers]);
                  }, 300 * timeMultiplier);
                }, 400 * timeMultiplier);
              }
            }
          }, scheduledTime);
        })(step);
      }
    });
  };

  const showRolledNumber = (n, fromPack) => {
    if (showingRoll != -1) {
      return;
    }
    setShowingRoll(n);
    var total = n;
    if (n <= 30) {
      total += 100;
    }
    const minDelay = 5 * timeMultiplier; // minimum delay at the start (fast)
    const maxDelay = 300 * timeMultiplier; // maximum delay at the end (slow)

    let cumulativeDelay = 0;
    for (let i = 1; i <= total; i++) {
      // Quartic ease-out: progress from 0 to 1, raised to 4th power to slow down at the end
      const progress = i / total;
      const delay = minDelay + (maxDelay - minDelay) * Math.pow(progress, 8);
      cumulativeDelay += delay;
      if (i == total) {
        if (Math.random() < 0.5) {
          cumulativeDelay += delay; //doubles
        }
      }

      setTimeout(() => {
        var n = ((i - 1) % 100) + 1;
        setHighlightedNumber(n);
        if (i == total) {
          setTimeout(() => {
            setHighlightedNumber(-1);
            setRolledNumber(n);
            setTimeout(() => {
              setRolledNumber(-1);
              setShowingRoll(-1);
              var nextBigNumber = {
                n: n,
                fromPack: fromPack,
              };
              setBigNumberQueue((prev) => [...prev, nextBigNumber]);
            }, 300 * timeMultiplier);
          }, 500 * timeMultiplier);
        }
      }, cumulativeDelay);
    }
  };

  const generatePackShopEntry = (amount = 1, slots = [-1], rarities = []) => {
    var firstNullIndex = 0;
    var newShopEntries = [...cardShopEntries];
    for (var j = 0; j < amount; j++) {
      if (slots[0] == -1) {
        for (var i = 0; i < newShopEntries.length; i++) {
          if (newShopEntries[i] == null) {
            break;
          }
          firstNullIndex++;
        }
      } else {
        firstNullIndex = slots[j];
      }

      if (firstNullIndex == newShopEntries.length) {
        return;
      }
      var forcedRarity = rarities[j];
      var pack = rollForPack(forcedRarity);
      var existingIds = new Set(newShopEntries.filter(Boolean).map((e) => e.id));
      while (
        (pack.id == "copycat" && !lastPackOpened) ||
        existingIds.has(pack.id)
      ) {
        pack = rollForPack(forcedRarity);
      }
      var newEntry = {
        id: pack.id,
        creation: Date.now(),
        expirationTime: Date.now() + PACK_LIFETIME,
      };

      newShopEntries[firstNullIndex] = newEntry;
    }
    setCardShopEntries(newShopEntries);
  };

  const generateBet = (slots = [0]) => {
    var newSportsbookEntries = [...sportsbookEntries];
    for (var i = 0; i < slots.length; i++) {
      var bet = rollForBet(slots[i]);
      var newEntry = {
        id: bet.id,
        creation: Date.now(),
        rolls: [],
      };
      newSportsbookEntries[slots[i]] = newEntry;
    }
    setSportsbookEntries(newSportsbookEntries);
  };

  const trySwipe = (direction) => {
    if (mobileMenuIndex == 0 && direction < 0) {
      return;
    } else if (mobileMenuIndex == NUM_TABS - 1 && direction > 0) {
      return;
    }
    setMobileMenuIndex(mobileMenuIndex + direction);
  };

  const getGoalPercent = () => {
    if (goal == 0) {
      return Object.keys(numbers).length;
    }
    return 0;
  };

  const canUnlockPackShop = () => {
    return packShopState == "locked" && spades >= UNLOCK_PACK_SHOP_COST;
  };

  const unlockPackShop = (cheat = false) => {
    if (!cheat && !canUnlockPackShop()) {
      return;
    }
    setPackShopState("unlocked");
    setSpades(spades - UNLOCK_PACK_SHOP_COST);
    generatePackShopEntry(2, [-1], [0]);
  };

  const canUnlockAchievements = () => {
    return achievementsState == "locked" && spades >= UNLOCK_ACHIEVEMENTS_COST;
  };

  const unlockAchievements = () => {
    if (!canUnlockAchievements()) {
      return;
    }
    setAchievementsState("unlocked");
    setSpades(spades - UNLOCK_ACHIEVEMENTS_COST);
  };

  const canUnlockCharmShop = () => {
    return charmShopState == "locked" && spades >= UNLOCK_CHARM_SHOP_COST;
  };

  const unlockCharmShop = (cheat = false) => {
    if (!cheat && !canUnlockCharmShop()) {
      return;
    }
    setCharmShopState("unlocked");
    setSpades(spades - UNLOCK_CHARM_SHOP_COST);
    generateCharmShopEntry([0, 1, 2, 3], purchasedCharms);
  };

  const canUnlockSportsbook = () => {
    return sportsbookState == "locked" && spades >= UNLOCK_SPORTSBOOK_COST;
  };

  const unlockSportsbook = (cheat = false) => {
    if (!cheat && !canUnlockSportsbook()) {
      return;
    }
    setSportsbookState("unlocked");
    setSpades(spades - UNLOCK_SPORTSBOOK_COST);
    generateBet([0, 1]);
  };

  const buyPack = (shopEntry) => {
    var pack = packData.packs[shopEntry.id];
    setSpades(spades - getPackCost(pack));
    setCurrentPack(packData.packs[shopEntry.id]);
    setHighlightedNumbers([]);
    var newShopEntries = [...cardShopEntries];

    for (var i = 0; i < cardShopEntries.length; i++) {
      if (
        cardShopEntries[i] &&
        cardShopEntries[i].id == shopEntry.id &&
        cardShopEntries[i].creation == shopEntry.creation
      ) {
        newShopEntries[i] = {
          nextRefreshTime: Date.now() + 60000,
        };
        break;
      }
    }

    setCardShopEntries(newShopEntries);

    setTimeout(() => {
      var container = document.getElementById("card-pack-container");
      container.classList.add("bounce-in");
    }, 100);

    setTimeout(() => {
      var container = document.getElementById("card-pack-container");
      container.classList.remove("bounce-in");
      container.style.transform = "translateY(0px)";
    }, 750);
  };

  const trashPack = (shopEntry) => {
    var newShopEntries = [...cardShopEntries];
    setHighlightedNumbers([]);
    for (var i = 0; i < cardShopEntries.length; i++) {
      if (
        cardShopEntries[i] &&
        cardShopEntries[i].id == shopEntry.id &&
        cardShopEntries[i].creation == shopEntry.creation
      ) {
        newShopEntries[i] = {
          nextRefreshTime: Date.now() + 60000,
        };
        break;
      }
    }
    setCardShopEntries(newShopEntries);
  };

  const refreshPackShopEntry = (index) => {
    const entry = cardShopEntries[index];
    generatePackShopEntry(1, [index]);
    setSpades(spades - getRefreshEntryCost(entry));
  };

  const getRefreshEntryCost = (entry) => {
    if (!entry || !entry.nextRefreshTime) return REFRESH_ENTRY_BASE_COST;
    const secsLeft = (entry.nextRefreshTime - Date.now()) / 1000;
    if (secsLeft > 46) return 50;
    if (secsLeft > 31) return 40;
    if (secsLeft > 16) return 30;
    return 15;
  };

  const hidePack = () => {
    var container = document.getElementById("card-pack-container");
    container.classList.add("bounce-out");

    setTimeout(() => {
      container.classList.remove("bounce-out");
      container.style.transform = "translateY(100vh)";
      setCurrentPack(null);
    }, 750);
  };

  const unlockShopEntry = (i) => {
    var newPackShopEntriesUnlocked = [...packShopEntriesUnlocked];
    newPackShopEntriesUnlocked[i] = true;
    setPackShopEntriesUnlocked(newPackShopEntriesUnlocked);
    generatePackShopEntry(1, [i]);
    setSpades(spades - UNLOCK_ENTRY_COST);
  };

  const openPack = (pack) => {
    setNumPacksOpened(numPacksOpened + 1);
    if (pack.id == "copycat") {
      pack = packData.packs[lastPackOpened];
    }
    var rolledNumbers = rollMultiple(
      pack.amount,
      pack.multiple,
      pack.min,
      pack.max,
      pack.modulo,
      pack.remainder,
      pack.pool,
    );

    if (!nextDiamondRefreshTime) {
      setNextDiamondRefreshTime(Date.now() + REFRESH_TIME);
    }
    var newBigNumbers = [];
    for (var i = 0; i < rolledNumbers.length; i++) {
      newBigNumbers.push({
        n: rolledNumbers[i],
        fromPack: true,
      });
    }
    setLastPackOpened(pack.id);

    setTimeout(() => {
      setBigNumberQueue((prev) => [...prev, ...newBigNumbers]);
    }, 1000);
  };

  const canUnlockBattleShop = () => {
    return battleShopState === "locked" && clubs >= UNLOCK_BATTLE_SHOP_COST;
  };

  const unlockBattleShop = () => {
    if (!canUnlockBattleShop()) return;
    setBattleShopState("unlocked");
    setClubs(clubs - UNLOCK_BATTLE_SHOP_COST);
  };

  const buyCombatShopItem = (shopEntry, index, count = 1) => {
    if (shopEntry.reward === "hearts") {
      var capacity = Math.max(0, maxHearts - hearts);
      var actualCount = Math.min(count, capacity);
      if (actualCount <= 0) return;
      if (shopEntry.currency === "spades") {
        setSpades(spades - shopEntry.cost * actualCount);
      }
      setHearts(hearts + actualCount);
      return;
    }
    if (shopEntry.currency === "spades") {
      setSpades(spades - shopEntry.cost * count);
    }
    if (shopEntry.reward === "combatTickets") {
      setCombatState((prev) => ({
        ...prev,
        combatTickets: (prev.combatTickets || 0) + count,
      }));
      setTicketBoughtSeen(true);
    }
  };

  const buyCharm = (shopEntry, index = 0) => {
    setClubs(clubs - shopEntry.cost);

    if (shopEntry.consumable) {
      var newPurchasedCharms = [...purchasedCharms, shopEntry.id];
      var indicesToRegen = [index];
      if (shopEntry.id === "speed-up-6" || shopEntry.id === "diamond-upgrade-5") {
        if (!indicesToRegen.includes(2)) indicesToRegen.push(2);
        if (!indicesToRegen.includes(3)) indicesToRegen.push(3);
      }
      generateCharmShopEntry(indicesToRegen, newPurchasedCharms);
      setPurchasedCharms(newPurchasedCharms);
    }

    if (shopEntry.category == "speed-up") {
      setTimeMultiplier(shopEntry.new_time_multiplier);
    } else if (shopEntry.category == "diamond-upgrade") {
      setMaxDiamonds(maxDiamonds + shopEntry.diamond_upgrade);
      setDiamonds(diamonds + shopEntry.diamond_upgrade);
    } else if (shopEntry.category == "rarity-highlight") {
      setRarityHighlightUnlocked(true);
    } else if (shopEntry.category == "max-hearts-increase") {
      setMaxHearts(maxHearts + shopEntry.heart_upgrade);
    } else if (shopEntry.category == "hearts") {
      setHearts(Math.min(maxHearts, hearts + shopEntry.amount));
    } else if (shopEntry.category == "ten-pull") {
      setTenPullUnlocked(true);
    }

  };

  const generateCharmShopEntry = (indices = [0], newPurchasedCharms) => {
    var newCharmShopEntries = [...charmShopEntries];
    for (var i = 0; i < indices.length; i++) {
      var index = indices[i];
      newCharmShopEntries[index] = null;
      var nextCharm = getNextCharm(index, newPurchasedCharms);
      if (nextCharm) {
        newCharmShopEntries[index] = nextCharm.id;
      }
    }
    setCharmShopEntries(newCharmShopEntries);
  };

  const generateEvent = () => {
    var n = rollEventNumber(numbers, lockedNumbers);
    var rarity = getRarity(n);
    var addedChance = 10;
    if (rarity == "epic") {
      addedChance = 5;
    } else if (rarity == "legendary") {
      addedChance = 3;
    }
    setCurrentEvent({
      n: n,
      endTime: Date.now() + 900000, //15 min
      isNew: true,
      addedChance: addedChance,
    });
  };

  const rollForEvent = () => {
    if (diamonds <= 0) {
      return;
    }

    setDiamonds(diamonds - 1);
    if (!nextDiamondRefreshTime) {
      setNextDiamondRefreshTime(Date.now() + REFRESH_TIME);
    }
    var rolledNumber = rollEvent(currentEvent);
    showRolledNumber(rolledNumber, false);
  };

  const checkForEvent = () => {
    if (Object.keys(numbers).length < 50 || currentEvent) {
      return;
    }
    if (Math.random() * 5 < 100) {
      generateEvent();
    }
  };

  const isRollButtonDisabled = () => {
    return (
      showingRoll != -1 || diamonds <= 0 || animating || bigNumberQueue.length > 0
    );
  };

  function selectNumber(n, i) {
    setCombatState((prevCombatState) => {
      var newCombatState = { ...prevCombatState };
      newCombatState.team[i] = n;
      return newCombatState;
    });
    setSelectingIndex(-1);
  }

  function claimAchievement(achievement) {
    if (claimedAchievements.includes(achievement.id)) return;
    setClaimedAchievements([...claimedAchievements, achievement.id]);
    if (achievement.currency == "clubs") {
      setClubs(clubs + achievement.reward_amount);
      setClubsUnlocked(true);
    }
    if (achievement.currency == "spades") setSpades(spades + achievement.reward_amount);
  }

  function unlockNumber(n) {
    if (showingRoll != -1) return;
    if (keys <= 0) return;
    if (!lockedNumbers.includes(n)) return;
    setKeys(keys - 1);
    setLockedNumbers(lockedNumbers.filter((num) => num !== n));

    var stashed = lockedRollCounts[n] || 0;
    if (stashed > 0) {
      setNumbers((prev) => ({ ...prev, [n]: stashed }));
      setSpades((prev) => prev + n * stashed);
      setLockedRollCounts((prev) => {
        var next = { ...prev };
        delete next[n];
        return next;
      });
      setBigNumberQueue((prev) => [...prev, { n: n, restored: true }]);
    }
  }

  function claimRewards(rewards) {
    for (const [id, amt] of Object.entries(rewards)) {
      if (id == "diamonds") {
        setDiamonds(diamonds + amt);
      }
      if (id == "hearts") {
        setHearts(Math.min(maxHearts, hearts + amt));
      }
      if (id == "spades") {
        setSpades(spades + amt);
      }
      if (id == "clubs") {
        setClubs(clubs + amt);
      }
      if (id == "keys" && amt > 0) {
        setKeys(keys + 1);
      }
    }
  }

  function getInitialTeam(rolls, numbers) {
    var seen = new Set();
    var team = [];
    for (var n of rolls) {
      if (!seen.has(n) && numbers[n] && getLevel(numbers[n]) === 1) {
        seen.add(n);
        team.push(n);
        if (team.length === 3) break;
      }
    }
    while (team.length < 3) team.push(null);
    return team;
  }

  function getCurrentEnemy() {
    if (!combatState || !combatState.currentEnemyValue) {
      return 0;
    }
    return combatState.currentEnemyValue;
  }

  function canBuyPack(pack) {
    return spades - getPackCost(pack) >= 0;
  }

  return (
    <div
      id="content"
      onMouseMove={(e) => {
        setMousePos([e.clientX, e.clientY]);
      }}
      onTouchStart={(e) => {
        setMousePos([e.changedTouches[0].clientX, e.changedTouches[0].clientY]);
      }}
      onTouchMove={(e) => {
        setMousePos([e.changedTouches[0].clientX, e.changedTouches[0].clientY]);
      }}
    >
      <Debug
        rolls={rolls}
        spades={spades}
        setRolls={setRolls}
        numbers={numbers}
        setNumbers={setNumbers}
        setSpades={setSpades}
        setClubs={setClubs}
        setHearts={setHearts}
        setDiamonds={setDiamonds}
        rollNumber={rollNumber}
        generatePackShopEntry={generatePackShopEntry}
        setTimeMultiplier={setTimeMultiplier}
        generateEvent={generateEvent}
        setCurrentEvent={setCurrentEvent}
        packShopState={packShopState}
        setPackShopState={setPackShopState}
        unlockPackShop={unlockPackShop}
        charmShopState={charmShopState}
        setCharmShopState={setCharmShopState}
        unlockCharmShop={unlockCharmShop}
        sportsbookState={sportsbookState}
        setSportsbookState={setSportsbookState}
        unlockSportsbook={unlockSportsbook}
        setCombatUnlocked={setCombatUnlocked}
        setKeys={setKeys}
        winBattleRef={winBattleRef}
        lockedNumbers={lockedNumbers}
      />
      {showOutOfDiamonds && (
        <OutOfHeartsContainer
          setShowOutOfDiamonds={setShowOutOfDiamonds}
          nextDiamondRefreshTime={nextDiamondRefreshTime}
          setDiamonds={setDiamonds}
          diamonds={diamonds}
        />
      )}
      {bigNumberQueue.length > 0 && (
        <SplashDisplayFront
          key={"front-" + bigNumberQueue.length + "-" + bigNumberQueue[0].n}
          bigNumberEntry={bigNumberQueue[0]}
          isNew={numbers[bigNumberQueue[0].n] == null}
          animating={animating}
          isLocked={lockedNumbers.includes(bigNumberQueue[0].n)}
          newLevel={(() => {
            var n = bigNumberQueue[0].n;
            var count = numbers[n];
            if (!count || count < 1) return false;
            var newLevel = getLevel(count + 1);
            var prevLevel = getLevel(count);
            if (newLevel < 2 || newLevel <= prevLevel){
              return -1
            }
            return newLevel;
          })()}
        />
      )}
      {bigNumberQueue.length > 0 && (
        <SplashDisplayBack
          key={"back-" + bigNumberQueue.length + "-" + bigNumberQueue[0].n}
          bigNumberEntry={bigNumberQueue[0]}
          numbers={numbers}
          setNumbers={setNumbers}
          bigNumberQueue={bigNumberQueue}
          setBigNumberQueue={setBigNumberQueue}
          setAnimating={setAnimating}
          animating={animating}
          spades={spades}
          setSpades={setSpades}
          rolls={rolls}
          setRolls={setRolls}
          checkForEvent={checkForEvent}
          isLocked={lockedNumbers.includes(bigNumberQueue[0].n)}
          lockedRollCounts={lockedRollCounts}
          setLockedRollCounts={setLockedRollCounts}
        />
      )}
      {currentPack && (
        <CardPack
          pack={currentPack}
          openPack={openPack}
          hidePack={hidePack}
          bigNumberQueue={bigNumberQueue}
        />
      )}
      {hoveredPack && (
        <MenuTooltip
          cardPack={hoveredPack}
          mousePos={mousePos}
          lastPackOpened={lastPackOpened}
          canBuy={canBuyPack(hoveredPack)}
        />
      )}
      {currentEvent && currentEvent.isNew && bigNumberQueue.length == 0 && (
        <EventBanner event={currentEvent} setCurrentEvent={setCurrentEvent} />
      )}
      <div className="goal-container">
        <div className="marquee-track">
          <span className="marquee-text">
            {("NUMBER " + (showCombat ? "BATTLE" : "GACHA") + " \u00A0 ").repeat(20)}
          </span>
          <span className="marquee-text">
            {("NUMBER " + (showCombat ? "BATTLE" : "GACHA") + " \u00A0 ").repeat(20)}
          </span>
        </div>
      </div>
      {false && !isMobile && !showCombat && <History rolls={rolls} />}

      {combatUnlocked && !combatState.active && (() => {
        const showingBattle = !showCombat;
        const waitingForUnlock =
          combatState.nextLevelUnlockTime && now < combatState.nextLevelUnlockTime;

        let label = showingBattle ? "BATTLE" : "GACHA";
        let subtext = null;
        let isYellow = false;

        if (showingBattle) {
          if (waitingForUnlock) {
            subtext =
              "next in " +
              Math.ceil((combatState.nextLevelUnlockTime - now) / 60000) +
              "m";
          } else if (!combatButtonSeen) {
            isYellow = true;
          } else if (combatState.combatLevel > lastBattledLevel) {
            label = "LVL " + combatState.combatLevel;
            isYellow = true;
          }
        }

        const hasSubtext = subtext !== null;

        return (
          <button
            className={
              "home-button" +
              (isYellow ? " can-claim-yellow" : "") +
              (showingBattle && hasSubtext ? " battle-button" : "")
            }
            disabled={showingRoll != -1 && !waitingForUnlock}
            onClick={() => {
              setCombatButtonSeen(true);
              if (showingBattle && !waitingForUnlock) {
                setLastBattledLevel(combatState.combatLevel);
              }
              setShowCombat(!showCombat);
            }}
          >
            {label}
            {hasSubtext && (
              <div className="home-button-combat-level">{subtext}</div>
            )}
          </button>
        );
      })()}

      {/*<button
        className="about-button"
        onClick={() => {
         //setShowCombat(false);
          //setCurrentPage("menu");
        }}
      >
        ABOUT
      </button>*/}

      {showCombat && !isCombatActive && combatState.combatLevel !== 1 && <AboutCombat />}
      {!showCombat && (
        <About
          showResetPopup={showResetPopup}
          setShowResetPopup={setShowResetPopup}
        />
      )}
      {showResetPopup && <ResetPopup setShowResetPopup={setShowResetPopup} />}
      {showCombat && (
        <Combat
          hearts={hearts}
          maxHearts={maxHearts}
          setHearts={setHearts}
          combatState={combatState}
          setShowCombat={setShowCombat}
          numbers={numbers}
          setCombatState={setCombatState}
          setSelectingIndex={setSelectingIndex}
          selectingIndex={selectingIndex}
          claimRewards={claimRewards}
          setSpades={setSpades}
          spades={spades}
          highScore={combatHighScore}
          setHighScore={setCombatHighScore}
          showReequip={showReequip}
          setShowReequip={setShowReequip}
          currentEnemy={getCurrentEnemy()}
          selectNumber={selectNumber}
          isDraggingNumber={isDraggingNumber}
          setIsCombatActive={setIsCombatActive}
          buyCombatShopItem={buyCombatShopItem}
          battleShopState={battleShopState}
          canUnlockBattleShop={canUnlockBattleShop}
          unlockBattleShop={unlockBattleShop}
          clubs={clubs}
          winBattleRef={winBattleRef}
          onBattleStart={() => setNumBattles((n) => n + 1)}
          setHeartsUnlocked={setHeartsUnlocked}
          heartsUnlocked={heartsUnlocked}
          ticketBoughtSeen={ticketBoughtSeen}
        />
      )}

      <div id="columns">
        {!isMobile && (
          <div
            className="column"
            id="column-1"
            style={{ opacity: showCombat ? 0 : 1 }}
          >
            {packShopState != "hidden" && (
              <PackShop
                packShopState={packShopState}
                canUnlockPackShop={canUnlockPackShop}
                unlockPackShop={unlockPackShop}
                packShopEntriesUnlocked={packShopEntriesUnlocked}
                setPackShopEntriesUnlocked={setPackShopEntriesUnlocked}
                openPack={openPack}
                bigNumberQueue={bigNumberQueue}
                cardShopEntries={cardShopEntries}
                spades={spades}
                unlockShopEntry={unlockShopEntry}
                generatePackShopEntry={generatePackShopEntry}
                setHighlightedNumbers={setHighlightedNumbers}
                currentPack={currentPack}
                buyPack={buyPack}
                trashPack={trashPack}
                hidePack={hidePack}
                getRefreshEntryCost={getRefreshEntryCost}
                refreshPackShopEntry={refreshPackShopEntry}
                setHoveredPack={setHoveredPack}
                hoveredPack={hoveredPack}
                lastPackOpened={lastPackOpened}
                numPacksOpened={numPacksOpened}
              />
            )}
            {currentEvent && !currentEvent.isNew && (
              <div className="event-container">
                <Event
                  event={currentEvent}
                  setCurrentEvent={setCurrentEvent}
                  isBanner={false}
                  rollForEvent={rollForEvent}
                  isRollButtonDisabled={isRollButtonDisabled}
                />
              </div>
            )}
          </div>
        )}
        <div className="column" id="column-2">
          <div id="numbers-grid" style={{ opacity: isCombatActive || (showCombat && combatState && combatState.combatLevel === 1) ? 0 : 1 }}>
            <NumberGrid
              numbers={numbers}
              highlightedNumber={highlightedNumber}
              highlightedNumbers={highlightedNumbers}
              multiRollHighlights={multiRollHighlights}
              multiRolledNumbers={multiRolledNumbers}
              rolledNumber={rolledNumber}
              badgedNumbers={badgedNumbers}
              rarityHighlightUnlocked={rarityHighlightUnlocked}
              selectingIndex={selectingIndex}
              selectNumber={selectNumber}
              combatState={combatState}
              showCombat={showCombat}
              onDragStateChange={setIsDraggingNumber}
              inCombatMenu={showCombat}
              isCombatLoading={isCombatLoading}
              lockedNumbers={lockedNumbers}
              keys={keys}
              unlockNumber={unlockNumber}
              rolls={rolls}
              lockedRollCounts={lockedRollCounts}
            />
          </div>
          {isMobile && (
            <div id="arrows-container">
              {mobileMenuIndex != 0 && (
                <img
                  className="arrow left-arrow"
                  src={arrow}
                  onClick={() => trySwipe(-1)}
                />
              )}

              {mobileMenuIndex != NUM_TABS - 1 && (
                <img
                  className="arrow right-arrow"
                  src={arrow}
                  onClick={() => trySwipe(1)}
                />
              )}
            </div>
          )}
          <div
            className="wallet-container"
            style={{ opacity: combatState.active || (showCombat && combatState && combatState.combatLevel === 1) ? 0 : 1 }}
          >
            <div>
              <div className="diamonds-container" id="diamonds-container" style={{ opacity: diamondsUnlocked ? 1 : 0 }}>
                <div>
                  &diams;&#xfe0e; {diamonds}/{maxDiamonds}{" "}
                  {!isMobile && nextDiamondRefreshTime && (
                    <span className="next-heart-container">
                      next in{" "}
                      <Timer
                        endTime={nextDiamondRefreshTime}
                        onTimerEnd={refreshDiamonds}
                      />
                    </span>
                  )}
                </div>
              </div>
              <div id="clubs-container" style={{ opacity: clubsUnlocked ? 1 : 0 }}>
                &#x2663;&#xfe0e; {clubs.toLocaleString()}
              </div>
              {showCombat && (
                <div id="tickets-container">
                  <img src={ticket} alt="ticket" className="ticket-icon" /> {combatState.combatTickets.toLocaleString()}
                </div>
              )}
            </div>
            <div>
            <div id="spades-container" style={{ opacity: spadesUnlocked ? 1 : 0 }}>
                &#x2660;&#xfe0e; {spades.toLocaleString()}
              </div>
              
              <div id="hearts-container" style={{ opacity: heartsUnlocked ? 1 : 0 }}>
                &hearts;&#xfe0e; {hearts.toLocaleString()}/{maxHearts.toLocaleString()}
              </div>
              <div id="keys-container" style={{ opacity: keysUnlocked && keys > 0 ? 1 : 0 }}>
                <img src={keyIcon} alt="key" className="key-icon" /> {keys.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        {!isMobile && (
          <div
            className="column"
            id="column-3"
            style={{ opacity: showCombat ? 0 : 1 }}
          >
            {achievementsState != "hidden" && (
              <Achievements
                numbers={numbers}
                numPacksOpened={numPacksOpened}
                claimedAchievements={claimedAchievements}
                claimAchievement={claimAchievement}
                achievementsState={achievementsState}
                canUnlockAchievements={canUnlockAchievements}
                unlockAchievements={unlockAchievements}
                setHighlightedNumbers={setHighlightedNumbers}
              />
            )}
            {charmShopState != "hidden" && (
              <CharmShop
                clubs={clubs}
                charmShopEntries={charmShopEntries}
                buyCharm={buyCharm}
                charmShopState={charmShopState}
                canUnlockCharmShop={canUnlockCharmShop}
                unlockCharmShop={unlockCharmShop}
              />
            )}
          </div>
        )}
      </div>

      <MenusContainer
        packShopState={packShopState}
        canUnlockPackShop={canUnlockPackShop}
        unlockPackShop={unlockPackShop}
        charmShopState={charmShopState}
        canUnlockCharmShop={canUnlockCharmShop}
        unlockCharmShop={unlockCharmShop}
        sportsbookState={sportsbookState}
        setSportsbookState={setSportsbookState}
        canUnlockSportsbook={canUnlockSportsbook}
        unlockSportsbook={unlockSportsbook}
        nextDiamondRefreshTime={nextDiamondRefreshTime}
        diamonds={diamonds}
        setDiamonds={setDiamonds}
        hearts={hearts}
        charmShopEntries={charmShopEntries}
        cardShopEntries={cardShopEntries}
        mobileMenuIndex={mobileMenuIndex}
        bigNumberQueue={bigNumberQueue}
        packShopEntriesUnlocked={packShopEntriesUnlocked}
        setPackShopEntriesUnlocked={setPackShopEntriesUnlocked}
        generatePackShopEntry={generatePackShopEntry}
        rollNumber={rollNumber}
        diamondsUnlocked={diamondsUnlocked}
        refreshDiamonds={refreshDiamonds}
        trySwipe={trySwipe}
        setShowOutOfDiamonds={setShowOutOfDiamonds}
        outOfDiamondsSeen={outOfDiamondsSeen}
        setOutOfDiamondsSeen={setOutOfDiamondsSeen}
        rolls={rolls}
        currentPack={currentPack}
        buyPack={buyPack}
        trashPack={trashPack}
        hidePack={hidePack}
        getRefreshEntryCost={getRefreshEntryCost}
        refreshPackShopEntry={refreshPackShopEntry}
        unlockShopEntry={unlockShopEntry}
        openPack={openPack}
        buyCharm={buyCharm}
        setHoveredPack={setHoveredPack}
        isRollButtonDisabled={isRollButtonDisabled}
        rollTen={rollTen}
        isRollTenButtonDisabled={isRollTenButtonDisabled}
        tenPullUnlocked={tenPullUnlocked}
        lastPackOpened={lastPackOpened}
        showCombat={showCombat}
        clubs={clubs}
        setClubs={setClubs}
        spades={spades}
        setSpades={setSpades}
        numbers={numbers}
        numPacksOpened={numPacksOpened}
        claimedAchievements={claimedAchievements}
        claimAchievement={claimAchievement}
        achievementsState={achievementsState}
        canUnlockAchievements={canUnlockAchievements}
        unlockAchievements={unlockAchievements}
      />
      {showWinPopup && (
        <WinPopup combatLevel={combatState.combatLevel} rolls={rolls} numPacksOpened={numPacksOpened} numRollButtonClicks={numRollButtonClicks} numBattles={numBattles} startTime={startTime} onClose={() =>{ setShowWinPopup(false); setHasShownWinPopup(true); }} />
      )}
    </div>
  );
}

export default App;
