import { useState } from "react";
import CombatEntrySlot from "./CombatEntrySlot";

export default function CombatMenu(props) {
  var {
    combatState,
    setCombatState,
    setWinState,
    selectingIndex,
    setSelectingIndex,
    numbers,
    showReequip,
    enemyRef,
    setEnemyState,
    selectNumber,
    isDraggingNumber,
  } = props;

  var [selectedEnemy, setSelectedEnemy] = useState(
    combatState && combatState.selectedEnemyCoords
      ? combatState.selectedEnemyCoords
      : [0, 0]
  );

  var currentEnemy =
    combatState && combatState.pyramidEnemies
      ? combatState.pyramidEnemies[selectedEnemy[0]][selectedEnemy[1]].value
      : 0;

  var draggingIsDuplicate =
    isDraggingNumber && combatState.team.includes(isDraggingNumber);
  var duplicateSlotIndex = draggingIsDuplicate
    ? combatState.team.indexOf(isDraggingNumber)
    : -1;

  function onChallenge() {
    if (!combatState || !combatState.pyramidEnemies) return;
    var enemy =
      combatState.pyramidEnemies[selectedEnemy[0]][selectedEnemy[1]];
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
      className="combat-menu-container"
      style={{ opacity: showReequip ? 0 : 1 }}
    >
      <div className="combat-menu-team-section">
        <div className="combat-entry-text">TEAM</div>
        <div className="combat-slots-container">
          {combatState &&
            combatState.team.map((n, i) => (
              <CombatEntrySlot
                key={"combat-menu-slot-" + i}
                number={n}
                index={i}
                onEdit={() => setSelectingIndex(i)}
                selectingIndex={selectingIndex === i}
                inCombatEntry={true}
                currentEnemy={currentEnemy}
                onDropNumber={selectNumber}
                isDraggingNumber={isDraggingNumber}
                duplicateBlocked={draggingIsDuplicate && i !== duplicateSlotIndex}
                numTimesRolled={numbers[n]}
                isDead={
                  combatState.numberStates &&
                  combatState.numberStates[n] &&
                  combatState.numberStates[n].health <= 0
                }
              />
            ))}
        </div>
        <button className="combat-menu-start-button" onClick={onChallenge}>
          START
        </button>
      </div>
    </div>
  );
}
