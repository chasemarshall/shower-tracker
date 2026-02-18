import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getToday,
  formatElapsed,
  formatDuration,
  timeAgo,
  userColor,
  formatTimeRange,
  getSlotStartTimestamp,
  getSlotAlertKey,
  formatLogTime,
} from "@/lib/utils";

describe("getToday", () => {
  it("returns date in YYYY-MM-DD format", () => {
    const result = getToday();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("pads single-digit months and days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 5)); // Jan 5, 2025
    expect(getToday()).toBe("2025-01-05");
    vi.useRealTimers();
  });
});

describe("formatElapsed", () => {
  it("formats zero seconds", () => {
    expect(formatElapsed(0)).toBe("00:00");
  });

  it("formats seconds only", () => {
    expect(formatElapsed(45)).toBe("00:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatElapsed(125)).toBe("02:05");
  });

  it("formats large values", () => {
    expect(formatElapsed(3661)).toBe("61:01");
  });
});

describe("formatDuration", () => {
  it("formats seconds only", () => {
    expect(formatDuration(30)).toBe("30s");
  });

  it("formats exact minutes", () => {
    expect(formatDuration(300)).toBe("5m");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(125)).toBe("2m 5s");
  });

  it("formats zero seconds", () => {
    expect(formatDuration(0)).toBe("0s");
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for recent timestamps", () => {
    expect(timeAgo(Date.now() - 30_000)).toBe("just now");
  });

  it("returns minutes ago", () => {
    expect(timeAgo(Date.now() - 5 * 60 * 1000)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    expect(timeAgo(Date.now() - 2 * 60 * 60 * 1000)).toBe("2h ago");
  });
});

describe("userColor", () => {
  it("returns correct color for known users", () => {
    expect(userColor("Chase")).toBe("bg-sky");
    expect(userColor("Livia")).toBe("bg-lime");
    expect(userColor("A.J.")).toBe("bg-yolk");
    expect(userColor("Dad")).toBe("bg-bubblegum");
    expect(userColor("Mom")).toBe("bg-mint");
  });

  it("returns bg-white for unknown users", () => {
    expect(userColor("Unknown")).toBe("bg-white");
  });
});

describe("formatTimeRange", () => {
  it("returns a time range string with an en-dash", () => {
    const result = formatTimeRange("09:00", 30);
    expect(result).toContain("\u2013");
  });
});

describe("getSlotStartTimestamp", () => {
  it("returns correct timestamp for a slot", () => {
    const slot = { user: "Chase", date: "2025-06-15", startTime: "09:30", durationMinutes: 15 };
    const ts = getSlotStartTimestamp(slot);
    const d = new Date(ts);
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(5); // June = 5
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(9);
    expect(d.getMinutes()).toBe(30);
  });
});

describe("getSlotAlertKey", () => {
  it("creates correct key format", () => {
    expect(getSlotAlertKey("abc123", "owner-ten")).toBe("abc123:owner-ten");
    expect(getSlotAlertKey("xyz", "others-start")).toBe("xyz:others-start");
  });
});

describe("formatLogTime", () => {
  it("returns a formatted time string", () => {
    const ts = new Date(2025, 5, 15, 14, 30).getTime();
    const result = formatLogTime(ts);
    // Should contain the hour and minute
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});
