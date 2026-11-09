import React, { useState } from 'react';
import { Search, ArrowRight, Layers } from 'lucide-react';
import { STARTER_TEMPLATES } from '../data/templates';
import { MacroLanguage, MacroTemplate } from '../types/macro';

interface TemplatesTabProps {
  currentLanguage: MacroLanguage;
  onSelectTemplate: (template: MacroTemplate) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  currentLanguage,
  onSelectTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Gaming', 'Automation', 'Precision', 'Utility'];

  const filteredTemplates = STARTER_TEMPLATES.filter((tpl) => {
    const matchesCategory =
      selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-full px-3 py-2 space-y-3 pb-32 max-w-xl mx-auto font-sans text-xs select-text">
      {/* Top Banner Header */}
      <div className="bg-[#141414] border border-[#242424] rounded-lg p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-[#F2F2F2]">
            BASE MACRO TEMPLATES
          </span>
          <span className="text-[10px] font-mono text-[#737373]">
            {filteredTemplates.length} READY
          </span>
        </div>
        <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
          Pre-tested multi-language routines for rapid taps, multi-point coordinate loops, and continuous gesture streams.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-[#141414] border border-[#242424] rounded-lg px-3 py-2 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-[#737373] shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates (e.g. tap, swipe, loop)..."
          className="w-full bg-transparent text-[#F2F2F2] text-xs outline-none placeholder-[#666666]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="cursor-pointer text-[#737373] hover:text-[#F2F2F2] text-xs px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filter Segments */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'border-[#525252] bg-[#1C1C1C] text-[#F2F2F2] font-semibold'
                  : 'border-[#222222] bg-[#141414] text-[#888888] hover:text-[#D1D1D1] hover:border-[#333333]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Template Cards List */}
      <div className="space-y-2.5 pt-1">
        {filteredTemplates.length === 0 ? (
          <div className="p-6 text-center text-[#737373] border border-dashed border-[#242424] rounded-lg text-xs">
            No templates matching search criteria.
          </div>
        ) : (
          filteredTemplates.map((template) => {
            return (
              <div
                key={template.id}
                className="bg-[#141414] border border-[#242424] rounded-lg p-3.5 space-y-2.5 select-text transition-colors hover:border-[#333333]"
              >
                {/* Title & Category Badge */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#F2F2F2] tracking-tight">
                    {template.title}
                  </h3>
                  <span className="text-[10px] font-mono text-[#A3A3A3] bg-[#1C1C1C] border border-[#2A2A2A] px-2 py-0.5 rounded">
                    {template.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                  {template.description}
                </p>

                {/* Card Footer: Metadata & Action */}
                <div className="flex items-center justify-between pt-1 border-t border-[#1F1F1F]">
                  <div className="flex items-center gap-2 text-[10px] text-[#666666] font-mono">
                    <span>~{template.estSpeedMs}ms</span>
                    <span>·</span>
                    <span>{template.difficulty}</span>
                  </div>

                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="cursor-pointer px-3 py-1.5 rounded-md bg-[#1C1C1C] hover:bg-[#242424] border border-[#333333] hover:border-[#525252] text-[#F2F2F2] font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span>Load Template</span>
                    <ArrowRight className="w-3 h-3 text-[#A3A3A3]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
