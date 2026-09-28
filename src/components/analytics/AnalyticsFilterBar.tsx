import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
}

export interface AnalyticsFilterBarProps {
  value?: string;
  onChange?: (id: string) => void;
  options?: FilterOption[];
  extraActions?: React.ReactNode;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: '1y', label: 'This Year' },
];

/**
 * Reusable Analytics Filter Bar
 * Controls the page-level date range filter across all charts and KPIs.
 */
export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  value = '30d',
  onChange,
  options = FILTER_OPTIONS,
  extraActions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((opt) => opt.id === value) || options[1] || options[0] || { id: value, label: value };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2.5">
      {/* Date Range Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5DCD0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-xs font-semibold text-spiritual-text hover:bg-[#FAF6F0] hover:border-[#D5C7B7] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Calendar className="w-3.5 h-3.5 text-spiritual-primary shrink-0" />
          <span>{selectedOption.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-spiritual-muted transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-[#E5DCD0] shadow-lg py-1.5 z-30 divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-100">
            <div className="py-1" role="listbox">
              {options.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (onChange) onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'font-bold text-spiritual-primary bg-[#FAF6F0]'
                        : 'text-spiritual-text hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-spiritual-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {extraActions}
    </div>
  );
};

export default AnalyticsFilterBar;
