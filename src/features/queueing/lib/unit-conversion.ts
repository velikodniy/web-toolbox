export const msToRate = (ms: number): number => 1000 / ms;

export const rateToMs = (rate: number): number => 1000 / rate;

export const secondsToMs = (seconds: number): number => seconds * 1000;

export const varianceMsToSeconds = (varianceMs: number): number =>
  varianceMs / 1_000_000;
