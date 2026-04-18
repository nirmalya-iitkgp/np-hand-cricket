import type { GameState } from "@/game/types";
import { Heart, HeartCrack, Target, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveEventBadge } from "./EventBanner";

type Props = {
  state: GameState;
  onToggleSound?: () => void;
};

function Wickets({ lost }: { lost: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => {
        const isLost = i < lost;
        return isLost ? (
          <HeartCrack key={i} className="h-3 w-3 text-destructive" />
        ) : (
          <Heart key={i} className="h-3 w-3 fill-success text-success" />
        );
      })}
    </div>
  );
}

export function Scoreboard({ state, onToggleSound }: Props) {
  if (!state.player || !state.cpu) return null;
  const battingPlayer = state.batter === "player";
  const totalBalls = state.oversPerInnings * 6;
  const ballsLeft = Math.max(0, totalBalls - state.ballsBowled);
  const oversDisplay = `${Math.floor(state.ballsBowled / 6)}.${state.ballsBowled % 6}`;
  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-2xl px-3 py-1.5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-semibold text-primary">
              Inn {state.inning}
            </span>
            <span className="rounded-full bg-secondary px-1.5 py-0.5 font-semibold">
              {oversDisplay}/{state.oversPerInnings}ov
            </span>
            <span className="rounded-full bg-secondary/60 px-1.5 py-0.5 font-semibold">
              {ballsLeft}b left
            </span>
            {state.target !== null && (
              <span className="flex items-center gap-1 rounded-full bg-accent/20 px-1.5 py-0.5 font-semibold text-accent-foreground">
                <Target className="h-2.5 w-2.5" />
                T:{state.target}
              </span>
            )}
            {state.activeEvent && <ActiveEventBadge event={state.activeEvent} />}
          </div>
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="rounded-full p-0.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Toggle sound"
            >
              {state.soundOn ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
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
        "flex items-center justify-between gap-2 rounded-md border px-2 py-1 transition-all",
        batting
          ? "border-primary/60 bg-primary/10"
          : "border-border bg-card/50",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold tracking-widest text-muted-foreground">
            {label}
          </span>
          {batting && (
            <span className="rounded-full bg-primary px-1 py-0 text-[8px] font-bold text-primary-foreground">
              BAT
            </span>
          )}
        </div>
        <div className="truncate text-[11px] font-semibold leading-tight">{name}</div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-lg font-black leading-none tracking-tight">
          {score}
          <span className="text-xs font-bold text-muted-foreground">/{wickets}</span>
        </div>
        <Wickets lost={wickets} />
      </div>
    </div>
  );
}
