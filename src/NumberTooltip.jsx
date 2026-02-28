import { factors, getRarity } from "./Util";
import Markdown from "react-markdown";
import tail from "/tail.png";
import { getRarityData, getLevel } from "./Util";

export default function NumberTooltip(props) {
  const { n, numTimesRolled, isMobile, isCombat, attackNumber } = props;
  var cn = "number-tooltip dither-bg";
  var cnTail = "tooltip-tail number-tail";

  if (isCombat) {
    cn += " combat-tooltip";
    cnTail += " combat-tooltip-tail";
  } else {
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

  function getCritChance() {
    var data = getRarityData(n);
    var chance = data.combat_crit_chance;
    return chance + "%";
  }

  return (
    <div className={cn} id={"number-tooltip-" + n}>
      <div className="number-tooltip-inner">
        <img className={cnTail} src={tail} />

        {isCombat && (
          <div className="number-tooltip-text">
            <b>Lvl {getLevel(numTimesRolled)}</b>
          </div>
        )}

        {isCombat && (
          <div className="number-tooltip-text">
            Attacks for <b>{attackNumber}</b>
          </div>
        )}

        {isCombat && (
          <div className="number-tooltip-text">
            Crit chance <b>{getCritChance()}</b>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            className={
              "rarity-tooltip-text rarity-tooltip-text-" + getRarity(n)
            }
          >
            <Markdown>{getRarity(n).toUpperCase()}</Markdown>
          </div>
        </div>

        {!isCombat && (
          <div className="number-tooltip-text">
            <b>Lvl {getLevel(numTimesRolled)} </b>
          </div>
        )}
        {!isCombat && <div className="number-tooltip-text">3 to upgrade</div>}
      </div>
    </div>
  );
}
