import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAppInitialized: false,
  isSidebarOpen: false,
  activeModal: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setAppInitialized: (state, action) => {
      state.isAppInitialized = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

export const {
  setAppInitialized,
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
