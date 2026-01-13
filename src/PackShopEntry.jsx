import { DitherShader } from "./dither-shader";
import cardPackOld from "/assets/card_pack_old.png";
import miniCardPack from "/assets/mini_card_pack.png";

import { getNumbersInPack } from "./Util";
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
    return diamonds - pack.cost >= 0;
  }

  function onMouseOver(e) {
    console.log(e);
    setHighlightedNumbers(getNumbersInPack(pack));
  }

  function onMouseOut() {
    setHighlightedNumbers([]);
  }

  return (
    <div
      className="pack-shop-entry"
      onMouseOver={onMouseOver}
      onTouchStart={onMouseOver}
      onMouseOut={onMouseOut}
      onTouchEnd={onMouseOut}
      onTouchCancel={onMouseOut}
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
          ♦ {pack.cost}
        </button>
      </div>
    </div>
  );
}
