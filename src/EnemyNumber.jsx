import { time } from "motion";
import { useEffect, useRef, useState } from "react";

export default function EnemyNumber(props) {
  const { isSetup, enemyRef, onAttack, winState, winStateRef } = props;

  var timeoutRef = useRef(null);

  useEffect(() => {
    if (isSetup) {
      return;
    }

    if (winState == "combat") {
      console.log("Combat, setting attack");
      timeoutRef.current = setTimeout(() => {
        onEnemyAttack();
      }, getRandomAttackInterval());
    }

    if (winState != "combat" && timeoutRef.current) {
      console.log("clearing attack");
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isSetup, winState]);

  function onEnemyAttack() {
    if (winStateRef.current != "combat") {
      return;
    }
    onAttack();
    setTimeout(onEnemyAttack, getRandomAttackInterval());
  }

  function getRandomAttackInterval() {
    return 2000 + Math.random() * 500;
  }
  return (
    <div
      className={"enemy-number " + (winState == "win" ? " dead" : "")}
      id="enemy-number"
      style={{ opacity: isSetup ? 0 : 1 }}
    >
      {enemyRef.current.toLocaleString()}
    </div>
  );
}
