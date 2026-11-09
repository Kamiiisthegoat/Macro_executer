export type MacroLanguage = 'javascript' | 'quickjs' | 'luau' | 'kotlin' | 'cpp';

export type MacroActionType = 'tap' | 'hold' | 'swipe' | 'wait' | 'loop';

export type LogLevel = 'info' | 'tap' | 'swipe' | 'hold' | 'wait' | 'warn' | 'success' | 'error';

export interface MacroLog {
  id: string;
  timestamp: number;
  elapsedMs: number;
  level: LogLevel;
  message: string;
  data?: {
    x?: number;
    y?: number;
    x2?: number;
    y2?: number;
    durationMs?: number;
    count?: number;
  };
}

export interface MacroTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Gaming' | 'Automation' | 'Precision' | 'Utility';
  supportedLanguages: MacroLanguage[];
  codeSnippets: Record<MacroLanguage, string>;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estSpeedMs: number;
  actionCount: number;
}

export interface ProSuite {
  id: string;
  title: string;
  description: string;
  category: string;
  overhead: string;
  loopPrecision: string;
  jitterTolerance: string;
  batteryRating: 'Ultra-Low' | 'Optimized' | 'High Performance';
  supportedLanguages: MacroLanguage[];
  codeSnippets: Record<MacroLanguage, string>;
  isUnlocked: boolean;
  requiredKey: string;
  features: string[];
}

export type UIThemeId =
  | 'matte-obsidian'
  | 'clean-light'
  | 'minimal-dark'
  | 'cyber-neon'
  | 'retro-terminal'
  | 'glass-frost';

export interface PipelineBlock {
  id: string;
  language: MacroLanguage;
  code: string;
}

export interface TouchEventMarker {
  id: string;
  type: 'tap' | 'hold' | 'swipe';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  timestamp: number;
  durationMs?: number;
}

export interface MacroPayload {
  macroName: string;
  targetPackage?: string;
  actions: Array<{
    type: MacroActionType;
    x?: number;
    y?: number;
    x2?: number;
    y2?: number;
    durationMs?: number;
    delayAfterMs?: number;
  }>;
  repeatCount: number;
  intervalMs: number;
}

export interface ConfigurableMacroConfig {
  id: string;
  name: string;
  title: string;
  status: 'idle' | 'loaded' | 'error';
  errorMessage?: string;
  soruCoords: { x: number; y: number };
  portalCoords: { x: number; y: number };
  soruColor: string;
  portalColor: string;
  delayMs?: number;
}
