import { describe, it, expect } from "vitest";
import { USERS, USER_COLORS, DURATIONS, AUTO_RELEASE_SECONDS, MIN_SHOWER_SECONDS } from "@/lib/constants";

describe("constants", () => {
  it("has 5 users", () => {
    expect(USERS).toHaveLength(5);
    expect(USERS).toEqual(["Chase", "Livia", "A.J.", "Dad", "Mom"]);
  });

  it("has a color for every user", () => {
    for (const user of USERS) {
      expect(USER_COLORS[user]).toBeDefined();
      expect(USER_COLORS[user]).toMatch(/^bg-/);
    }
  });

  it("has valid durations", () => {
    expect(DURATIONS.length).toBeGreaterThan(0);
    for (const d of DURATIONS) {
      expect(d).toBeGreaterThan(0);
    }
    // Should be sorted ascending
    for (let i = 1; i < DURATIONS.length; i++) {
      expect(DURATIONS[i]).toBeGreaterThan(DURATIONS[i - 1]);
    }
  });

  it("auto release is 45 minutes", () => {
    expect(AUTO_RELEASE_SECONDS).toBe(2700);
  });

  it("minimum shower is 5 seconds", () => {
    expect(MIN_SHOWER_SECONDS).toBe(5);
  });
});
