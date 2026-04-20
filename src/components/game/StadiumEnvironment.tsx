import { useEffect } from "react";
import type { GameState } from "@/game/types";

/**
 * Drives the global "Adaptive Stadium" environment:
 *  - sets body[data-phase] and body[data-inning] for sky gradient
 *  - mounts a fixed #lov-vignette element with energy/danger states
 *  - triggers a crowd-pulse animation on wickets and boundaries (4 / 6)
 */
export function StadiumEnvironment({ state }: { state: GameState }) {
  // Phase + inning -> body data attrs
  useEffect(() => {
    const b = document.body;
    b.setAttribute("data-phase", state.phase);
    b.setAttribute("data-inning", String(state.inning));
    return () => {
      // leave attrs intact between renders; only clear on unmount
    };
  }, [state.phase, state.inning]);

  // Ensure vignette element exists exactly once
  useEffect(() => {
    let el = document.getElementById("lov-vignette") as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = "lov-vignette";
      document.body.appendChild(el);
    }
    return () => {
      el?.remove();
    };
  }, []);

  // Vignette state — energy on powerplay/free-hit/super-over, danger on 2 wickets while batting
  useEffect(() => {
    const el = document.getElementById("lov-vignette");
    if (!el) return;
    const ev = state.activeEvent?.kind;
    const battingWk = state.batter === "player" ? state.playerWickets : state.cpuWickets;
    const danger = state.phase === "playing" && battingWk >= 2;
    const energy =
      state.phase === "playing" &&
      (ev === "powerplay" || ev === "free-hit" || ev === "super-over" || ev === "double-runs");
    if (danger) el.setAttribute("data-vignette", "danger");
    else if (energy) el.setAttribute("data-vignette", "energy");
    else el.removeAttribute("data-vignette");
  }, [state.activeEvent, state.playerWickets, state.cpuWickets, state.batter, state.phase]);

  // Crowd jump on wicket or boundary (4 / 6)
  useEffect(() => {
    if (state.revealing) return;
    const last = state.timeline[state.timeline.length - 1];
    if (!last) return;
    const isBoundary = !last.isWicket && (last.runs === 4 || last.runs >= 6);
    if (!last.isWicket && !isBoundary) return;
    document.body.classList.remove("crowd-jump");
    void document.body.offsetWidth;
    document.body.classList.add("crowd-jump");
    const t = setTimeout(() => document.body.classList.remove("crowd-jump"), 600);
    return () => clearTimeout(t);
  }, [state.timeline, state.revealing]);

  return null;
}