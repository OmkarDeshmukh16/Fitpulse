import { apiSlice } from './apiSlice'

export const aiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveConversation: builder.query({
      query: () => '/ai/conversations/active',
      providesTags: ['AIConversation'],
    }),
    startAIConversation: builder.mutation({
      // { goal, profileSnapshot: { age, weightKg, heightCm, gender, activityLevel }, message }
      query: (body) => ({ url: '/ai/conversations', method: 'POST', body }),
      invalidatesTags: ['AIConversation'],
    }),
    sendAIMessage: builder.mutation({
      query: ({ id, message }) => ({ url: `/ai/conversations/${id}/messages`, method: 'POST', body: { message } }),
      invalidatesTags: ['AIConversation'],
    }),
    getAIHistory: builder.query({
      query: () => '/ai/conversations',
      providesTags: ['AIConversation'],
    }),
  }),
})

export const {
  useGetActiveConversationQuery,
  useStartAIConversationMutation,
  useSendAIMessageMutation,
  useGetAIHistoryQuery,
} = aiApi
