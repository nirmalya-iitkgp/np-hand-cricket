import type { ActiveEvent, SurpriseEventKind } from "@/game/types";
import { EVENT_META } from "@/game/events";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActiveEventBadge({ event }: { event: ActiveEvent }) {
  const meta = EVENT_META[event.kind];
  const colorClass =
    meta.color === "primary"
      ? "bg-primary/20 text-primary border-primary/50"
      : meta.color === "warning"
        ? "bg-warning/20 text-warning border-warning/50"
        : meta.color === "destructive"
          ? "bg-destructive/20 text-destructive border-destructive/50"
          : "bg-accent/20 text-accent-foreground border-accent/50";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-wide animate-pop",
        colorClass,
      )}
    >
      <span className="text-base">{meta.emoji}</span>
      <span>{meta.label.toUpperCase()}</span>
      {event.kind === "powerplay" && (
        <span className="rounded-full bg-background/40 px-1.5 py-0.5 text-[10px]">
          {event.ballsLeft} ball{event.ballsLeft === 1 ? "" : "s"} left
        </span>
      )}
    </div>
  );
}

export function EventOfferDialog({
  kind,
  onAccept,
  onDecline,
}: {
  kind: SurpriseEventKind;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const meta = EVENT_META[kind];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-sm rounded-2xl border-2 border-accent bg-card p-6 text-center shadow-[var(--shadow-glow)] animate-pop">
        <div className="mb-3 text-5xl">{meta.emoji}</div>
        <div className="mb-1 text-xs font-bold tracking-[0.3em] text-accent">
          SURPRISE EVENT
        </div>
        <h3 className="mb-2 text-2xl font-black">{meta.label}</h3>
        <p className="mb-5 text-sm text-muted-foreground">{meta.description}</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onDecline}>
            Pass
          </Button>
          <Button onClick={onAccept} className="font-bold">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
