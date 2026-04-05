import cloud1 from "/cloud_1.png";
import cloud2 from "/cloud_2.png";
import cloud_bg from "/cloud_bg2.png";
import { DitherShader } from "./dither-shader";

export default function CombatEntry(props) {
  var { currentEnemy, onChallenge } = props;

  var digits = String(currentEnemy)
    .split("")
    .map((digit) => Number(digit));

  return (
    <div className="combat-entry-column">
      <div className="combat-entry-outer">
        <div className="title">NEXT UP</div>
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
                return (
                  <div id={"floating-num-" + i} key={"floating-num-" + i}>
                    {digit}
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
        <button className="combat-menu-start-button" onClick={onChallenge}>
            START
          </button>
      </div>
    </div>
  );
}
