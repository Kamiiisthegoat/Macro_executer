import React from 'react';
import { MacroLanguage } from '../types/macro';

interface SlimStatusFooterProps {
  isExecuting: boolean;
  currentLanguage: MacroLanguage;
  version?: string;
  isMultiLanguage?: boolean;
  blockCount?: number;
}

export const SlimStatusFooter: React.FC<SlimStatusFooterProps> = ({
  isExecuting,
  currentLanguage,
  version = 'v1.0',
  isMultiLanguage = false,
  blockCount = 3
}) => {
  const languageLabels: Record<MacroLanguage, string> = {
    javascript: 'JavaScript',
    quickjs: 'QuickJS',
    luau: 'Luau',
    kotlin: 'Kotlin',
    cpp: 'C++'
  };

  const targetLabel = languageLabels[currentLanguage] || currentLanguage;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-[28px] bg-[#0A0A0A] border-t border-[#1F1F1F] px-3 flex items-center justify-between text-[11px] font-mono select-none safe-bottom text-[#737373]">
      {/* Left: Version Tag */}
      <div className="flex items-center gap-2">
        <span className="text-[#666666]">{version}</span>
      </div>

      {/* Right: Live Compact Readout */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <span>Engine</span>
        <span className="text-[#383838]">|</span>
        <span className={isExecuting ? 'text-emerald-400 font-bold' : 'text-[#EF4444]'}>
          {isExecuting ? 'RUNNING' : 'OFF'}
        </span>
        <span className="text-[#383838]">·</span>
        <span>Mode</span>
        <span className="text-[#383838]">|</span>
        <span className="text-[#D1D1D1] font-medium">
          {isMultiLanguage ? `Multi (${blockCount} Block${blockCount !== 1 ? 's' : ''})` : `Single (${targetLabel})`}
        </span>
      </div>
    </footer>
  );
};
