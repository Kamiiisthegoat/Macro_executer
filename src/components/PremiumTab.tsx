import React, { useState } from 'react';
import { Shield, Key, Check, ArrowRight, Play, Sparkles } from 'lucide-react';
import { PRO_SUITES } from '../data/proSuites';
import { INITIAL_PREMADE_CONFIGS } from '../data/premadeConfigs';
import { ProSuite, MacroLanguage, ConfigurableMacroConfig } from '../types/macro';
import { ConfigurableMacroCard } from './ConfigurableMacroCard';

interface PremiumTabProps {
  currentLanguage: MacroLanguage;
  unlockedSuiteIds: string[];
  isExecuting: boolean;
  onUnlockSuite: (suiteId: string) => void;
  onLoadToExecutor: (script: string, title: string) => void;
  onRunScript: (script: string, language: MacroLanguage) => void;
  onStopScript: () => void;
}

export const PremiumTab: React.FC<PremiumTabProps> = ({
  currentLanguage,
  unlockedSuiteIds,
  isExecuting,
  onUnlockSuite,
  onLoadToExecutor,
  onRunScript,
  onStopScript
}) => {
  const [activeModalSuite, setActiveModalSuite] = useState<ProSuite | null>(null);
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);

  const handleOpenUnlock = (suite: ProSuite) => {
    setActiveModalSuite(suite);
    setLicenseKeyInput('');
    setKeyError(null);
    setActivationSuccess(false);
  };

  const handleApplyLicense = () => {
    if (!activeModalSuite) return;
    const cleanKey = licenseKeyInput.trim().toUpperCase();

    if (
      cleanKey === 'PRO-2026-UNLIMITED' ||
      cleanKey === activeModalSuite.requiredKey ||
      cleanKey === 'ACRO-PRO'
    ) {
      onUnlockSuite(activeModalSuite.id);
      setActivationSuccess(true);
      setTimeout(() => {
        setActiveModalSuite(null);
      }, 700);
    } else {
      setKeyError('Invalid license key. Try: PRO-2026-UNLIMITED');
    }
  };

  const handleInstantTestUnlock = () => {
    if (!activeModalSuite) return;
    onUnlockSuite(activeModalSuite.id);
    setActivationSuccess(true);
    setTimeout(() => {
      setActiveModalSuite(null);
    }, 400);
  };

  return (
    <div className="flex flex-col min-h-full px-3 py-2 space-y-3 pb-32 max-w-xl mx-auto font-sans text-xs select-text">
      {/* Top Banner Header */}
      <div className="bg-[#141414] border border-[#242424] rounded-lg p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-[#F2F2F2]">
            PRE-MADE CONFIGURATIONS &amp; PRO SUITES
          </span>
          <span className="text-[10px] font-mono text-[#D97706] bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
            PRO ACCESS
          </span>
        </div>
        <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
          Pre-tuned game macros (like Soru_X), coordinate sensors, and hardware routines for Android JNI and AccessibilityService.
        </p>
      </div>

      {/* SECTION 1: Configurable Pre-Made Macros (e.g. Soru_X) */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1">
          CONFIGURABLE PRE-MADES (SORU_X)
        </div>

        {INITIAL_PREMADE_CONFIGS.map((cfg) => (
          <ConfigurableMacroCard
            key={cfg.id}
            initialConfig={cfg}
            currentLanguage={currentLanguage}
            isExecuting={isExecuting}
            onRunScript={onRunScript}
            onStopScript={onStopScript}
            onLoadToExecutor={(script, name) => onLoadToExecutor(script, name)}
          />
        ))}
      </div>

      {/* SECTION 2: Advanced Pro Routine Suites */}
      <div className="space-y-2.5 pt-2">
        <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-1">
          HARDWARE OPTIMIZED MACRO SUITES
        </div>

        {PRO_SUITES.map((suite) => {
          const isUnlocked = unlockedSuiteIds.includes(suite.id);
          const suiteScript =
            suite.codeSnippets[currentLanguage] || suite.codeSnippets.javascript;

          return (
            <div
              key={suite.id}
              className="bg-[#141414] border border-[#242424] rounded-lg p-3.5 space-y-2.5 select-text transition-colors hover:border-[#333333]"
            >
              {/* Title & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-[#F2F2F2] tracking-tight">
                    {suite.title}
                  </h3>
                  {isUnlocked && (
                    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                      UNLOCKED
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-[#A3A3A3]">
                  {suite.overhead}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                {suite.description}
              </p>

              {/* Specs Grid */}
              <div className="p-2.5 bg-[#0E0E0E] border border-[#222222] rounded-md grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-[#666666]">precision:</span>
                  <span className="text-[#F2F2F2] font-semibold">{suite.loopPrecision}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">jitter:</span>
                  <span className="text-[#F2F2F2] font-semibold">{suite.jitterTolerance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">battery:</span>
                  <span className="text-[#F2F2F2] font-semibold">{suite.batteryRating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">category:</span>
                  <span className="text-[#F2F2F2] font-semibold">{suite.category}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-[#1F1F1F]">
                <span className="text-[10px] text-[#666666] font-mono uppercase">
                  Target: {currentLanguage}
                </span>

                {isUnlocked ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoadToExecutor(suiteScript, suite.title)}
                      className="cursor-pointer px-2.5 py-1.5 rounded-md border border-[#2E2E2E] bg-[#1C1C1C] hover:bg-[#242424] text-[#F2F2F2] font-semibold text-xs transition-colors"
                    >
                      Load into Editor
                    </button>
                    <button
                      onClick={() => onRunScript(suiteScript, currentLanguage)}
                      className="cursor-pointer px-2.5 py-1.5 rounded-md border border-emerald-600/60 bg-emerald-500/20 text-emerald-400 font-semibold text-xs flex items-center gap-1 transition-colors active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenUnlock(suite)}
                    className="cursor-pointer px-3 py-1.5 rounded-md border border-[#3A2412] bg-[#22140A] hover:bg-[#2A180C] text-[#F59E0B] font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Key className="w-3 h-3" />
                    <span>Unlock Suite</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* License Key Input Modal */}
      {activeModalSuite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100 font-sans text-xs">
          <div className="w-full max-w-sm bg-[#141414] border border-[#242424] rounded-lg p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242424] pb-2.5">
              <span className="font-bold text-[#F2F2F2] tracking-tight uppercase text-xs">
                Unlock Pro Macro Suite
              </span>
              <button
                onClick={() => setActiveModalSuite(null)}
                className="cursor-pointer text-[#737373] hover:text-[#F2F2F2] text-sm px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#A3A3A3]">
              <p className="font-semibold text-[#F2F2F2]">{activeModalSuite.title}</p>
              <p className="text-[11px] text-[#737373]">
                Enter your access key to unlock high-speed native execution routines.
              </p>

              <div className="p-2.5 bg-[#0E0E0E] border border-[#222222] rounded-md">
                <input
                  type="text"
                  value={licenseKeyInput}
                  onChange={(e) => {
                    setLicenseKeyInput(e.target.value);
                    setKeyError(null);
                  }}
                  placeholder="PRO-2026-UNLIMITED"
                  className="w-full bg-transparent text-[#F2F2F2] font-mono outline-none uppercase text-xs"
                  autoFocus
                />
              </div>

              {keyError && (
                <div className="text-[#EF4444] text-[11px]">! {keyError}</div>
              )}
              {activationSuccess && (
                <div className="text-emerald-400 text-[11px] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Key authenticated! Suite unlocked.</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleApplyLicense}
                  className="w-full py-2 border border-[#383838] bg-[#222222] hover:bg-[#2A2A2A] text-[#F2F2F2] font-semibold text-xs rounded-md cursor-pointer transition-colors"
                >
                  Authenticate Key
                </button>
                <button
                  onClick={handleInstantTestUnlock}
                  className="w-full py-2 border border-[#242424] bg-[#101010] hover:bg-[#181818] text-[#737373] hover:text-[#A3A3A3] text-xs rounded-md cursor-pointer transition-colors"
                >
                  Instant Test Unlock (Demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
