import React, { useState, useRef, useEffect } from 'react';
import { Upload, Crosshair, Copy, Check, X, ZoomIn } from 'lucide-react';

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

  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
  }, []);

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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    setImageDimensions({ width, height });

    if (offscreenCanvasRef.current) {
      const canvas = offscreenCanvasRef.current;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
    }
  };

  const handlePointerInteraction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageRef.current || !imageDimensions || !offscreenCanvasRef.current) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (clientX < 0 || clientX > rect.width || clientY < 0 || clientY > rect.height) {
      return;
    }

    const trueX = Math.round((clientX / rect.width) * imageDimensions.width);
    const trueY = Math.round((clientY / rect.height) * imageDimensions.height);

    const clampedX = Math.max(0, Math.min(imageDimensions.width - 1, trueX));
    const clampedY = Math.max(0, Math.min(imageDimensions.height - 1, trueY));

    let hexColor = '#FFFFFF';
    try {
      const canvas = offscreenCanvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const pixel = ctx.getImageData(clampedX, clampedY, 1, 1).data;
        const r = pixel[0].toString(16).padStart(2, '0').toUpperCase();
        const g = pixel[1].toString(16).padStart(2, '0').toUpperCase();
        const b = pixel[2].toString(16).padStart(2, '0').toUpperCase();
        hexColor = `#${r}${g}${b}`;
      }
    } catch {
      hexColor = '#FFFFFF';
    }

    setPickedPoint({
      x: clampedX,
      y: clampedY,
      hexColor
    });
    setAssignedNotice(null);
  };

  const handleCopyCoords = () => {
    if (!pickedPoint) return;
    navigator.clipboard.writeText(`${pickedPoint.x}, ${pickedPoint.y}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleCopyColor = () => {
    if (!pickedPoint) return;
    navigator.clipboard.writeText(pickedPoint.hexColor);
    setCopiedColor(true);
    setTimeout(() => setCopiedColor(false), 2000);
  };

  const handleAssignSoru = () => {
    if (!pickedPoint || !onAssignSoru) return;
    onAssignSoru({ x: pickedPoint.x, y: pickedPoint.y }, pickedPoint.hexColor);
    setAssignedNotice('Assigned to Soru fields ✓');
    setTimeout(() => setAssignedNotice(null), 3000);
  };

  const handleAssignPortal = () => {
    if (!pickedPoint || !onAssignPortal) return;
    onAssignPortal({ x: pickedPoint.x, y: pickedPoint.y }, pickedPoint.hexColor);
    setAssignedNotice('Assigned to Portal fields ✓');
    setTimeout(() => setAssignedNotice(null), 3000);
  };

  const handleInsertEditor = () => {
    if (!pickedPoint || !onInsertToEditor) return;
    onInsertToEditor(pickedPoint.x, pickedPoint.y, pickedPoint.hexColor);
    setAssignedNotice('Inserted into routine editor ✓');
    setTimeout(() => setAssignedNotice(null), 3000);
  };

  return (
    <div className="w-full bg-[#141414] border border-[#242424] rounded-lg p-3 space-y-3 font-sans text-xs select-text shadow-xl">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Control Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#222222] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer px-2.5 py-1.5 rounded-md border border-[#333333] bg-[#1C1C1C] hover:bg-[#242424] text-[#F2F2F2] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Screenshot</span>
          </button>

          {imageSrc && (
            <div className="flex items-center gap-1 bg-[#0E0E0E] border border-[#222222] rounded p-0.5 text-[10px]">
              <button
                onClick={() => setZoomLevel(1)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${zoomLevel === 1 ? 'bg-[#222222] text-[#F2F2F2] font-bold' : 'text-[#737373]'}`}
              >
                1x
              </button>
              <button
                onClick={() => setZoomLevel(2)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${zoomLevel === 2 ? 'bg-[#222222] text-[#F2F2F2] font-bold' : 'text-[#737373]'}`}
              >
                2x
              </button>
              <button
                onClick={() => setZoomLevel(4)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${zoomLevel === 4 ? 'bg-[#222222] text-[#F2F2F2] font-bold' : 'text-[#737373]'}`}
              >
                4x
              </button>
            </div>
          )}
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="cursor-pointer text-[#737373] hover:text-[#F2F2F2] p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Image Resolution Badge */}
      {imageDimensions ? (
        <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono px-0.5">
          <span>
            Native Resolution: <strong className="text-[#F2F2F2]">{imageDimensions.width} × {imageDimensions.height}</strong>
          </span>
          <span className="text-emerald-400">100% pixel accurate</span>
        </div>
      ) : (
        <div className="p-4 text-center border border-dashed border-[#242424] rounded-md text-xs text-[#737373] space-y-1">
          <div>No screenshot loaded yet</div>
          <div className="text-[10px] text-[#555555]">
            Upload any screenshot or press Ctrl+V to paste from clipboard
          </div>
        </div>
      )}

      {/* Interactive Screenshot Canvas */}
      {imageSrc && (
        <div
          ref={containerRef}
          className="relative max-h-[45dvh] w-full overflow-auto border border-[#2A2A2A] rounded-md bg-[#080808] p-1 cursor-crosshair touch-none"
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
                  <div className="w-5 h-5 flex items-center justify-center text-white font-extrabold text-base drop-shadow-md select-none">
                    +
                  </div>
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
        <div className="space-y-2 pt-2 border-t border-[#222222] text-xs">
          <div className="bg-[#0E0E0E] border border-[#222222] rounded-md p-2.5 space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#737373]">Coords: </span>
                <strong className="text-[#F2F2F2]">
                  {pickedPoint.x} × {pickedPoint.y}
                </strong>
              </div>
              <button
                onClick={handleCopyCoords}
                className="cursor-pointer text-[#737373] hover:text-[#F2F2F2] text-[11px] px-1.5 py-0.5 rounded border border-[#242424]"
              >
                {copiedCoords ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#737373]">Color: </span>
                <strong className="text-[#F2F2F2]">{pickedPoint.hexColor}</strong>
                <span
                  className="w-3.5 h-3.5 rounded-sm border border-[#383838] inline-block"
                  style={{ backgroundColor: pickedPoint.hexColor }}
                />
              </div>
              <button
                onClick={handleCopyColor}
                className="cursor-pointer text-[#737373] hover:text-[#F2F2F2] text-[11px] px-1.5 py-0.5 rounded border border-[#242424]"
              >
                {copiedColor ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {assignedNotice && (
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 font-mono text-[11px]">
              {assignedNotice}
            </div>
          )}

          {/* Auto-Assignment Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {onAssignSoru && (
              <button
                onClick={handleAssignSoru}
                className="cursor-pointer py-1.5 px-2 rounded-md border border-[#333333] bg-[#1A1A1A] hover:bg-[#222222] text-[#F2F2F2] font-semibold text-xs text-center transition-colors"
              >
                Set as Soru Coords &amp; Color
              </button>
            )}

            {onAssignPortal && (
              <button
                onClick={handleAssignPortal}
                className="cursor-pointer py-1.5 px-2 rounded-md border border-[#333333] bg-[#1A1A1A] hover:bg-[#222222] text-[#F2F2F2] font-semibold text-xs text-center transition-colors"
              >
                Set as Portal Coords &amp; Color
              </button>
            )}

            {onInsertToEditor && (
              <button
                onClick={handleInsertEditor}
                className="cursor-pointer py-1.5 px-2 rounded-md border border-emerald-600/60 bg-emerald-500/20 text-emerald-400 font-semibold text-xs text-center transition-colors col-span-full"
              >
                Insert Tap({pickedPoint.x}, {pickedPoint.y}) into Routine
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
