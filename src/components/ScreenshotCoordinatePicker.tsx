import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AsciiHeader } from './AsciiHeader';

export interface PickedPoint {
  x: number;
  y: number;
  hexColor: string;
}

interface ScreenshotCoordinatePickerProps {
  onAssignSoru?: (coords: { x: number; y: number }, hexColor: string) => void;
  onAssignPortal?: (coords: { x: number; y: number }, hexColor: string) => void;
  onInsertToEditor?: (x: number, y: number, hexColor: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const ScreenshotCoordinatePicker: React.FC<ScreenshotCoordinatePickerProps> = ({
  onAssignSoru,
  onAssignPortal,
  onInsertToEditor,
  onClose,
  isModal = false
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [pickedPoint, setPickedPoint] = useState<PickedPoint | null>(null);
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 4>(1);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [copiedColor, setCopiedColor] = useState<boolean>(false);
  const [assignedNotice, setAssignedNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize offscreen canvas
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
  }, []);

  // Listen to clipboard paste (e.g. mobile screenshot paste or desktop paste)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              loadFromFile(file);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const loadFromFile = (file: File) => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setPickedPoint(null);
    setAssignedNotice(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFromFile(file);
    }
  };

  const handleClearImage = () => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
    setImageDimensions(null);
    setPickedPoint(null);
    setAssignedNotice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageLoad = () => {
    if (!imageRef.current || !offscreenCanvasRef.current) return;
    const img = imageRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setImageDimensions({ width: nw, height: nh });

    // Draw full resolution onto offscreen canvas for exact color extraction
    const canvas = offscreenCanvasRef.current;
    canvas.width = nw;
    canvas.height = nh;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(img, 0, 0, nw, nh);
    }

    // Default sample point at center
    samplePixelAt(Math.round(nw / 2), Math.round(nh / 2));
  };

  // Sample pixel at native (trueX, trueY)
  const samplePixelAt = useCallback((trueX: number, trueY: number) => {
    if (!offscreenCanvasRef.current || !imageDimensions) return;
    const canvas = offscreenCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const clampedX = Math.max(0, Math.min(canvas.width - 1, trueX));
    const clampedY = Math.max(0, Math.min(canvas.height - 1, trueY));

    try {
      const pixel = ctx.getImageData(clampedX, clampedY, 1, 1).data;
      const r = pixel[0].toString(16).padStart(2, '0');
      const g = pixel[1].toString(16).padStart(2, '0');
      const b = pixel[2].toString(16).padStart(2, '0');
      const hex = `#${r}${g}${b}`.toUpperCase();

      setPickedPoint({
        x: clampedX,
        y: clampedY,
        hexColor: hex
      });
      setAssignedNotice(null);
    } catch {
      // fallback if canvas error
      setPickedPoint({
        x: clampedX,
        y: clampedY,
        hexColor: '#FFFFFF'
      });
    }
  }, [imageDimensions]);

