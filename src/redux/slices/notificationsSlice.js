import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  notifications: [
    {
      id: '1',
      title: '🎉 Welcome to KrishiMantra!',
      message: 'Start managing your farm with AI-powered tools.',
      time: new Date().toISOString(),
      read: false,
      type: 'info',
    },
  ],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      // Save to AsyncStorage
      AsyncStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
      AsyncStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      AsyncStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    deleteNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      AsyncStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      AsyncStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
  },
});

export const { 
  setNotifications, 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications 
} = notificationsSlice.actions;

export default notificationsSlice.reducer;