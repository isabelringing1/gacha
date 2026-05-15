import { useState, useEffect, useRef } from "react";

import PackShop from "./PackShop";
import CharmShop from "./CharmShop.jsx";
import Achievements, { hasClaimableAchievement } from "./Achievements.jsx";
import CombatShop from "./CombatShop.jsx";
import Event from "./Event.jsx";
import Sportsbook from "./Sportsbook.jsx";
import Timer from "./Timer";
import History from "./History";

import { isMobile } from "./constants.js";
import { getCharmById } from "./Util";

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
    isMobileTabShowing,
    setIsMobileTabShowing,
    currentEvent,
    setCurrentEvent,
    rollForEvent,
    rollTenForEvent,
    isCombatActive,
    combatState,
    buyCombatShopItem,
    battleShopState,
    canUnlockBattleShop,
    unlockBattleShop,
    maxHearts,
    heartsUnlocked,
    ticketBoughtSeen,
    combatUnlocked,
    setShowCombat,
    combatButtonSeen,
    setCombatButtonSeen,
    lastBattledLevel,
    setLastBattledLevel,
    now,
    showingRoll,
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

  // Snap the selected tab to a valid one for the current mode.
  useEffect(() => {
    if (showCombat) {
      if (mobileTab !== "battleShop") {
        setMobileTab("battleShop");
        setIsMobileTabShowing(false);
      }
    } else {
      if (mobileTab === "battleShop") {
        setMobileTab("achievements");
        setIsMobileTabShowing(false);
      }
    }
  }, [showCombat]);

  // If the events tab is active but the event ends, fall back to achievements.
  useEffect(() => {
    if (mobileTab === "events" && !currentEvent) {
      setMobileTab("achievements");
      setIsMobileTabShowing(false);
    }
  }, [mobileTab, currentEvent, setMobileTab, setIsMobileTabShowing]);

  // Close the panel when actual combat begins.
  useEffect(() => {
    if (isCombatActive && isMobileTabShowing) {
      setIsMobileTabShowing(false);
    }
  }, [isCombatActive, isMobileTabShowing, setIsMobileTabShowing]);

  // Play the bounce-down animation briefly when the panel transitions from
  // open to closed.
  const [panelClosing, setPanelClosing] = useState(false);
  const prevShowing = useRef(isMobileTabShowing);
  useEffect(() => {
    if (prevShowing.current && !isMobileTabShowing) {
      setPanelClosing(true);
      var closeTimer = setTimeout(() => setPanelClosing(false), 300);
      prevShowing.current = isMobileTabShowing;
      return () => clearTimeout(closeTimer);
    }
    if (isMobileTabShowing) setPanelClosing(false);
    prevShowing.current = isMobileTabShowing;
  }, [isMobileTabShowing]);

  // Close the panel when the user taps outside it — but leave the number grid
  // and tab strip interactive so tooltips still work while the menu is open.
  // Also skip closing while a big-number splash is up, so the player can tap
  // through it (e.g. after rolling from the events tab) without dismissing.
  useEffect(() => {
    if (!isMobileTabShowing) return;
    function onDocPointerDown(e) {
      if (bigNumberQueue && bigNumberQueue.length > 0) return;
      var t = e.target;
      if (!t || !t.closest) return;
      if (
        t.closest(".mobile-menu-panel") ||
        t.closest(".mobile-tab-strip") ||
        t.closest("#numbers-grid") ||
        t.closest(".big-number-container") ||
        t.closest(".splash-front")
      ) {
        return;
      }
      setIsMobileTabShowing(false);
    }
    var timeout = setTimeout(() => {
      document.addEventListener("pointerdown", onDocPointerDown);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("pointerdown", onDocPointerDown);
    };
  }, [isMobileTabShowing, setIsMobileTabShowing, bigNumberQueue]);

  function getTabPulse(tabId) {
    if (tabId === "achievements") {
      return (
        achievementsState == "unlocked" &&
        hasClaimableAchievement(numbers, numPacksOpened, claimedAchievements)
      );
    }
    if (tabId === "packShop") return canUnlockPackShop && canUnlockPackShop();
    if (tabId === "charmShop") {
      if (canUnlockCharmShop && canUnlockCharmShop()) return true;
      if (isMobile && charmShopState === "unlocked" && charmShopEntries) {
        var maxCost = 0;
        for (var i = 0; i < charmShopEntries.length; i++) {
          var charm = getCharmById(charmShopEntries[i]);
          if (charm && typeof charm.cost === "number" && charm.cost > maxCost) {
            maxCost = charm.cost;
          }
        }
        if (maxCost > 0 && (clubs || 0) >= maxCost) return true;
      }
      return false;
    }
    if (tabId === "battleShop") {
      if (canUnlockBattleShop && canUnlockBattleShop()) return true;
      if (
        isMobile &&
        battleShopState === "unlocked" &&
        combatState &&
        (combatState.combatTickets || 0) <= 0
      ) {
        return true;
      }
      return false;
    }
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
            rollTenForEvent={rollTenForEvent}
            isRollTenButtonDisabled={isRollTenButtonDisabled}
            tenPullUnlocked={tenPullUnlocked}
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
          <div
            className={
              "mobile-menu-panel" +
              (isMobileTabShowing ? " open" : "") +
              (panelClosing ? " closing" : "")
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div
            className={
              "mobile-tab-strip" +
              (isMobileTabShowing ? " mobile-tab-strip-open" : "") +
              (panelClosing ? " mobile-tab-strip-closing" : "") +
              (!currentEvent ? " mobile-tab-strip-centered" : "")
            }
            onClick={(e) => e.stopPropagation()}
          >
            {mobileTabs.map((tab) => {
              var isSelected = mobileTab === tab.id;
              var isActive = isMobileTabShowing && isSelected;
              var pulse = !isActive && getTabPulse(tab.id);
              var iconSrc = {
                achievements: "./achievements.png",
                charmShop: "./charms.png",
                packShop: "./pack_shop.png",
                events: "./events.png",
                battleShop: "./ticket.png",
              }[tab.id];
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
                    if (isSelected) {
                      setIsMobileTabShowing(!isMobileTabShowing);
                    } else {
                      setMobileTab(tab.id);
                      setIsMobileTabShowing(true);
                    }
                  }}
                >
                  {iconSrc && (
                    <img className="mobile-tab-icon" src={iconSrc} alt="" />
                  )}
                </button>
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
