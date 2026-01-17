import { useState, useEffect } from "react";
import { getRarityData } from "./Util";
import Twinkle from "./Twinkle";

import { DitherShader } from "./dither-shader";

export default function SplashDisplayBack(props) {
  const {
    n,
    numTimesRolled,
    bigNumberQueue,
    setBigNumberQueue,
    animating,
    setAnimating,
    viewNumbers,
    setViewNumbers,
    viewDiamonds,
    setViewDiamonds,
  } = props;

  const [cn, setCn] = useState("big-number-container");
  const [data, setData] = useState(null);
  const [twinkleArray, setTwinkleArray] = useState([]);
  const [twinkleIndex, setTwinkleIndex] = useState(0);

  function onClick() {
    if (animating) {
      return;
    }
    setAnimating(true);
    setCn("big-number-container zoom-out");

    var number = document.getElementById("number-container-" + n);
    number.classList.remove("pulse-delay");
    number.classList.add("pulse-delay");
    var diamonds = document.getElementById("diamonds-container");
    diamonds.classList.add("pulse-delay");

    setTimeout(() => {
      setBigNumberQueue(bigNumberQueue.slice(1));
      setAnimating(false);
      setCn("big-number-container");

      var newViewNumbers = { ...viewNumbers };
      newViewNumbers[n] = newViewNumbers[n] ? newViewNumbers[n] + 1 : 1;
      setViewNumbers(newViewNumbers);
      setViewDiamonds(viewDiamonds + n);
      diamonds.classList.remove("pulse-delay");
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
