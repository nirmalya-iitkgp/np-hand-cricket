import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ROSTER, type Character, type GameState } from "@/game/types";
import { CharacterCard } from "@/components/game/CharacterCard";
import { Scoreboard } from "@/components/game/Scoreboard";
import { HandIcon, NumberButton } from "@/components/game/HandIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Swords, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Championship Hand Cricket — Human vs CPU" },
      {
        name: "description",
        content:
          "Play Hand Cricket vs the CPU. Pick your champion, choose to bat or bowl, and chase the target across 2 innings with 3 wickets.",
      },
      { property: "og:title", content: "Championship Hand Cricket" },
      {
        property: "og:description",
        content: "Pick a champion. Bat or bowl. Win the match.",
      },
    ],
  }),
});

const initialState: GameState = {
  phase: "pickup",
  player: null,
  cpu: null,
  inning: 1,
  batter: "player",
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
};

function randInt(max: number) {
  return Math.floor(Math.random() * max);
}

function Index() {
  const [state, setState] = useState<GameState>(initialState);

  // Pickup → Versus
  const onPick = (char: Character) => {
    const opponents = ROSTER.filter((c) => c.id !== char.id);
    const cpu = opponents[randInt(opponents.length)];
    setState({ ...initialState, player: char, cpu, phase: "versus" });
  };

  // Versus → Toss
  const goToToss = () => setState((s) => ({ ...s, phase: "toss" }));

  // Toss choice → Playing
  const chooseInnings = (firstChoice: "bat" | "bowl") => {
    setState((s) => ({
      ...s,
      phase: "playing",
      inning: 1,
      batter: firstChoice === "bat" ? "player" : "cpu",
      playerScore: 0,
      playerWickets: 0,
      cpuScore: 0,
      cpuWickets: 0,
      target: null,
      lastPlayerMove: null,
      lastCpuMove: null,
      ballEvent: null,
      result: null,
    }));
  };

  const playBall = (playerMove: number) => {
    if (state.revealing || state.phase !== "playing") return;
    const cpuMove = 1 + randInt(6);
    setState((s) => ({
      ...s,
      lastPlayerMove: playerMove,
      lastCpuMove: cpuMove,
      revealing: true,
      ballEvent: null,
    }));
  };

  // Reveal effect: when both moves locked, wait 1s then resolve
  useEffect(() => {
    if (!state.revealing) return;
    const timer = setTimeout(() => {
      setState((s) => resolveBall(s));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state.revealing]);

  const playAgain = () => setState(initialState);

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
          <Scoreboard state={state} />
          <PlayingScreen state={state} onPlay={playBall} onContinue={() => continueToInning2(setState)} />
        </>
      )}
      {state.phase === "result" && (
        <ResultScreen state={state} onPlayAgain={playAgain} />
      )}
    </main>
  );
}

function continueToInning2(setState: React.Dispatch<React.SetStateAction<GameState>>) {
  setState((s) => ({
    ...s,
    phase: "playing",
    inning: 2,
    batter: s.batter === "player" ? "cpu" : "player",
    lastPlayerMove: null,
    lastCpuMove: null,
    ballEvent: null,
  }));
}