  // Handle pointer on rendered image
  const handlePointerInteraction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageRef.current || !imageDimensions) return;
    const rect = imageRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const renderedWidth = rect.width;
    const renderedHeight = rect.height;

    if (renderedWidth <= 0 || renderedHeight <= 0) return;

    // Calculate exact native ratio
    const trueX = Math.round((clientX / renderedWidth) * imageDimensions.width);
    const trueY = Math.round((clientY / renderedHeight) * imageDimensions.height);

    samplePixelAt(trueX, trueY);
  };

  const handleCopyCoords = () => {
    if (!pickedPoint) return;
    navigator.clipboard.writeText(`${pickedPoint.x} x ${pickedPoint.y}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleCopyColor = () => {
    if (!pickedPoint) return;
    navigator.clipboard.writeText(pickedPoint.hexColor);
    setCopiedColor(true);
    setTimeout(() => setCopiedColor(false), 2000);
  };

  const handleSetSoru = () => {
    if (!pickedPoint || !onAssignSoru) return;
    onAssignSoru({ x: pickedPoint.x, y: pickedPoint.y }, pickedPoint.hexColor);
    setAssignedNotice('Assigned to Soru coordinates & color ✓');
    setTimeout(() => setAssignedNotice(null), 2500);
  };

  const handleSetPortal = () => {
    if (!pickedPoint || !onAssignPortal) return;
    onAssignPortal({ x: pickedPoint.x, y: pickedPoint.y }, pickedPoint.hexColor);
    setAssignedNotice('Assigned to Portal x coordinates & color ✓');
    setTimeout(() => setAssignedNotice(null), 2500);
  };

  const handleInsertEditor = () => {
    if (!pickedPoint || !onInsertToEditor) return;
    onInsertToEditor(pickedPoint.x, pickedPoint.y, pickedPoint.hexColor);
    setAssignedNotice('Inserted tap routine into editor ✓');
    setTimeout(() => setAssignedNotice(null), 2500);
  };

  return (
    <div className={`font-mono text-xs select-text space-y-3 bg-[var(--bg-primary)] ${
      isModal
        ? 'p-3.5 border-2 border-[var(--border-strong)] shadow-2xl max-w-lg w-full max-h-[92dvh] overflow-y-auto'
        : 'p-2.5 border border-dashed border-[var(--border-strong)] my-2 w-full'
    }`}>
      {/* 1. Single-Line Responsive ASCII Section Header */}
      <AsciiHeader title="Screenshot_Coordinate_&_Color_Picker" char="=" />

      {/* Top Controls / File Picker */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2 select-none text-[11px]">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer font-bold text-[var(--text-primary)] hover:underline border border-[var(--border-strong)] py-1.5 px-2.5 whitespace-nowrap shrink-0"
          >
            [ upload screenshot ]
          </button>

          {imageSrc && (
            <button
              onClick={handleClearImage}
              className="cursor-pointer text-rose-500 hover:underline py-1.5 px-2 whitespace-nowrap shrink-0"
            >
              [ clear image ]
            </button>
          )}
        </div>

        {/* Zoom Mode Selector */}
        {imageSrc && (
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-[var(--text-muted)]">zoom:</span>
            <button
              onClick={() => setZoomLevel(1)}
              className={`cursor-pointer px-1.5 py-0.5 ${zoomLevel === 1 ? 'font-bold underline text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
            >
              [1x]
            </button>
            <button
              onClick={() => setZoomLevel(2)}
              className={`cursor-pointer px-1.5 py-0.5 ${zoomLevel === 2 ? 'font-bold underline text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
            >
              [2x zoom]
            </button>
            <button
              onClick={() => setZoomLevel(4)}
              className={`cursor-pointer px-1.5 py-0.5 ${zoomLevel === 4 ? 'font-bold underline text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
            >
              [4x zoom]
            </button>
          </div>
        )}

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold ml-auto py-1 px-1.5 whitespace-nowrap shrink-0"
          >
            [ close X ]
          </button>
        )}
      </div>

      {/* Image Resolution Tag */}
      {imageDimensions ? (
        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] px-0.5">
          <span>
            Image resolution: <strong className="text-[var(--text-primary)]">{imageDimensions.width} x {imageDimensions.height}</strong>
          </span>
          <span className="whitespace-nowrap shrink-0">100% native pixel ratio</span>
        </div>
      ) : (
        <div className="p-4 text-center border border-dashed border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] space-y-1">
          <div>-- NO SCREENSHOT LOADED --</div>
          <div className="text-[10px]">
            Tap `[ upload screenshot ]` or paste (Ctrl+V) from clipboard
          </div>
        </div>
      )}

      {/* Interactive Screenshot Canvas Container constrained to portrait max-height */}
      {imageSrc && (
        <div
          ref={containerRef}
          className="relative max-h-[45dvh] w-full overflow-auto border border-[var(--border-strong)] bg-neutral-950 p-1 cursor-crosshair touch-none"
        >
          <div
            className="relative inline-block select-none max-w-full"
            style={{
              transform: zoomLevel > 1 ? `scale(${zoomLevel})` : undefined,
              transformOrigin: 'top left'
            }}
            onPointerDown={handlePointerInteraction}
            onPointerMove={(e) => {
              if (e.buttons > 0) handlePointerInteraction(e);
            }}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Screenshot Target"
              onLoad={handleImageLoad}
              className="w-full max-h-[45dvh] object-contain block pointer-events-auto"
            />

            {/* Crosshair indicator at tapped point */}
            {pickedPoint && imageDimensions && imageRef.current && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `${(pickedPoint.x / imageDimensions.width) * 100}%`,
                  top: `${(pickedPoint.y / imageDimensions.height) * 100}%`
                }}
              >
                <div className="relative flex items-center justify-center">
                  {/* Monospace Crosshair */}
                  <div className="w-5 h-5 flex items-center justify-center text-white font-extrabold text-base drop-shadow-md select-none">
                    +
                  </div>
                  {/* Small pixel color ring */}
                  <div
                    className="absolute w-3 h-3 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: pickedPoint.hexColor }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monospace Readout & One-Tap Auto-Fill */}
      {pickedPoint && (
        <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)] text-[11px]">
          {/* Section Divider with AsciiHeader */}
          <AsciiHeader title="Picked_Point" char="=" />

          <div className="space-y-2 px-0.5 leading-relaxed">
            {/* Tapped Coordinates */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[var(--text-secondary)]">Tapped coordinates: </span>
                <strong className="text-[var(--text-primary)] font-bold">
                  {pickedPoint.x} x {pickedPoint.y}
                </strong>
              </div>
              <button
                onClick={handleCopyCoords}
                className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline py-1 px-1.5 whitespace-nowrap shrink-0"
              >
                [ {copiedCoords ? 'copied!' : 'copy'} ]
              </button>
            </div>

            {/* Tapped Pixel Color */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-secondary)]">Tapped pixel color: </span>
                <strong className="text-[var(--text-primary)] font-bold">
                  ({pickedPoint.hexColor})
                </strong>
                <span
                  className="w-4 h-4 border border-[var(--border-strong)] inline-block shadow-2xs shrink-0"
                  style={{ backgroundColor: pickedPoint.hexColor }}
                />
              </div>
              <button
                onClick={handleCopyColor}
                className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline py-1 px-1.5 whitespace-nowrap shrink-0"
              >
                [ {copiedColor ? 'copied!' : 'copy'} ]
              </button>
            </div>
          </div>

          {/* Inline notification if assigned */}
          {assignedNotice && (
            <div className="text-emerald-600 dark:text-emerald-400 font-bold px-0.5 text-[10px]">
              ✓ {assignedNotice}
            </div>
          )}

          {/* Quick One-Tap Assignment Buttons with clean wrapping and padding */}
          <div className="pt-1.5 flex flex-wrap gap-2 text-[10px] font-mono">
            {onAssignSoru && (
              <button
                onClick={handleSetSoru}
                className="cursor-pointer py-1.5 px-2.5 border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors font-bold whitespace-nowrap shrink-0"
              >
                [ set as Soru coords &amp; color ]
              </button>
            )}

            {onAssignPortal && (
              <button
                onClick={handleSetPortal}
                className="cursor-pointer py-1.5 px-2.5 border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors font-bold whitespace-nowrap shrink-0"
              >
                [ set as Portal x coords &amp; color ]
              </button>
            )}

            {onInsertToEditor && (
              <button
                onClick={handleInsertEditor}
                className="cursor-pointer py-1.5 px-2.5 border border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
              >
                [ + insert tap({pickedPoint.x}, {pickedPoint.y}) to script ]
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
