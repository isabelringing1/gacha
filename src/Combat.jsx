import { useRef, useState, useEffect } from "react";
import CombatNumber from "./CombatNumber";
import CombatEntrySlot from "./CombatEntrySlot";
import {
  getRarityData,
  getLevelData,
  rollForCombatEnemy,
  generateCombatRewards,
  getCurrencyIcon,
} from "./Util";
import { COMBAT_START_COST, isMobile } from "./constants.js";
import EnemyNumber from "./EnemyNumber";
import ascii from "/path.txt?raw";

export default function Combat(props) {
  const {
    combatState,
    setShowCombat,
    setCombatState,
    numbers,
    selectingIndex,
    setSelectingIndex,
    claimRewards,
    diamonds,
    setDiamonds,
    highScore,
    setHighScore,
  } = props;
  const [enemyState, setEnemyState] = useState(0);
  const [winState, setWinState] = useState("precombat");
  const [records, setRecords] = useState([]);
  const [showCombatSetup, setShowCombatSetup] = useState(true);
  const [levelRewards, setLevelRewards] = useState({});
  const [pathMarginTop, setPathMarginTop] = useState(0);
  const [numbersMarginBottom, setNumbersMarginBottom] = useState(0);
  const [score, setScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const enemyRef = useRef(0);
  const healthArrayRef = useRef();
  const winStateRef = useRef(winState);
  const scoreRef = useRef(0);

  const walkUpSpeed = 1500;

  useEffect(() => {
    const interval = setInterval(() => {
      setEnemyState(enemyRef.current);
      setScore(scoreRef.current);
    }, 100); // sync rate

    if (combatState) {
      console.log(combatState.team);
      var newCombatState = { ...combatState };
      for (var i = 1; i <= 100; i++) {
        var level = getLevelData(numbers[i]);
        newCombatState.numberStates[i] = {
          n: i,
          health: i,
          block: false,
          shields: level.shields,
          initialShields: level.shields,
          canDivide: level.canDivide,
        };
      }
      setCombatState(newCombatState);
      setEnemyState(combatState.enemy);
      enemyRef.current = combatState.enemy;
    } else {
      resetCombatState();
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    winStateRef.current = winState;
    if (winState == "win") {
      var rewards = generateCombatRewards(combatState.level, combatState.enemy);
      console.log("rewards: ", rewards);
      setLevelRewards(rewards);
      claimRewards(rewards);
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        setIsNewHighScore(true);
      }
    }
    if (winState == "lose") {
    }
  }, [winState]);

  useEffect(() => {
    if (!combatState || combatState.numberStates.length == 0) {
      return;
    }

    var allHealthZero = true;
    var healthArray = [];
    for (var i = 0; i < combatState.team.length; i++) {
      if (!combatState.team[i]) {
        continue;
      }
      healthArray.push(combatState.numberStates[combatState.team[i]].health);
      if (combatState.numberStates[combatState.team[i]].health) {
        allHealthZero = false;
      }
    }
    if (allHealthZero && winState == "combat") {
      setWinState("lose");
    }
    healthArrayRef.current = healthArray;
  }, [combatState]);

  function onAttack(n) {
    console.log("attack " + n);
    var didCrit = rollForCrit(n);
    var damage = didCrit ? n * 2 : n;
    var actualDamage = damage > enemyRef.current ? enemyRef.current : damage;
    scoreRef.current += actualDamage;
    enemyRef.current = Math.max(0, Math.floor(enemyRef.current - damage));
    if (enemyRef.current == 0) {
      setWinState("win");
    } else {
      showEnemyDamage();
      if (didCrit) {
        console.log(n + " crit!");
        showCrit();
        setRecords((prevRecords) => {
          return ["c" + n, ...prevRecords];
        });
      } else {
        setRecords((prevRecords) => {
          return [n, ...prevRecords];
        });
      }
    }
  }

  function onDivide(n) {
    if (n == 0) {
      return;
    }
    enemyRef.current = Math.max(0, Math.floor(enemyRef.current / n));
    if (enemyRef.current == 0) {
      setWinState("win");
    }
  }

  function onEnemyAttack() {
    var possibleIndices = healthArrayRef.current
      .map((value, index) => (value !== 0 ? index : -1))
      .filter((index) => index !== -1);
    if (possibleIndices.length == 0) {
      return;
    }
    var rollIndex =
      possibleIndices[Math.floor(Math.random() * possibleIndices.length)];

    var enemyDiv = document.getElementById("enemy-number");
    void enemyDiv.offsetWidth;
    enemyDiv.classList.add("enemy-attack-" + rollIndex);

    var numberDiv = document.getElementById("combat-number-" + rollIndex);
    numberDiv.classList.remove("damage");
    void numberDiv.offsetWidth;
    numberDiv.classList.add("damage");

    setTimeout(() => {
      enemyDiv.classList.remove("enemy-attack-" + rollIndex);
      numberDiv.classList.remove("damage");
    }, 200);

    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      var number = newCombatState.team[rollIndex];
      if (!newCombatState.numberStates[number].block) {
        if (newCombatState.numberStates[number].shields > 0) {
          newCombatState.numberStates[number].shields -= 1;
        } else {
          newCombatState.numberStates[number].health = Math.max(
            0,
            newCombatState.numberStates[number].health - enemyRef.current,
          );
        }
      }
      return newCombatState;
    });
  }

  function rollForCrit(n) {
    var data = getRarityData(n);
    var chance = data.combat_crit_chance;
    return Math.random() * 100 <= chance;
  }

  function showCrit() {
    var enemyDiv = document.getElementById("enemy-number");
    enemyDiv.classList.remove("crit");
    void enemyDiv.offsetWidth;
    enemyDiv.classList.add("crit");
    setTimeout(() => {
      enemyDiv.classList.remove("crit");
    }, 200);
  }

  function showEnemyDamage() {
    var enemyDiv = document.getElementById("enemy-number");
    enemyDiv.classList.remove("damage");
    void enemyDiv.offsetWidth;
    enemyDiv.classList.add("damage");
    setTimeout(() => {
      enemyDiv.classList.remove("damage");
    }, 200);
  }

  function getButtonContainerHeight() {
    if (!combatState || combatState.numberStates.length == 0) {
      return;
    }
    var canHeal = false;
    var canDivide = false;
    for (var i = 0; i < combatState.team.length; i++) {
      if (combatState.numberStates[combatState.team[i]].initialShields > 0) {
        canHeal = true;
      }
      if (combatState.numberStates[combatState.team[i]].canDivide) {
        canDivide = true;
      }
    }
    return (canHeal ? 4 : 0) + (canDivide ? 4 : 0);
  }

  function canStartCombat() {
    return diamonds >= COMBAT_START_COST;
  }

  function startCombat() {
    setShowCombat(true);
    setShowCombatSetup(false);

    setDiamonds(diamonds - COMBAT_START_COST);
    setPathMarginTop(pathMarginTop + 25);
    setNumbersMarginBottom(numbersMarginBottom + 15);
    var combatNumbers = document.getElementsByClassName(
      "combat-number-container",
    );
    var playerNumbers = document.getElementById("player-numbers");
    playerNumbers.classList.add("player-numbers-animate");
    var path = document.getElementById("path");
    path.classList.add("path-animate");
    setTimeout(() => {
      for (var i = 0; i < combatNumbers.length; i++) {
        combatNumbers[i].classList.remove("walk-forward");
        path.classList.remove("path-animate");
      }
      playerNumbers.classList.remove("player-numbers-animate");

      var enemy = document.getElementById("enemy-number");
      enemy.classList.remove("stomp-in");
      void enemy.offsetWidth;
      enemy.classList.add("stomp-in");
      setTimeout(() => {
        enemy.classList.remove("stomp-in");
        setWinState("combat");
      }, 2000);
    }, walkUpSpeed);

    for (var i = 0; i < 3; i++) {
      setTimeout(
        () => {
          var combatContainer = document.getElementById("combat-container");
          combatContainer.classList.remove("damage");
          void combatContainer.offsetWidth;
          combatContainer.classList.add("damage");
        },
        walkUpSpeed + 480 + i * 760,
      );
    }
  }

  function onNext() {
    var newEnemy = rollForCombatEnemy(combatState.level + 1);
    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      newCombatState.level += 1;
      newCombatState.enemy = newEnemy;

      for (var i = 0; i < newCombatState.team.length; i++) {
        newCombatState.numberStates[newCombatState.team[i]].health =
          newCombatState.team[i]; // restore health to default
      }
      console.log(newCombatState);
      return newCombatState;
    });
    enemyRef.current = newEnemy;
    setShowCombatSetup(true);
    setWinState("precombat");
    setNumbersMarginBottom(0);
  }

  function resetCombatState() {
    var newEnemy = rollForCombatEnemy(1);
    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      newCombatState.level = 1;
      newCombatState.enemy = newEnemy;
      newCombatState.numberStates = [];
      for (var i = 1; i <= 100; i++) {
        var level = getLevelData(numbers[i]);
        newCombatState.numberStates[i] = {
          n: i,
          health: i,
          block: false,
          shields: level.shields,
          initialShields: level.shields,
          canDivide: level.canDivide,
          team: [null, null, null],
        };
      }
      console.log(newCombatState.numberStates);

      return newCombatState;
    });
    enemyRef.current = newEnemy;
    setPathMarginTop(0);
    setNumbersMarginBottom(0);
    setIsNewHighScore(false);
  }

  function onBack() {
    resetCombatState();
    setShowCombat(false);
    setWinState("precombat");
  }

  function onTryAgain() {
    resetCombatState();
    setShowCombatSetup(true);
    setWinState("precombat");
  }

  return (
    <div className="combat-container" id="combat-container">
      {winState != "precombat" && (
        <div className="score-container">Score: {score.toLocaleString()}</div>
      )}
      {winState == "win" && (
        <div className="combat-outcome-popup">
          <div>SUCCESS</div>
          <div>
            <div className="combat-outcome-popup-text">Rewards:</div>
            {levelRewards &&
              Object.keys(levelRewards).map((r, i) => {
                return (
                  <div
                    key={"rewards-" + i}
                    className="combat-outcome-popup-text"
                  >
                    {getCurrencyIcon(r)}
                    {levelRewards[r].toLocaleString()}
                  </div>
                );
              })}
          </div>
          <button onClick={onNext}>Next</button>
        </div>
      )}
      {winState == "lose" && (
        <div className="combat-outcome-popup">
          <div>DEFEAT</div>
          <div className="combat-outcome-popup-text">
            Score: {score.toLocaleString()}
          </div>
          {isNewHighScore && <div>NEW HIGH SCORE!</div>}

          <div className="combat-outcome-popup-text">
            You shake yourself off and take a deep breath.
          </div>
          <button onClick={onTryAgain}>Try Again</button>
          <button onClick={onBack}>Back</button>
        </div>
      )}

      <div
        className="path"
        id="path"
        style={{ marginTop: pathMarginTop + "dvh" }}
      >
        <pre>{ascii}</pre>
      </div>
      <div className="combat-view">
        {showCombatSetup && combatState && (
          <div className="round-container">
            {("Round  " + combatState.level).split("").map((c, i) => (
              <span
                key={"round-string-" + i}
                className={"floating-letter floating-letter-" + i}
              >
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="enemy-section">
          <EnemyNumber
            enemyRef={enemyRef}
            onAttack={onEnemyAttack}
            winState={winState}
            winStateRef={winStateRef}
            isSetup={showCombatSetup}
          />
          <div className="enemy-text-container">
            {records.map((r, i) => {
              if (i > 0) {
                return null;
              }
              var text = "";
              if (r[0] == "c") {
                text = "Crit!";
              }
              return (
                <div className="enemy-text" key={"enemy-text-" + i}>
                  {text}
                </div>
              );
            })}
          </div>
        </div>
        <div className="player-numbers-section">
          {showCombatSetup && <div className="title your-team">YOUR TEAM</div>}
          <div
            className="player-numbers"
            id="player-numbers"
            style={{ transform: "translateY(-" + numbersMarginBottom + "dvh)" }}
          >
            {/* PRECOMBAT */}
            {combatState &&
              showCombatSetup &&
              combatState.team.map((n, i) => {
                return (
                  <CombatEntrySlot
                    key={"slot-" + i}
                    number={n}
                    index={i}
                    onEdit={() => {
                      setSelectingIndex(i);
                    }}
                    selectingIndex={selectingIndex == i}
                    numTimesRolled={numbers[n]}
                    isDead={
                      combatState.numberStates &&
                      combatState.numberStates[n] &&
                      combatState.numberStates[n].health <= 0
                    }
                  />
                );
              })}

            {/* COMBAT */}
            {combatState &&
              !showCombatSetup &&
              combatState.team.map((n, i) => (
                <CombatNumber
                  key={"combat-number-" + i}
                  number={n}
                  index={i}
                  onAttack={onAttack}
                  winState={winState}
                  combatState={combatState}
                  setCombatState={setCombatState}
                  onNumberDivide={onDivide}
                  winStateRef={winStateRef}
                  level={getLevelData(numbers[n])}
                  numTimesRolled={numbers[n]}
                  buttonContainerHeight={getButtonContainerHeight()}
                />
              ))}
          </div>

          <div className="combat-buttons-container">
            {showCombatSetup && (
              <button onClick={startCombat} disabled={!canStartCombat()}>
                Embark (&diams;&#xfe0e; {COMBAT_START_COST})
              </button>
            )}
            {winState == "combat" && <button onClick={onBack}>Retreat</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
