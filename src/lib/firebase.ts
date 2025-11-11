import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Note: These are client-safe keys but should be moved to environment variables in production
const firebaseConfig = {
  apiKey: "AIzaSyBpw2rLqULAVod9h0eHkeGARtoHls2kdmc",
  authDomain: "whatsnew-b59ca.firebaseapp.com",
  projectId: "whatsnew-b59ca",
  storageBucket: "whatsnew-b59ca.firebasestorage.app",
  messagingSenderId: "85787970525",
  appId: "1:85787970525:web:05caff269e99f0db0f4434",
  measurementId: "G-8FF8E1CNK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
