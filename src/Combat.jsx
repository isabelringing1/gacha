import { useRef, useState, useEffect } from "react";
import CombatNumber from "./CombatNumber";
import CombatEntrySlot from "./CombatEntrySlot";
import { getRarityData, getLevelData, rollForCombatEnemy } from "./Util";
import EnemyNumber from "./EnemyNumber";
import ascii from "/path.txt?raw";

export default function Combat(props) {
  const {
    team,
    setTeam,
    combatState,
    setShowCombat,
    setCombatState,
    numbers,
    selectingIndex,
    setSelectingIndex,
  } = props;
  const [enemyState, setEnemyState] = useState(combatState.enemy);
  const [winState, setWinState] = useState("precombat");
  const [teamState, setTeamState] = useState(null);
  const [records, setRecords] = useState([]);
  const [showCombatSetup, setShowCombatSetup] = useState(true);

  const enemyRef = useRef(combatState.enemy);
  const healthArrayRef = useRef();
  const winStateRef = useRef(winState);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnemyState(enemyRef.current);
    }, 100); // sync rate

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    winStateRef.current = winState;
  }, [winState]);

  useEffect(() => {
    if (showCombatSetup) {
      var newTeamState = [];
      for (var i = 0; i < team.length; i++) {
        var level = getLevelData(numbers[team[i]]);
        newTeamState.push({
          n: team[i],
          health: team[i],
          block: false,
          shields: level.shields,
          initialShields: level.shields,
        });
      }
      setTeamState(newTeamState);
    }
  }, [team]);

  useEffect(() => {
    if (!teamState) {
      return;
    }

    var allHealhZero = true;
    var healthArray = [];
    for (var i = 0; i < teamState.length; i++) {
      healthArray.push(teamState[i].health);
      if (teamState[i].health > 0) {
        allHealhZero = false;
      }
    }
    if (allHealhZero) {
      setWinState("lose");
    }
    healthArrayRef.current = healthArray;
  }, [teamState]);

  function onAttack(n) {
    var didCrit = rollForCrit(n);
    var damage = didCrit ? n * 2 : n;
    enemyRef.current = Math.max(0, Math.floor(enemyRef.current - damage));
    if (enemyRef.current == 0) {
      setWinState("win");
    } else {
      showEnemyDamage();
      if (didCrit) {
        console.log(n + " crit!");

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
    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      if (!newCombatState.numberStates) {
        newCombatState.numberStates = [];
      }
      for (var i = 0; i < teamState.length; i++) {
        if (!newCombatState.numberStates[teamState[i].n]) {
          newCombatState.numberStates[teamState[i].n] = {};
        }
        newCombatState.numberStates[teamState[i].n].shields =
          teamState[i].shields;
        newCombatState.numberStates[teamState[i].n].health =
          teamState[i].health;
      }
      return newCombatState;
    });

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

    setTeamState((prevTeamState) => {
      var newTeamState = [...prevTeamState];
      if (!newTeamState[rollIndex].block) {
        if (newTeamState[rollIndex].shields > 0) {
          newTeamState[rollIndex].shields -= 1;
        } else {
          newTeamState[rollIndex].health = Math.max(
            0,
            newTeamState[rollIndex].health - enemyRef.current,
          );
        }
      }
      return newTeamState;
    });
  }

  function rollForCrit(n) {
    var data = getRarityData(n);
    var chance = data.combat_crit_chance;
    return Math.random() * 100 <= chance;
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
    var canHeal = false;
    var canDivide = false;
    for (var i = 0; i < teamState.length; i++) {
      if (teamState[i].initialShields > 0) {
        canHeal = true;
      }
      if (teamState[i].canDivide) {
        canDivide = true;
      }
    }
    return (canHeal ? 4 : 0) + (canDivide ? 4 : 0);
  }

  function startCombat() {
    setShowCombat(true);
    setShowCombatSetup(false);

    var enemy = document.getElementById("enemy-number");
    enemy.classList.remove("stomp-in");
    void enemy.offsetWidth;
    enemy.classList.add("stomp-in");
    setTimeout(() => {
      enemy.classList.remove("stomp-in");
      setWinState("combat");
    }, 2000);

    for (var i = 0; i < 3; i++) {
      setTimeout(
        () => {
          var combatContainer = document.getElementById("combat-container");
          combatContainer.classList.remove("damage");
          void combatContainer.offsetWidth;
          combatContainer.classList.add("damage");
        },
        480 + i * 760,
      );
    }
  }

  function onNext() {
    var newEnemy = rollForCombatEnemy(combatState.level + 1);
    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      newCombatState.level += 1;
      newCombatState.enemy = newEnemy;
      if (!newCombatState.numberStates) {
        newCombatState.numberStates = [];
      }
      for (var i = 0; i < teamState.length; i++) {
        if (!newCombatState.numberStates[teamState[i].n]) {
          newCombatState.numberStates[teamState[i].n] = {};
        }
        newCombatState.numberStates[teamState[i].n].shields =
          teamState[i].shields;
        newCombatState.numberStates[teamState[i].n].health =
          teamState[i].health;
      }
      console.log(newCombatState);
      return newCombatState;
    });
    enemyRef.current = newEnemy;
    setShowCombatSetup(true);
    setWinState("precombat");
  }

  function onLose() {
    var newEnemy = rollForCombatEnemy(1);
    setCombatState((oldCombatState) => {
      var newCombatState = { ...oldCombatState };
      newCombatState.level = 1;
      newCombatState.enemy = newEnemy;
      return newCombatState;
    });
    enemyRef.current = newEnemy;

    setShowCombat(false);
    setCombatState(null);
  }

  return (
    <div className="combat-container" id="combat-container">
      {winState == "win" && (
        <div className="combat-outcome-popup">
          <div>SUCCESS</div>
          <div className="combat-outcome-popup-text">Rewards:</div>
          <button onClick={onNext}>Next</button>
        </div>
      )}
      {winState == "lose" && (
        <div className="combat-outcome-popup">
          <div>DEFEAT</div>
          <div className="combat-outcome-popup-text">
            You shake yourself off and take a deep breath.
          </div>
          <button onClick={onLose}>Try Again</button>
          <button onClick={onLose}>Back</button>
        </div>
      )}

      <div className="path">
        <pre>{ascii}</pre>
      </div>
      <div className="combat-view">
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
        {showCombatSetup && (
          <div className="team-setup-section">
            <div className="title">YOUR TEAM</div>
            <div className="combat-slots-container">
              {team.map((n, i) => {
                return (
                  <CombatEntrySlot
                    key={"slot-" + i}
                    number={n}
                    index={i}
                    onEdit={() => {
                      setSelectingIndex(i);
                    }}
                    selectingIndex={selectingIndex == i}
                  />
                );
              })}
            </div>
            <button onClick={startCombat}>Start</button>
          </div>
        )}

        {!showCombatSetup && (
          <div className="player-numbers-section">
            <div className="player-numbers">
              {teamState &&
                team.map((n, i) => (
                  <CombatNumber
                    key={"combat-number-" + i}
                    number={n}
                    index={i}
                    onAttack={onAttack}
                    winState={winState}
                    teamState={teamState}
                    setTeamState={setTeamState}
                    onNumberDivide={onDivide}
                    winStateRef={winStateRef}
                    level={getLevelData(numbers[n])}
                    numTimesRolled={numbers[n]}
                    buttonContainerHeight={getButtonContainerHeight()}
                  />
                ))}
            </div>
            {!showCombatSetup && (
              <div className="combat-buttons-container">
                {winState == "combat" && (
                  <button onClick={onLose}>Retreat</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
