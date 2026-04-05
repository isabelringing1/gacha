import CombatShopEntry from "./CombatShopEntry";
import combatData from "./json/combat.json";

export default function CombatShop(props) {
  const { spades, buyCombatShopItem } = props;

  return (
    <div className="combat-shop-container">
      <div className="combat-shop dither-bg">
        <div className="title">BATTLE SHOP</div>
        <div className="combat-shop-entries">
          {combatData.shop.map((entry, i) => (
            <CombatShopEntry
              index={i}
              key={"combat-shop-entry-" + i}
              shopEntry={entry}
              buyCombatShopItem={buyCombatShopItem}
              currency={spades}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
