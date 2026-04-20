import { useState, useRef } from "react";
import { getCurrencyIcon } from "./Util";
import ticket from "/ticket.png";

export default function CombatShopEntry(props) {
  const { shopEntry, buyCombatShopItem, currency, index } = props;
  const [count, setCount] = useState(1);
  const holdTimerRef = useRef(null);
  const didHoldRef = useRef(false);

  const totalCost = shopEntry.cost * count;

  function canBuy() {
    return currency >= totalCost;
  }

  // Max amount we can increment by (capped at 5 by affordability)
  function maxIncrement() {
    for (let i = 5; i >= 1; i--) {
      if (currency >= shopEntry.cost * (count + i)) return i;
    }
    return 0;
  }

  // Max amount we can decrement by (capped at 5 by min count of 1)
  function maxDecrement() {
    return Math.min(5, count - 1);
  }

  function changeCount(delta) {
    setCount((prev) => Math.max(1, prev + delta));
  }

  function maxAffordable() {
    return Math.floor(currency / shopEntry.cost);
  }

  function startHold(onHeld) {
    didHoldRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      didHoldRef.current = true;
      onHeld();
    }, 700);
  }

  function cancelHold() {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }

  function makeHoldProps(onHeld, onClick) {
    return {
      onMouseDown: () => startHold(onHeld),
      onMouseUp: cancelHold,
      onMouseLeave: cancelHold,
      onTouchStart: () => startHold(onHeld),
      onTouchEnd: cancelHold,
      onClick: () => { if (!didHoldRef.current) onClick(); },
    };
  }

  const incMax = maxIncrement();
  const decMax = maxDecrement();

  return (
    <div className={"combat-shop-entry entry-" + index}>
      <div className="combat-shop-info-container">
        <div className="combat-shop-entry-name combat-shop-entry-text">
          {shopEntry.name === "ticket_img"
            ? <><img src={ticket} alt="ticket" className="ticket-icon" /> x{count}</>
            : <>{shopEntry.name.toUpperCase()} x{count}</>}
        </div>

        <div className="combat-shop-stepper">
          <button
            className="combat-shop-stepper-btn"
            disabled={incMax === 0}
            {...makeHoldProps(
              () => setCount(maxAffordable()),
              () => changeCount(incMax)
            )}
          >&#x25B2;&#x25B2;</button>
          <button
            className="combat-shop-stepper-btn"
            onClick={() => changeCount(1)}
            disabled={incMax === 0}
          >&#x25B2;</button>
          <button
            className="combat-shop-stepper-btn"
            onClick={() => changeCount(-1)}
            disabled={decMax === 0}
          >&#x25BC;</button>
          <button
            className="combat-shop-stepper-btn"
            disabled={decMax === 0}
            {...makeHoldProps(
              () => setCount(1),
              () => changeCount(-decMax)
            )}
          >&#x25BC;&#x25BC;</button>
        </div>

        <div className="combat-shop-entry-buy-button-container">
          <button
            onClick={() => {
              buyCombatShopItem(shopEntry, index, count);
              setCount(1);
            }}
            className="combat-shop-entry-buy-button"
            disabled={!canBuy()}
          >
            {getCurrencyIcon(shopEntry.currency)} {totalCost.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
