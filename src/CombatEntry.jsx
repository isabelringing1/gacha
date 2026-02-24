export default function CombatEntry(props) {
  var { enemy, setShowCombat } = props;

  var letters = String("ENTER >").split("");

  return (
    <div className={"combat-entry-outer dither-bg"}>
      <div className="title">BATTLE</div>
      <div className="combat-entry-inner" onClick={() => setShowCombat(true)}>
        <div className="combat-entry-inner-inner">
          <div className="combat-entry-big-num">
            {letters.map((l, i) => {
              return (
                <div
                  id={"combat-entry-big-num-" + i}
                  key={"combat-entry-big-num-" + i}
                >
                  {l}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
