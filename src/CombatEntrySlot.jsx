import { useState } from "react";
export default function CombatEntrySlot(props) {
  var { index, number, onEdit, selectingIndex } = props;

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
      }}
    >
      {hover && !selectingIndex && (
        <div className="combat-slot-hover-view">EDIT</div>
      )}
      {selectingIndex && <div className="combat-slot-hover-view">PICK</div>}
      {number ? number : ""}
    </div>
  );
}
