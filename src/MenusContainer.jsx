import { useState, useEffect } from "react";

import PackShop from "./PackShop";
import CharmShop from "./CharmShop.jsx";
import Sportsbook from "./Sportsbook.jsx";
import Timer from "./Timer";
import History from "./History";

import { NUM_TABS, isMobile } from "./constants.js";

export default function MenusContainer(props) {
  var {
    packShopState,
    canUnlockPackShop,
    unlockPackShop,
    charmShopState,
    canUnlockCharmShop,
    unlockCharmShop,
    sportsbookState,
    setSportsbookState,
    canUnlockSportsbook,
    unlockSportsbook,
    nextHeartRefreshTime,
    diamonds,
    setDiamonds,
    hearts,
    charmShopEntries,
    setHighlightedNumbers,
    cardShopEntries,
    mobileMenuIndex,
    bigNumberQueue,
    packShopEntriesUnlocked,
    setPackShopEntriesUnlocked,
    generatePackShopEntry,
    charmShopState,
    packShopState,
    setPackShopState,
    rollNumber,
    sportsbookState,
    setSportsbookState,
    refreshHearts,
    trySwipe,
    setShowOutOfHearts,
    generateBet,
    sportsbookEntries,
    setSportsbookEntries,
    rolls,
    currentPack,
    buyPack,
    trashPack,
    hidePack,
    openPack,
    getRefreshEntryCost,
    refreshPackShopEntry,
    unlockShopEntry,
    buyCharm,
    setHoveredPack,
    isRollButtonDisabled,
    lastPackOpened,
  } = props;

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    if (currentPack) {
      return;
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || currentPack) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      trySwipe(1);
    }
    if (isRightSwipe) {
      trySwipe(-1);
    }
  };

  return (
    <div
      id="menus-container"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {isMobile && (
        <div className="dots-container">
          {Array.from({ length: NUM_TABS }, (_, i) => (
            <span
              key={"dot-" + i}
              className={"dot" + (mobileMenuIndex == i ? " dot-filled" : "")}
            ></span>
          ))}
        </div>
      )}
      <div
        id="menus"
        style={{ transform: "translate(" + mobileMenuIndex * -100 + "vw, 0)" }}
      >
        <div id="roll-container">
          <span className="hearts-span">
            <button
              id="roll-button"
              disabled={isRollButtonDisabled()}
              onClick={rollNumber}
            >
              Roll (1&hearts;&#xfe0e;)
            </button>
            {hearts <= 0 && (
              <button
                id="out-of-hearts-button"
                onClick={() => setShowOutOfHearts(true)}
              >
                Get More &hearts;&#xfe0e;
              </button>
            )}
          </span>
          {isMobile && nextHeartRefreshTime && (
            <div className="next-heart-container">
              Next &hearts;&#xfe0e; in{" "}
              <Timer
                endTime={nextHeartRefreshTime}
                onTimerEnd={refreshHearts}
              />
            </div>
          )}
        </div>

        {/* MOBILE */}
        {packShopState != "hidden" && isMobile && (
          <PackShop
            packShopState={packShopState}
            canUnlockPackShop={canUnlockPackShop}
            unlockPackShop={unlockPackShop}
            packShopEntriesUnlocked={packShopEntriesUnlocked}
            setPackShopEntriesUnlocked={setPackShopEntriesUnlocked}
            openPack={openPack}
            bigNumberQueue={bigNumberQueue}
            cardShopEntries={cardShopEntries}
            diamonds={diamonds}
            unlockShopEntry={unlockShopEntry}
            generatePackShopEntry={generatePackShopEntry}
            setHighlightedNumbers={setHighlightedNumbers}
            currentPack={currentPack}
            buyPack={buyPack}
            trashPack={trashPack}
            hidePack={hidePack}
            getRefreshEntryCost={getRefreshEntryCost}
            refreshPackShopEntry={refreshPackShopEntry}
            setHoveredPack={setHoveredPack}
            lastPackOpened={lastPackOpened}
          />
        )}
        {charmShopState != "hidden" && isMobile && (
          <CharmShop
            diamonds={diamonds}
            charmShopEntries={charmShopEntries}
            buyCharm={buyCharm}
            charmShopState={charmShopState}
            canUnlockCharmShop={canUnlockCharmShop}
            unlockCharmShop={unlockCharmShop}
          />
        )}

        {sportsbookState != "hidden" && isMobile && (
          <Sportsbook
            diamonds={diamonds}
            sportsbookEntries={sportsbookEntries}
            setSportsbookEntries={setSportsbookEntries}
            setDiamonds={setDiamonds}
            rolls={rolls}
            generateBet={generateBet}
          />
        )}

        {isMobile && (
          <div className="history-container">
            <History rolls={rolls} />
          </div>
        )}
      </div>
    </div>
  );
}
