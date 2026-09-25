import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Building2,
  Eye,
  AlertCircle,
  Power,
  MapPin,
  Tag,
  Sparkles,
  X,
  Loader2,
  Check,
  ClipboardList,
} from 'lucide-react';
import { useGetAdminTemplesQuery, useUpdateTempleStatusMutation } from '../../store/api/adminApi.js';
import { useGetCategoriesQuery, useUpdateTempleCategoriesMutation } from '../../store/api/categoryApi.js';
import { ROUTES } from '../../constants/routes.js';
import {
  InternalPageHeader,
  InternalFilterToolbar,
  InternalDataTable,
  InternalStatusBadge,
  InternalActionMenu,
} from '../../components/admin/common/index.js';

export const AdminTemples = () => {
  const { onOpenMobileSidebar } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useGetAdminTemplesQuery({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
  });

  const [updateTempleStatus, { isLoading: isUpdatingStatus }] = useUpdateTempleStatusMutation();
  const [updateTempleCategories, { isLoading: isUpdatingCategories }] = useUpdateTempleCategoriesMutation();
  const { data: categoriesRes, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  const [actionFeedback, setActionFeedback] = useState('');

  // Category / Deity Assignment Modal State
  const [editingTemple, setEditingTemple] = useState(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categoryModalError, setCategoryModalError] = useState('');

  const temples = data?.data?.temples || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const availableCategories = categoriesRes?.data || [];

  const handleToggleStatus = async (temple) => {
    const nextStatus = temple.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setActionFeedback('');
    try {
      await updateTempleStatus({ id: temple._id, status: nextStatus }).unwrap();
      setActionFeedback(`Status for "${temple.name}" updated to ${nextStatus}.`);
      refetch();
    } catch (err) {
      setActionFeedback(err?.data?.message || 'Failed to update temple status.');
    }
  };

  const handleOpenCategoryModal = (temple) => {
    setEditingTemple(temple);
    const initialIds = (temple.categories || []).map((c) =>
      typeof c === 'object' && c !== null ? c._id : c
    );
    setSelectedCategoryIds(initialIds);
    setCategorySearchQuery('');
    setCategoryModalError('');
  };

  const handleCloseCategoryModal = () => {
    setEditingTemple(null);
    setSelectedCategoryIds([]);
    setCategorySearchQuery('');
    setCategoryModalError('');
  };

  const handleToggleCategorySelection = (catId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSaveCategories = async () => {
    if (!editingTemple) return;
    setCategoryModalError('');
    try {
      await updateTempleCategories({
        templeId: editingTemple._id,
        categories: selectedCategoryIds,
      }).unwrap();
      setActionFeedback(`Deity / categories updated successfully for "${editingTemple.name}".`);
      handleCloseCategoryModal();
    } catch (err) {
      setCategoryModalError(err?.data?.message || 'Failed to update deity / categories.');
    }
  };

  const filteredCategoriesForModal = availableCategories.filter((cat) => {
    if (!categorySearchQuery.trim()) return true;
    const q = categorySearchQuery.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  // Table Columns Definition
  const columns = [
    {
      header: 'TEMPLE',
      key: 'name',
      render: (temple) => {
        const thumbUrl =
          temple.gallery?.find((g) => g.isThumbnail)?.url ||
          temple.coverImage?.url ||
          temple.gallery?.[0]?.url;

        return (
          <div className="flex items-center gap-3">
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={temple.name}
                className="w-11 h-11 rounded-xl object-cover border border-spiritual-border shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-spiritual-surface border border-spiritual-border flex items-center justify-center shrink-0 text-spiritual-muted">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-spiritual-text text-xs truncate max-w-[220px]">
                {temple.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-spiritual-muted font-mono mt-0.5 truncate">
                <span>{temple.slug}</span>
                {temple.templeType && (
                  <span className="px-1.5 py-0.2 rounded bg-spiritual-surface border border-spiritual-border text-[9px] font-sans">
                    {temple.templeType}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'LOCATION',
      key: 'city',
      render: (temple) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted">
          <MapPin className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span className="truncate max-w-[150px]">
            {temple.city}, {temple.state}
          </span>
        </div>
      ),
    },
    {
      header: 'DEITY / GOD',
      key: 'categories',
      render: (temple) => {
        const assigned = temple.categories || [];
        const hasCategories = assigned.length > 0;
        const primary = hasCategories ? assigned[0] : null;
        const remaining = hasCategories ? assigned.slice(1) : [];

        if (!hasCategories) {
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] italic text-amber-800/80 bg-amber-50/70 px-2 py-0.5 rounded border border-amber-200/50 inline-flex items-center">
                Not assigned
              </span>
              <button
                type="button"
                onClick={() => handleOpenCategoryModal(temple)}
                className="text-[10px] font-semibold text-spiritual-accent hover:underline inline-flex items-center cursor-pointer"
                title="Assign Deity / God"
              >
                + Assign
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/80 inline-flex items-center gap-1 shadow-2xs"
              title={primary.description || primary.name}
            >
              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
              <span>{primary.name || 'Category'}</span>
            </span>

            {remaining.length > 0 && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-spiritual-surface border border-spiritual-border text-spiritual-muted hover:text-spiritual-accent hover:border-spiritual-accent/40 cursor-help transition-colors"
                title={remaining.map((c) => c.name || 'Category').join(', ')}
              >
                +{remaining.length}
              </span>
            )}

            <button
              type="button"
              onClick={() => handleOpenCategoryModal(temple)}
              className="p-1 text-spiritual-muted hover:text-spiritual-accent hover:bg-spiritual-surface rounded transition-colors ml-0.5 cursor-pointer"
              title="Edit Deity / Categories"
            >
              <Tag className="w-3 h-3" />
            </button>
          </div>
        );
      },
    },
    {
      header: 'AUTHORITY',
      key: 'authorityId',
      render: (temple) =>
        temple.authorityId ? (
          <div>
            <div className="font-medium text-spiritual-text text-xs truncate max-w-[150px]">
              {temple.authorityId.name}
            </div>
            <div className="text-[11px] text-spiritual-muted font-mono truncate max-w-[150px]">
              {temple.authorityId.email}
            </div>
          </div>
        ) : (
          <span className="text-spiritual-muted/70 italic text-[11px]">Unassigned</span>
        ),
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (temple) => <InternalStatusBadge status={temple.status} />,
    },
    {
      header: 'CREATED',
      key: 'createdAt',
      render: (temple) => (
        <span className="text-spiritual-muted font-mono text-[11px]">
          {new Date(temple.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      align: 'right',
      render: (temple) => (
        <InternalActionMenu
          align="right"
          items={[
            {
              label: 'View Temple Details',
              icon: Eye,
              href: `${ROUTES.ADMIN}/temples/${temple._id}`,
            },
            {
              label: 'Edit Deity / Categories',
              icon: Tag,
              onClick: () => handleOpenCategoryModal(temple),
            },
            {
              label: temple.status === 'ACTIVE' ? 'Deactivate Temple' : 'Activate Temple',
              icon: Power,
              danger: temple.status === 'ACTIVE',
              disabled: isUpdatingStatus,
              onClick: () => handleToggleStatus(temple),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <InternalPageHeader
        eyebrow="TEMPLE MANAGEMENT"
        title="Temples Directory"
        description="Manage onboarded sacred shrines, assigned deities & categories, assigned authorities, and operational status."
        onOpenMobileSidebar={onOpenMobileSidebar}
      >
        <Link
          to={`${ROUTES.ADMIN}/registrations`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-spiritual-surface border border-spiritual-border text-spiritual-text hover:bg-spiritual-border/40 text-xs font-semibold transition-all shadow-spiritual-xs"
        >
          <ClipboardList className="w-3.5 h-3.5 text-spiritual-accent" />
          <span>Review Onboarding</span>
        </Link>
      </InternalPageHeader>

      {/* Feedback banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between animate-in fade-in duration-150">
          <span>{actionFeedback}</span>
          <button
            onClick={() => setActionFeedback('')}
            className="font-semibold text-amber-950 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Compact Filter Toolbar */}
      <InternalFilterToolbar
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        statusOptions={[
          { label: 'All Temples', value: 'ALL' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={() => setPage(1)}
        searchPlaceholder="Search temple, city, state..."
      />

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load temples: {error?.data?.message || 'Server error'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg font-semibold hover:bg-rose-50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Temples Data Table */}
      <InternalDataTable
        columns={columns}
        data={temples}
        isLoading={isLoading}
        emptyState={{
          icon: Building2,
          title: 'No temples found',
          description:
            statusFilter !== 'ALL'
              ? `No temples match the "${statusFilter}" status filter.`
              : 'Approved temples will appear here once onboarding is completed.',
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
      />

      {/* Category / Deity Assignment Modal */}
      {editingTemple && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-spiritual-border overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-spiritual-border flex items-center justify-between bg-spiritual-surface/50">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h2 className="text-base font-serif font-bold text-spiritual-text">
                    Assign Deity / God
                  </h2>
                </div>
                <p className="text-xs text-spiritual-muted mt-0.5">
                  Temple: <strong className="text-spiritual-text font-semibold">{editingTemple.name}</strong> ({editingTemple.city}, {editingTemple.state})
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseCategoryModal}
                className="p-1.5 rounded-lg text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner inside Modal */}
            {categoryModalError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{categoryModalError}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-hidden flex flex-col flex-1">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search active deities & categories..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-spiritual-border bg-spiritual-surface/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary"
                />
                {selectedCategoryIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryIds([])}
                    className="text-xs text-spiritual-muted hover:text-rose-600 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Clear All ({selectedCategoryIds.length})
                  </button>
                )}
              </div>

              <div className="text-[11px] text-spiritual-muted flex items-center justify-between">
                <span>Select from active categories registered in the database.</span>
                <span className="font-semibold text-spiritual-text">
                  {selectedCategoryIds.length} selected
                </span>
              </div>

              {/* Scrollable Categories List */}
              <div className="flex-1 overflow-y-auto max-h-72 space-y-2 pr-1">
                {isLoadingCategories ? (
                  <div className="py-8 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-spiritual-primary mx-auto" />
                    <p className="text-xs text-spiritual-muted">Loading categories...</p>
                  </div>
                ) : filteredCategoriesForModal.length === 0 ? (
                  <div className="py-8 text-center bg-spiritual-surface/40 rounded-xl border border-dashed border-spiritual-border">
                    <Tag className="w-8 h-8 text-spiritual-subtle mx-auto mb-2" />
                    <p className="text-xs font-semibold text-spiritual-text">No matching categories found</p>
                    <p className="text-[11px] text-spiritual-muted mt-0.5">
                      {categorySearchQuery
                        ? 'Try a different search keyword.'
                        : 'No active categories exist yet.'}
                    </p>
                  </div>
                ) : (
                  filteredCategoriesForModal.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat._id);
                    return (
                      <label
                        key={cat._id}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-2xs'
                            : 'bg-white hover:bg-spiritual-surface/50 border-spiritual-border text-spiritual-text'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCategorySelection(cat._id)}
                          className="mt-0.5 rounded border-spiritual-border text-amber-600 focus:ring-amber-500/30 w-4 h-4 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-xs text-spiritual-text">
                              {cat.name}
                            </span>
                            {cat.templeCount !== undefined && (
                              <span className="text-[10px] text-spiritual-muted font-mono bg-spiritual-surface px-1.5 py-0.5 rounded border border-spiritual-border/60 shrink-0">
                                {cat.templeCount} {cat.templeCount === 1 ? 'temple' : 'temples'}
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-[11px] text-spiritual-muted line-clamp-1 mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-spiritual-border bg-spiritual-surface/50 flex items-center justify-between gap-3">
              <span className="text-[11px] text-spiritual-muted hidden sm:inline">
                Powers public "Find Temples by Deity" filters
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleCloseCategoryModal}
                  disabled={isUpdatingCategories}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategories}
                  disabled={isUpdatingCategories}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-spiritual-primary hover:bg-spiritual-accent transition-colors shadow-spiritual-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingCategories ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemples;
