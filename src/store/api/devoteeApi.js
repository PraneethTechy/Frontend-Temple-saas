import { baseApi } from './baseApi.js';

export const devoteeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Public Temple Discovery & Search
    getTemples: builder.query({
      query: (params) => ({
        url: '/temples',
        params,
      }),
      providesTags: ['Temple'],
    }),

    // 2. Public Temple Details by Slug
    getTempleBySlug: builder.query({
      query: (slug) => `/temples/${slug}`,
      providesTags: (result, error, slug) => ['Temple', { type: 'Temple', id: slug }],
    }),

    // 3. Public Service Discovery for an Active Temple
    getTempleServices: builder.query({
      query: (templeId) => `/temples/${templeId}/services`,
      providesTags: ['Service'],
    }),

    // 4. Public Time Slot Availability Discovery (Read-Only)
    getServiceAvailability: builder.query({
      query: ({ templeId, serviceId, date }) => ({
        url: `/temples/${templeId}/services/${serviceId}/availability`,
        params: { date },
      }),
      providesTags: ['Service'],
    }),

    // 4b. Monthly Availability Discovery for Booking Calendar
    getServiceMonthAvailability: builder.query({
      query: ({ templeId, serviceId, month }) => ({
        url: `/temples/${templeId}/services/${serviceId}/availability`,
        params: { month },
      }),
      providesTags: ['Service'],
    }),

    // 5. Devotee Profile Management
    getDevoteeProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateDevoteeProfile: builder.mutation({
      query: (body) => ({
        url: '/users/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // 6. Devotee Bookings Foundation
    getMyBookings: builder.query({
      query: () => '/bookings/my',
      providesTags: ['Booking'],
    }),

    // 7. Devotee Notifications Foundation
    getDevoteeNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['AuthorityNotification'],
    }),
    markDevoteeNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityNotification'],
    }),
    markAllDevoteeNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['AuthorityNotification'],
    }),

    // 8. Public Temple Announcements
    getTempleAnnouncements: builder.query({
      query: (templeId) => `/temples/${templeId}/announcements`,
      providesTags: ['Announcement'],
    }),

    // 9. Public Temple Reviews (Approved only)
    getTempleReviews: builder.query({
      query: (templeId) => `/temples/${templeId}/reviews`,
      providesTags: ['Review'],
    }),

    // 10. Devotee Saved Temples
    getSavedTemples: builder.query({
      query: () => '/users/me/saved-temples',
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map((item) => ({ type: 'SavedTemple', id: item._id })),
              { type: 'SavedTemple', id: 'LIST' },
            ]
          : [{ type: 'SavedTemple', id: 'LIST' }],
    }),

    getSavedTempleStatus: builder.query({
      query: (templeId) => `/users/me/saved-temples/${templeId}/status`,
      providesTags: (result, error, templeId) => [{ type: 'SavedTemple', id: templeId }],
    }),

    saveTemple: builder.mutation({
      query: (templeId) => ({
        url: `/users/me/saved-temples/${templeId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, templeId) => [
        { type: 'SavedTemple', id: 'LIST' },
        { type: 'SavedTemple', id: templeId },
      ],
    }),

    unsaveTemple: builder.mutation({
      query: (templeId) => ({
        url: `/users/me/saved-temples/${templeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, templeId) => [
        { type: 'SavedTemple', id: 'LIST' },
        { type: 'SavedTemple', id: templeId },
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
