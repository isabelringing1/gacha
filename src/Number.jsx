import { useState } from "react";
import NumberTooltip from "./NumberTooltip";
import { getRarityData, getLevel, getMaxLevel } from "./Util";

import { isMobile } from "./constants.js";

function Number(props) {
  const {
    n,
    data,
    isHighlighted,
    isBadged,
    isRolled,
    rarityHighlightUnlocked,
    selectingIndex,
    selectNumber,
    combatState,
    showCombat,
    onDragStateChange,
    isFactor,
    inCombatMenu,
  } = props;
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);

  var opacity = 0.1;
  var numTimesRolled = 0;
  var rarityData = getRarityData(n);
  var total = 55; // rn this maxes out the levels. subject to change
  var isDead =
    combatState &&
    combatState.numberStates &&
    combatState.numberStates[n] &&
    combatState.numberStates[n].health <= 0;

  if (data) {
    numTimesRolled = data;
    var level = getLevel(numTimesRolled);
    if (inCombatMenu) {
      opacity = level / getMaxLevel()
    }
    else{
      opacity = 0.9;
    }
  }
  var containerClass = "number-container";
  var numberClass = "number";
  if (rarityHighlightUnlocked) {
    containerClass += " number-container-" + rarityData.id;
    numberClass += " number-" + rarityData.id;
  } else {
    containerClass += " number-container-common";
    numberClass += " number-common";
  }

  if (numTimesRolled == 0) {
    containerClass += " unrolled";
    numberClass += " unrolled";
  }

  if (isHighlighted) {
    containerClass += " highlighted";
    numberClass += " highlighted";
  }
  if (isRolled) {
    containerClass += " rolled";
    numberClass += " rolled";
  }
  if (isBadged && numTimesRolled > 0) {
    containerClass += " factor";
    numberClass += " factor";
  }

  /*if (numTimesRolled >= n) {
    containerClass += " completed";
  }*/

  function scale(number, inMin, inMax, outMin, outMax) {
    var scaled =
      ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    scaled = Math.min(outMax, scaled);
    scaled = Math.max(outMin, scaled);
    return scaled;
  }

  if (selectingIndex != -1 && numTimesRolled > 0) {
    numberClass += " pulse-continuous";
  }

  if (isDead && numTimesRolled > 0) {
    numberClass += " num-dead";
  }

  return (
    <div
      className={containerClass}
      id={"number-container-" + n}
      style={{
        scale: hover ? 1.1 : 1,
        zIndex: hover ? 2 : 1,
      }}
    >
      {hover && numTimesRolled > 0 && (
        <NumberTooltip
          n={n}
          numTimesRolled={numTimesRolled}
          isCombat={showCombat}
        />
      )}
      {isDead && showCombat && <div className="num-dead-x">×</div>}
      <div
        className={numberClass}
        id={"number-" + n}
        draggable={inCombatMenu && numTimesRolled > 0}
        style={{
          scale: hover ? 1.1 : 1,
          opacity: hover && selectingIndex != -1 && numTimesRolled > 0
              ? 1
              : opacity,
          cursor: inCombatMenu && numTimesRolled > 0 ? "grab" : undefined,
        }}
        onDragStart={(e) => {
          if (inCombatMenu && numTimesRolled > 0) {
            e.dataTransfer.setData("text/plain", String(n));
            e.dataTransfer.effectAllowed = "move";
            if (onDragStateChange) onDragStateChange(n);
          }
        }}
        onDragEnd={() => {
          if (onDragStateChange) onDragStateChange(false);
        }}
        onMouseOver={() => {
          if (isMobile) {
            return;
          }
          setHover(true);
        }}
        onMouseOut={() => {
          if (isMobile) {
            return;
          }
          setHover(false);
        }}
        onClick={() => {
          if (selectingIndex != -1 && numTimesRolled > 0) {
            selectNumber(n, selectingIndex);
          }
        }}
        onTouchStart={() => {
          setHover(true);
        }}
        onTouchEnd={() => {
          setHover(false);
        }}
      >
        {numTimesRolled == 0 ? "?" : n}
      </div>
    </div>
  );
}

export default Number;
