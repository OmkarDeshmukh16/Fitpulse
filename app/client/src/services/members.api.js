import { apiSlice } from './apiSlice'

export const membersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: (params) => ({ url: '/members', params }),
      providesTags: ['Member'],
    }),
    getMember: builder.query({
      query: (id) => `/members/${id}`,
      providesTags: (r, e, id) => [{ type: 'Member', id }],
    }),
    createMember: builder.mutation({
      query: (body) => ({ url: '/members', method: 'POST', body }),
      invalidatesTags: ['Member', 'Dashboard'],
    }),
    updateMember: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/members/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Member', id }, 'Member'],
    }),
    deleteMember: builder.mutation({
      query: (id) => ({ url: `/members/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Member', 'Dashboard'],
    }),
    freezeMembership: builder.mutation({
      query: (id) => ({ url: `/members/${id}/freeze`, method: 'POST' }),
      invalidatesTags: (r, e, id) => [{ type: 'Member', id }, 'Member'],
    }),
    unfreezeMembership: builder.mutation({
      query: (id) => ({ url: `/members/${id}/unfreeze`, method: 'POST' }),
      invalidatesTags: (r, e, id) => [{ type: 'Member', id }, 'Member'],
    }),
    getMemberAttendance: builder.query({
      query: ({ id, ...params }) => ({ url: `/members/${id}/attendance`, params }),
      providesTags: ['Attendance'],
    }),
    getMemberPayments: builder.query({
      query: (id) => `/members/${id}/payments`,
      providesTags: ['Payment'],
    }),
    getMemberWorkoutPlan: builder.query({
      query: (id) => `/members/${id}/workout-plan`,
      providesTags: ['WorkoutPlan'],
    }),
    upsertMemberWorkoutPlan: builder.mutation({
      query: ({ memberId, ...body }) => ({
        url: `/members/${memberId}/workout-plan`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['WorkoutPlan'],
    }),
    getMemberDietPlan: builder.query({
      query: (id) => `/members/${id}/diet-plan`,
      providesTags: ['DietPlan'],
    }),
    upsertMemberDietPlan: builder.mutation({
      query: ({ memberId, ...body }) => ({
        url: `/members/${memberId}/diet-plan`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['DietPlan'],
    }),
  }),
})

export const {
  useGetMembersQuery, useGetMemberQuery, useCreateMemberMutation,
  useUpdateMemberMutation, useDeleteMemberMutation, useFreezeMembershipMutation,
  useUnfreezeMembershipMutation, useGetMemberAttendanceQuery, useGetMemberPaymentsQuery,
  useGetMemberWorkoutPlanQuery, useUpsertMemberWorkoutPlanMutation,
  useGetMemberDietPlanQuery, useUpsertMemberDietPlanMutation,
} = membersApi

