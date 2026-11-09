import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MacroLanguage,
  MacroLog,
  MacroTemplate,
  ProSuite,
  TouchEventMarker,
  UIThemeId
} from './types/macro';
import { nativeExecutorBridge, BridgeStatus } from './services/nativeExecutorBridge';
import { MacroRunner } from './services/macroRunner';
import { TopBar } from './components/TopBar';
import { BottomNavBar, MainTab } from './components/BottomNavBar';
import { HomeTab } from './components/HomeTab';
import { TemplatesTab } from './components/TemplatesTab';
import { PremiumTab } from './components/PremiumTab';
import { ThemeSwitcherModal } from './components/ThemeSwitcherModal';
import { FloatingWidgetSimulator } from './components/FloatingWidgetSimulator';
import { ScreenshotCoordinatePicker } from './components/ScreenshotCoordinatePicker';
import { STARTER_TEMPLATES } from './data/templates';
import { PRO_SUITES } from './data/proSuites';

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
  // Theme state (Clean Paper Light as default)
  const [currentTheme, setCurrentTheme] = useState<UIThemeId>('clean-light');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isImagePickerModalOpen, setIsImagePickerModalOpen] = useState<boolean>(false);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<MainTab>('home');

  // Language & Code state
  const [currentLanguage, setCurrentLanguage] = useState<MacroLanguage>('javascript');
  const [code, setCode] = useState<string>(DEFAULT_CODE_BY_LANG.javascript);

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

  // Instantiated Macro Runner
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
    // If current code is the default of previous language, replace with new default
    const previousDefault = DEFAULT_CODE_BY_LANG[currentLanguage];
    if (code.trim() === previousDefault.trim() || code.trim() === '') {
      setCode(DEFAULT_CODE_BY_LANG[lang]);
    }
  };

  // Run macro handler
  const handleRunMacro = async () => {
    if (isExecuting) return;
    setElapsedMs(0);
    // Route to native bridge for QuickJS / Luau if in native mode
    if (bridgeStatus.isNative && currentLanguage === 'quickjs') {
      await nativeExecutorBridge.runQuickJS(code);
    } else if (bridgeStatus.isNative && currentLanguage === 'luau') {
      await nativeExecutorBridge.runLuau(code);
    }
    // Always trigger simulator runner for visual feedback & timings
    await macroRunner.execute(code, currentLanguage);
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

  return (
    <div className="min-h-[100dvh] max-w-full overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col antialiased select-none font-mono">
      {/* Top App Bar */}
      <TopBar
        bridgeStatus={bridgeStatus}
        onToggleSimulatedNative={handleToggleSimulatedNative}
        onToggleOverlay={handleToggleOverlay}
        overlayActive={overlayActive}
        onOpenThemeSwitcher={() => setIsThemeModalOpen(true)}
        onOpenImagePicker={() => setIsImagePickerModalOpen(true)}
        activeThemeName={currentTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-x-hidden pb-24">
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
              await macroRunner.execute(script, lang);
            }}
            onStopScript={handleStopMacro}
          />
        )}
      </main>

      {/* Floating Controller Widget Simulator (SYSTEM_ALERT_WINDOW) */}
      <FloatingWidgetSimulator
        isVisible={overlayActive}
        isExecuting={isExecuting}
        onRun={handleRunMacro}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-2xs animate-in fade-in duration-100">
          <ScreenshotCoordinatePicker
            isModal={true}
            onClose={() => setIsImagePickerModalOpen(false)}
            onInsertToEditor={(x, y, hex) => {
              setCode((prev) => prev + `\nawait tap(${x}, ${y}); // color: ${hex}`);
              setActiveTab('home');
              setIsImagePickerModalOpen(false);
            }}
          />
        </div>
      )}

      {/* Fixed Bottom Navigation Bar (Strictly 3 tabs) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        proUnlockedCount={unlockedSuiteIds.length}
      />
    </div>
  );
}
