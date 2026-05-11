import { useState, useEffect } from "react";

import PackShop from "./PackShop";
import CharmShop from "./CharmShop.jsx";
import Achievements, { hasClaimableAchievement } from "./Achievements.jsx";
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
    diamondsUnlocked,
    refreshDiamonds,
    trySwipe,
    setShowOutOfDiamonds,
    outOfDiamondsSeen,
    setOutOfDiamondsSeen,
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
    rollTen,
    isRollTenButtonDisabled,
    tenPullUnlocked,
    lastPackOpened,
    showCombat,
    clubs,
    setClubs,
    spades,
    setSpades,
    numbers,
    numPacksOpened,
    claimedAchievements,
    claimAchievement,
    achievementsState,
    canUnlockAchievements,
    unlockAchievements,
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

  var visibleSlotCount = 1;
  if (achievementsState != "hidden") visibleSlotCount++;
  if (packShopState != "hidden") visibleSlotCount++;
  if (charmShopState != "hidden") visibleSlotCount++;

  return (
    <div
      id="menus-container"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ opacity: showCombat ? 0 : 1 }}
    >
      {isMobile && achievementsState != "hidden" && (
        <div className="dots-container">
          {Array.from({ length: visibleSlotCount }, (_, i) => {
            var isFilled = mobileMenuIndex == i;
            var pulseAchievement =
              i === 1 &&
              achievementsState == "unlocked" &&
              hasClaimableAchievement(numbers, numPacksOpened, claimedAchievements);
            var pulsePackShop = i === 2 && canUnlockPackShop && canUnlockPackShop();
            var pulseCharmShop = i === 3 && canUnlockCharmShop && canUnlockCharmShop();
            var shouldPulse = !isFilled && (pulseAchievement || pulsePackShop || pulseCharmShop);
            return (
              <span
                key={"dot-" + i}
                className={
                  "dot" +
                  (isFilled ? " dot-filled" : "") +
                  (shouldPulse ? " can-claim-yellow" : "")
                }
              ></span>
            );
          })}
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
              {diamondsUnlocked ? <>Roll (&diams;&#xfe0e;1)</> : "Roll"}
            </button>
            {tenPullUnlocked && (
              <button
                id="roll-ten-button"
                disabled={isRollTenButtonDisabled && isRollTenButtonDisabled()}
                onClick={rollTen}
              >
                Roll 10 (&diams;&#xfe0e;10)
              </button>
            )}
            {diamonds <= 0 && (
              <button
                id="out-of-hearts-button"
                className={!outOfDiamondsSeen ? "can-claim-yellow" : undefined}
                onClick={() => {
                  setShowOutOfDiamonds(true);
                  setOutOfDiamondsSeen(true);
                }}
              >
                Earn More &diams;&#xfe0e;
              </button>
            )}
          </span>
        </div>

        {/* MOBILE */}
        {achievementsState != "hidden" && isMobile && (
          <Achievements
            numbers={numbers}
            numPacksOpened={numPacksOpened}
            claimedAchievements={claimedAchievements}
            claimAchievement={claimAchievement}
            achievementsState={achievementsState}
            canUnlockAchievements={canUnlockAchievements}
            unlockAchievements={unlockAchievements}
            setHighlightedNumbers={setHighlightedNumbers}
          />
        )}
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
            spades={spades}
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
            numPacksOpened={numPacksOpened}
          />
        )}
        {charmShopState != "hidden" && isMobile && (
          <CharmShop
            clubs={clubs}
            charmShopEntries={charmShopEntries}
            buyCharm={buyCharm}
            charmShopState={charmShopState}
            canUnlockCharmShop={canUnlockCharmShop}
            unlockCharmShop={unlockCharmShop}
          />
        )}
      </div>
    </div>
  );
}
