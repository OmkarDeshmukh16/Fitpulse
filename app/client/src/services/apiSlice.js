import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { updateToken, logout } from '../redux/slices/authSlice'

const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/$/, '')
  if (envUrl.endsWith('/api')) return envUrl
  return `${envUrl}/api`
}

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

// Auto-refresh token on 401
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
        api,
        extraOptions
      )
      if (refreshResult.data) {
        api.dispatch(updateToken(refreshResult.data))
        result = await baseQuery(args, api, extraOptions)
      } else {
        api.dispatch(logout())
      }
    } else {
      api.dispatch(logout())
    }
  }
  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Member', 'Plan', 'Membership', 'Payment', 'Attendance', 'Settings', 'Dashboard'],
  endpoints: () => ({}),
})
