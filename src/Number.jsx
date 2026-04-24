import { useState } from "react";
import NumberTooltip from "./NumberTooltip";
import { getRarityData, getLevel, getMaxLevel } from "./Util";
import lock from "/lock.png";

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
    inCombatMenu,
    isLocked,
    hasBeenRolled,
    keys,
    unlockNumber,
  } = props;
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);

  var opacity = 0.1;
  var numTimesRolled = 0;
  var rarityData = getRarityData(n);
  var isDead =
    combatState &&
    combatState.numberStates &&
    combatState.numberStates[n] &&
    combatState.numberStates[n].health <= 0;

  if (data) {
    numTimesRolled = data;
    var level = getLevel(numTimesRolled);
    opacity = 0.9;
    /*if (inCombatMenu) {
      opacity = map(level / getMaxLevel(), 0, 1, 0.2, 1);
    }
    else{
      opacity = 0.9;
    }*/
  }
  function map(number, inMin, inMax, outMin, outMax) {
    return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
  var containerClass = "number-container";
  var numberClass = "number";
  
  if (rarityHighlightUnlocked) {
    containerClass += " number-container-" + rarityData.id;
  } else {
    containerClass += " number-container-common";
  }

  if (numTimesRolled == 0) {
    containerClass += " unrolled";
    numberClass += " unrolled";
  }
  else{
    numberClass += " number-" + rarityData.id;
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

  var realOpacity = hover && selectingIndex != -1 && numTimesRolled > 0
  ? 1 : opacity;
  
  return (
    <div
      className={containerClass}
      id={"number-container-" + n}
      style={{
        scale: hover ? 1.1 : 1,
        zIndex: hover ? 2 : 1,
      }}
    >
      {hover && (numTimesRolled > 0 || (isLocked && hasBeenRolled)) && (
        <NumberTooltip
          n={n}
          numTimesRolled={numTimesRolled}
          isCombat={showCombat}
          isFactor={isBadged}
          isLocked={isLocked}
          canUnlock={isLocked && keys >= 1}
        />
      )}
      {isDead && showCombat && <div className="num-dead-x">×</div>}
      <div
        className={numberClass}
        id={"number-" + n}
        draggable={inCombatMenu && numTimesRolled > 0}
        style={{
          scale: hover ? 1.1 : 1,
          color: "rgba(0, 0, 0, " + realOpacity + ")",
          cursor: isLocked && keys >= 1 ? "pointer" : inCombatMenu && numTimesRolled > 0 ? "grab" : undefined,
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
          if (isLocked && keys >= 1 && unlockNumber) {
            unlockNumber(n);
            return;
          }
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
        {isLocked ? (!hasBeenRolled ? "?" : <img src={lock} alt="locked" className={"number-locked-icon" + (keys >= 1 ? " lock-pulse" : "")} style={keys >= 1 ? undefined : { opacity: 0.4 }} />) : (numTimesRolled == 0 ? "?" : n)}
      </div>
    </div>
  );
}

export default Number;
