import { useState } from "react";
import NumberTooltip from "./NumberTooltip";
import { getRarityData } from "./Util";

import { isMobile } from "./constants.js";

function Number(props) {
  const { n, data, isHighlighted, isRolled, showingRoll, bigNumberQueue } =
    props;
  const [hover, setHover] = useState(false);

  var opacity = 0.1;
  var numTimesRolled = 0;
  var rarityData = getRarityData(n);

  if (data) {
    numTimesRolled = data;
    opacity = scale(numTimesRolled / n, 0, 1, 0.1, 1);
  }
  var containerClass = "number-container number-container-" + rarityData.id;
  var numberClass = "number number-" + rarityData.id;
  if (numTimesRolled == 0) {
    containerClass += " unrolled";
    numberClass += " unrolled";
  }

  if (isHighlighted) {
    containerClass += " highlighted";
    numberClass += " highlighted";
  }
  if (isRolled) {
    containerClass += " rolled";
    numberClass += " rolled";
  }
  if (numTimesRolled >= n) {
    containerClass += " completed";
  }

  function scale(number, inMin, inMax, outMin, outMax) {
    var scaled =
      ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    scaled = Math.min(outMax, scaled);
    scaled = Math.max(outMin, scaled);
    return scaled;
  }

  return (
    <div
      className={containerClass}
      id={"number-container-" + n}
      style={{
        scale: hover ? 1.1 : 1,
        zIndex: hover ? 2 : 1,
      }}
    >
      {hover && numTimesRolled > 0 && (
        <NumberTooltip n={n} numTimesRolled={numTimesRolled} />
      )}

      <div
        className={numberClass}
        id={"number-" + n}
        style={{
          scale: hover ? 1.1 : 1,
          opacity: opacity,
        }}
        onMouseOver={() => {
          if (isMobile) {
            return;
          }
          setHover(true);
        }}
        onMouseOut={() => {
          if (isMobile) {
            return;
          }
          setHover(false);
        }}
        onTouchStart={() => {
          setHover(true);
        }}
        onTouchEnd={() => {
          setHover(false);
        }}
      >
        {numTimesRolled == 0 ? "?" : n}
      </div>
    </div>
  );
}

export default Number;
