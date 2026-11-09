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
}

export const TopBar: React.FC<TopBarProps> = ({
  bridgeStatus,
  onToggleSimulatedNative,
  onToggleOverlay,
  overlayActive,
  onOpenThemeSwitcher,
  onOpenImagePicker,
  activeThemeName
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

          {/* Engine Status Text Bracket */}
          <button
            onClick={() => setShowStatusModal(true)}
            className="cursor-pointer text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline whitespace-nowrap shrink-0"
            title="Inspect Runtime Environment"
          >
            [
            {bridgeStatus.isNative || bridgeStatus.isSimulatedNative
              ? 'status:native'
              : 'status:sandbox'}
            ]
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
              <p>Capacitor Android Container / JNI Bridge Architecture</p>

              <div className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1 font-mono text-[10px]">
                <div>runtime: {bridgeStatus.isNative ? 'ANDROID_CONTAINER' : bridgeStatus.isSimulatedNative ? 'SIMULATED_ANDROID_APK' : 'WEB_SANDBOX_WORKER'}</div>
                <div>accessibility_service: BOUND</div>
                <div>quickjs_jni_so: READY</div>
                <div>floating_alert_window: READY</div>
              </div>

              {/* Simulation Mode Toggle */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--text-primary)] text-xs block">
                    Simulate Android APK
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Routes calls via mock JNI bridge
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
