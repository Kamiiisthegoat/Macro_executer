import { MacroTemplate } from '../types/macro';

export const STARTER_TEMPLATES: MacroTemplate[] = [
  {
    id: 'auto-tapper',
    title: 'Auto-Tapper & Rapid Clicker',
    description: 'High-frequency single-point tap cycle with configurable millisecond interval and randomized jitter protection.',
    category: 'Gaming',
    difficulty: 'Beginner',
    estSpeedMs: 45,
    actionCount: 20,
    supportedLanguages: ['javascript', 'quickjs', 'luau', 'kotlin', 'cpp'],
    codeSnippets: {
      javascript: `// High-Speed Auto-Tapper with Micro-Jitter
const targetX = 200;
const targetY = 450;
const repetitions = 15;
const delayMs = 60;

console.log("Starting Auto-Tapper at (" + targetX + ", " + targetY + ")...");

await loop(repetitions, async (i) => {
  // Add ±3px humanizer jitter to prevent pattern bot detection
  const jitterX = targetX + Math.floor(Math.random() * 7) - 3;
  const jitterY = targetY + Math.floor(Math.random() * 7) - 3;
  
  await tap(jitterX, jitterY);
  await wait(delayMs);
});

console.log("Auto-Tapper sequence completed successfully.");`,
      quickjs: `// QuickJS Embedded Lightweight Auto-Tapper
var x = 200;
var y = 450;
var count = 15;

console.log("[QuickJS] Initiating fast tap loop...");
for (var i = 0; i < count; i++) {
  tap(x, y);
  wait(65);
}
console.log("[QuickJS] Completed.");`,
      luau: `-- Luau Typed Rapid Tap Routine
local targetX: number = 200
local targetY: number = 450
local iterations: number = 15

print("Starting Luau Auto-Tapper")
for i = 1, iterations do
  tap(targetX, targetY)
  wait(60)
end
print("Luau Auto-Tapper finished")`,
      kotlin: `// Android Native AccessibilityService Auto-Tapper
fun dispatchRapidTapSequence(service: AccessibilityService, x: Float = 200f, y: Float = 450f, repeat: Int = 15) {
    val path = Path().apply {
        moveTo(x, y)
    }
    for (i in 0 until repeat) {
        val stroke = GestureDescription.StrokeDescription(path, (i * 70).toLong(), 25L)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()
        service.dispatchGesture(gesture, null, null)
    }
}`,
      cpp: `// High-Speed NDK / Linux /dev/uinput Tap Routine
#include <unistd.h>
#include <linux/uinput.h>

void execute_fast_tap(int fd, int x, int y, int repeat_count) {
    for (int i = 0; i < repeat_count; ++i) {
        emit_abs(fd, ABS_MT_POSITION_X, x);
        emit_abs(fd, ABS_MT_POSITION_Y, y);
        emit_key(fd, BTN_TOUCH, 1);
        emit_syn(fd);
        usleep(25000); // 25ms hold
        emit_key(fd, BTN_TOUCH, 0);
        emit_syn(fd);
        usleep(45000); // 45ms cooldown
    }
}`
    }
  },
  {
    id: 'multi-point-sequence',
    title: 'Multi-Point Touch Sequence',
    description: 'Chained sequential touch workflow across 3 distinct screen targets with adaptive wait cooldowns.',
    category: 'Automation',
    difficulty: 'Intermediate',
    estSpeedMs: 120,
    actionCount: 6,
    supportedLanguages: ['javascript', 'quickjs', 'luau', 'kotlin', 'cpp'],
    codeSnippets: {
      javascript: `// Multi-Point Coordinated Flow: Collect -> Confirm -> Next
console.log("Navigating Multi-Point Workflow...");

// Target 1: Collect Item
await tap(120, 320);
await wait(300);

// Target 2: Confirm Dialog
await tap(260, 580);
await wait(450);

// Target 3: Next Stage Button
await tap(340, 720);
await wait(200);

console.log("Cycle 1 complete. Repeating second pass...");
await tap(120, 320);
await wait(300);
await tap(260, 580);`,
      quickjs: `// QuickJS Multi-Point Coordinate Sequence
tap(120, 320);
wait(350);
tap(260, 580);
wait(500);
tap(340, 720);
wait(200);`,
      luau: `-- Luau Sequential Touch Chain
print("Luau Multi-Point Sequence Started")
tap(120, 320)
wait(300)
tap(260, 580)
wait(450)
tap(340, 720)
print("Luau Sequence Finished")`,
      kotlin: `// Kotlin Multi-Point Gesture Flow
fun runMultiPointFlow(service: AccessibilityService) {
    val points = listOf(Pair(120f, 320f), Pair(260f, 580f), Pair(340f, 720f))
    points.forEachIndexed { index, (x, y) ->
        val path = Path().apply { moveTo(x, y) }
        val stroke = GestureDescription.StrokeDescription(path, (index * 500).toLong(), 50L)
        service.dispatchGesture(GestureDescription.Builder().addStroke(stroke).build(), null, null)
    }
}`,
      cpp: `// Native C++ Multi-Point Routine
void trigger_sequence(int fd) {
    const int points[][2] = {{120, 320}, {260, 580}, {340, 720}};
    for (int i = 0; i < 3; ++i) {
        send_touch(fd, points[i][0], points[i][1], 50);
        usleep(350000); // 350ms wait
    }
}`
    }
  },
  {
    id: 'hold-release-timer',
    title: 'Hold & Release Timer Loop',
    description: 'Precision long-press charging mechanic simulator for games with charge meters or drag handles.',
    category: 'Gaming',
    difficulty: 'Intermediate',
    estSpeedMs: 500,
    actionCount: 4,
    supportedLanguages: ['javascript', 'quickjs', 'luau', 'kotlin', 'cpp'],
    codeSnippets: {
      javascript: `// Long-Press Charge & Release Mechanic
const chargeX = 195;
const chargeY = 520;
const chargeDurationMs = 800;

console.log("Initiating Charge Sequence...");
await hold(chargeX, chargeY, chargeDurationMs);
await wait(250);

console.log("Secondary Pulse Boost...");
await hold(chargeX, chargeY, 400);
await wait(150);

console.log("Full Charge Released.");`,
      quickjs: `// QuickJS Long-Press Macro
hold(195, 520, 800);
wait(250);
hold(195, 520, 400);`,
      luau: `-- Luau Hold & Charge Pattern
print("Charging Energy Meter...")
hold(195, 520, 800)
wait(250)
hold(195, 520, 400)
print("Charge Cycle Complete")`,
      kotlin: `// Kotlin Accessibility Long-Press Stroke
fun executeLongPress(service: AccessibilityService, x: Float = 195f, y: Float = 520f, holdTime: Long = 800L) {
    val path = Path().apply { moveTo(x, y) }
    val stroke = GestureDescription.StrokeDescription(path, 0L, holdTime)
    val gesture = GestureDescription.Builder().addStroke(stroke).build()
    service.dispatchGesture(gesture, null, null)
}`,
      cpp: `// Native C++ Long-Press Timing
void perform_hold(int fd, int x, int y, int duration_ms) {
    emit_abs(fd, ABS_MT_POSITION_X, x);
    emit_abs(fd, ABS_MT_POSITION_Y, y);
    emit_key(fd, BTN_TOUCH, 1);
    emit_syn(fd);
    usleep(duration_ms * 1000);
    emit_key(fd, BTN_TOUCH, 0);
    emit_syn(fd);
}`
    }
  },
  {
    id: 'swipe-automator',
    title: 'Swipe & Gesture Automator',
    description: 'Smooth directional swipe cycles with customizable velocity, duration, and ease curves.',
    category: 'Automation',
    difficulty: 'Beginner',
    estSpeedMs: 300,
    actionCount: 4,
    supportedLanguages: ['javascript', 'quickjs', 'luau', 'kotlin', 'cpp'],
    codeSnippets: {
      javascript: `// Directional Swipe Cycle (Bottom to Top Scroll)
console.log("Performing smooth vertical scroll swipe...");

// Swipe Up: Start at (195, 680) -> End at (195, 220) over 320ms
await swipe(195, 680, 195, 220, 320);
await wait(600);

// Swipe Left: Start at (340, 400) -> End at (60, 400) over 250ms
console.log("Performing horizontal carousel swipe...");
await swipe(340, 400, 60, 400, 250);
await wait(400);

console.log("Gestures completed.");`,
      quickjs: `// QuickJS Swipe Macro
swipe(195, 680, 195, 220, 320);
wait(600);
swipe(340, 400, 60, 400, 250);`,
      luau: `-- Luau Gesture Swipe Loop
print("Luau Swiping Screen...")
swipe(195, 680, 195, 220, 320)
wait(500)
swipe(340, 400, 60, 400, 250)
print("Luau Swipes Finished")`,
      kotlin: `// Android Native Swipe via GestureDescription Path
fun executeVerticalSwipe(service: AccessibilityService, startY: Float = 680f, endY: Float = 220f) {
    val path = Path().apply {
        moveTo(195f, startY)
        lineTo(195f, endY)
    }
    val stroke = GestureDescription.StrokeDescription(path, 0L, 320L)
    service.dispatchGesture(GestureDescription.Builder().addStroke(stroke).build(), null, null)
}`,
      cpp: `// Native C++ Interpolated Swipe
void smooth_swipe(int fd, int x1, int y1, int x2, int y2, int steps) {
    for (int i = 0; i <= steps; ++i) {
        float t = (float)i / steps;
        int cur_x = x1 + (int)((x2 - x1) * t);
        int cur_y = y1 + (int)((y2 - y1) * t);
        emit_abs(fd, ABS_MT_POSITION_X, cur_x);
        emit_abs(fd, ABS_MT_POSITION_Y, cur_y);
        emit_key(fd, BTN_TOUCH, 1);
        emit_syn(fd);
        usleep(8000); // 8ms interpolate
    }
    emit_key(fd, BTN_TOUCH, 0);
    emit_syn(fd);
}`
    }
  },
  {
    id: 'coordinate-recorder',
    title: 'Screen Coordinate Recorder Helper',
    description: 'Dynamic coordinate logger and test harness to map touch coordinates before building production macros.',
    category: 'Utility',
    difficulty: 'Beginner',
    estSpeedMs: 150,
    actionCount: 5,
    supportedLanguages: ['javascript', 'quickjs', 'luau', 'kotlin', 'cpp'],
    codeSnippets: {
      javascript: `// Interactive Screen Coordinate Prober
console.log("Probing screen calibration anchors...");

const anchors = [
  { name: "Top-Left Menu", x: 45, y: 80 },
  { name: "Center Canvas", x: 195, y: 420 },
  { name: "Bottom Action", x: 195, y: 760 }
];

for (const anchor of anchors) {
  console.log("Calibrating: " + anchor.name + " (" + anchor.x + ", " + anchor.y + ")");
  await tap(anchor.x, anchor.y);
  await wait(400);
}

console.log("Calibration successful. Coordinates ready for export.");`,
      quickjs: `// QuickJS Coordinate Verifier
var pts = [[45, 80], [195, 420], [195, 760]];
for (var i = 0; i < pts.length; i++) {
  tap(pts[i][0], pts[i][1]);
  wait(400);
}`,
      luau: `-- Luau Calibration Routine
print("Calibrating Anchor Targets")
tap(45, 80)
wait(400)
tap(195, 420)
wait(400)
tap(195, 760)
print("Luau Calibration Complete")`,
      kotlin: `// Kotlin Coordinate Probe Utility
class CoordinateHelper {
    fun logTarget(name: String, x: Float, y: Float) {
        Log.i("AcroScript", "Target $name confirmed at ($x, $y)")
    }
}`,
      cpp: `// C++ Coordinate Logger
#include <cstdio>
void log_coordinate(const char* label, int x, int y) {
    printf("[AcroScript NDK] %s -> (%d, %d)\\n", label, x, y);
}`
    }
  },
  {
    id: 'conditional-pixel-wait',
    title: 'Conditional Pixel Wait Loop',
    description: 'Simulates responsive trigger-action loops that poll a state or delay until a visual cue arrives.',
    category: 'Precision',
    difficulty: 'Advanced',
    estSpeedMs: 80,
    actionCount: 8,
    supportedLanguages: ['javascript', 'quickjs', 'luau', 'kotlin', 'cpp'],
    codeSnippets: {
      javascript: `// Simulated Conditional Wait Loop
console.log("Awaiting visual cue at (195, 300)...");

let isReady = false;
let checkCount = 0;

while (!isReady && checkCount < 4) {
  checkCount++;
  console.log("Polling condition... attempt " + checkCount);
  await wait(250);
  if (checkCount >= 3) {
    isReady = true;
  }
}

console.log("Condition met! Executing reactive burst tap...");
await tap(195, 300);
await wait(80);
await tap(195, 300);`,
      quickjs: `// QuickJS Conditional Loop
var attempts = 0;
while (attempts < 3) {
  attempts++;
  wait(250);
}
tap(195, 300);
wait(80);
tap(195, 300);`,
      luau: `-- Luau Reactive Wait
print("Luau Polling Condition...")
wait(500)
tap(195, 300)
wait(80)
tap(195, 300)
print("Condition handled.")`,
      kotlin: `// Kotlin Accessibility Node Polling
fun waitForNodeAndTap(service: AccessibilityService, viewId: String) {
    val root = service.rootInActiveWindow ?: return
    val nodes = root.findAccessibilityNodeInfosByViewId(viewId)
    if (nodes.isNotEmpty()) {
        nodes[0].performAction(AccessibilityNodeInfo.ACTION_CLICK)
    }
}`,
      cpp: `// C++ Framebuffer Memory Buffer Poll
bool poll_pixel_match(uint32_t expected_rgb, int x, int y) {
    // Direct Linux /dev/graphics/fb0 frame buffer sample
    return true; 
}`
    }
  },
  {
    id: 'afk-anti-disconnect',
    title: 'AFK Anti-Disconnect Rhythm',
    description: 'Subtle micro-movements with variable delays to keep game connections and interactive sessions active.',
    category: 'Gaming',
    difficulty: 'Beginner',
    estSpeedMs: 800,
    actionCount: 6,
    supportedLanguages: ['javascript', 'quickjs', 'luau', 'kotlin', 'cpp'],
    codeSnippets: {
      javascript: `// Anti-Idle Gentle Micro-Fidget Loop
console.log("Engaging Anti-Idle Session Protector...");

const center = { x: 195, y: 400 };

await loop(4, async (i) => {
  const offsetX = (i % 2 === 0 ? 15 : -15);
  console.log("Subtle nudge pulse " + (i + 1) + "...");
  await tap(center.x + offsetX, center.y);
  // Randomized human-like pause between 600ms and 1100ms
  const pause = 600 + Math.floor(Math.random() * 500);
  await wait(pause);
});

console.log("Anti-Idle rhythm completed.");`,
      quickjs: `// QuickJS Anti-Idle Loop
for (var i = 0; i < 4; i++) {
  var x = 195 + (i % 2 === 0 ? 15 : -15);
  tap(x, 400);
  wait(750);
}`,
      luau: `-- Luau Anti-Idle Fidget
print("Luau Anti-Idle Routine Active")
for i = 1, 4 do
  tap(195, 400)
  wait(700)
end
print("Luau Anti-Idle Done")`,
      kotlin: `// Kotlin Anti-Disconnect Nudge
fun keepSessionAlive(service: AccessibilityService) {
    val path = Path().apply { moveTo(195f, 400f) }
    val stroke = GestureDescription.StrokeDescription(path, 0L, 50L)
    service.dispatchGesture(GestureDescription.Builder().addStroke(stroke).build(), null, null)
}`,
      cpp: `// C++ Low-Power KeepAlive Routine
void keep_alive(int fd) {
    send_touch(fd, 195, 400, 30);
    usleep(800000);
}`
    }
  },
  {
    id: 'double-tap-burst',
    title: 'Rapid Double-Tap Precision Burst',
    description: 'Frame-perfect 2-tap gesture with an exact 42ms interval designed for FPS weapon bursts or rapid confirmation.',
    category: 'Precision',
    difficulty: 'Beginner',
    estSpeedMs: 42,
    actionCount: 2,
    supportedLanguages: ['javascript', 'quickjs', 'luau', 'kotlin', 'cpp'],
    codeSnippets: {
      javascript: `// Frame-Perfect Double-Tap Burst
const x = 200;
const y = 500;
const intervalMs = 42; // sub-frame gap

console.log("Executing 2-shot burst at (" + x + ", " + y + ")...");
await tap(x, y);
await wait(intervalMs);
await tap(x, y);
console.log("Burst complete in " + intervalMs + "ms interval.");`,
      quickjs: `// QuickJS Double-Tap
tap(200, 500);
wait(42);
tap(200, 500);`,
      luau: `-- Luau Precision Burst
tap(200, 500)
wait(42)
tap(200, 500)
print("Double tap burst executed.")`,
      kotlin: `// Kotlin Sequential 2-Stroke Gesture
fun doubleTapBurst(service: AccessibilityService, x: Float = 200f, y: Float = 500f) {
    val path = Path().apply { moveTo(x, y) }
    val s1 = GestureDescription.StrokeDescription(path, 0L, 20L)
    val s2 = GestureDescription.StrokeDescription(path, 42L, 20L)
    val gesture = GestureDescription.Builder().addStroke(s1).addStroke(s2).build()
    service.dispatchGesture(gesture, null, null)
}`,
      cpp: `// C++ NDK Low-Latency Double Tap
void double_tap_burst(int fd, int x, int y) {
    emit_tap(fd, x, y, 15000); // 15ms hold
    usleep(42000);            // 42ms interval
    emit_tap(fd, x, y, 15000);
}`
    }
  }
];
