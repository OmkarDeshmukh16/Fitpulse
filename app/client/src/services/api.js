import { apiSlice } from './apiSlice'

export const plansApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query({ query: () => '/plans', providesTags: ['Plan'] }),
    getActivePlans: builder.query({ query: () => '/plans/active', providesTags: ['Plan'] }),
    getPlan: builder.query({ query: (id) => `/plans/${id}`, providesTags: (r, e, id) => [{ type: 'Plan', id }] }),
    createPlan: builder.mutation({ query: (body) => ({ url: '/plans', method: 'POST', body }), invalidatesTags: ['Plan'] }),
    updatePlan: builder.mutation({ query: ({ id, ...body }) => ({ url: `/plans/${id}`, method: 'PUT', body }), invalidatesTags: ['Plan'] }),
    deletePlan: builder.mutation({ query: (id) => ({ url: `/plans/${id}`, method: 'DELETE' }), invalidatesTags: ['Plan'] }),
    assignPlan: builder.mutation({ query: (body) => ({ url: '/plans/assign', method: 'POST', body }), invalidatesTags: ['Plan', 'Member', 'Membership'] }),
  }),
})

export const { useGetPlansQuery, useGetActivePlansQuery, useGetPlanQuery, useCreatePlanMutation, useUpdatePlanMutation, useDeletePlanMutation, useAssignPlanMutation } = plansApi

// --- Attendance ---
export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkIn: builder.mutation({ query: (body) => ({ url: '/attendance/checkin', method: 'POST', body }), invalidatesTags: ['Attendance', 'Dashboard'] }),
    checkOut: builder.mutation({ query: (body) => ({ url: '/attendance/checkout', method: 'POST', body }), invalidatesTags: ['Attendance'] }),
    checkInQR: builder.mutation({ query: (body) => ({ url: '/attendance/checkin-qr', method: 'POST', body }), invalidatesTags: ['Attendance', 'Dashboard'] }),
    getTodayAttendance: builder.query({ query: () => '/attendance/today', providesTags: ['Attendance'] }),
    getAttendance: builder.query({ query: (params) => ({ url: '/attendance', params }), providesTags: ['Attendance'] }),
  }),
})

export const { useCheckInMutation, useCheckOutMutation, useCheckInQRMutation, useGetTodayAttendanceQuery, useGetAttendanceQuery } = attendanceApi

// --- Payments ---
export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query({ query: (params) => ({ url: '/payments', params }), providesTags: ['Payment'] }),
    getPayment: builder.query({ query: (id) => `/payments/${id}`, providesTags: (r, e, id) => [{ type: 'Payment', id }] }),
    createPayment: builder.mutation({ query: (body) => ({ url: '/payments', method: 'POST', body }), invalidatesTags: ['Payment', 'Dashboard', 'Member'] }),
    updatePayment: builder.mutation({ query: ({ id, ...body }) => ({ url: `/payments/${id}`, method: 'PUT', body }), invalidatesTags: ['Payment'] }),
    refundPayment: builder.mutation({ query: ({ id, ...body }) => ({ url: `/payments/${id}/refund`, method: 'POST', body }), invalidatesTags: ['Payment'] }),
  }),
})

export const { useGetPaymentsQuery, useGetPaymentQuery, useCreatePaymentMutation, useUpdatePaymentMutation, useRefundPaymentMutation } = paymentsApi

// --- Dashboard ---
export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({ query: () => '/dashboard/stats', providesTags: ['Dashboard'] }),
    getRevenueChart: builder.query({ query: (params) => ({ url: '/dashboard/revenue-chart', params }), providesTags: ['Dashboard'] }),
    getAttendanceChart: builder.query({ query: (params) => ({ url: '/dashboard/attendance-chart', params }), providesTags: ['Dashboard'] }),
    getRecentActivity: builder.query({ query: () => '/dashboard/recent-activity', providesTags: ['Dashboard'] }),
  }),
})

export const { useGetDashboardStatsQuery, useGetRevenueChartQuery, useGetAttendanceChartQuery, useGetRecentActivityQuery } = dashboardApi

// --- Settings ---
export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({ query: () => '/settings', providesTags: ['Settings'] }),
    updateSettings: builder.mutation({ query: (body) => ({ url: '/settings', method: 'PUT', body }), invalidatesTags: ['Settings'] }),
    getStaff: builder.query({ query: () => '/settings/staff', providesTags: ['Settings'] }),
    addStaff: builder.mutation({ query: (body) => ({ url: '/settings/staff', method: 'POST', body }), invalidatesTags: ['Settings'] }),
    updateStaff: builder.mutation({ query: ({ id, ...body }) => ({ url: `/settings/staff/${id}`, method: 'PUT', body }), invalidatesTags: ['Settings'] }),
  }),
})

export const { useGetSettingsQuery, useUpdateSettingsMutation, useGetStaffQuery, useAddStaffMutation, useUpdateStaffMutation } = settingsApi
