/// <reference lib="deno.ns" />
import { expect } from 'npm:expect@30.2.0';
import {
  calculateMM1,
  calculateMMc,
  calculateMM1K,
  calculateMMcK,
  calculateMG1,
  calculateMD1,
} from './queueing.ts';

const test = Deno.test;

const expectApprox = (actual: number, expected: number, precision = 4) => {
  expect(Math.abs(actual - expected)).toBeLessThan(10 ** -precision);
};

test('M/M/1: calculates correct metrics for λ=2, μ=3', () => {
  const result = calculateMM1({ arrivalRate: 2, serviceRate: 3 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  // ρ = λ/μ = 2/3
  expectApprox(result.data.utilization, 2 / 3);
  // L = ρ/(1-ρ) = 2
  expectApprox(result.data.L, 2);
  // Lq = ρ²/(1-ρ) = 4/3
  expectApprox(result.data.Lq, 4 / 3);
  // W = 1/(μ-λ) = 1
  expectApprox(result.data.W, 1);
  // Wq = λ/(μ(μ-λ)) = 2/3
  expectApprox(result.data.Wq, 2 / 3);
  // P0 = 1-ρ = 1/3
  expectApprox(result.data.P0, 1 / 3);
});

test('M/M/1: returns error for unstable system (λ >= μ)', () => {
  const result = calculateMM1({ arrivalRate: 3, serviceRate: 3 });

  if (result.success) {
    throw new Error('Expected failure for unstable system');
  }

  expect(result.error.code).toBe('UNSTABLE_SYSTEM');
});

test('M/M/1: returns error for invalid arrival rate', () => {
  const result = calculateMM1({ arrivalRate: -1, serviceRate: 3 });

  if (result.success) {
    throw new Error('Expected failure');
  }

  expect(result.error.code).toBe('INVALID_ARRIVAL_RATE');
});

test('M/M/1: returns error for invalid service rate', () => {
  const result = calculateMM1({ arrivalRate: 2, serviceRate: 0 });

  if (result.success) {
    throw new Error('Expected failure');
  }

  expect(result.error.code).toBe('INVALID_SERVICE_RATE');
});

test('M/M/1: calculates Pn for given n', () => {
  const result = calculateMM1({ arrivalRate: 2, serviceRate: 3, targetN: 2 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  // Pn = (1-ρ)ρⁿ = (1/3)(2/3)² = 4/27
  expect(result.data.Pn).toBeDefined();
  expectApprox(result.data.Pn as number, 4 / 27);
});

test('M/M/c: calculates correct metrics for λ=4, μ=3, c=2', () => {
  const result = calculateMMc({ arrivalRate: 4, serviceRate: 3, servers: 2 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  // ρ = λ/(cμ) = 4/6 = 2/3
  expectApprox(result.data.utilization, 2 / 3);
  // P0 ≈ 0.2 for c=2, λ=4, μ=3
  expectApprox(result.data.P0, 0.2, 2);
  expect(result.data.L).toBeGreaterThan(0);
  expect(result.data.Lq).toBeGreaterThanOrEqual(0);
  expect(result.data.W).toBeGreaterThan(0);
  expect(result.data.Wq).toBeGreaterThanOrEqual(0);
});

test('M/M/c: reduces to M/M/1 when c=1', () => {
  const mm1Result = calculateMM1({ arrivalRate: 2, serviceRate: 3 });
  const mmcResult = calculateMMc({
    arrivalRate: 2,
    serviceRate: 3,
    servers: 1,
  });

  if (!mm1Result.success || !mmcResult.success) {
    throw new Error('Expected both to succeed');
  }

  expectApprox(mmcResult.data.utilization, mm1Result.data.utilization);
  expectApprox(mmcResult.data.L, mm1Result.data.L);
  expectApprox(mmcResult.data.Lq, mm1Result.data.Lq);
  expectApprox(mmcResult.data.W, mm1Result.data.W);
  expectApprox(mmcResult.data.Wq, mm1Result.data.Wq);
});

test('M/M/c: returns error for unstable system (λ >= cμ)', () => {
  const result = calculateMMc({ arrivalRate: 6, serviceRate: 3, servers: 2 });

  if (result.success) {
    throw new Error('Expected failure for unstable system');
  }

  expect(result.error.code).toBe('UNSTABLE_SYSTEM');
});

test('M/M/c: returns error for invalid server count', () => {
  const result = calculateMMc({ arrivalRate: 2, serviceRate: 3, servers: 0 });

  if (result.success) {
    throw new Error('Expected failure');
  }

  expect(result.error.code).toBe('INVALID_SERVERS');
});

test('M/M/c: returns error for non-integer server count', () => {
  const result = calculateMMc({ arrivalRate: 2, serviceRate: 3, servers: 1.5 });

  if (result.success) {
    throw new Error('Expected failure');
  }

  expect(result.error.code).toBe('INVALID_SERVERS');
});

test('M/M/1/K: calculates correct metrics for λ=2, μ=3, K=5', () => {
  const result = calculateMM1K({
    arrivalRate: 2,
    serviceRate: 3,
    capacity: 5,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.utilization).toBeGreaterThan(0);
  expect(result.data.utilization).toBeLessThanOrEqual(1);
  expect(result.data.blockingProbability).toBeGreaterThan(0);
  expect(result.data.effectiveArrivalRate).toBeLessThan(2);
  expect(result.data.L).toBeGreaterThan(0);
  expect(result.data.Lq).toBeGreaterThanOrEqual(0);
  expect(result.data.W).toBeGreaterThan(0);
  expect(result.data.Wq).toBeGreaterThanOrEqual(0);
});

test('M/M/1/K: handles high traffic (λ > μ) without error', () => {
  const result = calculateMM1K({
    arrivalRate: 5,
    serviceRate: 3,
    capacity: 3,
  });

  if (!result.success) {
    throw new Error('Expected success even with high traffic');
  }

  expect(result.data.blockingProbability).toBeGreaterThan(0.1);
});

test('M/M/1/K: returns error for capacity less than 1', () => {
  const result = calculateMM1K({
    arrivalRate: 2,
    serviceRate: 3,
    capacity: 0,
  });

  if (result.success) {
    throw new Error('Expected failure');
  }

  expect(result.error.code).toBe('INVALID_CAPACITY');
});

test('M/M/c/K: calculates correct metrics for λ=5, μ=2, c=3, K=5', () => {
  const result = calculateMMcK({
    arrivalRate: 5,
    serviceRate: 2,
    servers: 3,
    capacity: 5,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.utilization).toBeGreaterThan(0);
  expect(result.data.blockingProbability).toBeGreaterThan(0);
  expect(result.data.effectiveArrivalRate).toBeLessThan(5);
});

test('M/M/c/K: reduces to M/M/1/K when c=1', () => {
  const mm1kResult = calculateMM1K({
    arrivalRate: 2,
    serviceRate: 3,
    capacity: 5,
  });
  const mmckResult = calculateMMcK({
    arrivalRate: 2,
    serviceRate: 3,
    servers: 1,
    capacity: 5,
  });

  if (!mm1kResult.success || !mmckResult.success) {
    throw new Error('Expected both to succeed');
  }

  expectApprox(mmckResult.data.L, mm1kResult.data.L, 3);
  expectApprox(
    mmckResult.data.blockingProbability,
    mm1kResult.data.blockingProbability,
    3
  );
});

test('M/M/c/K: Erlang B (K=c) gives pure loss system', () => {
  const result = calculateMMcK({
    arrivalRate: 5,
    serviceRate: 2,
    servers: 3,
    capacity: 3,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expectApprox(result.data.Lq, 0);
  expectApprox(result.data.Wq, 0);
  expect(result.data.blockingProbability).toBeGreaterThan(0);
});

test('M/M/c/K: returns error for capacity less than servers', () => {
  const result = calculateMMcK({
    arrivalRate: 2,
    serviceRate: 3,
    servers: 3,
    capacity: 2,
  });

  if (result.success) {
    throw new Error('Expected failure');
  }

  expect(result.error.code).toBe('INVALID_CAPACITY');
});

test('M/G/1: calculates correct metrics using Pollaczek-Khinchine formula', () => {
  const result = calculateMG1({
    arrivalRate: 2,
    serviceRate: 3,
    serviceTimeVariance: 0.05,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  // ρ = λ/μ = 2/3
  expectApprox(result.data.utilization, 2 / 3);
  // P-K formula: Lq = (λ²σ² + ρ²) / (2(1-ρ))
  const rho = 2 / 3;
  const expectedLq = (4 * 0.05 + rho * rho) / (2 * (1 - rho));
  expectApprox(result.data.Lq, expectedLq, 3);
});

test('M/G/1: returns error for unstable system', () => {
  const result = calculateMG1({
    arrivalRate: 3,
    serviceRate: 3,
    serviceTimeVariance: 0.05,
  });

  if (result.success) {
    throw new Error('Expected failure');
  }

  expect(result.error.code).toBe('UNSTABLE_SYSTEM');
});

test('M/G/1: returns error for negative variance', () => {
  const result = calculateMG1({
    arrivalRate: 2,
    serviceRate: 3,
    serviceTimeVariance: -0.1,
  });

  if (result.success) {
    throw new Error('Expected failure');
  }

  expect(result.error.code).toBe('INVALID_VARIANCE');
});

test('M/D/1: calculates correct metrics (variance = 0)', () => {
  const result = calculateMD1({ arrivalRate: 2, serviceRate: 3 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  // ρ = λ/μ = 2/3
  expectApprox(result.data.utilization, 2 / 3);
  // For M/D/1: Lq = ρ² / (2(1-ρ))
  const rho = 2 / 3;
  const expectedLq = (rho * rho) / (2 * (1 - rho));
  expectApprox(result.data.Lq, expectedLq);
  // Wq = Lq / λ
  expectApprox(result.data.Wq, expectedLq / 2);
});

test('M/D/1: gives lower Lq than M/M/1 for same parameters', () => {
  const mm1Result = calculateMM1({ arrivalRate: 2, serviceRate: 3 });
  const md1Result = calculateMD1({ arrivalRate: 2, serviceRate: 3 });

  if (!mm1Result.success || !md1Result.success) {
    throw new Error('Expected both to succeed');
  }

  expect(md1Result.data.Lq).toBeLessThan(mm1Result.data.Lq);
});

test('M/D/1: is equivalent to M/G/1 with variance = 0', () => {
  const md1Result = calculateMD1({ arrivalRate: 2, serviceRate: 3 });
  const mg1Result = calculateMG1({
    arrivalRate: 2,
    serviceRate: 3,
    serviceTimeVariance: 0,
  });

  if (!md1Result.success || !mg1Result.success) {
    throw new Error('Expected both to succeed');
  }

  expectApprox(md1Result.data.Lq, mg1Result.data.Lq);
  expectApprox(md1Result.data.Wq, mg1Result.data.Wq);
});

test('M/M/1: handles very low utilization (ρ close to 0)', () => {
  const result = calculateMM1({ arrivalRate: 0.01, serviceRate: 10 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.utilization).toBeLessThan(0.01);
  expect(result.data.L).toBeLessThan(0.02);
  expect(result.data.P0).toBeGreaterThan(0.99);
});

test('M/M/1: handles high utilization (ρ close to 1)', () => {
  const result = calculateMM1({ arrivalRate: 99, serviceRate: 100 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.utilization).toBeGreaterThan(0.98);
  expect(result.data.L).toBeGreaterThan(90);
  expect(result.data.P0).toBeLessThan(0.02);
});

test('M/M/1: probability of wait equals utilization', () => {
  const result = calculateMM1({ arrivalRate: 2, serviceRate: 5 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expectApprox(result.data.probabilityOfWait, result.data.utilization);
});

test('M/M/c: handles many servers with low individual utilization', () => {
  const result = calculateMMc({ arrivalRate: 10, serviceRate: 5, servers: 10 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.utilization).toBeLessThan(0.25);
  expect(result.data.Lq).toBeLessThan(0.1);
});

test('M/M/c: calculates Pn correctly for n < c', () => {
  const result = calculateMMc({
    arrivalRate: 4,
    serviceRate: 3,
    servers: 3,
    targetN: 1,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.Pn).toBeDefined();
  expect(result.data.Pn).toBeGreaterThan(0);
  expect(result.data.Pn).toBeLessThan(1);
});

test('M/M/c: calculates Pn correctly for n >= c', () => {
  const result = calculateMMc({
    arrivalRate: 4,
    serviceRate: 3,
    servers: 2,
    targetN: 5,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.Pn).toBeDefined();
  expect(result.data.Pn).toBeGreaterThan(0);
  expect(result.data.Pn).toBeLessThan(result.data.P0);
});

test('M/M/1/K: handles ρ = 1 (equal arrival and service rates)', () => {
  const result = calculateMM1K({
    arrivalRate: 3,
    serviceRate: 3,
    capacity: 5,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.blockingProbability).toBeGreaterThan(0);
  expect(result.data.L).toBeGreaterThan(0);
});

test('M/M/1/K: larger capacity reduces blocking probability', () => {
  const smallCapacity = calculateMM1K({
    arrivalRate: 2,
    serviceRate: 3,
    capacity: 3,
  });
  const largeCapacity = calculateMM1K({
    arrivalRate: 2,
    serviceRate: 3,
    capacity: 10,
  });

  if (!smallCapacity.success || !largeCapacity.success) {
    throw new Error('Expected both to succeed');
  }

  expect(largeCapacity.data.blockingProbability).toBeLessThan(
    smallCapacity.data.blockingProbability
  );
});

test('M/M/1/K: calculates Pn for valid n within capacity', () => {
  const result = calculateMM1K({
    arrivalRate: 2,
    serviceRate: 3,
    capacity: 5,
    targetN: 3,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.Pn).toBeDefined();
  expect(result.data.Pn).toBeGreaterThan(0);
  expect(result.data.Pn).toBeLessThan(1);
});

test('M/M/1/K: Pn is undefined for n > K', () => {
  const result = calculateMM1K({
    arrivalRate: 2,
    serviceRate: 3,
    capacity: 5,
    targetN: 10,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.Pn).toBeUndefined();
});

test('M/M/c/K: handles ρ = 1 per server', () => {
  const result = calculateMMcK({
    arrivalRate: 6,
    serviceRate: 3,
    servers: 2,
    capacity: 5,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.blockingProbability).toBeGreaterThan(0);
});

test('M/M/c/K: more servers reduce blocking probability', () => {
  const fewServers = calculateMMcK({
    arrivalRate: 5,
    serviceRate: 2,
    servers: 2,
    capacity: 5,
  });
  const manyServers = calculateMMcK({
    arrivalRate: 5,
    serviceRate: 2,
    servers: 4,
    capacity: 5,
  });

  if (!fewServers.success || !manyServers.success) {
    throw new Error('Expected both to succeed');
  }

  expect(manyServers.data.blockingProbability).toBeLessThan(
    fewServers.data.blockingProbability
  );
});

test('M/M/c/K: calculates Pn correctly', () => {
  const result = calculateMMcK({
    arrivalRate: 5,
    serviceRate: 2,
    servers: 3,
    capacity: 6,
    targetN: 4,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.Pn).toBeDefined();
  expect(result.data.Pn).toBeGreaterThan(0);
});

test('M/G/1: higher variance increases queue length', () => {
  const lowVariance = calculateMG1({
    arrivalRate: 2,
    serviceRate: 3,
    serviceTimeVariance: 0.01,
  });
  const highVariance = calculateMG1({
    arrivalRate: 2,
    serviceRate: 3,
    serviceTimeVariance: 0.5,
  });

  if (!lowVariance.success || !highVariance.success) {
    throw new Error('Expected both to succeed');
  }

  expect(highVariance.data.Lq).toBeGreaterThan(lowVariance.data.Lq);
  expect(highVariance.data.Wq).toBeGreaterThan(lowVariance.data.Wq);
});

test('M/G/1: with exponential variance equals M/M/1', () => {
  const mm1Result = calculateMM1({ arrivalRate: 2, serviceRate: 3 });
  const mg1Result = calculateMG1({
    arrivalRate: 2,
    serviceRate: 3,
    serviceTimeVariance: 1 / 9,
  });

  if (!mm1Result.success || !mg1Result.success) {
    throw new Error('Expected both to succeed');
  }

  expectApprox(mg1Result.data.Lq, mm1Result.data.Lq, 3);
});

test('All models: throughput equals effective arrival rate for stable systems', () => {
  const mm1 = calculateMM1({ arrivalRate: 2, serviceRate: 3 });
  const mmc = calculateMMc({ arrivalRate: 4, serviceRate: 3, servers: 2 });
  const md1 = calculateMD1({ arrivalRate: 2, serviceRate: 3 });

  if (!mm1.success || !mmc.success || !md1.success) {
    throw new Error('Expected all to succeed');
  }

  expectApprox(mm1.data.throughput, mm1.data.effectiveArrivalRate);
  expectApprox(mmc.data.throughput, mmc.data.effectiveArrivalRate);
  expectApprox(md1.data.throughput, md1.data.effectiveArrivalRate);
});

test('Finite capacity models: throughput < arrival rate when blocking occurs', () => {
  const mm1k = calculateMM1K({ arrivalRate: 5, serviceRate: 3, capacity: 3 });
  const mmck = calculateMMcK({
    arrivalRate: 10,
    serviceRate: 2,
    servers: 2,
    capacity: 4,
  });

  if (!mm1k.success || !mmck.success) {
    throw new Error('Expected both to succeed');
  }

  expect(mm1k.data.throughput).toBeLessThan(5);
  expect(mmck.data.throughput).toBeLessThan(10);
});

test('M/M/1: Littles Law holds (L = λW)', () => {
  const result = calculateMM1({ arrivalRate: 2, serviceRate: 5 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expectApprox(result.data.L, 2 * result.data.W);
  expectApprox(result.data.Lq, 2 * result.data.Wq);
});

test('M/M/c: Littles Law holds', () => {
  const result = calculateMMc({ arrivalRate: 6, serviceRate: 4, servers: 3 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expectApprox(result.data.L, 6 * result.data.W, 3);
  expectApprox(result.data.Lq, 6 * result.data.Wq, 3);
});

test('M/M/1/K: Littles Law holds with effective arrival rate', () => {
  const result = calculateMM1K({ arrivalRate: 2, serviceRate: 3, capacity: 10 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expectApprox(result.data.L, result.data.effectiveArrivalRate * result.data.W, 3);
});

test('M/M/1: verified against atozmath.com (λ=8, μ=9)', () => {
  const result = calculateMM1({ arrivalRate: 8, serviceRate: 9 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expectApprox(result.data.utilization, 0.88888889, 6);
  expectApprox(result.data.P0, 0.11111111, 6);
  expectApprox(result.data.L, 8, 6);
  expectApprox(result.data.Lq, 7.11111111, 5);
  expectApprox(result.data.W, 1, 6);
  expectApprox(result.data.Wq, 0.88888889, 5);
});

test('M/M/c: verified against atozmath.com (λ=30, μ=20, c=2)', () => {
  const result = calculateMMc({ arrivalRate: 30, serviceRate: 20, servers: 2 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expectApprox(result.data.utilization, 0.75, 6);
  expectApprox(result.data.P0, 0.14285714, 5);
  expectApprox(result.data.Lq, 1.92857143, 4);
  expectApprox(result.data.L, 3.42857143, 4);
  expectApprox(result.data.Wq, 0.06428571, 4);
  expectApprox(result.data.W, 0.11428571, 4);
});

test('M/M/1/K: verified against atozmath.com (λ=8, μ=9, K=3)', () => {
  const result = calculateMM1K({ arrivalRate: 8, serviceRate: 9, capacity: 3 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expectApprox(result.data.P0, 0.29574037, 5);
  expectApprox(result.data.blockingProbability, 0.20770791, 5);
  expectApprox(result.data.L, 1.35334686, 4);
  expectApprox(result.data.Lq, 0.64908722, 4);
  expectApprox(result.data.W, 0.21351767, 4);
  expectApprox(result.data.Wq, 0.10240655, 4);
  expectApprox(result.data.effectiveArrivalRate, 6.33833671, 4);
});

test('M/M/1/K: probabilityOfWait excludes blocked state', () => {
  const result = calculateMM1K({ arrivalRate: 5, serviceRate: 3, capacity: 3 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  const expectedProbWait = 1 - result.data.P0 - result.data.blockingProbability;
  expectApprox(result.data.probabilityOfWait, expectedProbWait, 6);
  expect(result.data.probabilityOfWait).toBeLessThan(1 - result.data.P0);
});

test('M/M/c/K: probabilityOfWait excludes blocked state', () => {
  const result = calculateMMcK({
    arrivalRate: 10,
    serviceRate: 2,
    servers: 2,
    capacity: 4,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(result.data.blockingProbability).toBeGreaterThan(0.1);
  expect(result.data.probabilityOfWait).toBeLessThan(
    1 - result.data.P0
  );
});

test('M/M/c: handles large server count without overflow', () => {
  const result = calculateMMc({ arrivalRate: 50, serviceRate: 1, servers: 100 });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(Number.isFinite(result.data.P0)).toBe(true);
  expect(Number.isFinite(result.data.L)).toBe(true);
  expect(Number.isFinite(result.data.Lq)).toBe(true);
  expect(result.data.P0).toBeGreaterThan(0);
  expect(result.data.utilization).toBeLessThan(1);
});

test('M/M/c/K: handles large capacity without overflow', () => {
  const result = calculateMMcK({
    arrivalRate: 10,
    serviceRate: 2,
    servers: 5,
    capacity: 100,
  });

  if (!result.success) {
    throw new Error('Expected success');
  }

  expect(Number.isFinite(result.data.P0)).toBe(true);
  expect(Number.isFinite(result.data.L)).toBe(true);
  expect(result.data.blockingProbability).toBeGreaterThanOrEqual(0);
});
