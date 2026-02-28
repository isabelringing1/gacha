import { useEffect, useRef, useState } from "react";

import CombatButton from "./CombatButton";
import NumberTooltip from "./NumberTooltip";
import shield from "/shield.png";

export default function CombatNumber(props) {
  const {
    number,
    numTimesRolled,
    index,
    onAttack,
    winState,
    winStateRef,
    combatState,
    setCombatState,
    onNumberDivide,
    level,
    buttonContainerHeight,
  } = props;
  var intervalRef = useRef(null);
  var lastAttackTimeRef = useRef(null);
  var timeRemainingRef = useRef(number * 100);
  var timeoutRef = useRef(null);

  const healthRef = useRef(null);

  var [block, setBlock] = useState(false);
  var [alive, setAlive] = useState(true);
  var [hover, setHover] = useState(false);

  useEffect(() => {
    if (!combatState) {
      return;
    }

    var s = combatState.numberStates[number];
    healthRef.current = s.health;
    setBlock(combatState.numberStates[number].block);
    if (combatState.numberStates[number].health <= 0) {
      setAlive(false);
    }
  }, [combatState]);

  useEffect(() => {
    if (winState == "combat") {
      lastAttackTimeRef.current = Date.now();
      console.log(winState, healthRef.current);
      onNumberAttack(); //uncomment if you don't want numbers to attack at once
      setAttackInterval();
    }
    if (winState != "combat" || healthRef.current == 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [winState]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    /*
    if (block) {
      console.log("blocking");
      if (intervalRef.current) {
        console.log("clearing interval");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      timeRemainingRef.current =
        number * 100 - (Date.now() - lastAttackTimeRef.current);
    }
    if (!block) {
      // unpause
      lastAttackTimeRef.current =
        Date.now() - (number * 100 - timeRemainingRef.current);
      timeoutRef.current = setTimeout(() => {
        console.log("timeout attack");
        onNumberAttack();
        setAttackInterval();
      }, timeRemainingRef.current);
    }*/
  }, [block]);

  function setAttackInterval() {
    intervalRef.current = setInterval(
      () => {
        onNumberAttack();
      },
      Math.max(100, number * 100),
    );
  }

  function onNumberAttack() {
    if (winState !== "combat" || healthRef.current === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    var numberDiv = document.getElementById("combat-number-" + index);
    onAttack(healthRef.current);

    lastAttackTimeRef.current = Date.now();

    numberDiv.classList.remove("attack");
    void numberDiv.offsetWidth;
    numberDiv.classList.add("attack");
  }

  function onHeal() {
    setCombatState((prevCombatState) => {
      var newCombatState = { ...prevCombatState };
      if (
        newCombatState.numberStates[number].shields <
        newCombatState.numberStates[number].initialShields
      ) {
        newCombatState.numberStates[number].shields += 1;
      }

      return newCombatState;
    });
  }

  function onDivide() {
    onNumberDivide(number);
  }

  function onBlock() {
    if (combatState.numberStates[number].block) {
      return;
    }
    setCombatState((prevCombatState) => {
      var newCombatState = { ...prevCombatState };
      newCombatState.numberStates[number].block = true;
      return newCombatState;
    });

    setTimeout(() => {
      setCombatState((prevCombatState) => {
        var newCombatState = { ...prevCombatState };
        newCombatState.numberStates[number].block = false;
        return newCombatState;
      });
    }, 3000);
  }

  function canHeal() {
    return (
      alive &&
      combatState.numberStates[number].shields <
        combatState.numberStates[number].initialShields
    );
  }

  return (
    combatState && (
      <div className="combat-number-container walk-forward">
        {hover && (
          <NumberTooltip
            n={number}
            isCombat={true}
            numTimesRolled={numTimesRolled}
            attackNumber={healthRef.current}
          />
        )}

        <div
          className="combat-number-container-top"
          onMouseOver={() => {
            setHover(true);
          }}
          onMouseOut={() => {
            setHover(false);
          }}
        >
          <div
            className={
              "combat-number " +
              (combatState.numberStates[number].health == 0 ? " dead" : "")
            }
            id={"combat-number-" + index}
          >
            {combatState.numberStates[number].health}
          </div>
          {winState == "combat" && (
            <div
              className="combat-number-cooldown"
              style={{
                opacity: alive && winState == "combat" ? 1 : 0,
                "--animation-duration": number / 10 + "s",
              }}
            ></div>
          )}

          {winState != "precombat" && (
            <div className="armor-container">
              {Array(combatState.numberStates[number].initialShields)
                .fill(0)
                .map((_, i) => {
                  return (
                    <div
                      className="armor"
                      key={"armor-" + index + "-" + i}
                      style={{
                        opacity:
                          i < combatState.numberStates[number].shields
                            ? 1
                            : 0.2,
                      }}
                    >
                      <img src={shield} className="shield-img" />
                    </div>
                  );
                })}
            </div>
          )}
          <div className="block" style={{ opacity: block ? 1 : 0 }}></div>
        </div>

        {winState != "precombat" && (
          <div
            className="combat-number-button-container"
            style={{ height: buttonContainerHeight + "dvh" }}
          >
            {/*<CombatButton
            id="block"
            text="Block"
            cooldown={6}
            startActive={true}
            clickAction={onBlock}
            isDisabled={!alive}
          />*/}
            {combatState.numberStates[number].initialShields > 0 && (
              <CombatButton
                id="heal"
                text="Heal"
                cooldown={3}
                startActive={true}
                clickAction={onHeal}
                isDisabled={!canHeal()}
              />
            )}
            {level.canDivide && (
              <CombatButton
                id="divide"
                text="Divide"
                cooldown={5 + number / 2}
                startActive={false}
                clickAction={onDivide}
                isDisabled={!alive}
              />
            )}
          </div>
        )}
      </div>
    )
  );
}
