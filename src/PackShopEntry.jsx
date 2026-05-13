import { memo, useState } from "react";
import priceTag from "/price_tag.png";
import priceTagYellow from "/price_tag_yellow.png";
import Timer from "./Timer.jsx";
import trash from "/trash.png";
import trash_hover from "/trash_hover.png";

import { getNumbersInPack, getPackCost } from "./Util";
import { isMobile } from "./constants.js";
import { DitherShader } from "./dither-shader.tsx";

const OUTLINE_WIDTH = 2;
function buildOutlineFilter(color) {
  if (!color) return undefined;
  var parts = [];
  for (var i = 0; i < 8; i++) {
    var angle = (i * Math.PI) / 4;
    var dx = Math.round(Math.cos(angle) * OUTLINE_WIDTH);
    var dy = Math.round(Math.sin(angle) * OUTLINE_WIDTH);
    parts.push("drop-shadow(" + dx + "px " + dy + "px 0 " + color + ")");
  }
  return parts.join(" ");
}

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

  function onBuyPressed(e) {
    if (!canBuy()) {
      return;
    }
    try {
      var a = new Audio("./buy.mp3");
      a.play().catch(() => {});
    } catch (err) {}
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
        <div
          className="pack-shop-entry-img"
          style={{
            width: imgWidth + "px",
            height: imgHeight + "px",
          }}
        >
          <img
            src={pack.dt_art}
            alt=""
            className="pack-shop-entry-img-img"
            style={{ filter: buildOutlineFilter(outlineColor), opacity: canBuy() ? 1 : 0.5 }}
          />
          <div className="pack-shop-entry-buy-button-container">
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
          </div>
          <div
            className="trash-button"
            onMouseOver={() => setTrashHovered(true)}
            onMouseOut={() => setTrashHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              setHoveredPack(null);
              trashPack(shopEntry);
            }}
          >
             <DitherShader
                src={trashHovered ? trash_hover : trash}
                gridSize={1}
                ditherMode="bayer"
                colorMode={"original"}
                threshold={0}
                className={"trash-button-img" + (trashHovered ? " trash-button-img-hover" : "")}
              />
          </div>
        </div>
      </div>

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
