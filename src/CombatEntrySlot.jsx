import { useState } from "react";
import NumberTooltip from "./NumberTooltip";

export default function CombatEntrySlot(props) {
  var { index, number, onEdit, selectingIndex, numTimesRolled, isDead } = props;

  var [hover, setHover] = useState(false);
  return (
    <div
      className="combat-slot"
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
    >
      {hover && !selectingIndex && (
        <div className="combat-slot-hover-view">EDIT</div>
      )}
      {hover && number && (
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
