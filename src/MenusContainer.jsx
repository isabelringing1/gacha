import { useState, useEffect } from "react";

import PackShopMobile from "./PackShopMobile";
import CharmShopMobile from "./CharmShopMobile.jsx";
import Sportsbook from "./Sportsbook.jsx";
import Timer from "./Timer";

import { NUM_TABS, isMobile } from "./constants.js";
import packData from "./json/packs.json";

export default function MenusContainer(props) {
  var {
    nextHeartRefreshTime,
    setNextHeartRefreshTime,
    diamonds,
    setDiamonds,
    hearts,
    setHearts,
    maxHearts,
    setMaxHearts,
    charmShopEntries,
    setCharmShopEntries,
    setHighlightedNumbers,
    cardShopEntries,
    setCardShopEntries,
    purchasedCharms,
    setPurchasedCharms,
    mobileMenuIndex,
    bigNumberQueue,
    setBigNumberQueue,
    packShopEntriesUnlocked,
    setPackShopEntriesUnlocked,
    generatePackShopEntry,
    charmShopState,
    setCharmShopState,
    packShopState,
    setPackShopState,
    showingRoll,
    animating,
    rollNumber,
    sportsbookState,
    setSportsbookState,
    setTimeMultiplier,
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
    generateCharmShopEntry,
  } = props;

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    if (diamonds > 0 && packShopState == "hidden") {
      setPackShopState("unlocked");
      generatePackShopEntry(2);
    }
    if (diamonds > 0 && charmShopState == "hidden") {
      setCharmShopState("unlocked");
      generateCharmShopEntry([0, 1], purchasedCharms);
    }
    if (diamonds > 0 && sportsbookState == "hidden") {
      setSportsbookState("unlocked");
      generateBet([0, 1]);
    }
  }, [diamonds]);

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
              disabled={
                showingRoll != -1 ||
                hearts <= 0 ||
                animating ||
                bigNumberQueue.length > 0
              }
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
          <PackShopMobile
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
          />
        )}
        {charmShopState != "hidden" && isMobile && (
          <CharmShopMobile
            diamonds={diamonds}
            charmShopEntries={charmShopEntries}
            buyCharm={buyCharm}
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
      </div>
    </div>
  );
}
