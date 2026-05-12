import { useState, useEffect } from "react";

import PackShop from "./PackShop";
import CharmShop from "./CharmShop.jsx";
import Achievements, { hasClaimableAchievement } from "./Achievements.jsx";
import CombatShop from "./CombatShop.jsx";
import Event from "./Event.jsx";
import Sportsbook from "./Sportsbook.jsx";
import Timer from "./Timer";
import History from "./History";

import { isMobile } from "./constants.js";

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
    bigNumberQueue,
    packShopEntriesUnlocked,
    setPackShopEntriesUnlocked,
    generatePackShopEntry,
    setPackShopState,
    rollNumber,
    diamondsUnlocked,
    refreshDiamonds,
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
    mobileTab,
    setMobileTab,
    currentEvent,
    setCurrentEvent,
    rollForEvent,
    isCombatActive,
    combatState,
    buyCombatShopItem,
    battleShopState,
    canUnlockBattleShop,
    unlockBattleShop,
    maxHearts,
    heartsUnlocked,
    ticketBoughtSeen,
  } = props;

  // Tabs visible on mobile.
  // In the combat screen (outside an active battle), only the battleShop tab shows.
  // Otherwise: achievements, packShop, charmShop, events (only if currentEvent).
  var mobileTabs = [];
  if (isMobile) {
    if (showCombat) {
      if (
        !isCombatActive &&
        combatState &&
        combatState.combatLevel > 1 &&
        battleShopState !== "hidden"
      ) {
        mobileTabs.push({ id: "battleShop", visible: true });
      }
    } else if (achievementsState != "hidden") {
      mobileTabs.push({ id: "achievements", visible: true });
      if (packShopState != "hidden") mobileTabs.push({ id: "packShop", visible: true });
      if (charmShopState != "hidden") mobileTabs.push({ id: "charmShop", visible: true });
      if (currentEvent) mobileTabs.push({ id: "events", visible: true });
    }
  }

  // If the events tab is active but the event ends, close it.
  useEffect(() => {
    if (mobileTab === "events" && !currentEvent) {
      setMobileTab(null);
    }
  }, [mobileTab, currentEvent, setMobileTab]);

  // Close any open tab when transitioning into/out of the combat screen,
  // or when actual combat begins.
  useEffect(() => {
    if (!mobileTab) return;
    if (showCombat && mobileTab !== "battleShop") {
      setMobileTab(null);
    } else if (!showCombat && mobileTab === "battleShop") {
      setMobileTab(null);
    } else if (mobileTab === "battleShop" && isCombatActive) {
      setMobileTab(null);
    }
  }, [showCombat, isCombatActive, mobileTab, setMobileTab]);

  function getTabPulse(tabId) {
    if (tabId === "achievements") {
      return (
        achievementsState == "unlocked" &&
        hasClaimableAchievement(numbers, numPacksOpened, claimedAchievements)
      );
    }
    if (tabId === "packShop") return canUnlockPackShop && canUnlockPackShop();
    if (tabId === "charmShop") return canUnlockCharmShop && canUnlockCharmShop();
    if (tabId === "battleShop") return canUnlockBattleShop && canUnlockBattleShop();
    if (tabId === "events") return !!currentEvent && !currentEvent.tabSeen;
    return false;
  }

  function renderMobileMenuContent() {
    if (mobileTab === "achievements") {
      return (
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
      );
    }
    if (mobileTab === "packShop") {
      return (
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
      );
    }
    if (mobileTab === "charmShop") {
      return (
        <CharmShop
          clubs={clubs}
          charmShopEntries={charmShopEntries}
          buyCharm={buyCharm}
          charmShopState={charmShopState}
          canUnlockCharmShop={canUnlockCharmShop}
          unlockCharmShop={unlockCharmShop}
        />
      );
    }
    if (mobileTab === "events" && currentEvent) {
      return (
        <div className="event-container">
          <Event
            event={currentEvent}
            setCurrentEvent={setCurrentEvent}
            isBanner={false}
            rollForEvent={rollForEvent}
            isRollButtonDisabled={isRollButtonDisabled}
          />
        </div>
      );
    }
    if (mobileTab === "battleShop") {
      return (
        <CombatShop
          spades={spades}
          buyCombatShopItem={buyCombatShopItem}
          battleShopState={battleShopState}
          canUnlockBattleShop={canUnlockBattleShop}
          unlockBattleShop={unlockBattleShop}
          clubs={clubs}
          hearts={hearts}
          maxHearts={maxHearts}
          heartsUnlocked={heartsUnlocked}
          combatTickets={(combatState && combatState.combatTickets) || 0}
          ticketBoughtSeen={ticketBoughtSeen}
        />
      );
    }
    return null;
  }

  return (
    <div id="menus-container">
      <div
        id="menus"
        style={{
          opacity: showCombat ? 0 : 1,
          pointerEvents: showCombat ? "none" : undefined,
          transition: "opacity 0.3s ease-in-out",
        }}
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
      </div>

      {isMobile && mobileTabs.length > 0 && (
        <>
          {mobileTab && (
            <div
              className="mobile-tab-overlay"
              onClick={() => setMobileTab(null)}
            />
          )}
          <div
            className={"mobile-menu-panel" + (mobileTab ? " open" : "")}
            onClick={(e) => e.stopPropagation()}
          >
            <div
            className={
              "mobile-tab-strip" + (mobileTab ? " mobile-tab-strip-open" : "")
            }
            onClick={(e) => e.stopPropagation()}
          >
            {mobileTabs.map((tab) => {
              var isActive = mobileTab === tab.id;
              var pulse = !isActive && getTabPulse(tab.id);
              return (
                <button
                  key={"mobile-tab-" + tab.id}
                  className={
                    "mobile-tab dither-bg" +
                    (isActive ? " mobile-tab-active" : "") +
                    (pulse ? " can-claim-yellow" : "")
                  }
                  onClick={() => {
                    if (tab.id === "events" && currentEvent && !currentEvent.tabSeen) {
                      setCurrentEvent({ ...currentEvent, tabSeen: true });
                    }
                    setMobileTab(isActive ? null : tab.id);
                  }}
                />
              );
            })}
          </div>
          
            {renderMobileMenuContent()}
          </div>
          
        </>
      )}
    </div>
  );
}
