export interface Preferences {
  unlocked: number;
  sound: boolean;
}
const key = "corpo-sob-medida:v2";
const legacyKey = "corpo-sob-medida:v1";
function read(key: string, version: number): Preferences | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      !value ||
      typeof value !== "object" ||
      !("version" in value) ||
      value.version !== version ||
      !("unlocked" in value)
    )
      return null;
    return {
      unlocked:
        typeof value.unlocked === "number" && Number.isInteger(value.unlocked)
          ? Math.max(1, Math.min(6, value.unlocked))
          : 1,
      sound: "sound" in value && value.sound === true,
    };
  } catch {
    return null;
  }
}
export function loadPreferences(): Preferences {
  const current = read(key, 2);
  if (current) return current;
  const legacy = read(legacyKey, 1);
  if (legacy) {
    savePreferences(legacy);
    return legacy;
  }
  return { unlocked: 1, sound: false };
}
export function savePreferences(value: Preferences): void {
  try {
    localStorage.setItem(key, JSON.stringify({ version: 2, ...value }));
  } catch {
    /* Keep playing without persistence. */
  }
}
