import type { Character } from "@/game/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  character: Character;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
};

export function CharacterCard({ character, selected, onClick, compact }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full text-left transition-all duration-200",
        onClick && "hover:scale-[1.03] active:scale-[0.98]",
      )}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-2 p-4 transition-all",
          "bg-card/80 backdrop-blur",
          selected
            ? "border-primary shadow-[var(--shadow-glow)]"
            : "border-border hover:border-primary/60",
          compact && "p-3",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground",
              compact ? "h-10 w-10 text-xl" : "h-14 w-14 text-2xl",
            )}
          >
            {character.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "truncate font-bold tracking-tight",
                compact ? "text-sm" : "text-base",
              )}
            >
              {character.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{character.country}</span>
              <span className="text-primary">•</span>
              <span>{character.role}</span>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}
