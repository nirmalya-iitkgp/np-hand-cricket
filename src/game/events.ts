import type { ActiveEvent, SurpriseEventKind } from "./types";

export const EVENT_META: Record<
  SurpriseEventKind,
  { label: string; emoji: string; description: string; color: "primary" | "warning" | "destructive" | "accent" }
> = {
  "double-runs": {
    label: "Double Runs",
    emoji: "⚡",
    description: "Runs scored this ball are DOUBLED!",
    color: "primary",
  },
  powerplay: {
    label: "Powerplay Over",
    emoji: "🔥",
    description: "All runs ×1.5 for 6 balls. No wickets on a '1'.",
    color: "warning",
  },
  "risk-play": {
    label: "Risk Play",
    emoji: "🎲",
    description: "Accept: runs ×3 if not out, but lose 2 wickets if out.",
    color: "accent",
  },
  "free-hit": {
    label: "Free Hit",
    emoji: "🛡️",
    description: "No wicket possible this ball — match = 0 runs.",
    color: "destructive",
  },
};

/** ~18% chance per ball to trigger a surprise (when nothing already active). */
export function maybeTriggerEvent(): SurpriseEventKind | null {
  if (Math.random() > 0.18) return null;
  const kinds: SurpriseEventKind[] = ["double-runs", "powerplay", "risk-play", "free-hit"];
  return kinds[Math.floor(Math.random() * kinds.length)];
}

export function eventToActive(kind: SurpriseEventKind): ActiveEvent {
  if (kind === "powerplay") return { kind, ballsLeft: 6 };
  return { kind, ballsLeft: 1 };
}
