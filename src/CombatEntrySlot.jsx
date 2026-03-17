import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import NumberTooltip from "./NumberTooltip";

export default function CombatEntrySlot(props) {
  var { currentEnemy, index, number, onEdit, selectingIndex, numTimesRolled, isDead, inCombatEntry, onDropNumber, isDraggingNumber, duplicateBlocked } = props;

  var [hover, setHover] = useState(false);
  var [dragOver, setDragOver] = useState(false);
  var slotRef = useRef(null);
  var isFactor = currentEnemy % number == 0;

  function getTooltipPosition() {
    if (!slotRef.current) return { top: 0, left: 0 };
    var rect = slotRef.current.getBoundingClientRect();
    return {
      top: rect.bottom * 1.15,
      left: rect.left + rect.width / 2,
    };
  }

  return (
    <div
      ref={slotRef}
      className={"combat-slot" + (inCombatEntry ? " combat-slot-for-entry" : "") + (isFactor ? " factor-bg" : "") + (dragOver && !duplicateBlocked ? " drag-over" : "") + (isDraggingNumber && inCombatEntry && !duplicateBlocked ? " drag-pulse" : "") + (duplicateBlocked ? " duplicate-blocked" : "")}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onDragOver={(e) => {
        if (inCombatEntry && !duplicateBlocked) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDragEnter={(e) => {
        if (inCombatEntry && !duplicateBlocked) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => {
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (inCombatEntry && onDropNumber && !duplicateBlocked) {
          var droppedNumber = parseInt(e.dataTransfer.getData("text/plain"));
          if (!isNaN(droppedNumber)) {
            onDropNumber(droppedNumber, index);
          }
        }
      }}
    >
      {hover && !selectingIndex && inCombatEntry && (
        <div className="combat-slot-hover-view">DRAG TO SWAP</div>
      )}
      {hover && number && inCombatEntry && createPortal(
        <div className="combat-slot-tooltip-portal" style={{
          position: "fixed",
          top: getTooltipPosition().top,
          left: getTooltipPosition().left,
          transform: "translate(-50%, 0)",
          zIndex: 100,
          pointerEvents: "none",
        }}>
          <NumberTooltip
            n={number}
            isCombat={true}
            numTimesRolled={numTimesRolled}
            isFactor={isFactor}
          />
        </div>,
        document.body
      )}
      {hover && number && !inCombatEntry && (
        <NumberTooltip
          n={number}
          isCombat={true}
          numTimesRolled={numTimesRolled}
        />
      )}
      
      {selectingIndex && <div className="combat-slot-hover-view">PICK</div>}
      {number ? number : ""}
      {isDead && <div className="num-dead-x">×</div>}
    </div>
  );
}
