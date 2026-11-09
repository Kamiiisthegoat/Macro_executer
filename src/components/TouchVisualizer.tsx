import React, { useState, useRef } from 'react';
import { TouchEventMarker } from '../types/macro';

interface TouchVisualizerProps {
  events: TouchEventMarker[];
  onInsertCoordinate?: (x: number, y: number) => void;
  isExecuting?: boolean;
}

export const TouchVisualizer: React.FC<TouchVisualizerProps> = ({
  events,
  onInsertCoordinate,
  isExecuting = false
}) => {
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [selectedCoord, setSelectedCoord] = useState<{ x: number; y: number } | null>(null);
  const [backgroundMode, setBackgroundMode] = useState<'grid' | 'game' | 'app'>('grid');
  const containerRef = useRef<HTMLDivElement>(null);

  // Virtual coordinate canvas dimension
  const VIRTUAL_WIDTH = 390;
  const VIRTUAL_HEIGHT = 700;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;

    const x = Math.min(Math.max(0, Math.round(clientX * scaleX)), VIRTUAL_WIDTH);
    const y = Math.min(Math.max(0, Math.round(clientY * scaleY)), VIRTUAL_HEIGHT);

    setSelectedCoord({ x, y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;

    const x = Math.min(Math.max(0, Math.round(clientX * scaleX)), VIRTUAL_WIDTH);
    const y = Math.min(Math.max(0, Math.round(clientY * scaleY)), VIRTUAL_HEIGHT);

    setHoverCoord({ x, y });
  };

  const handlePointerLeave = () => {
    setHoverCoord(null);
  };

  const recentEvents = events.filter((e) => Date.now() - e.timestamp < 3500);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] border border-[var(--border-strong)] font-mono text-xs select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px]">
        <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold">
          <span>:: TOUCH_SENSOR_CANVAS ::</span>
          <span className="text-[10px] text-[var(--text-muted)]">[390x700]</span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 text-[10px]">
          <button
            onClick={() => setBackgroundMode('grid')}
            className={`cursor-pointer px-1 py-0.5 ${
              backgroundMode === 'grid'
                ? 'font-bold text-[var(--text-primary)] underline'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            [grid]
          </button>
          <button
            onClick={() => setBackgroundMode('game')}
            className={`cursor-pointer px-1 py-0.5 ${
              backgroundMode === 'game'
                ? 'font-bold text-[var(--text-primary)] underline'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            [game]
          </button>
          <button
            onClick={() => setBackgroundMode('app')}
            className={`cursor-pointer px-1 py-0.5 ${
              backgroundMode === 'app'
                ? 'font-bold text-[var(--text-primary)] underline'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            [app]
          </button>
        </div>
      </div>

      {/* Screen Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center p-2 min-h-[350px] bg-[var(--bg-primary)]">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative w-full max-w-[320px] aspect-[390/700] border-2 border-[var(--border-strong)] bg-neutral-950 overflow-hidden cursor-crosshair touch-none shadow-md"
        >
          {/* Simulated Retro Monospace Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-5 px-2 flex items-center justify-between text-[9px] text-neutral-400 bg-neutral-900/90 font-mono z-20 pointer-events-none border-b border-neutral-800">
            <span>[12:00:00]</span>
            <span>-- TARGET_DISPLAY --</span>
            <span>[5G 100%]</span>
          </div>

          {/* Grid Background */}
          {backgroundMode === 'grid' && (
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #4ade80 1px, transparent 1px),
                  linear-gradient(to bottom, #4ade80 1px, transparent 1px)
                `,
                backgroundSize: '39px 35px'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-[10px] font-mono">
                + [TAP TO PICK COORD] +
              </div>
            </div>
          )}

          {/* Simulated Game HUD */}
          {backgroundMode === 'game' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 pt-7 text-neutral-200 font-mono text-[10px]">
              <div className="border border-neutral-800 p-1.5 bg-neutral-900/80">
                <div className="flex justify-between">
                  <span>HP: 8500/10000</span>
                  <span className="text-amber-400">LVL 85</span>
                </div>
                <div className="w-full h-1 bg-neutral-800 mt-1">
                  <div className="w-3/4 h-full bg-emerald-500" />
                </div>
              </div>

              {/* Target enemy */}
              <div className="my-auto mx-auto text-center text-rose-400 border border-dashed border-rose-500/50 p-2 bg-rose-950/20">
                <div>[ + TARGET_ENEMY + ]</div>
                <div className="text-[9px] text-neutral-400">(195, 350)</div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-end pb-2">
                <div className="border border-neutral-700 p-2 text-center text-neutral-400">
                  [D-PAD]
                </div>
                <div className="space-y-1 text-right">
                  <div className="border border-cyan-500/80 px-2 py-1 text-cyan-300 inline-block mr-1">
                    [SORU:185,450]
                  </div>
                  <div className="border border-amber-500/80 px-2 py-1 text-amber-300 inline-block">
                    [PORTAL:240,680]
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simulated App UI */}
          {backgroundMode === 'app' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 pt-7 text-neutral-300 font-mono text-[10px]">
              <div className="space-y-2 border border-neutral-800 p-2 bg-neutral-900/60">
                <div className="text-neutral-400">=== APP_CONTAINER ===</div>
                <div className="border border-neutral-700 p-1.5 flex justify-between">
                  <span>ITEM_ID #4092</span>
                  <span className="text-emerald-400">$49.00</span>
                </div>
              </div>

              <div className="border border-neutral-800 p-2 text-center text-neutral-400">
                [NAV: HOME · SEARCH · SETTINGS]
              </div>
            </div>
          )}

          {/* Render Active Events */}
          {recentEvents.map((event) => {
            const leftPct = (event.x / VIRTUAL_WIDTH) * 100;
            const topPct = (event.y / VIRTUAL_HEIGHT) * 100;

            if (event.type === 'tap') {
              return (
                <div
                  key={event.id}
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border border-cyan-400 animate-ping" />
                    <div className="absolute w-2 h-2 bg-cyan-400" />
                    <span className="mt-4 px-1 py-0.2 bg-black text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500">
                      ({event.x},{event.y})
                    </span>
                  </div>
                </div>
              );
            }

            if (event.type === 'hold') {
              return (
                <div
                  key={event.id}
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-2 border-amber-400 animate-pulse" />
                    <div className="absolute w-3 h-3 bg-amber-400" />
                    <span className="mt-5 px-1 py-0.2 bg-black text-[9px] font-mono text-amber-300 border border-amber-500">
                      HOLD {event.durationMs || 300}ms
                    </span>
                  </div>
                </div>
              );
            }

            if (event.type === 'swipe' && event.x2 !== undefined && event.y2 !== undefined) {
              return (
                <svg
                  key={event.id}
                  className="absolute inset-0 w-full h-full pointer-events-none z-30"
                  viewBox={`0 0 ${VIRTUAL_WIDTH} ${VIRTUAL_HEIGHT}`}
                >
                  <line
                    x1={event.x}
                    y1={event.y}
                    x2={event.x2}
                    y2={event.y2}
                    stroke="#a855f7"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                  />
                  <circle cx={event.x} cy={event.y} r="4" fill="#38bdf8" />
                  <circle cx={event.x2} cy={event.y2} r="4" fill="#a855f7" />
                </svg>
              );
            }

            return null;
          })}

          {/* Selected Pin */}
          {selectedCoord && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
              style={{
                left: `${(selectedCoord.x / VIRTUAL_WIDTH) * 100}%`,
                top: `${(selectedCoord.y / VIRTUAL_HEIGHT) * 100}%`
              }}
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-white border border-black" />
                <div className="mt-2 flex items-center gap-1 bg-black text-white px-1.5 py-0.5 border border-white text-[10px] font-mono whitespace-nowrap">
                  <span>({selectedCoord.x}, {selectedCoord.y})</span>
                  {onInsertCoordinate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsertCoordinate(selectedCoord.x, selectedCoord.y);
                        setSelectedCoord(null);
                      }}
                      className="cursor-pointer text-cyan-300 hover:underline font-bold"
                    >
                      [+USE]
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Readout */}
      <div className="px-2.5 py-1 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
        <div>
          {hoverCoord ? (
            <span>
              POINTER: X:[{hoverCoord.x}] Y:[{hoverCoord.y}]
            </span>
          ) : (
            <span>TAP SCREEN TO SAMPLE COORDINATE</span>
          )}
        </div>
        <div className="text-[var(--text-muted)]">
          {isExecuting ? '[ EXECUTING GESTURES ]' : '[ IDLE ]'}
        </div>
      </div>
    </div>
  );
};
