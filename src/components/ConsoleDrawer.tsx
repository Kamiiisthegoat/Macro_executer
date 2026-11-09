import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { MacroLog } from '../types/macro';

interface ConsoleDrawerProps {
  logs: MacroLog[];
  isExecuting: boolean;
  elapsedMs: number;
  onClearLogs: () => void;
}

export const ConsoleDrawer: React.FC<ConsoleDrawerProps> = ({
  logs,
  isExecuting,
  elapsedMs,
  onClearLogs
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'gestures' | 'errors'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, isOpen]);

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[+${l.elapsedMs.toFixed(1).padStart(7, ' ')}ms] [${l.level.toUpperCase()}] ${l.message}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'gestures') {
      return log.level === 'tap' || log.level === 'swipe' || log.level === 'hold';
    }
    if (filter === 'errors') {
      return log.level === 'error' || log.level === 'warn';
    }
    return true;
  });

  return (
    <div className="bg-[#141414] border border-[#242424] rounded-lg overflow-hidden font-mono text-xs select-none shadow-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 h-9 border-b border-[#222222] bg-[#0E0E0E]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 font-bold text-[#F2F2F2] hover:text-white cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-[#737373]" />
          <span className="text-xs">Console Output</span>
          <span className="text-[10px] text-[#666666] font-normal">({logs.length})</span>
          {isOpen ? <ChevronUp className="w-3 h-3 text-[#737373]" /> : <ChevronDown className="w-3 h-3 text-[#737373]" />}
        </button>

        <div className="flex items-center gap-2 text-[11px]">
          {/* Timing Stamp */}
          <span className="text-[#A3A3A3] font-mono tabular-nums text-[10px] bg-[#171717] px-1.5 py-0.5 rounded border border-[#262626]">
            +{elapsedMs.toFixed(1)}ms {isExecuting ? '...' : ''}
          </span>

          {logs.length > 0 && (
            <>
              <button
                onClick={handleCopyLogs}
                className="text-[#737373] hover:text-[#F2F2F2] cursor-pointer p-0.5 rounded"
                title="Copy Terminal Logs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClearLogs}
                className="text-[#737373] hover:text-[#EF4444] cursor-pointer p-0.5 rounded"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Drawer content */}
      {isOpen && (
        <div className="flex flex-col">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 px-3 py-1 bg-[#121212] border-b border-[#202020] text-[10px]">
            <span className="text-[#666666]">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`cursor-pointer ${
                filter === 'all' ? 'text-[#F2F2F2] font-semibold underline' : 'text-[#737373] hover:text-[#A3A3A3]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('gestures')}
              className={`cursor-pointer ${
                filter === 'gestures' ? 'text-[#F2F2F2] font-semibold underline' : 'text-[#737373] hover:text-[#A3A3A3]'
              }`}
            >
              Gestures
            </button>
            <button
              onClick={() => setFilter('errors')}
              className={`cursor-pointer ${
                filter === 'errors' ? 'text-[#EF4444] font-semibold underline' : 'text-[#737373] hover:text-[#A3A3A3]'
              }`}
            >
              Errors
            </button>
          </div>

          {/* Log Stream */}
          <div className="h-44 overflow-y-auto p-2.5 font-mono text-[11px] leading-relaxed space-y-1 select-text bg-[#090909]">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#666666] text-center text-[10px]">
                {isExecuting
                  ? '> Processing instructions via MacroBridge...'
                  : '> Ready. Tap Execute to dispatch routine.'}
              </div>
            ) : (
              filteredLogs.map((log) => {
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-1.5 hover:bg-[#141414] px-1 py-0.5 rounded"
                  >
                    <span className="text-[#555555] shrink-0 tabular-nums text-[10px]">
                      +{log.elapsedMs.toFixed(1)}ms
                    </span>

                    <span
                      className={`font-semibold shrink-0 uppercase text-[10px] ${
                        log.level === 'tap' || log.level === 'swipe' || log.level === 'hold'
                          ? 'text-cyan-400'
                          : log.level === 'wait'
                          ? 'text-emerald-400'
                          : log.level === 'error' || log.level === 'warn'
                          ? 'text-[#EF4444]'
                          : log.level === 'success'
                          ? 'text-emerald-400 font-bold'
                          : 'text-[#D1D1D1]'
                      }`}
                    >
                      [{log.level}]
                    </span>

                    <span className="text-[#E0E0E0] break-all">
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};
