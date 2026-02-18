import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom@28 uses a SQLite-backed localStorage that requires a file path.
// Without one it emits a warning and provides an empty object.
// Stub with a complete in-memory implementation so storage tests work.
const localStorageMock = (() => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string): string | null => store.get(key) ?? null,
    setItem: (key: string, value: string): void => { store.set(key, String(value)); },
    removeItem: (key: string): void => { store.delete(key); },
    clear: (): void => { store.clear(); },
    key: (index: number): string | null => [...store.keys()][index] ?? null,
    get length(): number { return store.size; },
  };
})();
vi.stubGlobal("localStorage", localStorageMock);

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
