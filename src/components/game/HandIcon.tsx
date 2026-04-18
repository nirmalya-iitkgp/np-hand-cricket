import { cn } from "@/lib/utils";

const FINGER_EMOJI: Record<number, string> = {
  1: "☝️",
  2: "✌️",
  3: "🤟",
  4: "four",
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
          "flex items-center justify-center rounded-2xl bg-muted text-4xl",
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
        "flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 text-4xl animate-reveal",
        className,
      )}
    >
      {display}
    </div>
  );
}

export function NumberButton({
  value,
  onClick,
  disabled,
}: {
  value: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  const labels: Record<number, string> = {
    1: "☝️",
    2: "✌️",
    3: "🤟",
    4: "✋",
    5: "🖐️",
    6: "👍",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-border bg-card font-bold transition-all",
        "hover:border-primary hover:bg-primary/10 hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5",
        "active:scale-95 active:translate-y-0",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:transform-none disabled:hover:border-border disabled:hover:bg-card disabled:hover:shadow-none",
      )}
    >
      <span className="text-3xl">{labels[value]}</span>
      <span className="text-xl text-primary">{value}</span>
    </button>
  );
}
