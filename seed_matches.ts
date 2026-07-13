import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDByWqvaUxxJhQ4f3x15_9DUQbg7xd7rus",
  authDomain: "calm-dimension-vlrqd.firebaseapp.com",
  projectId: "calm-dimension-vlrqd",
  storageBucket: "calm-dimension-vlrqd.firebasestorage.app",
  messagingSenderId: "646746347637",
  appId: "1:646746347637:web:c4969aeb4946aaedf8403c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-stadiumiqoperati-35b6079d-5633-4bb9-a36e-9dfc8af640fa");

const matches = [
  // Group Stage (Extracted from image)
  { teams: "MEX vs RSA", date: "2026-06-11", time: "15:00", venue: "Mexico City", status: "past" },
  { teams: "CAN vs BIH", date: "2026-06-11", time: "15:00", venue: "Toronto", status: "past" },
  { teams: "USA vs PAR", date: "2026-06-12", time: "15:00", venue: "Los Angeles", status: "past" },
  { teams: "KOR vs CZE", date: "2026-06-12", time: "22:00", venue: "Guadalajara", status: "past" },
  { teams: "AUS vs TUR", date: "2026-06-14", time: "09:00", venue: "Vancouver", status: "past" },
  { teams: "ESP vs CPV", date: "2026-06-14", time: "12:00", venue: "Atlanta", status: "past" },
  
  // Mid-July Matches (Semi-Finals)
  { teams: "Semi-Final 1 (W97 vs W98)", date: "2026-07-14", time: "20:00", venue: "Dallas", status: "upcoming" },
  { teams: "Semi-Final 2 (W99 vs W100)", date: "2026-07-15", time: "20:00", venue: "Atlanta", status: "upcoming" },
  
  // Late July
  { teams: "Bronze Final", date: "2026-07-18", time: "17:00", venue: "Miami", status: "upcoming" },
  { teams: "FIFA World Cup Final", date: "2026-07-19", time: "15:00", venue: "New York New Jersey", status: "upcoming" }
];

async function seedMatches() {
  console.log("Starting match seeding...");
  const matchesRef = collection(db, "matches");
  
  // Clear existing
  const snapshot = await getDocs(matchesRef);
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  
  // Add new
  for (const match of matches) {
    const timestamp = new Date(`${match.date}T${match.time}:00Z`).getTime();
    await addDoc(matchesRef, {
      ...match,
      timestamp
    });
  }
  console.log("Seeding complete!");
}

seedMatches();
