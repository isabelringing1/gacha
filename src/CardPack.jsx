import { useState, useRef, useEffect } from "react";
import {
  segmentsCanvas,
  splitCanvasByLine,
  screenLineToCanvasLine,
} from "./LineUtil";
import Drawing from "./Drawing";
import cardPackImg from "/card_pack.png";
import cardPackOld from "/copycat_big.png";
import { DitherShader } from "./dither-shader";
import { isMobile } from "./constants.js";

const CardPack = (props) => {
  const { pack, openPack, hidePack, bigNumberQueue } = props;

  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [numbersRolled, setNumbersRolled] = useState(false);

  const drawAreaRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    const image = new Image();
    image.src = pack.big_art;
    if (image.src == "" || image.src == null) {
      image.src = "./card_pack.png";
    }
    image.onload = () => {
      context.drawImage(image, 0, 0, 373, 658);
    };
  }, []);

  useEffect(() => {
    if (bigNumberQueue.length == 0 && numbersRolled) {
      hidePack();
    }
  }, [bigNumberQueue]);

  const relativeCoordinatesForEvent = (mouseEvent) => {
    var x = mouseEvent.clientX;
    var y = mouseEvent.clientY;
    console.log(document.height);
    if (mouseEvent.touches) {
      x = mouseEvent.touches[0].clientX;
      y = mouseEvent.touches[0].clientY;
    }

    const boundingRect = drawAreaRef.current.getBoundingClientRect();
    console.log(x - boundingRect.left, y - boundingRect.top);
    return {
      x: x - boundingRect.left,
      y: y - boundingRect.top,
    };
  };

  const handleMouseDown = (mouseEvent) => {
    if (mouseEvent.button !== 0) {
      return;
    }

    const point = relativeCoordinatesForEvent(mouseEvent);
    setLines([[point]]);
    setIsDrawing(true);
  };

  const handleTouchStart = (mouseEvent) => {
    const point = relativeCoordinatesForEvent(mouseEvent);
    setLines([[point]]);
    setIsDrawing(true);
  };

  const handleMouseMove = (mouseEvent) => {
    if (!isDrawing) {
      return;
    }

    var line = document.getElementById("line");
    if (
      line &&
      (line.getTotalLength() > 1000 || lines[lines.length - 1].length > 300)
    ) {
      handleMouseUp();
    }

    const point = relativeCoordinatesForEvent(mouseEvent);

    var newLines = [...lines];
    newLines[newLines.length - 1].push(point);

    setLines(newLines);
  };

  const triggerErrorShake = () => {
    setLines([]);
    setIsDrawing(false);
    const cardPack = document.getElementById("card-pack");
    if (cardPack) {
      cardPack.classList.remove("error-shake");
      void cardPack.offsetWidth;
      cardPack.classList.add("error-shake");
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) {
      return;
    }
    if (!canvasRef.current || !canvasRef.current.isConnected) {
      return;
    }
    if (!segmentsCanvas(canvasRef.current, lines[0])) {
      triggerErrorShake();
      return;
    }
    const result = splitCanvasByLine(canvasRef.current, lines[0]);
    if (result == null) {
      triggerErrorShake();
      return;
    }
    setIsDrawing(false);
    openPack(pack);
    setNumbersRolled(true);
    result.halfA.className = "card-pack-img half-a";
    result.halfB.className = "card-pack-img half-b";
    var drawing = document.getElementById("drawing");
    drawing.classList.remove("fade-out");
    drawing.classList.add("fade-out");
    document.getElementById("card-pack").replaceChildren();
    document.getElementById("card-pack").appendChild(result.halfA);
    document.getElementById("card-pack").appendChild(result.halfB);
  };

  return (
    <div
      id="card-pack-container"
      ref={drawAreaRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      <Drawing lines={lines} />

      <div className="card-pack" id="card-pack">
        <canvas
          className="card-pack-img"
          id="card-pack-img-og"
          ref={canvasRef}
          width={isMobile ? 250 : 373}
          height={isMobile ? 470 : 658}
        />
      </div>
      {/*<DitherShader
        src={cardPackOld}
        gridSize={2}
        ditherMode="bayer"
        colorMode={"original"}
        threshold={0}
        customPalette={["#575757", "#cbcbcbff", "#ffffffff"]}
        className={"test"}
        id="test"
        objectFit="contain"
      />*/}
    </div>
  );
};

export default CardPack;
