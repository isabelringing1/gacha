import { useRef, useState, useEffect } from "react";
import { rollMultiple, chance3SumGreaterThan } from "./Util";
import { setDragLock, time } from "motion";

const Debug = (props) => {
  const {
    rolls,
    numbers,
    setRolls,
    setNumbers,
    setHearts,
    setSpades,
    setClubs,
    spades,
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
    unlockSportsbook,
    setCombatUnlocked,
    setKeys,
    winBattleRef,
  } = props;
  const [showDebug, setShowDebug] = useState(false);
  const heartsInputRef = useRef(null);
  const diamondsInputRef = useRef(null);
  const spadesInputRef = useRef(null);
  const clubsInputRef = useRef(null);
  const keysInputRef = useRef(null);
  const numberInputRef = useRef(null);
  const timeMultiplierRef = useRef(null);
  const chances3Ref = useRef(null);
  const simulateRef = useRef(null);
  const canvasFilenameRef = useRef(null);


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

  function simulateRolls(numRolls) {
    var newRolls = rollMultiple(numRolls);
    var newNumbers = { ...numbers };
    for (var i = 0; i < newRolls.length; i++) {
      var n = newRolls[i];
      newNumbers[n] = newNumbers[n] ? newNumbers[n] + 1 : 1;
    }
    setNumbers(newNumbers);
    setRolls([...newRolls, ...rolls]);
    setSpades(spades + newRolls.reduce((acc, curr) => acc + curr, 0));
    console.log(newNumbers);
  }

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
            Calculate sum grt. x
          </button>
        </div>

        <button
          className="debug-button"
          onClick={() => {
            if (sportsbookState == "hidden") {
              setSportsbookState("locked");
            } else if (sportsbookState == "locked") {
              unlockSportsbook(true);
            }
          }}
        >
          {sportsbookState == "hidden"
            ? "Show Sportsbook"
            : "Unlock Sportsbook"}
        </button>

        <button
          className="debug-button"
          onClick={() => {
            if (charmShopState == "hidden") {
              setCharmShopState("locked");
            } else if (charmShopState == "locked") {
              unlockCharmShop(true);
            }
          }}
        >
          {charmShopState == "hidden" ? "Show Charm Shop" : "Unlock Charm Shop"}
        </button>

        <button
          className="debug-button"
          onClick={() => {
            if (packShopState == "hidden") {
              setPackShopState("locked");
            } else if (packShopState == "locked") {
              unlockPackShop(true);
            }
          }}
        >
          {packShopState == "hidden" ? "Show Pack Shop" : "Unlock Pack Shop"}
        </button>

        <button
          className="debug-button"
          onClick={() => {
            setCombatUnlocked(true);
          }}
        >
          Unlock Combat
        </button>

        <button
          className="debug-button"
          onClick={() => {
            winBattleRef?.current?.();
          }}
        >
          Win Battle
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
          <input type="number" ref={spadesInputRef} />
          <button
            className="debug-button"
            onClick={() => {
              setSpades(parseInt(spadesInputRef.current.value));
            }}
          >
            Set &#x2660;&#xfe0e;
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
          <input type="number" ref={clubsInputRef} />
          <button
            className="debug-button"
            onClick={() => {
              setClubs(parseInt(clubsInputRef.current.value));
            }}
          >
            Set ♣
          </button>
        </div>

        <div>
          <input type="number" ref={keysInputRef} />
          <button
            className="debug-button"
            onClick={() => {
              setKeys(parseInt(keysInputRef.current.value));
            }}
          >
            Set 🗝
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

        <div>
          <input type="number" ref={simulateRef}  defaultValue={100}/>
          <button
            className="simulate-button"
            onClick={() => {
              simulateRolls(parseInt(simulateRef.current.value));
            }}
          >
            Simulate Rolls
          </button>
        </div>

        <div>
          <input type="text" ref={canvasFilenameRef} defaultValue="test" placeholder="filename" />
          <button
            className="debug-button"
            onClick={() => {
              const canvasParent = document.getElementsByClassName("test")[0];
              console.log(canvasParent.children[0]);
              if (canvasParent.children[0]) {
                const name = canvasFilenameRef.current.value || "test";
                const link = document.createElement("a");
                link.download = `${name}.png`;
                link.href = canvasParent.children[0].toDataURL("image/png");
                link.click();
              }
              else{
                console.log("No canvas found");
              }
            }}
          >
            Save Canvas
          </button>
        </div>
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
