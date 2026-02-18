import { describe, it, expect, beforeEach, vi } from "vitest";
import { getPersistedUser, persistUser, clearPersistedUser } from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("persistUser / getPersistedUser", () => {
    it("persists and retrieves a valid user", () => {
      persistUser("Chase");
      expect(getPersistedUser()).toBe("Chase");
    });

    it("returns null for unknown user names", () => {
      localStorage.setItem("showerTimerUser", "Stranger");
      expect(getPersistedUser()).toBeNull();
    });

    it("returns null when nothing is persisted", () => {
      expect(getPersistedUser()).toBeNull();
    });

    it("works for all valid users", () => {
      for (const name of ["Chase", "Livia", "A.J.", "Dad", "Mom"]) {
        persistUser(name);
        expect(getPersistedUser()).toBe(name);
      }
    });
  });

  describe("clearPersistedUser", () => {
    it("clears the persisted user", () => {
      persistUser("Livia");
      expect(getPersistedUser()).toBe("Livia");
      clearPersistedUser();
      expect(getPersistedUser()).toBeNull();
    });
  });

  describe("error handling", () => {
    it("handles localStorage errors gracefully in getPersistedUser", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
      expect(getPersistedUser()).toBeNull();
      vi.restoreAllMocks();
    });

    it("handles localStorage errors gracefully in persistUser", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
      // Should not throw
      expect(() => persistUser("Chase")).not.toThrow();
      vi.restoreAllMocks();
    });

    it("handles localStorage errors gracefully in clearPersistedUser", () => {
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      expect(() => clearPersistedUser()).not.toThrow();
      vi.restoreAllMocks();
    });
  });
});
