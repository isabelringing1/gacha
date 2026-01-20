import { useState, useEffect } from "react";

import PackShop from "./PackShop";
import PackShopMobile from "./PackShopMobile";
import CharmShop from "./CharmShop";
import CharmShopMobile from "./CharmShopMobile.jsx";
import Sportsbook from "./Sportsbook.jsx";
import Timer from "./Timer";

import { REFRESH_TIME, NUM_TABS, isMobile } from "./constants.js";
import { rollMultiple, getNextCharm } from "./Util";
import packData from "./json/packs.json";
import { getPackCost } from "./Util";
import { REFRESH_ENTRY_BASE_COST } from "./constants.js";

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
  } = props;

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [currentPack, setCurrentPack] = useState(null);

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

  const openPack = (pack) => {
    var rolledNumbers = rollMultiple(
      pack.amount,
      pack.multiple,
      pack.min,
      pack.max,
      pack.modulo,
      pack.remainder,
      pack.pool,
    );

    if (!nextHeartRefreshTime) {
      setNextHeartRefreshTime(Date.now() + REFRESH_TIME);
    }
    var newBigNumbers = [];
    for (var i = 0; i < rolledNumbers.length; i++) {
      newBigNumbers.push({
        n: rolledNumbers[i],
        fromPack: true,
      });
    }

    setTimeout(() => {
      setBigNumberQueue([...bigNumberQueue, ...newBigNumbers]);
    }, 1000);
  };

  const buyCharm = (shopEntry, index = 0) => {
    setDiamonds(diamonds - shopEntry.cost);
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

  const buyPack = (shopEntry) => {
    var pack = packData.packs[shopEntry.id];
    setDiamonds(diamonds - getPackCost(pack));
    setCurrentPack(packData.packs[shopEntry.id]);
    setHighlightedNumbers([]);
    var newShopEntries = [...cardShopEntries];

    for (var i = 0; i < cardShopEntries.length; i++) {
      if (
        cardShopEntries[i] &&
        cardShopEntries[i].id == shopEntry.id &&
        cardShopEntries[i].creation == shopEntry.creation
      ) {
        newShopEntries[i] = {
          nextRefreshTime: Date.now() + 60000,
        };
        break;
      }
    }

    setCardShopEntries(newShopEntries);

    setTimeout(() => {
      var container = document.getElementById("card-pack-container");
      container.classList.add("bounce-in");
    }, 100);

    setTimeout(() => {
      var container = document.getElementById("card-pack-container");
      container.classList.remove("bounce-in");
      container.style.transform = "translateY(0px)";
    }, 750);
  };

  const trashPack = (shopEntry) => {
    var newShopEntries = [...cardShopEntries];
    setHighlightedNumbers([]);
    for (var i = 0; i < cardShopEntries.length; i++) {
      if (
        cardShopEntries[i] &&
        cardShopEntries[i].id == shopEntry.id &&
        cardShopEntries[i].creation == shopEntry.creation
      ) {
        newShopEntries[i] = {
          nextRefreshTime: Date.now() + 60000,
        };
        break;
      }
    }
    setCardShopEntries(newShopEntries);
  };

  const refreshPackShopEntry = (index) => {
    console.log("here", index);
    generatePackShopEntry(1, [index]);
    setDiamonds(diamonds - getRefreshEntryCost());
  };

  const getRefreshEntryCost = (entry) => {
    return REFRESH_ENTRY_BASE_COST; // todo - implement scaling logic
  };

  const hidePack = () => {
    var container = document.getElementById("card-pack-container");
    container.classList.add("bounce-out");

    setTimeout(() => {
      container.classList.remove("bounce-out");
      container.style.transform = "translateY(100vh)";
      setCurrentPack(null);
    }, 750);
  };

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

        {packShopState != "hidden" && !isMobile && (
          <PackShop
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
