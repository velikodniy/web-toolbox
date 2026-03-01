/// <reference lib="deno.ns" />
import { expect } from 'npm:expect@30.2.0';
import {
  msToRate,
  rateToMs,
  secondsToMs,
  varianceMsToSeconds,
} from './unit-conversion.ts';

const test = Deno.test;

test('msToRate converts milliseconds to per-second rate', () => {
  expect(msToRate(20)).toBe(50);
  expect(msToRate(100)).toBe(10);
  expect(msToRate(1000)).toBe(1);
});

test('msToRate returns Infinity for 0ms', () => {
  expect(msToRate(0)).toBe(Infinity);
});

test('rateToMs converts per-second rate to milliseconds', () => {
  expect(rateToMs(50)).toBe(20);
  expect(rateToMs(10)).toBe(100);
  expect(rateToMs(1)).toBe(1000);
});

test('rateToMs returns Infinity for rate 0', () => {
  expect(rateToMs(0)).toBe(Infinity);
});

test('msToRate and rateToMs are inverses', () => {
  const values = [5, 20, 50, 100, 250, 1000];
  for (const ms of values) {
    expect(rateToMs(msToRate(ms))).toBeCloseTo(ms);
  }
});

test('secondsToMs converts seconds to milliseconds', () => {
  expect(secondsToMs(1)).toBe(1000);
  expect(secondsToMs(0.5)).toBe(500);
  expect(secondsToMs(0.001)).toBeCloseTo(1);
});

test('varianceMsToSeconds converts ms² variance to s²', () => {
  expect(varianceMsToSeconds(1_000_000)).toBe(1);
  expect(varianceMsToSeconds(50_000)).toBeCloseTo(0.05);
  expect(varianceMsToSeconds(0)).toBe(0);
});
