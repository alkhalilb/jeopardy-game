import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxl0BS5Oodd2bcmvQsOR0uRy7d0IeBQGA",
  authDomain: "jeopardy-e94c5.firebaseapp.com",
  projectId: "jeopardy-e94c5",
  storageBucket: "jeopardy-e94c5.firebasestorage.app",
  messagingSenderId: "232175832669",
  appId: "1:232175832669:web:12b57cdae8259b636587b4",
  measurementId: "G-EEMC486XT0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
