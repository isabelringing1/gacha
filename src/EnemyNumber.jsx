import { time } from "motion";
import { useEffect, useRef, useState } from "react";

export default function EnemyNumber(props) {
  const { enemyRef, onAttack, combatState, combatStateRef } = props;

  var timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      onEnemyAttack();
    }, getRandomAttackInterval());
  }, []);

  useEffect(() => {
    if (combatState != "combat" && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [combatState]);

  function onEnemyAttack() {
    if (combatStateRef.current != "combat") {
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
      className={"enemy-number " + (combatState == "win" ? " dead" : "")}
      id="enemy-number"
    >
      {enemyRef.current.toLocaleString()}
    </div>
  );
}
