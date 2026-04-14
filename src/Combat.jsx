import { useRef, useState, useEffect } from "react";
import CombatNumber from "./CombatNumber";
import CombatEntrySlot from "./CombatEntrySlot";
import {
  getRarityData,
  getLevelData,
  generateCombatRewards,
  getCurrencyIcon,
  generateEnemyForLevel,
  getCombatLevelData,
} from "./Util";
import { isMobile, DIVIDE_LEVEL, CRIT_FACTOR } from "./constants.js";
import EnemyNumber from "./EnemyNumber";
import CombatMenu from "./CombatMenu.jsx";
import CombatShop from "./CombatShop.jsx";
import CombatEntry from "./CombatEntry.jsx";

const failStrings = [ "Your calculations were off...", "Back to the drawing board.", "You'll crack it soon.", "Time to try something new."]
const winStrings = [ "You're a natural.", "You made that look easy.", "PHEW.", "That was fast."]

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
    currentEnemy,
    selectNumber,
    isDraggingNumber,
    setIsCombatActive,
    buyCombatShopItem,
    battleShopState,
    canUnlockBattleShop,
    unlockBattleShop,
    clubs,
    hearts,
    setHearts,
  } = props;
  const [enemyState, setEnemyState] = useState(null);
  const [winState, setWinState] = useState("menu");
  const [records, setRecords] = useState([]);
  const [levelRewards, setLevelRewards] = useState({});
  const [score, setScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [anySlotHovered, setAnySlotHovered] = useState(false);
  const [showStartLabel, setShowStartLabel] = useState(false);
  const [failString, setFailString] = useState(getRandomFailString());
  const [winString, setWinString] = useState(getRandomWinString());

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
      if (!newCombatState.combatLevel) {
        newCombatState.combatLevel = 1;
        newCombatState.currentEnemyValue = generateEnemyForLevel(1);
        newCombatState.levelRewards = generateCombatRewards(1, newCombatState.currentEnemyValue);
      }

      setCombatState(newCombatState);
    } else {
      resetCombatState();
    }

    return () => {
      clearInterval(interval);
      if (setIsCombatActive) setIsCombatActive(false);
    };
  }, []);

  useEffect(() => {
    winStateRef.current = winState;
    if (setIsCombatActive) setIsCombatActive(winState !== "menu");
    if (winState == "win") {
      setWinString(getRandomWinString());
      {
        var rewards = combatState.levelRewards || {};
        setLevelRewards(rewards);
        claimRewards(rewards);
        if (scoreRef.current > highScore) {
          setHighScore(scoreRef.current);
          setIsNewHighScore(true);
        }
      }
    }
    if (winState == "lose") {
      setFailString(getRandomFailString());
    }
    if (winState == "intro") {
      var playerNumbers = document.getElementById("player-numbers");
      var enemySection = document.getElementById("enemy-section");
      var combatContainer = document.getElementById("combat-container");

      if (playerNumbers) {
        playerNumbers.classList.remove("walk-forward");
        void playerNumbers.offsetWidth;
        playerNumbers.classList.add("walk-forward");
      }
      if (enemySection) {
       
        enemySection.style.opacity = 0;
        setTimeout(() => {
          enemySection.classList.remove("stomp-in-short");
          void enemySection.offsetWidth;
          enemySection.classList.add("stomp-in-short");
          combatContainer.classList.remove("shake-screen");
         
          enemySection.style.opacity = 1;
          setTimeout(() => {
            combatContainer.classList.add("shake-screen");
          }, 200);
          setTimeout(() => {
            setWinState("combat");
          }, 500);
          
        }, 1500);
      }
    }
    if (winState == "combat") {
      setShowStartLabel(true);
      setTimeout(() => {
        setShowStartLabel(false);
      }, 500);
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
      setCombatState((oldCombatState) => {
        var newCombatState = { ...oldCombatState };
        newCombatState.active = false;
        return newCombatState;
      });
      setWinState("menu");
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

    var attackLength = (getCombatLevelData(combatState.combatLevel) || {}).attack_length || 0.8;
    console.log(attackLength);
    attackLength *= 1000; //ms
    
    var currTimestamp = Date.now();

    // Strike lands at 75% of total animation
    var strikeTiming = Math.round(attackLength * 0.75);
    var cooldownTiming = Math.round(attackLength * 0.25);

    var enemyDiv = document.getElementById("enemy-number");
    enemyDiv.classList.remove("enemy-attack-0", "enemy-attack-1", "enemy-attack-2");
    enemyDiv.style.setProperty('--strike-duration', attackLength + 'ms');
    void enemyDiv.offsetWidth;
    enemyDiv.classList.add("enemy-attack-" + rollIndex);

    // Delay damage and hit flash to the strike moment
    setTimeout(() => {
      var numberDiv = document.getElementById("combat-number-" + rollIndex);
      numberDiv.classList.remove("damage");
      void numberDiv.offsetWidth;
      numberDiv.classList.add("damage");

      var damageTimestamp = Date.now();
      var damageDuration = damageTimestamp - currTimestamp;
     

      setTimeout(() => {
        numberDiv.classList.remove("damage");
      }, cooldownTiming);

      console.log("Checking");

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
    }, strikeTiming);

    // Clean up enemy animation after full duration
    setTimeout(() => {
      enemyDiv.classList.remove("enemy-attack-" + rollIndex);
    }, attackLength);
  }

  function rollForCrit(n) {
    var data = getRarityData(n);
    var chance = data.combat_crit_chance;
    if (currentEnemy % n == 0) {
      chance *= CRIT_FACTOR;
      chance = Math.floor(chance);
    }
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
    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      var nextLevel = (newCombatState.combatLevel || 1) + 1;
      newCombatState.combatLevel = nextLevel;
      newCombatState.currentEnemyValue = generateEnemyForLevel(nextLevel);
      newCombatState.levelRewards = generateCombatRewards(Math.min(nextLevel, 10), newCombatState.currentEnemyValue);
      newCombatState.active = false;
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
    setWinState("menu");
  }

  function resetCombatState() {
    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      newCombatState.level = 1;
      newCombatState.numberStates = [];
      newCombatState.active = false;
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
      newCombatState.active = false;
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
    setWinState("menu");
  }

  function onChallenge() {
    console.log(combatState);
    if (!combatState || !combatState.currentEnemyValue) return;
    var enemyValue = combatState.currentEnemyValue;

    // Level 1: enemy is the sum of the three equipped numbers
    if (combatState.combatLevel === 1) {
      var teamSum = combatState.team.reduce((sum, n) => sum + (n || 0), 0);
      if (teamSum > 0) {
        enemyValue = teamSum;
      }
    }

    enemyRef.current = enemyValue;
    setEnemyState(enemyValue);
    setCombatState((prev) => ({
      ...prev,
      enemy: enemyValue,
      currentEnemyValue: enemyValue,
      active: true
    }));
    setWinState("intro");

  }

  function getRandomFailString() {
    return failStrings[Math.floor(Math.random() * failStrings.length)];
  }

  function getRandomWinString() {
    if (!combatState || combatState.combatLevel === 1) {
      return "That's how you do it."
    }
    return winStrings[Math.floor(Math.random() * winStrings.length)];
  }

  return (
    <div className="combat-container" id="combat-container">
      {winState == "combat" && (
        <button
          className={"run-away-button"}
          onClick={() => setShowCombat(!showCombat)}
        >
        RUN AWAY
        </button>
      )}

      {showStartLabel && <div className="start-label">START</div>}
      {winState == "menu" && (
        <>
          {combatState.combatLevel > 1 && (
            <CombatShop
              spades={spades}
              buyCombatShopItem={buyCombatShopItem}
              battleShopState={battleShopState}
              canUnlockBattleShop={canUnlockBattleShop}
              unlockBattleShop={unlockBattleShop}
              clubs={clubs}
            />
          )}
          <CombatEntry
            currentEnemy={combatState.combatLevel === 1 ? combatState.team.reduce((sum, n) => sum + (n || 0), 0) : currentEnemy}
            onChallenge={onChallenge}
            combatLevel={combatState.combatLevel}
            levelRewards={combatState.levelRewards}
            centered={combatState.combatLevel === 1}
          />
          {combatState.combatLevel === 1 && (
            <CombatMenu
              combatState={combatState}
              selectingIndex={selectingIndex}
              setSelectingIndex={setSelectingIndex}
              numbers={numbers}
              showReequip={showReequip}
              selectNumber={selectNumber}
              isDraggingNumber={isDraggingNumber}
              anySlotHovered={anySlotHovered}
              setAnySlotHovered={setAnySlotHovered}
              currentEnemy={combatState.team.reduce((sum, n) => sum + (n || 0), 0)}
              belowEntry={true}
            />
          )}
          {combatState.combatLevel > 1 && (
            <CombatMenu
              combatState={combatState}
              selectingIndex={selectingIndex}
              setSelectingIndex={setSelectingIndex}
              numbers={numbers}
              showReequip={showReequip}
              selectNumber={selectNumber}
              isDraggingNumber={isDraggingNumber}
              anySlotHovered={anySlotHovered}
              setAnySlotHovered={setAnySlotHovered}
              currentEnemy={currentEnemy}
            />
          )}
        </>
      )}
      {winState == "combat" && !showReequip && (
        <div className="score-container">Score: {score.toLocaleString()}</div>
      )}
      {winState == "win" && (
        <div className="combat-outcome-popup dither-bg">
          <div className="title">YOU WON</div>
          <div className="combat-outcome-popup-body">
            <div className="combat-outcome-popup-text">
              {winString}
            </div>
            <div className="combat-outcome-popup-text"><b>REWARDS:</b></div>
            <div className="combat-entry-rewards">
              {levelRewards && Object.keys(levelRewards).map((r, i) => (
                <div key={"reward-" + i} className="combat-entry-rewards-item">
                  {getCurrencyIcon(r)}
                  {levelRewards[r].toLocaleString()}
                </div>
              ))}
            </div>
              <button className="combat-outcome-popup-button" onClick={onNext}>Continue</button>
          </div>
          
        </div>
      )}
      {winState == "lose" && (
        <div className="combat-outcome-popup dither-bg">
          <div className="title">YOU LOST</div>
          <div className="combat-outcome-popup-body">
            <div className="combat-outcome-popup-text">
              {failString}
            </div>
            <button onClick={onBack} className="combat-outcome-popup-button">Back</button>
          </div>
        </div>
      )}
      {winState !== "menu" && (
        <>
        <div className="combat-view">
          <div className="enemy-section" id="enemy-section">
            <EnemyNumber
              enemyRef={enemyRef}
              onAttack={onEnemyAttack}
              winState={winState}
              winStateRef={winStateRef}
              isSetup={showReequip}
              attributes={(getCombatLevelData(combatState.combatLevel) || {}).attributes || []}
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
              className="player-numbers"
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
                      currentEnemy={currentEnemy}
                      setAnySlotHovered={setAnySlotHovered}
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
                    isFactor={currentEnemy % n == 0}
                    attackFirst={true}
                    hearts={hearts}
                    setHearts={setHearts}
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

          {winState == "combat" && (
          <div id="hearts-container" className="hearts-container">
                &hearts;&#xfe0e; {hearts.toLocaleString()}
              </div>
            )}
        </div>
        </>
      )}
    </div>
  );
}
