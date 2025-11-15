import { useState } from "react";

function Number(props) {
  const { n, data } = props;
  const [hover, setHover] = useState(false);
  const opacity = data ? scale(data / n, 0, 1, 0.1, 1) : 0.1;

  function scale(number, inMin, inMax, outMin, outMax) {
    var scaled =
      ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    scaled = Math.min(outMax, scaled);
    scaled = Math.max(outMin, scaled);
    return scaled;
  }

  return (
    <div className="number-container" id={"number-" + n}>
      <div
        className="number"
        style={{
          opacity: opacity,
          scale: hover ? 1.1 : 1,
          color: opacity >= 1 ? "#00e300" : "black",
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
