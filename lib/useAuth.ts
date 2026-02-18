"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  User,
  AuthError,
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, googleProvider, db } from "./firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  sendPhoneCode: (phoneNumber: string) => Promise<void>;
  confirmPhoneCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

let phoneVerificationId: string | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

async function checkAndWhitelistEmail(
  email: string
): Promise<{ allowed: boolean }> {
  // Check whitelist first
  const snap = await get(ref(db, "allowedEmails"));
  const existing: string[] = [];
  if (snap.exists()) {
    const data = snap.val();
    if (Array.isArray(data)) {
      existing.push(...data);
    } else {
      existing.push(...(Object.values(data) as string[]));
    }
  }

  if (existing.includes(email)) return { allowed: true };

  // Not on whitelist — check grace period
  const graceSnap = await get(ref(db, "graceUntil"));
  if (graceSnap.exists()) {
    const graceUntil = graceSnap.val() as number;
    if (Date.now() < graceUntil) {
      // Auto-add to whitelist permanently
      existing.push(email);
      await set(ref(db, "allowedEmails"), existing);
      return { allowed: true };
    }
  }

  return { allowed: false };
}

async function checkAndWhitelistPhone(
  phoneNumber: string
): Promise<{ allowed: boolean }> {
  const snap = await get(ref(db, "allowedPhoneNumbers"));
  const existing: string[] = [];
  if (snap.exists()) {
    const data = snap.val();
    if (Array.isArray(data)) {
      existing.push(...data);
    } else {
      existing.push(...(Object.values(data) as string[]));
    }
  }

  if (existing.includes(phoneNumber)) return { allowed: true };

  const graceSnap = await get(ref(db, "graceUntil"));
  if (graceSnap.exists()) {
    const graceUntil = graceSnap.val() as number;
    if (Date.now() < graceUntil) {
      existing.push(phoneNumber);
      await set(ref(db, "allowedPhoneNumbers"), existing);
      return { allowed: true };
    }
  }

  return { allowed: false };
}

function getOrCreateRecaptchaVerifier() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, "phone-recaptcha-container", {
      size: "invisible",
    });
  }
  return recaptchaVerifier;
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
          const email = firebaseUser.email ?? "";
          const phoneNumber = firebaseUser.phoneNumber ?? "";
          const check = email
            ? checkAndWhitelistEmail(email)
            : phoneNumber
              ? checkAndWhitelistPhone(phoneNumber)
              : Promise.resolve({ allowed: false });
          const { allowed } = await check;
          if (!allowed) {
            await firebaseSignOut(auth);
            setUser(null);
            setError("Access denied. Your account is not on the approved list.");
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

  const sendPhoneCode = useCallback(async (phoneNumber: string) => {
    setError(null);
    try {
      const verifier = getOrCreateRecaptchaVerifier();
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(phoneNumber, verifier);
      phoneVerificationId = verificationId;
    } catch (err) {
      const code = (err as AuthError)?.code;
      if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Could not send code. Check the phone number and try again.");
      }
      throw err;
    }
  }, []);

  const confirmPhoneCode = useCallback(async (code: string) => {
    setError(null);
    if (!phoneVerificationId) {
      setError("Please request a verification code first.");
      throw new Error("Missing verification ID");
    }

    try {
      const credential = PhoneAuthProvider.credential(phoneVerificationId, code);
      await signInWithCredential(auth, credential);
      phoneVerificationId = null;
    } catch {
      setError("Invalid code. Please try again.");
      throw new Error("Invalid verification code");
    }
  }, []);

  return { user, loading, error, signIn, sendPhoneCode, confirmPhoneCode, signOut };
}
