import { useState, useEffect } from "react";
import { roll, rollForPack, rollForBet } from "./Util";
import "./App.css";

import Number from "./Number";
import Debug from "./Debug";
import Timer from "./Timer";
import SplashDisplayFront from "./SplashDisplayFront";
import SplashDisplayBack from "./SplashDisplayBack";

import OutOfHeartsContainer from "./OutOfHeartsContainer";
import MenusContainer from "./MenusContainer.jsx";

import arrow from "/arrow.png";
var hearts = "&hearts;&#xfe0e;";
var diamonds = "&diams;&#xfe0e;";

import {
  REFRESH_TIME,
  BASE_MAX_HEARTS,
  PACK_LIFETIME,
  NUM_TABS,
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

  useEffect(() => {
    loadData();
    document.addEventListener("keydown", (e) => {
      if (e.key == " ") {
        rollNumber();
      }
    });
  }, []);

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
      var bet = rollForBet(i);
      var newEntry = {
        id: bet.id,
        creation: Date.now(),
        rolls: [],
      };
      console.log(newEntry);
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

  return (
    <div id="content">
      <Debug
        rolls={rolls}
        numbers={numbers}
        setHearts={setHearts}
        setDiamonds={setDiamonds}
        rollNumber={rollNumber}
        generatePackShopEntry={generatePackShopEntry}
        setTimeMultiplier={setTimeMultiplier}
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
        />
      )}
      <div className="goal-container">YOU ARE AT {getGoalPercent()}%</div>
      <div id="numbers-grid-container">
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
              />
            );
          })}
        </div>
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
      <MenusContainer
        nextHeartRefreshTime={nextHeartRefreshTime}
        setNextHeartRefreshTime={setNextHeartRefreshTime}
        diamonds={diamonds}
        setDiamonds={setDiamonds}
        hearts={hearts}
        setHearts={setHearts}
        maxHearts={maxHearts}
        setMaxHearts={setMaxHearts}
        charmShopEntries={charmShopEntries}
        setCharmShopEntries={setCharmShopEntries}
        cardShopEntries={cardShopEntries}
        setCardShopEntries={setCardShopEntries}
        setHighlightedNumbers={setHighlightedNumbers}
        purchasedCharms={purchasedCharms}
        setPurchasedCharms={setPurchasedCharms}
        mobileMenuIndex={mobileMenuIndex}
        bigNumberQueue={bigNumberQueue}
        setBigNumberQueue={setBigNumberQueue}
        packShopEntriesUnlocked={packShopEntriesUnlocked}
        setPackShopEntriesUnlocked={setPackShopEntriesUnlocked}
        generatePackShopEntry={generatePackShopEntry}
        charmShopState={charmShopState}
        setCharmShopState={setCharmShopState}
        packShopState={packShopState}
        setPackShopState={setPackShopState}
        showingRoll={showingRoll}
        animating={animating}
        rollNumber={rollNumber}
        sportsbookState={sportsbookState}
        setSportsbookState={setSportsbookState}
        setTimeMultiplier={setTimeMultiplier}
        refreshHearts={refreshHearts}
        trySwipe={trySwipe}
        setShowOutOfHearts={setShowOutOfHearts}
        generateBet={generateBet}
        sportsbookEntries={sportsbookEntries}
        setSportsbookEntries={setSportsbookEntries}
        rolls={rolls}
      />
    </div>
  );
}

export default App;
