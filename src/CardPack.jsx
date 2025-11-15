import { useState, useRef, useEffect } from "react";
import { segmentsCanvas, splitCanvasByLine } from "./LineUtil";
import Drawing from "./Drawing";
import cardPackImg from "/card_pack.png";

const CardPack = (props) => {
  const { rollNumbers } = props;

  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);

  const drawAreaRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    const image = new Image();
    image.src = "/card_pack.png";
    image.onload = () => {
      context.drawImage(image, 0, 0, 300, 500);
    };
  }, []);

  const relativeCoordinatesForEvent = (mouseEvent) => {
    const boundingRect = drawAreaRef.current.getBoundingClientRect();
    return {
      x: mouseEvent.clientX - boundingRect.left,
      y: mouseEvent.clientY - boundingRect.top,
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

  const handleMouseUp = (e) => {
    if (!isDrawing) {
      return;
    }
    if (segmentsCanvas(canvasRef.current, lines[0])) {
      setIsDrawing(false);
      rollNumbers();
      const result = splitCanvasByLine(canvasRef.current, lines[0]);
      console.log(result);
      result.halfA.className = "card-pack-img half-a";
      result.halfB.className = "card-pack-img half-b";
      if (result) {
        document.getElementById("card-pack").replaceChildren();
        document.getElementById("card-pack").appendChild(result.halfA);
        document.getElementById("card-pack").appendChild(result.halfB);
      }
    }
  };

  return (
    <div
      id="card-pack-container"
      ref={drawAreaRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Drawing lines={lines} />
      <div className="card-pack" id="card-pack">
        <canvas
          className="card-pack-img"
          id="card-pack-img-og"
          ref={canvasRef}
          width={300}
          height={500}
        />
      </div>
    </div>
  );
};

export default CardPack;
