import { useState } from "react";
import CardPack from "./CardPack";
import PackShopEntry from "./PackShopEntry";
import Timer from "./Timer";
import { UNLOCK_ENTRY_COST, REFRESH_ENTRY_BASE_COST } from "./constants.js";

import packData from "./json/packs.json";
import { data } from "motion/react-client";
import { getPackCost } from "./Util";

export default function PackShopMobile(props) {
  const {
    packShopEntriesUnlocked,
    openPack,
    bigNumberQueue,
    cardShopEntries,
    diamonds,
    unlockShopEntry,
    generatePackShopEntry,
    setHighlightedNumbers,
    currentPack,
    buyPack,
    trashPack,
    hidePack,
  } = props;

  const canUnlockShopEntry = () => {
    return diamonds >= UNLOCK_ENTRY_COST;
  };

  const canBuyRefreshEntry = (entry) => {
    return diamonds > getRefreshEntryCost(entry);
  };

  const getRefreshEntryCost = (entry) => {
    return REFRESH_ENTRY_BASE_COST; // todo - implement scaling logic
  };

  return (
    <div className="pack-shop-container">
      {currentPack && (
        <CardPack
          pack={currentPack}
          openPack={openPack}
          hidePack={hidePack}
          bigNumberQueue={bigNumberQueue}
        />
      )}

      <div className="pack-shop-mobile">
        <div className="shop-title">PACK SHOP</div>
        <div className="pack-shop-packs">
          {cardShopEntries.map((shopEntry, i) => {
            return packShopEntriesUnlocked[i] && shopEntry ? (
              shopEntry.nextRefreshTime ? (
                <div
                  key={"pack-shop-pack-" + i}
                  className="locked-entry pack-shop-entry blank"
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
                          generatePackShopEntry(1, [i]);
                        }
                        setDiamonds(diamonds - getRefreshEntryCost());
                        setViewDiamonds(diamonds - getRefreshEntryCost());
                      }}
                      className="pack-shop-entry-unlock-button"
                      disabled={!canBuyRefreshEntry(shopEntry)}
                    >
                      ♦ {getRefreshEntryCost()}
                    </button>
                  </div>
                </div>
              ) : (
                <PackShopEntry
                  buyPack={buyPack}
                  shopEntry={shopEntry}
                  pack={packData.packs[shopEntry.id]}
                  key={"pack-shop-pack-" + i}
                  diamonds={diamonds}
                  trashPack={trashPack}
                  setHighlightedNumbers={setHighlightedNumbers}
                />
              )
            ) : (
              <div
                className="locked-entry pack-shop-entry"
                key={"pack-shop-pack-" + i}
              >
                <div className="pack-shop-entry-locked">LOCKED</div>
                <div className="pack-shop-entry-unlock-button-container">
                  <button
                    onClick={() => unlockShopEntry(i)}
                    className="pack-shop-entry-unlock-button"
                    disabled={!canUnlockShopEntry(i)}
                  >
                    ♦ {UNLOCK_ENTRY_COST}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
