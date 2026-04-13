import { time } from "motion";
import { useEffect, useRef, useState } from "react";
import shadow from "/shadow.png";
import { DitherShader } from "./dither-shader";

export default function EnemyNumber(props) {
  const { isSetup, enemyRef, onAttack, winState, winStateRef, attributes = [] } = props;

  var timeoutRef = useRef(null);

  useEffect(() => {
    if (isSetup) {
      return;
    }

    if (winState == "combat" && !attributes.includes("no_damage")) {
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
      {enemyRef.current && enemyRef.current.toLocaleString()}
      {winState != "win" &&  <DitherShader src={shadow} gridSize={2} ditherMode="bayer" className="shadow" objectFit="contain" />}
     
    </div>
  );
}
