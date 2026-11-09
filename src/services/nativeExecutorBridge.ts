import { registerPlugin, Capacitor } from '@capacitor/core';
import { MacroPayload, MacroLog } from '../types/macro';

export interface MacroBridgePlugin {
  executeMacro(options: { language: string; code: string }): Promise<{ success?: boolean; output?: string; [key: string]: any }>;
  openAccessibilitySettings(): Promise<{ success?: boolean; opened?: boolean; [key: string]: any }>;
  checkAccessibilityPermission?(): Promise<{ granted: boolean; [key: string]: any }>;
  setOverlayVisible?(options: { visible: boolean }): Promise<{ success: boolean; [key: string]: any }>;
  dispatchGestures?(payload: MacroPayload): Promise<{ dispatched: boolean; count: number }>;
}

/**
 * Direct Capacitor Plugin Binding for native Android APK.
 * When running as native APK, Capacitor routes directly to com.acroscript.MacroBridge (or registered native plugin).
 * On web preview, provides a non-blocking mock fallback.
 */
export const MacroBridge = registerPlugin<MacroBridgePlugin>('MacroBridge', {
  web: () => ({
    async executeMacro(options: { language: string; code: string }) {
      return {
        success: true,
        output: `[MacroBridge] Executed ${options.language} macro (${options.code.length} bytes). Running in Web preview.`
      };
    },
    async openAccessibilitySettings() {
      return {
        success: true,
        opened: false,
        message: 'Android Accessibility settings are accessible when running as a native Android APK.'
      };
    },
    async setOverlayVisible(options: { visible: boolean }) {
      return { success: true, visible: options.visible };
    }
  })
});

export interface BridgeStatus {
  isNative: boolean;
  isSimulatedNative: boolean;
  platform: 'android' | 'web';
  engineReady: boolean;
  overlayActive: boolean;
  serviceBound: boolean;
}

type LogCallback = (log: Omit<MacroLog, 'id'>) => void;

class NativeExecutorBridgeService {
  private logListeners: Set<LogCallback> = new Set();
  private overlayListeners: Set<(active: boolean) => void> = new Set();
  private simulatedNativeMode: boolean = false;
  private overlayActive: boolean = false;

  /**
   * Safely inspects if Capacitor runtime is injected by native Android container.
   */
  public isNativePlatform(): boolean {
    if (this.simulatedNativeMode) return true;
    try {
      if (typeof Capacitor !== 'undefined' && typeof Capacitor.isNativePlatform === 'function') {
        return Capacitor.isNativePlatform();
      }
    } catch {
      // Fallback check
    }

    const win = typeof window !== 'undefined' ? (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }) : null;
    if (win?.Capacitor && typeof win.Capacitor.isNativePlatform === 'function') {
      try {
        return win.Capacitor.isNativePlatform();
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Toggle simulated native mode for testing Android APK behaviors in Web preview
   */
  public setSimulatedNativeMode(enabled: boolean): void {
    this.simulatedNativeMode = enabled;
    this.emitLog({
      timestamp: Date.now(),
      elapsedMs: 0,
      level: 'info',
      message: enabled
        ? 'Native Android APK Simulation Activated: MacroBridge plugin calls enabled.'
        : 'Reverted to Web Sandbox Mode.'
    });
  }

  public getStatus(): BridgeStatus {
    const isNative = this.isNativePlatform();
    return {
      isNative,
      isSimulatedNative: this.simulatedNativeMode,
      platform: isNative ? 'android' : 'web',
      engineReady: true,
      overlayActive: this.overlayActive,
      serviceBound: isNative
    };
  }

  public subscribeLogs(callback: LogCallback): () => void {
    this.logListeners.add(callback);
    return () => {
      this.logListeners.delete(callback);
    };
  }

  public subscribeOverlay(callback: (active: boolean) => void): () => void {
    this.overlayListeners.add(callback);
    return () => {
      this.overlayListeners.delete(callback);
    };
  }

  public emitLog(log: Omit<MacroLog, 'id'>): void {
    this.logListeners.forEach(listener => listener(log));
  }

  /**
   * Direct invocation of Android Accessibility Settings via MacroBridge plugin
   */
  public async openAccessibilitySettings(): Promise<{ success: boolean; message?: string }> {
    this.emitLog({
      timestamp: Date.now(),
      elapsedMs: 0,
      level: 'info',
      message: '[MacroBridge] Requesting Android Accessibility Settings...'
    });

    try {
      // Check if native plugin is available via registered plugin or window.Capacitor
      const nativePlugin = (window as any)?.Capacitor?.Plugins?.MacroBridge || MacroBridge;
      const res = await nativePlugin.openAccessibilitySettings();
      
      this.emitLog({
        timestamp: Date.now(),
        elapsedMs: 0,
        level: 'success',
        message: '[MacroBridge] Accessibility settings intent triggered successfully.'
      });
      return { success: true, message: res?.message };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.emitLog({
        timestamp: Date.now(),
        elapsedMs: 0,
        level: 'error',
        message: `[MacroBridge Exception] Failed to open accessibility settings: ${msg}`
      });
      return { success: false, message: msg };
    }
  }

  /**
   * Executes macro through MacroBridge plugin
   */
  public async executeNativeMacro(language: string, code: string): Promise<{ success: boolean; output: string }> {
    const nativePlugin = (window as any)?.Capacitor?.Plugins?.MacroBridge || MacroBridge;
    const res = await nativePlugin.executeMacro({ language, code });
    const output = res?.output !== undefined
      ? (typeof res.output === 'string' ? res.output : JSON.stringify(res.output, null, 2))
      : 'Native macro execution completed.';
    return { success: res?.success !== false, output };
  }

  /**
   * Controls a native SYSTEM_ALERT_WINDOW floating start/stop widget over other apps.
   */
  public async toggleFloatingOverlay(enabled: boolean): Promise<boolean> {
    this.overlayActive = enabled;
    const isNative = this.isNativePlatform();

    this.emitLog({
      timestamp: Date.now(),
      elapsedMs: 0,
      level: 'info',
      message: enabled
        ? (isNative
            ? '[Android Overlay] Native WindowManager floating controller attached over screen'
            : '[Web Overlay Widget] Floating quick-action controller activated')
        : (isNative
            ? '[Android Overlay] Native WindowManager floating controller detached'
            : '[Web Overlay Widget] Floating controller hidden')
    });

    this.overlayListeners.forEach(listener => listener(enabled));

    if (isNative && !this.simulatedNativeMode) {
      const nativePlugin = (window as any)?.Capacitor?.Plugins?.MacroBridge || MacroBridge;
      if (typeof nativePlugin?.setOverlayVisible === 'function') {
        try {
          const res = await nativePlugin.setOverlayVisible({ visible: enabled });
          return !!res?.success;
        } catch {
          return false;
        }
      }
    }

    return true;
  }
}

export const nativeExecutorBridge = new NativeExecutorBridgeService();
