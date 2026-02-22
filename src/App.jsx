import { useState, useEffect } from "react";
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
  rollForCombatEnemy,
} from "./Util";
import "./App.css";

import Number from "./Number";
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
import CombatSetup from "./CombatSetup.jsx";
import CombatEntry from "./CombatEntry.jsx";
import packData from "./json/packs.json";

import arrow from "/arrow.png";
var hearts = "&hearts;&#xfe0e;";
var diamonds = "&diams;&#xfe0e;";

import {
  REFRESH_TIME,
  REFRESH_ENTRY_BASE_COST,
  BASE_MAX_HEARTS,
  PACK_LIFETIME,
  NUM_TABS,
  UNLOCK_PACK_SHOP_COST,
  UNLOCK_CHARM_SHOP_COST,
  UNLOCK_SPORTSBOOK_COST,
  isMobile,
} from "./constants.js";

function App() {
  const [numbers, setNumbers] = useState({});
  const [rolls, setRolls] = useState([]);
  const [highlightedNumber, setHighlightedNumber] = useState(-1);
  const [rolledNumber, setRolledNumber] = useState(-1);
  const [hearts, setHearts] = useState(BASE_MAX_HEARTS);
  const [nextHeartRefreshTime, setNextHeartRefreshTime] = useState(null);
  const [showingRoll, setShowingRoll] = useState(-1);
  const [bigNumberQueue, setBigNumberQueue] = useState([]);
  const [currentPack, setCurrentPack] = useState(null);

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
  const [charmShopEntries, setCharmShopEntries] = useState([0, 0]);
  const [purchasedCharms, setPurchasedCharms] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [diamonds, setDiamonds] = useState(0);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);
  const [maxHearts, setMaxHearts] = useState(BASE_MAX_HEARTS);
  const [highlightedNumbers, setHighlightedNumbers] = useState([]);
  const [mobileMenuIndex, setMobileMenuIndex] = useState(0);
  const [goal, setGoal] = useState(0);
  const [hoveredPack, setHoveredPack] = useState(null);
  const [mousePos, setMousePos] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [lastPackOpened, setLastPackOpened] = useState(null);
  const [rarityHighlightUnlocked, setRarityHighlightUnlocked] = useState(false);
  const [showCombatSetup, setShowCombatSetup] = useState(false);
  const [showCombat, setShowCombat] = useState(false);
  const [selectingIndex, setSelectingIndex] = useState(-1);
  const [combatTeam, setCombatTeam] = useState([null, null, null]);
  const [combatState, setCombatState] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log("adding");
    document.addEventListener("keydown", onSpacePressed);
    return () => window.removeEventListener("keydown", onSpacePressed);
  }, [showingRoll, hearts, animating, bigNumberQueue]);

  useEffect(() => {
    if (!combatState) {
      setCombatState({
        level: 1,
        enemy: rollForCombatEnemy(1),
      });
    }
  }, [combatState]);

  function getCurrentEnemy() {
    return combatState ? combatState.enemy : 0;
  }

  const onSpacePressed = (e) => {
    if (e.key == " " && !isRollButtonDisabled()) {
      console.log("rolling");
      rollNumber();
    }
  };

  useEffect(() => {
    if (rolls.length >= 3 && packShopState == "hidden") {
      setPackShopState("locked");
    }
    if (
      rolls.length >= 11 &&
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
    saveData();
  }, [
    numbers,
    cardShopEntries,
    timeMultiplier,
    diamonds,
    hearts,
    maxHearts,
    mobileMenuIndex,
    currentEvent,
    rarityHighlightUnlocked,
    combatTeam,
    combatState,
  ]);

  function saveData() {
    var newPlayerData = {
      numbers: numbers,
      rolls: rolls,
      hearts: hearts,
      nextHeartRefreshTime: nextHeartRefreshTime,
      sportsbookState: sportsbookState,
      sportsbookEntries: sportsbookEntries,
      packShopState: packShopState,
      packShopEntriesUnlocked: packShopEntriesUnlocked,
      cardShopEntries: cardShopEntries,
      diamonds: diamonds,
      timeMultiplier: timeMultiplier,
      maxHearts: maxHearts,
      charmShopState: charmShopState,
      charmShopEntries: charmShopEntries,
      purchasedCharms: purchasedCharms,
      mobileMenuIndex: mobileMenuIndex,
      currentEvent: currentEvent,
      lastPackOpened: lastPackOpened,
      rarityHighlightUnlocked: rarityHighlightUnlocked,
      combatTeam: combatTeam,
      combatState: combatState,
    };
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
        setTimeMultiplier(saveData.timeMultiplier);
        setMaxHearts(saveData.maxHearts);
        setCharmShopState(saveData.charmShopState);
        setCharmShopEntries(saveData.charmShopEntries);
        setPurchasedCharms(saveData.purchasedCharms);
        if (isMobile) {
          setMobileMenuIndex(saveData.mobileMenuIndex);
        }
        setSportsbookEntries(saveData.sportsbookEntries);
        setCurrentEvent(saveData.currentEvent);
        setLastPackOpened(saveData.lastPackOpened);
        setRarityHighlightUnlocked(saveData.rarityHighlightUnlocked);
        setCombatTeam(saveData.combatTeam);
        setCombatState(saveData.combatState);

        var t = saveData.nextHeartRefreshTime - Date.now();
        if (t <= 0) {
          var numHeartsGained = 0;
          while (t <= 0 && hearts + numHeartsGained < maxHearts) {
            numHeartsGained++;
            t += REFRESH_TIME;
          }
          var newHearts = hearts + numHeartsGained;
          setHearts(newHearts);
          if (newHearts < maxHearts) {
            setNextHeartRefreshTime(Date.now() + t);
          } else {
            setNextHeartRefreshTime(null);
          }
        } else {
          setNextHeartRefreshTime(saveData.nextHeartRefreshTime);
        }
      } catch (e) {
        return null;
      }
      return saveData;
    }
    return null;
  }

  const refreshHearts = () => {
    setHearts(Math.min(maxHearts, hearts + 1));
    if (hearts >= maxHearts) {
      setNextHeartRefreshTime(null);
    } else {
      setNextHeartRefreshTime(nextHeartRefreshTime + REFRESH_TIME);
    }
  };

  const rollNumber = (e, cheatNumber = -1) => {
    if (hearts <= 0 && cheatNumber == -1) {
      return;
    }
    var rolledNumber = cheatNumber;
    setSelectingIndex(-1);

    if (cheatNumber == -1) {
      setHearts(hearts - 1);
      if (!nextHeartRefreshTime) {
        setNextHeartRefreshTime(Date.now() + REFRESH_TIME);
      }
      rolledNumber = roll();
    }
    showRolledNumber(rolledNumber, false);
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
              setBigNumberQueue([...bigNumberQueue, nextBigNumber]);
            }, 300 * timeMultiplier);
          }, 500 * timeMultiplier);
        }
      }, cumulativeDelay);
    }
  };

  const generatePackShopEntry = (amount = 1, slots = [-1]) => {
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
      var pack = rollForPack();
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
      console.log(newEntry);
      newSportsbookEntries[slots[i]] = newEntry;
    }
    console.log(newSportsbookEntries);
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
    return packShopState == "locked" && diamonds >= UNLOCK_PACK_SHOP_COST;
  };

  const unlockPackShop = (cheat = false) => {
    if (!cheat && !canUnlockPackShop()) {
      return;
    }
    setPackShopState("unlocked");
    setDiamonds(diamonds - UNLOCK_PACK_SHOP_COST);
    generatePackShopEntry(2);
  };

  const canUnlockCharmShop = () => {
    return charmShopState == "locked" && diamonds >= UNLOCK_CHARM_SHOP_COST;
  };

  const unlockCharmShop = (cheat = false) => {
    if (!cheat && !canUnlockCharmShop()) {
      return;
    }
    setCharmShopState("unlocked");
    setDiamonds(diamonds - UNLOCK_CHARM_SHOP_COST);
    generateCharmShopEntry([0, 1], purchasedCharms);
  };

  const canUnlockSportsbook = () => {
    return sportsbookState == "locked" && diamonds >= UNLOCK_SPORTSBOOK_COST;
  };

  const unlockSportsbook = (cheat = false) => {
    if (!cheat && !canUnlockSportsbook()) {
      return;
    }
    setSportsbookState("unlocked");
    setDiamonds(diamonds - UNLOCK_SPORTSBOOK_COST);
    generateBet([0, 1]);
  };

  const buyPack = (shopEntry) => {
    var pack = packData.packs[shopEntry.id];
    setDiamonds(diamonds - getPackCost(pack));
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
    console.log("here", index);
    generatePackShopEntry(1, [index]);
    setDiamonds(diamonds - getRefreshEntryCost());
  };

  const getRefreshEntryCost = (entry) => {
    return REFRESH_ENTRY_BASE_COST; // todo - implement scaling logic
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
    generatePackShopEntry();
  };

  const openPack = (pack) => {
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

    if (!nextHeartRefreshTime) {
      setNextHeartRefreshTime(Date.now() + REFRESH_TIME);
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
      setBigNumberQueue([...bigNumberQueue, ...newBigNumbers]);
    }, 1000);
  };

  const buyCharm = (shopEntry, index = 0) => {
    setDiamonds(diamonds - shopEntry.cost);
    var newPurchasedCharms = [...purchasedCharms, shopEntry.id];
    if (shopEntry.category == "speed-up") {
      setTimeMultiplier(shopEntry.new_time_multiplier);
    } else if (shopEntry.category == "heart-upgrade") {
      setMaxHearts(maxHearts + shopEntry.heart_upgrade);
      setHearts(hearts + shopEntry.heart_upgrade);
    } else if (shopEntry.category == "rarity-highlight") {
      setRarityHighlightUnlocked(true);
    }
    generateCharmShopEntry([index], newPurchasedCharms);
    setPurchasedCharms(newPurchasedCharms);
  };

  const generateCharmShopEntry = (indices = [0], newPurchasedCharms) => {
    console.log("generating ", indices);
    var newCharmShopEntries = [...charmShopEntries];
    for (var i = 0; i < indices.length; i++) {
      var index = indices[i];
      newCharmShopEntries[index] = null;
      var nextCharm = getNextCharm(index, newPurchasedCharms);
      console.log(nextCharm);
      if (nextCharm) {
        newCharmShopEntries[index] = nextCharm.id;
      }
    }
    console.log(newCharmShopEntries);
    setCharmShopEntries(newCharmShopEntries);
  };

  const generateEvent = () => {
    var n = rollEventNumber(numbers);
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
    if (hearts <= 0) {
      return;
    }

    setHearts(hearts - 1);
    if (!nextHeartRefreshTime) {
      setNextHeartRefreshTime(Date.now() + REFRESH_TIME);
    }
    var rolledNumber = rollEvent(currentEvent);
    showRolledNumber(rolledNumber, false);
  };

  const checkForEvent = () => {
    if (Object.keys(numbers).length < 50 || currentEvent) {
      return;
    }
    if (Math.random() * 5 < 100) {
      console.log("Event procced, generating");
      generateEvent();
    }
  };

  const isRollButtonDisabled = () => {
    return (
      showingRoll != -1 || hearts <= 0 || animating || bigNumberQueue.length > 0
    );
  };

  function selectNumber(n, i) {
    setCombatTeam((prevCombatTeam) => {
      var newCombatTeam = [...prevCombatTeam];
      newCombatTeam[i] = n;
      console.log(prevCombatTeam, newCombatTeam);
      return newCombatTeam;
    });
    setSelectingIndex(-1);
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
        numbers={numbers}
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
      />
      {showOutOfHearts && (
        <OutOfHeartsContainer
          setShowOutOfHearts={setShowOutOfHearts}
          nextHeartRefreshTime={nextHeartRefreshTime}
          setHearts={setHearts}
          hearts={hearts}
        />
      )}
      {bigNumberQueue.length > 0 && (
        <SplashDisplayFront
          bigNumberEntry={bigNumberQueue[0]}
          isNew={numbers[bigNumberQueue[0].n] == null}
          animating={animating}
        />
      )}
      {bigNumberQueue.length > 0 && (
        <SplashDisplayBack
          bigNumberEntry={bigNumberQueue[0]}
          numbers={numbers}
          setNumbers={setNumbers}
          bigNumberQueue={bigNumberQueue}
          setBigNumberQueue={setBigNumberQueue}
          setAnimating={setAnimating}
          animating={animating}
          diamonds={diamonds}
          setDiamonds={setDiamonds}
          rolls={rolls}
          setRolls={setRolls}
          checkForEvent={checkForEvent}
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
        />
      )}
      {currentEvent && currentEvent.isNew && bigNumberQueue.length == 0 && (
        <EventBanner event={currentEvent} setCurrentEvent={setCurrentEvent} />
      )}
      <div className="goal-container">YOU ARE AT {getGoalPercent()}%</div>
      {!isMobile && <History rolls={rolls} />}
      {showCombatSetup && (
        <CombatSetup
          slots={combatTeam}
          setSlots={setCombatTeam}
          combatState={combatState}
          numbers={numbers}
          setShowCombatSetup={setShowCombatSetup}
          setShowCombat={setShowCombat}
        />
      )}
      {showCombat && (
        <Combat
          team={combatTeam}
          combatState={combatState}
          setShowCombat={setShowCombat}
          setShowCombatSetup={setShowCombatSetup}
          numbers={numbers}
          setCombatState={setCombatState}
        />
      )}

      <div id="columns">
        {!isMobile && (
          <div id="column-1">
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
                diamonds={diamonds}
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
                lastPackOpened={lastPackOpened}
              />
            )}
            <div className="combat-entry-container">
              <CombatEntry
                slots={combatTeam}
                setShowCombatSetup={setShowCombatSetup}
                setSelectingIndex={setSelectingIndex}
                selectingIndex={selectingIndex}
                enemy={getCurrentEnemy()}
              />
            </div>
          </div>
        )}
        <div id="column-2">
          <div id="numbers-grid">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
              return (
                <Number
                  key={"number-" + n}
                  n={n}
                  data={numbers[n]}
                  isHighlighted={
                    highlightedNumber === n || highlightedNumbers.includes(n)
                  }
                  isRolled={rolledNumber === n}
                  showingRoll={showingRoll === n}
                  bigNumberQueue={bigNumberQueue}
                  rarityHighlightUnlocked={rarityHighlightUnlocked}
                  selectingIndex={selectingIndex}
                  selectNumber={selectNumber}
                />
              );
            })}
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
          <div className="wallet-container">
            <div className="hearts-container">
              <div>
                &hearts;&#xfe0e;: {hearts}/{maxHearts}
              </div>
              {!isMobile && nextHeartRefreshTime && (
                <div className="next-heart-container">
                  Next &hearts;&#xfe0e; in{" "}
                  <Timer
                    endTime={nextHeartRefreshTime}
                    onTimerEnd={refreshHearts}
                  />
                </div>
              )}
            </div>

            <div id="diamonds-container">
              &diams;&#xfe0e; {diamonds.toLocaleString()}
            </div>
          </div>
        </div>
        {!isMobile && (
          <div id="column-3">
            {charmShopState != "hidden" && (
              <CharmShop
                diamonds={diamonds}
                charmShopEntries={charmShopEntries}
                buyCharm={buyCharm}
                charmShopState={charmShopState}
                canUnlockCharmShop={canUnlockCharmShop}
                unlockCharmShop={unlockCharmShop}
              />
            )}

            {sportsbookState != "hidden" && (
              <Sportsbook
                diamonds={diamonds}
                sportsbookEntries={sportsbookEntries}
                setSportsbookEntries={setSportsbookEntries}
                setDiamonds={setDiamonds}
                rolls={rolls}
                generateBet={generateBet}
                sportsbookState={sportsbookState}
                canUnlockSportsbook={canUnlockSportsbook}
                unlockSportsbook={unlockSportsbook}
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
        nextHeartRefreshTime={nextHeartRefreshTime}
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
        refreshHearts={refreshHearts}
        trySwipe={trySwipe}
        setShowOutOfHearts={setShowOutOfHearts}
        generateBet={generateBet}
        sportsbookEntries={sportsbookEntries}
        setSportsbookEntries={setSportsbookEntries}
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
        lastPackOpened={lastPackOpened}
      />
    </div>
  );
}

export default App;
