import { useState, useEffect } from "react";
import { roll, rollMultiple } from "./Util";
import "./App.css";

import Number from "./Number";
import CardPack from "./CardPack";
import Debug from "./Debug";
import Bet from "./Bet";
import Timer from "./Timer";

function App() {
  const [numbers, setNumbers] = useState({});
  const [rolls, setRolls] = useState([]);
  const [highlightedNumber, setHighlightedNumber] = useState(-1);
  const [rolledNumber, setRolledNumber] = useState(-1);
  const [hearts, setHearts] = useState(100);
  const [nextHeartRefreshTime, setNextHeartRefreshTime] = useState(null);
  const [showingRoll, setShowingRoll] = useState(-1);

  const REFRESH_TIME = 60000;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [numbers]);

  function saveData() {
    var newPlayerData = { numbers: numbers, rolls: rolls };
    var saveString = JSON.stringify(newPlayerData);
    localStorage.setItem("gacha", window.btoa(saveString));
  }

  function loadData() {
    var saveData = localStorage.getItem("gacha");

    if (saveData != null) {
      try {
        saveData = JSON.parse(window.atob(saveData));
        console.log(saveData);
        setNumbers(saveData.numbers);
        setRolls(saveData.rolls);
      } catch (e) {
        return null;
      }
      return saveData;
    }
    return null;
  }

  const refreshHearts = () => {
    setHearts(Math.min(100, hearts + 1));
    if (hearts >= 99) {
      setNextHeartRefreshTime(null);
    } else {
      setNextHeartRefreshTime(nextHeartRefreshTime + REFRESH_TIME);
    }
  };

  const rollNumber = () => {
    if (hearts <= 0) {
      return;
    }
    setHearts(hearts - 1);
    if (!nextHeartRefreshTime) {
      setNextHeartRefreshTime(Date.now() + REFRESH_TIME);
    }
    var rolledNumber = roll();
    var newNumbers = { ...numbers };
    var newRolls = [...rolls];
    newNumbers[rolledNumber] = newNumbers[rolledNumber]
      ? newNumbers[rolledNumber] + 1
      : 1;
    newRolls.push(rolledNumber);
    setNumbers(newNumbers);
    setRolls(newRolls);

    showRolledNumber(newRolls[newRolls.length - 1]);
  };

  const rollNumbers = (amount = 5) => {
    var newNumbers = { ...numbers };
    var newRolls = [...rolls];
    var rolledNumbers = rollMultiple(amount);
    for (var i = 0; i < amount; i++) {
      var n = rolledNumbers[i];
      newNumbers[n] = newNumbers[n] ? newNumbers[n] + 1 : 1;
      newRolls.push(n);
    }
    setNumbers(newNumbers);
    setRolls(newRolls);
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
    const minDelay = 5; // minimum delay at the start (fast)
    const maxDelay = 300; // maximum delay at the end (slow)

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
            }, 300);
          }, 500);
        }
      }, cumulativeDelay);
    }
  };

  const openPack = () => {
    var container = document.getElementById("card-pack-container");
    container.classList.add("bounce-in");

    setTimeout(() => {
      container.classList.remove("bounce-in");
      container.style.transform = "translateY(0px)";
    }, 750);
  };

  return (
    <div id="content">
      <Debug rolls={rolls} numbers={numbers} />
      <CardPack rollNumbers={rollNumbers} />
      <div id="numbers-grid-container">
        <div id="numbers-grid">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
            return (
              <Number
                key={"number-" + n}
                n={n}
                data={numbers[n]}
                isHighlighted={highlightedNumber === n}
                isRolled={rolledNumber === n}
                showingRoll={showingRoll === n}
              />
            );
          })}
        </div>
      </div>
      <div id="buttons-container">
        <div id="roll-container">
          <button
            id="roll-button"
            disabled={showingRoll != -1}
            onClick={rollNumber}
          >
            Roll Number (1♥)
          </button>
          <div className="hearts-container">
            <div>♥: {hearts}/100</div>
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
        </div>

        <button onClick={openPack}>
          Open Pack (10 ♥)
          <div style={{ fontSize: "1.4vh", marginTop: "0.5vh" }}>
            1/2 remaining
          </div>
        </button>
        <div id="bets-container">
          <div id="bets-header">Bets</div>
          <div id="bets-grid">
            <Bet />
            <Bet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
