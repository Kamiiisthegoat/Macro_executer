import React, { useState } from 'react';
import { MacroLanguage, MacroLog, TouchEventMarker } from '../types/macro';
import { VisualActionBar } from './VisualActionBar';
import { TouchVisualizer } from './TouchVisualizer';
import { ConsoleDrawer } from './ConsoleDrawer';
import { ScreenshotCoordinatePicker } from './ScreenshotCoordinatePicker';

interface HomeTabProps {
  currentLanguage: MacroLanguage;
  onLanguageChange: (lang: MacroLanguage) => void;
  code: string;
  onCodeChange: (newCode: string) => void;
  onRunMacro: () => void;
  onStopMacro: () => void;
  isExecuting: boolean;
  elapsedMs: number;
  logs: MacroLog[];
  onClearLogs: () => void;
  touchEvents: TouchEventMarker[];
  onResetCode: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  currentLanguage,
  onLanguageChange,
  code,
  onCodeChange,
  onRunMacro,
  onStopMacro,
  isExecuting,
  elapsedMs,
  logs,
  onClearLogs,
  touchEvents,
  onResetCode
}) => {
  const [showScreenVisualizer, setShowScreenVisualizer] = useState<boolean>(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportFile = () => {
    const extensionMap: Record<MacroLanguage, string> = {
      javascript: 'js',
      quickjs: 'js',
      luau: 'lua',
      kotlin: 'kt',
      cpp: 'cpp'
    };
    const ext = extensionMap[currentLanguage];
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `macro_routine_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInsertSnippet = (snippet: string) => {
    onCodeChange(code + (code.endsWith('\n') ? '' : '\n') + snippet);
  };

  const handleInsertCoordinate = (x: number, y: number) => {
    let snippet = '';
    if (currentLanguage === 'luau') {
      snippet = `tap(${x}, ${y})\n`;
    } else if (currentLanguage === 'kotlin') {
      snippet = `dispatchTap(service, ${x}f, ${y}f)\n`;
    } else if (currentLanguage === 'cpp') {
      snippet = `emit_tap(fd, ${x}, ${y}, 25000);\n`;
    } else {
      snippet = `await tap(${x}, ${y});\n`;
    }
    onCodeChange(code + (code.endsWith('\n') ? '' : '\n') + snippet);
  };

  const languages: Array<{ id: MacroLanguage; label: string; desc: string }> = [
    { id: 'javascript', label: 'javascript', desc: 'Web Sandbox & Worker' },
    { id: 'quickjs', label: 'quickjs', desc: 'Embedded Micro JS' },
    { id: 'luau', label: 'luau', desc: 'Typed Lua AST Simulator' },
    { id: 'kotlin', label: 'kotlin', desc: 'Android Accessibility' },
    { id: 'cpp', label: 'cpp', desc: 'NDK Native Routine' }
  ];

  const ext =
    currentLanguage === 'kotlin'
      ? 'kt'
      : currentLanguage === 'cpp'
      ? 'cpp'
      : currentLanguage === 'luau'
      ? 'lua'
      : 'js';

  return (
    <div className="flex flex-col min-h-full pb-28 font-mono text-xs select-text">
      {/* 1. Language Target Bar */}
      <div className="p-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] space-y-1.5 select-none">
        <div className="flex items-center justify-between text-[11px] px-0.5">
          <span className="text-[var(--text-muted)] uppercase tracking-wider font-bold whitespace-nowrap">
            // TARGET_RUNTIME_ENGINE:
          </span>
          <span className="text-[var(--text-secondary)] whitespace-nowrap text-[10px]">
            {languages.find((l) => l.id === currentLanguage)?.desc}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                className={`min-h-[36px] py-1.5 px-2.5 text-xs transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'border-[var(--border-strong)] bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                }`}
              >
                [ {lang.label} ]
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Visual Action Bar for Quick Macro Inserts */}
      <VisualActionBar
        language={currentLanguage}
        onInsertCode={handleInsertSnippet}
      />

      {/* 3. Editor Header Bar: File, Controls */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] gap-2 select-none overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="font-bold text-[var(--text-primary)]">
            routine.{ext}
          </span>
          <button
            onClick={() => setShowScreenVisualizer(!showScreenVisualizer)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer py-1 px-1.5 whitespace-nowrap shrink-0"
          >
            [ {showScreenVisualizer ? 'hide visualizer' : 'show visualizer'} ]
          </button>
          <button
            onClick={() => setShowImagePicker(!showImagePicker)}
            className="text-[var(--accent-primary)] hover:underline cursor-pointer font-bold py-1 px-1.5 whitespace-nowrap shrink-0"
          >
            [ {showImagePicker ? 'hide img picker' : 'pick from screenshot'} ]
          </button>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          {/* Run / Stop buttons */}
          {isExecuting ? (
            <button
              onClick={onStopMacro}
              className="cursor-pointer font-bold text-rose-600 dark:text-rose-400 hover:underline min-h-[36px] flex items-center py-1 px-2 whitespace-nowrap shrink-0"
            >
              [ ■ STOP MACRO ]
            </button>
          ) : (
            <button
              onClick={onRunMacro}
              className="cursor-pointer font-bold text-[var(--accent-primary)] hover:underline min-h-[36px] flex items-center py-1 px-2 whitespace-nowrap shrink-0"
            >
              [ ▶ RUN / TEST ]
            </button>
          )}

          <button
            onClick={handleCopyCode}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline cursor-pointer min-h-[36px] flex items-center py-1 px-1.5 whitespace-nowrap shrink-0"
          >
            [ {copiedCode ? 'copied' : 'copy'} ]
          </button>

          <button
            onClick={handleExportFile}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline cursor-pointer min-h-[36px] flex items-center py-1 px-1.5 whitespace-nowrap shrink-0"
          >
            [ export ]
          </button>

          <button
            onClick={onResetCode}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline cursor-pointer min-h-[36px] flex items-center py-1 px-1.5 whitespace-nowrap shrink-0"
          >
            [ reset ]
          </button>
        </div>
      </div>

      {/* 4. Touch Visualizer Canvas (if open) */}
      {showScreenVisualizer && (
        <div className="p-3 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
          <TouchVisualizer
            events={touchEvents}
            onInsertCoordinate={handleInsertCoordinate}
            isExecuting={isExecuting}
          />
        </div>
      )}

      {/* 4.1 Screenshot Coordinate & Color Picker (if open) */}
      {showImagePicker && (
        <div className="p-3 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
          <ScreenshotCoordinatePicker
            onInsertToEditor={(x, y, hex) => {
              handleInsertCoordinate(x, y);
            }}
          />
        </div>
      )}

      {/* 5. Code Editor */}
      <div className="flex-1 flex flex-col bg-[var(--code-bg)] min-h-[280px]">
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck={false}
          className="w-full h-full min-h-[280px] p-3 font-mono text-xs leading-relaxed bg-[var(--code-bg)] text-[var(--text-primary)] outline-none resize-none border-none selection:bg-neutral-800 selection:text-neutral-100"
          placeholder={`// Write your ${currentLanguage} macro routine here...`}
        />
      </div>

      {/* 6. Execution Console Drawer */}
      <ConsoleDrawer
        logs={logs}
        isExecuting={isExecuting}
        elapsedMs={elapsedMs}
        onClearLogs={onClearLogs}
      />
    </div>
  );
};
