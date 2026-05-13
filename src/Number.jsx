import { useState, useRef } from "react";
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
    isCombatLoading,
    isLocked,
    hasBeenRolled,
    keys,
    unlockNumber,
  } = props;
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const touchDragRef = useRef({ active: false });
  const ghostRef = useRef(null);

  function removeGhost() {
    if (ghostRef.current && ghostRef.current.parentNode) {
      ghostRef.current.parentNode.removeChild(ghostRef.current);
    }
    ghostRef.current = null;
  }

  function createGhost(sourceEl, x, y) {
    if (!sourceEl) return;
    var clone = sourceEl.cloneNode(true);
    clone.removeAttribute("id");
    var rect = sourceEl.getBoundingClientRect();
    clone.style.position = "fixed";
    clone.style.left = x - rect.width / 2 + "px";
    clone.style.top = y - rect.height / 2 + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "1000";
    clone.style.opacity = "0.85";
    clone.style.scale = "1.2";
    document.body.appendChild(clone);
    ghostRef.current = clone;
  }

  function moveGhost(x, y) {
    if (!ghostRef.current) return;
    var w = ghostRef.current.offsetWidth;
    var h = ghostRef.current.offsetHeight;
    ghostRef.current.style.left = x - w / 2 + "px";
    ghostRef.current.style.top = y - h / 2 + "px";
  }

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
  var isMaxLevel = numTimesRolled > 0 && getLevel(numTimesRolled) === getMaxLevel();
  var numberColor = isMaxLevel
    ? "rgba(253, 213, 0, " + realOpacity + ")"
    : "rgba(0, 0, 0, " + realOpacity + ")";
  
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
          isFactor={isBadged && !isCombatLoading}
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
          color: numberColor,
          cursor: isLocked && keys >= 1 ? "pointer" : inCombatMenu && numTimesRolled > 0 ? "grab" : undefined,
          touchAction: inCombatMenu && numTimesRolled > 0 ? "none" : undefined,
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
        onTouchStart={(e) => {
          setHover(true);
          if (inCombatMenu && numTimesRolled > 0) {
            var t = e.touches[0];
            touchDragRef.current = {
              active: false,
              started: true,
              startX: t ? t.clientX : 0,
              startY: t ? t.clientY : 0,
            };
          }
        }}
        onTouchMove={(e) => {
          if (!touchDragRef.current.started) return;
          var t = e.touches[0];
          if (!t) return;
          if (!touchDragRef.current.active) {
            var dx = t.clientX - touchDragRef.current.startX;
            var dy = t.clientY - touchDragRef.current.startY;
            if (dx * dx + dy * dy < 64) return; // 8px threshold
            touchDragRef.current.active = true;
            if (onDragStateChange) onDragStateChange(n);
            createGhost(e.currentTarget, t.clientX, t.clientY);
          } else {
            moveGhost(t.clientX, t.clientY);
          }
        }}
        onTouchEnd={(e) => {
          setHover(false);
          var dragInfo = touchDragRef.current;
          touchDragRef.current = { active: false, started: false };
          removeGhost();
          if (!dragInfo.active) return;
          var slotEl = null;
          var t = (e.changedTouches && e.changedTouches[0]) || null;
          if (t) {
            var el = document.elementFromPoint(t.clientX, t.clientY);
            slotEl = el && el.closest("[data-combat-slot-index]");
          }
          if (slotEl && !slotEl.classList.contains("duplicate-blocked")) {
            var slotIndex = parseInt(slotEl.getAttribute("data-combat-slot-index"), 10);
            if (slotIndex >= 0 && selectNumber) {
              selectNumber(n, slotIndex);
            }
          }
          if (onDragStateChange) onDragStateChange(false);
        }}
        onTouchCancel={() => {
          setHover(false);
          var wasActive = touchDragRef.current.active;
          touchDragRef.current = { active: false, started: false };
          removeGhost();
          if (wasActive && onDragStateChange) onDragStateChange(false);
        }}
      >
        {isLocked ? (!hasBeenRolled ? "?" : <img src={lock} alt="locked" className={"number-locked-icon" + (keys >= 1 ? " lock-pulse" : "")} style={keys >= 1 ? undefined : { opacity: 0.4 }} />) : (numTimesRolled == 0 ? "?" : n)}
      </div>
    </div>
  );
}

export default Number;
