import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // Changed to true for initial load
  language: 'en',
  isFirstLogin: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      
      // ✅ FIX: Save to AsyncStorage
      AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      AsyncStorage.setItem('token', action.payload.token);
      AsyncStorage.setItem('isAuthenticated', 'true');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // ✅ Save updated user to AsyncStorage
      AsyncStorage.setItem('user', JSON.stringify(state.user));
    },
    // ✅ NEW: Load user from AsyncStorage on app start
    loadUserFromStorage: (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
      state.loading = false;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      state.isFirstLogin = false;
      AsyncStorage.setItem('language', action.payload);
      AsyncStorage.setItem('isFirstLogin', 'false');
    },
    setIsFirstLogin: (state, action) => {
      state.isFirstLogin = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isFirstLogin = true;
      state.loading = false;
      AsyncStorage.removeItem('user');
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('isAuthenticated');
      AsyncStorage.removeItem('language');
      AsyncStorage.removeItem('isFirstLogin');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { 
  setUser, 
  updateUser, 
  loadUserFromStorage, 
  setLanguage, 
  setIsFirstLogin, 
  logout, 
  setLoading 
} = authSlice.actions;

export default authSlice.reducer;
