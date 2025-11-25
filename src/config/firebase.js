import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAcOEHj41ZS7E7Jo_U9N-pVCefENW3pSG4",
  authDomain: "krishimantra-5e640.firebaseapp.com",
  projectId: "krishimantra-5e640",
  storageBucket: "krishimantra-5e640.firebasestorage.app",
  messagingSenderId: "353922328130",
  appId: "1:353922328130:web:a9cb069e0223ac2d826fdb",
  measurementId: "G-N7K521RQL3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Admin credentials
export const ADMIN_EMAIL = 'admin@krishimantra.com';
export const ADMIN_PASSWORD = 'SAIFraza786@#$';

export { auth, db };
export default app;