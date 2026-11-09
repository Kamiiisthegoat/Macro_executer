import React, { useState } from 'react';
import { Play, Square, Crosshair, Copy, Check, Code, ArrowUpRight } from 'lucide-react';
import { ConfigurableMacroConfig, MacroLanguage } from '../types/macro';
import { generateScriptForConfig } from '../data/premadeConfigs';
import { ScreenshotCoordinatePicker } from './ScreenshotCoordinatePicker';

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

  const handleLoad = () => {
    const sx = Number(config.soruCoords.x);
    const sy = Number(config.soruCoords.y);
    const px = Number(config.portalCoords.x);
    const py = Number(config.portalCoords.y);

    if (isNaN(sx) || isNaN(sy) || isNaN(px) || isNaN(py)) {
      setConfig((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Coordinates must be valid numbers'
      }));
      return;
    }

    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!hexRegex.test(config.soruColor) || !hexRegex.test(config.portalColor)) {
      setConfig((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Colors must be valid hex (e.g. #FFFFFF)'
      }));
      return;
    }

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
    <div className="w-full bg-[#141414] border border-[#242424] rounded-lg p-3.5 space-y-3 font-sans text-xs select-text shadow-xs">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2.5">
        <div className="space-y-0.5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#F2F2F2]">
            {config.title || config.name}
          </h3>
          <span className="text-[10px] text-[#737373]">
            Pre-made optimized routine for {currentLanguage.toUpperCase()}
          </span>
        </div>

        {/* Load Status Pill Button */}
        <button
          onClick={handleLoad}
          className={`cursor-pointer px-2.5 py-1 rounded text-xs font-semibold border transition-all active:scale-95 ${
            config.status === 'loaded'
              ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400'
              : config.status === 'error'
              ? 'border-[#EF4444]/80 bg-[#EF4444]/10 text-[#EF4444]'
              : 'border-[#333333] bg-[#1C1C1C] hover:bg-[#242424] text-[#F2F2F2]'
          }`}
        >
          {config.status === 'loaded' ? 'Loaded ✓' : config.status === 'error' ? 'Error ✗' : 'Load Config'}
        </button>
      </div>

      {/* Inline error note if error */}
      {config.status === 'error' && config.errorMessage && (
        <div className="px-2.5 py-1.5 text-[11px] text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded">
          {config.errorMessage}
        </div>
      )}

      {/* 2. Setting Rows for Coordinates & Colors */}
      <div className="space-y-2 text-xs">
        {/* Soru Coordinates */}
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-md p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span>Soru Coordinates</span>
            <span className="text-[10px] text-[#666666]">Trigger Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#141414] border border-[#2A2A2A] rounded px-2 py-1">
              <span className="text-[#666666] text-[10px] font-mono mr-1">X:</span>
              <input
                type="number"
                value={config.soruCoords.x}
                onChange={(e) =>
                  handleUpdate({
                    soruCoords: { ...config.soruCoords, x: Number(e.target.value) }
                  })
                }
                className="w-full bg-transparent text-[#F2F2F2] font-mono text-xs outline-none text-center"
              />
            </div>
            <span className="text-[#666666]">×</span>
            <div className="flex-1 flex items-center bg-[#141414] border border-[#2A2A2A] rounded px-2 py-1">
              <span className="text-[#666666] text-[10px] font-mono mr-1">Y:</span>
              <input
                type="number"
                value={config.soruCoords.y}
                onChange={(e) =>
                  handleUpdate({
                    soruCoords: { ...config.soruCoords, y: Number(e.target.value) }
                  })
                }
                className="w-full bg-transparent text-[#F2F2F2] font-mono text-xs outline-none text-center"
              />
            </div>
          </div>
        </div>

        {/* Portal Coordinates */}
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-md p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span>Portal Coordinates</span>
            <span className="text-[10px] text-[#666666]">Secondary Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#141414] border border-[#2A2A2A] rounded px-2 py-1">
              <span className="text-[#666666] text-[10px] font-mono mr-1">X:</span>
              <input
                type="number"
                value={config.portalCoords.x}
                onChange={(e) =>
                  handleUpdate({
                    portalCoords: { ...config.portalCoords, x: Number(e.target.value) }
                  })
                }
                className="w-full bg-transparent text-[#F2F2F2] font-mono text-xs outline-none text-center"
              />
            </div>
            <span className="text-[#666666]">×</span>
            <div className="flex-1 flex items-center bg-[#141414] border border-[#2A2A2A] rounded px-2 py-1">
              <span className="text-[#666666] text-[10px] font-mono mr-1">Y:</span>
              <input
                type="number"
                value={config.portalCoords.y}
                onChange={(e) =>
                  handleUpdate({
                    portalCoords: { ...config.portalCoords, y: Number(e.target.value) }
                  })
                }
                className="w-full bg-transparent text-[#F2F2F2] font-mono text-xs outline-none text-center"
              />
            </div>
          </div>
        </div>

        {/* Soru Color Swatch & Input */}
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-md p-2.5 flex items-center justify-between gap-2">
          <span className="text-[#A3A3A3] whitespace-nowrap">Soru Color</span>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm border border-[#383838] shrink-0"
              style={{ backgroundColor: config.soruColor || '#FFFFFF' }}
            />
            <input
              type="text"
              value={config.soruColor}
              onChange={(e) => handleUpdate({ soruColor: e.target.value })}
              className="w-20 bg-[#141414] border border-[#2A2A2A] text-[#F2F2F2] font-mono text-xs px-2 py-0.5 rounded text-center outline-none uppercase"
            />
          </div>
        </div>

        {/* Portal Color Swatch & Input */}
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-md p-2.5 flex items-center justify-between gap-2">
          <span className="text-[#A3A3A3] whitespace-nowrap">Portal Color</span>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm border border-[#383838] shrink-0"
              style={{ backgroundColor: config.portalColor || '#FFFFFF' }}
            />
            <input
              type="text"
              value={config.portalColor}
              onChange={(e) => handleUpdate({ portalColor: e.target.value })}
              className="w-20 bg-[#141414] border border-[#2A2A2A] text-[#F2F2F2] font-mono text-xs px-2 py-0.5 rounded text-center outline-none uppercase"
            />
          </div>
        </div>
      </div>

      {/* Coordinate Picker Toggle Button */}
      <button
        onClick={() => setShowImagePicker(!showImagePicker)}
        className="w-full py-2 rounded-md border border-[#2A2A2A] bg-[#101010] hover:bg-[#1A1A1A] text-[#A3A3A3] hover:text-[#F2F2F2] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Crosshair className="w-3.5 h-3.5 text-[#A3A3A3]" />
        <span>{showImagePicker ? 'Hide Image Picker' : 'Pick Coords from Screenshot'}</span>
      </button>

      {/* Inline Screenshot Coordinate Picker if open */}
      {showImagePicker && (
        <div className="bg-[#0A0A0A] border border-[#242424] rounded-md p-2.5 space-y-2">
          <ScreenshotCoordinatePicker
            onAssignSoru={(coords, hex) =>
              handleUpdate({ soruCoords: coords, soruColor: hex })
            }
            onAssignPortal={(coords, hex) =>
              handleUpdate({ portalCoords: coords, portalColor: hex })
            }
          />
        </div>
      )}

      {/* 3. Actions Row */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1F1F1F]">
        <div className="flex items-center gap-2">
          {isExecuting ? (
            <button
              onClick={onStopScript}
              className="cursor-pointer px-3 py-1.5 rounded-md bg-[#EF4444]/20 border border-[#EF4444]/60 text-[#EF4444] font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={() => onRunScript(liveScript, currentLanguage)}
              className="cursor-pointer px-3 py-1.5 rounded-md bg-[#1C1C1C] hover:bg-[#242424] border border-[#333333] hover:border-[#525252] text-[#F2F2F2] font-semibold text-xs flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run Script</span>
            </button>
          )}

          <button
            onClick={() => setShowCode(!showCode)}
            className="cursor-pointer px-2.5 py-1.5 rounded-md border border-[#242424] bg-[#101010] hover:bg-[#1A1A1A] text-[#A3A3A3] hover:text-[#F2F2F2] text-xs flex items-center gap-1"
          >
            <Code className="w-3 h-3" />
            <span>{showCode ? 'Hide' : 'Code'}</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="cursor-pointer px-2.5 py-1.5 rounded-md text-[#737373] hover:text-[#F2F2F2] text-xs flex items-center gap-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Live Code Preview Drawer if opened */}
      {showCode && (
        <div className="p-3 bg-[#080808] border border-[#222222] rounded-md text-[11px] font-mono text-[#F2F2F2] overflow-x-auto leading-relaxed select-text">
          <pre>{liveScript}</pre>
        </div>
      )}
    </div>
  );
};
