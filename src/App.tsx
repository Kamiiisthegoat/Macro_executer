import React, { useState, useEffect, useRef, useMemo } from 'react';
import { registerPlugin, Capacitor } from '@capacitor/core';
import {
  MacroLanguage,
  MacroLog,
  MacroTemplate,
  ProSuite,
  TouchEventMarker,
  UIThemeId,
  PipelineBlock
} from './types/macro';
import { nativeExecutorBridge, BridgeStatus } from './services/nativeExecutorBridge';
import { MacroRunner } from './services/macroRunner';
import { TopBar } from './components/TopBar';
import { SegmentedTabBar, MainTab } from './components/SegmentedTabBar';
import { SlimStatusFooter } from './components/SlimStatusFooter';
import { HomeTab } from './components/HomeTab';
import { TemplatesTab } from './components/TemplatesTab';
import { PremiumTab } from './components/PremiumTab';
import { ThemeSwitcherModal } from './components/ThemeSwitcherModal';
import { FloatingWidgetSimulator } from './components/FloatingWidgetSimulator';
import { ScreenshotCoordinatePicker } from './components/ScreenshotCoordinatePicker';
import { STARTER_TEMPLATES } from './data/templates';
import { PRO_SUITES } from './data/proSuites';

// Direct Capacitor Plugin Binding
const MacroBridge = registerPlugin<any>('MacroBridge');

const DEFAULT_CODE_BY_LANG: Record<MacroLanguage, string> = {
  javascript: `// Universal JavaScript Macro Routine
const targetX = 200;
const targetY = 450;

console.log("Starting custom macro sequence...");

// 1. Initial trigger tap
await tap(targetX, targetY);
await wait(150);

// 2. Loop rapid taps with 60ms delay
await loop(5, async (i) => {
  await tap(targetX, targetY);
  await wait(60);
});

// 3. Confirm with swipe
await swipe(195, 650, 195, 250, 300);

console.log("Macro completed successfully.");`,
  quickjs: `// Embedded QuickJS Ultra-Lightweight Routine
var x = 200;
var y = 450;
console.log("[QuickJS] Running embedded script...");
tap(x, y);
wait(150);
for (var i = 0; i < 5; i++) {
  tap(x, y);
  wait(60);
}
swipe(195, 650, 195, 250, 300);
console.log("[QuickJS] Routine finished.");`,
  luau: `-- Luau Typed Logic Routine
local targetX: number = 200
local targetY: number = 450

print("Executing Luau Macro Routine...")
tap(targetX, targetY)
wait(150)

for i = 1, 5 do
  tap(targetX, targetY)
  wait(60)
end

swipe(195, 650, 195, 250, 300)
print("Luau Sequence Finished.")`,
  kotlin: `// Native Android AccessibilityService Gesture Routine
class MacroService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}

    fun executeGesture() {
        val path = Path().apply {
            moveTo(200f, 450f)
        }
        val stroke = GestureDescription.StrokeDescription(path, 0L, 50L)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()
        dispatchGesture(gesture, null, null)
    }
}`,
  cpp: `// High-Speed C++ NDK / Linux evdev Routine
#include <unistd.h>
#include <linux/uinput.h>

extern "C" JNIEXPORT void JNICALL
Java_com_acroscript_native_run_1macro(JNIEnv* env, jobject thiz) {
    // Direct Linux /dev/uinput injection
    int fd = open("/dev/uinput", O_WRONLY | O_NONBLOCK);
    if (fd >= 0) {
        emit_tap(fd, 200, 450, 30000); // 30ms tap
        close(fd);
    }
}`
};

