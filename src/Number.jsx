import { useState } from "react";
import NumberTooltip from "./NumberTooltip";

function Number(props) {
  const { n, data, isHighlighted, isRolled, showingRoll } = props;
  const [hover, setHover] = useState(false);

  var opacity = 0.1;
  var numTimesRolled = 0;
  if (data) {
    numTimesRolled = showingRoll ? data - 1 : data;
    opacity = scale(numTimesRolled / n, 0, 1, 0.1, 1);
  }
  var containerClass = "number-container";
  var numberClass = "number";
  if (isHighlighted) {
    containerClass += " highlighted";
    numberClass += " highlighted";
  }
  if (isRolled) {
    containerClass += " rolled";
    numberClass += " rolled";
  }

  function scale(number, inMin, inMax, outMin, outMax) {
    var scaled =
      ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    scaled = Math.min(outMax, scaled);
    scaled = Math.max(outMin, scaled);
    return scaled;
  }

  return (
    <div className={containerClass} id={"number-container-" + n}>
      {hover && <NumberTooltip n={n} numTimesRolled={numTimesRolled} />}
      <div
        className={numberClass}
        id={"number-" + n}
        style={{
          scale: hover ? 1.1 : 1,
          opacity: opacity,
        }}
        onMouseOver={() => {
          setHover(true);
        }}
        onMouseOut={() => {
          setHover(false);
        }}
      >
        {n}
      </div>
    </div>
  );
}

export default Number;
