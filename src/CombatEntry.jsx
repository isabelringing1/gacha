import cloud1 from "/cloud_1.png";
import cloud2 from "/cloud_2.png";
import cloud_bg from "/cloud_bg2.png";
import { DitherShader } from "./dither-shader";

export default function CombatEntry(props) {
  var {
    combatState,
    setCombatState,
    setShowCombat,
    firstCombatCompleted,
    onCombatEntryHovered,
    currentEnemy,
  } = props;

  var digits = String(currentEnemy)
    .split("")
    .map((digit) => Number(digit));

  return (
    <div className={"combat-entry-outer dither-bg"} onMouseOver={() => onCombatEntryHovered(true)} onMouseOut={() => onCombatEntryHovered(false)}>
      <div className="title">NUMBER BATTLE</div>
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
    </div>
  );
}
