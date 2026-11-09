import React from 'react';
import { MainTab, SegmentedTabBar } from './SegmentedTabBar';

export type { MainTab };

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
    <SegmentedTabBar
      activeTab={activeTab}
      onTabChange={onTabChange}
      proUnlockedCount={proUnlockedCount}
    />
  );
};
