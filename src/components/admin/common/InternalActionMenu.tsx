import React, { useState, useRef, useEffect, type ReactElement, type ComponentType } from 'react';
import { MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ActionMenuItem {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
}

export interface InternalActionMenuProps {
  items?: ActionMenuItem[];
  align?: 'left' | 'right';
}

export const InternalActionMenu = ({
  items = [],
  align = 'right',
}: InternalActionMenuProps): ReactElement | null => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-lg text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface border border-transparent hover:border-spiritual-border transition-colors cursor-pointer"
        aria-label="Actions"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-30 mt-1 w-48 rounded-xl bg-white border border-spiritual-border shadow-spiritual-md py-1 animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          }`}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <>
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                <span className="truncate">{item.label}</span>
              </>
            );

            const baseClasses = `w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors text-left ${
              item.danger
                ? 'text-rose-700 hover:bg-rose-50'
                : 'text-spiritual-text hover:bg-spiritual-surface hover:text-spiritual-primary'
            } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`;

            if (item.href) {
              return (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={baseClasses}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={index}
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                className={baseClasses}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InternalActionMenu;
