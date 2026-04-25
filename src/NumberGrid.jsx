import Number from "./Number";
import { getLevel } from "./Util";

export function StarLevel({ level }) {
  var numStars = level - 1;
  if (numStars <= 0) return null;
  return (
    <>
      {Array.from({ length: numStars }, (_, i) => {
        const step = 30;
        const startAngle = 90 - ((numStars - 1) * step) / 2;
        const angleDeg = startAngle + i * step;
        const angle = angleDeg * (Math.PI / 180);
        const r = 45;
        const x = 50 + r * Math.cos(angle);
        const y = 50 + r * Math.sin(angle);
        const rotation = angleDeg + 270;
        return (
          <svg
            key={i}
            className="star-level-star"
            style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
              fill="black"
              stroke="black"
              strokeWidth="10"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </>
  );
}

export default function NumberGrid({
  numbers,
  highlightedNumber,
  highlightedNumbers,
  rolledNumber,
  badgedNumbers,
  rarityHighlightUnlocked,
  selectingIndex,
  selectNumber,
  combatState,
  showCombat,
  onDragStateChange,
  inCombatMenu,
  isCombatLoading,
  lockedNumbers,
  keys,
  unlockNumber,
  rolls,
}) {
  var rolledSet = new Set(rolls || []);
  return Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
    var numTimesRolled = numbers[n] || 0;
    var level = numTimesRolled > 0 ? getLevel(numTimesRolled) : 0;
    return (
      <div key={"num-wrapper-" + n} className="combat-menu-number-wrapper">
        <Number
          n={n}
          data={numbers[n]}
          isHighlighted={highlightedNumber === n || (highlightedNumbers || []).includes(n)}
          isRolled={rolledNumber === n}
          isBadged={inCombatMenu && !isCombatLoading && (badgedNumbers || []).includes(n)}
          rarityHighlightUnlocked={rarityHighlightUnlocked}
          selectingIndex={selectingIndex}
          selectNumber={selectNumber}
          combatState={combatState}
          showCombat={showCombat}
          onDragStateChange={onDragStateChange}
          inCombatMenu={inCombatMenu}
          isCombatLoading={isCombatLoading}
          isLocked={(lockedNumbers || []).includes(n)}
          hasBeenRolled={rolledSet.has(n)}
          keys={keys}
          unlockNumber={unlockNumber}
        />
        {numTimesRolled > 0 && level > 0 && !(lockedNumbers || []).includes(n) && <StarLevel level={level} />}
      </div>
    );
  });
}
