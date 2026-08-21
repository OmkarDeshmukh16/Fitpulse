import { apiSlice } from './apiSlice'

export const portalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
    getPortalDashboard: builder.query({
      query: () => '/portal/dashboard',
      providesTags: ['PortalDashboard'],
    }),

    // Membership
    getPortalMembership: builder.query({
      query: () => '/portal/membership',
      providesTags: ['Membership'],
    }),

    // Attendance
    getPortalAttendance: builder.query({
      query: (params) => ({ url: '/portal/attendance', params }),
      providesTags: ['Attendance'],
    }),

    // Workout Plan
    getPortalWorkoutPlan: builder.query({
      query: () => '/portal/workout-plan',
      providesTags: ['WorkoutPlan'],
    }),

    // Diet Plan
    getPortalDietPlan: builder.query({
      query: () => '/portal/diet-plan',
      providesTags: ['DietPlan'],
    }),

    // Progress
    getPortalProgress: builder.query({
      query: () => '/portal/progress',
      providesTags: ['Progress'],
    }),
    addPortalProgress: builder.mutation({
      query: (body) => ({ url: '/portal/progress', method: 'POST', body }),
      invalidatesTags: ['Progress'],
    }),

    // PT Sessions
    getPortalPTSessions: builder.query({
      query: (params) => ({ url: '/portal/pt-sessions', params }),
      providesTags: ['PTSession'],
    }),
    bookPortalPTSession: builder.mutation({
      query: (body) => ({ url: '/portal/pt-sessions', method: 'POST', body }),
      invalidatesTags: ['PTSession', 'PortalDashboard'],
    }),
    cancelPortalPTSession: builder.mutation({
      query: ({ id, reason }) => ({ url: `/portal/pt-sessions/${id}/cancel`, method: 'PUT', body: { reason } }),
      invalidatesTags: ['PTSession', 'PortalDashboard'],
    }),

    // Payments
    getPortalPayments: builder.query({
      query: (params) => ({ url: '/portal/payments', params }),
      providesTags: ['Payment'],
    }),

    // Razorpay Renewal
    createRenewalOrder: builder.mutation({
      query: (body) => ({ url: '/portal/renew/create-order', method: 'POST', body }),
    }),
    verifyRenewalPayment: builder.mutation({
      query: (body) => ({ url: '/portal/renew/verify', method: 'POST', body }),
      invalidatesTags: ['Membership', 'PortalDashboard', 'Payment'],
    }),
  }),
})

export const {
  useGetPortalDashboardQuery,
  useGetPortalMembershipQuery,
  useGetPortalAttendanceQuery,
  useGetPortalWorkoutPlanQuery,
  useGetPortalDietPlanQuery,
  useGetPortalProgressQuery,
  useAddPortalProgressMutation,
  useGetPortalPTSessionsQuery,
  useBookPortalPTSessionMutation,
  useCancelPortalPTSessionMutation,
  useGetPortalPaymentsQuery,
  useCreateRenewalOrderMutation,
  useVerifyRenewalPaymentMutation,
} = portalApi
