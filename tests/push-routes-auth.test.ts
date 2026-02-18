import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => {
  const verifyIdToken = vi.fn();
  const once = vi.fn();
  const set = vi.fn();
  const remove = vi.fn();
  const ref = vi.fn((path: string) => ({
    once: (event: string) => once(path, event),
    set: (value: unknown) => set(path, value),
    remove: () => remove(path),
  }));

  const setVapidDetails = vi.fn();
  const sendNotification = vi.fn();

  return {
    verifyIdToken,
    once,
    set,
    remove,
    ref,
    setVapidDetails,
    sendNotification,
  };
});

vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    verifyIdToken: mocks.verifyIdToken,
  }),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  adminDb: {
    ref: mocks.ref,
  },
  adminPath: (path: string) => path,
}));

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: mocks.setVapidDetails,
    sendNotification: mocks.sendNotification,
  },
}));

import { POST as pushSubscribePost } from "@/app/api/push-subscribe/route";
import { POST as pushNotifyPost } from "@/app/api/push-notify/route";
import { resetAllowedEmailsCache } from "@/lib/apiAuth";

function createSnapshot(value: unknown) {
  return {
    exists: () => value !== null && value !== undefined,
    val: () => value,
  };
}

function buildRequest(url: string, body: unknown, token?: string): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("push route auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllowedEmailsCache();
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "test-public");
    vi.stubEnv("VAPID_PRIVATE_KEY", "test-private");

    mocks.verifyIdToken.mockResolvedValue({ email: "allowed@example.com" });
    mocks.once.mockImplementation(async (path: string) => {
      if (path === "allowedEmails") {
        return createSnapshot(["allowed@example.com"]);
      }

      if (path === "pushSubscriptions") {
        return createSnapshot(null);
      }

      return createSnapshot(null);
    });
    mocks.set.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue(undefined);
    mocks.sendNotification.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 for push-subscribe without bearer token", async () => {
    const req = buildRequest("http://localhost/api/push-subscribe", {
      subscription: { endpoint: "https://example.com/sub" },
      user: "Chase",
    });

    const response = await pushSubscribePost(req);

    expect(response.status).toBe(401);
  });

  it("returns 403 for push-subscribe when email is not allowlisted", async () => {
    mocks.verifyIdToken.mockResolvedValue({ email: "blocked@example.com" });

    const req = buildRequest(
      "http://localhost/api/push-subscribe",
      {
        subscription: { endpoint: "https://example.com/sub" },
        user: "Chase",
      },
      "valid-token",
    );

    const response = await pushSubscribePost(req);

    expect(response.status).toBe(403);
  });

  it("allows push-subscribe for authenticated allowlisted caller", async () => {
    const req = buildRequest(
      "http://localhost/api/push-subscribe",
      {
        subscription: { endpoint: "https://example.com/sub" },
        user: "Chase",
      },
      "valid-token",
    );

    const response = await pushSubscribePost(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mocks.set).toHaveBeenCalledTimes(1);
    expect(mocks.set.mock.calls[0][0]).toMatch(/^pushSubscriptions\//);
  });

  it("returns 401 for push-notify without bearer token", async () => {
    const req = buildRequest("http://localhost/api/push-notify", {
      title: "Test",
      body: "Body",
    });

    const response = await pushNotifyPost(req);

    expect(response.status).toBe(401);
  });

  it("returns 403 for push-notify when email is not allowlisted", async () => {
    mocks.verifyIdToken.mockResolvedValue({ email: "blocked@example.com" });

    const req = buildRequest(
      "http://localhost/api/push-notify",
      {
        title: "Test",
        body: "Body",
      },
      "valid-token",
    );

    const response = await pushNotifyPost(req);

    expect(response.status).toBe(403);
  });

  it("returns 403 when verified token has no email", async () => {
    mocks.verifyIdToken.mockResolvedValue({});

    const subscribeReq = buildRequest(
      "http://localhost/api/push-subscribe",
      {
        subscription: { endpoint: "https://example.com/sub" },
        user: "Chase",
      },
      "valid-token",
    );
    const notifyReq = buildRequest(
      "http://localhost/api/push-notify",
      { title: "Test", body: "Body" },
      "valid-token",
    );

    const subscribeRes = await pushSubscribePost(subscribeReq);
    const notifyRes = await pushNotifyPost(notifyReq);

    expect(subscribeRes.status).toBe(403);
    expect(notifyRes.status).toBe(403);
  });

  it("allows push-notify for authenticated allowlisted caller", async () => {
    mocks.once.mockImplementation(async (path: string) => {
      if (path === "allowedEmails") {
        return createSnapshot(["allowed@example.com"]);
      }

      if (path === "pushSubscriptions") {
        return createSnapshot({
          first: {
            subscription: { endpoint: "https://example.com/sub" },
            user: "Chase",
            updatedAt: Date.now(),
          },
        });
      }

      return createSnapshot(null);
    });

    const req = buildRequest(
      "http://localhost/api/push-notify",
      {
        title: "Test",
        body: "Body",
      },
      "valid-token",
    );

    const response = await pushNotifyPost(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sent).toBe(1);
    expect(mocks.sendNotification).toHaveBeenCalledTimes(1);
  });
});
