import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDByWqvaUxxJhQ4f3x15_9DUQbg7xd7rus",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "calm-dimension-vlrqd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "calm-dimension-vlrqd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "calm-dimension-vlrqd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "646746347637",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:646746347637:web:c4969aeb4946aaedf8403c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, import.meta.env.VITE_FIRESTORE_DATABASE_ID || "ai-studio-stadiumiqoperati-35b6079d-5633-4bb9-a36e-9dfc8af640fa");
