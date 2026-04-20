import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

export type ActionMode = "bat" | "bowl";

const BAT_LABELS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "👆", label: "Tap" },
  2: { emoji: "🤜", label: "Push" },
  3: { emoji: "💨", label: "Drive" },
  4: { emoji: "🎯", label: "Boundary" },
  5: { emoji: "🚀", label: "Lift" },
  6: { emoji: "💥", label: "Big Hit" },
};

const BOWL_LABELS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "🐢", label: "Slow" },
  2: { emoji: "🌀", label: "Spin" },
  3: { emoji: "🎯", label: "Yorker" },
  4: { emoji: "⚡", label: "Pace" },
  5: { emoji: "🔥", label: "Bouncer" },
  6: { emoji: "💀", label: "Express" },
};

const FINGER_EMOJI: Record<number, string> = {
  1: "☝️",
  2: "✌️",
  3: "🤟",
  4: "✋",
  5: "🖐️",
  6: "👍",
};

export function HandIcon({
  value,
  className,
  shaking,
  hidden,
}: {
  value: number | null;
  className?: string;
  shaking?: boolean;
  hidden?: boolean;
}) {
  if (hidden) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted text-3xl",
          shaking && "animate-shake",
          className,
        )}
      >
        ✊
      </div>
    );
  }
  if (value === null) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted/50 text-2xl text-muted-foreground",
          className,
        )}
      >
        ?
      </div>
    );
  }
  const display =
    value === 4 ? (
      <span className="text-2xl font-black">4</span>
    ) : (
      <span>{FINGER_EMOJI[value]}</span>
    );
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 text-3xl animate-reveal",
        className,
      )}
    >
      {display}
    </div>
  );
}

export function NumberButton({
  value,
  mode,
  onClick,
  disabled,
}: {
  value: number;
  mode: ActionMode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const meta = mode === "bat" ? BAT_LABELS[value] : BOWL_LABELS[value];
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const fireRipple = () => {
    const id = Date.now() + Math.random();
    setRipples((r) => [...r, { id }]);
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 500);
  };
  return (
    <motion.button
      type="button"
      onClick={() => {
        if (disabled) return;
        fireRipple();
        onClick();
      }}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border-2 border-border bg-card font-bold",
        "hover:border-primary hover:bg-primary/10 hover:shadow-[var(--shadow-glow)]",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-card disabled:hover:shadow-none",
      )}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 animate-ripple"
        />
      ))}
      <span className="relative text-base leading-none">{meta.emoji}</span>
      <span className="relative text-[9px] uppercase leading-none tracking-wide text-muted-foreground">
        {meta.label}
      </span>
      <span className="relative text-[10px] font-black leading-none text-primary">{value}</span>
    </motion.button>
  );
}
