import { useEffect } from "react";
import CombatEntrySlot from "./CombatEntrySlot";
import { DitherShader } from "./dither-shader";
import numberBg from "/number_bg.png";
import arrow from "/dotted_arrow.png";

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
    belowEntry,
    isLoading,
    swapInstructionsSeen,
    setSwapInstructionsSeen,
  } = props;

  var draggingIsDuplicate =
    isDraggingNumber && combatState.team.includes(isDraggingNumber);
  var duplicateSlotIndex = draggingIsDuplicate
    ? combatState.team.indexOf(isDraggingNumber)
    : -1;

  var showSwapInstructions =
    !swapInstructionsSeen &&
    !showReequip &&
    combatState &&
    combatState.combatLevel > 1;

  useEffect(() => {
    if (showSwapInstructions && isDraggingNumber) {
      setSwapInstructionsSeen(true);
    }
  }, [showSwapInstructions, isDraggingNumber]);

  useEffect(() => {
    if (!showSwapInstructions) return;
    function dismiss() {
      setSwapInstructionsSeen(true);
    }
    window.addEventListener("mousedown", dismiss);
    window.addEventListener("touchstart", dismiss);
    return () => {
      window.removeEventListener("mousedown", dismiss);
      window.removeEventListener("touchstart", dismiss);
    };
  }, [showSwapInstructions]);

  return (
    <div
      className={"combat-menu-container" + (belowEntry ? " combat-menu-below-entry" : "")}
      style={{ opacity: showReequip ? 0 : 1 }}
    >
      <div className="combat-menu-team-section">
        {showSwapInstructions && (
          <div className="swap-instructions">
            <DitherShader
              src={numberBg}
              gridSize={2}
              ditherMode="bayer"
              colorMode="colorMode"
              className="swap-instructions-bg"
              objectFit="fill"
              threshold={0}
              brightness={0.05}
              children={[
                <div key="swap-text" className="swap-instructions-text">
                  drag numbers in to change your team!
                </div>,
              ]}
            />
          </div>
        )}
        {showSwapInstructions && (
          <div className="swap-instructions-arrow">
            <img src={arrow} className="swap-instructions-arrow-img" />
          </div>
        )}
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
                isLoading={isLoading}
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
           <div className="combat-menu-hover-view" style={{ opacity: anySlotHovered && combatState.combatLevel > 1 ? 1 : 0 }}>DRAG INTO SLOT TO SWAP</div>
      </div>
    </div>
  );
}
