// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence 
} from "firebase/auth";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjvWHjRItnnbfwg2dnyTjHijahotlhUoU",
  authDomain: "rapidpath-bff9c.firebaseapp.com",
  projectId: "rapidpath-bff9c",
  storageBucket: "rapidpath-bff9c.firebasestorage.app",
  messagingSenderId: "35410970555",
  appId: "1:35410970555:web:4fa3c410b1b8d350a8a69e",
  measurementId: "G-N5ET3Y5BZT"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Analytics if supported in browser environment
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics fallback
  });
}
