import type { ActiveEvent, SurpriseEventKind } from "./types";

export const EVENT_META: Record<
  SurpriseEventKind,
  {
    label: string;
    emoji: string;
    description: string;
    color: "primary" | "warning" | "destructive" | "accent" | "success";
    favors: "batting" | "bowling" | "neutral";
    optIn?: boolean;
  }
> = {
  "double-runs": {
    label: "Double Runs",
    emoji: "⚡",
    description: "Runs scored this ball are DOUBLED!",
    color: "primary",
    favors: "batting",
  },
  powerplay: {
    label: "Powerplay Over",
    emoji: "🔥",
    description: "All runs ×1.5 for 6 balls. No wicket on a '1'.",
    color: "warning",
    favors: "batting",
  },
  "risk-play": {
    label: "Risk Play",
    emoji: "🎲",
    description: "Accept: runs ×3 if not out, but lose 2 wickets if out.",
    color: "accent",
    favors: "batting",
    optIn: true,
  },
  "free-hit": {
    label: "Free Hit",
    emoji: "🛡️",
    description: "No wicket possible this ball — match = 0 runs.",
    color: "destructive",
    favors: "batting",
  },
  "super-over": {
    label: "Super Over",
    emoji: "💎",
    description: "Next 6 balls: every six counts double (×2 only on 6s).",
    color: "primary",
    favors: "batting",
  },
  "slog-fest": {
    label: "Slog Fest",
    emoji: "💪",
    description: "Batter must pick 4–6 only. Bowler can pick anything.",
    color: "warning",
    favors: "batting",
  },
  "dot-curse": {
    label: "Dot Ball Curse",
    emoji: "🌀",
    description: "If the batter picks an ODD number, runs are halved.",
    color: "destructive",
    favors: "bowling",
  },
  "mystery-ball": {
    label: "Mystery Ball",
    emoji: "❓",
    description: "Batter cannot see the bowler's last pick history hint.",
    color: "accent",
    favors: "bowling",
  },
  "bonus-boundary": {
    label: "Bonus Boundary",
    emoji: "🎁",
    description: "Any score of 4 or 6 this ball gets +2 bonus runs.",
    color: "success",
    favors: "batting",
  },
};

const ALL_KINDS: SurpriseEventKind[] = [
  "double-runs",
  "powerplay",
  "risk-play",
  "free-hit",
  "super-over",
  "slog-fest",
  "dot-curse",
  "mystery-ball",
  "bonus-boundary",
];

/**
 * ~20% chance per ball to trigger a surprise. Bowling side may have an
 * all-rounder bias (slightly higher chance + biased toward bowling-favoring events).
 */
export function maybeTriggerEvent(opts: {
  bowlerIsAllRounder: boolean;
}): SurpriseEventKind | null {
  const baseChance = opts.bowlerIsAllRounder ? 0.28 : 0.18;
  if (Math.random() > baseChance) return null;
  // Weight: if bowler is all-rounder, double the weight of bowling-favoring events
  const weighted: SurpriseEventKind[] = [];
  for (const k of ALL_KINDS) {
    const meta = EVENT_META[k];
    const weight =
      opts.bowlerIsAllRounder && meta.favors === "bowling" ? 3 : 1;
    for (let i = 0; i < weight; i++) weighted.push(k);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function eventToActive(kind: SurpriseEventKind): ActiveEvent {
  const favors = EVENT_META[kind].favors === "neutral" ? undefined : EVENT_META[kind].favors;
  if (kind === "powerplay" || kind === "super-over") return { kind, ballsLeft: 6, favors };
  return { kind, ballsLeft: 1, favors };
}
