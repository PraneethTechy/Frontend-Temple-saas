import React, { useState, useEffect } from 'react';

export const StickyTempleNav = ({ sections, activeSection, onSelectSection }) => {
  return (
    <div className="sticky top-16 z-30 bg-[#FCFBF7]/95 backdrop-blur-md border-y border-amber-200/60 shadow-2xs py-1.5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex space-x-1 sm:space-x-3 overflow-x-auto scrollbar-none py-1"
          aria-label="Temple Profile Navigation"
        >
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-amber-800 hover:bg-amber-100/50'
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default StickyTempleNav;
