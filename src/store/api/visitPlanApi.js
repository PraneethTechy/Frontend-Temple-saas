import { baseApi } from './baseApi.js';

export const visitPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Devotee's upcoming confirmed bookings with their saved visit plans
    getUpcomingBookingsWithPlans: builder.query({
      query: () => '/visit-plans',
      providesTags: ['VisitPlan', 'Booking'],
    }),

    // 2. Get specific saved visit plan by booking ID
    getVisitPlan: builder.query({
      query: (bookingId) => `/visit-plans/${bookingId}`,
      providesTags: (result, error, bookingId) => [{ type: 'VisitPlan', id: bookingId }],
    }),

    // 3. Generate or recalculate visit plan
    generateVisitPlan: builder.mutation({
      query: ({ bookingId, origin, travelMode = 'CAR', transitMode = null }) => ({
        url: `/visit-plans/${bookingId}/generate`,
        method: 'POST',
        body: { origin, travelMode, transitMode },
      }),
      invalidatesTags: ['VisitPlan'],
    }),

    // 4. Google Places API (New) Autocomplete Search
    searchPlaces: builder.query({
      query: (input) => ({
        url: '/visit-plans/places/autocomplete',
        params: { input },
      }),
    }),

    // 5. Google Places API (New) Place Details
    getPlaceDetails: builder.query({
      query: (placeId) => `/visit-plans/places/details/${placeId}`,
    }),
  }),
});

export const {
  useGetUpcomingBookingsWithPlansQuery,
  useGetVisitPlanQuery,
  useGenerateVisitPlanMutation,
  useLazySearchPlacesQuery,
  useLazyGetPlaceDetailsQuery,
} = visitPlanApi;

export default visitPlanApi;
