import { baseApi } from './baseApi.js';

export const authorityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard & Metrics
    getAuthorityDashboard: builder.query({
      query: () => '/authority/dashboard',
      providesTags: ['AuthorityDashboard'],
    }),

    // Temple Profile
    getAuthorityTemple: builder.query({
      query: () => '/authority/temple',
      providesTags: ['AuthorityTemple'],
    }),
    updateAuthorityTemple: builder.mutation({
      query: (body) => ({
        url: '/authority/temple',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AuthorityTemple', 'AuthorityDashboard'],
    }),

    // Gallery
    getAuthorityGallery: builder.query({
      query: () => '/authority/gallery',
      providesTags: ['AuthorityTemple'],
    }),
    addGalleryImage: builder.mutation({
      query: (body) => ({
        url: '/authority/gallery',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AuthorityTemple'],
    }),
    uploadGalleryImage: builder.mutation({
      query: (formData) => ({
        url: '/authority/gallery/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['AuthorityTemple'],
    }),
    deleteGalleryImage: builder.mutation({
      query: (imageId) => ({
        url: `/authority/gallery/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AuthorityTemple', 'Temple'],
    }),
    setGalleryThumbnail: builder.mutation({
      query: (imageId) => ({
        url: `/authority/gallery/${imageId}/thumbnail`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityTemple', 'Temple'],
    }),
    setGalleryBanner: builder.mutation({
      query: (imageId) => ({
        url: `/authority/gallery/${imageId}/banner`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityTemple', 'Temple'],
    }),
    updateGalleryOrder: builder.mutation({
      query: (body) => ({
        url: '/authority/gallery/order',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AuthorityTemple', 'Temple'],
    }),

    // Services
    getAuthorityServices: builder.query({
      query: (params) => ({
        url: '/authority/services',
        params,
      }),
      providesTags: ['AuthorityService'],
    }),
    getAuthorityServiceById: builder.query({
      query: (id) => `/authority/services/${id}`,
      providesTags: ['AuthorityService'],
    }),
    createAuthorityService: builder.mutation({
      query: (body) => ({
        url: '/authority/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AuthorityService', 'AuthorityDashboard'],
    }),
    updateAuthorityService: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/authority/services/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AuthorityService', 'AuthorityDashboard'],
    }),
    deleteAuthorityService: builder.mutation({
      query: (id) => ({
        url: `/authority/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AuthorityService', 'AuthorityDashboard'],
    }),

    // Time Slots
    getAuthorityTimeSlots: builder.query({
      query: (params) => ({
        url: '/authority/time-slots',
        params,
      }),
      providesTags: ['AuthorityTimeSlot'],
    }),
    getAuthorityTimeSlotById: builder.query({
      query: (id) => `/authority/time-slots/${id}`,
      providesTags: ['AuthorityTimeSlot'],
    }),
    createAuthorityTimeSlot: builder.mutation({
      query: (body) => ({
        url: '/authority/time-slots',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AuthorityTimeSlot', 'AuthorityDashboard'],
    }),
    updateAuthorityTimeSlot: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/authority/time-slots/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AuthorityTimeSlot', 'AuthorityDashboard'],
    }),
    deleteAuthorityTimeSlot: builder.mutation({
      query: (id) => ({
        url: `/authority/time-slots/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AuthorityTimeSlot', 'AuthorityDashboard'],
    }),

    // Bookings & Devotees (Read-Only)
    getAuthorityBookings: builder.query({
      query: (params) => ({
        url: '/authority/bookings',
        params,
      }),
      providesTags: ['AuthorityBooking'],
    }),
    getAuthorityDevotees: builder.query({
      query: (params) => ({
        url: '/authority/devotees',
        params,
      }),
      providesTags: ['AuthorityBooking'],
    }),

    // Analytics
    getAuthorityAnalytics: builder.query({
      query: (params) => ({
        url: '/authority/analytics',
        params,
      }),
      providesTags: ['AuthorityDashboard', 'AuthorityService', 'AuthorityTimeSlot', 'AuthorityBooking'],
    }),

    // Notifications
    getAuthorityNotifications: builder.query({
      query: () => '/authority/notifications',
      providesTags: ['AuthorityNotification'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/authority/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityNotification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/authority/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityNotification'],
    }),

    // Temple Recommendations
    getAuthorityRecommendations: builder.query({
      query: () => '/authority/recommendations',
      providesTags: ['Recommendation'],
    }),
    updateAuthorityRecommendationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/authority/recommendations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Recommendation'],
    }),

    // Temple Announcements
    getAuthorityAnnouncements: builder.query({
      query: () => '/authority/announcements',
      providesTags: ['Announcement'],
    }),
    createAuthorityAnnouncement: builder.mutation({
      query: (body) => ({
        url: '/authority/announcements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Announcement'],
    }),
    updateAuthorityAnnouncement: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/authority/announcements/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Announcement'],
    }),
    deleteAuthorityAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/authority/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Announcement'],
    }),
  }),
});

export const {
  useGetAuthorityDashboardQuery,
  useGetAuthorityTempleQuery,
  useUpdateAuthorityTempleMutation,
  useGetAuthorityGalleryQuery,
  useAddGalleryImageMutation,
  useUploadGalleryImageMutation,
  useDeleteGalleryImageMutation,
  useSetGalleryThumbnailMutation,
  useSetGalleryBannerMutation,
  useUpdateGalleryOrderMutation,
  useGetAuthorityServicesQuery,
  useGetAuthorityServiceByIdQuery,
  useCreateAuthorityServiceMutation,
  useUpdateAuthorityServiceMutation,
  useDeleteAuthorityServiceMutation,
  useGetAuthorityTimeSlotsQuery,
  useGetAuthorityTimeSlotByIdQuery,
  useCreateAuthorityTimeSlotMutation,
  useUpdateAuthorityTimeSlotMutation,
  useDeleteAuthorityTimeSlotMutation,
  useGetAuthorityBookingsQuery,
  useGetAuthorityDevoteesQuery,
  useGetAuthorityAnalyticsQuery,
  useGetAuthorityNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetAuthorityRecommendationsQuery,
  useUpdateAuthorityRecommendationStatusMutation,
  useGetAuthorityAnnouncementsQuery,
  useCreateAuthorityAnnouncementMutation,
  useUpdateAuthorityAnnouncementMutation,
  useDeleteAuthorityAnnouncementMutation,
} = authorityApi;

export default authorityApi;
