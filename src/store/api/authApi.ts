import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  DevoteeRegisterInput,
  LoginCredentials,
  ChangePasswordInput,
  AuthSessionResponse,
  AuthenticatedUser,
} from '@shared/types/index.js';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthSessionResponse>, DevoteeRegisterInput>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    login: builder.mutation<ApiResponse<AuthSessionResponse>, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    googleLogin: builder.mutation<ApiResponse<AuthSessionResponse>, { credential: string }>({
      query: (body) => ({
        url: '/auth/google',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    getMe: builder.query<ApiResponse<{ user: AuthenticatedUser }>, void>({
      query: () => '/auth/me',
      providesTags: ['Auth', 'User'],
    }),
    logout: builder.mutation<ApiResponse<{ message?: string }>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    changePassword: builder.mutation<ApiResponse<{ message?: string }>, ChangePasswordInput>({
      query: (passwords) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwords,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
  useChangePasswordMutation,
} = authApi;

export default authApi;
