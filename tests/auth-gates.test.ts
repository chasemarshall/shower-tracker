/**
 * auth-gates.test.ts
 *
 * Tests for fail-closed auth and captcha behavior (CMF-8).
 * Tests the extracted pure functions directly to avoid React 19 /
 * @testing-library/react compatibility issues with React.act.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "firebase/database";

// ---- verifyTurnstileToken (LoginScreen) ----

import { verifyTurnstileToken } from "@/app/components/LoginScreen";

describe("verifyTurnstileToken — fail-closed captcha gate", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws on network error so the caller can fail closed", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
    await expect(verifyTurnstileToken("token")).rejects.toThrow("Network error");
  });

  it("returns false when the server returns success: false", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(await verifyTurnstileToken("token")).toBe(false);
  });

  it("returns true when the server returns success: true", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(await verifyTurnstileToken("token")).toBe(true);
  });
});

// ---- checkAndWhitelistAtPath (useAuth) ----

import { checkAndWhitelistAtPath } from "@/lib/useAuth";

describe("checkAndWhitelistAtPath — fail-closed allowlist gate", () => {
  beforeEach(() => {
    vi.mocked(get).mockReset();
  });

  it("throws on Firebase read error so the caller can fail closed", async () => {
    vi.mocked(get).mockRejectedValue(new Error("Firebase error"));
    await expect(
      checkAndWhitelistAtPath("allowedEmails", "test@example.com")
    ).rejects.toThrow("Firebase error");
  });

  it("returns allowed: false when email is not on the list and no grace period", async () => {
    // allowedEmails: empty; graceUntil: absent
    vi.mocked(get)
      .mockResolvedValueOnce({ exists: () => false, val: () => null } as never)
      .mockResolvedValueOnce({ exists: () => false, val: () => null } as never);

    const result = await checkAndWhitelistAtPath("allowedEmails", "stranger@example.com");
    expect(result.allowed).toBe(false);
  });

  it("returns allowed: true when email is on the list", async () => {
    vi.mocked(get).mockResolvedValueOnce({
      exists: () => true,
      val: () => ["family@example.com"],
    } as never);

    const result = await checkAndWhitelistAtPath("allowedEmails", "family@example.com");
    expect(result.allowed).toBe(true);
  });

  it("returns allowed: false when email is not on the list even with expired grace period", async () => {
    const expiredGrace = Date.now() - 60_000; // 1 minute ago
    vi.mocked(get)
      .mockResolvedValueOnce({ exists: () => false, val: () => null } as never)
      .mockResolvedValueOnce({ exists: () => true, val: () => expiredGrace } as never);

    const result = await checkAndWhitelistAtPath("allowedEmails", "latecomer@example.com");
    expect(result.allowed).toBe(false);
  });
});
