/**
 * Scoring rules:
 *   exact score          → 3
 *   right outcome only    → 1   (home win / away win / draw matches)
 *   wrong outcome         → 0
 */
export function score(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): 0 | 1 | 3 {
  if (predictedHome === actualHome && predictedAway === actualAway) return 3;
  const outcome = (h: number, a: number) => Math.sign(h - a);
  if (outcome(predictedHome, predictedAway) === outcome(actualHome, actualAway))
    return 1;
  return 0;
}
