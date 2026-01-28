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
    setHoveredPack,
  } = props;

  function canBuy() {
    return diamonds - getPackCost(pack) >= 0;
  }

  function onMouseOver(e) {
    if (isMobile) {
      return;
    }
    setHighlightedNumbers(getNumbersInPack(pack));
    setHoveredPack(pack);
  }

  function onMouseOut() {
    if (isMobile) {
      return;
    }
    setHighlightedNumbers([]);
    setHoveredPack(null);
  }

  function onTouchStart() {
    setHighlightedNumbers(getNumbersInPack(pack));
    setHoveredPack(pack);
  }

  function onTouchEnd() {
    setHighlightedNumbers([]);
    setHoveredPack(null);
  }

  function getCardPackImgWidth() {
    var container = document.getElementsByClassName("pack-shop-packs")[0];
    if (container) {
      if (isMobile) {
        return Math.floor(container.getBoundingClientRect().width * 0.2);
      } else {
        return Math.floor(container.getBoundingClientRect().width * 0.4);
      }
    }
    return 0;
  }

  function getCardPackImgHeight() {
    var container = document.getElementsByClassName("pack-shop-packs")[0];
    if (container) {
      return Math.floor(container.getBoundingClientRect().height * 0.4);
    }
    return 0;
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
      <div className="pack-shop-entry-img-container">
        <DitherShader
          src={miniCardPack}
          gridSize={2}
          ditherMode="bayer"
          colorMode={"custom"}
          threshold={0}
          customPalette={["#575757", "#cbcbcbff", "#ffffffff"]}
          className={"pack-shop-entry-img"}
          objectFit="fill"
          style={{
            width: getCardPackImgWidth() + "px",
            height: getCardPackImgHeight() + "px",
          }}
          children={[
            <div
              className="pack-shop-entry-buy-button-container"
              key="pack-shop-entry-buy-button-container"
            >
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
            </div>,
            <div
              key="trash-button"
              className="trash-button"
              onClick={() => trashPack(shopEntry)}
            >
              ✕
            </div>,
          ]}
        />
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
