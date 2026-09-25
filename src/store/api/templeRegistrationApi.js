import baseApi from './baseApi.js';

export const templeRegistrationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitTempleRegistration: builder.mutation({
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
