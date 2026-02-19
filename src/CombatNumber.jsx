import { useEffect, useRef, useState } from "react";

import CombatButton from "./CombatButton";
import NumberTooltip from "./NumberTooltip";
import shield from "/shield.png";

export default function CombatNumber(props) {
  const {
    number,
    index,
    onAttack,
    combatState,
    combatStateRef,
    teamState,
    setTeamState,
    onNumberDivide,
    level,
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
    lastAttackTimeRef.current = Date.now();

    setAttackInterval();
  }, []);

  useEffect(() => {
    if (!teamState) {
      return;
    }
    if (healthRef.current == null) {
      // first set
      onNumberAttack();
    }
    var s = teamState[index];
    healthRef.current = s.health;
    setBlock(teamState[index].block);
    if (teamState[index].health <= 0) {
      setAlive(false);
    }
    console.log(teamState);
  }, [teamState]);

  useEffect(() => {
    if (combatState != "combat" || healthRef.current == 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [combatState]);

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
    if (combatStateRef.current !== "combat" || healthRef.current === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    var numberDiv = document.getElementById("combat-number-" + index);
    onAttack(number);

    lastAttackTimeRef.current = Date.now();

    numberDiv.classList.remove("attack");
    void numberDiv.offsetWidth;
    numberDiv.classList.add("attack");
  }

  function onHeal() {
    setTeamState((prevTeamState) => {
      var newTeamState = [...prevTeamState];
      if (newTeamState[index].shields < newTeamState[index].initialShields) {
        newTeamState[index].shields += 1;
      }

      return newTeamState;
    });
  }

  function onDivide() {
    onNumberDivide(number);
  }

  function onBlock() {
    if (teamState[index].block) {
      return;
    }
    setTeamState((prevTeamState) => {
      var newTeamState = [...prevTeamState];
      newTeamState[index].block = true;
      return newTeamState;
    });
    setTimeout(() => {
      setTeamState((prevTeamState) => {
        var newTeamState = [...prevTeamState];
        newTeamState[index].block = false;
        return newTeamState;
      });
    }, 3000);
  }

  function canHeal() {
    return alive && teamState[index].shields < teamState[index].initialShields;
  }

  return (
    teamState && (
      <div className="combat-number-container">
        {hover && <NumberTooltip n={number} isCombat={true} />}

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
              "combat-number " + (teamState[index].health == 0 ? " dead" : "")
            }
            id={"combat-number-" + index}
          >
            {teamState[index].health}
          </div>
          <div
            className="combat-number-cooldown"
            style={{
              opacity: alive && combatState == "combat" ? 1 : 0,
              "--animation-duration": number / 10 + "s",
            }}
          ></div>

          <div className="armor-container">
            {Array(teamState[index].initialShields)
              .fill(0)
              .map((_, i) => {
                return (
                  <div
                    className="armor"
                    key={"armor-" + index + "-" + i}
                    style={{
                      opacity: i < teamState[index].shields ? 1 : 0.2,
                    }}
                  >
                    <img src={shield} className="shield-img" />
                  </div>
                );
              })}
          </div>
          <div className="block" style={{ opacity: block ? 1 : 0 }}></div>
        </div>

        <div className="combat-number-button-container">
          {/*<CombatButton
            id="block"
            text="Block"
            cooldown={6}
            startActive={true}
            clickAction={onBlock}
            isDisabled={!alive}
          />*/}
          <CombatButton
            id="heal"
            text="Heal"
            cooldown={3}
            startActive={true}
            clickAction={onHeal}
            isDisabled={!canHeal()}
          />
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
      </div>
    )
  );
}
