"use client";
import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { cn } from "./utils";

type DitheringMode = "bayer" | "halftone" | "noise" | "crosshatch";
type ColorMode = "original" | "grayscale" | "duotone" | "custom";

interface DitherShaderProps {
  /** Source image URL */
  src: string;
  /** Size of the dithering grid cells */
  gridSize?: number;
  /** Type of dithering pattern */
  ditherMode?: DitheringMode;
  /** Color processing mode */
  colorMode?: ColorMode;
  /** Invert the dithered output colors */
  invert?: boolean;
  /** Pixelation multiplier (1 = no pixelation, higher = more pixelated) */
  pixelRatio?: number;
  /** Primary color for duotone mode */
  primaryColor?: string;
  /** Secondary color for duotone mode */
  secondaryColor?: string;
  /** Custom color palette array for custom mode */
  customPalette?: string[];
  /** Brightness adjustment (-1 to 1) */
  brightness?: number;
  /** Contrast adjustment (0 to 2, 1 = normal) */
  contrast?: number;
  /** Background color behind the dithered image */
  backgroundColor?: string;
  /** Object fit behavior */
  objectFit?: "cover" | "contain" | "fill" | "none";
  /** Threshold bias for dithering (0 to 1) */
  threshold?: number;
  /** Enable animation effect */
  animated?: boolean;
  /** Animation speed (lower = slower) */
  animationSpeed?: number;
  /** If set, draws an outline (matching the rendered alpha shape, not a rect) in this color */
  outlineColor?: string;
  /** Outline thickness in pixels (default 3) */
  outlineWidth?: number;
  /** Additional CSS classes for the container (use this to set size via Tailwind) */
  className?: string;
  style?: Object;
  children: Array;
}

// 4x4 Bayer matrix for ordered dithering
const BAYER_MATRIX_4x4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// 8x8 Bayer matrix for finer dithering
const BAYER_MATRIX_8x8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

function parseColor(color: string): [number, number, number] {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const match = color.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/i);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return [0, 0, 0];
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const HALFTONE_COS = Math.cos(Math.PI / 4);
const HALFTONE_SIN = Math.sin(Math.PI / 4);
const QUANT_LEVELS = 4;
const QUANT_STEP = 255 / QUANT_LEVELS;

