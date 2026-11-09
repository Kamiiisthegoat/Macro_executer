import React, { useState } from 'react';
import { ConfigurableMacroConfig, MacroLanguage } from '../types/macro';
import { generateScriptForConfig } from '../data/premadeConfigs';
import { ScreenshotCoordinatePicker } from './ScreenshotCoordinatePicker';
import { AsciiHeader } from './AsciiHeader';

interface ConfigurableMacroCardProps {
  initialConfig: ConfigurableMacroConfig;
  currentLanguage: MacroLanguage;
  isExecuting: boolean;
  onRunScript: (script: string, language: MacroLanguage) => void;
  onStopScript: () => void;
  onLoadToExecutor: (script: string, configName: string) => void;
}

export const ConfigurableMacroCard: React.FC<ConfigurableMacroCardProps> = ({
  initialConfig,
  currentLanguage,
  isExecuting,
  onRunScript,
  onStopScript,
  onLoadToExecutor
}) => {
  const [config, setConfig] = useState<ConfigurableMacroConfig>(initialConfig);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);

  // Generate the live script from active state
  const liveScript = generateScriptForConfig(config, currentLanguage);

  // Whenever config changes and it's loaded, sync with executor
  const handleLoad = () => {
    // Validate coordinates
    const sx = Number(config.soruCoords.x);
    const sy = Number(config.soruCoords.y);
    const px = Number(config.portalCoords.x);
    const py = Number(config.portalCoords.y);

    if (isNaN(sx) || isNaN(sy) || isNaN(px) || isNaN(py)) {
      setConfig((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'error: coordinates must be valid numbers'
      }));
      return;
    }

    // Validate hex colors (simple 3 or 6 hex check)
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!hexRegex.test(config.soruColor) || !hexRegex.test(config.portalColor)) {
      setConfig((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'error: colors must be valid hex (e.g. #FFFFFF)'
      }));
      return;
    }

    // Success
    setConfig((prev) => ({
      ...prev,
      status: 'loaded',
      errorMessage: undefined
    }));

    onLoadToExecutor(liveScript, config.name);
  };

  const handleUpdate = (field: Partial<ConfigurableMacroConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...field };
      if (next.status === 'loaded') {
        const updatedScript = generateScriptForConfig(next, currentLanguage);
        onLoadToExecutor(updatedScript, next.name);
      }
      return next;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(liveScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full my-4 text-xs font-mono select-text space-y-3 pb-3 border-b border-[var(--border-subtle)]">
      {/* 1. Single-Line Responsive ASCII Section Header */}
      <AsciiHeader title={config.name} char="=" />

      {/* 2. Status & Load Trigger Row */}
      <div className="flex items-center justify-between py-1 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-primary)] font-medium whitespace-nowrap">
            {config.title}:
          </span>
          <button
            onClick={handleLoad}
            className={`cursor-pointer py-1.5 px-2.5 transition-colors font-bold whitespace-nowrap shrink-0 ${
              config.status === 'loaded'
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 underline'
                : config.status === 'error'
                ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 underline'
                : 'text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-surface-hover)] underline'
            }`}
          >
            [ {config.status === 'loaded' ? 'loaded ✓' : config.status === 'error' ? 'error ✗' : 'load'} ]
          </button>
        </div>

        {config.status === 'loaded' && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap shrink-0">
            live binding active
          </span>
        )}
      </div>

      {/* Inline error note if error */}
      {config.status === 'error' && config.errorMessage && (
        <div className="px-2 py-1 text-[11px] text-rose-500 bg-rose-500/10 font-mono">
          ! {config.errorMessage}
        </div>
      )}

      {/* 3. Editable Coordinate & Hex Color Fields Underneath (Clean Portrait Stacking) */}
      <div className="space-y-3 px-0.5 text-[11px] leading-relaxed">
        {/* Field 1: Soru Coordinates */}
        <div className="space-y-1">
          <span className="text-[var(--text-secondary)] whitespace-nowrap block font-medium">
            Soru coordinates:
          </span>
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-[var(--text-muted)] shrink-0">[</span>
            <input
              type="number"
              value={config.soruCoords.x}
              onChange={(e) =>
                handleUpdate({
                  soruCoords: { ...config.soruCoords, x: Number(e.target.value) }
                })
              }
              placeholder="X"
              className="flex-1 min-w-0 px-2 py-1 text-center bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-primary)] text-[var(--text-primary)] outline-none font-mono text-xs"
            />
            <span className="text-[var(--text-muted)] shrink-0">]</span>
            <span className="text-[var(--text-muted)] shrink-0 px-1 font-bold">x</span>
            <span className="text-[var(--text-muted)] shrink-0">[</span>
            <input
              type="number"
              value={config.soruCoords.y}
              onChange={(e) =>
                handleUpdate({
                  soruCoords: { ...config.soruCoords, y: Number(e.target.value) }
                })
              }
              placeholder="Y"
              className="flex-1 min-w-0 px-2 py-1 text-center bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-primary)] text-[var(--text-primary)] outline-none font-mono text-xs"
            />
            <span className="text-[var(--text-muted)] shrink-0">]</span>
          </div>
        </div>

        {/* Field 2: Portal X Coordinates */}
        <div className="space-y-1">
          <span className="text-[var(--text-secondary)] whitespace-nowrap block font-medium">
            Portal x coordinates:
          </span>
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-[var(--text-muted)] shrink-0">[</span>
            <input
              type="number"
              value={config.portalCoords.x}
              onChange={(e) =>
                handleUpdate({
                  portalCoords: { ...config.portalCoords, x: Number(e.target.value) }
                })
              }
              placeholder="X"
              className="flex-1 min-w-0 px-2 py-1 text-center bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-primary)] text-[var(--text-primary)] outline-none font-mono text-xs"
            />
            <span className="text-[var(--text-muted)] shrink-0">]</span>
            <span className="text-[var(--text-muted)] shrink-0 px-1 font-bold">x</span>
            <span className="text-[var(--text-muted)] shrink-0">[</span>
            <input
              type="number"
              value={config.portalCoords.y}
              onChange={(e) =>
                handleUpdate({
                  portalCoords: { ...config.portalCoords, y: Number(e.target.value) }
                })
              }
              placeholder="Y"
              className="flex-1 min-w-0 px-2 py-1 text-center bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-primary)] text-[var(--text-primary)] outline-none font-mono text-xs"
            />
            <span className="text-[var(--text-muted)] shrink-0">]</span>
          </div>
        </div>

        {/* Field 3: Soru Pixel Color */}
        <div className="space-y-1">
          <span className="text-[var(--text-secondary)] whitespace-nowrap block font-medium">
            Soru pixel color:
          </span>
          <div className="flex items-center gap-2 w-full">
            <span className="text-[var(--text-muted)] shrink-0">(</span>
            <input
              type="text"
              value={config.soruColor}
              onChange={(e) => handleUpdate({ soruColor: e.target.value })}
              placeholder="#FFFFFF"
              className="flex-1 min-w-0 px-2 py-1 text-center bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-primary)] text-[var(--text-primary)] outline-none font-mono uppercase text-xs"
            />
            <span className="text-[var(--text-muted)] shrink-0">)</span>

            {/* Live Color Preview Swatch */}
            <span
              className="w-5 h-5 rounded-xs border border-[var(--border-strong)] inline-block shadow-2xs shrink-0"
              style={{ backgroundColor: config.soruColor || '#FFFFFF' }}
              title={`Preview: ${config.soruColor}`}
            />

            <button
              onClick={() => navigator.clipboard.writeText(config.soruColor)}
              className="cursor-pointer text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline whitespace-nowrap shrink-0 py-1 px-1.5"
            >
              [ copy ]
            </button>
          </div>
        </div>

        {/* Field 4: Portal X Pixel Color */}
        <div className="space-y-1">
          <span className="text-[var(--text-secondary)] whitespace-nowrap block font-medium">
            Portal x pixel color:
          </span>
          <div className="flex items-center gap-2 w-full">
            <span className="text-[var(--text-muted)] shrink-0">(</span>
            <input
              type="text"
              value={config.portalColor}
              onChange={(e) => handleUpdate({ portalColor: e.target.value })}
              placeholder="#FFFFFF"
              className="flex-1 min-w-0 px-2 py-1 text-center bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-primary)] text-[var(--text-primary)] outline-none font-mono uppercase text-xs"
            />
            <span className="text-[var(--text-muted)] shrink-0">)</span>

            {/* Live Color Preview Swatch */}
            <span
              className="w-5 h-5 rounded-xs border border-[var(--border-strong)] inline-block shadow-2xs shrink-0"
              style={{ backgroundColor: config.portalColor || '#FFFFFF' }}
              title={`Preview: ${config.portalColor}`}
            />

            <button
              onClick={() => navigator.clipboard.writeText(config.portalColor)}
              className="cursor-pointer text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline whitespace-nowrap shrink-0 py-1 px-1.5"
            >
              [ copy ]
            </button>
          </div>
        </div>

        {/* Toggle Button for Screenshot Coordinate & Color Picker */}
        <div className="pt-1.5">
          <button
            onClick={() => setShowImagePicker(!showImagePicker)}
            className="cursor-pointer text-[11px] font-bold text-[var(--accent-primary)] hover:underline border border-[var(--border-subtle)] hover:border-[var(--border-strong)] py-1.5 px-2.5 transition-all whitespace-nowrap shrink-0"
          >
            [ {showImagePicker ? 'hide image picker' : 'import image / pick coords'} ]
          </button>
        </div>

        {/* Inline Screenshot Coordinate Picker if open */}
        {showImagePicker && (
          <ScreenshotCoordinatePicker
            onAssignSoru={(coords, hex) =>
              handleUpdate({ soruCoords: coords, soruColor: hex })
            }
            onAssignPortal={(coords, hex) =>
              handleUpdate({ portalCoords: coords, portalColor: hex })
            }
          />
        )}
      </div>

      {/* 4. Action Bar Underneath: [ run ] [ stop ] [ view code ] */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          {isExecuting ? (
            <button
              onClick={onStopScript}
              className="cursor-pointer font-bold text-rose-600 dark:text-rose-400 hover:underline min-h-[36px] flex items-center py-1.5 px-2.5 whitespace-nowrap shrink-0"
            >
              [ ■ stop ]
            </button>
          ) : (
            <button
              onClick={() => onRunScript(liveScript, currentLanguage)}
              className="cursor-pointer font-bold text-[var(--accent-primary)] hover:underline min-h-[36px] flex items-center py-1.5 px-2.5 whitespace-nowrap shrink-0"
            >
              [ ▶ run ]
            </button>
          )}

          <button
            onClick={() => setShowCode(!showCode)}
            className="cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline min-h-[36px] flex items-center py-1.5 px-2.5 whitespace-nowrap shrink-0"
          >
            [ {showCode ? 'hide code' : 'view code'} ]
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline min-h-[36px] flex items-center py-1.5 px-2.5 whitespace-nowrap shrink-0"
          >
            [ {copied ? 'copied!' : 'copy'} ]
          </button>
          <span className="text-[10px] text-[var(--text-muted)] uppercase whitespace-nowrap shrink-0">
            target: {currentLanguage}
          </span>
        </div>
      </div>

      {/* Live Code Preview Drawer if opened */}
      {showCode && (
        <div className="mt-2 p-2.5 bg-[var(--code-bg)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-primary)] overflow-x-auto leading-relaxed select-text">
          <pre>{liveScript}</pre>
        </div>
      )}
    </div>
  );
};
