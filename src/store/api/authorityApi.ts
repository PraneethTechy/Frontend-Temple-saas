import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams,
  Temple,
  CloudinaryImage,
  Service,
  TimeSlot,
  Booking,
  Notification,
  TempleRecommendation,
  TempleAnnouncement,
} from '@shared/types/index.js';

export const authorityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard & Metrics
    getAuthorityDashboard: builder.query<ApiResponse<Record<string, unknown>>, void>({
      query: () => '/authority/dashboard',
      providesTags: ['AuthorityDashboard'],
    }),

    // Temple Profile
    getAuthorityTemple: builder.query<ApiResponse<Temple>, void>({
      query: () => '/authority/temple',
      providesTags: ['AuthorityTemple'],
    }),
    updateAuthorityTemple: builder.mutation<ApiResponse<Temple>, Partial<Temple> | Record<string, unknown>>({
      query: (body) => ({
        url: '/authority/temple',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AuthorityTemple', 'AuthorityDashboard'],
    }),

    // Gallery
    getAuthorityGallery: builder.query<ApiResponse<CloudinaryImage[]>, void>({
      query: () => '/authority/gallery',
      providesTags: ['AuthorityTemple'],
    }),
    addGalleryImage: builder.mutation<ApiResponse<CloudinaryImage>, { url: string; caption?: string } | Record<string, unknown>>({
      query: (body) => ({
        url: '/authority/gallery',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AuthorityTemple'],
    }),
    uploadGalleryImage: builder.mutation<ApiResponse<CloudinaryImage>, FormData>({
      query: (formData) => ({
        url: '/authority/gallery/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['AuthorityTemple'],
    }),
    deleteGalleryImage: builder.mutation<ApiResponse<{ message?: string }>, string>({
      query: (imageId) => ({
        url: `/authority/gallery/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AuthorityTemple', 'Temple'],
    }),
    setGalleryThumbnail: builder.mutation<ApiResponse<{ message?: string }>, string>({
      query: (imageId) => ({
        url: `/authority/gallery/${imageId}/thumbnail`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityTemple', 'Temple'],
    }),
    setGalleryBanner: builder.mutation<ApiResponse<{ message?: string }>, string>({
      query: (imageId) => ({
        url: `/authority/gallery/${imageId}/banner`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityTemple', 'Temple'],
    }),
    updateGalleryOrder: builder.mutation<ApiResponse<{ message?: string }>, { imageIds: string[] } | Record<string, unknown>>({
      query: (body) => ({
        url: '/authority/gallery/order',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AuthorityTemple', 'Temple'],
    }),

    // Services
    getAuthorityServices: builder.query<PaginatedApiResponse<Service> | ApiResponse<Service[]>, PaginationParams | Record<string, unknown> | void>({
      query: (params) => ({
        url: '/authority/services',
        params: params || undefined,
      }),
      providesTags: ['AuthorityService'],
    }),
    getAuthorityServiceById: builder.query<ApiResponse<Service>, string>({
      query: (id) => `/authority/services/${id}`,
      providesTags: ['AuthorityService'],
    }),
    createAuthorityService: builder.mutation<ApiResponse<Service>, Partial<Service> | Record<string, unknown>>({
      query: (body) => ({
        url: '/authority/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AuthorityService', 'AuthorityDashboard'],
    }),
    updateAuthorityService: builder.mutation<ApiResponse<Service>, { id: string } & Record<string, unknown>>({
      query: ({ id, ...body }) => ({
        url: `/authority/services/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AuthorityService', 'AuthorityDashboard'],
    }),
    deleteAuthorityService: builder.mutation<ApiResponse<{ message?: string }>, string>({
      query: (id) => ({
        url: `/authority/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AuthorityService', 'AuthorityDashboard'],
    }),

    // Time Slots
    getAuthorityTimeSlots: builder.query<PaginatedApiResponse<TimeSlot> | ApiResponse<TimeSlot[]>, PaginationParams | Record<string, unknown> | void>({
      query: (params) => ({
        url: '/authority/time-slots',
        params: params || undefined,
      }),
      providesTags: ['AuthorityTimeSlot'],
    }),
    getAuthorityTimeSlotById: builder.query<ApiResponse<TimeSlot>, string>({
      query: (id) => `/authority/time-slots/${id}`,
      providesTags: ['AuthorityTimeSlot'],
    }),
    createAuthorityTimeSlot: builder.mutation<ApiResponse<TimeSlot>, Partial<TimeSlot> | Record<string, unknown>>({
      query: (body) => ({
        url: '/authority/time-slots',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AuthorityTimeSlot', 'AuthorityDashboard'],
    }),
    updateAuthorityTimeSlot: builder.mutation<ApiResponse<TimeSlot>, { id: string } & Record<string, unknown>>({
      query: ({ id, ...body }) => ({
        url: `/authority/time-slots/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AuthorityTimeSlot', 'AuthorityDashboard'],
    }),
    deleteAuthorityTimeSlot: builder.mutation<ApiResponse<{ message?: string }>, string>({
      query: (id) => ({
        url: `/authority/time-slots/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AuthorityTimeSlot', 'AuthorityDashboard'],
    }),

    // Bookings & Devotees (Read-Only)
    getAuthorityBookings: builder.query<PaginatedApiResponse<Booking>, PaginationParams | Record<string, unknown> | void>({
      query: (params) => ({
        url: '/authority/bookings',
        params: params || undefined,
      }),
      providesTags: ['AuthorityBooking'],
    }),
    getAuthorityDevotees: builder.query<PaginatedApiResponse<Record<string, unknown>>, PaginationParams | Record<string, unknown> | void>({
      query: (params) => ({
        url: '/authority/devotees',
        params: params || undefined,
      }),
      providesTags: ['AuthorityBooking'],
    }),

    // Analytics
    getAuthorityAnalytics: builder.query<ApiResponse<Record<string, unknown>>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/authority/analytics',
        params: params || undefined,
      }),
      providesTags: ['AuthorityDashboard', 'AuthorityService', 'AuthorityTimeSlot', 'AuthorityBooking'],
    }),

    // Notifications
    getAuthorityNotifications: builder.query<ApiResponse<Notification[]>, void>({
      query: () => '/authority/notifications',
      providesTags: ['AuthorityNotification'],
    }),
    markNotificationRead: builder.mutation<ApiResponse<Notification>, string>({
      query: (id) => ({
        url: `/authority/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityNotification'],
    }),
    markAllNotificationsRead: builder.mutation<ApiResponse<{ message?: string }>, void>({
      query: () => ({
        url: '/authority/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityNotification'],
    }),

    // Temple Recommendations
    getAuthorityRecommendations: builder.query<ApiResponse<TempleRecommendation[]>, void>({
      query: () => '/authority/recommendations',
      providesTags: ['Recommendation'],
    }),
    updateAuthorityRecommendationStatus: builder.mutation<ApiResponse<TempleRecommendation>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/authority/recommendations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Recommendation'],
    }),

    // Temple Announcements
    getAuthorityAnnouncements: builder.query<ApiResponse<TempleAnnouncement[]>, void>({
      query: () => '/authority/announcements',
      providesTags: ['Announcement'],
    }),
    createAuthorityAnnouncement: builder.mutation<ApiResponse<TempleAnnouncement>, Partial<TempleAnnouncement> | Record<string, unknown>>({
      query: (body) => ({
        url: '/authority/announcements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Announcement'],
    }),
    updateAuthorityAnnouncement: builder.mutation<ApiResponse<TempleAnnouncement>, { id: string } & Record<string, unknown>>({
      query: ({ id, ...body }) => ({
        url: `/authority/announcements/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Announcement'],
    }),
    deleteAuthorityAnnouncement: builder.mutation<ApiResponse<{ message?: string }>, string>({
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
