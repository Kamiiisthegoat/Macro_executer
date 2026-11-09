import React, { useState, useRef, useEffect } from 'react';
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
    <div className="border-t border-[var(--border-strong)] bg-[var(--terminal-bg)] font-mono text-xs select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 h-10 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 font-bold text-[var(--text-primary)] hover:underline cursor-pointer"
        >
          <span>{isOpen ? '[-]' : '[+]'}</span>
          <span>terminal.log ({logs.length})</span>
        </button>

        <div className="flex items-center gap-2 text-[11px]">
          {/* Timing Stamp */}
          <span className="text-[var(--text-primary)] font-bold tabular-nums">
            [ +{elapsedMs.toFixed(1)}ms {isExecuting ? '...' : ''} ]
          </span>

          {logs.length > 0 && (
            <>
              <button
                onClick={handleCopyLogs}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer"
              >
                [ {copied ? 'copied!' : 'copy'} ]
              </button>

              <button
                onClick={onClearLogs}
                className="text-[var(--text-muted)] hover:text-rose-500 hover:underline cursor-pointer"
              >
                [ clear ]
              </button>
            </>
          )}
        </div>
      </div>

      {/* Drawer content */}
      {isOpen && (
        <div className="flex flex-col">
          {/* Minimal text filter bar */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] text-[10px]">
            <span className="text-[var(--text-muted)]">filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`cursor-pointer ${
                filter === 'all'
                  ? 'font-bold text-[var(--text-primary)] underline'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              all
            </button>
            <span>/</span>
            <button
              onClick={() => setFilter('gestures')}
              className={`cursor-pointer ${
                filter === 'gestures'
                  ? 'font-bold text-[var(--text-primary)] underline'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              gestures
            </button>
            <span>/</span>
            <button
              onClick={() => setFilter('errors')}
              className={`cursor-pointer ${
                filter === 'errors'
                  ? 'font-bold text-[var(--text-primary)] underline'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              errors
            </button>
          </div>

          {/* Log Stream */}
          <div className="h-40 overflow-y-auto p-2.5 font-mono text-[11px] leading-relaxed space-y-1 select-text bg-[var(--terminal-bg)]">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-center text-[10px]">
                {isExecuting
                  ? '&gt; processing routine instructions...'
                  : '&gt; status: ready. [ run ] to execute script.'}
              </div>
            ) : (
              filteredLogs.map((log) => {
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-1.5 hover:bg-[var(--bg-surface)] px-1 py-0.5 rounded-xs"
                  >
                    <span className="text-[var(--text-muted)] shrink-0 tabular-nums text-[10px]">
                      +{log.elapsedMs.toFixed(1)}ms
                    </span>

                    <span
                      className={`font-bold shrink-0 uppercase text-[10px] ${
                        log.level === 'tap' || log.level === 'swipe' || log.level === 'hold'
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : log.level === 'wait'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : log.level === 'error' || log.level === 'warn'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      [{log.level}]
                    </span>

                    <span className="text-[var(--text-primary)] break-all">
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
