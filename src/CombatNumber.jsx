import { useEffect, useRef, useState } from "react";

import CombatButton from "./CombatButton";
import NumberTooltip from "./NumberTooltip";
import { AUTO_LEVEL, DIVIDE_LEVEL, FACTOR_TIMING_BOOST } from "./constants.js";
import shield from "/shield.png";
import { getRarity, getCombatLevelData } from "./Util";

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
    hearts,
    setHearts
  } = props;
  var intervalRef = useRef(null);
  var lastAttackTimeRef = useRef(null);
  var timeRemainingRef = useRef(number * 100);
  var timeoutRef = useRef(null);

  const healthRef = useRef(null);
  const numberDivRef = useRef(null);
  const critDivRef = useRef(null);

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
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [winState]);


  function getCooldownMs() {
    return Math.max(50, number * (isFactor ? FACTOR_TIMING_BOOST : 100));
  }

  function getDivideCooldownMs() {
    return getCooldownMs() * 4;
  }

  function setAttackInterval() {
    intervalRef.current = setInterval(
      () => {
        onNumberAttack();
      },
      getCooldownMs(),
    );
  }

  function startCooldownTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCooldownRunning(false);
      setAttackReady(true);
    }, getCooldownMs());
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
    var numberDiv = numberDivRef.current;
    var didCrit = onAttack(healthRef.current);

    lastAttackTimeRef.current = Date.now();

    if (numberDiv) {
      numberDiv.classList.remove("attack");
      void numberDiv.offsetWidth;
      numberDiv.classList.add("attack");
    }

    if (didCrit) {
      var critDiv = critDivRef.current;
      if (critDiv) {
        critDiv.classList.remove("crit-active");
        void critDiv.offsetWidth;
        critDiv.classList.add("crit-active");
      }
    }
  }

  function onHeal() {
    if (hearts < 1) {
      return;
    }
    setHearts(hearts - 1);
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

  function canDivideNow() {
    if (!alive) return false;
    var shieldsLeft = combatState.numberStates[number]?.shields || 0;
    return shieldsLeft > 0 || hearts > 0;
  }

  function onDivide() {
    if (!canDivideNow()) return;
    var shieldsLeft = combatState.numberStates[number]?.shields || 0;
    if (shieldsLeft > 0) {
      setCombatState((prev) => {
        var next = { ...prev };
        next.numberStates[number].shields -= 1;
        return next;
      });
    } else {
      setHearts(hearts - 1);
    }
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

    var blockLength = getCombatLevelData(combatState.combatLevel).block_length || 500;
    setTimeout(() => {
      setCombatState((prevCombatState) => {
        var newCombatState = { ...prevCombatState };
        newCombatState.numberStates[number].block = false;
        return newCombatState;
      });
    }, blockLength);
  }

  function canHeal() {
    return (
      alive &&
      combatState.numberStates[number].shields <
        combatState.numberStates[number].initialShields
      && hearts > 0
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
          onTouchStart={() => {
            setHover(true);
          }}
          onTouchEnd={() => {
            setHover(false);
          }}
          onTouchCancel={() => {
            setHover(false);
          }}
        >
           <div className="combat-number-crit" id={"combat-number-crit-" + index} ref={critDivRef}>Crit!</div>
          <div
            className={
              "combat-number " +
              (combatState.numberStates[number].health == 0 ? " dead " : "combat-number-" + getRarity(number))
            }
            id={"combat-number-" + index}
            ref={numberDivRef}
          >
            
            {combatState.numberStates[number].health}
            {isFactor && <div className="combat-number-factor-bg"></div>}
           
          </div>
          {winState == "combat" && isAuto && (
            <div
              className="combat-number-cooldown"
              style={{
                opacity: alive && winState == "combat" ? 1 : 0,
                "--animation-duration": getCooldownMs() + "ms",
              }}
            ></div>
          )}
          {winState == "combat" && !isAuto && cooldownRunning && (
            <div
              className="combat-number-cooldown combat-number-cooldown-once"
              style={{
                opacity: alive && winState == "combat" ? 1 : 0,
                "--animation-duration": getCooldownMs() + "ms",
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
          <img src={shield} className="block" id={"armor-" + index} style={{ opacity: block ? 1 : 0 }} />
        </div>

        {winState == "combat" && (
          <div
            className="combat-number-button-container"
            style={{ height: buttonContainerHeight + "dvh" }}
          >
            {isAuto ? (
              <div className="combat-auto-label">{"AUTO"}</div>
            ) : (
              <button
                className={
                  "combat-button attack-button" +
                  (attackReady && alive ? " attack-button-ready" : "") +
                  (combatState.combatLevel === 1 && attackReady && alive ? " can-claim-yellow" : "")
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
                cooldown={(getCombatLevelData(combatState.combatLevel).block_cooldown || 3000) / 1000}
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
                text={"DIVIDE (1\u2665\uFE0E)"}
                cooldown={getDivideCooldownMs() / 1000}
                startActive={false}
                clickAction={onDivide}
                isDisabled={!canDivideNow()}
              />
            )}
          </div>
        )}
      </div>
    )
  );
}
