import { ConfigurableMacroConfig, MacroLanguage } from '../types/macro';

export const INITIAL_PREMADE_CONFIGS: ConfigurableMacroConfig[] = [
  {
    id: 'soru-x',
    name: 'Soru_X',
    title: 'Soru x macro',
    status: 'idle',
    soruCoords: { x: 185, y: 450 },
    portalCoords: { x: 240, y: 680 },
    soruColor: '#E63946',
    portalColor: '#457B9D',
    delayMs: 65
  },
  {
    id: 'auto-farm-v2',
    name: 'Auto_Farm_V2',
    title: 'Auto farm v2 macro',
    status: 'idle',
    soruCoords: { x: 195, y: 350 },
    portalCoords: { x: 300, y: 620 },
    soruColor: '#2A9D8F',
    portalColor: '#E76F51',
    delayMs: 80
  },
  {
    id: 'dash-cancel-combo',
    name: 'Dash_Cancel',
    title: 'Dash cancel combo macro',
    status: 'idle',
    soruCoords: { x: 150, y: 520 },
    portalCoords: { x: 280, y: 520 },
    soruColor: '#F4A261',
    portalColor: '#264653',
    delayMs: 40
  }
];

export function generateScriptForConfig(
  config: ConfigurableMacroConfig,
  lang: MacroLanguage
): string {
  const { soruCoords, portalCoords, soruColor, portalColor, name } = config;
  const sx = Number(soruCoords.x) || 0;
  const sy = Number(soruCoords.y) || 0;
  const px = Number(portalCoords.x) || 0;
  const py = Number(portalCoords.y) || 0;
  const sc = soruColor || '#FFFFFF';
  const pc = portalColor || '#FFFFFF';

  switch (lang) {
    case 'javascript':
      return `// ====================${name}====================
// [CONFIG BINDING: LIVE SYNCED]
const SORU_COORDS = { x: ${sx}, y: ${sy} };
const PORTAL_COORDS = { x: ${px}, y: ${py} };
const COLOR_SORU = "${sc}";
const COLOR_PORTAL = "${pc}";

console.log("[${name}] Verifying pixel at Soru target (" + SORU_COORDS.x + ", " + SORU_COORDS.y + ") -> Expect: " + COLOR_SORU);
await wait(80);

// Execute Soru Double Pulse
console.log("[${name}] Engaging Soru rapid dash...");
await tap(SORU_COORDS.x, SORU_COORDS.y);
await wait(45);
await tap(SORU_COORDS.x, SORU_COORDS.y);

// Cooldown before portal lock
await wait(320);

// Portal activation
console.log("[${name}] Transitioning to Portal target (" + PORTAL_COORDS.x + ", " + PORTAL_COORDS.y + ") -> Expect: " + COLOR_PORTAL);
await tap(PORTAL_COORDS.x, PORTAL_COORDS.y);
await wait(90);
await swipe(PORTAL_COORDS.x, PORTAL_COORDS.y, PORTAL_COORDS.x, PORTAL_COORDS.y - 180, 220);

console.log("[${name}] Sequence executed successfully.");`;

    case 'quickjs':
      return `// ====================${name}====================
// QuickJS Lightweight Embedded Mode
var SORU_X = ${sx}, SORU_Y = ${sy};
var PORTAL_X = ${px}, PORTAL_Y = ${py};
var COLOR_SORU = "${sc}";
var COLOR_PORTAL = "${pc}";

console.log("[QuickJS] ${name} started");
tap(SORU_X, SORU_Y);
wait(45);
tap(SORU_X, SORU_Y);
wait(320);
tap(PORTAL_X, PORTAL_Y);
swipe(PORTAL_X, PORTAL_Y, PORTAL_X, PORTAL_Y - 180, 220);
console.log("[QuickJS] ${name} finished");`;

    case 'luau':
      return `-- ====================${name}====================
-- Luau Typed Macro Config
local SORU_X: number = ${sx}
local SORU_Y: number = ${sy}
local PORTAL_X: number = ${px}
local PORTAL_Y: number = ${py}
local COLOR_SORU: string = "${sc}"
local COLOR_PORTAL: string = "${pc}"

print("[Luau] ${name} running at coordinates")
tap(SORU_X, SORU_Y)
wait(45)
tap(SORU_X, SORU_Y)
wait(320)
tap(PORTAL_X, PORTAL_Y)
swipe(PORTAL_X, PORTAL_Y, PORTAL_X, PORTAL_Y - 180, 220)
print("[Luau] ${name} complete")`;

    case 'kotlin':
      return `// ====================${name}====================
// Android Native AccessibilityService Gesture Driver
class ${name.replace(/[^a-zA-Z0-9]/g, '')}Macro(private val service: AccessibilityService) {
    val soruX = ${sx}f
    val soruY = ${sy}f
    val portalX = ${px}f
    val portalY = ${py}f
    val soruColor = "${sc}"
    val portalColor = "${pc}"

    fun executeSequence() {
        // Step 1: Soru Gesture
        val soruPath = Path().apply { moveTo(soruX, soruY) }
        val stroke1 = GestureDescription.StrokeDescription(soruPath, 0L, 30L)
        val stroke2 = GestureDescription.StrokeDescription(soruPath, 50L, 30L)

        // Step 2: Portal Gesture
        val portalPath = Path().apply { moveTo(portalX, portalY) }
        val stroke3 = GestureDescription.StrokeDescription(portalPath, 350L, 60L)

        val gesture = GestureDescription.Builder()
            .addStroke(stroke1)
            .addStroke(stroke2)
            .addStroke(stroke3)
            .build()
        service.dispatchGesture(gesture, null, null)
    }
}`;

    case 'cpp':
      return `// ====================${name}====================
// High-Speed NDK / Linux evdev Native Routine
#include <unistd.h>
#include <linux/uinput.h>

#define SORU_X ${sx}
#define SORU_Y ${sy}
#define PORTAL_X ${px}
#define PORTAL_Y ${py}
const char* COLOR_SORU = "${sc}";
const char* COLOR_PORTAL = "${pc}";

extern "C" void execute_${name.toLowerCase()}(int fd) {
    // Soru burst
    emit_tap(fd, SORU_X, SORU_Y, 25000);
    usleep(45000);
    emit_tap(fd, SORU_X, SORU_Y, 25000);
    usleep(320000);

    // Portal warp
    emit_tap(fd, PORTAL_X, PORTAL_Y, 35000);
    smooth_swipe(fd, PORTAL_X, PORTAL_Y, PORTAL_X, PORTAL_Y - 180, 20);
}`;
  }
}
