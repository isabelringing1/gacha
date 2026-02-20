import CombatEntrySlot from "./CombatEntrySlot";

export default function CombatEntry(props) {
  var { slots, enemy, setShowCombat, setSelectingIndex, selectingIndex } =
    props;

  var digits = String(enemy)
    .split("")
    .map((digit) => Number(digit));

  function onEdit(index) {
    setSelectingIndex(index);
  }

  return (
    <div className={"combat-entry-outer dither-bg"}>
      <div className="title">BATTLE</div>
      <div className="combat-entry-inner">
        <div className="combat-entry-inner-inner">
          <div className="combat-entry-big-num">
            {digits.map((digit, i) => {
              return (
                <div
                  id={"combat-entry-big-num-" + i}
                  key={"combat-entry-big-num-" + i}
                >
                  {digit}
                </div>
              );
            })}
          </div>
          <div className="combat-entry-info">
            <div className="combat-entry-text">TEAM</div>

            <div className="combat-slots-container">
              {slots.map((n, i) => {
                return (
                  <CombatEntrySlot
                    key={"slot-" + i}
                    number={n}
                    index={i}
                    onEdit={onEdit}
                    selectingIndex={selectingIndex == i}
                  />
                );
              })}
            </div>
            <button className="combat-entry-button" onClick={setShowCombat}>
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
