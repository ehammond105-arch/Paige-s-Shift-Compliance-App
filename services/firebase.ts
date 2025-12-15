import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBy9C0eQWZscYQo8FBGYZ_68U6RQsuN9Y4",
  authDomain: "gen-lang-client-0743504226.firebaseapp.com",
  projectId: "gen-lang-client-0743504226",
  storageBucket: "gen-lang-client-0743504226.firebasestorage.app",
  messagingSenderId: "706837108135",
  appId: "1:706837108135:web:341c271679ca3bf4f25282",
  measurementId: "G-PKHLQLEGDB"
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Analytics removed as it is causing import errors in some environments
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
// Explicitly use the gs:// bucket URL as requested
export const storage = getStorage(app, "gs://gen-lang-client-0743504226.firebasestorage.app");

export default app;