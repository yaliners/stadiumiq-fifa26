import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDByWqvaUxxJhQ4f3x15_9DUQbg7xd7rus",
  authDomain: "calm-dimension-vlrqd.firebaseapp.com",
  projectId: "calm-dimension-vlrqd",
  storageBucket: "calm-dimension-vlrqd.firebasestorage.app",
  messagingSenderId: "646746347637",
  appId: "1:646746347637:web:c4969aeb4946aaedf8403c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-stadiumiqoperati-35b6079d-5633-4bb9-a36e-9dfc8af640fa");
