import { useState } from "react";
import CombatEntrySlot from "./CombatEntrySlot";
import shield from "/shield.png";

export default function CombatPyramid(props) {
  var {
    combatState,
    setCombatState,
    setWinState,
    selectingIndex,
    setSelectingIndex,
    numbers,
    showReequip,
    setShowReequip,
    enemyRef,
    setEnemyState,
  } = props;

  var [selectedEnemy, setSelectedEnemy] = useState([0, 0]);

  function isSelectable(levelIndex, enemyIndex) {
    //return true;
    if (!combatState || !combatState.pyramidEnemies) return false;
    if (combatState.pyramidEnemies[levelIndex][enemyIndex].isDefeated) return false;
    if (levelIndex === 0) return true;
    var below = combatState.pyramidEnemies[levelIndex - 1];
    return below[enemyIndex].isDefeated && below[enemyIndex + 1].isDefeated;
  }

  function onSelectEnemy(levelIndex, enemyIndex) {
    if (!isSelectable(levelIndex, enemyIndex)) return;
    setSelectedEnemy([levelIndex, enemyIndex]);
  }

  function onChallenge() {
    var enemy = combatState.pyramidEnemies[selectedEnemy[0]][selectedEnemy[1]];
    if (enemy.isDefeated) return;
    enemyRef.current = enemy.value;
    setEnemyState(enemy.value);
    setCombatState((prev) => ({
      ...prev,
      enemy: enemy.value,
      selectedEnemyCoords: [selectedEnemy[0], selectedEnemy[1]],
    }));
    setWinState("combat");
  }

  return (
    <div
      className="combat-pyramid-container"
      style={{ opacity: showReequip ? 0 : 1 }}
    >
      <div className="combat-pyramid">
        {combatState &&
          combatState.pyramidEnemies &&
          [...combatState.pyramidEnemies]
            .reverse()
            .map((row, reverseI) => {
              var levelIndex =
                combatState.pyramidEnemies.length - 1 - reverseI;
              return (
                <div key={"pyramid-row-" + levelIndex} className="pyramid-row">
                  {row.map((enemy, enemyIndex) => {
                    var isSelected =
                      selectedEnemy[0] === levelIndex &&
                      selectedEnemy[1] === enemyIndex;
                    var selectable = isSelectable(levelIndex, enemyIndex);
                    var showNumber = isSelected && !enemy.isDefeated;

                    return (
                      <div
                        key={"pyramid-enemy-" + levelIndex + "-" + enemyIndex}
                        className={
                          "pyramid-enemy" +
                          (enemy.isDefeated ? " pyramid-enemy-defeated" : "") +
                          (isSelected ? " pyramid-enemy-selected" : "") +
                          (!selectable ? " pyramid-enemy-locked" : "") +
                          (showNumber ? " pyramid-enemy-revealed" : "")
                        }
                        onClick={() => onSelectEnemy(levelIndex, enemyIndex)}
                      >
                        {showNumber ? (
                          <span className="pyramid-enemy-number">
                            {enemy.value.toLocaleString()}
                          </span>
                        ) : (
                          <div
                            className={
                              "pyramid-door" +
                              (!selectable && !enemy.isDefeated
                                ? " pyramid-door-above"
                                : "")
                            }
                          >
                            <img
                              src={shield}
                              className="pyramid-door-icon"
                              draggable={false}
                            />
                            {enemy.isDefeated && (
                              <div className="pyramid-door-check">&#x2713;</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
      </div>

      <div className="pyramid-team-section">
        <div className="combat-entry-text">TEAM</div>
        <div className="combat-slots-container">
          {combatState &&
            combatState.team.map((n, i) => (
              <CombatEntrySlot
                key={"pyramid-slot-" + i}
                number={n}
                index={i}
                onEdit={() => setSelectingIndex(i)}
                selectingIndex={selectingIndex === i}
                numTimesRolled={numbers[n]}
                isDead={
                  combatState.numberStates &&
                  combatState.numberStates[n] &&
                  combatState.numberStates[n].health <= 0
                }
              />
            ))}
        </div>
        <button className="pyramid-challenge-button" onClick={onChallenge}>
          CHALLENGE
        </button>
      </div>
    </div>
  );
}
