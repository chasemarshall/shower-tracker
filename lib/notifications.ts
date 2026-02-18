function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(user: string) {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
    }

    // Store subscription on the server
    await fetch("/api/push-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON(), user }),
    });
  } catch {
    // Push subscription not supported or denied
  }
}

export async function sendPushNotification({
  title,
  body,
  excludeUser,
  targetUsers,
}: {
  title: string;
  body: string;
  excludeUser?: string;
  targetUsers?: string[];
}) {
  try {
    await fetch("/api/push-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, excludeUser, targetUsers }),
    });
  } catch {
    // Ignore send failures
  }
}
