
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
 
const firebaseConfig = {
  apiKey: "AIzaSyD621af8G4CYuP4BXoAduiUaaz1i64H6jM",
  authDomain: "habittracker-62670.firebaseapp.com",
  projectId: "habittracker-62670",
  storageBucket: "habittracker-62670.firebasestorage.app",
  messagingSenderId: "593760723882",
  appId: "1:593760723882:web:a1dffff46968a98b3781d3",
  measurementId: "G-VY1NY6098T"
};

 
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);