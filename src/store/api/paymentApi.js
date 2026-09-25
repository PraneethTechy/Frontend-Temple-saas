import { baseApi } from './baseApi.js';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Create Razorpay Payment Order
    createPaymentOrder: builder.mutation({
      query: (body) => ({
        url: '/payments/create-order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking', 'Payment'],
    }),

    // 2. Verify Razorpay Payment Signature
    verifyPayment: builder.mutation({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking', 'Payment', 'Notification', 'AuthorityBooking', 'AdminDashboard'],
    }),

    // 3. Get Payment Details by Booking ID
    getPaymentByBooking: builder.query({
      query: (bookingId) => `/payments/booking/${bookingId}`,
      providesTags: (result, error, bookingId) => [{ type: 'Payment', id: bookingId }],
    }),
  }),
});

export const {
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useGetPaymentByBookingQuery,
} = paymentApi;

export default paymentApi;
