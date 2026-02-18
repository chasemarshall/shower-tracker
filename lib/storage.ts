import { USERS, USER_STORAGE_KEY } from "./constants";

export function getPersistedUser(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(USER_STORAGE_KEY);
    return saved && USERS.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function persistUser(name: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_STORAGE_KEY, name);
  } catch {
    // Ignore storage failures (e.g. Safari private mode).
  }
}

export function clearPersistedUser() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Ignore storage failures (e.g. Safari private mode).
  }
}
