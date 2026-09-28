import React, { type ReactElement, type ReactNode } from 'react';
import { Menu } from 'lucide-react';

export interface InternalPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  onOpenMobileSidebar?: () => void;
  children?: ReactNode;
}

export const InternalPageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  onOpenMobileSidebar,
  children,
}: InternalPageHeaderProps): ReactElement => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-spiritual-border/60">
      <div className="flex items-start gap-3">
        {onOpenMobileSidebar && (
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 -ml-1 text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface rounded-xl border border-spiritual-border transition-colors mt-0.5 shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          {eyebrow && (
            <span className="text-[10px] font-bold tracking-widest text-spiritual-accent uppercase block mb-1">
              {eyebrow}
            </span>
          )}
          <h1 className="text-2xl sm:text-[26px] font-serif font-bold text-spiritual-text tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs text-spiritual-muted mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {(actions || children) && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions || children}
        </div>
      )}
    </div>
  );
};

export default InternalPageHeader;
