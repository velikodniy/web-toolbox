export const msToRate = (ms: number): number => 1000 / ms;

export const rateToMs = (rate: number): number => 1000 / rate;

export const secondsToMs = (seconds: number): number => seconds * 1000;

export const varianceMsToSeconds = (varianceMs: number): number =>
  varianceMs / 1_000_000;

export const formatMs = (seconds: number): string => {
  const ms = secondsToMs(seconds);
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  if (ms >= 1) return `${ms.toFixed(1)} ms`;
  return `${(ms * 1000).toFixed(1)} \u03BCs`;
};
