/** Lightweight DOM-based effects: confetti and screen shake. No deps. */

export function fireConfetti(opts?: { count?: number; durationMs?: number }) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const count = opts?.count ?? 90;
  const duration = opts?.durationMs ?? 2200;

  // container
  const root = document.createElement("div");
  root.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden;";
  document.body.appendChild(root);

  const colors = [
    "oklch(0.78 0.18 90)", // primary
    "oklch(0.88 0.16 95)", // primary-glow
    "oklch(0.65 0.2 25)", // accent
    "oklch(0.7 0.18 150)", // success
    "oklch(0.82 0.17 80)", // warning
  ];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const left = Math.random() * 100;
    const size = 6 + Math.random() * 8;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotate = Math.random() * 360;
    const xDrift = (Math.random() - 0.5) * 200;
    const delay = Math.random() * 400;
    const dur = 1400 + Math.random() * 1200;
    el.style.cssText = `
      position:absolute;
      top:-20px;
      left:${left}vw;
      width:${size}px;
      height:${size * 0.6}px;
      background:${color};
      transform:rotate(${rotate}deg);
      border-radius:2px;
      opacity:0.95;
      animation: lov-confetti-fall ${dur}ms cubic-bezier(.2,.7,.4,1) ${delay}ms forwards;
      --x-drift:${xDrift}px;
    `;
    root.appendChild(el);
  }

  // inject keyframes once
  if (!document.getElementById("lov-confetti-style")) {
    const style = document.createElement("style");
    style.id = "lov-confetti-style";
    style.textContent = `
      @keyframes lov-confetti-fall {
        0% { transform: translate3d(0,0,0) rotate(0deg); opacity: 1; }
        100% { transform: translate3d(var(--x-drift), 100vh, 0) rotate(720deg); opacity: 0.4; }
      }
      @keyframes lov-screen-shake {
        0%,100% { transform: translate3d(0,0,0); }
        15% { transform: translate3d(-8px, 4px, 0) rotate(-0.4deg); }
        30% { transform: translate3d(7px, -3px, 0) rotate(0.4deg); }
        45% { transform: translate3d(-5px, 3px, 0); }
        60% { transform: translate3d(5px, -2px, 0); }
        75% { transform: translate3d(-3px, 2px, 0); }
      }
      .lov-shake { animation: lov-screen-shake 0.55s ease-in-out; }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    root.remove();
  }, duration + 600);
}

export function shakeScreen() {
  if (typeof document === "undefined") return;
  const target = document.body;
  target.classList.remove("lov-shake");
  // force reflow so the animation can restart
  void target.offsetWidth;
  target.classList.add("lov-shake");
  setTimeout(() => target.classList.remove("lov-shake"), 600);
}
