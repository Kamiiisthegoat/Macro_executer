import React, { useState } from 'react';
import { PRO_SUITES } from '../data/proSuites';
import { INITIAL_PREMADE_CONFIGS } from '../data/premadeConfigs';
import { ProSuite, MacroLanguage, ConfigurableMacroConfig } from '../types/macro';
import { ConfigurableMacroCard } from './ConfigurableMacroCard';
import { AsciiHeader } from './AsciiHeader';

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
      setKeyError('err: invalid key. try: PRO-2026-UNLIMITED');
    }
  };

  const handleInstantTestUnlock = () => {
    if (!activeModalSuite) return;
    onUnlockSuite(activeModalSuite.id);
    setActivationSuccess(true);
    setTimeout(() => {
      setActiveModalSuite(null);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-full px-3 py-3 space-y-4 pb-24 max-w-xl mx-auto font-mono text-xs">
      {/* File Header */}
      <div className="py-2 border-b border-[var(--border-subtle)] space-y-1">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>// acroscript.config.d/premade.conf</span>
          <span>MODE: READ/WRITE</span>
        </div>
        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
          Pre-Made Configurations &amp; Macro Suites
        </h2>
        <p className="text-[11px] text-[var(--text-secondary)]">
          Configurable live bindings, coordinate sensors, and hardware routine suites.
        </p>
      </div>

      {/* SECTION 1: Configurable Macros (e.g. Soru_X) */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          --- [ 01. LIVE CONFIGURABLE MACROS ] ---
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
      <div className="space-y-4 pt-3">
        <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          --- [ 02. HARDWARE PRO MACRO SUITES ] ---
        </div>

        {PRO_SUITES.map((suite) => {
          const isUnlocked = unlockedSuiteIds.includes(suite.id);
          const suiteScript =
            suite.codeSnippets[currentLanguage] || suite.codeSnippets.javascript;

          return (
            <div
              key={suite.id}
              className="py-3 border-b border-[var(--border-subtle)] space-y-2 select-text"
            >
              {/* Single-Line Responsive ASCII Header for Pro Suite */}
              <AsciiHeader title={suite.title} char="-" />

              {/* Status Row */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-secondary)]">
                  {suite.category} · {suite.overhead}
                </span>

                {isUnlocked ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    [ unlocked ✓ ]
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenUnlock(suite)}
                    className="cursor-pointer text-amber-600 dark:text-amber-400 font-bold hover:underline"
                  >
                    [ unlock suite ]
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {suite.description}
              </p>

              {/* ASCII Performance Table */}
              <div className="p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] space-y-0.5 leading-snug">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">precision:</span>
                  <span className="text-[var(--text-primary)] font-bold">{suite.loopPrecision}</span>
                  <span className="text-[var(--text-muted)] ml-3">jitter:</span>
                  <span className="text-[var(--text-primary)] font-bold">{suite.jitterTolerance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">battery:</span>
                  <span className="text-[var(--text-primary)] font-bold">{suite.batteryRating}</span>
                  <span className="text-[var(--text-muted)] ml-3">overhead:</span>
                  <span className="text-[var(--text-primary)] font-bold">{suite.overhead}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-[10px] text-[var(--text-muted)]">
                  TARGET: {currentLanguage.toUpperCase()}
                </span>

                {isUnlocked ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoadToExecutor(suiteScript, suite.title)}
                      className="cursor-pointer font-bold text-[var(--accent-primary)] hover:underline min-h-[36px] flex items-center"
                    >
                      [ load to executor ]
                    </button>
                    <button
                      onClick={() => onRunScript(suiteScript, currentLanguage)}
                      className="cursor-pointer font-bold text-emerald-600 dark:text-emerald-400 hover:underline min-h-[36px] flex items-center"
                    >
                      [ run ]
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenUnlock(suite)}
                    className="cursor-pointer text-[var(--text-primary)] hover:underline min-h-[36px] flex items-center"
                  >
                    [ enter key ]
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Retro Monospace License Modal */}
      {activeModalSuite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[var(--bg-primary)] border-2 border-[var(--border-strong)] p-4 space-y-3 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="font-bold text-[var(--text-primary)] uppercase">
                :: LICENSE_KEY_INPUT ::
              </span>
              <button
                onClick={() => setActiveModalSuite(null)}
                className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold"
              >
                [X]
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-[var(--text-secondary)]">
              <p>Target: {activeModalSuite.title}</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                Input authentication key to unlock NDK/Accessibility routine:
              </p>

              <div className="flex items-center border-b border-[var(--border-strong)] py-1">
                <span className="text-[var(--text-muted)] mr-1">&gt;</span>
                <input
                  type="text"
                  value={licenseKeyInput}
                  onChange={(e) => {
                    setLicenseKeyInput(e.target.value);
                    setKeyError(null);
                  }}
                  placeholder="PRO-2026-UNLIMITED"
                  className="w-full bg-transparent text-[var(--text-primary)] font-mono outline-none uppercase"
                  autoFocus
                />
              </div>

              {keyError && (
                <div className="text-rose-500 text-[10px] pt-1">! {keyError}</div>
              )}
              {activationSuccess && (
                <div className="text-emerald-500 text-[10px] pt-1">
                  ✓ key accepted. suite unlocked.
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleApplyLicense}
                  className="w-full py-1.5 border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] font-bold cursor-pointer transition-colors"
                >
                  [ AUTHENTICATE KEY ]
                </button>
                <button
                  onClick={handleInstantTestUnlock}
                  className="w-full py-1.5 border border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                >
                  [ INSTANT TEST UNLOCK ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
