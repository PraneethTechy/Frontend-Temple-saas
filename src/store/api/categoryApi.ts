import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  TempleCategory,
  TempleCategorySuggestion,
} from '@shared/types/index.js';

export interface CategoryWithCount extends TempleCategory {
  templeCount?: number;
}

export interface CategoryDetailWithTemples extends TempleCategory {
  temples?: unknown[];
}

export interface ReviewCategorySuggestionInput {
  id: string;
  action: 'APPROVE' | 'REJECT' | string;
  rejectionReason?: string;
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public: Fetch active categories with real MongoDB temple counts
    getCategories: builder.query<ApiResponse<CategoryWithCount[]>, void>({
      query: () => '/categories',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Category' as const, id: _id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),

    // Public: Fetch category details by slug
    getCategoryBySlug: builder.query<ApiResponse<CategoryDetailWithTemples>, string>({
      query: (slug) => `/categories/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Category' as const, id: slug }],
    }),

    // Admin: List all categories (active & inactive)
    getAdminCategories: builder.query<ApiResponse<TempleCategory[]>, void>({
      query: () => '/admin/categories',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Category' as const, id: _id })),
              { type: 'Category' as const, id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Category' as const, id: 'ADMIN_LIST' }],
    }),

    // Admin: Get category details with assigned temples
    getAdminCategoryById: builder.query<ApiResponse<CategoryDetailWithTemples>, string>({
      query: (id) => `/admin/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Category' as const, id }],
    }),

    // Admin: Create new category
    createCategory: builder.mutation<ApiResponse<TempleCategory>, Partial<TempleCategory> | Record<string, unknown>>({
      query: (body) => ({
        url: '/admin/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Category' as const, id: 'LIST' },
        { type: 'Category' as const, id: 'ADMIN_LIST' },
      ],
    }),

    // Admin: Update category
    updateCategory: builder.mutation<ApiResponse<TempleCategory>, { id: string } & Record<string, unknown>>({
      query: ({ id, ...body }) => ({
        url: `/admin/categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
        { type: 'Category' as const, id: 'ADMIN_LIST' },
        'Temple',
      ],
    }),

    // Admin: Toggle active/inactive status
    toggleCategoryStatus: builder.mutation<ApiResponse<TempleCategory>, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/categories/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
        { type: 'Category' as const, id: 'ADMIN_LIST' },
        'Temple',
      ],
    }),

    // Admin: Assign temple to category
    assignTempleToCategory: builder.mutation<ApiResponse<TempleCategory>, { id: string; templeId: string }>({
      query: ({ id, templeId }) => ({
        url: `/admin/categories/${id}/temples/${templeId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
        { type: 'Category' as const, id: 'ADMIN_LIST' },
        'Temple',
        'AuthorityTemple',
      ],
    }),

    // Admin: Remove temple from category
    removeTempleFromCategory: builder.mutation<ApiResponse<TempleCategory>, { id: string; templeId: string }>({
      query: ({ id, templeId }) => ({
        url: `/admin/categories/${id}/temples/${templeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
        { type: 'Category' as const, id: 'ADMIN_LIST' },
        'Temple',
        'AuthorityTemple',
      ],
    }),

    // Admin: Update a temple's categories directly
    updateTempleCategories: builder.mutation<ApiResponse<{ message?: string }>, { templeId: string; categories: string[] }>({
      query: ({ templeId, categories }) => ({
        url: `/admin/temples/${templeId}/categories`,
        method: 'PATCH',
        body: { categories },
      }),
      invalidatesTags: [
        { type: 'Category' as const, id: 'LIST' },
        { type: 'Category' as const, id: 'ADMIN_LIST' },
        'Temple',
        'AuthorityTemple',
      ],
    }),

    // Admin: Get all category suggestions
    getCategorySuggestions: builder.query<ApiResponse<TempleCategorySuggestion[]>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/admin/category-suggestions',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'CategorySuggestion' as const, id: _id })),
              { type: 'CategorySuggestion' as const, id: 'LIST' },
            ]
          : [{ type: 'CategorySuggestion' as const, id: 'LIST' }],
    }),

    // Admin: Review category suggestion (Approve / Reject)
    reviewCategorySuggestion: builder.mutation<ApiResponse<TempleCategorySuggestion>, ReviewCategorySuggestionInput>({
      query: ({ id, action, rejectionReason }) => ({
        url: `/admin/category-suggestions/${id}`,
        method: 'PATCH',
        body: { action, rejectionReason },
      }),
      invalidatesTags: [
        { type: 'CategorySuggestion' as const, id: 'LIST' },
        { type: 'Category' as const, id: 'LIST' },
        { type: 'Category' as const, id: 'ADMIN_LIST' },
        'Temple',
        'AuthorityTemple',
      ],
    }),

    // Authority: Submit category suggestion
    submitCategorySuggestion: builder.mutation<ApiResponse<TempleCategorySuggestion>, { suggestedName: string; description?: string } | Record<string, unknown>>({
      query: (body) => ({
        url: '/authority/category-suggestions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CategorySuggestion' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useGetAdminCategoriesQuery,
  useGetAdminCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useToggleCategoryStatusMutation,
  useAssignTempleToCategoryMutation,
  useRemoveTempleFromCategoryMutation,
  useUpdateTempleCategoriesMutation,
  useGetCategorySuggestionsQuery,
  useReviewCategorySuggestionMutation,
  useSubmitCategorySuggestionMutation,
} = categoryApi;

export default categoryApi;
