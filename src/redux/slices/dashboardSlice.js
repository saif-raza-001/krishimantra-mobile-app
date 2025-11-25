import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  totalCrops: 0,
  activeCrops: 0,
  healthyCrops: 0,
  needsAttention: 0,
  pendingTasks: 0,
  completedTasks: 0,
  recentActivities: [],
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateStats: (state, action) => {
      return { ...state, ...action.payload };
    },
    incrementTotalCrops: (state) => {
      state.totalCrops += 1;
      state.activeCrops += 1;
    },
    decrementTotalCrops: (state) => {
      state.totalCrops -= 1;
      state.activeCrops -= 1;
    },
    updateCropHealth: (state, action) => {
      const { wasHealthy, isHealthy } = action.payload;
      if (wasHealthy && !isHealthy) {
        state.healthyCrops -= 1;
        state.needsAttention += 1;
      } else if (!wasHealthy && isHealthy) {
        state.healthyCrops += 1;
        state.needsAttention -= 1;
      }
    },
    incrementPendingTasks: (state) => {
      state.pendingTasks += 1;
    },
    decrementPendingTasks: (state) => {
      state.pendingTasks -= 1;
    },
    incrementCompletedTasks: (state) => {
      state.completedTasks += 1;
    },
    decrementCompletedTasks: (state) => {
      state.completedTasks -= 1;
    },
    addRecentActivity: (state, action) => {
      state.recentActivities.unshift(action.payload);
      if (state.recentActivities.length > 5) {
        state.recentActivities.pop();
      }
    },
    removeRecentActivity: (state, action) => {
      state.recentActivities = state.recentActivities.filter(
        activity => activity.id !== action.payload
      );
    },
  },
});

export const {
  updateStats,
  incrementTotalCrops,
  decrementTotalCrops,
  updateCropHealth,
  incrementPendingTasks,
  decrementPendingTasks,
  incrementCompletedTasks,
  decrementCompletedTasks,
  addRecentActivity,
  removeRecentActivity,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
