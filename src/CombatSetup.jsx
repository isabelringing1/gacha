import { useState } from "react";
import CombatEntrySlot from "./CombatEntrySlot";
import CombatNumberGrid from "./CombatNumberGrid";

export default function CombatSetup(props) {
  var {
    slots,
    setSlots,
    onEdit,
    combatState,
    setShowCombat,
    setShowCombatSetup,
    numbers,
  } = props;

  const [selectingIndex, setSelectingIndex] = useState(-1);

  function selectNumber(n, i) {
    setSlots((prevCombatTeam) => {
      var newCombatTeam = [...prevCombatTeam];
      newCombatTeam[i] = n;
      return newCombatTeam;
    });
    setSelectingIndex(-1);
  }
  return (
    <div className="combat-container">
      {selectingIndex != -1 && (
        <CombatNumberGrid
          selectingIndex={selectingIndex}
          numbers={numbers}
          selectNumber={selectNumber}
          combatState={combatState}
        />
      )}
      <div className="combat-setup-popup dither-bg">
        <div className="title">BATTLE</div>
        <div className="combat-setup-popup-inner">
          <div className="combat-setup-enemy-container">
            <div className="title">LVL {combatState.level}</div>
            <div className="combat-setup-enemy">{combatState.enemy}</div>
          </div>
          <div className="title">YOUR TEAM</div>

          <div className="combat-slots-container">
            {slots.map((n, i) => {
              return (
                <CombatEntrySlot
                  key={"slot-" + i}
                  number={n}
                  index={i}
                  onEdit={() => {
                    setSelectingIndex(i);
                  }}
                  selectingIndex={selectingIndex == i}
                />
              );
            })}
          </div>
          <div className="text">REWARD: SOMETHING</div>
          <button
            onClick={() => {
              setShowCombat(true);
              setShowCombatSetup(false);
            }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
