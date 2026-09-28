import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams,
  Temple,
  Service,
  AuthenticatedUser,
  UpdateProfileInput,
  Booking,
  Notification,
  TempleAnnouncement,
  Review,
} from '@shared/types/index.js';

export interface ServiceDateAvailabilityParams {
  templeId: string;
  serviceId: string;
  date: string;
}

export interface ServiceMonthAvailabilityParams {
  templeId: string;
  serviceId: string;
  month: string;
}

export interface ServiceAvailabilitySlot {
  _id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  remainingCapacity?: number;
  isAvailable?: boolean;
}

export interface ServiceAvailabilityInfo {
  date?: string;
  available?: boolean;
  slots?: ServiceAvailabilitySlot[];
  [key: string]: unknown;
}

export const devoteeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Public Temple Discovery & Search
    getTemples: builder.query<PaginatedApiResponse<Temple>, PaginationParams | Record<string, unknown> | void>({
      query: (params) => ({
        url: '/temples',
        params: params || undefined,
      }),
      providesTags: ['Temple'],
    }),

    // 2. Public Temple Details by Slug
    getTempleBySlug: builder.query<ApiResponse<Temple>, string>({
      query: (slug) => `/temples/${slug}`,
      providesTags: (_result, _error, slug) => ['Temple', { type: 'Temple', id: slug }],
    }),

    // 3. Public Service Discovery for an Active Temple
    getTempleServices: builder.query<ApiResponse<Service[]>, string>({
      query: (templeId) => `/temples/${templeId}/services`,
      providesTags: ['Service'],
    }),

    // 4. Public Time Slot Availability Discovery (Read-Only)
    getServiceAvailability: builder.query<ApiResponse<ServiceAvailabilityInfo>, ServiceDateAvailabilityParams>({
      query: ({ templeId, serviceId, date }) => ({
        url: `/temples/${templeId}/services/${serviceId}/availability`,
        params: { date },
      }),
      providesTags: ['Service'],
    }),

    // 4b. Monthly Availability Discovery for Booking Calendar
    getServiceMonthAvailability: builder.query<ApiResponse<Record<string, unknown> | ServiceAvailabilityInfo>, ServiceMonthAvailabilityParams>({
      query: ({ templeId, serviceId, month }) => ({
        url: `/temples/${templeId}/services/${serviceId}/availability`,
        params: { month },
      }),
      providesTags: ['Service'],
    }),

    // 5. Devotee Profile Management
    getDevoteeProfile: builder.query<ApiResponse<AuthenticatedUser>, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateDevoteeProfile: builder.mutation<ApiResponse<AuthenticatedUser>, UpdateProfileInput | Record<string, unknown>>({
      query: (body) => ({
        url: '/users/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // 6. Devotee Bookings Foundation
    getMyBookings: builder.query<PaginatedApiResponse<Booking>, PaginationParams | Record<string, unknown> | void>({
      query: () => '/bookings/my',
      providesTags: ['Booking'],
    }),

    // 7. Devotee Notifications Foundation
    getDevoteeNotifications: builder.query<ApiResponse<{ notifications: Notification[]; unreadCount: number }>, void>({
      query: () => '/notifications',
      providesTags: ['AuthorityNotification'],
    }),
    markDevoteeNotificationRead: builder.mutation<ApiResponse<Notification>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityNotification'],
    }),
    markAllDevoteeNotificationsRead: builder.mutation<ApiResponse<{ message?: string }>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityNotification'],
    }),

    // 8. Public Temple Announcements
    getTempleAnnouncements: builder.query<ApiResponse<TempleAnnouncement[]>, string>({
      query: (templeId) => `/temples/${templeId}/announcements`,
      providesTags: ['Announcement'],
    }),

    // 9. Public Temple Reviews (Approved only)
    getTempleReviews: builder.query<ApiResponse<Review[]>, string>({
      query: (templeId) => `/temples/${templeId}/reviews`,
      providesTags: ['Review'],
    }),

    // 10. Devotee Saved Temples
    getSavedTemples: builder.query<PaginatedApiResponse<Temple>, void>({
      query: () => '/users/me/saved-temples',
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map((item) => ({ type: 'SavedTemple' as const, id: item._id })),
              { type: 'SavedTemple' as const, id: 'LIST' },
            ]
          : [{ type: 'SavedTemple' as const, id: 'LIST' }],
    }),

    getSavedTempleStatus: builder.query<ApiResponse<{ isSaved: boolean }>, string>({
      query: (templeId) => `/users/me/saved-temples/${templeId}/status`,
      providesTags: (_result, _error, templeId) => [{ type: 'SavedTemple' as const, id: templeId }],
    }),

    saveTemple: builder.mutation<ApiResponse<{ message?: string }>, string>({
      query: (templeId) => ({
        url: `/users/me/saved-temples/${templeId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, templeId) => [
        { type: 'SavedTemple' as const, id: 'LIST' },
        { type: 'SavedTemple' as const, id: templeId },
      ],
    }),

    unsaveTemple: builder.mutation<ApiResponse<{ message?: string }>, string>({
      query: (templeId) => ({
        url: `/users/me/saved-temples/${templeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, templeId) => [
        { type: 'SavedTemple' as const, id: 'LIST' },
        { type: 'SavedTemple' as const, id: templeId },
      ],
    }),
  }),
});

export const {
  useGetTemplesQuery,
  useGetTempleBySlugQuery,
  useGetTempleServicesQuery,
  useGetServiceAvailabilityQuery,
  useLazyGetServiceAvailabilityQuery,
  useGetServiceMonthAvailabilityQuery,
  useLazyGetServiceMonthAvailabilityQuery,
  useGetDevoteeProfileQuery,
  useUpdateDevoteeProfileMutation,
  useGetMyBookingsQuery,
  useGetDevoteeNotificationsQuery,
  useMarkDevoteeNotificationReadMutation,
  useMarkAllDevoteeNotificationsReadMutation,
  useGetTempleAnnouncementsQuery,
  useGetTempleReviewsQuery,
  useGetSavedTemplesQuery,
  useGetSavedTempleStatusQuery,
  useSaveTempleMutation,
  useUnsaveTempleMutation,
} = devoteeApi;

export default devoteeApi;
