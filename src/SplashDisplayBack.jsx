import { useState, useEffect } from "react";
import { getRarityData } from "./Util";
import Twinkle from "./Twinkle";

import { DitherShader } from "./dither-shader";

export default function SplashDisplayBack(props) {
  const {
    bigNumberEntry,
    numbers,
    setNumbers,
    bigNumberQueue,
    setBigNumberQueue,
    animating,
    setAnimating,
    diamonds,
    setDiamonds,
    rolls,
    setRolls,
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

    var number = document.getElementById("number-container-" + n);
    number.classList.remove("pulse-delay");
    number.classList.add("pulse-delay");
    var diamondsContainer = document.getElementById("diamonds-container");
    diamondsContainer.classList.add("pulse-delay");

    setTimeout(() => {
      setBigNumberQueue(bigNumberQueue.slice(1));
      setAnimating(false);
      setCn("big-number-container");

      var newNumbers = { ...numbers };
      newNumbers[n] = newNumbers[n] ? newNumbers[n] + 1 : 1;
      setNumbers(newNumbers);
      setDiamonds(diamonds + n);
      setRolls([...rolls, n]);
      diamondsContainer.classList.remove("pulse-delay");
    }, 700);
  }

  useEffect(() => {
    var newTwinkleArray = [];
    var newData = getRarityData(n);
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
  }, [n]);

  function getTransformOrigin() {
    if (!animating) {
      return "50% 50%";
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

        {twinkleArray.map((twinkle, i) => twinkle)}
      </div>
    )
  );
}
