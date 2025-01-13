// utils/percentile.ts

/**
 * Calculates the percentile of a given array of numbers.
 * @param arr Array of numbers.
 * @param percentile The desired percentile (e.g., 50 for p50).
 * @returns The calculated percentile value.
 */
export const calculatePercentile = (arr: number[], percentile: number): number | null => {
  if (arr.length === 0) return null;

  const sorted = [...arr].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);

  if (Number.isInteger(index)) {
    return sorted[index];
  } else {
    const lower = Math.floor(index);
    const upper = lower + 1;
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
};

