/**
 * Carries in-progress feature state across the /login redirect.
 *
 * A route change unmounts the feature page, so anything held in React state
 * (a configured backtest pipeline, a typed chat message, screener filters)
 * would otherwise be lost the moment a signed-out user is sent to log in.
 * Call `savePendingResume` right before navigating to /login, then
 * `consumePendingResume` on the feature page's next mount to restore it.
 *
 * sessionStorage (not localStorage) on purpose — this is a single hop, not
 * something that should survive across tabs or days.
 */

const STORAGE_KEY = 'welthwest_pending_resume';
const MAX_AGE_MS = 30 * 60 * 1000; // stale after 30 minutes — don't surprise-resume a long-abandoned session

interface StoredResume {
  feature: string;
  data: unknown;
  savedAt: number;
}

export function savePendingResume(feature: string, data: unknown): void {
  try {
    const payload: StoredResume = { feature, data, savedAt: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — resume just won't happen
  }
}

/** Reads and clears the pending resume for `feature`, if any and not stale. */
export function consumePendingResume<T>(feature: string): T | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredResume = JSON.parse(raw);
    sessionStorage.removeItem(STORAGE_KEY);
    if (parsed.feature !== feature) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed.data as T;
  } catch {
    return null;
  }
}
