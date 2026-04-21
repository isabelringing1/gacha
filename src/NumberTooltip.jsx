import { factors, getRarity } from "./Util";
import Markdown from "react-markdown";
import tail from "/tail.png";
import { getRarityData, getLevel, getNumToUpgrade } from "./Util";
import { CRIT_BOOST } from "./constants.js";
import keyIcon from "/key.png";

export default function NumberTooltip(props) {
  const { n, numTimesRolled, isMobile, isCombat, attackNumber, isFactor, makeTop, isLocked, canUnlock } = props;
  var cn = "number-tooltip dither-bg";
  var cnTail = "tooltip-tail number-tail";

  if (isCombat) {
    cn += " combat-tooltip";
  }
  
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

  function getCritChance() {
    var data = getRarityData(n);
    var chance = data.combat_crit_chance;
    if (isFactor) {
      chance += CRIT_BOOST;
      chance = Math.floor(chance);
    }
    return chance + "%";
  }

  if (isLocked) {
    return (
      <div className={cn} id={"number-tooltip-" + n}>
        <div className="number-tooltip-inner">
          <img className={cnTail} src={tail} />
          {canUnlock ? (
            <>
              <div className="number-tooltip-text">
                <b>CLICK TO UNLOCK</b>
              </div>
              <div className="number-tooltip-text">
                1 <img src={keyIcon} alt="key" className="key-icon" />
              </div>
            </>
          ) : (
            <>
              <div className="number-tooltip-text">
                <b>LOCKED</b>
              </div>
              <div className="number-tooltip-text">
                You'll need a key.
              </div>
            </>
          )}
        </div>
      </div>
    );
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

        {isCombat && attackNumber > 0 && (
          <div className="number-tooltip-text">
            Attacks for <b>{attackNumber}</b> every {n / 10} seconds
          </div>
        )}

        {isCombat && attackNumber <= 0 && (
          <div className="number-tooltip-text">DEAD</div>
        )}

        {isFactor && (
          <div className="number-tooltip-text" style={{ color: "#89d0f0" }}>
            <b>FACTOR</b>
          </div>
        )}

        {isCombat && (
          <div className="number-tooltip-text">
            Crit chance <b style={{ color: isFactor ? "#89d0f0" : "inherit" }}>{getCritChance()}</b>
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
        <div className="number-tooltip-text">Rolled {numTimesRolled} time{numTimesRolled == 1 ? "" : "s"}, {getNumToUpgrade(numTimesRolled)} more to upgrade</div>
      </div>
    </div>
  );
}
