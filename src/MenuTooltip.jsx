import { useState } from "react";
import Markdown from "react-markdown";
import { isMobile } from "./constants.js";
import { getPackRarity } from "./Util";
import tail from "/tail.png";

export default function MenuTooltip(props) {
  var { cardPack, mousePos } = props;
  var cn = "menu-tooltip dither-bg";

  return (
    <div
      className={cn}
      id="menu-tooltip"
      style={{ left: mousePos[0] + "px", top: mousePos[1] + "px" }}
    >
      <img className="tooltip-tail" src={tail} />
      <div id="menu-tooltip-inner">
        {cardPack && (
          <div>
            <div className="menu-tooltip-title">{cardPack.name}</div>
            <div className="menu-tooltip-text">x{cardPack.amount}</div>
            <div
              className={
                "menu-tooltip-text rarity-tooltip-text rarity-tooltip-text-" +
                getPackRarity(cardPack).toLowerCase()
              }
            >
              {getPackRarity(cardPack)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
