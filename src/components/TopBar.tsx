import React, { useState } from 'react';
import { Palette, Crosshair, ShieldCheck, Layers, HelpCircle, Activity } from 'lucide-react';
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
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 h-12 border-b border-[#242424] bg-[#0A0A0A] select-none">
        {/* Left: Window Title & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm text-[#F2F2F2] tracking-tight whitespace-nowrap">
              MacroExecutor
            </span>
            <span className="text-[10px] font-mono text-[#737373] tracking-wider hidden sm:inline-block">
              PRO
            </span>
          </div>

          {/* Native Engine Connected indicator badge */}
          {bridgeStatus.isNative ? (
            <button
              onClick={() => setShowStatusModal(true)}
              className="cursor-pointer text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Native Android container connected via MacroBridge plugin"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>NATIVE</span>
            </button>
          ) : (
            <button
              onClick={() => setShowStatusModal(true)}
              className="cursor-pointer text-[10px] font-mono text-[#737373] hover:text-[#A3A3A3] bg-[#141414] border border-[#242424] px-1.5 py-0.5 rounded transition-colors whitespace-nowrap"
              title="Inspect Runtime Environment"
            >
              {bridgeStatus.isSimulatedNative ? 'SIMULATED' : 'SANDBOX'}
            </button>
          )}
        </div>

        {/* Right: Compact 32x32 Square Icon Buttons */}
        <div className="flex items-center gap-1.5">
          {/* 1. Accessibility Action / Settings Trigger */}
          <button
            onClick={onEnableAccessibility}
            className="w-8 h-8 rounded-[6px] border border-[#2A2A2A] bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#F2F2F2] flex items-center justify-center transition-all cursor-pointer relative"
            title="Open Android Accessibility Settings (MacroBridge.openAccessibilitySettings)"
          >
            <ShieldCheck className="w-4 h-4" />
            {bridgeStatus.isNative && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          {/* 2. Coordinate Picker / Spy Tool Trigger */}
          <button
            onClick={onOpenImagePicker}
            className="w-8 h-8 rounded-[6px] border border-[#2A2A2A] bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#F2F2F2] flex items-center justify-center transition-all cursor-pointer"
            title="Open Screenshot Coordinate & Color Picker Tool"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* 3. Floating Overlay Widget Toggle (SYSTEM_ALERT_WINDOW) */}
          <button
            onClick={onToggleOverlay}
            className={`w-8 h-8 rounded-[6px] border transition-all flex items-center justify-center cursor-pointer ${
              overlayActive
                ? 'border-[#525252] bg-[#222222] text-[#F2F2F2]'
                : 'border-[#2A2A2A] bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#F2F2F2]'
            }`}
            title="Toggle Floating Start/Stop Overlay Widget (SYSTEM_ALERT_WINDOW)"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* 4. UI Style Switcher Palette Trigger */}
          <button
            onClick={onOpenThemeSwitcher}
            className="w-8 h-8 rounded-[6px] border border-[#2A2A2A] bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#F2F2F2] flex items-center justify-center transition-all cursor-pointer"
            title={`UI Style Switcher (Current: ${activeThemeName})`}
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Runtime Environment Probe Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100 font-sans text-xs">
          <div className="w-full max-w-sm bg-[#141414] border border-[#242424] rounded-lg p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242424] pb-2.5">
              <span className="font-bold text-[#F2F2F2] tracking-tight uppercase text-xs">
                Runtime Engine Status
              </span>
              <button
                onClick={() => setShowStatusModal(false)}
                className="cursor-pointer text-[#737373] hover:text-[#F2F2F2] font-mono text-sm px-1.5 py-0.5 rounded hover:bg-[#222222] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#A3A3A3] leading-relaxed">
              <div className="p-3 bg-[#0E0E0E] border border-[#222222] rounded-md space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#737373]">Engine Mode:</span>
                  <span className={bridgeStatus.isNative ? 'text-emerald-400 font-bold' : 'text-[#F2F2F2]'}>
                    {bridgeStatus.isNative ? 'NATIVE_ANDROID_CONTAINER' : bridgeStatus.isSimulatedNative ? 'SIMULATED_ANDROID_APK' : 'WEB_SANDBOX_WORKER'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#737373]">Plugin ID:</span>
                  <span className="text-[#F2F2F2]">com.custom.macroexecutor.MacroBridge</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#737373]">Accessibility:</span>
                  <span className="text-emerald-400 font-bold">{bridgeStatus.isNative ? 'BOUND' : 'READY'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#737373]">NDK / CMake:</span>
                  <span className="text-[#F2F2F2]">libmacro_engine.so (QuickJS + Luau)</span>
                </div>
              </div>

              {/* Direct Open Accessibility Button */}
              <button
                onClick={() => {
                  onEnableAccessibility();
                  setShowStatusModal(false);
                }}
                className="w-full py-2 border border-[#2A2A2A] bg-[#1C1C1C] hover:bg-[#262626] text-[#F2F2F2] font-semibold rounded-md cursor-pointer transition-colors"
              >
                Open Accessibility Settings
              </button>

              {/* Simulation Mode Toggle */}
              <div className="pt-2 border-t border-[#222222] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#F2F2F2] text-xs block">
                    Simulate Android APK
                  </span>
                  <span className="text-[10px] text-[#737373]">
                    Routes calls via MacroBridge plugin mock
                  </span>
                </div>
                <button
                  onClick={() => {
                    onToggleSimulatedNative(!bridgeStatus.isSimulatedNative);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                    bridgeStatus.isSimulatedNative
                      ? 'border-emerald-600 bg-emerald-500/20 text-emerald-400'
                      : 'border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F2F2F2] hover:bg-[#1F1F1F]'
                  }`}
                >
                  {bridgeStatus.isSimulatedNative ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full py-2 border border-[#242424] bg-[#0E0E0E] text-[#A3A3A3] hover:text-[#F2F2F2] hover:bg-[#1A1A1A] font-semibold text-xs rounded-md cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
