import { useEffect, useRef, useState } from "react";

import CombatButton from "./CombatButton";
import NumberTooltip from "./NumberTooltip";
import { AUTO_LEVEL, DIVIDE_LEVEL } from "./constants.js";

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
    isFactor,
    attackFirst,
  } = props;
  var intervalRef = useRef(null);
  var lastAttackTimeRef = useRef(null);
  var timeRemainingRef = useRef(number * 100);
  var timeoutRef = useRef(null);

  const healthRef = useRef(null);

  var [block, setBlock] = useState(false);
  var [alive, setAlive] = useState(true);
  var [hover, setHover] = useState(false);
  var [attackReady, setAttackReady] = useState(false);
  var [cooldownRunning, setCooldownRunning] = useState(false);

  var isAuto = level.level >= AUTO_LEVEL;
  var canDivide = level.level >= DIVIDE_LEVEL;

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
      if (isAuto) {
        if (attackFirst) {
          onNumberAttack();
        }
        setAttackInterval();
      } else {
        if (attackFirst) {
          // manual mode: attack ready immediately
          setAttackReady(true);
          setCooldownRunning(false);
        } else {
          // manual mode: start first cooldown
          setCooldownRunning(true);
          setAttackReady(false);
          startCooldownTimer();
        }
      }
    }
    if (winState != "combat" || healthRef.current == 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        console.log("clearing timeout ", number);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [winState]);


  function setAttackInterval() {
    intervalRef.current = setInterval(
      () => {
        onNumberAttack();
      },
      Math.max(100, number * 100),
    );
  }

  function startCooldownTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      console.log("clearing timeout in startCooldownTimer ", number);
    }
    console.log("starting cooldown timer ", number);
    timeoutRef.current = setTimeout(() => {
      setCooldownRunning(false);
      setAttackReady(true);
    }, Math.max(100, number * 100));
  }

  function onManualAttack() {
    if (!attackReady || !alive) return;
    setAttackReady(false);
    setCooldownRunning(true);
    onNumberAttack();
    startCooldownTimer();
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
    }, 500);
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
      <div className="combat-number-container">
        {hover && (
          <NumberTooltip
            n={number}
            isCombat={true}
            numTimesRolled={numTimesRolled}
            attackNumber={healthRef.current}
            isFactor={isFactor}
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
          {winState == "combat" && isAuto && (
            <div
              className="combat-number-cooldown"
              style={{
                opacity: alive && winState == "combat" ? 1 : 0,
                "--animation-duration": number / 10 + "s",
              }}
            ></div>
          )}
          {winState == "combat" && !isAuto && cooldownRunning && (
            <div
              className="combat-number-cooldown combat-number-cooldown-once"
              style={{
                opacity: alive && winState == "combat" ? 1 : 0,
                "--animation-duration": number / 10 + "s",
              }}
            ></div>
          )}

          {winState != "setup" && (
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
                      <span className="shield-img">&hearts;&#xfe0e;</span>
                    </div>
                  );
                })}
            </div>
          )}
          <div className="block" style={{ opacity: block ? 1 : 0 }}></div>
        </div>

        {winState == "combat" && (
          <div
            className="combat-number-button-container"
            style={{ height: buttonContainerHeight + "dvh" }}
          >
            {isAuto ? (
              <div className="combat-auto-label">AUTO</div>
            ) : (
              <button
                className={
                  "combat-button attack-button" +
                  (attackReady && alive ? " attack-button-ready" : "")
                }
                disabled={!attackReady || !alive}
                onClick={onManualAttack}
              >
                ATTACK
              </button>
            )}
            {level.canBlock && (
              <CombatButton
                id="block"
                text={"BLOCK"}
                cooldown={3}
                startActive={true}
                clickAction={onBlock}
                isDisabled={!alive}
              />
            )}
            {combatState.numberStates[number].initialShields > 0 && (
              <CombatButton
                id="heal"
                text={"HEAL \u2665\uFE0E"}
                cooldown={3}
                startActive={true}
                clickAction={onHeal}
                isDisabled={!canHeal()}
              />
            )}
            {canDivide && (
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
