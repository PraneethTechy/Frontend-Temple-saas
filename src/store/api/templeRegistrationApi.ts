import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  TempleRegistration,
} from '@shared/types/index.js';

export type TempleRegistrationInput = Partial<
  Omit<TempleRegistration, '_id' | 'createdAt' | 'updatedAt' | 'status'>
>;

export const templeRegistrationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitTempleRegistration: builder.mutation<
      ApiResponse<TempleRegistration>,
      TempleRegistrationInput | Record<string, unknown>
    >({
      query: (formData) => ({
        url: '/temple-registrations',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['TempleRegistration', 'AdminDashboard'],
    }),
  }),
});

export const { useSubmitTempleRegistrationMutation } = templeRegistrationApi;
export default templeRegistrationApi;
