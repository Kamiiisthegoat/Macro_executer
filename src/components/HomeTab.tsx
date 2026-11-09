import React, { useState } from 'react';
import {
  Play,
  Square,
  Copy,
  Check,
  Download,
  RotateCcw,
  Crosshair,
  Smartphone,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Layers,
  Code
} from 'lucide-react';
import { MacroLanguage, MacroLog, TouchEventMarker, PipelineBlock } from '../types/macro';
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
  isNativePlatform?: boolean;
  // Multi-Language Pipeline Props
  isMultiLanguage: boolean;
  onToggleMultiLanguage: (enabled: boolean) => void;
  pipelineBlocks: PipelineBlock[];
  onUpdatePipelineBlocks: (blocks: PipelineBlock[]) => void;
  onRunPipeline: () => void;
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
  onResetCode,
  isNativePlatform = false,
  isMultiLanguage,
  onToggleMultiLanguage,
  pipelineBlocks,
  onUpdatePipelineBlocks,
  onRunPipeline
}) => {
  const [showScreenVisualizer, setShowScreenVisualizer] = useState<boolean>(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Settings & Timing State (matching SacredStep overlay utility)
  const [triggerDelay, setTriggerDelay] = useState<number>(5);
  const [randomDelayMode, setRandomDelayMode] = useState<boolean>(false);
  const [spamSpeed, setSpamSpeed] = useState<number>(40);
  const [smartSpam, setSmartSpam] = useState<boolean>(true);
  const [showStatusToast, setShowStatusToast] = useState<boolean>(true);
  const [menuSize, setMenuSize] = useState<number>(100);
  const [lastPickedCoord, setLastPickedCoord] = useState<{ x: number; y: number; hex: string } | null>(null);

  const handleCopyCode = () => {
    if (isMultiLanguage) {
      const combined = pipelineBlocks
        .map((b, i) => `// --- Block ${i + 1} (${b.language.toUpperCase()}) ---\n${b.code}`)
        .join('\n\n');
      navigator.clipboard.writeText(combined);
    } else {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportFile = () => {
    if (isMultiLanguage) {
      const combined = pipelineBlocks
        .map((b, i) => `// --- Block ${i + 1} (${b.language.toUpperCase()}) ---\n${b.code}`)
        .join('\n\n');
      const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `macro_pipeline_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
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
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    if (isMultiLanguage && pipelineBlocks.length > 0) {
      // Insert into the last block
      const lastIndex = pipelineBlocks.length - 1;
      const targetBlock = pipelineBlocks[lastIndex];
      const updatedCode = targetBlock.code + (targetBlock.code.endsWith('\n') ? '' : '\n') + snippet;
      handleUpdateBlock(lastIndex, { code: updatedCode });
    } else {
      onCodeChange(code + (code.endsWith('\n') ? '' : '\n') + snippet);
    }
  };

  const handleInsertCoordinate = (x: number, y: number, hex: string = '#FFFFFF') => {
    setLastPickedCoord({ x, y, hex });
    let snippet = '';
    const activeLang = isMultiLanguage && pipelineBlocks.length > 0 ? pipelineBlocks[0].language : currentLanguage;

    if (activeLang === 'luau') {
      snippet = `tap(${x}, ${y}) -- color: ${hex}\n`;
    } else if (activeLang === 'kotlin') {
      snippet = `MacroAccessibilityService.tap(${x}f, ${y}f, ${triggerDelay}L) // ${hex}\n`;
    } else if (activeLang === 'cpp') {
      snippet = `nativeTap(${x}f, ${y}f, ${triggerDelay}); // ${hex}\n`;
    } else {
      snippet = `await tap(${x}, ${y}); // color: ${hex}\n`;
    }
    handleInsertSnippet(snippet);
  };

  // Pipeline block management
  const handleAddBlock = () => {
    const newBlock: PipelineBlock = {
      id: crypto.randomUUID(),
      language: 'quickjs',
      code: `// QuickJS Step\ntap(200, 450);\nwait(100);`
    };
    onUpdatePipelineBlocks([...pipelineBlocks, newBlock]);
  };

  const handleUpdateBlock = (index: number, updates: Partial<PipelineBlock>) => {
    const updated = [...pipelineBlocks];
    updated[index] = { ...updated[index], ...updates };
    onUpdatePipelineBlocks(updated);
  };

  const handleRemoveBlock = (index: number) => {
    if (pipelineBlocks.length <= 1) return;
    const updated = pipelineBlocks.filter((_, i) => i !== index);
    onUpdatePipelineBlocks(updated);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pipelineBlocks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...pipelineBlocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onUpdatePipelineBlocks(updated);
  };

  const skillSlots: Array<{ id: string; lang: MacroLanguage; label: string }> = [
    { id: 'JS', lang: 'javascript', label: 'JS' },
    { id: 'QJS', lang: 'quickjs', label: 'QJS' },
    { id: 'Luau', lang: 'luau', label: 'Luau' },
    { id: 'KT', lang: 'kotlin', label: 'KT' },
    { id: 'C++', lang: 'cpp', label: 'C++' }
  ];

  const ext =
    currentLanguage === 'kotlin'
      ? 'kt'
      : currentLanguage === 'cpp'
      ? 'cpp'
      : currentLanguage === 'luau'
      ? 'lua'
      : 'js';

  // Toggle Switch UI helper
  const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
        checked ? 'bg-[#525252]' : 'bg-[#222222]'
      }`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="flex flex-col min-h-full pb-32 font-sans text-xs select-text px-3 space-y-3 pt-2">
      {/* 1. Main Engine Status Card (Top Banner Card) */}
      <div className="bg-[#141414] border border-[#242424] rounded-lg p-3 flex items-center justify-between shadow-xs">
        <div className="space-y-0.5">
          <div className="font-bold text-xs uppercase tracking-wider text-[#F2F2F2]">
            MACRO ENGINE
          </div>
          <p className="text-[11px] text-[#737373] tracking-tight">
            {isNativePlatform
              ? 'Native Bridge Connected · JNI NDK Ready'
              : 'Web Sandbox Ready · Local Worker Active'}
          </p>
        </div>

        {/* Status Pill Action Button */}
        {isExecuting ? (
          <button
            onClick={onStopMacro}
            className="cursor-pointer min-h-[32px] px-3 rounded-md border border-emerald-500/80 bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>RUNNING</span>
          </button>
        ) : (
          <button
            onClick={isMultiLanguage ? onRunPipeline : onRunMacro}
            className="cursor-pointer min-h-[32px] px-3.5 rounded-md border border-[#DC2626]/60 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#EF4444] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>OFF</span>
          </button>
        )}
      </div>

      {/* 2. LANGUAGE ENGINE & MULTI-LANGUAGE TOGGLE SECTION */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1">
          LANGUAGE ENGINE
        </div>

        {/* Multi-Language Toggle Row (Requested Feature) */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg px-3.5 py-2.5 flex items-center justify-between">
          <div className="space-y-0.5 pr-2">
            <span className="text-xs font-semibold text-[#F2F2F2] block">
              Multi-language code
            </span>
            <span className="text-[10px] text-[#737373] block">
              {isMultiLanguage
                ? 'ON: Combined pipeline (Sequential execution with sharedState)'
                : 'OFF: Single engine · ON: Combined pipeline'}
            </span>
          </div>
          <ToggleSwitch
            checked={isMultiLanguage}
            onChange={onToggleMultiLanguage}
          />
        </div>

        {/* Single-Language Mode Controls (Rendered when toggle is OFF) */}
        {!isMultiLanguage && (
          <div className="space-y-1.5 animate-in fade-in duration-100">
            {/* Quick-Action / Skill Slot Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {skillSlots.map((slot) => {
                const isSelected = currentLanguage === slot.lang;
                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      onLanguageChange(slot.lang);
                    }}
                    className={`w-[46px] h-[42px] rounded-md border transition-all cursor-pointer flex flex-col items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-[#737373] bg-[#222222] text-[#F2F2F2] shadow-xs font-bold'
                        : 'border-[#2A2A2A] bg-[#141414] text-[#888888] hover:text-[#D1D1D1] hover:border-[#383838]'
                    }`}
                    title={`Switch runtime target to ${slot.label}`}
                  >
                    <span className="text-xs">{slot.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => onLanguageChange('quickjs')}
                className="w-[42px] h-[42px] rounded-md border border-[#242424] bg-[#101010] text-[#666666] hover:text-[#A3A3A3] flex items-center justify-center shrink-0"
                title="Custom Routine Slot"
              >
                +
              </button>
            </div>

            {/* Setting Row: Active Engine Readout */}
            <div className="bg-[#141414] border border-[#222222] rounded-lg px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-xs text-[#A3A3A3]">Active Target</span>
              <span className="text-xs font-mono text-[#F2F2F2] bg-[#1E1E1E] border border-[#2E2E2E] px-2.5 py-1 rounded">
                {currentLanguage.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. TIMING & SPEED SECTION */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1">
          TIMING &amp; SPEED
        </div>

        {/* Slider 1: Trigger delay */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3]">Trigger delay</span>
            <span className="text-xs font-mono text-[#F2F2F2] bg-[#1C1C1C] border border-[#2E2E2E] px-2 py-0.5 rounded">
              {triggerDelay} ms
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="250"
            value={triggerDelay}
            onChange={(e) => setTriggerDelay(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#F2F2F2]"
          />
        </div>

        {/* Setting Row: Random delay mode toggle */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg px-3.5 py-2.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-[#A3A3A3] block">Random delay mode</span>
            <span className="text-[10px] text-[#666666]">Adds ±20% jitter for human simulation</span>
          </div>
          <ToggleSwitch
            checked={randomDelayMode}
            onChange={setRandomDelayMode}
          />
        </div>

        {/* Slider 2: Speed / Loop Rate */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3]">Execution speed</span>
            <span className="text-xs font-mono text-[#F2F2F2] bg-[#1C1C1C] border border-[#2E2E2E] px-2 py-0.5 rounded">
              {spamSpeed}/s
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            value={spamSpeed}
            onChange={(e) => setSpamSpeed(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#F2F2F2]"
          />
        </div>

        {/* Setting Row: Smart spam */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-xs text-[#A3A3A3]">Smart loop (pause on manual tap)</span>
          <ToggleSwitch
            checked={smartSpam}
            onChange={setSmartSpam}
          />
        </div>
      </div>

      {/* 4. SCRIPT & ACTIONS SECTION */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1 flex items-center justify-between">
          <span>{isMultiLanguage ? 'COMBINED MULTI-LANGUAGE PIPELINE' : 'SCRIPT & ACTIONS'}</span>
          <span className="text-[10px] text-[#666666] font-mono">
            {isMultiLanguage ? `${pipelineBlocks.length} Blocks` : `routine.${ext}`}
          </span>
        </div>

        {/* Visual Action Bar (Quick Insert Buttons) */}
        <VisualActionBar
          language={isMultiLanguage && pipelineBlocks.length > 0 ? pipelineBlocks[0].language : currentLanguage}
          onInsertCode={handleInsertSnippet}
        />

        {/* Mode A: Single-Language Main Code Editor */}
        {!isMultiLanguage ? (
          <div className="space-y-0 animate-in fade-in duration-100">
            {/* Editor Controls Bar */}
            <div className="bg-[#141414] border border-[#222222] rounded-t-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {isExecuting ? (
                  <button
                    onClick={onStopMacro}
                    className="cursor-pointer px-2.5 py-1 rounded bg-[#EF4444]/20 border border-[#EF4444]/60 text-[#EF4444] font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={onRunMacro}
                    className="cursor-pointer px-2.5 py-1 rounded bg-[#222222] hover:bg-[#2A2A2A] border border-[#383838] text-[#F2F2F2] font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Execute</span>
                  </button>
                )}

                <button
                  onClick={() => setShowImagePicker(!showImagePicker)}
                  className={`cursor-pointer px-2 py-1 rounded border text-xs flex items-center gap-1 transition-colors ${
                    showImagePicker
                      ? 'border-[#525252] bg-[#222222] text-[#F2F2F2]'
                      : 'border-[#2A2A2A] bg-[#141414] text-[#A3A3A3] hover:text-[#F2F2F2]'
                  }`}
                >
                  <Crosshair className="w-3 h-3" />
                  <span>{showImagePicker ? 'Hide Picker' : 'Pick Coords'}</span>
                </button>

                <button
                  onClick={() => setShowScreenVisualizer(!showScreenVisualizer)}
                  className={`cursor-pointer px-2 py-1 rounded border text-xs flex items-center gap-1 transition-colors ${
                    showScreenVisualizer
                      ? 'border-[#525252] bg-[#222222] text-[#F2F2F2]'
                      : 'border-[#2A2A2A] bg-[#141414] text-[#A3A3A3] hover:text-[#F2F2F2]'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>{showScreenVisualizer ? 'Hide Visual' : 'Canvas'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded text-[#737373] hover:text-[#F2F2F2] transition-colors cursor-pointer"
                  title="Copy Routine Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleExportFile}
                  className="p-1 rounded text-[#737373] hover:text-[#F2F2F2] transition-colors cursor-pointer"
                  title="Export File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onResetCode}
                  className="p-1 rounded text-[#737373] hover:text-[#F2F2F2] transition-colors cursor-pointer"
                  title="Reset Code Template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code Editor Textarea */}
            <div className="bg-[#0D0D0D] border-x border-b border-[#222222] rounded-b-lg overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                spellCheck={false}
                className="w-full min-h-[220px] p-3 font-mono text-[11.5px] leading-relaxed bg-[#0D0D0D] text-[#F2F2F2] outline-none resize-none border-none selection:bg-neutral-800 selection:text-neutral-100"
                placeholder={`// Write your ${currentLanguage} macro routine here...`}
              />
            </div>
          </div>
        ) : (
          /* Mode B: Combined Multi-Language Stack of Blocks */
          <div className="space-y-3 animate-in fade-in duration-100">
            {/* Pipeline Header Toolbar */}
            <div className="bg-[#141414] border border-[#222222] rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isExecuting ? (
                  <button
                    onClick={onStopMacro}
                    className="cursor-pointer px-3 py-1.5 rounded-md bg-[#EF4444]/20 border border-[#EF4444]/60 text-[#EF4444] font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Pipeline</span>
                  </button>
                ) : (
                  <button
                    onClick={onRunPipeline}
                    className="cursor-pointer px-3 py-1.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-600/60 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-colors active:scale-95 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute Pipeline</span>
                  </button>
                )}

                <button
                  onClick={() => setShowImagePicker(!showImagePicker)}
                  className={`cursor-pointer px-2.5 py-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors ${
                    showImagePicker
                      ? 'border-[#525252] bg-[#222222] text-[#F2F2F2]'
                      : 'border-[#2A2A2A] bg-[#141414] text-[#A3A3A3] hover:text-[#F2F2F2]'
                  }`}
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Coords</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded text-[#737373] hover:text-[#F2F2F2] transition-colors cursor-pointer"
                  title="Copy All Blocks"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleExportFile}
                  className="p-1 rounded text-[#737373] hover:text-[#F2F2F2] transition-colors cursor-pointer"
                  title="Export Pipeline"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Vertical Stack of Blocks */}
            <div className="space-y-2.5">
              {pipelineBlocks.map((block, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === pipelineBlocks.length - 1;

                return (
                  <div
                    key={block.id}
                    className="bg-[#141414] border border-[#242424] rounded-lg p-3 space-y-2 hover:border-[#333333] transition-colors"
                  >
                    {/* Block Title & Controls Row */}
                    <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#F2F2F2] bg-[#1E1E1E] border border-[#2E2E2E] px-2 py-0.5 rounded">
                          Step {idx + 1}
                        </span>

                        {/* Language Selector Dropdown/Pills */}
                        <div className="flex items-center gap-1">
                          {(['cpp', 'luau', 'quickjs', 'javascript', 'kotlin'] as MacroLanguage[]).map((lang) => {
                            const isLangActive = block.language === lang;
                            const shortLabel: Record<MacroLanguage, string> = {
                              cpp: 'C++',
                              luau: 'Luau',
                              quickjs: 'QJS',
                              javascript: 'JS',
                              kotlin: 'KT'
                            };

                            return (
                              <button
                                key={lang}
                                onClick={() => handleUpdateBlock(idx, { language: lang })}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                                  isLangActive
                                    ? 'border-[#525252] bg-[#222222] text-[#F2F2F2] font-bold'
                                    : 'border-transparent text-[#737373] hover:text-[#A3A3A3]'
                                }`}
                              >
                                {shortLabel[lang]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Reorder and Delete Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveBlock(idx, 'up')}
                          disabled={isFirst}
                          className={`p-1 rounded text-xs cursor-pointer ${
                            isFirst ? 'text-[#333333] cursor-not-allowed' : 'text-[#737373] hover:text-[#F2F2F2] hover:bg-[#202020]'
                          }`}
                          title="Move Block Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveBlock(idx, 'down')}
                          disabled={isLast}
                          className={`p-1 rounded text-xs cursor-pointer ${
                            isLast ? 'text-[#333333] cursor-not-allowed' : 'text-[#737373] hover:text-[#F2F2F2] hover:bg-[#202020]'
                          }`}
                          title="Move Block Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveBlock(idx)}
                          disabled={pipelineBlocks.length <= 1}
                          className={`p-1 rounded text-xs cursor-pointer ml-1 ${
                            pipelineBlocks.length <= 1 ? 'text-[#333333] cursor-not-allowed' : 'text-[#737373] hover:text-[#EF4444] hover:bg-[#202020]'
                          }`}
                          title="Delete Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Shared context hint */}
                    <div className="text-[10px] text-[#737373] font-mono px-2 py-0.5 bg-[#0E0E0E] rounded border border-[#1E1E1E] flex items-center justify-between">
                      <span>sharedState: persist variables across pipeline steps</span>
                      <span className="text-[#555555]">target: {block.language}</span>
                    </div>

                    {/* Monospace Code Box */}
                    <textarea
                      value={block.code}
                      onChange={(e) => handleUpdateBlock(idx, { code: e.target.value })}
                      spellCheck={false}
                      className="w-full min-h-[90px] p-2.5 font-mono text-[11px] leading-relaxed bg-[#0D0D0D] text-[#F2F2F2] border border-[#222222] rounded-md outline-none resize-y selection:bg-neutral-800 selection:text-neutral-100"
                      placeholder={`// Code for Step ${idx + 1} (${block.language})...`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Add Block Button */}
            <button
              onClick={handleAddBlock}
              className="w-full py-2.5 border border-dashed border-[#2A2A2A] hover:border-[#525252] rounded-lg bg-[#101010] hover:bg-[#161616] text-[#A3A3A3] hover:text-[#F2F2F2] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Pipeline Block</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. COORDINATES & COLOR DRAWER (IF TOGGLED) */}
      {showImagePicker && (
        <div className="space-y-1.5 animate-in fade-in duration-150">
          <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1">
            COORDINATE &amp; COLOR PICKER
          </div>
          <div className="bg-[#141414] border border-[#242424] rounded-lg p-3">
            <ScreenshotCoordinatePicker
              onInsertToEditor={(x, y, hex) => {
                handleInsertCoordinate(x, y, hex);
              }}
            />
          </div>
        </div>
      )}

      {/* Touch Visualizer (IF TOGGLED) */}
      {showScreenVisualizer && (
        <div className="space-y-1.5 animate-in fade-in duration-150">
          <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1">
            TOUCH EVENT CANVAS
          </div>
          <div className="bg-[#141414] border border-[#242424] rounded-lg p-3">
            <TouchVisualizer
              events={touchEvents}
              onInsertCoordinate={(x, y) => handleInsertCoordinate(x, y)}
              isExecuting={isExecuting}
            />
          </div>
        </div>
      )}

      {/* 6. STATUS / DETECTION ALERT BOX */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1">
          STATUS / DETECTION
        </div>
        <div className="bg-[#141414] border border-[#452715] rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#F59E0B] font-medium text-xs">
              {isExecuting
                ? isMultiLanguage
                  ? `Active Pipeline: Running ${pipelineBlocks.length} Blocks (${elapsedMs.toFixed(0)} ms)`
                  : `Active Routine: ${currentLanguage.toUpperCase()} Running (${elapsedMs.toFixed(0)} ms)`
                : isNativePlatform
                ? 'Ready: Native AccessibilityService Bound'
                : 'Waiting: Tap Execute to start macro routine'}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
          </div>
          {lastPickedCoord && (
            <p className="text-[11px] text-[#A3A3A3] font-mono">
              Last Coords: ({lastPickedCoord.x}, {lastPickedCoord.y}) · Color: {lastPickedCoord.hex}
            </p>
          )}
        </div>
      </div>

      {/* 7. WINDOW & OVERLAY SECTION */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1">
          WINDOW &amp; OVERLAY
        </div>

        {/* Setting Row: Show status toast */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-xs text-[#A3A3A3]">Show status toast on trigger</span>
          <ToggleSwitch
            checked={showStatusToast}
            onChange={setShowStatusToast}
          />
        </div>

        {/* Slider 3: Menu size */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3]">Menu size</span>
            <span className="text-xs font-mono text-[#F2F2F2] bg-[#1C1C1C] border border-[#2E2E2E] px-2 py-0.5 rounded">
              {menuSize}%
            </span>
          </div>
          <input
            type="range"
            min="75"
            max="125"
            value={menuSize}
            onChange={(e) => setMenuSize(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#F2F2F2]"
          />
        </div>
      </div>

      {/* 8. EXECUTION CONSOLE DRAWER */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1">
          OUTPUT TERMINAL
        </div>
        <ConsoleDrawer
          logs={logs}
          isExecuting={isExecuting}
          elapsedMs={elapsedMs}
          onClearLogs={onClearLogs}
        />
      </div>
    </div>
  );
};
