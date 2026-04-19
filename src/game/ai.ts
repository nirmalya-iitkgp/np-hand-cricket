/**
 * CPU pattern learning. Two cases:
 *  - When CPU is BOWLING: it tries to MATCH the player's likely next pick (wicket).
 *  - When CPU is BATTING: it tries to AVOID the player's likely next pick.
 *
 * Strategy: build a frequency table from history with recency weighting,
 * also use last-pick bigrams (after picking N, what does the player pick next?).
 * Mix in randomness so the CPU doesn't become deterministic.
 */
function randInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function predictPlayerPick(history: number[]): number {
  if (history.length === 0) return 1 + randInt(6);

  // Frequency with recency weighting (more recent = higher weight)
  const freq = new Array(7).fill(0); // index 1..6
  history.forEach((v, i) => {
    if (v >= 1 && v <= 6) {
      const weight = 1 + i / history.length; // 1..2
      freq[v] += weight;
    }
  });

  // Bigram: after the most recent pick, what does the player tend to play?
  if (history.length >= 2) {
    const last = history[history.length - 1];
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i] === last) {
        const next = history[i + 1];
        if (next >= 1 && next <= 6) freq[next] += 1.5;
      }
    }
  }

  // Pick max
  let best = 1;
  let max = -Infinity;
  for (let n = 1; n <= 6; n++) {
    if (freq[n] > max) {
      max = freq[n];
      best = n;
    }
  }
  return best;
}

export function chooseCpuMove(opts: {
  cpuIsBatting: boolean;
  history: number[];
  /** If yorker active against CPU, restrict 1..3 */
  restrictTo1to3?: boolean;
  /** If slog-fest active and CPU is batting, restrict 4..6 */
  restrictTo4to6?: boolean;
}): number {
  const predicted = predictPlayerPick(opts.history);
  const range = opts.restrictTo1to3
    ? [1, 2, 3]
    : opts.restrictTo4to6
      ? [4, 5, 6]
      : [1, 2, 3, 4, 5, 6];

  // 30% pure random for unpredictability
  if (Math.random() < 0.3) {
    return range[randInt(range.length)];
  }

  if (opts.cpuIsBatting) {
    // Avoid predicted pick (don't get out)
    const avoid = range.filter((n) => n !== predicted);
    if (avoid.length === 0) return range[randInt(range.length)];
    // Slight bias toward higher runs
    const weighted = avoid.flatMap((n) => Array(n).fill(n));
    return weighted[randInt(weighted.length)] as number;
  } else {
    // CPU bowling: try to match predicted pick if it's in the allowed range
    if (range.includes(predicted)) {
      // 70% match, 30% nearby trick
      if (Math.random() < 0.7) return predicted;
      const nearby = range.filter((n) => Math.abs(n - predicted) <= 1);
      return nearby[randInt(nearby.length)];
    }
    return range[randInt(range.length)];
  }
}
