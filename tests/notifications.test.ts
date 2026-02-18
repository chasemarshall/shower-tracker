import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendPushNotification } from "@/lib/notifications";

describe("sendPushNotification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetch with correct payload", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

    await sendPushNotification({
      title: "Test",
      body: "Test body",
      excludeUser: "Chase",
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/push-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test",
        body: "Test body",
        excludeUser: "Chase",
      }),
    });
  });

  it("includes targetUsers when provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

    await sendPushNotification({
      title: "Slot",
      body: "Your slot",
      targetUsers: ["Dad", "Mom"],
    });

    const callBody = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(callBody.targetUsers).toEqual(["Dad", "Mom"]);
  });

  it("does not throw on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    await expect(
      sendPushNotification({ title: "Fail", body: "Should not throw" })
    ).resolves.toBeUndefined();
  });
});
