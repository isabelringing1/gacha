import { useState, useEffect } from "react";
import CombatEntrySlot from "./CombatEntrySlot";
import mapTxt from "/map.txt?raw";
import shield from "/shield.png";

const MAP_LINES = mapTxt.split("\n");
const MAP_WIDTH = MAP_LINES[0].length;
const MAP_HEIGHT = MAP_LINES.length;
const MAP_CHARS = mapTxt.split("");

export default function CombatMap(props) {
  var {
    combatState,
    winState,
    setWinState,
    onStep,
    enemyRef,
    enemyState,
    narration,
    setNarration,
    showReequip,
    setShowReequip,
  } = props;
  var width = MAP_WIDTH;
  var height = MAP_HEIGHT;

  var [mapState, setMapState] = useState(MAP_CHARS);
  var [playerPos, setPlayerPos] = useState([Math.floor(width / 2), height - 1]);
  var [discoveredMap, setDiscoveredMap] = useState({});
  var [numSteps, setNumSteps] = useState(0);
  var [showConfirmDialog, setShowConfirmDialog] = useState(false);
  var [showShop, setShowShop] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", setUpKeys);
    return () => {
      document.removeEventListener("keydown", setUpKeys);
    };
  }, [winState]);

  useEffect(() => {
    if (!discoveredMap) {
      return;
    }
    setDiscoveredMap((oldMap) => {
      var newMap = { ...oldMap };

      // top row
      newMap[[playerPos[0] - 1, playerPos[1] + 1]] = true;
      newMap[[playerPos[0], playerPos[1] + 1]] = true;
      newMap[[playerPos[0] + 1, playerPos[1] + 1]] = true;
      // middle row
      newMap[[playerPos[0] - 1, playerPos[1]]] = true;
      newMap[playerPos] = true;
      newMap[[playerPos[0] + 1, playerPos[1]]] = true;
      // bottom row
      newMap[[playerPos[0] - 1, playerPos[1] - 1]] = true;
      newMap[[playerPos[0], playerPos[1] - 1]] = true;
      newMap[[playerPos[0] + 1, playerPos[1] - 1]] = true;

      return newMap;
    });

    var tile = mapState[coordToIndex()];
    if (numSteps > 0) {
      onStep(tile);
    }

    if (tile == "S") {
      setShowShop(true);
      var newN = "Stumbled upon a merchant.";
      setNarration((oldNarration) => [newN, ...oldNarration]);
    }
    if (tile == "R") {
      setShowConfirmDialog("reequip");
      var newN = "Stumbled upon a reequipment site.";
      setNarration((oldNarration) => [newN, ...oldNarration]);
    }
  }, [playerPos]);

  function coordToIndex() {
    const stride = width + 1;
    return playerPos[1] * stride + playerPos[0];
  }

  function setUpKeys(e) {
    if (enemyRef.current) {
      return;
    }
    if (e.key === "ArrowLeft") {
      //left
      movePlayer([-1, 0]);
    } else if (e.key === "ArrowUp") {
      //up
      movePlayer([0, -1]);
    } else if (e.key === "ArrowRight") {
      //right
      movePlayer([1, 0]);
    } else if (e.key === "ArrowDown") {
      //down
      movePlayer([0, 1]);
    }
  }

  function closeShop() {
    setShowShop(false);
    eraseCurrentTile();
  }

  function eraseCurrentTile() {
    setMapState((oldMapState) => {
      var newMapState = [...oldMapState];
      newMapState[coordToIndex()] = ".";
      return newMapState;
    });
  }

  function movePlayer(dir) {
    var didMove = false;
    setPlayerPos((oldPlayerPos) => {
      var newX = oldPlayerPos[0] + dir[0];
      var newY = oldPlayerPos[1] + dir[1];
      newX = Math.max(0, Math.min(newX, width - 1));
      newY = Math.max(0, Math.min(newY, height - 1));
      if (newX == oldPlayerPos[0] && newY == oldPlayerPos[1]) {
        return oldPlayerPos;
      }
      didMove = true;
      return [newX, newY];
    });
    if (didMove) {
      setNumSteps((oldNumSteps) => oldNumSteps + 1);
    }
  }

  return (
    <div
      className="combat-map-container"
      style={{ opacity: showReequip ? 0 : 1 }}
    >
      {showConfirmDialog && (
        <div className="combat-popup">
          <div>Reequip Team?</div>
          <div className="combat-popup-button-container">
            <button
              onClick={() => {
                setShowReequip(true);
                setShowConfirmDialog(false);
              }}
            >
              Yes
            </button>
            <button onClick={() => setShowConfirmDialog(false)}>No</button>
          </div>
        </div>
      )}
      {showShop && (
        <div className="combat-outcome-popup">
          <div>SHOP</div>
          <div className="combat-shop-row">
            <span>
              1 <img src={shield} className="shield-img-inline" />
            </span>
            <button>&#x2660;&#xfe0e; 200</button>
          </div>

          <button onClick={closeShop}>Leave</button>
        </div>
      )}
      <pre className="map">
        {mapState.map((c, i) => {
          const stride = width + 1; // include newline
          const y = Math.floor(i / stride);
          const x = i % stride;

          if (c === "\n") return c;
          if (x == playerPos[0] && y == playerPos[1]) {
            if (enemyState) {
              return (
                <span key="player" className="red">
                  @
                </span>
              );
            } else if (winState == "lose") {
              return (
                <span key="player" className="red">
                  x
                </span>
              );
            } else {
              return "@";
            }
          }
          if (discoveredMap[[x, y]]) {
            return c;
          }
          return " ";
        })}
      </pre>
      <div className="narration-container">
        {narration.map((n, i) => (
          <div key={"narration-" + i} className="narration">
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
