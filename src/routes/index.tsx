import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ROSTER,
  type Character,
  type GameState,
  type CommentaryLine,
  type AbilityState,
  type BallOutcome,
} from "@/game/types";
import { CharacterCard } from "@/components/game/CharacterCard";
import { Scoreboard } from "@/components/game/Scoreboard";
import { HandIcon, NumberButton } from "@/components/game/HandIcon";
import { Commentary } from "@/components/game/Commentary";
import { Timeline } from "@/components/game/Timeline";
import { EventOfferDialog } from "@/components/game/EventBanner";
import { SuspenseOverlay } from "@/components/game/SuspenseOverlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Swords, RotateCcw, BookOpen, Sparkles, Zap, Brain } from "lucide-react";
import { buildCommentary, infoLine } from "@/game/commentary";
import { EVENT_META, eventToActive, maybeTriggerEvent } from "@/game/events";
import { chooseCpuMove } from "@/game/ai";
import { playSound } from "@/game/sounds";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Championship Hand Cricket — Human vs CPU" },
      {
        name: "description",
        content:
          "Play Hand Cricket vs a learning CPU. Pick a champion with unique abilities, trigger surprise events, follow live commentary.",
      },
      { property: "og:title", content: "Championship Hand Cricket" },
      {
        property: "og:description",
        content:
          "Pick a champion with abilities. The CPU learns your patterns. 9 surprise events, full commentary log.",
      },
    ],
  }),
});

const emptyAbility: AbilityState = {
  concentrationStreak: 0,
  concentrationArmed: false,
  yorkerUsedThisOver: false,
  yorkerActive: false,
};

const initialState: GameState = {
  phase: "pickup",
  player: null,
  cpu: null,
  oversPerInnings: 3,
  inning: 1,
  batter: "player",
  ballsBowled: 0,
  playerScore: 0,
  playerWickets: 0,
  cpuScore: 0,
  cpuWickets: 0,
  target: null,
  lastPlayerMove: null,
  lastCpuMove: null,
  revealing: false,
  ballEvent: null,
  result: null,
  commentary: [],
  activeEvent: null,
  pendingOffer: null,
  soundOn: true,
  timeline: [],
  playerPickHistory: [],
  playerAbility: { ...emptyAbility },
  cpuAbility: { ...emptyAbility },
};

function randInt(max: number) {
  return Math.floor(Math.random() * max);
}