function resolveBall(s: GameState): GameState {
  if (s.lastPlayerMove === null || s.lastCpuMove === null) {
    return { ...s, revealing: false };
  }
  const batterIsPlayer = s.batter === "player";
  const batterMove = batterIsPlayer ? s.lastPlayerMove : s.lastCpuMove;
  const bowlerMove = batterIsPlayer ? s.lastCpuMove : s.lastPlayerMove;
  const isOut = batterMove === bowlerMove;

  let next: GameState = { ...s, revealing: false };

  if (isOut) {
    next.ballEvent = "out";
    if (batterIsPlayer) {
      next.playerWickets = s.playerWickets + 1;
    } else {
      next.cpuWickets = s.cpuWickets + 1;
    }
  } else {
    next.ballEvent = "run";
    if (batterIsPlayer) {
      next.playerScore = s.playerScore + batterMove;
    } else {
      next.cpuScore = s.cpuScore + batterMove;
    }
  }

  // Check innings/match end
  const battingScore = batterIsPlayer ? next.playerScore : next.cpuScore;
  const battingWickets = batterIsPlayer ? next.playerWickets : next.cpuWickets;
  const allOut = battingWickets >= 3;
  const targetChased = next.target !== null && battingScore >= next.target;

  if (next.inning === 1 && allOut) {
    // End innings 1
    next.target = battingScore + 1;
    next.phase = "innings-break";
    return next;
  }

  if (next.inning === 2) {
    if (targetChased) {
      // Batting side wins
      const winnerName = batterIsPlayer ? "You" : (s.cpu?.name ?? "CPU");
      const wicketsLeft = 3 - battingWickets;
      next.phase = "result";
      next.result = `${winnerName} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? "" : "s"}`;
      return next;
    }
    if (allOut) {
      // Bowling side wins (defended target)
      const targetVal = next.target ?? 0;
      const margin = targetVal - 1 - battingScore;
      const winnerIsPlayer = !batterIsPlayer;
      const winnerName = winnerIsPlayer ? "You" : (s.cpu?.name ?? "CPU");
      next.phase = "result";
      if (margin === 0) {
        next.result = "Match Tied!";
      } else {
        next.result = `${winnerName} won by ${margin} run${margin === 1 ? "" : "s"}`;
      }
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
        2 Innings · 3 Wickets · Match the bowler's number and you're OUT
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

function TossScreen({ onChoose }: { onChoose: (c: "bat" | "bowl") => void }) {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 animate-fade-in">
      <div className="mb-2 text-xs font-bold tracking-[0.3em] text-muted-foreground">
        YOU WON THE TOSS
      </div>
      <h2 className="mb-8 text-center text-3xl font-black tracking-tight">
        Bat or Bowl?
      </h2>
      <div className="grid w-full grid-cols-2 gap-4">
        <button
          onClick={() => onChoose("bat")}
          className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)]"
        >
          <span className="text-4xl">🏏</span>
          <span className="text-lg font-black">Bat First</span>
          <span className="text-xs text-muted-foreground">Set the target</span>
        </button>
        <button
          onClick={() => onChoose("bowl")}
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
    ? "Pick a number to score runs. If it matches the bowler's — you're OUT."
    : "Pick a number to bowl. If it matches the batter's — WICKET!";

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 animate-fade-in">
      {state.phase === "innings-break" ? (
        <InningsBreak state={state} onContinue={onContinue} />
      ) : (
        <>
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold tracking-widest">
              YOU ARE {yourRole.toUpperCase()}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{tip}</p>
          </div>

          {/* Reveal area */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <RevealPanel
              label="YOU"
              move={state.lastPlayerMove}
              revealing={state.revealing}
            />
            <RevealPanel
              label="CPU"
              move={state.lastCpuMove}
              revealing={state.revealing}
            />
          </div>

          {/* Event banner */}
          <div className="mb-6 flex h-10 items-center justify-center">
            {!state.revealing && state.ballEvent === "out" && (
              <div className="rounded-full bg-destructive px-4 py-1.5 text-sm font-black tracking-widest text-destructive-foreground animate-pop">
                💥 OUT!
              </div>
            )}
            {!state.revealing && state.ballEvent === "run" && state.lastPlayerMove !== null && (
              <div className="rounded-full bg-success px-4 py-1.5 text-sm font-black tracking-widest text-success-foreground animate-pop">
                +{batterIsPlayer ? state.lastPlayerMove : state.lastCpuMove} RUN
                {(batterIsPlayer ? state.lastPlayerMove : state.lastCpuMove) === 1 ? "" : "S"}
              </div>
            )}
            {state.revealing && (
              <div className="text-sm font-bold tracking-widest text-muted-foreground">
                REVEALING…
              </div>
            )}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <NumberButton
                key={n}
                value={n}
                onClick={() => onPlay(n)}
                disabled={state.revealing}
              />
            ))}
          </div>
        </>
      )}
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
    <Card className="flex flex-col items-center gap-2 border-2 bg-card/60 p-4">
      <div className="text-[10px] font-bold tracking-widest text-muted-foreground">
        {label}
      </div>
      <HandIcon
        value={revealing ? null : move}
        hidden={revealing}
        shaking={revealing}
        className="h-20 w-20"
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
          Need {state.target} run{state.target === 1 ? "" : "s"} in 3 wickets
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
