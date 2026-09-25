import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isInitializing: true, // true until /api/auth/me check completes on startup
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      state.role = user?.role || null;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, clearCredentials, setInitializing, updateUser } = authSlice.actions;

export default authSlice.reducer;
