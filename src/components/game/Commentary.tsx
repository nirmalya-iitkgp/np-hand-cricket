import type { CommentaryLine } from "@/game/types";
import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";
import { useEffect, useRef } from "react";

/** Full match log with auto-scroll to the latest line. */
export function Commentary({ lines }: { lines: CommentaryLine[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines.length]);

  const display = lines.length > 0 ? lines : null;

  return (
    <div className="mx-auto max-w-2xl px-3 pt-1.5">
      <div className="rounded-lg border border-border bg-card/60 backdrop-blur">
        <div className="flex items-center gap-1.5 border-b border-border/50 px-2.5 py-1">
          <Mic className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-bold tracking-widest text-muted-foreground">
            LIVE COMMENTARY
          </span>
        </div>
        <div
          ref={ref}
          className="max-h-24 overflow-y-auto px-2.5 py-1.5 text-xs leading-snug"
          aria-live="polite"
        >
          {display ? (
            display.map((l) => (
              <p
                key={l.id}
                className={cn(
                  "py-0.5",
                  l.kind === "six" && "font-bold text-primary",
                  l.kind === "boundary" && "font-semibold text-primary-glow",
                  l.kind === "wicket" && "font-bold text-destructive",
                  l.kind === "event" && "font-semibold text-warning",
                  l.kind === "run" && "text-foreground",
                  l.kind === "info" && "italic text-muted-foreground",
                )}
              >
                {l.text}
              </p>
            ))
          ) : (
            <p className="italic text-muted-foreground">Match yet to begin…</p>
          )}
        </div>
      </div>
    </div>
  );
}
