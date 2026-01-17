import { useState, useEffect } from "react";

import PackShop from "./PackShop";
import PackShopMobile from "./PackShopMobile";
import CharmShop from "./CharmShop";
import CharmShopMobile from "./CharmShopMobile.jsx";
import Bet from "./Bet";
import Timer from "./Timer";

import { REFRESH_TIME, NUM_TABS, isMobile } from "./constants.js";
import { rollMultiple, getNextCharm } from "./Util";

export default function MenusContainer(props) {
  var {
    numbers,
    setNumbers,
    rolls,
    setRolls,
    nextHeartRefreshTime,
    setNextHeartRefreshTime,
    diamonds,
    setDiamonds,
    setViewDiamonds,
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
    setTimeMultiplier,
    refreshHearts,
    trySwipe,
  } = props;

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (diamonds > 100 && packShopState == "hidden") {
      setPackShopState("unlocked");
      generatePackShopEntry(2);
    }
    if (diamonds > 0 && charmShopState == "hidden") {
      setCharmShopState("unlocked");
      generateCharmShopEntry([0, 1], purchasedCharms);
    }
  }, [diamonds]);

  const openPack = (pack) => {
    var newNumbers = { ...numbers };
    var newRolls = [...rolls];
    var rolledNumbers = rollMultiple(
      pack.amount,
      pack.multiple,
      pack.min,
      pack.max,
      pack.modulo,
      pack.remainder,
      pack.pool
    );
    var newDiamonds = 0;

    if (!nextHeartRefreshTime) {
      setNextHeartRefreshTime(Date.now() + REFRESH_TIME);
    }

    for (var i = 0; i < pack.amount; i++) {
      var n = rolledNumbers[i];
      newNumbers[n] = newNumbers[n] ? newNumbers[n] + 1 : 1;
      newRolls.push(n);
      newDiamonds += n;
    }
    setNumbers(newNumbers);
    setRolls(newRolls);
    setDiamonds(diamonds + newDiamonds);
    setTimeout(() => {
      setBigNumberQueue([...bigNumberQueue, ...rolledNumbers]);
    }, 1000);

    return newRolls;
  };

  const buyCharm = (shopEntry, index = 0) => {
    setDiamonds(diamonds - shopEntry.cost);
    setViewDiamonds(diamonds - shopEntry.cost);
    var newPurchasedCharms = [...purchasedCharms, shopEntry.id];
    if (shopEntry.category == "speed-up") {
      setTimeMultiplier(shopEntry.new_time_multiplier);
    } else if (shopEntry.category == "heart-upgrade") {
      setMaxHearts(maxHearts + shopEntry.heart_upgrade);
      setHearts(hearts + shopEntry.heart_upgrade);
    }
    generateCharmShopEntry([index], newPurchasedCharms);
    setPurchasedCharms(newPurchasedCharms);
  };

  const unlockShopEntry = (i) => {
    var newPackShopEntriesUnlocked = [...packShopEntriesUnlocked];
    newPackShopEntriesUnlocked[i] = true;
    setPackShopEntriesUnlocked(newPackShopEntriesUnlocked);
    generatePackShopEntry();
  };

  const generateCharmShopEntry = (indices = [0], newPurchasedCharms) => {
    console.log("generating ", indices);
    var newCharmShopEntries = [...charmShopEntries];
    for (var i = 0; i < indices.length; i++) {
      var index = indices[i];
      var nextCharm = getNextCharm(index, newPurchasedCharms);
      if (nextCharm) {
        newCharmShopEntries[index] = nextCharm.id;
      }
    }
    setCharmShopEntries(newCharmShopEntries);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
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
      <div className="dots-container">
        {Array.from({ length: NUM_TABS }, (_, i) => (
          <span
            key={"dot-" + i}
            className={"dot" + (mobileMenuIndex == i ? " dot-filled" : "")}
          ></span>
        ))}
      </div>
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

        {packShopState != "hidden" && !isMobile && (
          <PackShop
            packShopState={packShopState}
            packShopEntriesUnlocked={packShopEntriesUnlocked}
            setPackShopEntriesUnlocked={setPackShopEntriesUnlocked}
            openPack={openPack}
            bigNumberQueue={bigNumberQueue}
            cardShopEntries={cardShopEntries}
            setShopEntries={setCardShopEntries}
            setDiamonds={setDiamonds}
            setViewDiamonds={setViewDiamonds}
            diamonds={diamonds}
            unlockShopEntry={unlockShopEntry}
            generatePackShopEntry={generatePackShopEntry}
            setHighlightedNumbers={setHighlightedNumbers}
          />
        )}
        {charmShopState != "hidden" && !isMobile && (
          <CharmShop
            diamonds={diamonds}
            charmShopEntries={charmShopEntries}
            buyCharm={buyCharm}
          />
        )}

        {/* MOBILE */}
        {packShopState != "hidden" && isMobile && (
          <PackShopMobile
            packShopState={packShopState}
            packShopEntriesUnlocked={packShopEntriesUnlocked}
            setPackShopEntriesUnlocked={setPackShopEntriesUnlocked}
            openPack={openPack}
            bigNumberQueue={bigNumberQueue}
            cardShopEntries={cardShopEntries}
            setShopEntries={setCardShopEntries}
            setDiamonds={setDiamonds}
            setViewDiamonds={setViewDiamonds}
            diamonds={diamonds}
            unlockShopEntry={unlockShopEntry}
            generatePackShopEntry={generatePackShopEntry}
            setHighlightedNumbers={setHighlightedNumbers}
          />
        )}
        {charmShopState != "hidden" && isMobile && (
          <CharmShopMobile
            diamonds={diamonds}
            charmShopEntries={charmShopEntries}
            buyCharm={buyCharm}
          />
        )}

        {sportsbookState != "hidden" && (
          <div id="bets-container">
            <div id="bets-header">Bets</div>
            <div id="bets-grid">
              <Bet />
              <Bet />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
