import React from 'react';

export type MainTab = 'home' | 'templates' | 'premium';

interface SegmentedTabBarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  proUnlockedCount?: number;
}

export const SegmentedTabBar: React.FC<SegmentedTabBarProps> = ({
  activeTab,
  onTabChange,
  proUnlockedCount = 1
}) => {
  const tabs: Array<{ id: MainTab; label: string; badge?: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'templates', label: 'Templates' },
    { id: 'premium', label: 'Premium' }
  ];

  return (
    <div className="px-3 pt-2 pb-1 bg-[#0A0A0A] select-none">
      <div className="grid grid-cols-3 w-full bg-[#141414] border border-[#242424] rounded-lg p-1 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[36px] py-1.5 px-2 text-xs font-medium rounded-[6px] transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'border border-[#525252] bg-[#1C1C1C] text-[#F2F2F2] font-semibold shadow-xs'
                  : 'text-[#888888] hover:text-[#D1D1D1] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === 'premium' && proUnlockedCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
