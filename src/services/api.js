import axios from 'axios';
import { API_URL, ML_SERVICE_URL } from '@env';

// Use environment variables from .env file
const BACKEND_URL = API_URL;
const ML_API_URL = ML_SERVICE_URL;

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 60000,
});

export const marketAPI = {
  getPrices: () => api.get('/market/prices'),
};

export const mlAPI = {
  analyzeSoil: (data) =>
    axios.post(`${ML_API_URL}/api/soil-analysis`, data, {
      timeout: 60000,
    }),
  
  recommendCrop: (data) => 
    axios.post(`${ML_API_URL}/api/crop-recommendation`, data, {
      timeout: 60000,
    }),
  
  detectDisease: (imageData) => 
    axios.post(`${ML_API_URL}/api/disease-detection`, {
      image: imageData.uri
    }, {
      timeout: 60000,
    }),
};

export default api;
