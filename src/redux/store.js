import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import activitiesReducer from './slices/activitiesSlice';
import notificationsReducer from './slices/notificationsSlice';
import cropsReducer from './slices/cropsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    activities: activitiesReducer,
    notifications: notificationsReducer,
    crops: cropsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
