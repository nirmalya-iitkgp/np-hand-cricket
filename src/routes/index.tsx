import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ROSTER,
  type Character,
  type GameState,
  type CommentaryLine,
  type SurpriseEventKind,
} from "@/game/types";
import { CharacterCard } from "@/components/game/CharacterCard";
import { Scoreboard } from "@/components/game/Scoreboard";
import { HandIcon, NumberButton } from "@/components/game/HandIcon";
import { Commentary } from "@/components/game/Commentary";
import { EventOfferDialog } from "@/components/game/EventBanner";
import { SuspenseOverlay } from "@/components/game/SuspenseOverlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Swords, RotateCcw } from "lucide-react";
import { buildCommentary, infoLine } from "@/game/commentary";
import { EVENT_META, eventToActive, maybeTriggerEvent } from "@/game/events";
import { playSound } from "@/game/sounds";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Championship Hand Cricket — Human vs CPU" },
      {
        name: "description",
        content:
          "Play Hand Cricket vs the CPU. Pick a champion, set overs, trigger surprise events, with sound, suspense and live commentary.",
      },
      { property: "og:title", content: "Championship Hand Cricket" },
      {
        property: "og:description",
        content: "Pick a champion. Bat or bowl. Surprise events, commentary, win the match.",
      },
    ],
  }),
});

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
      commentary: [
        infoLine(`Match begins! ${overs} overs per innings.`),
        infoLine(
          `${batter === "player" ? s.player?.name ?? "You" : s.cpu?.name ?? "CPU"} to bat first.`,
        ),
      ],
    }));
  };

  const playBall = (playerMove: number) => {
    if (state.revealing || state.phase !== "playing" || state.pendingOffer) return;
    const cpuMove = 1 + randInt(6);
    playSound("whoosh", state.soundOn, 0.3);
    setState((s) => ({
      ...s,
      lastPlayerMove: playerMove,
      lastCpuMove: cpuMove,
      revealing: true,
      ballEvent: null,
    }));
  };

  // Reveal effect: when both moves locked, wait then resolve
  useEffect(() => {
    if (!state.revealing) return;
    const timer = setTimeout(() => {
      setState((s) => resolveBall(s));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state.revealing]);

  // Maybe offer an event each ball when nothing active and no pending
  useEffect(() => {
    if (state.phase !== "playing") return;
    if (state.activeEvent || state.pendingOffer) return;
    if (state.revealing) return;
    if (state.lastPlayerMove !== null) return; // mid-ball
    const offer = maybeTriggerEvent();
    if (offer) {
      if (offer === "risk-play") {
        setState((s) => ({ ...s, pendingOffer: offer }));
      } else {
        // auto-activate
        const meta = EVENT_META[offer];
        setState((s) => ({
          ...s,
          activeEvent: eventToActive(offer),
          commentary: [
            ...s.commentary,
            infoLine(`${meta.emoji} ${meta.label} activated! ${meta.description}`, "event"),
          ],
        }));
        playSound("cheer", state.soundOn, 0.4);
      }
    }
  }, [state.phase, state.ballsBowled, state.activeEvent, state.pendingOffer, state.revealing, state.lastPlayerMove, state.soundOn]);

  // Side-effect sounds when ballEvent settles
  useEffect(() => {
    if (state.revealing) return;
    if (state.ballEvent === "out") {
      playSound("wicket", state.soundOn);
    } else if (state.ballEvent === "run") {
      const runs =
        state.batter === "player" ? state.lastPlayerMove : state.lastCpuMove;
      if (runs === 6) playSound("six", state.soundOn);
      else if (runs === 4) playSound("four", state.soundOn);
      else playSound("bat", state.soundOn, 0.4);
    }
  }, [state.ballEvent, state.revealing]);

  const acceptRisk = () =>
    setState((s) => {
      const meta = EVENT_META["risk-play"];
      return {
        ...s,
        pendingOffer: null,
        activeEvent: { kind: "risk-play", ballsLeft: 1, accepted: true },
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
    <main className="min-h-screen pb-12">
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
          <Commentary lines={state.commentary} />
          <PlayingScreen
            state={state}
            onPlay={playBall}
            onContinue={continueToInning2}
          />
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
  const batterName = batterIsPlayer ? s.player?.name ?? "You" : s.cpu?.name ?? "CPU";
  const bowlerName = batterIsPlayer ? s.cpu?.name ?? "CPU" : s.player?.name ?? "You";

  const ev = s.activeEvent;
  let isOut = batterMove === bowlerMove;

  // Free hit: never out, runs forced to 0 if matched
  if (ev?.kind === "free-hit") {
    isOut = false;
  }
  // Powerplay: a '1' from bowler doesn't take wicket
  if (ev?.kind === "powerplay" && bowlerMove === 1 && isOut) {
    isOut = false;
  }

  // Compute runs/multiplier
  let runs = isOut ? 0 : batterMove;
  let multiplier = 1;
  if (!isOut) {
    if (ev?.kind === "double-runs") multiplier = 2;
    else if (ev?.kind === "powerplay") multiplier = 1.5;
    else if (ev?.kind === "risk-play" && ev.accepted) multiplier = 3;
    runs = Math.floor(runs * multiplier);
    // Free hit on a "match" gives 0 runs (lucky escape)
    if (ev?.kind === "free-hit" && batterMove === bowlerMove) runs = 0;
  }

  let next: GameState = {
    ...s,
    revealing: false,
    ballsBowled: s.ballsBowled + 1,
  };

  // Wicket loss (risk-play accepted = lose 2 wickets on out)
  const wicketLoss = isOut
    ? ev?.kind === "risk-play" && ev.accepted
      ? 2
      : 1
    : 0;

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
    });
  }
  next.commentary = [...s.commentary, commentaryLine];

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

function PickupScreen({ onPick }: { onPick: (c: Character) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-8 animate-fade-in">
      <header className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold tracking-widest text-primary">
          🏆 CHAMPIONSHIP
        </div>
        <h1 className="bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
          Hand Cricket
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Pick your champion. The CPU picks one of the rest.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROSTER.map((c) => (
          <CharacterCard key={c.id} character={c} onClick={() => onPick(c)} />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        2 Innings · 3 Wickets · Configurable Overs · Surprise Events
      </p>
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
        <Card className="border-2 border-primary/60 bg-card/80 p-6 text-center shadow-[var(--shadow-glow)] animate-slide-up">
          <div className="mb-2 text-xs font-bold tracking-widest text-primary">YOU</div>
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-4xl">
            {player.emoji}
          </div>
          <div className="text-lg font-black tracking-tight">{player.name}</div>
          <div className="text-xs text-muted-foreground">
            {player.country} · {player.role}
          </div>
        </Card>

        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-black text-accent-foreground shadow-lg animate-pop">
            VS
          </div>
        </div>

        <Card
          className="border-2 border-destructive/60 bg-card/80 p-6 text-center animate-slide-up"
          style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
        >
          <div className="mb-2 text-xs font-bold tracking-widest text-destructive">CPU</div>
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-destructive to-accent text-4xl">
            {cpu.emoji}
          </div>
          <div className="text-lg font-black tracking-tight">{cpu.name}</div>
          <div className="text-xs text-muted-foreground">
            {cpu.country} · {cpu.role}
          </div>
        </Card>
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
      <h2 className="mb-6 text-center text-3xl font-black tracking-tight">
        Bat or Bowl?
      </h2>

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
}: {
  state: GameState;
  onPlay: (n: number) => void;
  onContinue: () => void;
}) {
  const batterIsPlayer = state.batter === "player";
  const yourRole = batterIsPlayer ? "Batting" : "Bowling";
  const tip = batterIsPlayer
    ? "Pick a number to score runs. Match the bowler's — you're OUT."
    : "Pick a number to bowl. Match the batter's — WICKET!";

  return (
    <div className="mx-auto max-w-2xl px-3 pt-2 animate-fade-in">
      {state.phase === "innings-break" ? (
        <InningsBreak state={state} onContinue={onContinue} />
      ) : (
        <>
          <div className="mb-2 flex items-center justify-center gap-2 text-center">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold tracking-widest">
              {yourRole.toUpperCase()}
            </span>
            <span className="hidden sm:inline text-[10px] text-muted-foreground">{tip}</span>
          </div>

          {/* Reveal area with inline event banner */}
          <div className="relative mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <RevealPanel
              label="YOU"
              move={state.lastPlayerMove}
              revealing={state.revealing}
            />
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
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground">
                  …
                </div>
              )}
              {!state.revealing && state.ballEvent === null && (
                <div className="text-xs font-black tracking-widest text-muted-foreground">VS</div>
              )}
            </div>
            <RevealPanel
              label="CPU"
              move={state.lastCpuMove}
              revealing={state.revealing}
            />
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <NumberButton
                key={n}
                value={n}
                onClick={() => onPlay(n)}
                disabled={state.revealing || !!state.pendingOffer}
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
      <div className="text-[9px] font-bold tracking-widest text-muted-foreground">
        {label}
      </div>
      <HandIcon
        value={revealing ? null : move}
        hidden={revealing}
        shaking={revealing}
        className="h-14 w-14"
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
    <div className="mx-auto max-w-md py-8 text-center animate-fade-in">
      <div className="mb-2 text-xs font-bold tracking-[0.3em] text-muted-foreground">
        END OF INNINGS 1
      </div>
      <h3 className="mb-6 text-3xl font-black tracking-tight">Innings Break</h3>
      <Card className="mb-6 border-2 border-primary/60 bg-card/80 p-6">
        <div className="text-xs text-muted-foreground">TARGET TO CHASE</div>
        <div className="my-2 bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-6xl font-black text-transparent">
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
