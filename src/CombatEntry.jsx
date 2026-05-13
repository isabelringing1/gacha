import cloud1 from "/cloud1.png";
import cloud2 from "/cloud2.png";
import cloud3 from "/cloud3.png"; 
import cloud4 from "/cloud4.png"; 
import cloud_bg from "/cloud_bg2.png";
import { DitherShader } from "./dither-shader";
import { getCurrencyIcon } from "./Util";
import ticket from "/ticket.png";
import { isMobile } from "./constants.js";

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
  var useExpNotation = len > 15;
  var expDisplay = useExpNotation
    ? Number(currentEnemy).toExponential(2).replace("+", "")
    : null;
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
              contrast={1.6}
              threshold={0.2}
            />
            <DitherShader
              src={cloud2}
              gridSize={2}
              ditherMode="bayer"
              className="floating-num-cloud cloud-2"
              objectFit="contain"
              contrast={1.6}
              threshold={0.2}
            />
            <DitherShader
              src={cloud2}
              gridSize={2}
              ditherMode="bayer"
              className="floating-num-cloud cloud-5"
              objectFit="contain"
              contrast={1.6}
              threshold={0.2}
            />
            <DitherShader
              src={cloud3}
              gridSize={2}
              ditherMode="bayer"
              className="floating-num-cloud cloud-3"
              objectFit="contain"
              contrast={1.6}
              threshold={0.2}
            />
            <DitherShader
              src={cloud4}
              gridSize={2}
              ditherMode="bayer"
              className="floating-num-cloud cloud-4"
              objectFit="contain"
              contrast={1.6}
              threshold={0.2}
            />
            
            <div className={"floating-num" + (useExpNotation ? " floating-num-long" : len > 11 ? " floating-num-xlong" : len > 8 ? " floating-num-long-xl" : len > 6 ? " floating-num-long" : "")}>
              {waiting ? (
                <>
                  <div id={"floating-num-0"} key={"floating-num-0"}>?</div>
                  <div id={"floating-num-1"} key={"floating-num-1"}>?</div>
                  <div id={"floating-num-2"} key={"floating-num-2"}>?</div>
                </>
              ) : useExpNotation ? (
                expDisplay.split("").map((ch, i) => (
                  <div
                    id={"floating-num-" + i}
                    key={"floating-num-exp-" + i}
                    className={"floating-num-anim-" + (i % 4)}
                  >
                    {ch}
                  </div>
                ))
              ) : (
                digits.map((digit, i) => {
                  var hasComma = digit.length > 1;
                  return (
                    <div
                      id={"floating-num-" + i}
                      key={"floating-num-" + i}
                      className={len > 4 ? "floating-num-anim-" + (i % 4) : undefined}
                    >
                      {hasComma ? digit[0] : digit}{hasComma && <span className="floating-num-comma">,</span>}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
        {waiting && isMobile && (
          <div className="combat-menu-next-level-text unlock-early-text">
           UNLOCK EARLY 
          </div>
        )}

        {waiting ? (
          <div className="combat-menu-next-level-text unlocks-in-text">
            Unlocks in {minRemaining} min {secRemaining} sec
          </div>
        ) : (
          <button className="combat-menu-start-button" onClick={onChallenge} disabled={combatLevel > 1 && (!combatTickets || combatTickets <= 0)}>
            {combatLevel === 1 ? "START" : <>START (<img src={ticket} alt="ticket" className="ticket-icon" />1)</>}
          </button>
        )}

        {waiting && !isMobile && (
          <div className="combat-menu-next-level-text unlock-early-text">
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
            <div className="combat-entry-rewards combat-entry-rewards-pre" style={{ marginTop: "2dvh" }}>
              <div>REWARDS: </div>
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