export default function App() {
  // Theme state (Matte Obsidian as default)
  const [currentTheme, setCurrentTheme] = useState<UIThemeId>('matte-obsidian');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isImagePickerModalOpen, setIsImagePickerModalOpen] = useState<boolean>(false);

  // Navigation tab state (Home, Templates, Premium)
  const [activeTab, setActiveTab] = useState<MainTab>('home');

  // Language & Code state (Single-Language Mode)
  const [currentLanguage, setCurrentLanguage] = useState<MacroLanguage>('quickjs');
  const [code, setCode] = useState<string>(DEFAULT_CODE_BY_LANG.quickjs);

  // Multi-Language Pipeline Mode state
  const [isMultiLanguage, setIsMultiLanguage] = useState<boolean>(false);
  const [pipelineBlocks, setPipelineBlocks] = useState<PipelineBlock[]>([
    {
      id: 'block-1',
      language: 'cpp',
      code: `// 1. High-speed NDK tap via JNI evdev\nnativeTap(540.0f, 1120.0f, 25);\nsharedState["lastTapX"] = 540;`
    },
    {
      id: 'block-2',
      language: 'luau',
      code: `-- 2. Typed Luau condition & delay check\nlocal targetX = sharedState.lastTapX or 540\nwait(120)\ntap(targetX, 450)`
    },
    {
      id: 'block-3',
      language: 'quickjs',
      code: `// 3. QuickJS event completion & UI confirm\ntap(200, 450);\nconsole.log("Combined multi-language pipeline completed.");`
    }
  ]);

  // Execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [logs, setLogs] = useState<MacroLog[]>([]);
  const [touchEvents, setTouchEvents] = useState<TouchEventMarker[]>([]);

  // Pro unlocked suites state
  const [unlockedSuiteIds, setUnlockedSuiteIds] = useState<string[]>(['pro-smart-humanizer']);

  // Native bridge state
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>(nativeExecutorBridge.getStatus());
  const [overlayActive, setOverlayActive] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const timerFrameRef = useRef<number | null>(null);

  // Initialize theme from localStorage or default
  useEffect(() => {
    const savedTheme = localStorage.getItem('acroscript_theme') as UIThemeId;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Sync theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'theme-matte-obsidian',
      'theme-minimal-dark',
      'theme-cyber-neon',
      'theme-clean-light',
      'theme-retro-terminal',
      'theme-glass-frost',
      'dark'
    );
    root.classList.add(`theme-${currentTheme}`);
    if (currentTheme !== 'clean-light') {
      root.classList.add('dark');
    }
    localStorage.setItem('acroscript_theme', currentTheme);
  }, [currentTheme]);

  // Subscribe to bridge events
  useEffect(() => {
    const unsubLogs = nativeExecutorBridge.subscribeLogs((log) => {
      setLogs((prev) => [
        ...prev,
        {
          ...log,
          id: crypto.randomUUID()
        }
      ]);
    });

    const unsubOverlay = nativeExecutorBridge.subscribeOverlay((active) => {
      setOverlayActive(active);
    });

    return () => {
      unsubLogs();
      unsubOverlay();
    };
  }, []);

  // Instantiated Macro Runner (for web sandbox simulation)
  const macroRunner = useMemo(() => {
    return new MacroRunner({
      onLog: (log) => {
        setLogs((prev) => [...prev, log]);
      },
      onTouchEvent: (event) => {
        setTouchEvents((prev) => [...prev.slice(-30), event]);
      },
      onStatusChange: (running) => {
        setIsExecuting(running);
        if (running) {
          startTimeRef.current = performance.now();
          const updateTimer = () => {
            setElapsedMs(performance.now() - startTimeRef.current);
            timerFrameRef.current = requestAnimationFrame(updateTimer);
          };
          timerFrameRef.current = requestAnimationFrame(updateTimer);
        } else {
          if (timerFrameRef.current) {
            cancelAnimationFrame(timerFrameRef.current);
            timerFrameRef.current = null;
          }
        }
      }
    });
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);
      }
    };
  }, []);

  // Handle language switch
  const handleLanguageChange = (lang: MacroLanguage) => {
    setCurrentLanguage(lang);
    const previousDefault = DEFAULT_CODE_BY_LANG[currentLanguage];
    if (code.trim() === previousDefault.trim() || code.trim() === '') {
      setCode(DEFAULT_CODE_BY_LANG[lang]);
    }
  };

  /**
   * Primary Single-Language Execution Router:
   * When Capacitor.isNativePlatform() is true, route directly to MacroBridge.executeMacro()
   */
  const executeMacroWithRouting = async (scriptCode: string, lang: MacroLanguage) => {
    if (isExecuting) return;
    setElapsedMs(0);

    const isNative = Capacitor.isNativePlatform() || bridgeStatus.isSimulatedNative;

    if (isNative) {
      setIsExecuting(true);
      startTimeRef.current = performance.now();
      const runTimer = () => {
        setElapsedMs(performance.now() - startTimeRef.current);
        timerFrameRef.current = requestAnimationFrame(runTimer);
      };
      timerFrameRef.current = requestAnimationFrame(runTimer);

      setLogs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          elapsedMs: 0,
          level: 'info',
          message: `Starting execution [Engine: ${lang.toUpperCase()}] via native MacroBridge...`
        }
      ]);

      try {
        const plugin = (window as any)?.Capacitor?.Plugins?.MacroBridge || MacroBridge;
        const res = await plugin.executeMacro({
          language: lang,
          code: scriptCode
        });

        const finalElapsed = performance.now() - startTimeRef.current;
        const outputText = res?.output !== undefined
          ? (typeof res.output === 'string' ? res.output : JSON.stringify(res.output, null, 2))
          : `[MacroBridge] ${lang.toUpperCase()} routine executed successfully.`;

        setLogs((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            elapsedMs: finalElapsed,
            level: 'success',
            message: outputText
          }
        ]);
      } catch (err: unknown) {
        const finalElapsed = performance.now() - startTimeRef.current;
        const errorMsg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as any).message)
            : String(err);

        setLogs((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            elapsedMs: finalElapsed,
            level: 'error',
            message: `Native MacroBridge Error: ${errorMsg}`
          }
        ]);
      } finally {
        setIsExecuting(false);
        if (timerFrameRef.current) {
          cancelAnimationFrame(timerFrameRef.current);
          timerFrameRef.current = null;
        }
      }
    } else {
      // In Web preview browser sandbox (no native platform):
      await macroRunner.execute(scriptCode, lang);
    }
  };

  /**
   * Combined Multi-Language Pipeline Execution Router:
   * Dispatches all blocks sequentially or via MacroBridge.executePipeline()
   */
  const executePipelineWithRouting = async () => {
    if (isExecuting || pipelineBlocks.length === 0) return;
    setElapsedMs(0);

    const isNative = Capacitor.isNativePlatform() || bridgeStatus.isSimulatedNative;

    setIsExecuting(true);
    startTimeRef.current = performance.now();
    const runTimer = () => {
      setElapsedMs(performance.now() - startTimeRef.current);
      timerFrameRef.current = requestAnimationFrame(runTimer);
    };
    timerFrameRef.current = requestAnimationFrame(runTimer);

    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: 0,
        level: 'info',
        message: `[PIPELINE] Starting combined execution (${pipelineBlocks.length} blocks)...`
      }
    ]);

    try {
      const plugin = (window as any)?.Capacitor?.Plugins?.MacroBridge || MacroBridge;

      if (typeof plugin.executePipeline === 'function') {
        const res = await plugin.executePipeline({
          blocks: pipelineBlocks.map((b) => ({ language: b.language, code: b.code })),
          sharedState: {}
        });

        const finalElapsed = performance.now() - startTimeRef.current;
        const outputText = res?.output !== undefined
          ? (typeof res.output === 'string' ? res.output : JSON.stringify(res.output, null, 2))
          : `Combined pipeline executed successfully (${pipelineBlocks.length} blocks).`;

        setLogs((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            elapsedMs: finalElapsed,
            level: 'success',
            message: outputText
          }
        ]);
      } else {
        // Sequentially execute blocks via executeMacro
        for (let i = 0; i < pipelineBlocks.length; i++) {
          const b = pipelineBlocks[i];
          const stepElapsed = performance.now() - startTimeRef.current;
          setLogs((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              elapsedMs: stepElapsed,
              level: 'info',
              message: `[Step ${i + 1}/${pipelineBlocks.length}] Executing ${b.language.toUpperCase()} block...`
            }
          ]);

          if (isNative) {
            const res = await plugin.executeMacro({ language: b.language, code: b.code });
            const output = res?.output !== undefined ? (typeof res.output === 'string' ? res.output : JSON.stringify(res.output)) : 'Done';
            setLogs((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                elapsedMs: performance.now() - startTimeRef.current,
                level: 'success',
                message: `[Step ${i + 1} Output] ${output}`
              }
            ]);
          } else {
            await macroRunner.execute(b.code, b.language);
          }
        }
      }
    } catch (err: unknown) {
      const finalElapsed = performance.now() - startTimeRef.current;
      const errorMsg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as any).message)
          : String(err);

      setLogs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          elapsedMs: finalElapsed,
          level: 'error',
          message: `Pipeline Execution Error: ${errorMsg}`
        }
      ]);
    } finally {
      setIsExecuting(false);
      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);
        timerFrameRef.current = null;
      }
    }
  };

  // Run macro handler from Home workspace
  const handleRunMacro = async () => {
    await executeMacroWithRouting(code, currentLanguage);
  };

  // Stop macro handler
  const handleStopMacro = () => {
    macroRunner.stop();
  };

  // Clear logs handler
  const handleClearLogs = () => {
    setLogs([]);
    setTouchEvents([]);
    setElapsedMs(0);
  };

  // Reset code handler
  const handleResetCode = () => {
    setCode(DEFAULT_CODE_BY_LANG[currentLanguage]);
  };

  // Template selection
  const handleSelectTemplate = (template: MacroTemplate) => {
    const templateCode = template.codeSnippets[currentLanguage] || template.codeSnippets.javascript;
    setCode(templateCode);
    setActiveTab('home');
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: 0,
        level: 'info',
        message: `Loaded Template: "${template.title}" into workspace.`
      }
    ]);
  };

  // Pro Suite loading
  const handleLoadProSuite = (suite: ProSuite) => {
    const suiteCode = suite.codeSnippets[currentLanguage] || suite.codeSnippets.javascript;
    setCode(suiteCode);
    setActiveTab('home');
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: 0,
        level: 'info',
        message: `Loaded Pro Suite: "${suite.title}" into workspace.`
      }
    ]);
  };

  // Unlock pro suite
  const handleUnlockSuite = (suiteId: string) => {
    if (!unlockedSuiteIds.includes(suiteId)) {
      setUnlockedSuiteIds((prev) => [...prev, suiteId]);
    }
  };

  // Toggle simulated native mode
  const handleToggleSimulatedNative = (enabled: boolean) => {
    nativeExecutorBridge.setSimulatedNativeMode(enabled);
    setBridgeStatus(nativeExecutorBridge.getStatus());
  };

  // Toggle floating overlay
  const handleToggleOverlay = () => {
    const next = !overlayActive;
    nativeExecutorBridge.toggleFloatingOverlay(next);
  };

  // Trigger Android Accessibility Settings
  const handleEnableAccessibility = async () => {
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: 0,
        level: 'info',
        message: '[MacroBridge] Requesting openAccessibilitySettings()...'
      }
    ]);

    try {
      const plugin = (window as any)?.Capacitor?.Plugins?.MacroBridge || MacroBridge;
      const res = await plugin.openAccessibilitySettings();
      setLogs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          elapsedMs: 0,
          level: 'success',
          message: res?.message || '[MacroBridge] Accessibility settings intent dispatched.'
        }
      ]);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as any).message)
          : String(err);

      setLogs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          elapsedMs: 0,
          level: 'error',
          message: `[MacroBridge] Accessibility Error: ${errorMsg}`
        }
      ]);
    }
  };

  return (
    <div className="min-h-[100dvh] max-w-full overflow-x-hidden bg-[#0A0A0A] text-[#F2F2F2] flex flex-col antialiased select-none font-sans">
      {/* 1. Compact Top Window Header Bar */}
      <TopBar
        bridgeStatus={bridgeStatus}
        onToggleSimulatedNative={handleToggleSimulatedNative}
        onToggleOverlay={handleToggleOverlay}
        overlayActive={overlayActive}
        onOpenThemeSwitcher={() => setIsThemeModalOpen(true)}
        onOpenImagePicker={() => setIsImagePickerModalOpen(true)}
        activeThemeName={currentTheme}
        onEnableAccessibility={handleEnableAccessibility}
      />

      {/* 2. Segmented Tab Bar (Directly Below Header) */}
      <SegmentedTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        proUnlockedCount={unlockedSuiteIds.length}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-xl mx-auto overflow-x-hidden">
        {activeTab === 'home' && (
          <HomeTab
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            code={code}
            onCodeChange={setCode}
            onRunMacro={handleRunMacro}
            onStopMacro={handleStopMacro}
            isExecuting={isExecuting}
            elapsedMs={elapsedMs}
            logs={logs}
            onClearLogs={handleClearLogs}
            touchEvents={touchEvents}
            onResetCode={handleResetCode}
            isNativePlatform={bridgeStatus.isNative}
            isMultiLanguage={isMultiLanguage}
            onToggleMultiLanguage={setIsMultiLanguage}
            pipelineBlocks={pipelineBlocks}
            onUpdatePipelineBlocks={setPipelineBlocks}
            onRunPipeline={executePipelineWithRouting}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesTab
            currentLanguage={currentLanguage}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {activeTab === 'premium' && (
          <PremiumTab
            currentLanguage={currentLanguage}
            unlockedSuiteIds={unlockedSuiteIds}
            isExecuting={isExecuting}
            onUnlockSuite={handleUnlockSuite}
            onLoadToExecutor={(script, title) => {
              setCode(script);
              setActiveTab('home');
              setLogs((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  timestamp: Date.now(),
                  elapsedMs: 0,
                  level: 'info',
                  message: `Loaded Pre-Made Config: "${title}" into workspace.`
                }
              ]);
            }}
            onRunScript={async (script, lang) => {
              setCode(script);
              setCurrentLanguage(lang);
              await executeMacroWithRouting(script, lang);
            }}
            onStopScript={handleStopMacro}
          />
        )}
      </main>

      {/* 4. Fixed Slim Bottom Status Footer */}
      <SlimStatusFooter
        isExecuting={isExecuting}
        currentLanguage={currentLanguage}
        version="v1.0"
        isMultiLanguage={isMultiLanguage}
        blockCount={pipelineBlocks.length}
      />

      {/* Floating Controller Widget Simulator (SYSTEM_ALERT_WINDOW) */}
      <FloatingWidgetSimulator
        isVisible={overlayActive}
        isExecuting={isExecuting}
        onRun={isMultiLanguage ? executePipelineWithRouting : handleRunMacro}
        onStop={handleStopMacro}
        onClose={() => nativeExecutorBridge.toggleFloatingOverlay(false)}
      />

      {/* UI Style Switcher Modal */}
      {isThemeModalOpen && (
        <ThemeSwitcherModal
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}

      {/* Screenshot Coordinate & Color Picker Modal */}
      {isImagePickerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100">
          <ScreenshotCoordinatePicker
            isModal={true}
            onClose={() => setIsImagePickerModalOpen(false)}
            onInsertToEditor={(x, y, hex) => {
              if (isMultiLanguage && pipelineBlocks.length > 0) {
                const lastIdx = pipelineBlocks.length - 1;
                const lastBlock = pipelineBlocks[lastIdx];
                const updatedCode = lastBlock.code + `\nawait tap(${x}, ${y}); // color: ${hex}`;
                const nextBlocks = [...pipelineBlocks];
                nextBlocks[lastIdx] = { ...lastBlock, code: updatedCode };
                setPipelineBlocks(nextBlocks);
              } else {
                setCode((prev) => prev + `\nawait tap(${x}, ${y}); // color: ${hex}`);
              }
              setActiveTab('home');
              setIsImagePickerModalOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
