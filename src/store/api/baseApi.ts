import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const TAG_TYPES = [
  'Auth',
  'User',
  'Temple',
  'Authority',
  'TempleRegistration',
  'Booking',
  'Payment',
  'Service',
  'Review',
  'AdminDashboard',
  'AuthorityDashboard',
  'AuthorityTemple',
  'AuthorityService',
  'AuthorityTimeSlot',
  'AuthorityBooking',
  'AuthorityNotification',
  'Notification',
  'Category',
  'CategorySuggestion',
  'AuditLog',
  'Recommendation',
  'Announcement',
  'VisitPlan',
  'SavedTemple',
  'EligibleBookings',
] as const;

export type TagType = (typeof TAG_TYPES)[number];

interface AuthStateGetter {
  auth?: {
    token?: string | null;
  };
}

/**
 * RTK Query Base API
 * Centralized API service with token preparation and cache tag architecture.
 * Endpoints will be injected per domain in subsequent modules.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include', // Send and receive HTTP-only cookies
    prepareHeaders: (headers, { getState, endpoint }) => {
      // Rely on HTTP-only cookie by default; attach in-memory state token if provided
      const state = getState() as AuthStateGetter | undefined;
      const token = state?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      // Do not force application/json for multipart file uploads so browser can set boundary
      if (endpoint === 'uploadGalleryImage' || endpoint === 'submitReview') {
        headers.delete('Content-Type');
      } else if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});

export default baseApi;
