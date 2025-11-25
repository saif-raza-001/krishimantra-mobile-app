import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  crops: [],
};

const cropsSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    setCrops: (state, action) => {
      state.crops = action.payload;
    },
    addCrop: (state, action) => {
      state.crops.unshift(action.payload);
      AsyncStorage.setItem('crops', JSON.stringify(state.crops));
    },
    updateCrop: (state, action) => {
      const index = state.crops.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.crops[index] = { ...state.crops[index], ...action.payload };
      }
      AsyncStorage.setItem('crops', JSON.stringify(state.crops));
    },
    deleteCrop: (state, action) => {
      state.crops = state.crops.filter(c => c.id !== action.payload);
      AsyncStorage.setItem('crops', JSON.stringify(state.crops));
    },
  },
});

export const { setCrops, addCrop, updateCrop, deleteCrop } = cropsSlice.actions;
export default cropsSlice.reducer;
