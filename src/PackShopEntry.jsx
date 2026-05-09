import { memo } from "react";
import { DitherShader } from "./dither-shader";
import priceTag from "/price_tag.png";
import priceTagYellow from "/price_tag_yellow.png";
import Timer from "./Timer.jsx";
import trash from "/trash.png";

import { getNumbersInPack, getPackCost } from "./Util";
import { isMobile } from "./constants.js";

function PackShopEntry(props) {
  const {
    buyPack,
    shopEntry,
    pack,
    spades,
    trashPack,
    setHighlightedNumbers,
    setHoveredPack,
    lastPackOpened,
    numPacksOpened,
    imgWidth,
    imgHeight,
  } = props;

  function canBuy() {
    return spades - getPackCost(pack) >= 0;
  }

  function onMouseOver(e) {
    if (isMobile) {
      return;
    }
    setHighlightedNumbers(
      pack.id == "copycat"
        ? getNumbersInPack(lastPackOpened)
        : getNumbersInPack(pack.id),
    );
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
    setHighlightedNumbers(
      pack.id == "copycat"
        ? getNumbersInPack(lastPackOpened)
        : getNumbersInPack(pack.id),
    );
    setHoveredPack(pack);
  }

  function onTouchEnd() {
    setHighlightedNumbers([]);
    setHoveredPack(null);
  }

  function onBuyPressed(e) {
    if (!canBuy()) {
      return;
    }
    setHoveredPack(null);
    buyPack(e);
  }

  const rarityOutlineColors = ["#93939380", "#5882ff80", "#b31ff780", "#e7b50080"];
  const outlineColor = rarityOutlineColors[pack.rarity] ?? "#939393";
  
  return (
    <div
      className="pack-shop-entry"
      onMouseOver={onMouseOver}
      onTouchStart={onTouchStart}
      onMouseOut={onMouseOut}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div className="pack-shop-entry-img-container"  onClick={() => onBuyPressed(shopEntry)}>
        <DitherShader
          src={pack.art}
          gridSize={2}
          ditherMode="bayer"
          colorMode={pack.color_mode}
          threshold={0}
          customPalette={pack.custom_palette}
          className={"pack-shop-entry-img"}
          objectFit="fill"
          outlineColor={outlineColor}
          outlineWidth={2}
          style={{
            width: imgWidth + "px",
            height: imgHeight + "px",
            opacity: canBuy() ? 1 : 0.5,
          }}
          children={[
            <div
              className="pack-shop-entry-buy-button-container"
              key="pack-shop-entry-buy-button-container"
            >
              <img src={priceTag} className="price-tag" alt="" />
              {numPacksOpened === 0 && canBuy() && (
                <img
                  src={priceTagYellow}
                  className="price-tag price-tag-yellow-pulse"
                  alt=""
                />
              )}
              <button
                className="pack-shop-entry-buy-button"
                disabled={!canBuy()}
              >
                &#x2660;&#xfe0e;{getPackCost(pack) >= 1000 ? "" : " "}{getPackCost(pack)}
              </button>
              {isMobile && (
                <div className="pack-shop-entry-expiry">
                  Expires in{" "}
                  <Timer
                    endTime={shopEntry.expirationTime}
                    onTimerEnd={() => {
                      setHoveredPack(null);
                      trashPack(shopEntry);
                    }}
                  />
                </div>
              )}
            </div>,
            <div
              key="trash-button"
              className="trash-button"
              onClick={(e) => {
                e.stopPropagation();
                setHoveredPack(null);
                trashPack(shopEntry);
              }}
            >
              <img src={trash} className="trash-button-img" alt="trash" />
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

export default memo(PackShopEntry, (prev, next) => {
  return (
    prev.shopEntry === next.shopEntry &&
    prev.pack === next.pack &&
    prev.spades === next.spades &&
    prev.lastPackOpened === next.lastPackOpened &&
    prev.numPacksOpened === next.numPacksOpened &&
    prev.imgWidth === next.imgWidth &&
    prev.imgHeight === next.imgHeight
  );
});
