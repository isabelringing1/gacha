import { useState, useEffect } from "react";
import { useInterval, msToTime } from "./Util";

function Timer(props) {
  const { endTime, onTimerEnd } = props;

  var [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState("idle");

  useInterval(() => {
    var t = endTime - Date.now();
    if (t <= 0) {
      setStatus("done");
      console.log("calling on timer end");
      onTimerEnd();
    } else {
      setTimeLeft(t);
    }
  }, 1000);

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

  var timeLeftString = timeLeft != null ? msToTime(timeLeft, true, true) : "";
  return <span className="timer">{timeLeftString}</span>;
}

export default Timer;
