import React, { useState } from 'react';
import { Play, Square, X, GripVertical, Smartphone } from 'lucide-react';

interface FloatingWidgetSimulatorProps {
  isVisible: boolean;
  isExecuting: boolean;
  onRun: () => void;
  onStop: () => void;
  onClose: () => void;
}

export const FloatingWidgetSimulator: React.FC<FloatingWidgetSimulatorProps> = ({
  isVisible,
  isExecuting,
  onRun,
  onStop,
  onClose
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 120 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!isVisible) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 180, e.clientX - dragOffset.x)),
      y: Math.max(10, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y))
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 select-none touch-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/90 text-white border border-cyan-500/40 shadow-2xl backdrop-blur-md">
        {/* Drag handle */}
        <div
          onPointerDown={handlePointerDown}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-white"
          title="Drag Floating Widget"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono">
          <Smartphone className="w-3 h-3 text-cyan-400" />
          <span>{isExecuting ? 'ACTIVE' : 'READY'}</span>
        </div>

        {/* Run / Stop action button */}
        {isExecuting ? (
          <button
            onClick={onStop}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-colors shadow-xs"
            title="Stop Macro Execution"
          >
            <Square className="w-4 h-4 fill-white" />
          </button>
        ) : (
          <button
            onClick={onRun}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer transition-colors shadow-xs"
            title="Run Macro via Overlay"
          >
            <Play className="w-4 h-4 fill-slate-950" />
          </button>
        )}

        {/* Close Widget */}
        <button
          onClick={onClose}
          className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white cursor-pointer"
          title="Dismiss Overlay Widget"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
