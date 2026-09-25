import { baseApi } from './baseApi.js';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get approved public reviews with optional sorting and pagination
    getPublicReviews: builder.query({
      query: (params = {}) => ({
        url: '/reviews',
        params: {
          page: params.page || 1,
          limit: params.limit || 12,
          sort: params.sort || 'recent',
          templeId: params.templeId || undefined,
        },
      }),
      providesTags: ['Review'],
    }),

    // 2. Get authenticated devotee's eligible bookings for review
    getEligibleBookings: builder.query({
      query: () => '/reviews/eligible-bookings',
      providesTags: ['EligibleBookings'],
    }),

    // 3. Submit a new review (multipart/form-data)
    submitReview: builder.mutation({
      query: (formData) => ({
        url: '/reviews',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Review', 'EligibleBookings'],
    }),
  }),
});

export const {
  useGetPublicReviewsQuery,
  useGetEligibleBookingsQuery,
  useSubmitReviewMutation,
} = reviewApi;

export default reviewApi;
