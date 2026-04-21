export type Role = "Batsman" | "Batswoman" | "Bowler" | "Bowlerwoman" | "All-Rounder";

export type AbilityKind =
  | "concentration"
  | "yorker"
  | "allrounder-event"
  | "lifeline"
  | "runs-boost";

export type Character = {
  id: string;
  name: string;
  role: Role;
  emoji: string;
  country: string;
  ability: AbilityKind;
  abilityLabel: string;
  abilityDesc: string;
};

export const ROSTER: Character[] = [
  // ===== Batsmen (6) =====
  { id: "kohli", name: "Virat Kohli", role: "Batsman", emoji: "🏏", country: "IND",
    ability: "concentration", abilityLabel: "Concentration",
    abilityDesc: "Every 3 safe balls: next 4 counts as 5 runs." },
  { id: "root", name: "Joe Root", role: "Batsman", emoji: "🏏", country: "ENG",
    ability: "lifeline", abilityLabel: "Second Life",
    abilityDesc: "Once per match: a tie doesn't go OUT — score halved instead." },
  { id: "babar", name: "Babar Azam", role: "Batsman", emoji: "🏏", country: "PAK",
    ability: "lifeline", abilityLabel: "Lifeline",
    abilityDesc: "Once per match: a tie doesn't go OUT — score halved instead." },
  { id: "smith", name: "Steve Smith", role: "Batsman", emoji: "🏏", country: "AUS",
    ability: "concentration", abilityLabel: "Crease Magnet",
    abilityDesc: "Every 3 safe balls: next 4 counts as 5 runs." },
  { id: "williamson", name: "Kane Williamson", role: "Batsman", emoji: "🏏", country: "NZ",
    ability: "lifeline", abilityLabel: "Ice Cool",
    abilityDesc: "Once per match: a tie doesn't go OUT — score halved instead." },
  { id: "rohit", name: "Rohit Sharma", role: "Batsman", emoji: "🏏", country: "IND",
    ability: "concentration", abilityLabel: "Hitman Focus",
    abilityDesc: "Every 3 safe balls: next 4 counts as 5 runs." },

  // ===== Batswomen (3) =====
  { id: "mandhana", name: "Smriti Mandhana", role: "Batswoman", emoji: "🏏", country: "IND",
    ability: "concentration", abilityLabel: "Concentration",
    abilityDesc: "Every 3 safe balls: next 4 counts as 5 runs." },
  { id: "perry", name: "Ellyse Perry", role: "Batswoman", emoji: "🏏", country: "AUS",
    ability: "lifeline", abilityLabel: "Match-Saver",
    abilityDesc: "Once per match: a tie doesn't go OUT — score halved instead." },
  { id: "healy", name: "Alyssa Healy", role: "Batswoman", emoji: "🏏", country: "AUS",
    ability: "concentration", abilityLabel: "Power Stance",
    abilityDesc: "Every 3 safe balls: next 4 counts as 5 runs." },

  // ===== Bowlers (6) =====
  { id: "bumrah", name: "Jasprit Bumrah", role: "Bowler", emoji: "🎯", country: "IND",
    ability: "yorker", abilityLabel: "Yorker",
    abilityDesc: "Once per over: forces opponent to pick 1–3 only." },
  { id: "rashid", name: "Rashid Khan", role: "Bowler", emoji: "🎯", country: "AFG",
    ability: "yorker", abilityLabel: "Mystery Spin",
    abilityDesc: "Once per over: forces opponent to pick 1–3 only." },
  { id: "starc", name: "Mitchell Starc", role: "Bowler", emoji: "🎯", country: "AUS",
    ability: "yorker", abilityLabel: "Yorker",
    abilityDesc: "Once per over: forces opponent to pick 1–3 only." },
  { id: "boult", name: "Trent Boult", role: "Bowler", emoji: "🎯", country: "NZ",
    ability: "yorker", abilityLabel: "Swing King",
    abilityDesc: "Once per over: forces opponent to pick 1–3 only." },
  { id: "shaheen", name: "Shaheen Afridi", role: "Bowler", emoji: "🎯", country: "PAK",
    ability: "yorker", abilityLabel: "Toe Crusher",
    abilityDesc: "Once per over: forces opponent to pick 1–3 only." },
  { id: "rabada", name: "Kagiso Rabada", role: "Bowler", emoji: "🎯", country: "RSA",
    ability: "yorker", abilityLabel: "Heat Seeker",
    abilityDesc: "Once per over: forces opponent to pick 1–3 only." },

  // ===== Bowlerwomen (3) =====
  { id: "ecclestone", name: "Sophie Ecclestone", role: "Bowlerwoman", emoji: "🎯", country: "ENG",
    ability: "yorker", abilityLabel: "Spin Trap",
    abilityDesc: "Once per over: forces opponent to pick 1–3 only." },
  { id: "ismail", name: "Shabnim Ismail", role: "Bowlerwoman", emoji: "🎯", country: "RSA",
    ability: "yorker", abilityLabel: "Express Yorker",
    abilityDesc: "Once per over: forces opponent to pick 1–3 only." },
  { id: "schutt", name: "Megan Schutt", role: "Bowlerwoman", emoji: "🎯", country: "AUS",
    ability: "yorker", abilityLabel: "Death Specialist",
    abilityDesc: "Once per over: forces opponent to pick 1–3 only." },

  // ===== All-Rounders (5 men + 1 woman) =====
  { id: "stokes", name: "Ben Stokes", role: "All-Rounder", emoji: "⚡", country: "ENG",
    ability: "runs-boost", abilityLabel: "Match-Winner",
    abilityDesc: "+15% chance to add a bonus run while batting." },
  { id: "jadeja", name: "Ravindra Jadeja", role: "All-Rounder", emoji: "⚡", country: "IND",
    ability: "allrounder-event", abilityLabel: "Sir Jadeja",
    abilityDesc: "Higher chance of bowling-side surprise events." },
  { id: "shakib", name: "Shakib Al Hasan", role: "All-Rounder", emoji: "⚡", country: "BAN",
    ability: "runs-boost", abilityLabel: "Mr Reliable",
    abilityDesc: "+15% chance to add a bonus run while batting." },
  { id: "raza", name: "Sikandar Raza", role: "All-Rounder", emoji: "⚡", country: "ZIM",
    ability: "allrounder-event", abilityLabel: "Clutch Factor",
    abilityDesc: "Higher chance of bowling-side surprise events." },
  { id: "maxwell", name: "Glenn Maxwell", role: "All-Rounder", emoji: "⚡", country: "AUS",
    ability: "runs-boost", abilityLabel: "Big Show",
    abilityDesc: "+15% chance to add a bonus run while batting." },
  { id: "sciver", name: "Nat Sciver-Brunt", role: "All-Rounder", emoji: "⚡", country: "ENG",
    ability: "allrounder-event", abilityLabel: "Dual Threat",
    abilityDesc: "Higher chance of bowling-side surprise events." },
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
  | "free-hit"
  | "super-over"
  | "slog-fest"
  | "dot-curse"
  | "mystery-ball"
  | "bonus-boundary";

export type ActiveEvent = {
  kind: SurpriseEventKind;
  ballsLeft: number;
  accepted?: boolean;
  /** which side this event favors — used by all-rounder bias */
  favors?: "batting" | "bowling";
};

export type CommentaryLine = {
  id: number;
  text: string;
  kind: "run" | "boundary" | "six" | "wicket" | "event" | "info";
};

export type BallOutcome = {
  /** display chip: 0,1,2,3,4,5,6, or "W" */
  label: string;
  isWicket: boolean;
  runs: number;
  inning: 1 | 2;
};

export type AbilityState = {
  /** Concentration: number of safe balls in a row */
  concentrationStreak: number;
  /** Concentration: boost armed for next ball — 4 becomes 5 */
  concentrationArmed: boolean;
  /** Yorker: true if used in the current over */
  yorkerUsedThisOver: boolean;
  /** Yorker pending — opponent's next pick is constrained to 1-3 */
  yorkerActive: boolean;
  /** Lifeline (batsman): unused = available; if a tie occurs, no out — score halved instead */
  lifelineAvailable: boolean;
};

export type GameState = {
  phase: Phase;
  player: Character | null;
  cpu: Character | null;
  oversPerInnings: number;
  inning: 1 | 2;
  batter: BatterSide;
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
  pendingOffer: SurpriseEventKind | null;
  soundOn: boolean;
  /** Last 6 balls for the timeline ribbon (current innings) */
  timeline: BallOutcome[];
  /** Player's historical picks for CPU pattern learning */
  playerPickHistory: number[];
  /** Per-side ability state */
  playerAbility: AbilityState;
  cpuAbility: AbilityState;
};