function Index() {
  const [state, setState] = useState<GameState>(initialState);

  const onPick = (char: Character) => {
    const opponents = ROSTER.filter((c) => c.id !== char.id);
    const cpu = opponents[randInt(opponents.length)];
    setState({ ...initialState, player: char, cpu, phase: "versus" });
  };

  const goToToss = () => setState((s) => ({ ...s, phase: "toss" }));

  const chooseInnings = (firstChoice: "bat" | "bowl", overs: number) => {
    const batter = firstChoice === "bat" ? "player" : "cpu";
    setState((s) => ({
      ...s,
      phase: "playing",
      oversPerInnings: overs,
      inning: 1,
      batter,
      ballsBowled: 0,
      playerScore: 0,
      playerWickets: 0,
      cpuScore: 0,
      cpuWickets: 0,
      target: null,
      lastPlayerMove: null,
      lastCpuMove: null,
      ballEvent: null,
      result: null,
      activeEvent: null,
      pendingOffer: null,
      timeline: [],
      playerPickHistory: [],
      playerAbility: { ...emptyAbility },
      cpuAbility: { ...emptyAbility },
      commentary: [
        infoLine(`Match begins! ${overs} overs per innings, 3 wickets.`),
        infoLine(
          `${batter === "player" ? s.player?.name ?? "You" : s.cpu?.name ?? "CPU"} to bat first.`,
        ),
      ],
    }));
  };

  const playBall = (playerMove: number) => {
    if (state.revealing || state.phase !== "playing" || state.pendingOffer) return;

    const playerIsBatting = state.batter === "player";
    const ev = state.activeEvent;

    // Slog-fest: batter must be 4-6
    if (ev?.kind === "slog-fest" && playerIsBatting && playerMove < 4) return;
    // Yorker active against player: player must be 1-3
    if (state.playerAbility.yorkerActive === false &&
        state.cpuAbility.yorkerActive && playerMove > 3) return;

    // CPU pick — uses pattern learning
    const cpuIsBatting = !playerIsBatting;
    const cpuRestrictedYorker = state.playerAbility.yorkerActive; // player's yorker affects CPU
    const cpuRestrictedSlog = ev?.kind === "slog-fest" && cpuIsBatting;
    const cpuMove = chooseCpuMove({
      cpuIsBatting,
      history: state.playerPickHistory,
      restrictTo1to3: cpuRestrictedYorker,
      restrictTo4to6: cpuRestrictedSlog,
    });

    setState((s) => ({
      ...s,
      lastPlayerMove: playerMove,
      lastCpuMove: cpuMove,
      revealing: true,
      ballEvent: null,
      playerPickHistory: [...s.playerPickHistory, playerMove].slice(-20),
    }));
  };

  // Reveal effect
  useEffect(() => {
    if (!state.revealing) return;
    const timer = setTimeout(() => {
      setState((s) => resolveBall(s));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state.revealing]);

  // Maybe offer/trigger surprise event each ball
  useEffect(() => {
    if (state.phase !== "playing") return;
    if (state.activeEvent || state.pendingOffer) return;
    if (state.revealing) return;
    if (state.lastPlayerMove !== null) return;

    const bowler = state.batter === "player" ? state.cpu : state.player;
    const bowlerIsAR = bowler?.role === "All-Rounder";
    const offer = maybeTriggerEvent({ bowlerIsAllRounder: !!bowlerIsAR });
    if (offer) {
      const meta = EVENT_META[offer];
      if (meta.optIn) {
        setState((s) => ({ ...s, pendingOffer: offer }));
      } else {
        setState((s) => ({
          ...s,
          activeEvent: eventToActive(offer),
          commentary: [
            ...s.commentary,
            infoLine(`${meta.emoji} ${meta.label} activated! ${meta.description}`, "event"),
          ],
        }));
      }
    }
  }, [
    state.phase,
    state.ballsBowled,
    state.activeEvent,
    state.pendingOffer,
    state.revealing,
    state.lastPlayerMove,
  ]);

  // Sound — only wickets, end of innings/match
  useEffect(() => {
    if (state.revealing) return;
    if (state.ballEvent === "out") {
      playSound("wicket", state.soundOn);
    }
  }, [state.ballEvent, state.revealing, state.soundOn]);

  useEffect(() => {
    if (state.phase === "innings-break" || state.phase === "result") {
      playSound("innings", state.soundOn, 0.4);
    }
  }, [state.phase, state.soundOn]);

  // Player Yorker action — player can use once per over while bowling
  const useYorker = () => {
    if (state.batter === "player") return; // only when bowling
    if (state.player?.ability !== "yorker") return;
    if (state.playerAbility.yorkerUsedThisOver) return;
    setState((s) => ({
      ...s,
      playerAbility: { ...s.playerAbility, yorkerUsedThisOver: true, yorkerActive: true },
      commentary: [
        ...s.commentary,
        infoLine(`🎯 ${s.player?.name} bowls a ${s.player?.abilityLabel}! Batter restricted to 1–3.`, "event"),
      ],
    }));
  };

  const acceptRisk = () =>
    setState((s) => {
      const meta = EVENT_META["risk-play"];
      return {
        ...s,
        pendingOffer: null,
        activeEvent: { kind: "risk-play", ballsLeft: 1, accepted: true, favors: "batting" },
        commentary: [
          ...s.commentary,
          infoLine(`${meta.emoji} Risk Play accepted — high stakes!`, "event"),
        ],
      };
    });
  const declineRisk = () =>
    setState((s) => ({
      ...s,
      pendingOffer: null,
      commentary: [...s.commentary, infoLine("Risk Play declined. Safe choice.", "info")],
    }));

  const continueToInning2 = () =>
    setState((s) => ({
      ...s,
      phase: "playing",
      inning: 2,
      batter: s.batter === "player" ? "cpu" : "player",
      ballsBowled: 0,
      lastPlayerMove: null,
      lastCpuMove: null,
      ballEvent: null,
      activeEvent: null,
      pendingOffer: null,
      timeline: s.timeline, // keep history of inning 1 too — Timeline filters by inning
      playerAbility: { ...emptyAbility },
      cpuAbility: { ...emptyAbility },
      commentary: [
        ...s.commentary,
        infoLine(
          `Innings 2 begins. Target: ${s.target}. ${s.batter === "player" ? s.cpu?.name ?? "CPU" : s.player?.name ?? "You"} to chase.`,
        ),
      ],
    }));

  const playAgain = () => setState({ ...initialState, soundOn: state.soundOn });
  const toggleSound = () => setState((s) => ({ ...s, soundOn: !s.soundOn }));

  return (
    <main className="min-h-screen pb-6">
      {state.phase === "pickup" && <PickupScreen onPick={onPick} />}
      {state.phase === "versus" && state.player && state.cpu && (
        <VersusScreen player={state.player} cpu={state.cpu} onContinue={goToToss} />
      )}
      {state.phase === "toss" && state.player && state.cpu && (
        <TossScreen onChoose={chooseInnings} />
      )}
      {(state.phase === "playing" || state.phase === "innings-break") && (
        <>
          <Scoreboard state={state} onToggleSound={toggleSound} />
          <PlayingScreen
            state={state}
            onPlay={playBall}
            onContinue={continueToInning2}
            onUseYorker={useYorker}
          />
          <Timeline outcomes={state.timeline} inning={state.inning} />
          <Commentary lines={state.commentary} />
          {state.pendingOffer && (
            <EventOfferDialog
              kind={state.pendingOffer}
              onAccept={acceptRisk}
              onDecline={declineRisk}
            />
          )}
          <SuspenseOverlay active={state.revealing} />
        </>
      )}
      {state.phase === "result" && (
        <ResultScreen state={state} onPlayAgain={playAgain} />
      )}
    </main>
  );
}

function resolveBall(s: GameState): GameState {
  if (s.lastPlayerMove === null || s.lastCpuMove === null) {
    return { ...s, revealing: false };
  }
  const batterIsPlayer = s.batter === "player";
  const batterMove = batterIsPlayer ? s.lastPlayerMove : s.lastCpuMove;
  const bowlerMove = batterIsPlayer ? s.lastCpuMove : s.lastPlayerMove;
  const batter = batterIsPlayer ? s.player : s.cpu;
  const bowler = batterIsPlayer ? s.cpu : s.player;
  const batterName = batter?.name ?? (batterIsPlayer ? "You" : "CPU");
  const bowlerName = bowler?.name ?? (batterIsPlayer ? "CPU" : "You");

  const ev = s.activeEvent;
  let isOut = batterMove === bowlerMove;

  // Free hit: never out, runs forced to 0 if matched
  if (ev?.kind === "free-hit") isOut = false;
  // Powerplay: a '1' from bowler doesn't take wicket
  if (ev?.kind === "powerplay" && bowlerMove === 1 && isOut) isOut = false;

  // Compute runs/multiplier
  let runs = isOut ? 0 : batterMove;
  let multiplier = 1;
  let bonus = "";
  if (!isOut) {
    if (ev?.kind === "double-runs") multiplier = 2;
    else if (ev?.kind === "powerplay") multiplier = 1.5;
    else if (ev?.kind === "risk-play" && ev.accepted) multiplier = 3;
    else if (ev?.kind === "super-over" && batterMove === 6) multiplier = 2;

    runs = Math.floor(runs * multiplier);

    // Free hit on a "match" gives 0 runs (lucky escape)
    if (ev?.kind === "free-hit" && batterMove === bowlerMove) runs = 0;

    // Dot curse: odd batter move halves runs
    if (ev?.kind === "dot-curse" && batterMove % 2 === 1) {
      runs = Math.floor(runs / 2);
      bonus = "(cursed!)";
    }

    // Bonus boundary: +2 on 4 or 6
    if (ev?.kind === "bonus-boundary" && (batterMove === 4 || batterMove === 6)) {
      runs += 2;
      bonus = "+2 bonus!";
    }

    // Concentration ability — batter's
    const batterAbility = batterIsPlayer ? s.playerAbility : s.cpuAbility;
    if (
      batter?.ability === "concentration" &&
      batterAbility.concentrationArmed &&
      batterMove === 4
    ) {
      runs = 5;
      bonus = `${bonus} 🧠 +1 concentration!`.trim();
    }
  }

  let next: GameState = {
    ...s,
    revealing: false,
    ballsBowled: s.ballsBowled + 1,
  };

  // Wicket loss
  const wicketLoss = isOut ? (ev?.kind === "risk-play" && ev.accepted ? 2 : 1) : 0;

  let commentaryLine: CommentaryLine;
  if (isOut) {
    next.ballEvent = "out";
    if (batterIsPlayer) next.playerWickets = Math.min(3, s.playerWickets + wicketLoss);
    else next.cpuWickets = Math.min(3, s.cpuWickets + wicketLoss);
    commentaryLine = buildCommentary({ outcome: "out", runs: 0, batterName, bowlerName });
  } else {
    next.ballEvent = "run";
    if (batterIsPlayer) next.playerScore = s.playerScore + runs;
    else next.cpuScore = s.cpuScore + runs;
    commentaryLine = buildCommentary({
      outcome: "run",
      runs,
      batterName,
      bowlerName,
      multiplier: multiplier !== 1 ? multiplier : undefined,
      bonus: bonus || undefined,
    });
  }
  next.commentary = [...s.commentary, commentaryLine];

  // Update timeline
  const outcome: BallOutcome = isOut
    ? { label: "W", isWicket: true, runs: 0, inning: s.inning }
    : { label: String(runs), isWicket: false, runs, inning: s.inning };
  next.timeline = [...s.timeline, outcome];

  // Update ability state — concentration tracking on batter side
  const batterAbilityKey: "playerAbility" | "cpuAbility" = batterIsPlayer
    ? "playerAbility"
    : "cpuAbility";
  const currentBatterAbility = next[batterAbilityKey];
  let newBatterAbility: AbilityState = { ...currentBatterAbility };

  if (batter?.ability === "concentration") {
    if (isOut) {
      newBatterAbility.concentrationStreak = 0;
      newBatterAbility.concentrationArmed = false;
    } else {
      // consume armed boost
      if (newBatterAbility.concentrationArmed && batterMove === 4) {
        newBatterAbility.concentrationArmed = false;
        newBatterAbility.concentrationStreak = 0;
      } else {
        newBatterAbility.concentrationStreak += 1;
        if (newBatterAbility.concentrationStreak >= 3) {
          newBatterAbility.concentrationArmed = true;
        }
      }
    }
  }
  next[batterAbilityKey] = newBatterAbility;

  // Yorker active flag is consumed each ball
  next.playerAbility = { ...next.playerAbility, yorkerActive: false };
  next.cpuAbility = { ...next.cpuAbility, yorkerActive: false };

  // Reset yorker per-over flag at end of an over
  const overFinished = next.ballsBowled % 6 === 0;
  if (overFinished) {
    next.playerAbility = { ...next.playerAbility, yorkerUsedThisOver: false };
    next.cpuAbility = { ...next.cpuAbility, yorkerUsedThisOver: false };
  }

  // CPU yorker logic — auto-use if available and bowling, ~50% chance per over
  const cpuIsBowling = batterIsPlayer;
  if (
    cpuIsBowling &&
    s.cpu?.ability === "yorker" &&
    !next.cpuAbility.yorkerUsedThisOver &&
    next.ballsBowled % 6 >= 3 && // mid-over
    Math.random() < 0.5
  ) {
    next.cpuAbility = { ...next.cpuAbility, yorkerUsedThisOver: true, yorkerActive: true };
    next.commentary = [
      ...next.commentary,
      infoLine(
        `🎯 ${s.cpu?.name} winds up a ${s.cpu?.abilityLabel}! You'll be restricted to 1–3 next ball.`,
        "event",
      ),
    ];
  }

  // Decrement / clear active event
  if (next.activeEvent) {
    const left = next.activeEvent.ballsLeft - 1;
    next.activeEvent = left > 0 ? { ...next.activeEvent, ballsLeft: left } : null;
  }

  // Innings/match end checks
  const battingScore = batterIsPlayer ? next.playerScore : next.cpuScore;
  const battingWickets = batterIsPlayer ? next.playerWickets : next.cpuWickets;
  const allOut = battingWickets >= 3;
  const oversDone = next.ballsBowled >= next.oversPerInnings * 6;
  const targetChased = next.target !== null && battingScore >= next.target;

  if (next.inning === 1 && (allOut || oversDone)) {
    next.target = battingScore + 1;
    next.phase = "innings-break";
    next.commentary = [
      ...next.commentary,
      infoLine(
        `End of Innings 1. ${batterName}: ${battingScore}/${battingWickets}. Target: ${next.target}.`,
      ),
    ];
    return next;
  }

  if (next.inning === 2) {
    if (targetChased) {
      const winnerName = batterIsPlayer ? "You" : (s.cpu?.name ?? "CPU");
      const wicketsLeft = 3 - battingWickets;
      next.phase = "result";
      next.result = `${winnerName} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? "" : "s"}`;
      return next;
    }
    if (allOut || oversDone) {
      const targetVal = next.target ?? 0;
      const margin = targetVal - 1 - battingScore;
      const winnerIsPlayer = !batterIsPlayer;
      const winnerName = winnerIsPlayer ? "You" : (s.cpu?.name ?? "CPU");
      next.phase = "result";
      if (margin === 0) next.result = "Match Tied!";
      else next.result = `${winnerName} won by ${margin} run${margin === 1 ? "" : "s"}`;
      return next;
    }
  }

  return next;
}

/* ---------- Screens ---------- */

const HOW_TO_PLAY = [
  { icon: "✋", text: "Each ball, you and CPU pick a number 1–6. If they MATCH while you're batting → OUT." },
  { icon: "🏏", text: "Bat first or bowl first. 2–5 overs per innings, 3 wickets total." },
  { icon: "🧠", text: "The CPU LEARNS your patterns — mix up your picks to survive." },
  { icon: "⚡", text: "Random Surprise Events: Powerplay, Risk Play, Free Hit, Slog-Fest and more." },
  { icon: "✨", text: "Each character has a unique ability: Concentration, Yorker or Event-bias." },
  { icon: "🏆", text: "Highest score wins. Chase the target in innings 2 to lift the trophy." },
];

function PickupScreen({ onPick }: { onPick: (c: Character) => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-10 animate-fade-in">
      <header className="mb-5 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold tracking-widest text-primary">
          🏆 CHAMPIONSHIP
        </div>
        <h1 className="bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
          Hand Cricket
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick your champion. The CPU picks one of the rest — and learns how you play.
        </p>
      </header>

      {/* How to play */}
      <Card className="mb-6 border-2 border-primary/30 bg-card/70 p-4 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black tracking-widest text-primary">HOW TO PLAY</h2>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {HOW_TO_PLAY.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-snug">
              <span className="mt-0.5 text-base">{item.icon}</span>
              <span className="text-foreground/90">{item.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Roster grouped */}
      <h2 className="mb-3 flex items-center gap-2 text-sm font-black tracking-widest text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" /> CHOOSE YOUR CHAMPION
      </h2>
      <RosterSection title="Batsmen" filter={(c) => c.role === "Batsman"} onPick={onPick} />
      <RosterSection title="Batswomen" filter={(c) => c.role === "Batswoman"} onPick={onPick} />
      <RosterSection title="Bowlers" filter={(c) => c.role === "Bowler"} onPick={onPick} />
      <RosterSection title="Bowlerswomen" filter={(c) => c.role === "Bowlerwoman"} onPick={onPick} />
      <RosterSection title="All-Rounders" filter={(c) => c.role === "All-Rounder"} onPick={onPick} />
    </div>
  );
}

function RosterSection({
  title,
  filter,
  onPick,
}: {
  title: string;
  filter: (c: Character) => boolean;
  onPick: (c: Character) => void;
}) {
  const list = ROSTER.filter(filter);
  if (list.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="mb-1.5 text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
        {title.toUpperCase()}
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <CharacterCard key={c.id} character={c} onClick={() => onPick(c)} />
        ))}
      </div>
    </div>
  );
}

