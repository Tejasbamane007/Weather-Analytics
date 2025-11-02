console.log('fconfig.jsx: Firebase initialized');
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD1zpbs4P3uYyg69am7vfm0KhcWAKK_Q-E",
  authDomain: "weather-report-db040.firebaseapp.com",
  projectId: "weather-report-db040",
  storageBucket: "weather-report-db040.firebasestorage.app",
  messagingSenderId: "689816754699",
  appId: "1:689816754699:web:b223381d70795b47f6050e",
  measurementId: "G-MJBM4YNXJE",
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('fconfig.jsx: Firebase app initialized successfully');
  console.log('fconfig.jsx: App object:', app);
  getAnalytics(app);
  console.log('fconfig.jsx: Firebase Analytics initialized');
} catch (error) {
  console.error('fconfig.jsx: Error initializing Firebase:', error);
  console.error('fconfig.jsx: Firebase config used:', firebaseConfig);
}

if (!app) {
  console.error('fconfig.jsx: Firebase app is not initialized, cannot proceed with auth');
} else {
  console.log('fconfig.jsx: Proceeding with auth initialization');
}

const auth = getAuth(app);
console.log('fconfig.jsx: Auth object created:', auth);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Firebase sign-in successful:", result.user.displayName);
    return result.user;
  } catch (err) {
    console.error("Error during Google sign-in:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);

    // Handle specific Firebase Auth errors
    if (err.code === 'auth/popup-blocked') {
      console.warn("Popup was blocked by browser. Consider using redirect authentication.");
      // Could implement redirect fallback here
    } else if (err.code === 'auth/cancelled-popup-request') {
      console.warn("Popup was cancelled by user.");
    }

    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (err) {
    console.error("Error during logout:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
  }
};
