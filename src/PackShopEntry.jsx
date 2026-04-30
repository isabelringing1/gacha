import { useState } from "react";
import { DitherShader } from "./dither-shader";
import cardPackOld from "/card_pack_old.png";
import priceTag from "/price_tag.png";
import priceTagYellow from "/price_tag_yellow.png";
import Timer from "./Timer.jsx";
import trash from "/trash.png";
import trash_highlight from "/trash_hover.png";

import { getNumbersInPack, getPackCost } from "./Util";
import { isMobile } from "./constants.js";

export default function PackShopEntry(props) {
  const {
    buyPack,
    shopEntry,
    pack,
    spades,
    trashPack,
    setHighlightedNumbers,
    setHoveredPack,
    lastPackOpened,
    hoveredPack,
    numPacksOpened,
  } = props;

  const [trashHovered, setTrashHovered] = useState(false);

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
            width: getCardPackImgWidth() + "px",
            height: getCardPackImgHeight() + "px",
            opacity: canBuy() ? 1 : 0.5,
          }}
          children={[
            <div
              className="pack-shop-entry-buy-button-container"
              key="pack-shop-entry-buy-button-container"
            >
              <DitherShader
                src={priceTag}
                gridSize={2}
                ditherMode="bayer"
                colorMode={"original"}
                threshold={0}
                className={"price-tag"}
              />
              {numPacksOpened === 0 && canBuy() && (
                <DitherShader
                  src={priceTagYellow}
                  gridSize={2}
                  ditherMode="bayer"
                  colorMode={"original"}
                  threshold={0}
                  className={"price-tag price-tag-yellow-pulse"}
                />
              )}
              <button
               
                className="pack-shop-entry-buy-button"
                disabled={!canBuy()}
              >
                &#x2660;&#xfe0e; {getPackCost(pack)}
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
              onMouseOver={() => setTrashHovered(true)}
              onMouseOut={() => setTrashHovered(false)}
              onClick={() => {
                setHoveredPack(null);
                trashPack(shopEntry);
              }}
            >
              <DitherShader
                src={trashHovered ? trash_highlight : trash}
                gridSize={1}
                ditherMode="bayer"
                colorMode={"original"}
                threshold={0}
                className={"trash-button-img" + (trashHovered ? " trash-button-img-hover" : "")}
              />
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
