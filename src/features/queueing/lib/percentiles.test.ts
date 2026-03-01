/// <reference lib="deno.ns" />
import { expect } from 'npm:expect@30.2.0';
import {
  calculateExceedanceProbability,
  calculateWaitPercentile,
} from './percentiles.ts';

const test = Deno.test;

const expectApprox = (actual: number, expected: number, precision = 3) => {
  expect(Math.abs(actual - expected)).toBeLessThan(10 ** -precision);
};

// --- M/M/1 percentiles ---

test('M/M/1: P50 wait time is 0 when utilization < 0.5', () => {
  const result = calculateWaitPercentile({
    model: 'MM1',
    utilization: 0.4,
    serviceRate: 10,
    percentile: 0.5,
  });
  expect(result.seconds).toBe(0);
  expect(result.approximate).toBe(false);
});

test('M/M/1: P99 wait time is positive for loaded system', () => {
  const result = calculateWaitPercentile({
    model: 'MM1',
    utilization: 0.8,
    serviceRate: 50,
    percentile: 0.99,
  });
  const expected = -Math.log(0.01 / 0.8) / (50 * 0.2);
  expectApprox(result.seconds, expected);
  expect(result.approximate).toBe(false);
});

test('M/M/1: exceedance probability matches formula', () => {
  const prob = calculateExceedanceProbability({
    model: 'MM1',
    utilization: 0.8,
    serviceRate: 50,
    targetSeconds: 0.1,
  });
  const expected = 0.8 * Math.exp(-50 * 0.2 * 0.1);
  expectApprox(prob.probability, expected);
  expect(prob.approximate).toBe(false);
});

test('M/M/1: exceedance at t=0 equals utilization', () => {
  const prob = calculateExceedanceProbability({
    model: 'MM1',
    utilization: 0.6,
    serviceRate: 10,
    targetSeconds: 0,
  });
  expectApprox(prob.probability, 0.6);
});

// --- M/M/c percentiles ---

test('M/M/c: P99 wait time is positive', () => {
  const result = calculateWaitPercentile({
    model: 'MMc',
    utilization: 0.8,
    serviceRate: 50,
    servers: 3,
    probabilityOfWait: 0.5,
    percentile: 0.99,
  });
  expect(result.seconds).toBeGreaterThan(0);
  expect(result.approximate).toBe(false);
});

test('M/M/c with c=1: matches M/M/1 result', () => {
  const mm1 = calculateWaitPercentile({
    model: 'MM1',
    utilization: 0.7,
    serviceRate: 20,
    percentile: 0.95,
  });
  const mmc = calculateWaitPercentile({
    model: 'MMc',
    utilization: 0.7,
    serviceRate: 20,
    servers: 1,
    probabilityOfWait: 0.7,
    percentile: 0.95,
  });
  expectApprox(mmc.seconds, mm1.seconds, 2);
});

// --- General/Deterministic models: approximate ---

test('M/G/1: percentiles are flagged as approximate', () => {
  const result = calculateWaitPercentile({
    model: 'MG1',
    utilization: 0.7,
    serviceRate: 20,
    Wq: 0.05,
    percentile: 0.95,
  });
  expect(result.approximate).toBe(true);
  expect(result.seconds).toBeGreaterThan(0);
});

test('M/D/1: percentiles are flagged as approximate', () => {
  const result = calculateWaitPercentile({
    model: 'MD1',
    utilization: 0.7,
    serviceRate: 20,
    Wq: 0.03,
    percentile: 0.95,
  });
  expect(result.approximate).toBe(true);
});

// --- Finite capacity models ---

test('M/M/1/K: percentiles are flagged as approximate', () => {
  const result = calculateWaitPercentile({
    model: 'MM1K',
    utilization: 0.6,
    serviceRate: 20,
    Wq: 0.04,
    percentile: 0.95,
  });
  expect(result.approximate).toBe(true);
});

// --- Edge cases ---

test('percentile of 0 returns 0 wait time', () => {
  const result = calculateWaitPercentile({
    model: 'MM1',
    utilization: 0.9,
    serviceRate: 50,
    percentile: 0,
  });
  expect(result.seconds).toBe(0);
});

test('very low utilization gives near-zero percentiles', () => {
  const result = calculateWaitPercentile({
    model: 'MM1',
    utilization: 0.01,
    serviceRate: 100,
    percentile: 0.99,
  });
  expect(result.seconds).toBeLessThan(0.01);
});
