import React, { useState } from 'react';
import { STARTER_TEMPLATES } from '../data/templates';
import { MacroLanguage, MacroTemplate } from '../types/macro';
import { AsciiHeader } from './AsciiHeader';

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
    <div className="flex flex-col min-h-full px-3 py-3 space-y-4 pb-24 max-w-xl mx-auto font-mono text-xs select-text">
      {/* File Header */}
      <div className="py-2 border-b border-[var(--border-subtle)] space-y-1">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>// acroscript.config.d/blueprints.conf</span>
          <span>COUNT: {filteredTemplates.length}</span>
        </div>
        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
          Starter Macro Blueprints
        </h2>
        <p className="text-[11px] text-[var(--text-secondary)]">
          Base macros for touch spam, multi-point cycles, coordinate probing, and anti-disconnect rhythm.
        </p>
      </div>

      {/* Retro Monospace Search Input */}
      <div className="flex items-center border-b border-[var(--border-strong)] py-1.5 px-1 bg-[var(--bg-primary)]">
        <span className="text-[var(--text-muted)] mr-2">&gt; grep:</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="filter blueprints (e.g. tap, swipe, hold)..."
          className="w-full bg-transparent text-[var(--text-primary)] font-mono text-xs outline-none placeholder-[var(--text-muted)]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            [x]
          </button>
        )}
      </div>

      {/* Category Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
        <span className="text-[var(--text-muted)] text-[10px]">CAT:</span>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`cursor-pointer px-1.5 py-0.5 transition-colors whitespace-nowrap ${
                isSelected
                  ? 'font-bold text-[var(--text-primary)] underline'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              [ {cat.toLowerCase()} ]
            </button>
          );
        })}
      </div>

      {/* Blueprint entries list */}
      <div className="space-y-4 pt-1">
        {filteredTemplates.length === 0 ? (
          <div className="p-6 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] text-[11px]">
            -- NO BLUEPRINTS MATCHING GREP PATTERN --
          </div>
        ) : (
          filteredTemplates.map((template) => {
            return (
              <div
                key={template.id}
                className="py-3 border-b border-[var(--border-subtle)] space-y-2 select-text"
              >
                {/* Single-Line Responsive ASCII Header row */}
                <AsciiHeader title={template.title} char="-" />

                {/* Subtitle / Specs */}
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span>
                    category: {template.category.toLowerCase()} · level: {template.difficulty.toLowerCase()}
                  </span>
                  <span>est_speed: ~{template.estSpeedMs}ms</span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {template.description}
                </p>

                {/* Footer / Use Template Button */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">
                    targets: JS · QJS · LUAU · KT · C++
                  </span>

                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="cursor-pointer font-bold text-[var(--accent-primary)] hover:underline min-h-[36px] flex items-center"
                  >
                    [ use template → ]
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
