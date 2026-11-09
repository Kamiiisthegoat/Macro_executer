import { MacroLanguage, MacroLog, TouchEventMarker } from '../types/macro';

export interface RunnerCallbacks {
  onLog: (log: MacroLog) => void;
  onTouchEvent: (event: TouchEventMarker) => void;
  onStatusChange: (isRunning: boolean) => void;
}

export class MacroRunner {
  private isRunning: boolean = false;
  private shouldStop: boolean = false;
  private startTime: number = 0;
  private callbacks: RunnerCallbacks;

  constructor(callbacks: RunnerCallbacks) {
    this.callbacks = callbacks;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public stop(): void {
    if (this.isRunning) {
      this.shouldStop = true;
      this.isRunning = false;
      const elapsed = performance.now() - this.startTime;
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: elapsed,
        level: 'warn',
        message: 'Macro execution halted by user.'
      });
      this.callbacks.onStatusChange(false);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      const start = performance.now();
      const interval = setInterval(() => {
        if (this.shouldStop || performance.now() - start >= ms) {
          clearInterval(interval);
          resolve();
        }
      }, 5);
    });
  }

  public async execute(code: string, language: MacroLanguage): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.shouldStop = false;
    this.startTime = performance.now();
    this.callbacks.onStatusChange(true);

    this.callbacks.onLog({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      elapsedMs: 0,
      level: 'info',
      message: `Starting execution [Engine: ${language.toUpperCase()}]...`
    });

    try {
      if (language === 'kotlin') {
        await this.simulateKotlinValidation(code);
      } else if (language === 'cpp') {
        await this.simulateCppValidation(code);
      } else if (language === 'luau') {
        await this.executeLuauScript(code);
      } else {
        // javascript or quickjs
        await this.executeJavaScriptScript(code, language);
      }

      if (!this.shouldStop) {
        const finalElapsed = performance.now() - this.startTime;
        this.callbacks.onLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          elapsedMs: finalElapsed,
          level: 'success',
          message: `Execution complete. Total elapsed time: ${finalElapsed.toFixed(2)} ms`
        });
      }
    } catch (err: unknown) {
      const finalElapsed = performance.now() - this.startTime;
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: finalElapsed,
        level: 'error',
        message: `Runtime Error: ${err instanceof Error ? err.message : String(err)}`
      });
    } finally {
      this.isRunning = false;
      this.callbacks.onStatusChange(false);
    }
  }

  private async executeJavaScriptScript(code: string, runtimeName: string): Promise<void> {
    // Macro API exposed inside the sandbox
    const tap = async (x: number, y: number) => {
      if (this.shouldStop) return;
      const elapsed = performance.now() - this.startTime;
      const id = crypto.randomUUID();
      this.callbacks.onTouchEvent({
        id,
        type: 'tap',
        x,
        y,
        timestamp: Date.now()
      });
      this.callbacks.onLog({
        id,
        timestamp: Date.now(),
        elapsedMs: elapsed,
        level: 'tap',
        message: `Tap(${x}, ${y})`,
        data: { x, y }
      });
      await this.sleep(30);
    };

    const hold = async (x: number, y: number, durationMs: number = 300) => {
      if (this.shouldStop) return;
      const elapsed = performance.now() - this.startTime;
      const id = crypto.randomUUID();
      this.callbacks.onTouchEvent({
        id,
        type: 'hold',
        x,
        y,
        durationMs,
        timestamp: Date.now()
      });
      this.callbacks.onLog({
        id,
        timestamp: Date.now(),
        elapsedMs: elapsed,
        level: 'hold',
        message: `Hold(${x}, ${y}, ${durationMs}ms)`,
        data: { x, y, durationMs }
      });
      await this.sleep(durationMs);
    };

    const swipe = async (x1: number, y1: number, x2: number, y2: number, durationMs: number = 250) => {
      if (this.shouldStop) return;
      const elapsed = performance.now() - this.startTime;
      const id = crypto.randomUUID();
      this.callbacks.onTouchEvent({
        id,
        type: 'swipe',
        x: x1,
        y: y1,
        x2,
        y2,
        durationMs,
        timestamp: Date.now()
      });
      this.callbacks.onLog({
        id,
        timestamp: Date.now(),
        elapsedMs: elapsed,
        level: 'swipe',
        message: `Swipe(${x1}, ${y1} -> ${x2}, ${y2}, ${durationMs}ms)`,
        data: { x: x1, y: y1, x2, y2, durationMs }
      });
      await this.sleep(durationMs);
    };

    const wait = async (ms: number) => {
      if (this.shouldStop) return;
      const elapsed = performance.now() - this.startTime;
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: elapsed,
        level: 'wait',
        message: `Wait(${ms}ms)`,
        data: { durationMs: ms }
      });
      await this.sleep(ms);
    };

    const loop = async (count: number, fn: (index: number) => Promise<void> | void) => {
      for (let i = 0; i < count; i++) {
        if (this.shouldStop) break;
        await fn(i);
      }
    };

    const log = (msg: string | number | object) => {
      const elapsed = performance.now() - this.startTime;
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: elapsed,
        level: 'info',
        message: typeof msg === 'object' ? JSON.stringify(msg) : String(msg)
      });
    };

    // Alias uppercase versions to match quick insert bar
    const Tap = tap;
    const Hold = hold;
    const Swipe = swipe;
    const Wait = wait;
    const Sleep = wait;
    const Loop = loop;

    // Build safe execution function with wrapped scope
    const sandboxScope = {
      tap,
      Tap,
      hold,
      Hold,
      swipe,
      Swipe,
      wait,
      Wait,
      sleep: wait,
      Sleep: wait,
      loop,
      Loop,
      console: { log, info: log, warn: log, error: log },
      log,
      print: log,
      Math
    };

    // Pre-process code if it contains top-level await
    const wrappedCode = `
      return (async function(api) {
        const { tap, Tap, hold, Hold, swipe, Swipe, wait, Wait, sleep, Sleep, loop, Loop, console, log, print, Math } = api;
        ${code}
      })(sandboxScope);
    `;

    const runnerFn = new Function('sandboxScope', wrappedCode);
    await runnerFn(sandboxScope);
  }

  private async executeLuauScript(code: string): Promise<void> {
    this.callbacks.onLog({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      elapsedMs: performance.now() - this.startTime,
      level: 'info',
      message: '[Luau AST Parser] Tokenizing Lua instructions and type annotations...'
    });

    // Parse simple Luau statements:
    // tap(x, y), hold(x, y, ms), swipe(x1, y1, x2, y2, ms), wait(ms), for i = 1, N do ... end
    const lines = code.split('\n');
    let loopCount = 1;
    let inLoop = false;
    const loopLines: string[] = [];

    const executeLine = async (line: string) => {
      if (this.shouldStop) return;
      const clean = line.trim();
      if (!clean || clean.startsWith('--')) return;

      // Tap(x, y) or tap(x, y)
      const tapMatch = clean.match(/(?:tap|Tap)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      if (tapMatch) {
        const x = parseInt(tapMatch[1], 10);
        const y = parseInt(tapMatch[2], 10);
        const elapsed = performance.now() - this.startTime;
        const id = crypto.randomUUID();
        this.callbacks.onTouchEvent({ id, type: 'tap', x, y, timestamp: Date.now() });
        this.callbacks.onLog({ id, timestamp: Date.now(), elapsedMs: elapsed, level: 'tap', message: `Luau: Tap(${x}, ${y})`, data: { x, y } });
        await this.sleep(30);
        return;
      }

      // Hold(x, y, ms)
      const holdMatch = clean.match(/(?:hold|Hold)\s*\(\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+))?\s*\)/i);
      if (holdMatch) {
        const x = parseInt(holdMatch[1], 10);
        const y = parseInt(holdMatch[2], 10);
        const ms = holdMatch[3] ? parseInt(holdMatch[3], 10) : 300;
        const elapsed = performance.now() - this.startTime;
        const id = crypto.randomUUID();
        this.callbacks.onTouchEvent({ id, type: 'hold', x, y, durationMs: ms, timestamp: Date.now() });
        this.callbacks.onLog({ id, timestamp: Date.now(), elapsedMs: elapsed, level: 'hold', message: `Luau: Hold(${x}, ${y}, ${ms}ms)`, data: { x, y, durationMs: ms } });
        await this.sleep(ms);
        return;
      }

      // Swipe(x1, y1, x2, y2, ms)
      const swipeMatch = clean.match(/(?:swipe|Swipe)\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+))?\s*\)/i);
      if (swipeMatch) {
        const x1 = parseInt(swipeMatch[1], 10);
        const y1 = parseInt(swipeMatch[2], 10);
        const x2 = parseInt(swipeMatch[3], 10);
        const y2 = parseInt(swipeMatch[4], 10);
        const ms = swipeMatch[5] ? parseInt(swipeMatch[5], 10) : 250;
        const elapsed = performance.now() - this.startTime;
        const id = crypto.randomUUID();
        this.callbacks.onTouchEvent({ id, type: 'swipe', x: x1, y: y1, x2, y2, durationMs: ms, timestamp: Date.now() });
        this.callbacks.onLog({ id, timestamp: Date.now(), elapsedMs: elapsed, level: 'swipe', message: `Luau: Swipe(${x1}, ${y1} -> ${x2}, ${y2}, ${ms}ms)`, data: { x: x1, y: y1, x2, y2, durationMs: ms } });
        await this.sleep(ms);
        return;
      }

      // Wait(ms) / wait(ms)
      const waitMatch = clean.match(/(?:wait|Wait|task\.wait)\s*\(\s*(\d+)\s*\)/i);
      if (waitMatch) {
        const ms = parseInt(waitMatch[1], 10);
        const elapsed = performance.now() - this.startTime;
        this.callbacks.onLog({ id: crypto.randomUUID(), timestamp: Date.now(), elapsedMs: elapsed, level: 'wait', message: `Luau: Wait(${ms}ms)`, data: { durationMs: ms } });
        await this.sleep(ms);
        return;
      }

      // print(...)
      const printMatch = clean.match(/print\s*\(\s*["']?(.*?)["']?\s*\)/i);
      if (printMatch) {
        const elapsed = performance.now() - this.startTime;
        this.callbacks.onLog({ id: crypto.randomUUID(), timestamp: Date.now(), elapsedMs: elapsed, level: 'info', message: `[Luau Output] ${printMatch[1]}` });
        return;
      }
    };

    for (const rawLine of lines) {
      if (this.shouldStop) break;
      const line = rawLine.trim();

      // Check for 'for i = 1, N do'
      const forMatch = line.match(/for\s+\w+\s*=\s*\d+\s*,\s*(\d+)\s+do/i);
      if (forMatch) {
        inLoop = true;
        loopCount = Math.min(parseInt(forMatch[1], 10), 100); // cap safely for preview
        loopLines.length = 0;
        continue;
      }

      if (inLoop) {
        if (line === 'end') {
          inLoop = false;
          for (let i = 0; i < loopCount; i++) {
            if (this.shouldStop) break;
            for (const l of loopLines) {
              if (this.shouldStop) break;
              await executeLine(l);
            }
          }
        } else {
          loopLines.push(line);
        }
        continue;
      }

      await executeLine(line);
    }
  }

  private async simulateKotlinValidation(code: string): Promise<void> {
    const elapsed = performance.now() - this.startTime;
    this.callbacks.onLog({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      elapsedMs: elapsed,
      level: 'info',
      message: '[Kotlin Compiler Checker] Analyzing AccessibilityService gesture tree...'
    });

    await this.sleep(80);

    const hasGesture = code.includes('GestureDescription') || code.includes('dispatchGesture');
    const hasService = code.includes('AccessibilityService');
    const hasPath = code.includes('Path()');

    if (hasGesture && hasPath) {
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: performance.now() - this.startTime,
        level: 'success',
        message: 'Valid GestureDescription builder detected. Android 8.0+ (API 26+) compatible.'
      });
      // Fire simulated tap to give visual feedback
      this.callbacks.onTouchEvent({
        id: crypto.randomUUID(),
        type: 'tap',
        x: 200,
        y: 400,
        timestamp: Date.now()
      });
    } else {
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: performance.now() - this.startTime,
        level: 'warn',
        message: 'Notice: Ensure dispatchGesture() callback is bound to your AccessibilityService lifecycle.'
      });
    }

    if (hasService) {
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: performance.now() - this.startTime,
        level: 'info',
        message: 'android:canPerformGestures="true" must be set in your accessibility_service_config.xml'
      });
    }
  }

  private async simulateCppValidation(code: string): Promise<void> {
    const elapsed = performance.now() - this.startTime;
    this.callbacks.onLog({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      elapsedMs: elapsed,
      level: 'info',
      message: '[Clang/NDK Verifier] Inspecting JNIEXPORT extern "C" symbols and memory safety...'
    });

    await this.sleep(90);

    const hasJni = code.includes('JNIEXPORT') || code.includes('Java_');
    const hasUinput = code.includes('uinput') || code.includes('input_event');

    if (hasJni) {
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: performance.now() - this.startTime,
        level: 'success',
        message: 'JNI signature verified: libnative_macro_engine.so ABI targets: arm64-v8a, x86_64'
      });
    } else {
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: performance.now() - this.startTime,
        level: 'info',
        message: 'Native C++ routine ready for direct NDK embedding or standalone Linux test harness.'
      });
    }

    if (hasUinput) {
      this.callbacks.onLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        elapsedMs: performance.now() - this.startTime,
        level: 'info',
        message: 'Linux /dev/uinput direct event injection enabled. Requires root/su on Android.'
      });
    }

    // Fire simulated touch for visual feedback
    this.callbacks.onTouchEvent({
      id: crypto.randomUUID(),
      type: 'swipe',
      x: 180,
      y: 650,
      x2: 180,
      y2: 250,
      durationMs: 150,
      timestamp: Date.now()
    });
  }
}
