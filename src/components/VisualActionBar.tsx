import React, { useState } from 'react';
import { MacroLanguage } from '../types/macro';

interface VisualActionBarProps {
  language: MacroLanguage;
  onInsertCode: (snippet: string) => void;
}

export const VisualActionBar: React.FC<VisualActionBarProps> = ({
  language,
  onInsertCode
}) => {
  const [activeModal, setActiveModal] = useState<'tap' | 'hold' | 'swipe' | 'wait' | 'loop' | null>(null);

  // Form states
  const [tapX, setTapX] = useState<number>(200);
  const [tapY, setTapY] = useState<number>(450);

  const [holdX, setHoldX] = useState<number>(200);
  const [holdY, setHoldY] = useState<number>(450);
  const [holdMs, setHoldMs] = useState<number>(500);

  const [swipeX1, setSwipeX1] = useState<number>(195);
  const [swipeY1, setSwipeY1] = useState<number>(680);
  const [swipeX2, setSwipeX2] = useState<number>(195);
  const [swipeY2, setSwipeY2] = useState<number>(240);
  const [swipeMs, setSwipeMs] = useState<number>(300);

  const [waitMs, setWaitMs] = useState<number>(250);
  const [loopCount, setLoopCount] = useState<number>(5);

  const generateSnippet = (type: 'tap' | 'hold' | 'swipe' | 'wait' | 'loop'): string => {
    switch (type) {
      case 'tap':
        if (language === 'luau') return `tap(${tapX}, ${tapY})\n`;
        if (language === 'kotlin') return `// Native Tap\ndispatchTap(service, ${tapX}f, ${tapY}f)\n`;
        if (language === 'cpp') return `emit_tap(fd, ${tapX}, ${tapY}, 30000);\n`;
        return `await tap(${tapX}, ${tapY});\n`;

      case 'hold':
        if (language === 'luau') return `hold(${holdX}, ${holdY}, ${holdMs})\n`;
        if (language === 'kotlin') return `// Native Long-Press\nexecuteLongPress(service, ${holdX}f, ${holdY}f, ${holdMs}L)\n`;
        if (language === 'cpp') return `perform_hold(fd, ${holdX}, ${holdY}, ${holdMs});\n`;
        return `await hold(${holdX}, ${holdY}, ${holdMs});\n`;

      case 'swipe':
        if (language === 'luau') return `swipe(${swipeX1}, ${swipeY1}, ${swipeX2}, ${swipeY2}, ${swipeMs})\n`;
        if (language === 'kotlin') return `// Native Swipe Gesture\nexecuteSwipe(service, ${swipeX1}f, ${swipeY1}f, ${swipeX2}f, ${swipeY2}f, ${swipeMs}L)\n`;
        if (language === 'cpp') return `smooth_swipe(fd, ${swipeX1}, ${swipeY1}, ${swipeX2}, ${swipeY2}, 25);\n`;
        return `await swipe(${swipeX1}, ${swipeY1}, ${swipeX2}, ${swipeY2}, ${swipeMs});\n`;

      case 'wait':
        if (language === 'luau') return `wait(${waitMs})\n`;
        if (language === 'kotlin') return `delay(${waitMs}L)\n`;
        if (language === 'cpp') return `usleep(${waitMs * 1000}); // ${waitMs}ms\n`;
        return `await wait(${waitMs});\n`;

      case 'loop':
        if (language === 'luau') return `for i = 1, ${loopCount} do\n  tap(200, 450)\n  wait(100)\nend\n`;
        if (language === 'kotlin') return `repeat(${loopCount}) {\n  dispatchTap(service, 200f, 450f)\n  delay(100L)\n}\n`;
        if (language === 'cpp') return `for (int i = 0; i < ${loopCount}; ++i) {\n  emit_tap(fd, 200, 450, 25000);\n  usleep(100000);\n}\n`;
        return `await loop(${loopCount}, async (i) => {\n  await tap(200, 450);\n  await wait(100);\n});\n`;
    }
  };

  const handleConfirmInsert = (type: 'tap' | 'hold' | 'swipe' | 'wait' | 'loop') => {
    const snippet = generateSnippet(type);
    onInsertCode(snippet);
    setActiveModal(null);
  };

  return (
    <>
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] font-mono text-xs select-none">
        <span className="text-[10px] text-[var(--text-muted)] shrink-0 mr-1">
          ACTIONS:
        </span>

        {/* Tap */}
        <button
          onClick={() => setActiveModal('tap')}
          className="min-h-[40px] px-2 py-1 text-[11px] text-[var(--text-primary)] hover:underline border border-transparent hover:border-[var(--border-subtle)] shrink-0 transition-all cursor-pointer"
        >
          [ + Tap ]
        </button>

        {/* Hold */}
        <button
          onClick={() => setActiveModal('hold')}
          className="min-h-[40px] px-2 py-1 text-[11px] text-[var(--text-primary)] hover:underline border border-transparent hover:border-[var(--border-subtle)] shrink-0 transition-all cursor-pointer"
        >
          [ + Hold ]
        </button>

        {/* Swipe */}
        <button
          onClick={() => setActiveModal('swipe')}
          className="min-h-[40px] px-2 py-1 text-[11px] text-[var(--text-primary)] hover:underline border border-transparent hover:border-[var(--border-subtle)] shrink-0 transition-all cursor-pointer"
        >
          [ + Swipe ]
        </button>

        {/* Wait */}
        <button
          onClick={() => setActiveModal('wait')}
          className="min-h-[40px] px-2 py-1 text-[11px] text-[var(--text-primary)] hover:underline border border-transparent hover:border-[var(--border-subtle)] shrink-0 transition-all cursor-pointer"
        >
          [ + Wait ]
        </button>

        {/* Loop */}
        <button
          onClick={() => setActiveModal('loop')}
          className="min-h-[40px] px-2 py-1 text-[11px] text-[var(--text-primary)] hover:underline border border-transparent hover:border-[var(--border-subtle)] shrink-0 transition-all cursor-pointer"
        >
          [ + Loop ]
        </button>
      </div>

      {/* Retro Typewriter Parameter Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs animate-in fade-in duration-100 font-mono text-xs">
          <div className="w-full max-w-sm bg-[var(--bg-primary)] border-2 border-[var(--border-strong)] p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5">
              <span className="font-bold text-[var(--text-primary)] uppercase">
                :: CONFIGURE_{activeModal.toUpperCase()} ::
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold"
              >
                [X]
              </button>
            </div>

            {activeModal === 'tap' && (
              <div className="space-y-2 py-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">x coordinate:</span>
                  <div className="flex items-center gap-1">
                    <span>[</span>
                    <input
                      type="number"
                      value={tapX}
                      onChange={(e) => setTapX(Number(e.target.value))}
                      className="w-16 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)] font-mono"
                    />
                    <span>]</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">y coordinate:</span>
                  <div className="flex items-center gap-1">
                    <span>[</span>
                    <input
                      type="number"
                      value={tapY}
                      onChange={(e) => setTapY(Number(e.target.value))}
                      className="w-16 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)] font-mono"
                    />
                    <span>]</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'hold' && (
              <div className="space-y-2 py-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">coordinates:</span>
                  <div className="flex items-center gap-1">
                    <span>[</span>
                    <input
                      type="number"
                      value={holdX}
                      onChange={(e) => setHoldX(Number(e.target.value))}
                      className="w-14 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)] font-mono"
                    />
                    <span>] x [</span>
                    <input
                      type="number"
                      value={holdY}
                      onChange={(e) => setHoldY(Number(e.target.value))}
                      className="w-14 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)] font-mono"
                    />
                    <span>]</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">hold duration (ms):</span>
                  <div className="flex items-center gap-1">
                    <span>[</span>
                    <input
                      type="number"
                      value={holdMs}
                      onChange={(e) => setHoldMs(Number(e.target.value))}
                      className="w-16 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)] font-mono"
                    />
                    <span>]</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'swipe' && (
              <div className="space-y-2 py-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">start (x1, y1):</span>
                  <div className="flex items-center gap-1">
                    <span>[</span>
                    <input
                      type="number"
                      value={swipeX1}
                      onChange={(e) => setSwipeX1(Number(e.target.value))}
                      className="w-12 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)]"
                    />
                    <span>,</span>
                    <input
                      type="number"
                      value={swipeY1}
                      onChange={(e) => setSwipeY1(Number(e.target.value))}
                      className="w-12 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)]"
                    />
                    <span>]</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">end (x2, y2):</span>
                  <div className="flex items-center gap-1">
                    <span>[</span>
                    <input
                      type="number"
                      value={swipeX2}
                      onChange={(e) => setSwipeX2(Number(e.target.value))}
                      className="w-12 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)]"
                    />
                    <span>,</span>
                    <input
                      type="number"
                      value={swipeY2}
                      onChange={(e) => setSwipeY2(Number(e.target.value))}
                      className="w-12 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)]"
                    />
                    <span>]</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">duration (ms):</span>
                  <div className="flex items-center gap-1">
                    <span>[</span>
                    <input
                      type="number"
                      value={swipeMs}
                      onChange={(e) => setSwipeMs(Number(e.target.value))}
                      className="w-16 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)]"
                    />
                    <span>]</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'wait' && (
              <div className="flex items-center justify-between py-2 text-[11px]">
                <span className="text-[var(--text-secondary)]">wait delay (ms):</span>
                <div className="flex items-center gap-1">
                  <span>[</span>
                  <input
                    type="number"
                    value={waitMs}
                    onChange={(e) => setWaitMs(Number(e.target.value))}
                    className="w-16 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)]"
                  />
                  <span>]</span>
                </div>
              </div>
            )}

            {activeModal === 'loop' && (
              <div className="flex items-center justify-between py-2 text-[11px]">
                <span className="text-[var(--text-secondary)]">loop repeat count:</span>
                <div className="flex items-center gap-1">
                  <span>[</span>
                  <input
                    type="number"
                    value={loopCount}
                    onChange={(e) => setLoopCount(Number(e.target.value))}
                    className="w-16 px-1 py-0.5 text-center bg-transparent border-b border-[var(--border-strong)] outline-none text-[var(--text-primary)]"
                  />
                  <span>]</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setActiveModal(null)}
                className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1"
              >
                [ cancel ]
              </button>
              <button
                onClick={() => handleConfirmInsert(activeModal)}
                className="cursor-pointer font-bold border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] px-3 py-1 transition-colors"
              >
                [ INSERT CODE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
