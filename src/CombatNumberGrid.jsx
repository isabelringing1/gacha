import { useState } from "react";
import Number from "./Number";

export default function CombatNumberGrid(props) {
  const { numbers, selectingIndex, selectNumber, combatState } = props;
  const [highlightedNumber, setHighlightedNumber] = useState(-1);

  return (
    <div className="combat-numbers-grid">
      <div className="combat-numbers-grid-inner">
        {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
          return (
            <Number
              key={"number-" + n}
              n={n}
              data={numbers[n]}
              isHighlighted={highlightedNumber === n}
              selectingIndex={selectingIndex}
              selectNumber={selectNumber}
              isDead={
                combatState.numberStates &&
                combatState.numberStates[n] &&
                combatState.numberStates[n].health <= 0
              }
            />
          );
        })}
      </div>
    </div>
  );
}
