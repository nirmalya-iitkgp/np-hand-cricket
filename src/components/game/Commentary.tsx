import type { CommentaryLine } from "@/game/types";
import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";

export function Commentary({ lines }: { lines: CommentaryLine[] }) {
  const latest = lines[lines.length - 1];

  return (
    <div className="mx-auto max-w-2xl px-3 pt-1.5">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2.5 py-1.5 backdrop-blur">
        <Mic className="h-3 w-3 shrink-0 text-muted-foreground" />
        <p
          key={latest?.id}
          className={cn(
            "min-w-0 flex-1 truncate text-xs leading-tight animate-fade-in",
            !latest && "italic text-muted-foreground",
            latest?.kind === "six" && "font-bold text-primary",
            latest?.kind === "boundary" && "font-semibold text-primary-glow",
            latest?.kind === "wicket" && "font-bold text-destructive",
            latest?.kind === "event" && "font-semibold text-warning",
            latest?.kind === "run" && "text-foreground",
            latest?.kind === "info" && "italic text-muted-foreground",
          )}
          aria-live="polite"
        >
          {latest?.text ?? "Match yet to begin…"}
        </p>
      </div>
    </div>
  );
}
