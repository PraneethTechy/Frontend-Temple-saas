import baseApi from './baseApi.js';
import type {
  ApiResponse,
  PaginationMeta,
  Temple,
  TempleRegistration,
  User,
  Booking,
  Payment,
  Review,
  ReviewMetrics,
  AuditLog,
  TempleRecommendation,
} from '@shared/types/index.js';

export interface AdminDashboardStats {
  totalTemples?: number;
  activeTemplesCount?: number;
  pendingRegistrations?: number;
  totalDevotees?: number;
  totalAuthorities?: number;
  recentRegistrations?: TempleRegistration[];
  templeStatusAgg?: Array<{ _id: string; count: number }>;
  statusDistribution?: {
    active: number;
    inactive: number;
    pending: number;
  };
  registrationsTrendAgg?: Array<{ _id: string; count: number }>;
  templesByStateAgg?: Array<{ _id: string; count: number }>;
  categoryDistributionAgg?: Array<{ _id: string; count: number }>;
  recentBookingsTrendAgg?: Array<{ _id: string; count: number }>;
  popularTemplesAgg?: Array<{ _id: string; bookingsCount: number; templeName?: string; city?: string }>;
  recentBookings?: Booking[];
  recentAuditLogs?: AuditLog[];
  [key: string]: unknown;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<ApiResponse<AdminDashboardStats>, void>({
      query: () => '/admin/dashboard',
      providesTags: ['AdminDashboard'],
    }),

