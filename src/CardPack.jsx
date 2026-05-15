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
import numberBg from "/number_bg.png";
import { isMobile } from "./constants.js";

const CardPack = (props) => {
  const { pack, openPack, hidePack, bigNumberQueue } = props;

  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [numbersRolled, setNumbersRolled] = useState(false);
  const [showSliceInstructions, setShowSliceInstructions] = useState(false);

  const drawAreaRef = useRef(null);
  const canvasRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = new Image();
    image.src = pack.big_art;
    if (image.src == "" || image.src == null) {
      image.src = "./card_pack.png";
    }
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, []);

  useEffect(() => {
    if (bigNumberQueue.length == 0 && numbersRolled) {
      hidePack();
    }
  }, [bigNumberQueue]);

  useEffect(() => {
    const t = setTimeout(() => setShowSliceInstructions(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const relativeCoordinatesForEvent = (mouseEvent) => {
    var x = mouseEvent.clientX;
    var y = mouseEvent.clientY;
    if (mouseEvent.touches) {
      x = mouseEvent.touches[0].clientX;
      y = mouseEvent.touches[0].clientY;
    }

    const boundingRect = drawAreaRef.current.getBoundingClientRect();
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
    lineRef.current = null;
  };

  const handleTouchStart = (mouseEvent) => {
    const point = relativeCoordinatesForEvent(mouseEvent);
    setLines([[point]]);
    setIsDrawing(true);
    lineRef.current = null;
  };

  const handleMouseMove = (mouseEvent) => {
    if (!isDrawing) {
      return;
    }

    if (!lineRef.current || !lineRef.current.isConnected) {
      lineRef.current = document.getElementById("line");
    }
    var line = lineRef.current;
    if (
      line &&
      (line.getTotalLength() > 1300 || lines[lines.length - 1].length > 300)
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
    setShowSliceInstructions(true);
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
    if (!isMobile && !segmentsCanvas(canvasRef.current, lines[0])) {
      console.log("doesn't segment canvas");
      triggerErrorShake();
      return;
    }
    const result = splitCanvasByLine(canvasRef.current, lines[0]);
    if (result == null) {
      console.log("splitCanvasByLine result is null");
      triggerErrorShake();
      return;
    }
    setIsDrawing(false);
    setShowSliceInstructions(false);
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

      {showSliceInstructions && !numbersRolled && (
        <div className="slice-instructions">
          <DitherShader
            src={numberBg}
            gridSize={2}
            ditherMode="bayer"
            colorMode="colorMode"
            className="slice-instructions-bg"
            objectFit="fill"
            threshold={0}
            brightness={0.05}
            opacity={0.8}
            children={[
              <div key="slice-text" className="slice-instructions-text">
                {isMobile ? "Drag to open" : "Click and drag to open"}
              </div>,
            ]}
          />
        </div>
      )}

      <div className="card-pack" id="card-pack">
        <div className="slice-line" />
        <canvas
          className="card-pack-img"
          id="card-pack-img-og"
          ref={canvasRef}
          width={373}
          height={658}
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
