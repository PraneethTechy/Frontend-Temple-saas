import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  Payment,
  CreatePaymentOrderInput,
  CreatePaymentOrderResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from '@shared/types/index.js';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Create Razorpay Payment Order
    createPaymentOrder: builder.mutation<ApiResponse<CreatePaymentOrderResult>, CreatePaymentOrderInput | { bookingId: string }>({
      query: (body) => ({
        url: '/payments/create-order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking', 'Payment', 'Service'],
    }),

    // 2. Verify Razorpay Payment Signature
    verifyPayment: builder.mutation<ApiResponse<VerifyPaymentResult>, VerifyPaymentInput | Record<string, unknown>>({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking', 'Payment', 'Service', 'Notification', 'AuthorityBooking', 'AdminDashboard'],
    }),

    // 3. Get Payment Details by Booking ID
    getPaymentByBooking: builder.query<ApiResponse<Payment>, string>({
      query: (bookingId) => `/payments/booking/${bookingId}`,
      providesTags: (_result, _error, bookingId) => [{ type: 'Payment' as const, id: bookingId }],
    }),
  }),
});

export const {
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useGetPaymentByBookingQuery,
} = paymentApi;

export default paymentApi;
