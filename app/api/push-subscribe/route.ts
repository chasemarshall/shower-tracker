import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminPath } from "@/lib/firebaseAdmin";
import { requireAuthorizedRequest } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuthorizedRequest(req);
    if (!authResult.ok) {
      return authResult.response;
    }

    const { subscription, user } = await req.json();

    if (!subscription || typeof subscription.endpoint !== "string" || !user) {
      return NextResponse.json({ error: "Missing subscription or user" }, { status: 400 });
    }

    // Use a hash of the endpoint as the key (base64url-encode it for Firebase key compatibility)
    const key = Buffer.from(subscription.endpoint).toString("base64url");

    // Store subscription in Firebase RTDB via Admin SDK
    await adminDb.ref(adminPath(`pushSubscriptions/${key}`)).set({
      subscription,
      user,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("push-subscribe error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
