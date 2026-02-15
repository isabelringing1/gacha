import { useRef, useState, useEffect } from "react";
import { getRarity, rollForPack, chance3SumGreaterThan } from "./Util";
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
    setCurrentEvent,
    packShopState,
    setPackShopState,
    charmShopState,
    unlockPackShop,
    setCharmShopState,
    unlockCharmShop,
    sportsbookState,
    setSportsbookState,
    unlockSportsbook
  } = props;
  const [showDebug, setShowDebug] = useState(false);
  const heartsInputRef = useRef(null);
  const diamondsInputRef = useRef(null);
  const numberInputRef = useRef(null);
  const timeMultiplierRef = useRef(null);
  const chances3Ref = useRef(null);

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
          <input type="number" ref={chances3Ref} defaultValue={100} />
          <button
            className="debug-button"
            onClick={() => {
              console.log(chance3SumGreaterThan(chances3Ref.current.value));
            }}
          >
            Calculate sum > x
          </button>
        </div>

        <button
          className="debug-button"
          onClick={() => {
            if (sportsbookState == "hidden") {
              setSportsbookState("locked")
            }
            else if (sportsbookState == "locked") {
              unlockSportsbook(true)
            }
          }}
        >
          {sportsbookState == "hidden" ? "Show Sportsbook" : "Unlock Sportsbook"}
        </button>
       
         <button
          className="debug-button"
          onClick={() => {
            if (charmShopState == "hidden") {
              setCharmShopState("locked")
            }
            else if (charmShopState == "locked") {
              unlockCharmShop(true)
            }
          }}
        >
          {charmShopState == "hidden" ? "Show Charm Shop" : "Unlock Charm Shop"}
        </button>

         <button
          className="debug-button"
          onClick={() => {
            if (packShopState == "hidden") {
              setPackShopState("locked")
            }
            else if (packShopState == "locked") {
              unlockPackShop(true)
            }
          }}
        >
          {packShopState == "hidden" ? "Show Pack Shop" : "Unlock Pack Shop"}
        </button>

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
            setCurrentEvent(null);
          }}
        >
          Delete Event
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
