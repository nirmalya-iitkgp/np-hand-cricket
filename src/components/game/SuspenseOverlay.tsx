import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

/** Animated suspense overlay shown during the 1s reveal window. */
export function SuspenseOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "inline-block h-3 w-3 rounded-full bg-primary",
                "animate-pop",
              )}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.6s",
                animationIterationCount: "infinite",
              }}
            />
          ))}
        </div>
        <div className="inline-flex items-center gap-2 font-display text-3xl tracking-[0.4em] text-primary animate-pulse">
          <Eye className="h-6 w-6" strokeWidth={2.5} />
          REVEAL
        </div>
      </div>
    </div>
  );
}
