import { initializeApp } from "firebase/app";
import { getDatabase, ref as firebaseRef, DatabaseReference } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/** Prefix for Firebase paths — "preview/" on non-production Vercel deployments, "" otherwise. */
export const DB_PREFIX =
  process.env.NEXT_PUBLIC_VERCEL_ENV && process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"
    ? "preview/"
    : "";

/** Shorthand for ref(db, prefixedPath). Use for all app data (status, slots, log). */
export function dbRef(path: string): DatabaseReference {
  return firebaseRef(db, `${DB_PREFIX}${path}`);
}
