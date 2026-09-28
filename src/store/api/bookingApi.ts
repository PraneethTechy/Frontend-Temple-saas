import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams,
  Booking,
  CreateBookingInput,
} from '@shared/types/index.js';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Create Devotee Booking
    createBooking: builder.mutation<ApiResponse<Booking>, CreateBookingInput | Record<string, unknown>>({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking', 'Service', 'AuthorityNotification', 'AdminDashboard'],
    }),

    // 2. Get Current Devotee's Bookings
    getMyBookings: builder.query<PaginatedApiResponse<Booking>, PaginationParams | Record<string, unknown> | void>({
      query: (params) => ({
        url: '/bookings/my',
        params: params || undefined,
      }),
      providesTags: ['Booking'],
    }),

    // 3. Get Single Booking Details
    getMyBookingById: builder.query<ApiResponse<Booking>, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Booking' as const, id }],
    }),

    // 4. Cancel Pending Booking
    cancelBooking: builder.mutation<ApiResponse<Booking>, string>({
      query: (id) => ({
        url: `/bookings/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Booking', 'Service', 'AuthorityNotification', 'AdminDashboard'],
    }),

    // 5. Admin Bookings Directory
    getAdminBookings: builder.query<PaginatedApiResponse<Booking>, PaginationParams | Record<string, unknown> | void>({
      query: (params) => ({
        url: '/admin/bookings',
        params: params || undefined,
      }),
      providesTags: ['Booking'],
    }),

    // 6. Public QR Code Verification
    verifyBooking: builder.query<ApiResponse<Booking>, string>({
      query: (token) => `/bookings/verify/${token}`,
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetMyBookingByIdQuery,
  useCancelBookingMutation,
  useGetAdminBookingsQuery,
  useVerifyBookingQuery,
} = bookingApi;

export default bookingApi;
