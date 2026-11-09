import React, { useState } from 'react';
import { Play, Square, X, GripVertical, Activity } from 'lucide-react';

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
      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#141414] text-[#F2F2F2] border border-[#242424] shadow-2xl backdrop-blur-md">
        {/* Drag handle */}
        <div
          onPointerDown={handlePointerDown}
          className="cursor-grab active:cursor-grabbing p-1 text-[#737373] hover:text-[#F2F2F2]"
          title="Drag Floating Controller"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#0E0E0E] border border-[#222222] text-[10px] font-mono">
          <Activity className={`w-3 h-3 ${isExecuting ? 'text-emerald-400 animate-pulse' : 'text-[#737373]'}`} />
          <span className={isExecuting ? 'text-emerald-400 font-bold' : 'text-[#A3A3A3]'}>
            {isExecuting ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* Run / Stop action button */}
        {isExecuting ? (
          <button
            onClick={onStop}
            className="min-h-[32px] min-w-[32px] px-2.5 flex items-center justify-center rounded-md bg-[#EF4444]/20 border border-[#EF4444]/60 text-[#EF4444] font-semibold text-xs cursor-pointer transition-colors shadow-xs"
            title="Stop Macro Execution"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        ) : (
          <button
            onClick={onRun}
            className="min-h-[32px] min-w-[32px] px-2.5 flex items-center justify-center rounded-md bg-[#222222] hover:bg-[#2A2A2A] border border-[#383838] text-[#F2F2F2] font-semibold text-xs cursor-pointer transition-colors shadow-xs"
            title="Run Macro via Floating Overlay"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {/* Close Widget */}
        <button
          onClick={onClose}
          className="min-h-[28px] min-w-[28px] flex items-center justify-center rounded text-[#737373] hover:text-[#F2F2F2] cursor-pointer"
          title="Dismiss Overlay Widget"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
