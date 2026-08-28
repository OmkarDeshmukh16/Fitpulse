import { apiSlice } from './apiSlice'

export const templatesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Workout Templates
    getWorkoutTemplates: builder.query({
      query: () => '/fitness-templates/workout',
      providesTags: ['WorkoutPlan'],
    }),
    createWorkoutTemplate: builder.mutation({
      query: (body) => ({
        url: '/fitness-templates/workout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WorkoutPlan'],
    }),
    updateWorkoutTemplate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/fitness-templates/workout/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['WorkoutPlan'],
    }),
    deleteWorkoutTemplate: builder.mutation({
      query: (id) => ({
        url: `/fitness-templates/workout/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WorkoutPlan'],
    }),
    selectWorkoutTemplate: builder.mutation({
      query: (id) => ({
        url: `/fitness-templates/workout/${id}/select`,
        method: 'POST',
      }),
      invalidatesTags: ['WorkoutPlan'],
    }),

    // Diet Templates
    getDietTemplates: builder.query({
      query: () => '/fitness-templates/diet',
      providesTags: ['DietPlan'],
    }),
    createDietTemplate: builder.mutation({
      query: (body) => ({
        url: '/fitness-templates/diet',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DietPlan'],
    }),
    updateDietTemplate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/fitness-templates/diet/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['DietPlan'],
    }),
    deleteDietTemplate: builder.mutation({
      query: (id) => ({
        url: `/fitness-templates/diet/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DietPlan'],
    }),
    selectDietTemplate: builder.mutation({
      query: (id) => ({
        url: `/fitness-templates/diet/${id}/select`,
        method: 'POST',
      }),
      invalidatesTags: ['DietPlan'],
    }),
  }),
})

export const {
  useGetWorkoutTemplatesQuery,
  useCreateWorkoutTemplateMutation,
  useUpdateWorkoutTemplateMutation,
  useDeleteWorkoutTemplateMutation,
  useSelectWorkoutTemplateMutation,
  useGetDietTemplatesQuery,
  useCreateDietTemplateMutation,
  useUpdateDietTemplateMutation,
  useDeleteDietTemplateMutation,
  useSelectDietTemplateMutation,
} = templatesApi
