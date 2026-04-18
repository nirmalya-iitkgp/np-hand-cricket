import type { CommentaryLine } from "@/game/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Mic } from "lucide-react";

export function Commentary({ lines }: { lines: CommentaryLine[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [lines]);

  const recent = lines.slice(-8).reverse();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-3">
      <div className="rounded-xl border border-border bg-card/60 p-3 backdrop-blur">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground">
          <Mic className="h-3 w-3" />
          COMMENTARY
        </div>
        <div
          ref={scrollRef}
          className="max-h-32 space-y-1.5 overflow-y-auto pr-1 text-sm"
          aria-live="polite"
        >
          {recent.length === 0 && (
            <p className="text-xs italic text-muted-foreground">
              Match yet to begin…
            </p>
          )}
          {recent.map((l, idx) => (
            <p
              key={l.id}
              className={cn(
                "leading-snug",
                idx === 0 && "animate-fade-in font-semibold",
                l.kind === "six" && "text-primary",
                l.kind === "boundary" && "text-primary-glow",
                l.kind === "wicket" && "text-destructive",
                l.kind === "event" && "text-warning",
                l.kind === "info" && "text-muted-foreground italic text-xs",
                idx > 0 && "opacity-70",
              )}
            >
              {l.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
