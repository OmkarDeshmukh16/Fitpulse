import { apiSlice } from './apiSlice';

export const superadminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDemoRequests: builder.query({
      query: (params) => ({
        url: '/demo-requests',
        params,
      }),
      providesTags: ['DemoRequests'],
    }),

    sendPaymentLink: builder.mutation({
      query: ({ id, paymentLink, customMessage }) => ({
        url: `/demo-requests/${id}/send-payment-link`,
        method: 'POST',
        body: { paymentLink, customMessage },
      }),
      invalidatesTags: ['DemoRequests'],
    }),

    approveGym: builder.mutation({
      query: ({ id, password }) => ({
        url: `/demo-requests/${id}/approve`,
        method: 'POST',
        body: { password },
      }),
      invalidatesTags: ['DemoRequests'],
    }),

    updateDemoRequest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/demo-requests/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['DemoRequests'],
    }),

    seedSuperAdmin: builder.mutation({
      query: () => ({
        url: '/demo-requests/seed-superadmin',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetDemoRequestsQuery,
  useSendPaymentLinkMutation,
  useApproveGymMutation,
  useUpdateDemoRequestMutation,
  useSeedSuperAdminMutation,
} = superadminApi;
