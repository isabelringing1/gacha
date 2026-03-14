import CombatEntrySlot from "./CombatEntrySlot";
import cloud1 from "/cloud_1.png";
import cloud2 from "/cloud_2.png";
import { DitherShader } from "./dither-shader";

export default function CombatEntry(props) {
  var {
    combatState,
    setCombatState,
    setShowCombat,
    setSelectingIndex,
    selectingIndex,
    firstCombatCompleted
  } = props;

  var digits = String(getCurrentEnemy())
    .split("")
    .map((digit) => Number(digit));

  function onEdit(index) {
    setSelectingIndex(index);
  }

  function getCurrentEnemy() {
    if (!firstCombatCompleted && combatState.team.length > 0) {
      return combatState.team.reduce((sum, n) => sum + (n || 0), 0);
    }
    if (!combatState || !combatState.pyramidEnemies) {
      return 100;
    }
    if (combatState.selectedEnemyCoords) {
      var [row, col] = combatState.selectedEnemyCoords;
      return combatState.pyramidEnemies[row][col].value;
    }

    for (var i = 0; i < combatState.pyramidEnemies.length; i++) {
      var row = combatState.pyramidEnemies[i];
      for (var j = 0; j < row.length; j++) {
        if (!row[j].isDefeated) {
          return row[j].value;
        }
      }
    }
    return 100;
  }

  return (
    <div className={"combat-entry-outer dither-bg"}>
      <div className="title">BATTLE</div>
      <div className="combat-entry-inner">
        <div className="combat-entry-inner-inner">
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
          <div className="combat-entry-info">
            <div className="combat-entry-text">TEAM</div>

            <div className="combat-slots-container">
              {combatState.team.map((n, i) => {
                return (
                  <CombatEntrySlot
                    key={"slot-" + i}
                    number={n}
                    index={i}
                    onEdit={onEdit}
                    selectingIndex={selectingIndex == i}
                    inCombatEntry={true}
                  />
                );
              })}
            </div>
            <button
              className="combat-entry-button"
              onClick={() => setShowCombat(true)}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
