import { useState, useEffect } from "react";
import { roll, rollMultiple, rollForPack, getNextCharm } from "./Util";
import "./App.css";

import Number from "./Number";
import Debug from "./Debug";
import Bet from "./Bet";
import Timer from "./Timer";
import SplashDisplayFront from "./SplashDisplayFront";
import SplashDisplayBack from "./SplashDisplayBack";
import PackShop from "./PackShop";
import PackShopMobile from "./PackShopMobile";
import CharmShop from "./CharmShop";
import OutOfHeartsContainer from "./OutOfHeartsContainer";

import arrow from "/assets/arrow.png";

import { REFRESH_TIME, BASE_MAX_HEARTS, isMobile } from "./constants.js";

function App() {
  const [numbers, setNumbers] = useState({});
  const [viewNumbers, setViewNumbers] = useState({});
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

  const [charmShopState, setCharmShopState] = useState("hidden");
  const [charmShopEntries, setCharmShopEntries] = useState([0, 0]);
  const [purchasedCharms, setPurchasedCharms] = useState([]);
  const [sportsbookState, setSportsbookState] = useState("hidden"); //hidden, locked, unlocked
  const [animating, setAnimating] = useState(false);
  const [diamonds, setDiamonds] = useState(0);
  const [showDiamonds, setShowDiamonds] = useState(0);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);
  const [maxHearts, setMaxHearts] = useState(BASE_MAX_HEARTS);
  const [highlightedNumbers, setHighlightedNumbers] = useState([]);
  const [buttonContainerXOffset, setButtonContainerXOffset] = useState(0);

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
  }, [numbers, cardShopEntries, timeMultiplier, diamonds, hearts, maxHearts]);

  useEffect(() => {
    if (diamonds > 2000 && packShopState == "hidden") {
      setPackShopState("unlocked");
      generatePackShopEntry(2);
    }
    if (diamonds > 0 && charmShopState == "hidden") {
      setCharmShopState("unlocked");
      generateCharmShopEntry([0, 1], purchasedCharms);
    }
  }, [diamonds]);

  function saveData() {
    var newPlayerData = {
      numbers: numbers,
      rolls: rolls,
      hearts: hearts,
      nextHeartRefreshTime: nextHeartRefreshTime,
      sportsbookState: sportsbookState,
      packShopState: packShopState,
      packShopEntriesUnlocked: packShopEntriesUnlocked,
      cardShopEntries: cardShopEntries,
      diamonds: diamonds,
      timeMultiplier: timeMultiplier,
      maxHearts: maxHearts,
      charmShopState: charmShopState,
      charmShopEntries: charmShopEntries,
      purchasedCharms: purchasedCharms,
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
        setViewNumbers(saveData.numbers);
        setRolls(saveData.rolls);
        setSportsbookState(saveData.sportsbookState);
        setPackShopState(saveData.packShopState);
        setPackShopEntriesUnlocked(saveData.packShopEntriesUnlocked);
        setCardShopEntries(saveData.cardShopEntries);
        setDiamonds(saveData.diamonds);
        setShowDiamonds(saveData.diamonds);
        setHearts(saveData.hearts);
        setTimeMultiplier(saveData.timeMultiplier);
        setMaxHearts(saveData.maxHearts);
        setCharmShopState(saveData.charmShopState);
        setCharmShopEntries(saveData.charmShopEntries);
        setPurchasedCharms(saveData.purchasedCharms);

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
    var newNumbers = { ...numbers };
    var newRolls = [...rolls];
    newNumbers[rolledNumber] = newNumbers[rolledNumber]
      ? newNumbers[rolledNumber] + 1
      : 1;
    newRolls.push(rolledNumber);
    setNumbers(newNumbers);
    setRolls(newRolls);
    setDiamonds(diamonds + rolledNumber);
    showRolledNumber(newRolls[newRolls.length - 1]);
  };

  const openPack = (pack) => {
    var newNumbers = { ...numbers };
    var newRolls = [...rolls];
    var rolledNumbers = rollMultiple(
      pack.amount,
      pack.multiple,
      pack.min,
      pack.max,
      pack.modulo,
      pack.remainder,
      pack.pool
    );
    var newDiamonds = 0;

    if (!nextHeartRefreshTime) {
      setNextHeartRefreshTime(Date.now() + REFRESH_TIME);
    }

    for (var i = 0; i < pack.amount; i++) {
      var n = rolledNumbers[i];
      newNumbers[n] = newNumbers[n] ? newNumbers[n] + 1 : 1;
      newRolls.push(n);
      newDiamonds += n;
    }
    setNumbers(newNumbers);
    setRolls(newRolls);
    setDiamonds(diamonds + newDiamonds);
    setTimeout(() => {
      setBigNumberQueue([...bigNumberQueue, ...rolledNumbers]);
    }, 1000);

    return newRolls;
  };

  const showRolledNumber = (n) => {
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
              setBigNumberQueue([...bigNumberQueue, n]);
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
      };

      newShopEntries[firstNullIndex] = newEntry;
    }
    setCardShopEntries(newShopEntries);
  };

  const unlockShopEntry = (i) => {
    var newPackShopEntriesUnlocked = [...packShopEntriesUnlocked];
    newPackShopEntriesUnlocked[i] = true;
    setPackShopEntriesUnlocked(newPackShopEntriesUnlocked);
    generatePackShopEntry();
  };

  const generateCharmShopEntry = (indices = [0], newPurchasedCharms) => {
    console.log("generating ", indices);
    var newCharmShopEntries = [...charmShopEntries];
    for (var i = 0; i < indices.length; i++) {
      var index = indices[i];
      var nextCharm = getNextCharm(index, newPurchasedCharms);
      if (nextCharm) {
        newCharmShopEntries[index] = nextCharm.id;
      }
    }
    setCharmShopEntries(newCharmShopEntries);
  };

  const onArrowClicked = (direction) => {
    setButtonContainerXOffset(buttonContainerXOffset + 100 * direction);
  };

  return (
    <div id="content">
      <Debug
        rolls={rolls}
        numbers={numbers}
        setHearts={setHearts}
        setDiamonds={setDiamonds}
        setShowDiamonds={setShowDiamonds}
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
          n={bigNumberQueue[0]}
          isNew={numbers[bigNumberQueue[0]] == 1}
          animating={animating}
        />
      )}
      {bigNumberQueue.length > 0 && (
        <SplashDisplayBack
          n={bigNumberQueue[0]}
          bigNumberQueue={bigNumberQueue}
          setBigNumberQueue={setBigNumberQueue}
          setAnimating={setAnimating}
          animating={animating}
          viewNumbers={viewNumbers}
          setViewNumbers={setViewNumbers}
          setShowDiamonds={setShowDiamonds}
          showDiamonds={showDiamonds}
        />
      )}

      <div id="numbers-grid-container">
        <div id="numbers-grid">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
            return (
              <Number
                key={"number-" + n}
                n={n}
                viewData={viewNumbers[n]}
                isHighlighted={
                  highlightedNumber === n || highlightedNumbers.includes(n)
                }
                isRolled={rolledNumber === n}
                showingRoll={showingRoll === n}
                bigNumberQueue={bigNumberQueue}
                isMobile={isMobile}
              />
            );
          })}
        </div>
      </div>
      {isMobile && (
        <div id="arrows-container">
          <img
            className="arrow left-arrow"
            src={arrow}
            onClick={() => onArrowClicked(1)}
          />
          <img
            className="arrow right-arrow"
            src={arrow}
            onClick={() => onArrowClicked(-1)}
          />
        </div>
      )}
      <div className="wallet-container">
        <div className="hearts-container">
          <div>
            ♥: {hearts}/{maxHearts}
          </div>
          {nextHeartRefreshTime && (
            <div>
              Next ♥ in{" "}
              <Timer
                endTime={nextHeartRefreshTime}
                onTimerEnd={refreshHearts}
              />
            </div>
          )}
        </div>

        <div id="diamonds-container">♦ {showDiamonds.toLocaleString()}</div>
      </div>

      <div
        id="buttons-container"
        style={{ transform: "translate(" + buttonContainerXOffset + "vw, 0)" }}
      >
        <div id="roll-container">
          <span className="hearts-span">
            <button
              id="roll-button"
              disabled={showingRoll != -1 || hearts <= 0}
              onClick={rollNumber}
            >
              Roll (1♥)
            </button>
            {hearts <= 0 && (
              <button
                id="out-of-hearts-button"
                onClick={() => setShowOutOfHearts(true)}
              >
                Get More ♥
              </button>
            )}
          </span>
        </div>

        {packShopState != "hidden" && isMobile && (
          <PackShopMobile
            packShopState={packShopState}
            packShopEntriesUnlocked={packShopEntriesUnlocked}
            setPackShopEntriesUnlocked={setPackShopEntriesUnlocked}
            openPack={openPack}
            bigNumberQueue={bigNumberQueue}
            cardShopEntries={cardShopEntries}
            setShopEntries={setCardShopEntries}
            setDiamonds={setDiamonds}
            setShowDiamonds={setShowDiamonds}
            diamonds={diamonds}
            unlockShopEntry={unlockShopEntry}
            generatePackShopEntry={generatePackShopEntry}
            setHighlightedNumbers={setHighlightedNumbers}
          />
        )}

        {packShopState != "hidden" && !isMobile && (
          <PackShop
            packShopState={packShopState}
            packShopEntriesUnlocked={packShopEntriesUnlocked}
            setPackShopEntriesUnlocked={setPackShopEntriesUnlocked}
            openPack={openPack}
            bigNumberQueue={bigNumberQueue}
            cardShopEntries={cardShopEntries}
            setShopEntries={setCardShopEntries}
            setDiamonds={setDiamonds}
            setShowDiamonds={setShowDiamonds}
            diamonds={diamonds}
            unlockShopEntry={unlockShopEntry}
            generatePackShopEntry={generatePackShopEntry}
            setHighlightedNumbers={setHighlightedNumbers}
          />
        )}
        {charmShopState != "hidden" && !isMobile && (
          <CharmShop
            diamonds={diamonds}
            setDiamonds={setDiamonds}
            setShowDiamonds={setShowDiamonds}
            setTimeMultiplier={setTimeMultiplier}
            maxHearts={maxHearts}
            setMaxHearts={setMaxHearts}
            hearts={hearts}
            setHearts={setHearts}
            purchasedCharms={purchasedCharms}
            setPurchasedCharms={setPurchasedCharms}
            charmShopEntries={charmShopEntries}
            generateCharmShopEntry={generateCharmShopEntry}
          />
        )}
        {sportsbookState != "hidden" && (
          <div id="bets-container">
            <div id="bets-header">Bets</div>
            <div id="bets-grid">
              <Bet />
              <Bet />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
