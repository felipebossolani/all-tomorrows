export interface Preferences {
  unlocked: number;
  sound: boolean;
}
const key = "corpo-sob-medida:v1";
export function loadPreferences(): Preferences {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      value &&
      typeof value === "object" &&
      "version" in value &&
      value.version === 1 &&
      "unlocked" in value &&
      "sound" in value
    ) {
      return {
        unlocked:
          typeof value.unlocked === "number" && Number.isInteger(value.unlocked)
            ? Math.max(1, Math.min(6, value.unlocked))
            : 1,
        sound: value.sound === true,
      };
    }
  } catch {
    /* Storage is optional. */
  }
  return { unlocked: 1, sound: false };
}
export function savePreferences(value: Preferences): void {
  try {
    localStorage.setItem(key, JSON.stringify({ version: 1, ...value }));
  } catch {
    /* Keep playing without persistence. */
  }
}
