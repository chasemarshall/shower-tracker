export const USERS = ["Chase", "Livia", "A.J.", "Dad", "Mom"];

export const USER_COLORS: Record<string, string> = {
  "Chase": "bg-sky",
  "Livia": "bg-lime",
  "A.J.": "bg-yolk",
  "Dad": "bg-bubblegum",
  "Mom": "bg-mint",
};

export const DURATIONS = [15, 20, 30, 45, 60];
export const AUTO_RELEASE_SECONDS = 2700;
export const MIN_SHOWER_SECONDS = 5;
export const USER_STORAGE_KEY = "showerTimerUser";
export const SLOT_ALERT_WINDOW_MS = 90_000;
export const TEN_MINUTES_MS = 10 * 60 * 1000;
