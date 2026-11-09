import React, { useState } from 'react';
import { Touchpad, Hand, Move, Clock, Repeat, Plus } from 'lucide-react';
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
        if (language === 'kotlin') return `MacroAccessibilityService.tap(${tapX}f, ${tapY}f, 50L)\n`;
        if (language === 'cpp') return `nativeTap(${tapX}f, ${tapY}f, 30);\n`;
        return `await tap(${tapX}, ${tapY});\n`;

      case 'hold':
        if (language === 'luau') return `hold(${holdX}, ${holdY}, ${holdMs})\n`;
        if (language === 'kotlin') return `MacroAccessibilityService.tap(${holdX}f, ${holdY}f, ${holdMs}L)\n`;
        if (language === 'cpp') return `nativeTap(${holdX}f, ${holdY}f, ${holdMs});\n`;
        return `await hold(${holdX}, ${holdY}, ${holdMs});\n`;

      case 'swipe':
        if (language === 'luau') return `swipe(${swipeX1}, ${swipeY1}, ${swipeX2}, ${swipeY2}, ${swipeMs})\n`;
        if (language === 'kotlin') return `MacroAccessibilityService.swipe(${swipeX1}f, ${swipeY1}f, ${swipeX2}f, ${swipeY2}f, ${swipeMs}L)\n`;
        if (language === 'cpp') return `nativeTap(${swipeX1}f, ${swipeY1}f, ${swipeMs}); // swipe(${swipeX1},${swipeY1}->${swipeX2},${swipeY2})\n`;
        return `await swipe(${swipeX1}, ${swipeY1}, ${swipeX2}, ${swipeY2}, ${swipeMs});\n`;

      case 'wait':
        if (language === 'luau') return `wait(${waitMs})\n`;
        if (language === 'kotlin') return `Thread.sleep(${waitMs}L)\n`;
        if (language === 'cpp') return `usleep(${waitMs * 1000}); // ${waitMs}ms\n`;
        return `await wait(${waitMs});\n`;

      case 'loop':
        if (language === 'luau') return `for i = 1, ${loopCount} do\n  tap(200, 450)\n  wait(100)\nend\n`;
        if (language === 'kotlin') return `repeat(${loopCount}) {\n  MacroAccessibilityService.tap(200f, 450f, 50L)\n  Thread.sleep(100L)\n}\n`;
        if (language === 'cpp') return `for (int i = 0; i < ${loopCount}; ++i) {\n  nativeTap(200.0f, 450.0f, 25);\n  usleep(100000);\n}\n`;
        return `await loop(${loopCount}, async (i) => {\n  await tap(200, 450);\n  await wait(100);\n});\n`;
    }
  };

  const handleConfirmInsert = (type: 'tap' | 'hold' | 'swipe' | 'wait' | 'loop') => {
    const snippet = generateSnippet(type);
    onInsertCode(snippet);
    setActiveModal(null);
  };

  const actions: Array<{ id: 'tap' | 'hold' | 'swipe' | 'wait' | 'loop'; label: string; icon: React.ReactNode }> = [
    { id: 'tap', label: 'Tap', icon: <Touchpad className="w-3 h-3 text-[#A3A3A3]" /> },
    { id: 'hold', label: 'Hold', icon: <Hand className="w-3 h-3 text-[#A3A3A3]" /> },
    { id: 'swipe', label: 'Swipe', icon: <Move className="w-3 h-3 text-[#A3A3A3]" /> },
    { id: 'wait', label: 'Wait', icon: <Clock className="w-3 h-3 text-[#A3A3A3]" /> },
    { id: 'loop', label: 'Loop', icon: <Repeat className="w-3 h-3 text-[#A3A3A3]" /> }
  ];

  return (
    <>
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none select-none">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => setActiveModal(act.id)}
            className="h-8 px-2.5 rounded-md border border-[#2A2A2A] bg-[#141414] hover:bg-[#1F1F1F] hover:border-[#383838] text-[#F2F2F2] text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            {act.icon}
            <span>+{act.label}</span>
          </button>
        ))}
      </div>

      {/* Parameter Configuration Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100 font-sans text-xs">
          <div className="w-full max-w-sm bg-[#141414] border border-[#242424] rounded-lg p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242424] pb-2.5">
              <span className="font-bold text-[#F2F2F2] tracking-tight uppercase text-xs">
                Configure {activeModal.toUpperCase()} Action
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="cursor-pointer text-[#737373] hover:text-[#F2F2F2] text-sm px-1"
              >
                ✕
              </button>
            </div>

            {activeModal === 'tap' && (
              <div className="space-y-2 py-1 text-xs">
                <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded p-2">
                  <span className="text-[#A3A3A3]">X coordinate:</span>
                  <input
                    type="number"
                    value={tapX}
                    onChange={(e) => setTapX(Number(e.target.value))}
                    className="w-20 px-2 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                  />
                </div>
                <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded p-2">
                  <span className="text-[#A3A3A3]">Y coordinate:</span>
                  <input
                    type="number"
                    value={tapY}
                    onChange={(e) => setTapY(Number(e.target.value))}
                    className="w-20 px-2 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                  />
                </div>
              </div>
            )}

            {activeModal === 'hold' && (
              <div className="space-y-2 py-1 text-xs">
                <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded p-2">
                  <span className="text-[#A3A3A3]">Coordinates (X, Y):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={holdX}
                      onChange={(e) => setHoldX(Number(e.target.value))}
                      className="w-16 px-1.5 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                    />
                    <span className="text-[#666666]">×</span>
                    <input
                      type="number"
                      value={holdY}
                      onChange={(e) => setHoldY(Number(e.target.value))}
                      className="w-16 px-1.5 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded p-2">
                  <span className="text-[#A3A3A3]">Hold duration (ms):</span>
                  <input
                    type="number"
                    value={holdMs}
                    onChange={(e) => setHoldMs(Number(e.target.value))}
                    className="w-20 px-2 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                  />
                </div>
              </div>
            )}

            {activeModal === 'swipe' && (
              <div className="space-y-2 py-1 text-xs">
                <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded p-2">
                  <span className="text-[#A3A3A3]">Start (X1, Y1):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={swipeX1}
                      onChange={(e) => setSwipeX1(Number(e.target.value))}
                      className="w-16 px-1.5 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                    />
                    <span className="text-[#666666]">,</span>
                    <input
                      type="number"
                      value={swipeY1}
                      onChange={(e) => setSwipeY1(Number(e.target.value))}
                      className="w-16 px-1.5 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded p-2">
                  <span className="text-[#A3A3A3]">End (X2, Y2):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={swipeX2}
                      onChange={(e) => setSwipeX2(Number(e.target.value))}
                      className="w-16 px-1.5 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                    />
                    <span className="text-[#666666]">,</span>
                    <input
                      type="number"
                      value={swipeY2}
                      onChange={(e) => setSwipeY2(Number(e.target.value))}
                      className="w-16 px-1.5 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded p-2">
                  <span className="text-[#A3A3A3]">Duration (ms):</span>
                  <input
                    type="number"
                    value={swipeMs}
                    onChange={(e) => setSwipeMs(Number(e.target.value))}
                    className="w-20 px-2 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                  />
                </div>
              </div>
            )}

            {activeModal === 'wait' && (
              <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded p-2.5">
                <span className="text-[#A3A3A3]">Wait delay (ms):</span>
                <input
                  type="number"
                  value={waitMs}
                  onChange={(e) => setWaitMs(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                />
              </div>
            )}

            {activeModal === 'loop' && (
              <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded p-2.5">
                <span className="text-[#A3A3A3]">Loop repeat count:</span>
                <input
                  type="number"
                  value={loopCount}
                  onChange={(e) => setLoopCount(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-center bg-[#141414] border border-[#2E2E2E] rounded text-[#F2F2F2] font-mono outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#242424]">
              <button
                onClick={() => setActiveModal(null)}
                className="cursor-pointer text-[#737373] hover:text-[#F2F2F2] px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmInsert(activeModal)}
                className="cursor-pointer font-semibold rounded-md border border-[#383838] bg-[#222222] hover:bg-[#2A2A2A] text-[#F2F2F2] px-3.5 py-1.5 transition-colors"
              >
                Insert Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