function VersusScreen({
  player,
  cpu,
  onContinue,
}: {
  player: Character;
  cpu: Character;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-8 animate-fade-in">
      <h2 className="mb-6 text-center text-xs font-bold tracking-[0.3em] text-muted-foreground">
        THE MATCH-UP
      </h2>

      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <PlayerVersusCard side="YOU" character={player} accent="primary" />
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-black text-accent-foreground shadow-lg animate-pop">
            VS
          </div>
        </div>
        <PlayerVersusCard side="CPU" character={cpu} accent="destructive" delay="0.15s" />
      </div>

      <div className="mt-8 text-center">
        <Button size="lg" onClick={onContinue} className="font-bold">
          <Swords className="mr-2 h-4 w-4" />
          To the Toss
        </Button>
      </div>
    </div>
  );
}

function PlayerVersusCard({
  side,
  character,
  accent,
  delay,
}: {
  side: string;
  character: Character;
  accent: "primary" | "destructive";
  delay?: string;
}) {
  const borderClass = accent === "primary" ? "border-primary/60" : "border-destructive/60";
  const labelClass = accent === "primary" ? "text-primary" : "text-destructive";
  const gradientClass =
    accent === "primary"
      ? "from-primary to-primary-glow"
      : "from-destructive to-accent";
  return (
    <Card
      className={`border-2 ${borderClass} bg-card/80 p-6 text-center animate-slide-up ${accent === "primary" ? "shadow-[var(--shadow-glow)]" : ""}`}
      style={delay ? { animationDelay: delay, animationFillMode: "backwards" } : undefined}
    >
      <div className={`mb-2 text-xs font-bold tracking-widest ${labelClass}`}>{side}</div>
      <div
        className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradientClass} text-4xl`}
      >
        {character.emoji}
      </div>
      <div className="text-lg font-black tracking-tight">{character.name}</div>
      <div className="text-xs text-muted-foreground">
        {character.country} · {character.role}
      </div>
      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-[10px] font-bold text-accent">
        <Sparkles className="h-3 w-3" />
        {character.abilityLabel}
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{character.abilityDesc}</div>
    </Card>
  );
}

function TossScreen({
  onChoose,
}: {
  onChoose: (c: "bat" | "bowl", overs: number) => void;
}) {
  const [overs, setOvers] = useState<number>(3);
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 animate-fade-in">
      <div className="mb-2 text-xs font-bold tracking-[0.3em] text-muted-foreground">
        YOU WON THE TOSS
      </div>
      <h2 className="mb-6 text-center text-3xl font-black tracking-tight">Bat or Bowl?</h2>

      <div className="mb-6 w-full">
        <div className="mb-2 text-center text-xs font-bold tracking-widest text-muted-foreground">
          OVERS PER INNINGS
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setOvers(n)}
              className={`rounded-xl border-2 py-2 text-sm font-black transition-all ${
                overs === n
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {overs * 6} balls per innings
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <button
          onClick={() => onChoose("bat", overs)}
          className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)]"
        >
          <span className="text-4xl">🏏</span>
          <span className="text-lg font-black">Bat First</span>
          <span className="text-xs text-muted-foreground">Set the target</span>
        </button>
        <button
          onClick={() => onChoose("bowl", overs)}
          className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)]"
        >
          <span className="text-4xl">🎯</span>
          <span className="text-lg font-black">Bowl First</span>
          <span className="text-xs text-muted-foreground">Defend the chase</span>
        </button>
      </div>
    </div>
  );
}

