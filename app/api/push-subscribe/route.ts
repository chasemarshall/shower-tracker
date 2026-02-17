import { NextRequest, NextResponse } from "next/server";

const FIREBASE_DB_URL = "https://shower-tracker-276d6-default-rtdb.firebaseio.com";

export async function POST(req: NextRequest) {
  try {
    const { subscription, user } = await req.json();

    if (!subscription || !user) {
      return NextResponse.json({ error: "Missing subscription or user" }, { status: 400 });
    }

    // Use a hash of the endpoint as the key (base64-encode it for Firebase key compatibility)
    const key = Buffer.from(subscription.endpoint).toString("base64url");

    // Store subscription in Firebase RTDB
    const res = await fetch(`${FIREBASE_DB_URL}/pushSubscriptions/${key}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription, user, updatedAt: Date.now() }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to store subscription" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
