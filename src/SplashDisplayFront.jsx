import { useEffect } from "react";
import ribbon from "/ribbon.png";
import newBg from "/new_bg.png";
import speech_bubble from "/speech_bubble.png";
import { DitherShader } from "./dither-shader";
import { getRarityData, getRarity } from "./Util";
import numberData from "./json/numbers.json";

export default function SplashDisplayFront(props) {
  const { bigNumberEntry, isNew, animating } = props;
  var n = bigNumberEntry.n;
  var data = getRarityData(n);
  var r = getRarity(n).toUpperCase();
  const letters = r.split("");
  const mid = (letters.length - 1) / 2;

  var newText = <span className="new-text">NEW</span>;
  var randomNumberText =
    numberData[n][Math.floor(Math.random() * numberData[n].length)];
  var numberText = <span className="number-text">{randomNumberText}</span>;

  var digits =
    n == 100 ? [1, 0, 0] : n > 9 ? [Math.floor(n / 10), n % 10] : [n];

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
    <div
      className={"splash-front " + (animating ? "zoom-out" : "")}
      style={{ transformOrigin: getTransformOrigin() }}
    >
      <DitherShader
        src={ribbon}
        gridSize={2}
        ditherMode="bayer"
        colorMode="custom"
        className="ribbon"
        customPalette={data.ribbon_palette}
        objectFit="contain"
        threshold={0}
      />
      <DitherShader
        src={speech_bubble}
        gridSize={2}
        ditherMode="bayer"
        colorMode="custom"
        className="speech-bubble"
        customPalette={data.ribbon_palette}
        objectFit="contain"
        threshold={0}
        children={[numberText]}
        style={{ color: data.font_color }}
      />

      {isNew && (
        <div className="new-container">
          <DitherShader
            src={newBg}
            gridSize={2}
            ditherMode="bayer"
            colorMode="custom"
            className="new-bg"
            customPalette={["#feb909ff", "#fff382ff", "#ffffffff"]}
            objectFit="contain"
            threshold={0}
            children={[newText]}
            style={{ color: "#775705ff" }}
          />
        </div>
      )}
      <span
        className={"ribbon-text ribbon-text-" + getRarity(n)}
        style={{ color: data.font_color }}
      >
        {letters.map((char, i) => {
          const dir = i < mid ? -1 : 1;
          const layer = Math.floor(Math.abs(i - mid));
          return (
            <span key={i} className={`curved-letter curved-letter-${layer}`}>
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </span>

      <div className="big-numbers">
        {digits.map((digit, i) => {
          return (
            <div
              className="big-number"
              id={"big-number-" + i}
              key={"big-number-" + i}
              style={{
                color: data.font_color,
              }}
            >
              {digit}
            </div>
          );
        })}
      </div>
    </div>
  );
}
