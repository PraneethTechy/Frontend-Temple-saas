import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  VisitPlan,
  VisitOriginLocation,
} from '@shared/types/index.js';

export interface GenerateVisitPlanInput {
  bookingId: string;
  origin: VisitOriginLocation;
  travelMode?: string;
  transitMode?: string | null;
}

export interface PlaceAutocompleteSuggestion {
  placeId: string;
  name: string;
  formattedAddress: string;
}

export interface PlaceDetailsResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export interface UpcomingBookingWithPlan {
  _id: string;
  bookingReference: string;
  templeName: string;
  serviceName: string;
  bookingDate: string;
  startTime: string;
  hasPlan?: boolean;
  planId?: string;
  [key: string]: unknown;
}

export const visitPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Devotee's upcoming confirmed bookings with their saved visit plans
    getUpcomingBookingsWithPlans: builder.query<ApiResponse<UpcomingBookingWithPlan[]>, void>({
      query: () => '/visit-plans',
      providesTags: ['VisitPlan', 'Booking'],
    }),

    // 2. Get specific saved visit plan by booking ID
    getVisitPlan: builder.query<ApiResponse<VisitPlan>, string>({
      query: (bookingId) => `/visit-plans/${bookingId}`,
      providesTags: (_result, _error, bookingId) => [{ type: 'VisitPlan' as const, id: bookingId }],
    }),

    // 3. Generate or recalculate visit plan
    generateVisitPlan: builder.mutation<ApiResponse<VisitPlan>, GenerateVisitPlanInput>({
      query: ({ bookingId, origin, travelMode = 'CAR', transitMode = null }) => ({
        url: `/visit-plans/${bookingId}/generate`,
        method: 'POST',
        body: { origin, travelMode, transitMode },
      }),
      invalidatesTags: ['VisitPlan'],
    }),

    // 4. Google Places API (New) Autocomplete Search
    searchPlaces: builder.query<ApiResponse<{ suggestions: PlaceAutocompleteSuggestion[] }>, string>({
      query: (input) => ({
        url: '/visit-plans/places/autocomplete',
        params: { input },
      }),
    }),

    // 5. Google Places API (New) Place Details
    getPlaceDetails: builder.query<ApiResponse<{ place: PlaceDetailsResult }>, string>({
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
