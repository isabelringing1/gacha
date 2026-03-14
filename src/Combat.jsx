import { useRef, useState, useEffect } from "react";
import CombatNumber from "./CombatNumber";
import CombatEntrySlot from "./CombatEntrySlot";
import {
  getRarityData,
  getLevelData,
  generateCombatRewards,
  getCurrencyIcon,
  generateEnemies,
} from "./Util";
import { isMobile, DIVIDE_LEVEL } from "./constants.js";
import EnemyNumber from "./EnemyNumber";
import CombatPyramid from "./CombatPyramid.jsx";

export default function Combat(props) {
  const {
    combatState,
    setShowCombat,
    setCombatState,
    numbers,
    selectingIndex,
    setSelectingIndex,
    claimRewards,
    spades,
    setSpades,
    highScore,
    setHighScore,
    showReequip,
    setShowReequip,
    firstCombatCompleted,
    setFirstCombatCompleted,
  } = props;
  const [enemyState, setEnemyState] = useState(null);
  const [winState, setWinState] = useState("pyramid");
  const [records, setRecords] = useState([]);
  const [levelRewards, setLevelRewards] = useState({});
  const [score, setScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showStartLabel, setShowStartLabel] = useState(false);
  const [isTutorial, setIsTutorial] = useState(false);

  const enemyRef = useRef(null);
  const healthArrayRef = useRef();
  const winStateRef = useRef(winState);
  const scoreRef = useRef(0);

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
          team: [null, null, null],
        };
      }
      if (!newCombatState.pyramidEnemies) {
        newCombatState.pyramidEnemies = generateEnemies();
      }

      if (!firstCombatCompleted) {
        var teamSum = newCombatState.team.reduce((sum, n) => sum + (n || 0), 0);
        newCombatState.enemy = teamSum;
        enemyRef.current = teamSum;
        setEnemyState(teamSum);
        setIsTutorial(true);
        setWinState("intro");
      }

      setCombatState(newCombatState);
    } else {
      resetCombatState();
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    winStateRef.current = winState;
    if (winState == "intro") {
      setTimeout(() => {
        var combatView = document.getElementById("combat-container");
        combatView.classList.add("damage");
        var enemySection = document.getElementById("enemy-section");
        enemySection.style.opacity = 1;
        setTimeout(() => {
          setShowStartLabel(true);
          var startTimer = setTimeout(() => setShowStartLabel(false), 500);
          return () => clearTimeout(startTimer);
        }, 150);
      }, 1650);


      var introTimer = setTimeout(() => {
        setWinState("combat");
      }, 2200);
      return () => clearTimeout(introTimer);
    }
    if (winState == "win") {
      if (!isTutorial) {
        var rewards = generateCombatRewards(combatState.level, combatState.enemy);
        console.log("rewards: ", rewards);
        setLevelRewards(rewards);
        claimRewards(rewards);
        if (scoreRef.current > highScore) {
          setHighScore(scoreRef.current);
          setIsNewHighScore(true);
        }
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
      setEnemyState(null);
      enemyRef.current = null;
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
      setWinState("pyramid");
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
    if (!combatState || Object.keys(combatState.numberStates).length == 0) {
      return;
    }
    var canHeal = false;
    var hasDivide = false;
    for (var i = 0; i < combatState.team.length; i++) {
      if (combatState.numberStates[combatState.team[i]].initialShields > 0) {
        canHeal = true;
      }
      var teamLevel = getLevelData(numbers[combatState.team[i]]);
      if (teamLevel.level >= DIVIDE_LEVEL) {
        hasDivide = true;
      }
    }
    return 4 + (canHeal ? 4 : 0) + (hasDivide ? 4 : 0);
  }

  function onNext() {
    if (isTutorial) {
      setFirstCombatCompleted(true);
      setIsTutorial(false);
      setCombatState((oldCombatState) => {
        var newCombatState = { ...oldCombatState };
        newCombatState.selectedEnemyCoords = [0, 0];
        for (var i = 1; i <= 100; i++) {
          var level = getLevelData(numbers[i]);
          newCombatState.numberStates[i] = {
            n: i,
            health: i,
            block: false,
            shields: level.shields,
            initialShields: level.shields,
            team: [null, null, null],
          };
        }
        return newCombatState;
      });
      setWinState("pyramid");
      return;
    }

    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      var coords = newCombatState.selectedEnemyCoords;
      if (coords && newCombatState.pyramidEnemies) {
        newCombatState.pyramidEnemies[coords[0]][coords[1]] = {
          ...newCombatState.pyramidEnemies[coords[0]][coords[1]],
          isDefeated: true,
        };
      }
      // Refresh all number states after battle
      for (var i = 1; i <= 100; i++) {
        var level = getLevelData(numbers[i]);
        newCombatState.numberStates[i] = {
          n: i,
          health: i,
          block: false,
          shields: level.shields,
          initialShields: level.shields,
          team: [null, null, null],
        };
      }
      return newCombatState;
    });
    setWinState("pyramid");
  }

  function resetCombatState() {
    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      newCombatState.level = 1;
      newCombatState.numberStates = [];
      for (var i = 1; i <= 100; i++) {
        var level = getLevelData(numbers[i]);
        newCombatState.numberStates[i] = {
          n: i,
          health: i,
          block: false,
          shields: level.shields,
          initialShields: level.shields,
          team: [null, null, null],
        };
      }
      console.log(newCombatState.numberStates);

      return newCombatState;
    });
    setIsNewHighScore(false);
  }

  function onBack() {
    // Refresh all number states after battle
    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      for (var i = 1; i <= 100; i++) {
        var level = getLevelData(numbers[i]);
        newCombatState.numberStates[i] = {
          n: i,
          health: i,
          block: false,
          shields: level.shields,
          initialShields: level.shields,
          team: [null, null, null],
        };
      }
      return newCombatState;
    });
    setWinState("pyramid");
  }

  return (
    <div className="combat-container" id="combat-container">
      {winState == "pyramid" && (
        <CombatPyramid
          combatState={combatState}
          setCombatState={setCombatState}
          setWinState={setWinState}
          selectingIndex={selectingIndex}
          setSelectingIndex={setSelectingIndex}
          numbers={numbers}
          showReequip={showReequip}
          setShowReequip={setShowReequip}
          enemyRef={enemyRef}
          setEnemyState={setEnemyState}
          spades={spades}
          setSpades={setSpades}
        />
      )}
      {showStartLabel && <div className="start-label">START!</div>}
      {winState == "combat" && !showReequip && (
        <div className="score-container">Score: {score.toLocaleString()}</div>
      )}
      {winState == "win" && (
        <div className="combat-outcome-popup">
          <div>SUCCESS</div>
          {isTutorial ? (
            <div className="combat-outcome-popup-text">
              <div>You are ready.</div>
              <div> Climb the pyramid. </div>
            </div>
            
          ) : (
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
          )}
          <button onClick={onNext}>Continue</button>
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
          <button onClick={onBack}>Back</button>
        </div>
      )}
      {winState !== "pyramid" && (
        <div className={"combat-view" + (winState === "intro" ? " combat-view-intro" : "")}>
          <div className={"enemy-section" + (winState === "intro" ? " stomp-in-short" : "")} id="enemy-section">
            <EnemyNumber
              enemyRef={enemyRef}
              onAttack={onEnemyAttack}
              winState={winState}
              winStateRef={winStateRef}
              isSetup={showReequip}
              isTutorial={isTutorial}
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
            {showReequip && <div className="title your-team">YOUR TEAM</div>}
            <div
              className={"player-numbers" + (winState === "intro" ? " walk-forward" : "")}
              id="player-numbers"
            >
              {/* setup */}
              {combatState &&
                showReequip &&
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
                      currentEnemy={enemyRef.current}
                    />
                  );
                })}

              {/* COMBAT */}
              {combatState &&
                Object.keys(combatState.numberStates).length > 0 &&
                !showReequip &&
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
              {showReequip && (
                <button
                  onClick={() => {
                    setShowReequip(false);
                  }}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
