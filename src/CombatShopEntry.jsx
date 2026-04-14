import { getCurrencyIcon } from "./Util";
import ticket from "/ticket.png";

export default function CombatShopEntry(props) {
  const { shopEntry, buyCombatShopItem, currency, index } = props;
  function canBuy() {
    return currency >= shopEntry.cost;
  }

  return (
    <div className={"combat-shop-entry entry-" + index}>
      <div className="combat-shop-info-container">
        <div className="combat-shop-entry-name combat-shop-entry-text">{shopEntry.name === "ticket_img" ? <><img src={ticket} alt="ticket" className="ticket-icon" />x1</> : <>{shopEntry.name.toUpperCase()} x1</>}</div>
        <div className="combat-shop-entry-buy-button-container">
          <button
            onClick={() => buyCombatShopItem(shopEntry, index)}
            className="combat-shop-entry-buy-button"
            disabled={!canBuy()}
          >
            {getCurrencyIcon(shopEntry.currency)} {shopEntry.cost}
          </button>
        </div>
      </div>
    </div>
  );
}
