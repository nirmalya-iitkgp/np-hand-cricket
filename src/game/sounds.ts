// Limited SFX — only wickets and end of innings. Free CC0 hosted clips.
const SFX = {
  wicket:
    "https://cdn.pixabay.com/download/audio/2022/03/10/audio_7c5f3a4f4f.mp3?filename=negative_beeps-6008.mp3",
  innings:
    "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1a3a7a3a4f.mp3?filename=crowd-cheer-2-6082.mp3",
} as const;

export type SoundKey = keyof typeof SFX;

const cache: Partial<Record<SoundKey, HTMLAudioElement>> = {};

export function playSound(key: SoundKey, enabled: boolean, volume = 0.5) {
  if (!enabled) return;
  if (typeof window === "undefined") return;
  try {
    let el = cache[key];
    if (!el) {
      el = new Audio(SFX[key]);
      el.preload = "auto";
      cache[key] = el;
    }
    el.volume = volume;
    el.currentTime = 0;
    void el.play().catch(() => {});
  } catch {
    /* noop */
  }
}