function PlayingScreen({
  state,
  onPlay,
  onContinue,
  onUseYorker,
}: {
  state: GameState;
  onPlay: (n: number) => void;
  onContinue: () => void;
  onUseYorker: () => void;
}) {
  const batterIsPlayer = state.batter === "player";
  const yourRole = batterIsPlayer ? "Batting" : "Bowling";
  const mode = batterIsPlayer ? "bat" : "bowl";

  const ev = state.activeEvent;
  const slogActiveForPlayer = ev?.kind === "slog-fest" && batterIsPlayer;
  const yorkerOnPlayer = state.cpuAbility.yorkerActive;

  // Allowed range
  const allowed = (n: number) => {
    if (slogActiveForPlayer && n < 4) return false;
    if (yorkerOnPlayer && n > 3) return false;
    return true;
  };

  const playerHasYorker =
    state.player?.ability === "yorker" &&
    !batterIsPlayer &&
    !state.playerAbility.yorkerUsedThisOver;

  const playerAbility = state.player?.ability;
  const showConcentration =
    playerAbility === "concentration" && batterIsPlayer;

  return (
    <div className="mx-auto max-w-2xl px-3 pt-2 animate-fade-in">
      {state.phase === "innings-break" ? (
        <InningsBreak state={state} onContinue={onContinue} />
      ) : (
        <>
          <div className="mb-1.5 flex items-center justify-center gap-2">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold tracking-widest">
              YOU ARE {yourRole.toUpperCase()}
            </span>
            {showConcentration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning">
                <Brain className="h-2.5 w-2.5" />
                {state.playerAbility.concentrationArmed
                  ? "READY ✨"
                  : `${state.playerAbility.concentrationStreak}/3`}
              </span>
            )}
            {playerHasYorker && (
              <button
                onClick={onUseYorker}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground hover:opacity-90 active:scale-95"
              >
                <Zap className="h-2.5 w-2.5" />
                {state.player?.abilityLabel}
              </button>
            )}
          </div>

          {/* Reveal area with inline event banner */}
          <div className="relative mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <RevealPanel label="YOU" move={state.lastPlayerMove} revealing={state.revealing} />
            <div className="flex h-8 items-center justify-center">
              {!state.revealing && state.ballEvent === "out" && (
                <div className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-black tracking-widest text-destructive-foreground animate-pop">
                  💥 OUT
                </div>
              )}
              {!state.revealing && state.ballEvent === "run" && state.lastPlayerMove !== null && (
                <RunBanner state={state} />
              )}
              {state.revealing && (
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground">…</div>
              )}
              {!state.revealing && state.ballEvent === null && (
                <div className="text-xs font-black tracking-widest text-muted-foreground">VS</div>
              )}
            </div>
            <RevealPanel label="CPU" move={state.lastCpuMove} revealing={state.revealing} />
          </div>

          {(slogActiveForPlayer || yorkerOnPlayer) && (
            <div className="mb-1.5 text-center text-[10px] font-bold text-warning">
              {slogActiveForPlayer && "SLOG-FEST: pick 4–6 only"}
              {yorkerOnPlayer && "YORKER incoming: pick 1–3 only"}
            </div>
          )}

          {/* Action pad — labels change for bat/bowl */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <NumberButton
                key={n}
                value={n}
                mode={mode}
                onClick={() => onPlay(n)}
                disabled={state.revealing || !!state.pendingOffer || !allowed(n)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RunBanner({ state }: { state: GameState }) {
  const batterIsPlayer = state.batter === "player";
  const move = batterIsPlayer ? state.lastPlayerMove : state.lastCpuMove;
  if (move === null) return null;
  const ev = state.activeEvent;
  let multiplier = 1;
  if (ev?.kind === "double-runs") multiplier = 2;
  else if (ev?.kind === "powerplay") multiplier = 1.5;
  else if (ev?.kind === "risk-play" && ev.accepted) multiplier = 3;
  const runs = Math.floor(move * multiplier);
  return (
    <div className="rounded-full bg-success px-2.5 py-1 text-[11px] font-black tracking-widest text-success-foreground animate-pop whitespace-nowrap">
      +{runs}
      {multiplier !== 1 && <span className="ml-0.5 text-warning-foreground">×{multiplier}</span>}
    </div>
  );
}

function RevealPanel({
  label,
  move,
  revealing,
}: {
  label: string;
  move: number | null;
  revealing: boolean;
}) {
  return (
    <Card className="flex flex-col items-center gap-1 border-2 bg-card/60 p-2">
      <div className="text-[9px] font-bold tracking-widest text-muted-foreground">{label}</div>
      <HandIcon
        value={revealing ? null : move}
        hidden={revealing}
        shaking={revealing}
        className="h-12 w-12"
      />
    </Card>
  );
}

function InningsBreak({
  state,
  onContinue,
}: {
  state: GameState;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-6 text-center animate-fade-in">
      <div className="mb-2 text-xs font-bold tracking-[0.3em] text-muted-foreground">
        END OF INNINGS 1
      </div>
      <h3 className="mb-4 text-3xl font-black tracking-tight">Innings Break</h3>
      <Card className="mb-4 border-2 border-primary/60 bg-card/80 p-5">
        <div className="text-xs text-muted-foreground">TARGET TO CHASE</div>
        <div className="my-1 bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-5xl font-black text-transparent">
          {state.target}
        </div>
        <div className="text-sm text-muted-foreground">
          Need {state.target} run{state.target === 1 ? "" : "s"} in {state.oversPerInnings} overs · 3 wickets
        </div>
      </Card>
      <Button size="lg" onClick={onContinue} className="w-full font-bold">
        Start Innings 2
      </Button>
    </div>
  );
}

function ResultScreen({
  state,
  onPlayAgain,
}: {
  state: GameState;
  onPlayAgain: () => void;
}) {
  const youWon = state.result?.startsWith("You");
  const tied = state.result?.startsWith("Match");
  return (
    <div className="mx-auto flex min-h-[90vh] max-w-md flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div
        className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
          tied
            ? "bg-warning text-warning-foreground"
            : youWon
              ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]"
              : "bg-destructive text-destructive-foreground"
        } animate-pop`}
      >
        <Trophy className="h-10 w-10" />
      </div>
      <div className="mb-1 text-xs font-bold tracking-[0.3em] text-muted-foreground">
        {tied ? "ALL SQUARE" : youWon ? "VICTORY" : "DEFEAT"}
      </div>
      <h2 className="mb-6 text-3xl font-black tracking-tight">{state.result}</h2>

      <Card className="mb-6 w-full border-2 bg-card/80 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">{state.player?.name}</div>
            <div className="text-2xl font-black">
              {state.playerScore}
              <span className="text-base text-muted-foreground">/{state.playerWickets}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{state.cpu?.name}</div>
            <div className="text-2xl font-black">
              {state.cpuScore}
              <span className="text-base text-muted-foreground">/{state.cpuWickets}</span>
            </div>
          </div>
        </div>
      </Card>

      <Button size="lg" onClick={onPlayAgain} className="w-full font-bold">
        <RotateCcw className="mr-2 h-4 w-4" />
        Play Again
      </Button>
    </div>
  );
}
