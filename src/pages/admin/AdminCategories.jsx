import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  RefreshCw,
  Eye,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useToggleCategoryStatusMutation,
  useGetCategorySuggestionsQuery,
  useReviewCategorySuggestionMutation,
  useGetAdminCategoryByIdQuery,
  useAssignTempleToCategoryMutation,
  useRemoveTempleFromCategoryMutation,
} from '../../store/api/categoryApi.js';
import { useGetTemplesQuery } from '../../store/api/devoteeApi.js';
import {
  InternalPageHeader,
  InternalFilterToolbar,
  InternalStatusBadge,
} from '../../components/admin/common/index.js';

export const AdminCategories = () => {
  const { onOpenMobileSidebar } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'suggestions'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [manageTemplesCatId, setManageTemplesCatId] = useState(null);
  const [rejectModalSuggestion, setRejectModalSuggestion] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: '',
    displayOrder: 0,
    isActive: true,
  });
  const [formError, setFormError] = useState('');

  // API Queries & Mutations
  const {
    data: categoriesRes,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    refetch: refetchCategories,
  } = useGetAdminCategoriesQuery();
  const categories = categoriesRes?.data || [];

  const {
    data: suggestionsRes,
    isLoading: isLoadingSuggestions,
    refetch: refetchSuggestions,
  } = useGetCategorySuggestionsQuery();
  const suggestions = suggestionsRes?.data || [];
  const pendingSuggestions = suggestions.filter((s) => s.status === 'PENDING');

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [toggleCategoryStatus] = useToggleCategoryStatusMutation();
  const [reviewSuggestion, { isLoading: isReviewing }] = useReviewCategorySuggestionMutation();

  // Helper to open create modal
  const handleOpenCreate = () => {
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      icon: '',
      image: '',
      displayOrder: categories.length,
      isActive: true,
    });
    setFormError('');
    setCreateModalOpen(true);
  };

  // Helper to open edit modal
  const handleOpenEdit = (cat) => {
    setEditCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      image: cat.image || '',
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive !== false,
    });
    setFormError('');
  };

  // Submit Create or Edit Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!categoryForm.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    try {
      if (editCategory) {
        await updateCategory({
          id: editCategory._id,
          ...categoryForm,
          displayOrder: Number(categoryForm.displayOrder) || 0,
        }).unwrap();
        setEditCategory(null);
      } else {
        await createCategory({
          ...categoryForm,
          displayOrder: Number(categoryForm.displayOrder) || 0,
        }).unwrap();
        setCreateModalOpen(false);
      }
    } catch (err) {
      setFormError(err?.data?.message || 'Failed to save category');
    }
  };

  // Toggle status
  const handleToggleStatus = async (cat) => {
    try {
      await toggleCategoryStatus({ id: cat._id, isActive: !cat.isActive }).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Failed to toggle category status');
    }
  };

  // Approve Suggestion
  const handleApproveSuggestion = async (suggestionId) => {
    try {
      await reviewSuggestion({ id: suggestionId, action: 'APPROVE' }).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Failed to approve suggestion');
    }
  };

  // Reject Suggestion
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalSuggestion) return;

    try {
      await reviewSuggestion({
        id: rejectModalSuggestion._id,
        action: 'REJECT',
        rejectionReason: rejectionReason.trim(),
      }).unwrap();
      setRejectModalSuggestion(null);
      setRejectionReason('');
    } catch (err) {
      alert(err?.data?.message || 'Failed to reject suggestion');
    }
  };

  // Filter categories by search
  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <InternalPageHeader
        eyebrow="TAXONOMY & GOVERNANCE"
        title="Temple Categories Management"
        description="Manage public deity & architectural classifications and review temple authority suggestions."
        onOpenMobileSidebar={onOpenMobileSidebar}
      >
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-spiritual-primary hover:bg-spiritual-accent text-white text-xs font-semibold rounded-xl shadow-spiritual-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Category</span>
        </button>
      </InternalPageHeader>

      {/* 2. Compact Filter Toolbar */}
      <InternalFilterToolbar
        statusFilter={activeTab}
        onStatusChange={setActiveTab}
        statusOptions={[
          { label: 'All Categories', value: 'categories', count: categories.length },
          {
            label: 'Authority Suggestions',
            value: 'suggestions',
            count: pendingSuggestions.length > 0 ? pendingSuggestions.length : undefined,
          },
        ]}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search categories by name or slug..."
        extraFilters={
          <button
            type="button"
            onClick={() => {
              refetchCategories();
              refetchSuggestions();
            }}
            className="p-1.5 text-spiritual-muted hover:text-spiritual-text bg-spiritual-surface hover:bg-spiritual-border/40 border border-spiritual-border rounded-lg transition-colors cursor-pointer"
            title="Refresh categories"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        }
      />

      {/* 3. Tab Content */}
      {activeTab === 'categories' ? (
        <div className="space-y-4">

          {/* Categories Table / List */}
          {isLoadingCategories ? (
            <div className="bg-white rounded-2xl border border-spiritual-border p-8 text-center animate-pulse space-y-3">
              <div className="h-6 bg-[#EADBCC]/30 rounded w-1/3 mx-auto" />
              <div className="h-4 bg-[#EADBCC]/20 rounded w-1/2 mx-auto" />
            </div>
          ) : isErrorCategories ? (
            <div className="bg-white rounded-2xl border border-spiritual-border p-8 text-center text-xs text-rose-600 space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto text-rose-500" />
              <p>Failed to load categories. Please try again.</p>
              <button
                type="button"
                onClick={() => refetchCategories()}
                className="px-3 py-1 bg-spiritual-primary text-white rounded-lg text-xs"
              >
                Retry
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            /* Empty State for Categories */
            <div className="bg-white rounded-2xl border border-spiritual-border p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-spiritual-xs">
              <div className="w-12 h-12 rounded-full bg-[#FAF0E1] border border-[#EEDBBA] flex items-center justify-center text-[#B45309]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-spiritual-text">
                No categories created yet.
              </h3>
              <p className="text-xs text-spiritual-muted max-w-sm">
                Create your first temple category to enable devotees to discover sacred shrines by deity and classification.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-spiritual-primary hover:bg-spiritual-primaryDark text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create your first temple category</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-spiritual-surface border-b border-spiritual-border text-spiritual-muted uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Category Name</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center">Assigned Temples</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Order</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-spiritual-borderLight">
                    {filteredCategories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-spiritual-surface/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-spiritual-text flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-[#EADBCC] shrink-0 bg-[#FAF8F3] flex items-center justify-center text-[10px] text-[#B45309] font-bold">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                            ) : (
                              cat.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <span>{cat.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-spiritual-muted">
                          {cat.slug}
                        </td>
                        <td className="py-3.5 px-4 text-spiritual-muted max-w-xs truncate">
                          {cat.description || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setManageTemplesCatId(cat._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-[#8B5E34] border border-[#DFC67F]/60 font-semibold hover:bg-amber-100 transition-all cursor-pointer"
                          >
                            <Building2 className="w-3 h-3 text-[#B45309]" />
                            <span>{cat.templeCount || 0}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              cat.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border-gray-300'
                            }`}
                          >
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-spiritual-muted">
                          {cat.displayOrder || 0}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 text-spiritual-muted hover:text-spiritual-primary transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(cat)}
                              className={`p-1.5 transition-colors cursor-pointer ${
                                cat.isActive
                                  ? 'text-gray-400 hover:text-rose-600'
                                  : 'text-gray-400 hover:text-emerald-600'
                              }`}
                              title={cat.isActive ? 'Deactivate Category' : 'Activate Category'}
                            >
                              {cat.isActive ? (
                                <XCircle className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Suggestions Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-spiritual-muted">
              Category suggestions submitted by Temple Authorities awaiting administrative review.
            </p>
            <button
              type="button"
              onClick={() => refetchSuggestions()}
              className="p-2 text-spiritual-muted hover:text-spiritual-text bg-white border border-spiritual-border rounded-xl"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isLoadingSuggestions ? (
            <div className="bg-white rounded-2xl border border-spiritual-border p-8 text-center animate-pulse space-y-3">
              <div className="h-6 bg-[#EADBCC]/30 rounded w-1/3 mx-auto" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-spiritual-border p-12 text-center flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/80 mb-1" />
              <h3 className="font-serif font-bold text-base text-spiritual-text">
                No category suggestions.
              </h3>
              <p className="text-xs text-spiritual-muted max-w-sm">
                Temple authorities have not submitted any new category suggestions yet.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-spiritual-surface border-b border-spiritual-border text-spiritual-muted uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Suggested Category</th>
                      <th className="py-3 px-4">Temple Name</th>
                      <th className="py-3 px-4">Submitted By</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-spiritual-borderLight">
                    {suggestions.map((sug) => (
                      <tr key={sug._id} className="hover:bg-spiritual-surface/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-spiritual-text">
                          {sug.suggestedName}
                        </td>
                        <td className="py-3.5 px-4 text-spiritual-text">
                          {sug.templeId?.name || '—'}
                          {sug.templeId?.city && (
                            <span className="text-[11px] text-spiritual-muted block">
                              {sug.templeId.city}, {sug.templeId.state}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-spiritual-muted">
                          {sug.submittedBy?.name || '—'}
                          {sug.submittedBy?.authorityDesignation && (
                            <span className="text-[10px] block">
                              ({sug.submittedBy.authorityDesignation})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-spiritual-muted max-w-xs">
                          {sug.description || '—'}
                          {sug.rejectionReason && (
                            <span className="text-rose-600 block mt-1">
                              Reason: {sug.rejectionReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              sug.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : sug.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {sug.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {sug.status === 'PENDING' ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleApproveSuggestion(sug._id)}
                                disabled={isReviewing}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all shadow-xs cursor-pointer"
                              >
                                Create & Assign
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectModalSuggestion(sug);
                                  setRejectionReason('');
                                }}
                                disabled={isReviewing}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-spiritual-muted text-[11px]">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Modal: Create / Edit Category */}
      {(createModalOpen || editCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-spiritual-border pb-3">
              <h3 className="font-bold text-base font-serif text-spiritual-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-spiritual-primary" />
                {editCategory ? 'Edit Temple Category' : 'Create Temple Category'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditCategory(null);
                }}
                className="text-spiritual-muted hover:text-spiritual-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-spiritual-text mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Shiva, Murugan, Amman, Heritage"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-spiritual-text mb-1">
                  Slug (Auto-generated if left empty)
                </label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. shiva, murugan, heritage"
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-spiritual-text mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Short description of this category / deity..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-spiritual-text mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-spiritual-text mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={categoryForm.displayOrder}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({ ...prev, displayOrder: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-spiritual-primary rounded border-gray-300 focus:ring-spiritual-primary"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-medium text-spiritual-text cursor-pointer">
                  Active (visible in public devotee category discovery)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-spiritual-border">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setEditCategory(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-spiritual-border text-spiritual-text hover:bg-spiritual-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 rounded-lg bg-spiritual-primary hover:bg-spiritual-primaryDark text-white font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isCreating || isUpdating ? 'Saving...' : editCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Reject Suggestion */}
      {rejectModalSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-spiritual-border pb-3">
              <h3 className="font-bold text-sm text-spiritual-text flex items-center gap-2 text-rose-600">
                <XCircle className="w-4 h-4" />
                Reject Category Suggestion
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalSuggestion(null)}
                className="text-spiritual-muted hover:text-spiritual-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3.5 text-xs">
              <p className="text-spiritual-muted leading-relaxed">
                Rejecting suggestion for{' '}
                <strong className="text-spiritual-text">"{rejectModalSuggestion.suggestedName}"</strong>{' '}
                from {rejectModalSuggestion.templeId?.name || 'Temple Authority'}.
              </p>

              <div>
                <label className="block font-semibold text-spiritual-text mb-1">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Existing category already covers this deity, or duplicate suggestion."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalSuggestion(null)}
                  className="px-3.5 py-2 rounded-lg border border-spiritual-border text-spiritual-text font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReviewing}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isReviewing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Manage Assigned Temples for a Category */}
      {manageTemplesCatId && (
        <CategoryAssignedTemplesModal
          categoryId={manageTemplesCatId}
          onClose={() => setManageTemplesCatId(null)}
        />
      )}
    </div>
  );
};

/**
 * Subcomponent Modal: Manage Assigned Temples for a Category
 */
const CategoryAssignedTemplesModal = ({ categoryId, onClose }) => {
  const { data: categoryRes, isLoading, refetch } = useGetAdminCategoryByIdQuery(categoryId);
  const category = categoryRes?.data;
  const assignedTemples = category?.temples || [];

  const [assignTemple] = useAssignTempleToCategoryMutation();
  const [removeTemple] = useRemoveTempleFromCategoryMutation();

  const [searchFilter, setSearchFilter] = useState('');
  const { data: allTemplesRes } = useGetTemplesQuery({ limit: 50, search: searchFilter });
  const allTemples = allTemplesRes?.data?.items || [];

  const handleAssign = async (templeId) => {
    try {
      await assignTemple({ id: categoryId, templeId }).unwrap();
      refetch();
    } catch (err) {
      alert(err?.data?.message || 'Failed to assign temple');
    }
  };

  const handleRemove = async (templeId) => {
    try {
      await removeTemple({ id: categoryId, templeId }).unwrap();
      refetch();
    } catch (err) {
      alert(err?.data?.message || 'Failed to remove temple');
    }
  };

  const assignedTempleIds = new Set(assignedTemples.map((t) => t._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-lg max-w-xl w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-spiritual-border pb-3">
          <div>
            <h3 className="font-bold text-base font-serif text-spiritual-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-spiritual-primary" />
              Temples in Category: {category?.name || 'Loading...'}
            </h3>
            <p className="text-[11px] text-spiritual-muted mt-0.5">
              Manage temples assigned to this category
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-spiritual-muted hover:text-spiritual-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assigned Temples Section */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-spiritual-text block">
            Currently Assigned ({assignedTemples.length})
          </span>
          {assignedTemples.length === 0 ? (
            <p className="text-xs text-spiritual-muted italic p-3 bg-spiritual-surface rounded-xl text-center">
              No temples currently assigned to this category.
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {assignedTemples.map((temple) => (
                <div
                  key={temple._id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface/40 text-xs"
                >
                  <div>
                    <span className="font-semibold text-spiritual-text">{temple.name}</span>
                    <span className="text-spiritual-muted block text-[10px]">
                      {temple.city}, {temple.state}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(temple._id)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Temples Section */}
        <div className="space-y-2 pt-3 border-t border-spiritual-border">
          <span className="text-xs font-semibold text-spiritual-text block">Assign Additional Temples</span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search active temples by name or city..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
          />

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {allTemples
              .filter((t) => !assignedTempleIds.has(t._id))
              .map((temple) => (
                <div
                  key={temple._id}
                  className="flex items-center justify-between p-2 rounded-lg border border-spiritual-border/60 hover:bg-spiritual-surface/50 text-xs"
                >
                  <span className="font-medium text-spiritual-text truncate mr-2">
                    {temple.name} ({temple.city})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAssign(temple._id)}
                    className="text-xs font-semibold text-spiritual-primary hover:text-spiritual-primaryDark shrink-0"
                  >
                    + Assign
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-spiritual-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-spiritual-surface hover:bg-spiritual-border text-spiritual-text rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
