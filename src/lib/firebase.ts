// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB90rv05mHN0AxN27OHDLMSTRZbC7zBcjc",
  authDomain: "checkavac-d2e22.firebaseapp.com",
  projectId: "checkavac-d2e22",
  storageBucket: "checkavac-d2e22.firebasestorage.app",
  messagingSenderId: "211249226077",
  appId: "1:211249226077:web:8114530d0febbf955248b4"
};

// Initialize Firebase (Prevent re-initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };