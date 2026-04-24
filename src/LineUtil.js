function getLineIntersections(points, top, left, width, height) {
  const rectEdges = [
    [
      { x: left, y: top },
      { x: left + width, y: top },
    ], // top
    [
      { x: left + width, y: top },
      { x: left + width, y: top + height },
    ], // right
    [
      { x: left + width, y: top + height },
      { x: left, y: top + height },
    ], // bottom
    [
      { x: left, y: top + height },
      { x: left, y: top },
    ], // left
  ];

  const intersections = [];
  console.log(rectEdges, points);
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    for (const [a, b] of rectEdges) {
      const inter = segmentIntersection(p1, p2, a, b);
      if (inter) intersections.push(inter);
    }
  }

  // return only if it crosses at least twice
  return intersections.length >= 2 ? intersections : null;
}

function segmentIntersection(p1, p2, p3, p4) {
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (denom === 0) return null;

  const x =
    ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) -
      (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) /
    denom;
  const y =
    ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) -
      (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) /
    denom;

  if (
    x < Math.min(p1.x, p2.x) ||
    x > Math.max(p1.x, p2.x) ||
    y < Math.min(p1.y, p2.y) ||
    y > Math.max(p1.y, p2.y)
  )
    return null;
  if (
    x < Math.min(p3.x, p4.x) ||
    x > Math.max(p3.x, p4.x) ||
    y < Math.min(p3.y, p4.y) ||
    y > Math.max(p3.y, p4.y)
  )
    return null;

  return { x, y };
}

function segmentsCanvas(originalCanvas, points) {
  var boundingBox = originalCanvas.getBoundingClientRect();
  const width = boundingBox.width;
  const height = boundingBox.height;
  const top = boundingBox.top;
  const left = boundingBox.left;
  const intersections = getLineIntersections(points, top, left, width, height);
  return intersections && intersections.length > 1;
}

function screenLineToCanvasLine(line, canvas) {
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const canvasLine = line.map(({ x, y }) => ({
    x: Math.min(Math.max((x - rect.left) * scaleX, 0), canvas.width),
    y: Math.min(Math.max((y - rect.top) * scaleY, 0), canvas.height),
  }));

  return canvasLine;
}

// Map an edge point to a perimeter parameter t, going clockwise from (0,0).
// Top edge: t in [0, w]; right: [w, w+h]; bottom: [w+h, 2w+h]; left: [2w+h, 2(w+h)].
function edgeParam(pt, width, height) {
  const eps = 0.5;
  if (pt.y <= eps) return pt.x;
  if (pt.x >= width - eps) return width + pt.y;
  if (pt.y >= height - eps) return 2 * width + height - pt.x;
  if (pt.x <= eps) return 2 * width + 2 * height - pt.y;
  return null;
}

function cornersOnArc(tFrom, tTo, clockwise, width, height) {
  const perimeter = 2 * (width + height);
  const corners = [
    { x: width, y: 0, t: width },
    { x: width, y: height, t: width + height },
    { x: 0, y: height, t: 2 * width + height },
    { x: 0, y: 0, t: 0 },
  ];
  const arcLen = clockwise
    ? (tTo - tFrom + perimeter) % perimeter
    : (tFrom - tTo + perimeter) % perimeter;
  return corners
    .map((c) => ({
      ...c,
      dist: clockwise
        ? (c.t - tFrom + perimeter) % perimeter
        : (tFrom - c.t + perimeter) % perimeter,
    }))
    .filter((c) => c.dist > 0 && c.dist < arcLen)
    .sort((a, b) => a.dist - b.dist)
    .map((c) => ({ x: c.x, y: c.y }));
}

function splitCanvasByLine(originalCanvas, screenPoints) {
  const width = originalCanvas.width;
  const height = originalCanvas.height;

  const points = screenLineToCanvasLine(screenPoints, originalCanvas);
  if (points.length < 2) return null;

  const startPt = points[0];
  const endPt = points[points.length - 1];
  const tStart = edgeParam(startPt, width, height);
  const tEnd = edgeParam(endPt, width, height);
  if (tStart === null || tEnd === null) return null;

  const makeHalfCanvas = (clockwise) => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;

    const ctx = c.getContext("2d");
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    // Walk the canvas perimeter from endPt back toward startPt, inserting
    // only the corners that lie on that arc.
    const corners = cornersOnArc(tEnd, tStart, clockwise, width, height);
    for (const corner of corners) {
      ctx.lineTo(corner.x, corner.y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(originalCanvas, 0, 0);
    ctx.restore();
    return c;
  };

  return {
    halfA: makeHalfCanvas(true),
    halfB: makeHalfCanvas(false),
  };
}

export { splitCanvasByLine, segmentsCanvas, screenLineToCanvasLine };
