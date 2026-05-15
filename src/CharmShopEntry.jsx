import { DitherShader } from "./dither-shader";
import { playSfx } from "./sfx";

export default function (props) {
  const { shopEntry, buyCharm, clubs, index } = props;
  function canBuy() {
    return clubs >= shopEntry.cost;
  }

  return (
    <div className={"charm-shop-entry entry-" + index}>
      <div className="charm-shop-info-container">
        <div className="charm-shop-entry-name charm-shop-entry-text">{shopEntry.name.toUpperCase()}</div>
        <div className="charm-shop-entry-desc charm-shop-entry-text">{shopEntry.desc}</div>
        <div className="charm-shop-entry-buy-button-container">
          <button
            onClick={() => {
              playSfx("./buy.mp3");
              buyCharm(shopEntry, index);
            }}
            className="charm-shop-entry-buy-button"
            disabled={!canBuy()}
          >
            &#x2663;&#xfe0e; {shopEntry.cost}
          </button>
        </div>
        <div className="charm-shop-entry-img-container">
              <DitherShader
                src={shopEntry.art}
                gridSize={2}
                ditherMode="bayer"
                colorMode={"original"}
                threshold={0}
                className={"charm-shop-entry-img"}
              /></div>
              <img src={shopEntry.art} className="charm-shop-entry-img-shadow" />
      </div>
    </div>
  );
}
