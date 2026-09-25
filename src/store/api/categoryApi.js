import baseApi from './baseApi.js';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public: Fetch active categories with real MongoDB temple counts
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Category', id: _id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    // Public: Fetch category details by slug
    getCategoryBySlug: builder.query({
      query: (slug) => `/categories/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Category', id: slug }],
    }),

    // Admin: List all categories (active & inactive)
    getAdminCategories: builder.query({
      query: () => '/admin/categories',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Category', id: _id })),
              { type: 'Category', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Category', id: 'ADMIN_LIST' }],
    }),

    // Admin: Get category details with assigned temples
    getAdminCategoryById: builder.query({
      query: (id) => `/admin/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Admin: Create new category
    createCategory: builder.mutation({
      query: (body) => ({
        url: '/admin/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ADMIN_LIST' },
      ],
    }),

    // Admin: Update category
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ADMIN_LIST' },
        'Temple',
      ],
    }),

    // Admin: Toggle active/inactive status
    toggleCategoryStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/admin/categories/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ADMIN_LIST' },
        'Temple',
      ],
    }),

    // Admin: Assign temple to category
    assignTempleToCategory: builder.mutation({
      query: ({ id, templeId }) => ({
        url: `/admin/categories/${id}/temples/${templeId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ADMIN_LIST' },
        'Temple',
        'AuthorityTemple',
      ],
    }),

    // Admin: Remove temple from category
    removeTempleFromCategory: builder.mutation({
      query: ({ id, templeId }) => ({
        url: `/admin/categories/${id}/temples/${templeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ADMIN_LIST' },
        'Temple',
        'AuthorityTemple',
      ],
    }),

    // Admin: Update a temple's categories directly
    updateTempleCategories: builder.mutation({
      query: ({ templeId, categories }) => ({
        url: `/admin/temples/${templeId}/categories`,
        method: 'PATCH',
        body: { categories },
      }),
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ADMIN_LIST' },
        'Temple',
        'AuthorityTemple',
      ],
    }),

    // Admin: Get all category suggestions
    getCategorySuggestions: builder.query({
      query: (params) => ({
        url: '/admin/category-suggestions',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'CategorySuggestion', id: _id })),
              { type: 'CategorySuggestion', id: 'LIST' },
            ]
          : [{ type: 'CategorySuggestion', id: 'LIST' }],
    }),

    // Admin: Review category suggestion (Approve / Reject)
    reviewCategorySuggestion: builder.mutation({
      query: ({ id, action, rejectionReason }) => ({
        url: `/admin/category-suggestions/${id}`,
        method: 'PATCH',
        body: { action, rejectionReason },
      }),
      invalidatesTags: [
        { type: 'CategorySuggestion', id: 'LIST' },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'ADMIN_LIST' },
        'Temple',
        'AuthorityTemple',
      ],
    }),

    // Authority: Submit category suggestion
    submitCategorySuggestion: builder.mutation({
      query: (body) => ({
        url: '/authority/category-suggestions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CategorySuggestion', id: 'LIST' }],
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
