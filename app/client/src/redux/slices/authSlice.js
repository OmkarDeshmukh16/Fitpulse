import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  gymSettings: JSON.parse(localStorage.getItem('gymSettings')) || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken, gymSettings } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.gymSettings = gymSettings
      state.isAuthenticated = true
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      if (gymSettings) localStorage.setItem('gymSettings', JSON.stringify(gymSettings))
    },
    updateToken: (state, action) => {
      state.accessToken = action.payload.accessToken
      localStorage.setItem('accessToken', action.payload.accessToken)
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      }
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.gymSettings = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('gymSettings')
    },
    updateGymSettings: (state, action) => {
      state.gymSettings = action.payload
      localStorage.setItem('gymSettings', JSON.stringify(action.payload))
    },
  },
})

export const { setCredentials, updateToken, logout, updateGymSettings } = authSlice.actions
export default authSlice.reducer
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectGymSettings = (state) => state.auth.gymSettings