export const DitherShader: React.FC<DitherShaderProps> = ({
  src,
  gridSize = 4,
  ditherMode = "bayer",
  colorMode = "original",
  invert = false,
  pixelRatio = 1,
  primaryColor = "#000000",
  secondaryColor = "#ffffff",
  customPalette = ["#000000", "#ffffff"],
  brightness = 0,
  contrast = 1,
  backgroundColor = "transparent",
  objectFit = "cover",
  threshold = 0.5,
  animated = false,
  animationSpeed = 0.02,
  outlineColor,
  outlineWidth = 3,
  className,
  style,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const dimensionsRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const parsedPrimaryColor = useMemo(() => parseColor(primaryColor), [primaryColor]);
  const parsedSecondaryColor = useMemo(() => parseColor(secondaryColor), [secondaryColor]);
  const customPaletteKey = customPalette.join("|");
  const parsedCustomPalette = useMemo(
    () => customPalette.map(parseColor),
    [customPaletteKey],
  );

  const outlineFilter = useMemo(() => {
    if (!outlineColor) return undefined;
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI) / 4;
      const dx = Math.round(Math.cos(angle) * outlineWidth);
      const dy = Math.round(Math.sin(angle) * outlineWidth);
      return `drop-shadow(${dx}px ${dy}px 0 ${outlineColor})`;
    }).join(" ");
  }, [outlineColor, outlineWidth]);

  const canvasStyle = useMemo(
    () => ({ imageRendering: "pixelated" as const, filter: outlineFilter }),
    [outlineFilter],
  );

  const applyDithering = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      displayWidth: number,
      displayHeight: number,
      time: number = 0,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas || !imageDataRef.current) return;

      const sourceData = imageDataRef.current.data;
      const sourceWidth = imageDataRef.current.width;
      const sourceHeight = imageDataRef.current.height;

      const effectivePixelSize = Math.max(1, Math.floor(gridSize * pixelRatio));
      const matrixSize = gridSize <= 4 ? 4 : 8;
      const bayerMatrix = gridSize <= 4 ? BAYER_MATRIX_4x4 : BAYER_MATRIX_8x8;
      const matrixScale = matrixSize === 4 ? 16 : 64;

      // Build output ImageData and write RGBA bytes directly (much faster than fillStyle/fillRect per pixel)
      const outImageData = ctx.createImageData(displayWidth, displayHeight);
      const outData = outImageData.data;

      // Pre-fill background if non-transparent
      let bgR = 0,
        bgG = 0,
        bgB = 0,
        bgA = 0;
      if (backgroundColor !== "transparent") {
        const parsedBg = parseColor(backgroundColor);
        bgR = parsedBg[0];
        bgG = parsedBg[1];
        bgB = parsedBg[2];
        bgA = 255;
        for (let i = 0; i < outData.length; i += 4) {
          outData[i] = bgR;
          outData[i + 1] = bgG;
          outData[i + 2] = bgB;
          outData[i + 3] = bgA;
        }
      }

      // Hoist constants out of the inner loop
      const oneMinusThreshold = 1 - threshold;
      const halfThreshold = threshold * 0.5;
      const brightness255 = brightness * 255;
      const skipBC = brightness === 0 && contrast === 1;
      const customLen = parsedCustomPalette.length;
      const customLenMinus1 = customLen - 1;
      const halftoneScale = gridSize * 2;
      const crosshatchPeriod = gridSize * 2;
      const crosshatchOffset = gridSize * 4;
      const widthRatio = sourceWidth / displayWidth;
      const heightRatio = sourceHeight / displayHeight;
      const isOriginal = colorMode === "original";
      const isGrayscale = colorMode === "grayscale";
      const isDuotone = colorMode === "duotone";
      const isCustom = colorMode === "custom";
      const isBayer = ditherMode === "bayer";
      const isHalftone = ditherMode === "halftone";
      const isNoise = ditherMode === "noise";
      const isCrosshatch = ditherMode === "crosshatch";
      const noiseTimeOffset = time * 100;
      const primary0 = parsedPrimaryColor[0];
      const primary1 = parsedPrimaryColor[1];
      const primary2 = parsedPrimaryColor[2];
      const secondary0 = parsedSecondaryColor[0];
      const secondary1 = parsedSecondaryColor[1];
      const secondary2 = parsedSecondaryColor[2];

      // Process pixels
      for (let y = 0; y < displayHeight; y += effectivePixelSize) {
        const srcY = (y * heightRatio) | 0;
        const matrixY = ((y / gridSize) | 0) % matrixSize;
        const bayerRow = bayerMatrix[matrixY];
        const blockH = effectivePixelSize < displayHeight - y ? effectivePixelSize : displayHeight - y;

        for (let x = 0; x < displayWidth; x += effectivePixelSize) {
          const srcX = (x * widthRatio) | 0;
          const srcIdx = (srcY * sourceWidth + srcX) << 2;

          const a = sourceData[srcIdx + 3];
          if (a < 10) continue;

          let r = sourceData[srcIdx];
          let g = sourceData[srcIdx + 1];
          let b = sourceData[srcIdx + 2];

          if (!skipBC) {
            r = (r - 128) * contrast + 128 + brightness255;
            g = (g - 128) * contrast + 128 + brightness255;
            b = (b - 128) * contrast + 128 + brightness255;
            if (r < 0) r = 0;
            else if (r > 255) r = 255;
            if (g < 0) g = 0;
            else if (g > 255) g = 255;
            if (b < 0) b = 0;
            else if (b > 255) b = 255;
          }

          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          let ditherThreshold: number;
          if (isBayer) {
            const matrixX = ((x / gridSize) | 0) % matrixSize;
            ditherThreshold = bayerRow[matrixX] / matrixScale;
          } else if (isHalftone) {
            const rotX = x * HALFTONE_COS + y * HALFTONE_SIN;
            const rotY = -x * HALFTONE_SIN + y * HALFTONE_COS;
            ditherThreshold =
              (Math.sin(rotX / halftoneScale) +
                Math.sin(rotY / halftoneScale) +
                2) /
              4;
          } else if (isNoise) {
            const noiseVal =
              Math.sin(x * 12.9898 + y * 78.233 + noiseTimeOffset) *
              43758.5453;
            ditherThreshold = noiseVal - Math.floor(noiseVal);
          } else if (isCrosshatch) {
            const line1 = (x + y) % crosshatchPeriod < gridSize ? 1 : 0;
            const line2 =
              (x - y + crosshatchOffset) % crosshatchPeriod < gridSize ? 1 : 0;
            ditherThreshold = (line1 + line2) / 2;
          } else {
            const matrixX = ((x / gridSize) | 0) % matrixSize;
            ditherThreshold = bayerRow[matrixX] / matrixScale;
          }

          ditherThreshold = ditherThreshold * oneMinusThreshold + halfThreshold;

          let outR: number, outG: number, outB: number;

          if (isOriginal) {
            const ditherAmount = ditherThreshold - 0.5;
            let aR = r + ditherAmount * 64;
            let aG = g + ditherAmount * 64;
            let aB = b + ditherAmount * 64;
            if (aR < 0) aR = 0;
            else if (aR > 255) aR = 255;
            if (aG < 0) aG = 0;
            else if (aG > 255) aG = 255;
            if (aB < 0) aB = 0;
            else if (aB > 255) aB = 255;
            outR = Math.round(aR / QUANT_STEP) * QUANT_STEP;
            outG = Math.round(aG / QUANT_STEP) * QUANT_STEP;
            outB = Math.round(aB / QUANT_STEP) * QUANT_STEP;
          } else if (isGrayscale) {
            const v = luminance < ditherThreshold ? 0 : 255;
            outR = v;
            outG = v;
            outB = v;
          } else if (isDuotone) {
            if (luminance < ditherThreshold) {
              outR = primary0;
              outG = primary1;
              outB = primary2;
            } else {
              outR = secondary0;
              outG = secondary1;
              outB = secondary2;
            }
          } else if (isCustom) {
            if (customLen === 2) {
              const c =
                luminance < ditherThreshold
                  ? parsedCustomPalette[0]
                  : parsedCustomPalette[1];
              outR = c[0];
              outG = c[1];
              outB = c[2];
            } else {
              let adjustedLuminance =
                luminance + (ditherThreshold - 0.5) * 0.5;
              if (adjustedLuminance < 0) adjustedLuminance = 0;
              else if (adjustedLuminance > 1) adjustedLuminance = 1;
              const idx = (adjustedLuminance * customLenMinus1) | 0;
              const c = parsedCustomPalette[idx];
              outR = c[0];
              outG = c[1];
              outB = c[2];
            }
          } else {
            const ditherAmount = ditherThreshold - 0.5;
            let aR = r + ditherAmount * 64;
            let aG = g + ditherAmount * 64;
            let aB = b + ditherAmount * 64;
            if (aR < 0) aR = 0;
            else if (aR > 255) aR = 255;
            if (aG < 0) aG = 0;
            else if (aG > 255) aG = 255;
            if (aB < 0) aB = 0;
            else if (aB > 255) aB = 255;
            outR = Math.round(aR / QUANT_STEP) * QUANT_STEP;
            outG = Math.round(aG / QUANT_STEP) * QUANT_STEP;
            outB = Math.round(aB / QUANT_STEP) * QUANT_STEP;
          }

          if (invert) {
            outR = 255 - outR;
            outG = 255 - outG;
            outB = 255 - outB;
          }

          // Write the block of pixels into the output buffer
          const blockW = effectivePixelSize < displayWidth - x ? effectivePixelSize : displayWidth - x;
          for (let by = 0; by < blockH; by++) {
            let idx = ((y + by) * displayWidth + x) << 2;
            for (let bx = 0; bx < blockW; bx++) {
              outData[idx] = outR;
              outData[idx + 1] = outG;
              outData[idx + 2] = outB;
              outData[idx + 3] = 255;
              idx += 4;
            }
          }
        }
      }

      ctx.putImageData(outImageData, 0, 0);
    },
    [
      gridSize,
      ditherMode,
      colorMode,
      invert,
      pixelRatio,
      parsedPrimaryColor,
      parsedSecondaryColor,
      parsedCustomPalette,
      brightness,
      contrast,
      backgroundColor,
      threshold,
    ],
  );

  // Setup resize observer for responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          dimensionsRef.current = { width, height };
          setDimensions({ width, height });
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Process image and apply dithering when dimensions or settings change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    let isCancelled = false;

    const processImage = (img: HTMLImageElement) => {
      if (isCancelled) return;
      // Dimensions from ResizeObserver can be fractional; floor so canvas size,
      // ImageData stride, and the dither loop indexing all agree.
      const displayWidth = Math.floor(dimensions.width);
      const displayHeight = Math.floor(dimensions.height);
      if (displayWidth === 0 || displayHeight === 0) return;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Reuse a single offscreen canvas across renders rather than allocating each time.
      if (!offscreenRef.current) {
        offscreenRef.current = document.createElement("canvas");
      }
      const offscreen = offscreenRef.current;
      const iw = displayWidth;
      const ih = displayHeight;

      let dw = displayWidth;
      let dh = displayHeight;
      let dx = 0;
      let dy = 0;

      if (objectFit === "cover") {
        const scale = Math.max(displayWidth / iw, displayHeight / ih);
        dw = Math.ceil(iw * scale);
        dh = Math.ceil(ih * scale);
        dx = Math.floor((displayWidth - dw) / 2);
        dy = Math.floor((displayHeight - dh) / 2);
      } else if (objectFit === "contain") {
        const scale = Math.min(displayWidth / iw, displayHeight / ih);
        dw = Math.ceil(iw * scale);
        dh = Math.ceil(ih * scale);
        dx = Math.floor((displayWidth - dw) / 2);
        dy = Math.floor((displayHeight - dh) / 2);
      } else if (objectFit === "fill") {
        dw = displayWidth;
        dh = displayHeight;
      } else {
        dw = iw;
        dh = ih;
        dx = Math.floor((displayWidth - dw) / 2);
        dy = Math.floor((displayHeight - dh) / 2);
      }
      // Resizing a canvas (even to the same size) clears it; only reset when needed.
      if (offscreen.width !== displayWidth) offscreen.width = displayWidth;
      if (offscreen.height !== displayHeight) offscreen.height = displayHeight;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;
      offCtx.clearRect(0, 0, displayWidth, displayHeight);
      offCtx.drawImage(img, dx, dy, dw, dh);

      try {
        imageDataRef.current = offCtx.getImageData(
          0,
          0,
          displayWidth,
          displayHeight,
        );
      } catch {
        console.error("Could not get image data. CORS issue?");
        return;
      }

      // Initial render
      applyDithering(ctx, displayWidth, displayHeight, 0);

      // Setup animation if enabled
      if (animated) {
        const animate = () => {
          if (isCancelled) return;
          timeRef.current += animationSpeed;
          applyDithering(ctx, displayWidth, displayHeight, timeRef.current);
          animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // If image is already loaded, reprocess it
    if (
      imageRef.current &&
      imageRef.current.complete &&
      imageRef.current.src == src
    ) {
      processImage(imageRef.current);
    } else {
      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;

      img.onload = () => {
        if (isCancelled) return;
        imageRef.current = img;
        processImage(img);
      };

      img.onerror = () => {
        console.error("Failed to load image for DitherShader:", src);
      };
    }

    return () => {
      isCancelled = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [src, dimensions, objectFit, animated, animationSpeed, applyDithering]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full", className)}
      style={style}
    >
      {children
        ? children.map((child, i) => {
            return child;
          })
        : null}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={canvasStyle}
        aria-label="Dithered image"
        role="img"
      />
    </div>
  );
};
