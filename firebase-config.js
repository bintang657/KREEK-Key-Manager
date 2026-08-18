import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBiqyKpz1Jp0FGSx28kb9H7jwSjOVW-mtc",
  authDomain: "kreek-4aa08.firebaseapp.com",
  databaseURL: "https://kreek-4aa08-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "kreek-4aa08",
  storageBucket: "kreek-4aa08.firebasestorage.app",
  messagingSenderId: "617654659028",
  appId: "1:617654659028:web:1139afe57ae7f4e324d841",
  measurementId: "G-TX5TCY679N"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
