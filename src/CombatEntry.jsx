import cloud1 from "/cloud_1.png";
import cloud2 from "/cloud_2.png";
import cloud_bg from "/cloud_bg2.png";
import { DitherShader } from "./dither-shader";
import { getCurrencyIcon } from "./Util";
import ticket from "/ticket.png";

export default function CombatEntry(props) {
  var {
    currentEnemy,
    onChallenge,
    combatLevel,
    levelRewards,
    centered,
    combatTickets,
    waiting,
    minRemaining,
    secRemaining,
    unlockEarlyCost,
    canAffordUnlockEarly,
    onUnlockEarly,
  } = props;

  var raw = String(currentEnemy).split("");
  var len = raw.length;
  var digits = raw.map((digit, i) => {
    var posFromRight = len - 1 - i;
    if (posFromRight > 0 && posFromRight % 3 === 0) {
      return digit + ",";
    }
    return digit;
  });

  return (
    <div className={"combat-entry-column" + (centered ? " combat-entry-centered" : "")}>
      <div className="combat-entry-outer">
        <div className="title">LEVEL {combatLevel}</div>
        <div className="combat-entry-inner" style={waiting ? { opacity: 0.7 } : undefined}>
          <div className="combat-entry-inner-inner">
            <DitherShader
              src={cloud_bg}
              gridSize={2}
              ditherMode="bayer"
              className="cloud-bg"
              objectFit="contain"
              threshold={0}
              contrast={1.1}
            />
            <DitherShader
              src={cloud1}
              gridSize={2}
              ditherMode="bayer"
              className="floating-num-cloud cloud-1"
              objectFit="contain"
            />
            <DitherShader
              src={cloud2}
              gridSize={2}
              ditherMode="bayer"
              className="floating-num-cloud cloud-2"
              objectFit="contain"
            />
            <div className={"floating-num" + (len > 6 ? " floating-num-long" : "")}>
              {waiting ? (
                <>
                  <div id={"floating-num-0"} key={"floating-num-0"}>?</div>
                  <div id={"floating-num-1"} key={"floating-num-1"}>?</div>
                  <div id={"floating-num-2"} key={"floating-num-2"}>?</div>
                </>
              ) : (
                digits.map((digit, i) => {
                  var hasComma = digit.length > 1;
                  return (
                    <div id={"floating-num-" + i} key={"floating-num-" + i}>
                      {hasComma ? digit[0] : digit}{hasComma && <span className="floating-num-comma">,</span>}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
        {waiting ? (
          <div className="combat-menu-next-level-text">
            Unlocks in {minRemaining} min {secRemaining} sec
          </div>
        ) : (
          <button className="combat-menu-start-button" onClick={onChallenge} disabled={combatLevel > 1 && (!combatTickets || combatTickets <= 0)}>
            {combatLevel === 1 ? "START" : <>START (<img src={ticket} alt="ticket" className="ticket-icon" />1)</>}
          </button>
        )}

        {waiting && (
          <div className="combat-menu-next-level-text">
           UNLOCK EARLY 
          </div>
        )}

          {waiting && (
            <button
              className="combat-menu-start-button combat-menu-unlock-early-button"
              onClick={onUnlockEarly}
              disabled={!canAffordUnlockEarly}
            >
              &#x2660;&#xfe0e; {unlockEarlyCost}
            </button>
          )}

          {!waiting && (
            <div className="combat-entry-rewards" style={{ marginTop: "2dvh" }}>
              <div>REWARDS</div>
                {levelRewards && Object.keys(levelRewards).map((r, i) => (
                  <div key={"reward-" + i} className="combat-entry-rewards-item">
                    {getCurrencyIcon(r)}
                    {levelRewards[r].toLocaleString()}
                  </div>
                ))}
            </div>
          )}
      </div>
    </div>
  );
}
