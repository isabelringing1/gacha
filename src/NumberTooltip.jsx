import { factors, getRarity } from "./Util";
import Markdown from "react-markdown";
import tail from "/tail.png";
import { getRarityData, getLevel, getNumToUpgrade, getLevelData } from "./Util";
import { CRIT_BOOST, AUTO_LEVEL, DIVIDE_LEVEL, FACTOR_TIMING_BOOST } from "./constants.js";
import keyIcon from "/key.png";

export default function NumberTooltip(props) {
  const { n, numTimesRolled, isMobile, isCombat, attackNumber, isFactor, makeTop, isLocked, canUnlock, isEntrySlot } = props;
  var cn = "number-tooltip dither-bg";
  var cnTail = "tooltip-tail number-tail";

  if (isCombat) {
    cn += " combat-tooltip";
  }
  if (!isEntrySlot) { 
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

  function getAttackTime() {
    var ms = Math.max(100, n * (isFactor ? FACTOR_TIMING_BOOST : 100));
    return ms / 1000;
  }

  function getCritChanceColor() {
    var data = getRarityData(n);
    var chance = data.combat_crit_chance;
    if (isFactor) {
      return "#89d0f0";
    }
    else if (data.id == "rare") {
      return "#5882ff";
    }
    else if (data.id == "epic") {
      return "#b31ff7";

    }
    else if (data.id == "legendary") {
      return "#e7b500";
    }
    return "#353535";
  }

  return (
    <div className={cn} id={"number-tooltip-" + n}>
      <div className="number-tooltip-inner">
        <img className={cnTail} src={tail} />

        <div className="number-tooltip-text">
            <b>Lvl {getLevel(numTimesRolled)}</b>
          </div>
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

        <div className="number-tooltip-text">Rolled {numTimesRolled} time{numTimesRolled == 1 ? "" : "s"}, {getNumToUpgrade(numTimesRolled)} more to upgrade</div>
        {isCombat && (
          <div className="number-tooltip-text">
            Crit chance <b style={{ color: getCritChanceColor() }}>{getCritChance()}</b>
          </div>
        )}


        {isCombat && (() => {
          var levelInfo = getLevelData(numTimesRolled) || {};
          var lvl = levelInfo.level || 0;
          var shields = levelInfo.shields || 0;
          return (
            <div className="combat-labels">
              {lvl >= AUTO_LEVEL && (
                <div className="combat-auto-label label-tooltip">AUTO</div>
              )}
              {lvl >= DIVIDE_LEVEL && (
                <div className="combat-auto-label label-tooltip">DIVIDE</div>
              )}
              {shields > 0 && (
                <div className="combat-auto-label label-tooltip">&hearts;&#xfe0e;x{shields}</div>
              )}
            </div>
          );
        })()}

        {isEntrySlot && (
          <div className="combat-labels">
            Hits for {n} every {getAttackTime()} seconds
          </div>
        )}
      </div>
    </div>
  );
}
