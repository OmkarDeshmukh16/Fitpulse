import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    theme: 'dark',
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen
    },
    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload
    },
    closeMobileSidebar: (state) => {
      state.mobileSidebarOpen = false
    },
  },
})

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  closeMobileSidebar,
} = uiSlice.actions

export default uiSlice.reducer
