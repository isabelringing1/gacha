import CharmShopEntry from "./CharmShopEntry";
import { getCharmById } from "./Util";

export default function CharmShopMobile(props) {
  const { diamonds, charmShopEntries, buyCharm } = props;

  return (
    <div className="charm-shop-container">
      <div className="charm-shop">
        <div className="shop-title">CHARM SHOP</div>
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
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
