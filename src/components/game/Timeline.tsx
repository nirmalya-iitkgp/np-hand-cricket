import type { BallOutcome } from "@/game/types";
import { cn } from "@/lib/utils";

/** Shows the last 6 balls of the current innings as colored chips. */
export function Timeline({ outcomes, inning }: { outcomes: BallOutcome[]; inning: 1 | 2 }) {
  const last6 = outcomes.filter((o) => o.inning === inning).slice(-6);
  // pad to 6 slots so layout is stable
  const slots: (BallOutcome | null)[] = [...last6];
  while (slots.length < 6) slots.push(null);

  return (
    <div className="mx-auto max-w-2xl px-3 pt-1.5">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-1.5 backdrop-blur">
        <span className="text-[9px] font-bold tracking-widest text-muted-foreground">
          LAST 6
        </span>
        <div className="flex flex-1 items-center justify-end gap-1">
          {slots.map((o, i) => (
            <div
              key={i}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-black",
                o === null && "border-border/50 bg-secondary/30 text-muted-foreground/50",
                o?.isWicket && "border-destructive bg-destructive text-destructive-foreground animate-pop",
                o && !o.isWicket && o.runs === 0 && "border-muted bg-muted text-muted-foreground",
                o && !o.isWicket && o.runs >= 1 && o.runs <= 3 && "border-primary/50 bg-primary/15 text-primary",
                o && !o.isWicket && o.runs === 4 && "border-primary bg-primary text-primary-foreground",
                o && !o.isWicket && o.runs >= 5 && "border-warning bg-warning text-warning-foreground",
              )}
            >
              {o === null ? "·" : o.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
