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

/** Cricket-themed inline SVG icons for each role. White stroke/fill, sized to fit avatar. */
function CricketRoleIcon({ role, className }: { role: string; className?: string }) {
  const isBat = role === "Batsman" || role === "Batswoman";
  const isBowl = role === "Bowler" || role === "Bowlerwoman";
  // All-rounder = bat + ball combo
  if (isBat) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Cricket bat angled with handle + blade */}
        <rect x="14.5" y="2.5" width="2.4" height="6" rx="0.6" transform="rotate(35 15.7 5.5)" fill="currentColor" />
        <rect x="6" y="9" width="6" height="13" rx="1.5" transform="rotate(35 9 15.5)" fill="currentColor" opacity="0.92" />
        {/* Ball */}
        <circle cx="19" cy="19" r="2.2" fill="currentColor" />
      </svg>
    );
  }
  if (isBowl) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Cricket ball with seam + speed lines */}
        <circle cx="12" cy="12" r="6" fill="currentColor" />
        <path d="M6 12 Q 12 8 18 12" stroke="white" strokeWidth="1.2" fill="none" opacity="0.85" />
        <path d="M6 12 Q 12 16 18 12" stroke="white" strokeWidth="1.2" fill="none" opacity="0.85" />
        {/* Speed trails */}
        <path d="M2 8 L5 8" />
        <path d="M2 12 L4 12" />
        <path d="M2 16 L5 16" />
      </svg>
    );
  }
  // All-Rounder: stumps + ball
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Three stumps */}
      <rect x="6" y="6" width="2" height="14" rx="0.6" fill="currentColor" />
      <rect x="11" y="6" width="2" height="14" rx="0.6" fill="currentColor" />
      <rect x="16" y="6" width="2" height="14" rx="0.6" fill="currentColor" />
      {/* Bails */}
      <rect x="5.5" y="5" width="7.5" height="1.4" rx="0.4" fill="currentColor" />
      <rect x="11" y="5" width="7.5" height="1.4" rx="0.4" fill="currentColor" />
      {/* Ball mid-air */}
      <circle cx="20" cy="11" r="1.8" fill="currentColor" />
    </svg>
  );
}

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
              "relative overflow-hidden border p-2 transition-all",
              "bg-card/55 backdrop-blur-md",
              ROLE_PATTERN[character.role],
              ROLE_AURA[character.role],
              selected
                ? "border-primary"
                : "border-white/10 hover:border-white/30",
            )}
          >
            {/* Compact vertical layout: avatar on top, name + meta below */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-[0_6px_18px_-6px_oklch(0.1_0_0_/_0.7)] ring-1 ring-white/10",
                  ROLE_AVATAR_GRADIENT[character.role],
                )}
              >
                <CricketRoleIcon role={character.role} className="h-6 w-6" />
              </div>
              <div className="flex w-full items-center justify-center gap-1">
                <span
                  className={cn(
                    "rounded-full px-1.5 py-[1px] text-[8px] font-black tracking-wider",
                    ROLE_BADGE[character.role] ?? "bg-secondary text-foreground",
                  )}
                >
                  {ROLE_SHORT[character.role]}
                </span>
                <span className="rounded-md bg-background/40 px-1.5 py-[1px] text-[8px] font-black tracking-widest text-foreground/80 ring-1 ring-white/10">
                  {character.country}
                </span>
              </div>
              <div className="w-full truncate text-[11px] font-black leading-tight tracking-tight">
                {character.name}
              </div>
              <div className="flex w-full items-center justify-center gap-1 text-[9px] text-accent">
                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate font-semibold">{character.abilityLabel}</span>
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
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white",
              ROLE_AVATAR_GRADIENT[character.role],
            )}
          >
            <CricketRoleIcon role={character.role} className="h-5 w-5" />
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
