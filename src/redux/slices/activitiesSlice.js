import { createSlice } from '@reduxjs/toolkit';

const activitiesSlice = createSlice({
  name: 'activities',
  initialState: {
    activities: [],
  },
  reducers: {
    addActivity: (state, action) => {
      state.activities.unshift(action.payload);
    },
    updateActivity: (state, action) => {
      const index = state.activities.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.activities[index] = { ...state.activities[index], ...action.payload };
      }
    },
    deleteActivity: (state, action) => {
      state.activities = state.activities.filter(a => a.id !== action.payload);
    },
    toggleComplete: (state, action) => {
      const activity = state.activities.find(a => a.id === action.payload);
      if (activity) {
        activity.completed = !activity.completed;
      }
    },
  },
});

export const { addActivity, updateActivity, deleteActivity, toggleComplete } = activitiesSlice.actions;
export default activitiesSlice.reducer;
