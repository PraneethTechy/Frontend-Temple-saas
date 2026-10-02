import React, { type ReactElement, type ReactNode, type ComponentType } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { PaginationMeta } from '@shared/types/index.js';

export interface DataTableColumn<T = Record<string, unknown>> {
  key?: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: T, rowIndex: number) => ReactNode;
}

export interface DataTableEmptyState {
  icon?: ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export interface InternalDataTableProps<T = Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data?: T[];
  isLoading?: boolean;
  emptyState?: DataTableEmptyState | null;
  pagination?: PaginationMeta | null;
  onPageChange?: ((page: number) => void) | null;
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
}

export const InternalDataTable = <T extends Record<string, unknown>>({
  columns = [],
  data = [],
  isLoading = false,
  emptyState = null,
  pagination = null,
  onPageChange = null,
  keyExtractor = (item: T, index: number): string | number => {
    const record = item as { _id?: string | number; id?: string | number };
    return record._id ?? record.id ?? index;
  },
  className = '',
}: InternalDataTableProps<T>): ReactElement => {
  const EmptyIcon = emptyState?.icon || Inbox;

  return (
    <div
      className={`bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xs overflow-hidden flex flex-col w-full min-w-0 max-w-full ${className}`}
    >
      {/* Table Body Area */}
      {isLoading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-12 bg-spiritual-surface/80 animate-pulse rounded-xl border border-spiritual-border/40"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-spiritual-surface border border-spiritual-border flex items-center justify-center mx-auto mb-3 text-spiritual-muted">
            <EmptyIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-serif font-bold text-spiritual-text mb-1">
            {emptyState?.title || 'No records found'}
          </h3>
          <p className="text-xs text-spiritual-muted max-w-sm mx-auto leading-relaxed">
            {emptyState?.description || 'No entries match your search or filter criteria.'}
          </p>
          {emptyState?.action && (
            <div className="mt-4">{emptyState.action}</div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto w-full min-w-0 table-scrollbar">
          <table className="w-full min-w-[850px] text-left text-xs border-collapse">
            <thead className="bg-spiritual-surface/60 text-spiritual-muted uppercase text-[10px] tracking-wider border-b border-spiritual-border">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    className={`px-5 py-3.5 font-semibold select-none whitespace-nowrap ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.width || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-spiritual-border text-spiritual-text">
              {data.map((item, rowIndex) => (
                <tr
                  key={keyExtractor(item, rowIndex)}
                  className="hover:bg-spiritual-surface/30 transition-colors h-[68px]"
                >
                  {columns.map((col, colIndex) => {
                    const content = col.render
                      ? col.render(item, rowIndex)
                      : col.key
                      ? ((item as Record<string, unknown>)[col.key] as ReactNode)
                      : null;

                    return (
                      <td
                        key={col.key || colIndex}
                        className={`px-5 py-3.5 align-middle ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.total > 0 && (
        <div className="px-5 py-3.5 border-t border-spiritual-border bg-spiritual-surface/30 flex items-center justify-between text-xs text-spiritual-muted mt-auto">
          <span>
            Showing <strong className="text-spiritual-text font-semibold">{data.length}</strong> of{' '}
            <strong className="text-spiritual-text font-semibold">{pagination.total}</strong> records
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange && onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-spiritual-border bg-white text-spiritual-text hover:bg-spiritual-surface disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium px-2 text-spiritual-text text-[11px]">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() =>
                onPageChange &&
                onPageChange(Math.min(pagination.totalPages || 1, pagination.page + 1))
              }
              disabled={pagination.page >= (pagination.totalPages || 1)}
              className="p-1.5 rounded-lg border border-spiritual-border bg-white text-spiritual-text hover:bg-spiritual-surface disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalDataTable;
