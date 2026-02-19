import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";

// Hoisted mock refs so they're available inside vi.mock() factories
const mocks = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  firebaseSignOut: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  ref: vi.fn((_db: unknown, path: string) => ({ path })),
}));

// Mock react-turnstile to immediately invoke onVerify with a fake token
vi.mock("react-turnstile", () => ({
  default: ({ onVerify }: { onVerify: (token: string) => void }) => {
    setTimeout(() => onVerify("fake-token"), 0);
    return <div data-testid="turnstile" />;
  },
}));

// Mock framer-motion to pass through as plain HTML elements
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop) => {
        const Tag = prop as string;
        return ({ children, initial: _i, animate: _a, exit: _e, transition: _t, whileTap: _w, layout: _l, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) =>
          <Tag {...rest}>{children}</Tag>;
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
  signOut: mocks.firebaseSignOut,
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock("firebase/database", () => ({
  ref: mocks.ref,
  get: mocks.get,
  set: mocks.set,
  onValue: vi.fn(),
  push: vi.fn(),
  remove: vi.fn(),
  query: vi.fn(),
  orderByChild: vi.fn(),
  endAt: vi.fn(),
}));

// ---- LoginScreen captcha gate ----

import { LoginScreen } from "@/app/components/LoginScreen";

describe("LoginScreen captcha gate", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("stays locked and shows error when verification endpoint throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    render(
      <LoginScreen onGoogleSignIn={vi.fn()} onEmailSignIn={vi.fn()} error={null} />
    );

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
    });

    // Gate stays closed — sign-in buttons must not appear
    expect(screen.queryByText("Sign in with Google")).not.toBeInTheDocument();
  });

  it("unlocks when verification succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      })
    );

    render(
      <LoginScreen onGoogleSignIn={vi.fn()} onEmailSignIn={vi.fn()} error={null} />
    );

    await waitFor(() => {
      expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
    });
  });

  it("stays locked when server returns success: false", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" },
      })
    );

    render(
      <LoginScreen onGoogleSignIn={vi.fn()} onEmailSignIn={vi.fn()} error={null} />
    );

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
    });

    expect(screen.queryByText("Sign in with Google")).not.toBeInTheDocument();
  });
});

// ---- useAuth allowlist gate ----

import { useAuth } from "@/lib/useAuth";

describe("useAuth allowlist gate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.firebaseSignOut.mockResolvedValue(undefined);
  });

  it("denies access and signs out when allowlist check throws", async () => {
    const fakeUser = { email: "test@example.com", uid: "abc" };
    mocks.get.mockRejectedValue(new Error("Firebase read error"));

    let authCallback: (user: unknown) => void = () => {};
    mocks.onAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      authCallback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      authCallback(fakeUser);
    });

    await waitFor(() => {
      expect(mocks.firebaseSignOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.error).toMatch(/unable to verify/i);
    });
  });

  it("denies access when email is not on allowlist", async () => {
    const fakeUser = { email: "stranger@example.com", uid: "xyz" };

    // allowedEmails — not present; graceUntil — not present
    mocks.get
      .mockResolvedValueOnce({ exists: () => false, val: () => null })
      .mockResolvedValueOnce({ exists: () => false, val: () => null });

    let authCallback: (user: unknown) => void = () => {};
    mocks.onAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      authCallback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      authCallback(fakeUser);
    });

    await waitFor(() => {
      expect(mocks.firebaseSignOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.error).toMatch(/not on the approved list/i);
    });
  });

  it("grants access when email is on allowlist", async () => {
    const fakeUser = { email: "family@example.com", uid: "123" };

    mocks.get.mockResolvedValueOnce({
      exists: () => true,
      val: () => ["family@example.com"],
    });

    let authCallback: (user: unknown) => void = () => {};
    mocks.onAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      authCallback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      authCallback(fakeUser);
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(fakeUser);
      expect(result.current.error).toBeNull();
    });
  });
});
