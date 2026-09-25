import baseApi from './baseApi.js';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['AdminDashboard'],
    }),

    getTempleRegistrations: builder.query({
      query: (params = {}) => ({
        url: '/admin/temple-registrations',
        params,
      }),
      providesTags: ['TempleRegistration'],
    }),

    getTempleRegistrationById: builder.query({
      query: (id) => `/admin/temple-registrations/${id}`,
      providesTags: (result, error, id) => [{ type: 'TempleRegistration', id }],
    }),

    updateRegistrationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/temple-registrations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['TempleRegistration', 'AdminDashboard'],
    }),

    approveRegistration: builder.mutation({
      query: (id) => ({
        url: `/admin/temple-registrations/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['TempleRegistration', 'Temple', 'Authority', 'User', 'AdminDashboard'],
    }),

    createAuthorityForRegistration: builder.mutation({
      query: ({ id, username, temporaryPassword }) => ({
        url: `/admin/temple-registrations/${id}/create-authority`,
        method: 'POST',
        body: { username, temporaryPassword },
      }),
      invalidatesTags: ['TempleRegistration', 'Temple', 'Authority', 'User', 'AdminDashboard'],
    }),

    resendAuthorityCredentials: builder.mutation({
      query: ({ id, temporaryPassword }) => ({
        url: `/admin/temple-registrations/${id}/resend-credentials`,
        method: 'POST',
        body: { temporaryPassword },
      }),
      invalidatesTags: ['TempleRegistration', 'Authority'],
    }),

    rejectRegistration: builder.mutation({
      query: ({ id, rejectionReason }) => ({
        url: `/admin/temple-registrations/${id}/reject`,
        method: 'POST',
        body: { rejectionReason },
      }),
      invalidatesTags: ['TempleRegistration', 'AdminDashboard'],
    }),

    getAdminTemples: builder.query({
      query: (params = {}) => ({
        url: '/admin/temples',
        params,
      }),
      providesTags: ['Temple'],
    }),

    getAdminTempleById: builder.query({
      query: (id) => `/admin/temples/${id}`,
      providesTags: (result, error, id) => [{ type: 'Temple', id }],
    }),

    // Backward-compatible alias for existing imports
    getTemples: builder.query({
      query: (params = {}) => ({
        url: '/admin/temples',
        params,
      }),
      providesTags: ['Temple'],
    }),

    getTempleById: builder.query({
      query: (id) => `/admin/temples/${id}`,
      providesTags: (result, error, id) => [{ type: 'Temple', id }],
    }),

    updateTempleStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/temples/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Temple', 'AdminDashboard', 'AuditLog'],
    }),

    getAuthorities: builder.query({
      query: (params = {}) => ({
        url: '/admin/authorities',
        params,
      }),
      providesTags: ['Authority'],
    }),

    getUsers: builder.query({
      query: (params = {}) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['User'],
    }),

    updateUserStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['User', 'Authority', 'AdminDashboard', 'AuditLog'],
    }),

    // Devotees
    getAdminDevotees: builder.query({
      query: (params = {}) => ({
        url: '/admin/devotees',
        params,
      }),
      providesTags: ['User'],
    }),

    updateDevoteeStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/admin/devotees/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['User', 'AdminDashboard', 'AuditLog'],
    }),

    // Bookings
    getAdminBookings: builder.query({
      query: (params = {}) => ({
        url: '/admin/bookings',
        params,
      }),
      providesTags: ['Booking'],
    }),

    // Payments
    getAdminPayments: builder.query({
      query: (params = {}) => ({
        url: '/admin/payments',
        params,
      }),
      providesTags: ['Payment'],
    }),

    // Feedback & Reviews
    getAdminReviews: builder.query({
      query: (params = {}) => ({
        url: '/admin/reviews',
        params,
      }),
      providesTags: ['Review'],
    }),

    getAdminReviewMetrics: builder.query({
      query: () => '/admin/reviews/metrics',
      providesTags: ['Review'],
    }),

    updateAdminReviewStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/reviews/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Review', 'AdminDashboard', 'AuditLog'],
    }),

    getAdminTempleReviewInsights: builder.query({
      query: (templeId) => `/admin/reviews/insights/${templeId}`,
      providesTags: ['Review'],
    }),

    // Temple Recommendations
    createAdminTempleRecommendation: builder.mutation({
      query: (body) => ({
        url: '/admin/recommendations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Recommendation', 'AuditLog'],
    }),

    getAdminTempleRecommendations: builder.query({
      query: (params = {}) => ({
        url: '/admin/recommendations',
        params,
      }),
      providesTags: ['Recommendation'],
    }),

    // Analytics
    getAdminAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/admin/analytics',
        params,
      }),
      providesTags: ['AdminDashboard', 'Temple', 'Booking', 'Payment', 'User'],
    }),

    // Audit Logs
    getAdminAuditLogs: builder.query({
      query: (params = {}) => ({
        url: '/admin/audit-logs',
        params,
      }),
      providesTags: ['AuditLog'],
    }),

    // Website Reach
    getWebsiteReach: builder.query({
      query: (params = { range: '7d' }) => ({
        url: '/admin/reach',
        params,
      }),
      providesTags: ['AdminDashboard'],
    }),

    // Temple-wise Bookings Radial Network
    getTempleWiseBookings: builder.query({
      query: (params = { range: '30d' }) => ({
        url: '/admin/analytics/temple-bookings',
        params,
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
