import type { Character } from "@/game/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type Props = {
  character: Character;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
};

const ROLE_BADGE: Record<string, string> = {
  Batsman: "bg-primary/15 text-primary",
  Batswoman: "bg-primary/15 text-primary",
  Bowler: "bg-destructive/15 text-destructive",
  Bowlerwoman: "bg-destructive/15 text-destructive",
  "All-Rounder": "bg-warning/15 text-warning",
};

export function CharacterCard({ character, selected, onClick, compact }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full text-left transition-all duration-200",
        onClick && "hover:scale-[1.02] active:scale-[0.98]",
      )}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-2 p-3 transition-all",
          "bg-card/80 backdrop-blur",
          selected
            ? "border-primary shadow-[var(--shadow-glow)]"
            : "border-border hover:border-primary/60",
          compact && "p-2",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground",
              compact ? "h-9 w-9 text-lg" : "h-11 w-11 text-xl",
            )}
          >
            {character.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold tracking-tight">
                {character.name}
              </span>
              <span className="shrink-0 text-[9px] text-muted-foreground">
                {character.country}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <span
                className={cn(
                  "rounded-full px-1.5 py-0 text-[9px] font-bold",
                  ROLE_BADGE[character.role] ?? "bg-secondary text-foreground",
                )}
              >
                {character.role}
              </span>
              <span className="flex items-center gap-0.5 truncate text-[9px] text-accent">
                <Sparkles className="h-2.5 w-2.5" />
                {character.abilityLabel}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}
