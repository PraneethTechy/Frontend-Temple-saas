import React, { type ReactElement, type ReactNode, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';

export interface FilterStatusOption {
  value: string;
  label: string;
  count?: number;
}

export interface InternalFilterToolbarProps {
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  statusOptions?: FilterStatusOption[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onSearchSubmit?: (e: FormEvent) => void;
  extraFilters?: ReactNode;
  className?: string;
}

export const InternalFilterToolbar = ({
  statusFilter,
  onStatusChange,
  statusOptions = [],
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  onSearchSubmit,
  extraFilters,
  className = '',
}: InternalFilterToolbarProps): ReactElement => {
  return (
    <div
      className={`bg-white rounded-xl border border-spiritual-border p-2.5 sm:p-3 shadow-spiritual-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${className}`}
    >
      {/* Left side: Status pills / tabs */}
      {statusOptions.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusChange && onStatusChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-spiritual-primary text-white shadow-spiritual-xs'
                    : 'bg-spiritual-surface/80 text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface'
                }`}
              >
                {opt.label}
                {opt.count !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-spiritual-border/60 text-spiritual-muted'
                    }`}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Right side: Search input & extra filters */}
      <div className="flex items-center gap-2 flex-1 md:flex-initial justify-end">
        {extraFilters}

        {onSearchChange && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onSearchSubmit) onSearchSubmit(e);
            }}
            className="relative flex-1 sm:w-64"
          >
            <Search className="w-3.5 h-3.5 text-spiritual-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary placeholder:text-spiritual-muted/70 transition-colors"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-spiritual-muted hover:text-spiritual-text p-0.5"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default InternalFilterToolbar;
