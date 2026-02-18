import { DecodedIdToken, getAuth } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminPath } from "@/lib/firebaseAdmin";

type AuthResult =
  | { ok: true; token: DecodedIdToken }
  | { ok: false; response: NextResponse };

function unauthorized(error: string): AuthResult {
  return {
    ok: false,
    response: NextResponse.json({ error }, { status: 401 }),
  };
}

function forbidden(error: string): AuthResult {
  return {
    ok: false,
    response: NextResponse.json({ error }, { status: 403 }),
  };
}

function normalizeAllowedEmails(value: unknown): Set<string> {
  const items: string[] = [];

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === "string") items.push(entry);
    }
  } else if (value && typeof value === "object") {
    for (const entry of Object.values(value)) {
      if (typeof entry === "string") items.push(entry);
    }
  }

  return new Set(
    items
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function isAllowlistedEmail(email: string): Promise<boolean> {
  try {
    const allowedEmailsSnap = await adminDb.ref(adminPath("allowedEmails")).once("value");
    if (!allowedEmailsSnap.exists()) {
      return false;
    }

    const allowlisted = normalizeAllowedEmails(allowedEmailsSnap.val());
    return allowlisted.has(email);
  } catch {
    // Fail closed on authorization data errors.
    return false;
  }
}

export async function requireAuthorizedRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized("Missing bearer token");
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return unauthorized("Missing bearer token");
  }

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await getAuth().verifyIdToken(token);
  } catch {
    return unauthorized("Invalid bearer token");
  }

  const email = decodedToken.email?.trim().toLowerCase();
  if (!email) {
    return forbidden("Authenticated user is missing an email");
  }

  const allowlisted = await isAllowlistedEmail(email);
  if (!allowlisted) {
    return forbidden("User is not authorized");
  }

  return { ok: true, token: decodedToken };
}
