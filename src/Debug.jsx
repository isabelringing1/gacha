import { useRef, useState, useEffect } from "react";
import { getRarity, rollForPack } from "./Util";
import { setDragLock, time } from "motion";

const Debug = (props) => {
  const {
    rolls,
    numbers,
    setHearts,
    rollNumber,
    generatePackShopEntry,
    setTimeMultiplier,
    setDiamonds,
    generateEvent,
  } = props;
  const [showDebug, setShowDebug] = useState(false);
  const heartsInputRef = useRef(null);
  const diamondsInputRef = useRef(null);
  const numberInputRef = useRef(null);
  const timeMultiplierRef = useRef(null);

  var isLocalHost =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";

  const toggleShowDebug = () => {
    setShowDebug((prevShowDebug) => !prevShowDebug);
  };

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyD" && isLocalHost) {
        toggleShowDebug();
      }
    });
  }, []);

  return (
    showDebug && (
      <div id="debug">
        <div>
          <input type="number" ref={timeMultiplierRef} />
          <button
            className="debug-button"
            onClick={() => {
              setTimeMultiplier(parseFloat(timeMultiplierRef.current.value));
            }}
          >
            Time Multiplier
          </button>
        </div>
        <div>
          <input type="number" ref={heartsInputRef} />
          <button
            className="debug-button"
            onClick={() => {
              setHearts(parseInt(heartsInputRef.current.value));
            }}
          >
            Set &hearts;&#xfe0e;
          </button>
        </div>

        <div>
          <input type="number" ref={diamondsInputRef} />
          <button
            className="debug-button"
            onClick={() => {
              setDiamonds(parseInt(diamondsInputRef.current.value));
            }}
          >
            Set ♦
          </button>
        </div>

        <div>
          <input type="number" ref={numberInputRef} />
          <button
            className="debug-button"
            onClick={() => {
              rollNumber(null, parseInt(numberInputRef.current.value));
            }}
          >
            Roll #
          </button>
        </div>

        <button
          className="debug-button"
          onClick={() => {
            generatePackShopEntry();
          }}
        >
          Generate Pack
        </button>
        <button
          className="debug-button"
          onClick={() => {
            generateEvent();
          }}
        >
          Generate Event
        </button>
        <button
          className="debug-button"
          onClick={() => {
            localStorage.clear();
            location.reload();
          }}
        >
          Reset
        </button>
      </div>
    )
  );
};

export default Debug;
