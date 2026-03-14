import { useState } from "react";
import NumberTooltip from "./NumberTooltip";

export default function CombatEntrySlot(props) {
  var { currentEnemy, index, number, onEdit, selectingIndex, numTimesRolled, isDead, inCombatEntry, onDropNumber, isDraggingNumber } = props;

  var [hover, setHover] = useState(false);
  var [dragOver, setDragOver] = useState(false);
  var isFactor = currentEnemy % number == 0;
  console.log(currentEnemy, number, isFactor);
  return (
    <div
      className={"combat-slot" + (inCombatEntry ? " combat-slot-for-entry" : "") + (isFactor ? " factor-bg" : "") + (dragOver ? " drag-over" : "") + (isDraggingNumber && inCombatEntry ? " drag-pulse" : "")}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onClick={() => {
        if (selectingIndex) {
          onEdit(-1);
        } else {
          onEdit(index);
        }
        setHover(false);
      }}
      onDragOver={(e) => {
        if (inCombatEntry) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDragEnter={(e) => {
        if (inCombatEntry) {
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
        if (inCombatEntry && onDropNumber) {
          var droppedNumber = parseInt(e.dataTransfer.getData("text/plain"));
          if (!isNaN(droppedNumber)) {
            onDropNumber(droppedNumber, index);
          }
        }
      }}
    >
      {hover && !selectingIndex && (
        <div className="combat-slot-hover-view">EDIT</div>
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