    getTempleRegistrations: builder.query<
      ApiResponse<{ registrations: TempleRegistration[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/temple-registrations',
        params: params || {},
      }),
      providesTags: ['TempleRegistration'],
    }),

    getTempleRegistrationById: builder.query<ApiResponse<TempleRegistration>, string>({
      query: (id) => `/admin/temple-registrations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'TempleRegistration' as const, id }],
    }),

    updateRegistrationStatus: builder.mutation<
      ApiResponse<TempleRegistration>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/admin/temple-registrations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['TempleRegistration', 'AdminDashboard'],
    }),

    approveRegistration: builder.mutation<
      ApiResponse<{ registration: TempleRegistration; temple: Temple; authorityUser?: User }>,
      string
    >({
      query: (id) => ({
        url: `/admin/temple-registrations/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['TempleRegistration', 'Temple', 'Authority', 'User', 'AdminDashboard'],
    }),

    createAuthorityForRegistration: builder.mutation<
      ApiResponse<{ registration: TempleRegistration; authorityUser: User }>,
      { id: string; username: string; temporaryPassword?: string }
    >({
      query: ({ id, username, temporaryPassword }) => ({
        url: `/admin/temple-registrations/${id}/create-authority`,
        method: 'POST',
        body: { username, temporaryPassword },
      }),
      invalidatesTags: ['TempleRegistration', 'Temple', 'Authority', 'User', 'AdminDashboard'],
    }),

    resendAuthorityCredentials: builder.mutation<
      ApiResponse<void>,
      { id: string; temporaryPassword?: string }
    >({
      query: ({ id, temporaryPassword }) => ({
        url: `/admin/temple-registrations/${id}/resend-credentials`,
        method: 'POST',
        body: { temporaryPassword },
      }),
      invalidatesTags: ['TempleRegistration', 'Authority'],
    }),

    rejectRegistration: builder.mutation<
      ApiResponse<TempleRegistration>,
      { id: string; rejectionReason: string }
    >({
      query: ({ id, rejectionReason }) => ({
        url: `/admin/temple-registrations/${id}/reject`,
        method: 'POST',
        body: { rejectionReason },
      }),
      invalidatesTags: ['TempleRegistration', 'AdminDashboard'],
    }),

    getAdminTemples: builder.query<
      ApiResponse<{ temples: Temple[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/temples',
        params: params || {},
      }),
      providesTags: ['Temple'],
    }),

    getAdminTempleById: builder.query<ApiResponse<Temple>, string>({
      query: (id) => `/admin/temples/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Temple' as const, id }],
    }),

    // Backward-compatible alias for existing imports
    getTemples: builder.query<
      ApiResponse<{ temples: Temple[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/temples',
        params: params || {},
      }),
      providesTags: ['Temple'],
    }),

    getTempleById: builder.query<ApiResponse<Temple>, string>({
      query: (id) => `/admin/temples/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Temple' as const, id }],
    }),

    updateTempleStatus: builder.mutation<ApiResponse<Temple>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/temples/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Temple', 'AdminDashboard', 'AuditLog'],
    }),

    getAuthorities: builder.query<
      ApiResponse<{ authorities: User[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/authorities',
        params: params || {},
      }),
      providesTags: ['Authority'],
    }),

    getUsers: builder.query<
      ApiResponse<{ users: User[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/users',
        params: params || {},
      }),
      providesTags: ['User'],
    }),

    updateUserStatus: builder.mutation<ApiResponse<User>, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['User', 'Authority', 'AdminDashboard', 'AuditLog'],
    }),

    // Devotees
    getAdminDevotees: builder.query<
      ApiResponse<{ devotees: User[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/devotees',
        params: params || {},
      }),
      providesTags: ['User'],
    }),

    updateDevoteeStatus: builder.mutation<ApiResponse<User>, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/devotees/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['User', 'AdminDashboard', 'AuditLog'],
    }),

    // Bookings
    getAdminBookings: builder.query<
      ApiResponse<{ bookings: Booking[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/bookings',
        params: params || {},
      }),
      providesTags: ['Booking'],
    }),

    // Payments
    getAdminPayments: builder.query<
      ApiResponse<{ payments: Payment[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/payments',
        params: params || {},
      }),
      providesTags: ['Payment'],
    }),

    // Feedback & Reviews
    getAdminReviews: builder.query<
      ApiResponse<{ reviews: Review[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/reviews',
        params: params || {},
      }),
      providesTags: ['Review'],
    }),

    getAdminReviewMetrics: builder.query<ApiResponse<ReviewMetrics>, void>({
      query: () => '/admin/reviews/metrics',
      providesTags: ['Review'],
    }),

    updateAdminReviewStatus: builder.mutation<
      ApiResponse<Review>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/admin/reviews/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Review', 'AdminDashboard', 'AuditLog'],
    }),

    getAdminTempleReviewInsights: builder.query<ApiResponse<Record<string, unknown>>, string>({
      query: (templeId) => `/admin/reviews/insights/${templeId}`,
      providesTags: ['Review'],
    }),

    // Temple Recommendations
    createAdminTempleRecommendation: builder.mutation<
      ApiResponse<TempleRecommendation>,
      Partial<TempleRecommendation>
    >({
      query: (body) => ({
        url: '/admin/recommendations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Recommendation', 'AuditLog'],
    }),

    getAdminTempleRecommendations: builder.query<
      ApiResponse<{ recommendations: TempleRecommendation[]; pagination?: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/recommendations',
        params: params || {},
      }),
      providesTags: ['Recommendation'],
    }),

    // Analytics
    getAdminAnalytics: builder.query<
      ApiResponse<Record<string, unknown>>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/analytics',
        params: params || {},
      }),
      providesTags: ['AdminDashboard', 'Temple', 'Booking', 'Payment', 'User'],
    }),

    // Audit Logs
    getAdminAuditLogs: builder.query<
      ApiResponse<{ logs: AuditLog[]; pagination: PaginationMeta }>,
      Record<string, unknown> | void
    >({
      query: (params = {}) => ({
        url: '/admin/audit-logs',
        params: params || {},
      }),
      providesTags: ['AuditLog'],
    }),

    // Website Reach
    getWebsiteReach: builder.query<ApiResponse<Record<string, unknown>>, { range?: string } | void>({
      query: (params = { range: '7d' }) => ({
        url: '/admin/reach',
        params: params || { range: '7d' },
      }),
      providesTags: ['AdminDashboard'],
    }),

    // Temple-wise Bookings Radial Network
    getTempleWiseBookings: builder.query<
      ApiResponse<Record<string, unknown>>,
      { range?: string } | void
    >({
      query: (params = { range: '30d' }) => ({
        url: '/admin/analytics/temple-bookings',
        params: params || { range: '30d' },
      }),
      providesTags: ['AdminDashboard', 'Booking', 'Temple'],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetTempleRegistrationsQuery,
  useGetTempleRegistrationByIdQuery,
  useUpdateRegistrationStatusMutation,
  useApproveRegistrationMutation,
  useCreateAuthorityForRegistrationMutation,
  useResendAuthorityCredentialsMutation,
  useRejectRegistrationMutation,
  useGetAdminTemplesQuery,
  useGetAdminTempleByIdQuery,
  useGetTemplesQuery,
  useGetTempleByIdQuery,
  useUpdateTempleStatusMutation,
  useGetAuthoritiesQuery,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useGetAdminDevoteesQuery,
  useUpdateDevoteeStatusMutation,
  useGetAdminBookingsQuery,
  useGetAdminPaymentsQuery,
  useGetAdminReviewsQuery,
  useGetAdminReviewMetricsQuery,
  useUpdateAdminReviewStatusMutation,
  useGetAdminTempleReviewInsightsQuery,
  useCreateAdminTempleRecommendationMutation,
  useGetAdminTempleRecommendationsQuery,
  useGetAdminAnalyticsQuery,
  useGetAdminAuditLogsQuery,
  useGetWebsiteReachQuery,
  useGetTempleWiseBookingsQuery,
} = adminApi;

export default adminApi;
