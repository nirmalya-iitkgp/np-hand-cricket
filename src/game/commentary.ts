import type { CommentaryLine } from "./types";

const SIX_PHRASES = [
  "{name} launches it — MASSIVE SIX! 🚀",
  "Into the stands! {name} goes BIG!",
  "Six more! {name} is in beast mode!",
  "{name} clears the rope with ease!",
];

const FOUR_PHRASES = [
  "Beautiful boundary by {name}!",
  "Four more! {name} threads the gap!",
  "{name} pierces the field — FOUR!",
  "Cracking shot from {name}, races away!",
];

const SMALL_RUN_PHRASES: Record<number, string[]> = {
  1: [
    "Tucked away by {name} for a single.",
    "Quick single, well run by {name}.",
    "{name} rotates the strike.",
  ],
  2: [
    "Pushed into the gap, {name} comes back for two.",
    "Good hustle, {name} takes a couple.",
    "Two runs added by {name}.",
  ],
  3: [
    "Three runs! {name} stretches the field.",
    "{name} runs hard — three to the total!",
    "Excellent placement, three for {name}.",
  ],
  5: [
    "Unusual five for {name}!",
    "{name} picks up an odd five.",
    "Five runs added — {name} takes advantage.",
  ],
};

const WICKET_PHRASES = [
  "OUT! What a delivery to dismiss {name}!",
  "HUGE WICKET! {name} has to walk back!",
  "Got him! {name} is OUT!",
  "{name} reads it wrong — CLEAN BOWLED!",
  "GONE! {name} departs!",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let counter = 0;

export function buildCommentary(args: {
  outcome: "run" | "out";
  runs: number;
  batterName: string;
  bowlerName: string;
  multiplier?: number;
  bonus?: string;
}): CommentaryLine {
  const { outcome, runs, batterName, bowlerName, multiplier, bonus } = args;
  counter += 1;
  if (outcome === "out") {
    const text = pick(WICKET_PHRASES).replace("{name}", batterName) + ` (b ${bowlerName})`;
    return { id: counter, text, kind: "wicket" };
  }
  const tag = (s: string) => {
    let t = s;
    if (multiplier && multiplier !== 1) t += ` ×${multiplier}`;
    if (bonus) t += ` ${bonus}`;
    return t;
  };
  if (runs >= 6) {
    return { id: counter, text: tag(pick(SIX_PHRASES).replace("{name}", batterName)), kind: "six" };
  }
  if (runs >= 4) {
    return { id: counter, text: tag(pick(FOUR_PHRASES).replace("{name}", batterName)), kind: "boundary" };
  }
  if (runs === 0) {
    return { id: counter, text: `Dot ball — no run for ${batterName}.`, kind: "run" };
  }
  const phrases = SMALL_RUN_PHRASES[runs] ?? ["{name} adds {runs}."];
  const base = pick(phrases).replace("{name}", batterName).replace("{runs}", String(runs));
  return { id: counter, text: tag(base), kind: "run" };
}

export function infoLine(text: string, kind: CommentaryLine["kind"] = "info"): CommentaryLine {
  counter += 1;
  return { id: counter, text, kind };
}
