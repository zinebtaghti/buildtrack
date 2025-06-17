import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration - direct values instead of environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCRNLraVKfhFyNGpiy9cx1GB8_BsKy0evw",
  authDomain: "buildtrack-1bf5c.firebaseapp.com",
  projectId: "buildtrack-1bf5c",
  storageBucket: "buildtrack-1bf5c.firebasestorage.app",
  messagingSenderId: "1064715870159",
  appId: "1:1064715870159:android:751c5a8f0b07381454fcba",
  databaseURL: "https://buildtrack-1bf5c.firebaseio.com"
};

console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: '***' // Hide API key in logs
});

let app;
try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized');
} catch (error) {
  console.error('Error initializing Firebase:', (error as Error).message);
  throw error;
}

// Initialize Auth
export const auth = getAuth(app);
console.log('Firebase Auth initialized');

// Initialize Firestore
export const db = getFirestore(app);
console.log('Firestore initialized');

console.log('Firebase services initialized successfully');

// Export the Firebase app instance
export default app;