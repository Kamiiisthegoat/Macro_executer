import React from 'react';
import { UIThemeId } from '../types/macro';

interface ThemeSwitcherModalProps {
  currentTheme: UIThemeId;
  onSelectTheme: (theme: UIThemeId) => void;
  onClose: () => void;
}

interface ThemeConfig {
  id: UIThemeId;
  name: string;
  subtitle: string;
  bgHex: string;
  textHex: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'clean-light',
    name: 'Clean Paper Light (Default)',
    subtitle: 'Off-white #F8F8F8 typewriter paper, #1A1A1A ink text',
    bgHex: '#F8F8F8',
    textHex: '#1A1A1A'
  },
  {
    id: 'minimal-dark',
    name: 'Minimalist Dark',
    subtitle: 'Matte charcoal #111215, soft white text',
    bgHex: '#111215',
    textHex: '#F3F4F6'
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    subtitle: 'Deep obsidian #07090E, glowing cyan and violet',
    bgHex: '#07090E',
    textHex: '#06B6D4'
  },
  {
    id: 'retro-terminal',
    name: 'Retro Matrix Terminal',
    subtitle: 'Pitch black #030603, phosphor matrix green #22C55E',
    bgHex: '#030603',
    textHex: '#4ADE80'
  },
  {
    id: 'glass-frost',
    name: 'Glassmorphic Frost',
    subtitle: 'Translucent dark gradient #0A0E17, ice-blue frost borders',
    bgHex: '#0A0E17',
    textHex: '#38BDF8'
  }
];

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  currentTheme,
  onSelectTheme,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs animate-in fade-in duration-100 font-mono text-xs">
      <div className="w-full max-w-sm bg-[var(--bg-primary)] border-2 border-[var(--border-strong)] p-4 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <span className="font-bold text-[var(--text-primary)] uppercase">
            :: SELECT_UI_THEME ::
          </span>
          <button
            onClick={onClose}
            className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold"
          >
            [X]
          </button>
        </div>

        <div className="space-y-2">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className={`w-full text-left p-2.5 border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[var(--border-strong)] bg-[var(--bg-surface)] font-bold text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 border border-[var(--border-strong)] inline-block"
                      style={{ backgroundColor: theme.bgHex }}
                    />
                    <span className="font-mono text-xs">{theme.name}</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 pl-5">
                    {theme.subtitle}
                  </p>
                </div>

                <span className="font-mono text-xs">
                  {isSelected ? '[*]' : '[ ]'}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-1.5 border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] font-bold cursor-pointer transition-colors"
        >
          [ DONE ]
        </button>
      </div>
    </div>
  );
};
