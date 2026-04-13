import cloud1 from "/cloud_1.png";
import cloud2 from "/cloud_2.png";
import cloud_bg from "/cloud_bg2.png";
import { DitherShader } from "./dither-shader";
import { getCurrencyIcon } from "./Util";

export default function CombatEntry(props) {
  var { currentEnemy, onChallenge, combatLevel, levelRewards } = props;

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
    <div className="combat-entry-column">
      <div className="combat-entry-outer">
        <div className="title">LEVEL {combatLevel}</div>
        <div className="combat-entry-inner">
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
            <div className="floating-num">
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
              {digits.map((digit, i) => {
                var hasComma = digit.length > 1;
                return (
                  <div id={"floating-num-" + i} key={"floating-num-" + i}>
                    {hasComma ? digit[0] : digit}{hasComma && <span className="floating-num-comma">,</span>}
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
        <button className="combat-menu-start-button" onClick={onChallenge}>
            START
          </button>

          <div className="combat-entry-rewards">
            <div>REWARDS</div>
              {levelRewards && Object.keys(levelRewards).map((r, i) => (
                <div key={"reward-" + i} className="combat-entry-rewards-item">
                  {getCurrencyIcon(r)}
                  {levelRewards[r].toLocaleString()}
                </div>
              ))}
          </div>
      </div>
    </div>
  );
}
