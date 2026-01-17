import { DitherShader } from "./dither-shader";
import cardPackOld from "/card_pack_old.png";
import miniCardPack from "/mini_card_pack.png";
import Timer from "./Timer.jsx";

import { getNumbersInPack, getPackCost } from "./Util";
import { isMobile } from "./constants.js";

export default function PackShopEntry(props) {
  const {
    buyPack,
    shopEntry,
    pack,
    diamonds,
    trashPack,
    setHighlightedNumbers,
  } = props;

  function canBuy() {
    return diamonds - getPackCost(pack) >= 0;
  }

  function onMouseOver(e) {
    if (isMobile) {
      return;
    }
    setHighlightedNumbers(getNumbersInPack(pack));
  }

  function onMouseOut() {
    if (isMobile) {
      return;
    }
    setHighlightedNumbers([]);
  }

  function onTouchStart() {
    setHighlightedNumbers(getNumbersInPack(pack));
  }

  function onTouchEnd() {
    setHighlightedNumbers([]);
  }

  return (
    <div
      className="pack-shop-entry"
      onMouseOver={onMouseOver}
      onTouchStart={onTouchStart}
      onMouseOut={onMouseOut}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div className="trash-button" onClick={() => trashPack(shopEntry)}>
        ✕
      </div>
      {!isMobile && <div className="pack-shop-entry-name">{pack.name}</div>}

      <div className="pack-shop-entry-img-container">
        <DitherShader
          src={miniCardPack}
          gridSize={2}
          ditherMode="bayer"
          colorMode={"custom"}
          threshold={0}
          customPalette={["#575757", "#cbcbcbff", "#ffffffff"]}
          className={"pack-shop-entry-img"}
          objectFit="contain"
        />
      </div>
      <div className="pack-shop-entry-buy-button-container">
        {isMobile && <div className="pack-shop-entry-name">{pack.name}</div>}
        <button
          onClick={() => buyPack(shopEntry)}
          className="pack-shop-entry-buy-button"
          disabled={!canBuy()}
        >
          ♦ {getPackCost(pack)}
        </button>
        {isMobile && (
          <div className="pack-shop-entry-expiry">
            Expires in{" "}
            <Timer
              endTime={shopEntry.expirationTime}
              onTimerEnd={() => trashPack(shopEntry)}
            />
          </div>
        )}
      </div>
      {!isMobile && (
        <div className="pack-shop-entry-expiry">
          Expires in{" "}
          <Timer
            endTime={shopEntry.expirationTime}
            onTimerEnd={() => trashPack(shopEntry)}
          />
        </div>
      )}
    </div>
  );
}
