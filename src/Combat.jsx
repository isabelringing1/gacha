import { useRef, useState, useEffect } from "react";
import CombatNumber from "./CombatNumber";
import { getRarityData, getLevelData } from "./Util";
import EnemyNumber from "./EnemyNumber";

export default function Combat(props) {
  const { team, enemy, setShowCombat, numbers } = props;
  const [enemyState, setEnemyState] = useState(enemy);
  const [combatState, setCombatState] = useState("combat");
  const [teamState, setTeamState] = useState(null);
  const [records, setRecords] = useState([]);
  const enemyRef = useRef(enemy);
  const healthArrayRef = useRef();
  const combatStateRef = useRef(combatState);

  useEffect(() => {
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

    const interval = setInterval(() => {
      setEnemyState(enemyRef.current);
    }, 100); // sync rate

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    combatStateRef.current = combatState;
  }, [combatState]);

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
      setCombatState("lose");
    }
    healthArrayRef.current = healthArray;
  }, [teamState]);

  function onAttack(n) {
    var didCrit = rollForCrit(n);
    var damage = didCrit ? n * 2 : n;
    enemyRef.current = Math.max(0, Math.floor(enemyRef.current - damage));
    if (enemyRef.current == 0) {
      setCombatState("win");
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
      setCombatState("win");
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

  return (
    <div className="combat-container">
      <div className="combat-popup dither-bg">
        <div className="title">BATTLE</div>
        <div className="combat-popup-inner">
          <div className="combat-outcome">
            {combatState == "win"
              ? "Win!"
              : combatState == "lose"
                ? "Lost!"
                : ""}
          </div>
          <div className="combat-view">
            <div className="enemy-section">
              <EnemyNumber
                enemyRef={enemyRef}
                onAttack={onEnemyAttack}
                combatState={combatState}
                combatStateRef={combatStateRef}
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
              <div className="player-numbers">
                {teamState &&
                  team.map((n, i) => (
                    <CombatNumber
                      key={"combat-number-" + i}
                      number={n}
                      index={i}
                      onAttack={onAttack}
                      combatState={combatState}
                      teamState={teamState}
                      setTeamState={setTeamState}
                      onNumberDivide={onDivide}
                      combatStateRef={combatStateRef}
                      level={getLevelData(numbers[n])}
                      numTimesRolled={numbers[n]}
                      buttonContainerHeight={getButtonContainerHeight()}
                    />
                  ))}
              </div>
            </div>
          </div>

          <div className="combat-buttons-container">
            {combatState == "combat" && (
              <button onClick={() => setShowCombat(false)}>Escape</button>
            )}
            {(combatState == "win" || combatState == "lose") && (
              <button onClick={() => setShowCombat(false)}>Close</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
