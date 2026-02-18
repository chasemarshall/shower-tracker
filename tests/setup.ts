import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock Firebase
vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  googleProvider: {},
}));

// Mock firebase/database
vi.mock("firebase/database", () => ({
  ref: vi.fn(),
  onValue: vi.fn(),
  set: vi.fn(),
  push: vi.fn(),
  remove: vi.fn(),
  query: vi.fn(),
  orderByChild: vi.fn(),
  endAt: vi.fn(),
  get: vi.fn(() => Promise.resolve({ forEach: vi.fn() })),
}));
