import type { GameState } from "@/game/types";
import { Heart, HeartCrack, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { state: GameState };

function Wickets({ lost }: { lost: number }) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => {
        const isLost = i < lost;
        return isLost ? (
          <HeartCrack key={i} className="h-4 w-4 text-destructive" />
        ) : (
          <Heart key={i} className="h-4 w-4 fill-success text-success" />
        );
      })}
    </div>
  );
}

export function Scoreboard({ state }: Props) {
  if (!state.player || !state.cpu) return null;
  const battingPlayer = state.batter === "player";
  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary">
            Innings {state.inning}
          </span>
          {state.target !== null && (
            <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 font-semibold text-accent-foreground">
              <Target className="h-3 w-3" />
              Target: {state.target}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TeamPanel
            name={state.player.name}
            score={state.playerScore}
            wickets={state.playerWickets}
            batting={battingPlayer}
            label="YOU"
          />
          <TeamPanel
            name={state.cpu.name}
            score={state.cpuScore}
            wickets={state.cpuWickets}
            batting={!battingPlayer}
            label="CPU"
          />
        </div>
      </div>
    </div>
  );
}

function TeamPanel({
  name,
  score,
  wickets,
  batting,
  label,
}: {
  name: string;
  score: number;
  wickets: number;
  batting: boolean;
  label: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2 transition-all",
        batting
          ? "border-primary/60 bg-primary/10"
          : "border-border bg-card/50",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
          {label}
        </span>
        {batting && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
            BAT
          </span>
        )}
      </div>
      <div className="mt-0.5 truncate text-xs font-semibold">{name}</div>
      <div className="mt-1 flex items-end justify-between">
        <div className="text-2xl font-black leading-none tracking-tight">
          {score}
          <span className="text-sm font-bold text-muted-foreground">
            /{wickets}
          </span>
        </div>
        <Wickets lost={wickets} />
      </div>
    </div>
  );
}
