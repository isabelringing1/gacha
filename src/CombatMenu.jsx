import { useState } from "react";
import Number from "./Number";
import CombatEntrySlot from "./CombatEntrySlot";
import { getLevel } from "./Util";

function toRoman(num) {
  var lookup = [
    ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["III", 3], ["II", 2], ["I", 1],
  ];
  var result = "";
  for (var [roman, value] of lookup) {
    while (num >= value) {
      result += roman;
      num -= value;
    }
  }
  return result;
}

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
    spades,
    setSpades,
    selectNumber,
    isDraggingNumber,
    onDragStateChange,
    rarityHighlightUnlocked,
    highlightedNumber,
    highlightedNumbers,
    rolledNumber,
    badgedNumbers,
    showCombat,
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
    setWinState("intro");
  }

  return (
    <div
      className="combat-menu-container"
      style={{ opacity: showReequip ? 0 : 1 }}
    >
      <div className="combat-menu-grid">
        {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
          var numTimesRolled = numbers[n] || 0;
          var level = numTimesRolled > 0 ? getLevel(numTimesRolled) : 0;
          return (
            <div key={"combat-menu-num-" + n} className="combat-menu-number-wrapper">
              <Number
                n={n}
                data={numbers[n]}
                isHighlighted={
                  highlightedNumber === n || highlightedNumbers.includes(n)
                }
                isRolled={rolledNumber === n}
                isBadged={badgedNumbers.includes(n)}
                rarityHighlightUnlocked={rarityHighlightUnlocked}
                selectingIndex={selectingIndex}
                selectNumber={selectNumber}
                combatState={combatState}
                showCombat={showCombat}
                onDragStateChange={onDragStateChange}
                inCombatMenu={true}
              />
              {numTimesRolled > 0 && level > 0 && (
                <div className="combat-menu-level-subscript">
                  {toRoman(level)}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
