import CharmShopEntry from "./CharmShopEntry";
import { getCharmById } from "./Util";
import { UNLOCK_CHARM_SHOP_COST } from "./constants.js";

export default function CharmShop(props) {
  const {
    diamonds,
    charmShopEntries,
    buyCharm,
    charmShopState,
    canUnlockCharmShop,
    unlockCharmShop,
  } = props;

  return (
    <div className="charm-shop-container">
      <div className="charm-shop dither-bg">
        <div className="title">CHARM SHOP</div>

        {charmShopState == "locked" && (
          <div className="charm-shop-locked">
            <div className="title">UNLOCK</div>
            <button disabled={!canUnlockCharmShop()} onClick={unlockCharmShop}>
              &diams;&#xfe0e; {UNLOCK_CHARM_SHOP_COST}
            </button>
          </div>
        )}
        {charmShopState == "unlocked" && (
          <div className="charm-shop-entries">
            {charmShopEntries.map((id, i) => {
              var charm = getCharmById(id);
              return charm ? (
                <CharmShopEntry
                  index={i}
                  key={"charm-shop-entry-" + i}
                  shopEntry={charm}
                  buyCharm={buyCharm}
                  diamonds={diamonds}
                />
              ) : (
                <div className={"empty-charm-shop-entry entry-" + i}></div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
