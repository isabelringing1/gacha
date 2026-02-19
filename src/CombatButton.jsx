import { useEffect, useRef, useState } from "react";
import { useInterval, msToTime } from "./Util";

export default function CombatButton(props) {
  const { id, text, cooldown, startActive, clickAction, isDisabled } = props;

  const [isActive, setIsActive] = useState(startActive);
  var [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState("idle");
  const [endTime, setEndTime] = useState(Date.now() + cooldown * 1000);

  useInterval(() => {
    var t = endTime - Date.now();
    if (t <= 0) {
      setStatus("done");
      onTimerEnd();
    } else {
      setTimeLeft(t);
    }
  }, 100);

  useEffect(() => {
    var t = endTime - Date.now();
    if (t >= 0) {
      setStatus("running");
      setTimeLeft(t);
    } else {
      setStatus("done");
      onTimerEnd();
    }
  }, [endTime]);

  function onTimerEnd() {
    setIsActive(true);
  }

  function onButtonPressed() {
    setIsActive(false);
    setEndTime(Date.now() + cooldown * 1000);
    clickAction();
  }

  function getPercent() {
    if (isActive || isDisabled) {
      return 0;
    } else {
      return timeLeft / (cooldown * 10);
    }
  }

  return (
    <button
      className={"combat-button " + id + "-button"}
      disabled={!isActive || isDisabled}
      onClick={onButtonPressed}
    >
      {text}
      <div
        className="combat-inner-button"
        style={{ width: getPercent() + "%" }}
      ></div>
    </button>
  );
}
