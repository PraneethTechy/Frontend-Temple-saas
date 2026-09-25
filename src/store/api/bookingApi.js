import { baseApi } from './baseApi.js';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Create Devotee Booking
    createBooking: builder.mutation({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking', 'Service', 'AuthorityNotification', 'AdminDashboard'],
    }),

    // 2. Get Current Devotee's Bookings
    getMyBookings: builder.query({
      query: (params) => ({
        url: '/bookings/my',
        params,
      }),
      providesTags: ['Booking'],
    }),

    // 3. Get Single Booking Details
    getMyBookingById: builder.query({
      query: (id) => `/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),

    // 4. Cancel Pending Booking
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `/bookings/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Booking', 'Service', 'AuthorityNotification', 'AdminDashboard'],
    }),

    // 5. Admin Bookings Directory
    getAdminBookings: builder.query({
      query: (params) => ({
        url: '/admin/bookings',
        params,
      }),
      providesTags: ['Booking'],
    }),

    // 6. Public QR Code Verification
    verifyBooking: builder.query({
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
