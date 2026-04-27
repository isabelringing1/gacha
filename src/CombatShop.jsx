import CombatShopEntry from "./CombatShopEntry";
import combatData from "./json/combat.json";
import { UNLOCK_BATTLE_SHOP_COST } from "./constants.js";

export default function CombatShop(props) {
  const { spades, buyCombatShopItem, battleShopState, canUnlockBattleShop, unlockBattleShop, clubs, hearts, maxHearts, heartsUnlocked } = props;

  const visibleEntries = combatData.shop.filter(
    (entry) => heartsUnlocked || entry.reward !== "hearts"
  );

  return (
    <div className={"combat-shop-container" + (heartsUnlocked ? "" : " combat-shop-container-compact")}>
      <div className={"combat-shop dither-bg" + (heartsUnlocked ? "" : " combat-shop-compact")}>
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
            {visibleEntries.map((entry, i) => (
              <CombatShopEntry
                index={i}
                key={"combat-shop-entry-" + entry.reward}
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
