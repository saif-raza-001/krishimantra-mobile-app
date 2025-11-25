import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadUserFromStorage } from './src/redux/slices/authSlice';
import { ML_SERVICE_URL } from '@env';
import './src/i18n'; // Initialize i18n

export default function App() {
  useEffect(() => {
    // ✅ Load user from AsyncStorage on app start
    const initializeApp = async () => {
      try {
        const [userStr, token, isAuthenticated] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('isAuthenticated'),
        ]);

        if (userStr && token && isAuthenticated === 'true') {
          const user = JSON.parse(userStr);
          console.log('✅ User loaded from storage:', user.email);
          store.dispatch(loadUserFromStorage({ user, token }));
        } else {
          console.log('ℹ️ No saved user found');
          store.dispatch(loadUserFromStorage(null));
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
        store.dispatch(loadUserFromStorage(null));
      }
    };

    initializeApp();

    // 🚀 Wake up ML Service in background (prevents cold start delay)
    const wakeUpMLService = async () => {
      try {
        console.log('🔄 Waking up ML service...');
        const response = await fetch(`${ML_SERVICE_URL}/`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
        if (response.ok) {
          console.log('✅ ML service is awake and ready!');
        } else {
          console.log('⚠️ ML service responded with status:', response.status);
        }
      } catch (error) {
        console.log('⏳ ML service is waking up... (this is normal on first load)');
      }
    };

    // Wake up ML service silently in background
    wakeUpMLService();

    // Request notification permissions
    const initNotifications = async () => {
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        console.log('✅ Notification permissions granted');
      }
    };

    initNotifications();

    // Clean up listeners on unmount
    return () => {
      notificationService.removeListeners();
    };
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
