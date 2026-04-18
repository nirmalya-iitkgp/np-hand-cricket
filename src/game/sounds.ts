// Free hosted SFX (mixkit / pixabay style CDN — small public clips).
// These are all CC0 / royalty-free short sound effects.
const SFX = {
  bat: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5d3b3a2f4d.mp3?filename=bat-hit-1-6803.mp3",
  six: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_d1718ab41b.mp3?filename=success-fanfare-trumpets-6185.mp3",
  four: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=clapping-6474.mp3",
  wicket: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_7c5f3a4f4f.mp3?filename=negative_beeps-6008.mp3",
  cheer: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1a3a7a3a4f.mp3?filename=crowd-cheer-2-6082.mp3",
  click: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a8c8c8.mp3?filename=click-button-140881.mp3",
  whoosh:
    "https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bbc5a4.mp3?filename=whoosh-6316.mp3",
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
    void el.play().catch(() => {
      /* autoplay/network errors swallowed */
    });
  } catch {
    /* noop */
  }
}
