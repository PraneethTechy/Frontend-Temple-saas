import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi.js';
import uiReducer from './slices/uiSlice.js';
import authReducer from './slices/authSlice.js';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
