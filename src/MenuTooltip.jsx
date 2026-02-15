import { useState } from "react";
import Markdown from "react-markdown";
import { isMobile } from "./constants.js";
import { getPackRarity } from "./Util";
import tail from "/tail.png";
import packData from "./json/packs.json";

export default function MenuTooltip(props) {
  var { cardPack, mousePos, lastPackOpened } = props;
  var cn = "menu-tooltip dither-bg";

  return (
    <div
      className={cn}
      id="menu-tooltip"
      style={{
        left: mousePos[0] + "px",
        top: mousePos[1] - (isMobile ? 180 : 0) + "px",
      }}
    >
      <img
        className={"tooltip-tail " + (isMobile ? "menus-tail-bottom" : "")}
        src={tail}
      />
      <div id="menu-tooltip-inner">
        {cardPack && (
          <div className="menu-tooltip-content">
            <div className="menu-tooltip-title">{cardPack.name}</div>
            {cardPack.id == "copycat" ? (
              <div className="menu-tooltip-text">
                x{packData.packs[lastPackOpened].amount}
              </div>
            ) : (
              <div className="menu-tooltip-text">x{cardPack.amount}</div>
            )}
            {cardPack.desc && (
              <div className="menu-tooltip-text">
                <Markdown>
                  {cardPack.desc.replace(
                    "%s",
                    packData.packs[lastPackOpened].name,
                  )}
                </Markdown>
              </div>
            )}
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
