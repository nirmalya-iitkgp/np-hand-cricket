export type Role = "Batsman" | "Bowler" | "All-Rounder";

export type Character = {
  id: string;
  name: string;
  role: Role;
  emoji: string;
  country: string;
};

export const ROSTER: Character[] = [
  { id: "mitchell", name: "Daryl Mitchell", role: "Batsman", emoji: "🏏", country: "NZ" },
  { id: "kohli", name: "Virat Kohli", role: "Batsman", emoji: "🏏", country: "IND" },
  { id: "bumrah", name: "Jasprit Bumrah", role: "Bowler", emoji: "🎯", country: "IND" },
  { id: "rashid", name: "Rashid Khan", role: "Bowler", emoji: "🎯", country: "AFG" },
  { id: "omarzai", name: "Azmatullah Omarzai", role: "All-Rounder", emoji: "⚡", country: "AFG" },
  { id: "raza", name: "Sikandar Raza", role: "All-Rounder", emoji: "⚡", country: "ZIM" },
];

export type Phase =
  | "pickup"
  | "versus"
  | "toss"
  | "playing"
  | "innings-break"
  | "result";

export type BatterSide = "player" | "cpu";

export type GameState = {
  phase: Phase;
  player: Character | null;
  cpu: Character | null;
  inning: 1 | 2;
  batter: BatterSide; // who is batting in current inning
  playerScore: number;
  playerWickets: number; // wickets lost (0..3)
  cpuScore: number;
  cpuWickets: number;
  target: number | null; // set when inning 2 starts
  lastPlayerMove: number | null;
  lastCpuMove: number | null;
  revealing: boolean;
  ballEvent: "run" | "out" | null;
  result: string | null;
};
