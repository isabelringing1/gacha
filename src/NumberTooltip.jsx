import { useState } from "react";
import { factors, getRarity } from "./Util";
import Markdown from "react-markdown";
import { isMobile } from "./constants.js";
import tail from "/tail.png";

export default function NumberTooltip(props) {
  const { n, numTimesRolled, isMobile } = props;
  var cn = "number-tooltip dither-bg";
  var cnTail = "tooltip-tail number-tail";
  if (n <= 20) {
    cn += " top";
    cnTail += " tail-top";
  }
  if (n % 10 == 1 && isMobile) {
    cn += " left";
  }
  if (n % 10 == 0 && isMobile) {
    cn += " right";
  }

  var factorsText = n + " is **prime**.";
  var f = factors(n);
  if (f.length > 2 || n == 1) {
    factorsText = n + " is divisible by ";
    for (var i = 0; i < f.length; i++) {
      factorsText += "**" + f[i] + "**";
      if (i < f.length - 2) {
        factorsText += ", ";
      }
      if (i == f.length - 2) {
        factorsText += " and ";
      }
    }
    factorsText += ".";
  }
  return (
    <div className={cn} id={"number-tooltip-" + n}>
      <div className="number-tooltip-inner">
        <img className={cnTail} src={tail} />
        <div
          className={"rarity-tooltip-text rarity-tooltip-text-" + getRarity(n)}
        >
          <Markdown>{getRarity(n).toUpperCase()}</Markdown>
        </div>
        <div>
          Rolled {numTimesRolled ?? "0"}/{n} times
        </div>
      </div>
    </div>
  );
}
