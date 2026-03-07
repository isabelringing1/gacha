import CombatEntrySlot from "./CombatEntrySlot";
export default function CombatEntry(props) {
  var {
    setShowCombat,
    combatState,
    setCombatState,
    selectingIndex,
    setSelectingIndex,
  } = props;

  return (
    <div className={"combat-entry-outer dither-bg"}>
      <div className="title">ADVENTURE</div>
      <div className="combat-entry-inner">
        <div className="combat-entry-inner-inner">
          <div className="combat-slots-container">
            {combatState &&
              combatState.team.map((n, i) => {
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
          <button onClick={() => setShowCombat(true)}>Go</button>
        </div>
      </div>
    </div>
  );
}
