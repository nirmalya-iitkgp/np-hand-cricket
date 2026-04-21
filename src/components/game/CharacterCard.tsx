import type { Character } from "@/game/types";
import type { ElementType } from "react";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Sparkles, Shield, Zap, Circle, User } from "lucide-react";

const ROLE_ICON: Record<string, ElementType> = {
  Batsman: User,
  Batswoman: User,
  Bowler: Circle,
  Bowlerwoman: Circle,
  "All-Rounder": Zap,
};

type Props = {
  character: Character;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
};

const ROLE_BADGE: Record<string, string> = {
  Batsman: "bg-primary/20 text-primary",
  Batswoman: "bg-primary/20 text-primary",
  Bowler: "bg-destructive/20 text-destructive",
  Bowlerwoman: "bg-destructive/20 text-destructive",
  "All-Rounder": "bg-warning/20 text-warning",
};

const ROLE_SHORT: Record<string, string> = {
  Batsman: "BAT",
  Batswoman: "BAT",
  Bowler: "BOWL",
  Bowlerwoman: "BOWL",
  "All-Rounder": "AR",
};

export function CharacterCard({ character, selected, onClick }: Props) {
  return (
    <HoverCard openDelay={120} closeDelay={50}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "group w-full text-left transition-all duration-200",
            onClick && "hover:-translate-y-0.5 active:scale-[0.97]",
          )}
        >
          <Card
            className={cn(
              "relative overflow-hidden border p-2 transition-all",
              "bg-card/40 backdrop-blur-md",
              "shadow-[0_4px_16px_-6px_oklch(0.1_0.04_260_/_0.6)]",
              selected
                ? "border-primary shadow-[var(--shadow-glow)]"
                : "border-white/10 hover:border-primary/70 hover:bg-card/60",
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center text-primary">
                {(() => {
                  const Icon = ROLE_ICON[character.role] ?? User;
                  return <Icon className="h-5 w-5" strokeWidth={1.5} />;
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[13px] font-normal leading-tight tracking-wide">
                  {character.name}
                </div>
                <div className="mt-0.5 flex items-center gap-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-1 py-0 text-[8px] font-black tracking-wider",
                      ROLE_BADGE[character.role] ?? "bg-secondary text-foreground",
                    )}
                  >
                    {ROLE_SHORT[character.role]}
                  </span>
                  <span className="truncate text-[8px] font-semibold text-muted-foreground">
                    {character.country}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        className="w-64 border border-primary/40 bg-card/95 backdrop-blur-xl"
      >
        <div className="flex items-start gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center text-primary">
            {(() => {
              const Icon = ROLE_ICON[character.role] ?? Sparkles;
              return <Icon className="h-7 w-7" strokeWidth={1.5} />;
            })()}
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-normal tracking-wide">
              {character.name}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {character.country} · {character.role}
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-accent/40 bg-accent/10 p-2">
          <div className="flex items-center gap-1 text-[10px] font-black tracking-widest text-accent">
            <Shield className="h-3 w-3" strokeWidth={2.5} />
            ABILITY · {character.abilityLabel.toUpperCase()}
          </div>
          <p className="mt-1 text-xs leading-snug text-foreground/90">
            {character.abilityDesc}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
