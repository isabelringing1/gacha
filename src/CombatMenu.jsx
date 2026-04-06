import CombatEntrySlot from "./CombatEntrySlot";

export default function CombatMenu(props) {
  var {
    combatState,
    selectingIndex,
    setSelectingIndex,
    numbers,
    showReequip,
    selectNumber,
    isDraggingNumber,
    anySlotHovered,
    setAnySlotHovered,
    currentEnemy,
  } = props;

  var draggingIsDuplicate =
    isDraggingNumber && combatState.team.includes(isDraggingNumber);
  var duplicateSlotIndex = draggingIsDuplicate
    ? combatState.team.indexOf(isDraggingNumber)
    : -1;

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
                setAnySlotHovered={setAnySlotHovered}
              />
            ))}
        </div>
           <div className="combat-menu-hover-view" style={{ opacity: anySlotHovered ? 1 : 0 }}>DRAG INTO SLOT TO SWAP</div>
      </div>
    </div>
  );
}
