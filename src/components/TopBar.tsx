import React, { useState } from 'react';
import { BridgeStatus } from '../services/nativeExecutorBridge';

interface TopBarProps {
  bridgeStatus: BridgeStatus;
  onToggleSimulatedNative: (enabled: boolean) => void;
  onToggleOverlay: () => void;
  overlayActive: boolean;
  onOpenThemeSwitcher: () => void;
  onOpenImagePicker: () => void;
  activeThemeName: string;
  onEnableAccessibility: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  bridgeStatus,
  onToggleSimulatedNative,
  onToggleOverlay,
  overlayActive,
  onOpenThemeSwitcher,
  onOpenImagePicker,
  activeThemeName,
  onEnableAccessibility
}) => {
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-2.5 h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] font-mono text-xs select-none overflow-x-auto scrollbar-none gap-2">
        {/* Brand / Title & Status */}
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="font-extrabold text-[var(--text-primary)] tracking-tight whitespace-nowrap shrink-0">
            AcroScript.sh
          </span>

          {/* Native Engine Connected or Sandbox Status */}
          {bridgeStatus.isNative ? (
            <span
              onClick={() => setShowStatusModal(true)}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/30 whitespace-nowrap shrink-0 cursor-pointer"
              title="Native Android container detected - click for details"
            >
              NATIVE ENGINE: CONNECTED
            </span>
          ) : (
            <button
              onClick={() => setShowStatusModal(true)}
              className="cursor-pointer text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline whitespace-nowrap shrink-0"
              title="Inspect Runtime Environment"
            >
              [
              {bridgeStatus.isSimulatedNative
                ? 'status:simulated'
                : 'status:sandbox'}
              ]
            </button>
          )}

          {/* Enable Accessibility Trigger Button */}
          <button
            onClick={onEnableAccessibility}
            className="cursor-pointer text-[10px] font-bold py-1 px-1.5 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all whitespace-nowrap shrink-0"
            title="Open Android Accessibility Settings via MacroBridge.openAccessibilitySettings()"
          >
            [ enable accessibility ]
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 text-[11px] whitespace-nowrap shrink-0">
          {/* Screenshot Coordinate Picker Trigger */}
          <button
            onClick={onOpenImagePicker}
            className="cursor-pointer py-1 px-2 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--accent-primary)] font-bold transition-all whitespace-nowrap shrink-0"
            title="Open Screenshot Coordinate & Color Picker Tool"
          >
            [ img coords ]
          </button>

          {/* Floating Overlay Widget Toggle */}
          <button
            onClick={onToggleOverlay}
            className={`cursor-pointer py-1 px-1.5 border transition-all whitespace-nowrap shrink-0 ${
              overlayActive
                ? 'border-[var(--border-strong)] bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Toggle Floating Start/Stop Overlay Widget (SYSTEM_ALERT_WINDOW)"
          >
            [ {overlayActive ? 'overlay:on' : 'overlay:off'} ]
          </button>

          {/* UI Style Switcher Palette Button */}
          <button
            onClick={onOpenThemeSwitcher}
            className="cursor-pointer py-1 px-1.5 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)] transition-all whitespace-nowrap shrink-0"
            title="UI Style Switcher"
          >
            [ theme:{activeThemeName.split(' ')[0].toLowerCase()} ]
          </button>
        </div>
      </header>

      {/* Capacitor & Android Architecture Explainer Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs animate-in fade-in duration-100 font-mono text-xs">
          <div className="w-full max-w-sm bg-[var(--bg-primary)] border-2 border-[var(--border-strong)] p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="font-bold text-[var(--text-primary)] uppercase">
                :: RUNTIME_ENVIRONMENT_PROBE ::
              </span>
              <button
                onClick={() => setShowStatusModal(false)}
                className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold"
              >
                [X]
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-[var(--text-secondary)] leading-relaxed">
              <p>Capacitor Android Container / MacroBridge Plugin Status</p>

              <div className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1 font-mono text-[10px]">
                <div>
                  status:{' '}
                  {bridgeStatus.isNative ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">NATIVE ENGINE: CONNECTED</span>
                  ) : (
                    <span>{bridgeStatus.isSimulatedNative ? 'SIMULATED_ANDROID_APK' : 'WEB_SANDBOX_WORKER'}</span>
                  )}
                </div>
                <div>plugin_id: MacroBridge</div>
                <div>accessibility_service: {bridgeStatus.isNative ? 'ACTIVE_BINDING' : 'READY'}</div>
                <div>floating_alert_window: READY</div>
              </div>

              {/* Direct Open Accessibility Button */}
              <button
                onClick={() => {
                  onEnableAccessibility();
                  setShowStatusModal(false);
                }}
                className="w-full py-1.5 border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] font-bold cursor-pointer transition-colors"
              >
                [ OPEN ACCESSIBILITY SETTINGS ]
              </button>

              {/* Simulation Mode Toggle */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--text-primary)] text-xs block">
                    Simulate Android APK
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Routes calls via MacroBridge plugin
                  </span>
                </div>
                <button
                  onClick={() => {
                    onToggleSimulatedNative(!bridgeStatus.isSimulatedNative);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold border transition-colors cursor-pointer ${
                    bridgeStatus.isSimulatedNative
                      ? 'border-emerald-600 bg-emerald-500 text-slate-950'
                      : 'border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  [ {bridgeStatus.isSimulatedNative ? 'ENABLED' : 'DISABLED'} ]
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full py-1.5 border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] font-bold cursor-pointer transition-colors"
            >
              [ CLOSE ]
            </button>
          </div>
        </div>
      )}
    </>
  );
};
