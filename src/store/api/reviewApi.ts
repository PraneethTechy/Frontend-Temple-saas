import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  PaginatedApiResponse,
  Review,
} from '@shared/types/index.js';

export interface PublicReviewsParams {
  page?: number;
  limit?: number;
  sort?: string;
  templeId?: string;
}

export interface EligibleBookingItem {
  _id: string;
  bookingReference?: string;
  templeId?: string;
  templeName?: string;
  serviceId?: string;
  serviceName?: string;
  bookingDate?: string;
  [key: string]: unknown;
}

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get approved public reviews with optional sorting and pagination
    getPublicReviews: builder.query<PaginatedApiResponse<Review>, PublicReviewsParams | void>({
      query: (params) => ({
        url: '/reviews',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 12,
          sort: params?.sort || 'recent',
          templeId: params?.templeId || undefined,
        },
      }),
      providesTags: ['Review'],
    }),

    // 2. Get authenticated devotee's eligible bookings for review
    getEligibleBookings: builder.query<ApiResponse<EligibleBookingItem[]>, void>({
      query: () => '/reviews/eligible-bookings',
      providesTags: ['EligibleBookings'],
    }),

    // 3. Submit a new review (multipart/form-data)
    submitReview: builder.mutation<ApiResponse<Review>, FormData>({
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
