let context: AudioContext | undefined;
export function playTone(enabled: boolean, complete = false): void {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => undefined);
    const now = context.currentTime;
    for (let i = 0; i < (complete ? 3 : 1); i++) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = complete ? [392, 494, 587][i]! : 260;
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.035, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + i * 0.12);
      oscillator.stop(now + i * 0.12 + 0.36);
    }
  } catch {
    /* Audio is optional. */
  }
}
