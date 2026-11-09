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
  borderHex: string;
  textHex: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'matte-obsidian',
    name: 'Matte Obsidian (Default)',
    subtitle: 'Deep pitch-black #0A0A0A, hairline #242424 borders, utility window',
    bgHex: '#0A0A0A',
    borderHex: '#242424',
    textHex: '#F2F2F2'
  },
  {
    id: 'clean-light',
    name: 'Clean Paper Light',
    subtitle: 'Off-white #F8F8F8 typewriter paper, #1A1A1A ink text',
    bgHex: '#F8F8F8',
    borderHex: '#D0D0D0',
    textHex: '#1A1A1A'
  },
  {
    id: 'minimal-dark',
    name: 'Minimalist Dark',
    subtitle: 'Matte charcoal #111215, soft white text',
    bgHex: '#111215',
    borderHex: '#272A33',
    textHex: '#F3F4F6'
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    subtitle: 'Deep obsidian #07090E, glowing cyan and violet',
    bgHex: '#07090E',
    borderHex: '#1E283B',
    textHex: '#06B6D4'
  },
  {
    id: 'retro-terminal',
    name: 'Retro Matrix Terminal',
    subtitle: 'Pitch black #030603, phosphor matrix green #22C55E',
    bgHex: '#030603',
    borderHex: '#143514',
    textHex: '#4ADE80'
  },
  {
    id: 'glass-frost',
    name: 'Glassmorphic Frost',
    subtitle: 'Translucent dark gradient #0A0E17, ice-blue frost borders',
    bgHex: '#0A0E17',
    borderHex: 'rgba(255,255,255,0.15)',
    textHex: '#38BDF8'
  }
];

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  currentTheme,
  onSelectTheme,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100 font-sans text-xs">
      <div className="w-full max-w-sm bg-[#141414] border border-[#242424] rounded-lg p-4 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#242424] pb-2.5">
          <span className="font-bold text-[#F2F2F2] tracking-tight uppercase text-xs">
            UI Style Switcher
          </span>
          <button
            onClick={onClose}
            className="cursor-pointer text-[#737373] hover:text-[#F2F2F2] font-mono text-sm px-1.5 py-0.5 rounded hover:bg-[#222222] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1.5">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className={`w-full text-left p-2.5 rounded-md border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#525252] bg-[#1C1C1C] text-[#F2F2F2]'
                    : 'border-[#222222] bg-[#141414] text-[#A3A3A3] hover:border-[#383838] hover:text-[#F2F2F2]'
                }`}
              >
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-sm border inline-block shrink-0"
                      style={{ backgroundColor: theme.bgHex, borderColor: theme.borderHex }}
                    />
                    <span className="text-xs font-medium tracking-tight text-[#F2F2F2]">{theme.name}</span>
                  </div>
                  <p className="text-[10px] text-[#737373] line-clamp-1 pl-5.5">
                    {theme.subtitle}
                  </p>
                </div>

                <span className="font-mono text-xs text-[#737373] shrink-0">
                  {isSelected ? '●' : '○'}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 border border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#242424] text-[#F2F2F2] font-semibold text-xs rounded-md cursor-pointer transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
