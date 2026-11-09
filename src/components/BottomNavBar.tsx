import React from 'react';

export type MainTab = 'home' | 'templates' | 'premium';

interface BottomNavBarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  proUnlockedCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  proUnlockedCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-primary)] border-t border-[var(--border-strong)] safe-bottom font-mono select-none">
      <div className="grid grid-cols-3 max-w-xl mx-auto h-13 items-center px-2 text-xs">
        {/* Tab 1: Home (Make Your Own Macros) */}
        <button
          onClick={() => onTabChange('home')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-[var(--text-primary)] font-bold bg-[var(--bg-surface)] border-t-2 border-[var(--border-strong)] -mt-0.5'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span className="tracking-tight whitespace-nowrap">
            {activeTab === 'home' ? '[ 1. HOME ]' : '1. home'}
          </span>
          <span className="text-[9px] opacity-70 scale-90">Custom Builder</span>
        </button>

        {/* Tab 2: Templates (Base Macros) */}
        <button
          onClick={() => onTabChange('templates')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'text-[var(--text-primary)] font-bold bg-[var(--bg-surface)] border-t-2 border-[var(--border-strong)] -mt-0.5'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span className="tracking-tight whitespace-nowrap">
            {activeTab === 'templates' ? '[ 2. TEMPLATES ]' : '2. templates'}
          </span>
          <span className="text-[9px] opacity-70 scale-90">Base Macros</span>
        </button>

        {/* Tab 3: Premium (Pre-Made Configs like Soru_X) */}
        <button
          onClick={() => onTabChange('premium')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeTab === 'premium'
              ? 'text-[var(--text-primary)] font-bold bg-[var(--bg-surface)] border-t-2 border-[var(--border-strong)] -mt-0.5'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span className="tracking-tight whitespace-nowrap">
            {activeTab === 'premium' ? '[ 3. PREMIUM ]' : '3. premium'}
          </span>
          <span className="text-[9px] opacity-70 scale-90">Pre-Made Configs</span>
        </button>
      </div>
    </nav>
  );
};
