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

export type SurpriseEventKind =
  | "double-runs"
  | "powerplay"
  | "risk-play"
  | "free-hit";

export type ActiveEvent = {
  kind: SurpriseEventKind;
  // Number of remaining balls this event applies to (0 means inactive)
  ballsLeft: number;
  // For risk-play: whether the player accepted
  accepted?: boolean;
};

export type CommentaryLine = {
  id: number;
  text: string;
  kind: "run" | "boundary" | "six" | "wicket" | "event" | "info";
};

export type GameState = {
  phase: Phase;
  player: Character | null;
  cpu: Character | null;
  oversPerInnings: number; // 2..5
  inning: 1 | 2;
  batter: BatterSide;
  // balls bowled in current innings
  ballsBowled: number;
  playerScore: number;
  playerWickets: number;
  cpuScore: number;
  cpuWickets: number;
  target: number | null;
  lastPlayerMove: number | null;
  lastCpuMove: number | null;
  revealing: boolean;
  ballEvent: "run" | "out" | null;
  result: string | null;
  commentary: CommentaryLine[];
  activeEvent: ActiveEvent | null;
  // Pending event offered to the player this ball (risk-play opt-in)
  pendingOffer: SurpriseEventKind | null;
  // Sound on/off
  soundOn: boolean;
};
