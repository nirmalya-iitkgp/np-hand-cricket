import type { Character } from "@/game/types";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

/** Skill-tinted aura glow + diagonal pattern per role. */
const ROLE_AURA: Record<string, string> = {
  Batsman: "shadow-[0_0_24px_-4px_oklch(0.65_0.2_25_/_0.55)] hover:shadow-[0_0_32px_-2px_oklch(0.65_0.2_25_/_0.85)]",
  Batswoman: "shadow-[0_0_24px_-4px_oklch(0.65_0.2_25_/_0.55)] hover:shadow-[0_0_32px_-2px_oklch(0.65_0.2_25_/_0.85)]",
  Bowler: "shadow-[0_0_24px_-4px_oklch(0.55_0.18_240_/_0.6)] hover:shadow-[0_0_32px_-2px_oklch(0.6_0.2_240_/_0.9)]",
  Bowlerwoman: "shadow-[0_0_24px_-4px_oklch(0.55_0.18_240_/_0.6)] hover:shadow-[0_0_32px_-2px_oklch(0.6_0.2_240_/_0.9)]",
  "All-Rounder": "shadow-[0_0_24px_-4px_oklch(0.78_0.18_90_/_0.55)] hover:shadow-[0_0_32px_-2px_oklch(0.85_0.18_90_/_0.85)]",
};

const ROLE_PATTERN: Record<string, string> = {
  Batsman:
    "bg-[radial-gradient(circle_at_85%_15%,oklch(0.65_0.2_25/0.18),transparent_55%),repeating-linear-gradient(135deg,oklch(0.65_0.2_25/0.05)_0_8px,transparent_8px_16px)]",
  Batswoman:
    "bg-[radial-gradient(circle_at_85%_15%,oklch(0.65_0.2_25/0.18),transparent_55%),repeating-linear-gradient(135deg,oklch(0.65_0.2_25/0.05)_0_8px,transparent_8px_16px)]",
  Bowler:
    "bg-[radial-gradient(circle_at_85%_15%,oklch(0.6_0.2_240/0.2),transparent_55%),repeating-linear-gradient(45deg,oklch(0.6_0.2_240/0.05)_0_8px,transparent_8px_16px)]",
  Bowlerwoman:
    "bg-[radial-gradient(circle_at_85%_15%,oklch(0.6_0.2_240/0.2),transparent_55%),repeating-linear-gradient(45deg,oklch(0.6_0.2_240/0.05)_0_8px,transparent_8px_16px)]",
  "All-Rounder":
    "bg-[radial-gradient(circle_at_85%_15%,oklch(0.85_0.18_90/0.2),transparent_55%),repeating-linear-gradient(90deg,oklch(0.85_0.18_90/0.05)_0_8px,transparent_8px_16px)]",
};

const ROLE_AVATAR_GRADIENT: Record<string, string> = {
  Batsman: "from-accent to-destructive",
  Batswoman: "from-accent to-destructive",
  Bowler: "from-[oklch(0.55_0.18_240)] to-[oklch(0.7_0.18_220)]",
  Bowlerwoman: "from-[oklch(0.55_0.18_240)] to-[oklch(0.7_0.18_220)]",
  "All-Rounder": "from-primary to-primary-glow",
};

type CardProps = Props & { index?: number };

export function CharacterCard({ character, selected, onClick, index = 0 }: CardProps) {
  return (
    <HoverCard openDelay={120} closeDelay={50}>
      <HoverCardTrigger asChild>
        <motion.button
          type="button"
          onClick={onClick}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={cn("group block w-full text-left")}
        >
          <Card
            className={cn(
              "relative overflow-hidden border p-3 transition-all",
              "bg-card/55 backdrop-blur-md",
              ROLE_PATTERN[character.role],
              ROLE_AURA[character.role],
              selected
                ? "border-primary"
                : "border-white/10 hover:border-white/30",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow-[0_6px_18px_-6px_oklch(0.1_0_0_/_0.7)] ring-1 ring-white/10",
                  ROLE_AVATAR_GRADIENT[character.role],
                )}
              >
                {character.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-black tracking-wider",
                      ROLE_BADGE[character.role] ?? "bg-secondary text-foreground",
                    )}
                  >
                    {ROLE_SHORT[character.role]}
                  </span>
                  <span className="rounded-md bg-background/40 px-1.5 py-0.5 text-[9px] font-black tracking-widest text-foreground/80 ring-1 ring-white/10">
                    {character.country}
                  </span>
                </div>
                <div className="mt-1 truncate text-sm font-black leading-tight tracking-tight">
                  {character.name}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-accent">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span className="truncate font-semibold">{character.abilityLabel}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        className="w-64 border border-primary/40 bg-card/95 backdrop-blur-xl"
      >
        <div className="flex items-start gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-lg">
            {character.emoji}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black tracking-tight">
              {character.name}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {character.country} · {character.role}
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-accent/40 bg-accent/10 p-2">
          <div className="flex items-center gap-1 text-[10px] font-black tracking-widest text-accent">
            <Sparkles className="h-3 w-3" />
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
