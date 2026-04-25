import CombatShopEntry from "./CombatShopEntry";
import combatData from "./json/combat.json";
import { UNLOCK_BATTLE_SHOP_COST } from "./constants.js";

export default function CombatShop(props) {
  const { spades, buyCombatShopItem, battleShopState, canUnlockBattleShop, unlockBattleShop, clubs, hearts, maxHearts } = props;

  return (
    <div className="combat-shop-container">
      <div className="combat-shop dither-bg">
        <div className="title">BATTLE SHOP</div>
        {battleShopState === "locked" && (
          <div className="pack-shop-locked">
            <div className="title">UNLOCK</div>
            <button disabled={!canUnlockBattleShop()} onClick={unlockBattleShop}>
              &clubs;&#xfe0e; {UNLOCK_BATTLE_SHOP_COST}
            </button>
          </div>
        )}
        {battleShopState === "unlocked" && (
          <div className="combat-shop-entries">
            {combatData.shop.map((entry, i) => (
              <CombatShopEntry
                index={i}
                key={"combat-shop-entry-" + i}
                shopEntry={entry}
                buyCombatShopItem={buyCombatShopItem}
                currency={spades}
                hearts={hearts}
                maxHearts={maxHearts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
