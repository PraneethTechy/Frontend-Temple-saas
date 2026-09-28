import React from 'react';
import { Calendar } from 'lucide-react';
import type { Temple } from '@shared/types/index.js';

export interface MobileFloatingBookingBarProps {
  temple: Partial<Temple>;
  hasServices: boolean;
  onBookClick: () => void;
}

export const MobileFloatingBookingBar: React.FC<MobileFloatingBookingBarProps> = ({
  temple,
  hasServices,
  onBookClick,
}) => {
  if (!hasServices) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-amber-200/80 shadow-spiritual-lg lg:hidden animate-in slide-in-from-bottom-5 duration-200">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-serif font-bold text-spiritual-text truncate">
            {temple.name}
          </div>
          <div className="text-[10px] text-spiritual-muted truncate">
            {temple.city}, {temple.state}
          </div>
        </div>

        <button
          type="button"
          onClick={onBookClick}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-spiritual flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Darshan</span>
        </button>
      </div>
    </div>
  );
};

export default MobileFloatingBookingBar;
