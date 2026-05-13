import { useState, useEffect } from "react";
import { getRarityData, spawnDoober } from "./Util";
import Twinkle from "./Twinkle";
import rarityJson from "./json/rarity.json";

import { DitherShader } from "./dither-shader";

function Ray({ height, width, rotate, top, left, rarity }) {
  return (
    <div
      className={"ray ray-" + rarity}
      style={{
        height: `${height}px`,
        width: `${width}px`,
        transform: `rotate(${rotate}deg)`,
        WebkitTransform: `rotate(${rotate}deg)`,
        top: `${top}px`,
        left: `${left}px`,
      }}
    />
  );
}

const RAYS = [
  { height: 170, width: 30, rotate: 180, top: -175, left: 15 },
  { height: 100, width: 8, rotate: 220, top: -90, left: 75, only_legendary: true },
  { height: 170, width: 50, rotate: 250, top: -80, left: 100 },
  { height: 120, width: 14, rotate: 305, top: 30, left: 100, only_legendary: true },
  { height: 140, width: 30, rotate: -15, top: 60, left: 40 },
  { height: 90, width: 50, rotate: 30, top: 60, left: -40 },
  { height: 140, width: 8, rotate: 70, top: -15, left: -40, only_legendary: true },
  { height: 120, width: 30, rotate: 100, top: -45, left: -90 },
  { height: 80, width: 10, rotate: 120, top: -65, left: -60, only_legendary: true },
  { height: 190, width: 23, rotate: 150, top: -185, left: -60 },
];

export default function SplashDisplayBack(props) {
  const {
    bigNumberEntry,
    numbers,
    setNumbers,
    bigNumberQueue,
    setBigNumberQueue,
    animating,
    setAnimating,
    spades,
    setSpades,
    rolls,
    setRolls,
    checkForEvent,
    isLocked,
    lockedRollCounts,
    setLockedRollCounts,
  } = props;

  const [cn, setCn] = useState("big-number-container");
  const [data, setData] = useState(null);
  const [twinkleArray, setTwinkleArray] = useState([]);
  const [twinkleIndex, setTwinkleIndex] = useState(0);
  var n = bigNumberEntry.n;

  function onClick() {
    if (animating) {
      return;
    }
    setAnimating(true);
    setCn("big-number-container zoom-out");

    var earnsSpades = !isLocked && !bigNumberEntry.restored;

    var finalize = () => {
      setBigNumberQueue((prev) => prev.slice(1));
      setAnimating(false);
      setCn("big-number-container");

      if (isLocked) {
        setLockedRollCounts((prev) => ({
          ...(prev || {}),
          [n]: ((prev || {})[n] || 0) + 1,
        }));
      } else if (!bigNumberEntry.restored) {
        setNumbers((prev) => ({
          ...prev,
          [n]: prev[n] ? prev[n] + 1 : 1,
        }));
        setRolls((prev) => [n, ...prev]);
      }
      checkForEvent();
    };

    // Wait for splash zoom-out (500ms) so the number is visible underneath.
    setTimeout(() => {
      if (!earnsSpades) {
        finalize();
        return;
      }
      var numberEl = document.getElementById("number-container-" + n);
      var spadesEl = document.getElementById("spades-container");
      // Pulse the source number first to draw attention before the doober flies out.
      if (numberEl) {
        numberEl.classList.remove("pulse");
        void numberEl.offsetWidth;
        numberEl.classList.add("pulse");
      }
      spawnDoober({
        from: numberEl,
        to: spadesEl,
        label: "♠︎",
        onLand: () => {
          try {
            var a = new Audio("./get.wav");
            a.play().catch(() => {});
          } catch (e) {}
          // Increment spades on landing — existing useEffect on `spades` pulses #spades-container.
          setSpades((prev) => prev + n);
          finalize();
        },
      });
    }, 500);
  }

  useEffect(() => {
    var newTwinkleArray = [];
    var newData = isLocked ? rarityJson["0"] : getRarityData(n);
    setData(newData);
    for (var i = 0; i < newData.num_twinkles; i++) {
      var newTwinkle = (
        <Twinkle
          data={newData}
          key={"twinkle-" + i}
          style={{ animationDelay: 100 * i + "ms" }}
        />
      );
      newTwinkleArray.push(newTwinkle);
    }

    setTwinkleArray(newTwinkleArray);

    var sfxSrc = isLocked ? "./lock.mp3" : newData && newData.sound_fx;
    if (sfxSrc) {
      var sfxTimer = setTimeout(() => {
        try {
          var audio = new Audio(sfxSrc);
          audio.play().catch(() => {});
        } catch (e) {}
      }, 200);
      return () => clearTimeout(sfxTimer);
    }
  }, [n]);

  useEffect(() => {
    if (!bigNumberEntry.isMultiRoll) return;
    var t = setTimeout(() => {
      onClick();
    }, 500);
    return () => clearTimeout(t);
  }, []);

  function getTransformOrigin() {
    if (!animating) {
      return bigNumberEntry.fromPack ? "50% 100%" : "50% 50%";
    }
    var numberContainer = document.getElementById("number-container-" + n);
    var rect = numberContainer.getBoundingClientRect();
    var x = rect.x + rect.width / 2;
    var y = rect.y + rect.height / 2;
    return x + "px " + y + "px";
  }

  return (
    data && (
      <div
        className={cn}
        onClick={onClick}
        style={{ transformOrigin: getTransformOrigin() }}
      >
        <DitherShader
          src={data.bg_path}
          gridSize={2}
          ditherMode="bayer"
          colorMode={data.color_mode}
          primaryColor={data.primary_color}
          secondaryColor={data.secondary_color}
          threshold={data.threshold}
          customPalette={data.custom_palette}
          className={"splash-bg " + data.bg_type}
          objectFit="contain"
        />

        <div className="ray-box">
          {RAYS.map((ray, i) => (
            (data.id !== "legendary" && ray.only_legendary) ? null : (
              <Ray key={"ray-" + i} {...ray} rarity={data.id} />
            )
          ))}
        </div>

        {twinkleArray.map((twinkle, i) => twinkle)}
      </div>
    )
  );
}
