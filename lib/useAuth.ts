"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, googleProvider, db } from "./firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

async function isEmailAllowed(email: string): Promise<boolean> {
  // Check grace period first
  const graceSnap = await get(ref(db, "graceUntil"));
  if (graceSnap.exists()) {
    const graceUntil = graceSnap.val() as number;
    if (Date.now() < graceUntil) return true;
  }

  // Check whitelist
  const snap = await get(ref(db, "allowedEmails"));
  if (!snap.exists()) return false;
  const data = snap.val();
  if (Array.isArray(data)) {
    return data.includes(email);
  }
  // Object format: { 0: "email@...", 1: "email@..." }
  return Object.values(data).includes(email);
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Verify email is whitelisted
        try {
          const allowed = await isEmailAllowed(firebaseUser.email ?? "");
          if (!allowed) {
            await firebaseSignOut(auth);
            setUser(null);
            setError("Access denied. Your email is not on the approved list.");
          } else {
            setUser(firebaseUser);
            setError(null);
          }
        } catch {
          // If we can't check (e.g. rules block unauthenticated read),
          // allow the user through — rules will protect the data anyway
          setUser(firebaseUser);
          setError(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      // Fallback to redirect for mobile browsers that block popups
      const code = (err as { code?: string })?.code;
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch {
          setError("Sign-in failed. Please try again.");
        }
      } else if (code !== "auth/cancelled-popup-request") {
        setError("Sign-in failed. Please try again.");
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await firebaseSignOut(auth);
  }, []);

  return { user, loading, error, signIn, signOut };
}
