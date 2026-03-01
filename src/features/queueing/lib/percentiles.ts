import type { ModelType } from './types.ts';

type PercentileInput = {
  model: ModelType;
  utilization: number;
  serviceRate: number;
  percentile: number;
  servers?: number;
  probabilityOfWait?: number;
  Wq?: number;
};

type ExceedanceInput = {
  model: ModelType;
  utilization: number;
  serviceRate: number;
  targetSeconds: number;
  servers?: number;
  probabilityOfWait?: number;
  Wq?: number;
};

export type PercentileResult = {
  seconds: number;
  approximate: boolean;
};

export type ExceedanceResult = {
  probability: number;
  approximate: boolean;
};

const hasExactDistribution = (model: ModelType): boolean =>
  model === 'MM1' || model === 'MMc';

const mm1WaitPercentile = (rho: number, mu: number, p: number): number => {
  if (p <= 1 - rho) return 0;
  return -Math.log((1 - p) / rho) / (mu * (1 - rho));
};

const mm1Exceedance = (rho: number, mu: number, t: number): number => {
  return rho * Math.exp(-mu * (1 - rho) * t);
};

const mmcWaitPercentile = (
  rho: number,
  mu: number,
  servers: number,
  pWait: number,
  p: number,
): number => {
  if (p <= 1 - pWait) return 0;
  return -Math.log((1 - p) / pWait) / (servers * mu * (1 - rho));
};

const mmcExceedance = (
  rho: number,
  mu: number,
  servers: number,
  pWait: number,
  t: number,
): number => {
  return pWait * Math.exp(-servers * mu * (1 - rho) * t);
};

const approxWaitPercentile = (Wq: number, p: number): number => {
  if (Wq <= 0 || p <= 0) return 0;
  return -Wq * Math.log(1 - p);
};

export const calculateWaitPercentile = (
  input: PercentileInput,
): PercentileResult => {
  const { model, utilization: rho, serviceRate: mu, percentile: p } = input;

  if (p <= 0) return { seconds: 0, approximate: !hasExactDistribution(model) };

  if (model === 'MM1') {
    return { seconds: mm1WaitPercentile(rho, mu, p), approximate: false };
  }

  if (model === 'MMc') {
    const servers = input.servers ?? 1;
    const pWait = input.probabilityOfWait ?? rho;
    return {
      seconds: mmcWaitPercentile(rho, mu, servers, pWait, p),
      approximate: false,
    };
  }

  const Wq = input.Wq ?? 0;
  return { seconds: approxWaitPercentile(Wq, p), approximate: true };
};

export const calculateExceedanceProbability = (
  input: ExceedanceInput,
): ExceedanceResult => {
  const { model, utilization: rho, serviceRate: mu, targetSeconds: t } = input;

  if (model === 'MM1') {
    return { probability: mm1Exceedance(rho, mu, t), approximate: false };
  }

  if (model === 'MMc') {
    const servers = input.servers ?? 1;
    const pWait = input.probabilityOfWait ?? rho;
    return {
      probability: mmcExceedance(rho, mu, servers, pWait, t),
      approximate: false,
    };
  }

  const Wq = input.Wq ?? 0;
  if (Wq <= 0) return { probability: 0, approximate: true };
  return { probability: Math.exp(-t / Wq), approximate: true };
};
