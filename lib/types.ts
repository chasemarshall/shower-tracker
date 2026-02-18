export interface ShowerStatus {
  currentUser: string | null;
  startedAt: number | null;
}

export interface Slot {
  user: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  recurring?: boolean;
  completed?: boolean;
}

export interface SlotsMap {
  [key: string]: Slot;
}

export interface LogEntry {
  user: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
}

export interface LogMap {
  [key: string]: LogEntry;
}
