import { useState } from "react";
import PackShopEntry from "./PackShopEntry";
import Timer from "./Timer";
import { UNLOCK_ENTRY_COST, UNLOCK_PACK_SHOP_COST } from "./constants.js";

import packData from "./json/packs.json";

export default function PackShop(props) {
  const {
    packShopState,
    unlockPackShop,
    canUnlockPackShop,
    packShopEntriesUnlocked,
    openPack,
    bigNumberQueue,
    cardShopEntries,
    spades,
    unlockShopEntry,
    generatePackShopEntry,
    setHighlightedNumbers,
    currentPack,
    buyPack,
    trashPack,
    hidePack,
    getRefreshEntryCost,
    refreshPackShopEntry,
    setHoveredPack,
    lastPackOpened,
  } = props;

  const canUnlockShopEntry = () => {
    return spades >= UNLOCK_ENTRY_COST;
  };

  const canBuyRefreshEntry = (entry) => {
    return spades > getRefreshEntryCost(entry);
  };

  return (
    <div className="pack-shop-container">
      <div className="pack-shop dither-bg">
        <div className="title">PACK SHOP</div>
        {packShopState == "locked" && (
          <div className="pack-shop-locked">
            <div className="title">UNLOCK</div>
            <button disabled={!canUnlockPackShop()} onClick={unlockPackShop}>
              &#x2660;&#xfe0e; {UNLOCK_PACK_SHOP_COST}
            </button>
          </div>
        )}
        {packShopState == "unlocked" && (
          <div className="pack-shop-packs">
            {cardShopEntries.map((shopEntry, i) => {
              return packShopEntriesUnlocked[i] && shopEntry ? (
                shopEntry.nextRefreshTime ? (
                  <div
                    key={"pack-shop-pack-" + i}
                    className="empty-entry pack-shop-entry blank"
                  >
                    <div className="pack-shop-entry-locked">
                      New Pack in{" "}
                      <Timer
                        endTime={shopEntry.nextRefreshTime}
                        onTimerEnd={() => generatePackShopEntry(1, [i])}
                      />
                    </div>
                    <div className="pack-shop-entry-unlock-button-container">
                      Refresh Early
                      <br />
                      <button
                        onClick={() => {
                          if (canBuyRefreshEntry(shopEntry)) {
                            refreshPackShopEntry(i);
                          }
                        }}
                        className="pack-shop-entry-unlock-button"
                        disabled={!canBuyRefreshEntry(shopEntry)}
                      >
                        &#x2660;&#xfe0e; {getRefreshEntryCost()}
                      </button>
                    </div>
                  </div>
                ) : (
                  <PackShopEntry
                    buyPack={buyPack}
                    shopEntry={shopEntry}
                    pack={packData.packs[shopEntry.id]}
                    key={"pack-shop-pack-" + i}
                    spades={spades}
                    trashPack={trashPack}
                    setHighlightedNumbers={setHighlightedNumbers}
                    setHoveredPack={setHoveredPack}
                    lastPackOpened={lastPackOpened}
                  />
                )
              ) : (
                <div
                  className="locked-entry pack-shop-entry"
                  key={"pack-shop-pack-" + i}
                >
                  <div className="title">UNLOCK</div>
                  <div className="pack-shop-entry-unlock-button-container">
                    <button
                      onClick={() => unlockShopEntry(i)}
                      className="pack-shop-entry-unlock-button"
                      disabled={!canUnlockShopEntry(i)}
                    >
                      &#x2660;&#xfe0e; {UNLOCK_ENTRY_COST}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
