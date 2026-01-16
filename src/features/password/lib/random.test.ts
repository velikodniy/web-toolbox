/// <reference lib="deno.ns" />
import { expect } from 'npm:expect@30.2.0';
import { randomInt, secureRandomBytes } from './random.ts';

const test = Deno.test;

test('secureRandomBytes delegates to crypto.getRandomValues', () => {
  const calls: Uint8Array[] = [];
  const originalCrypto = globalThis.crypto;
  const cryptoMock = {
    getRandomValues: (array: Uint8Array) => {
      calls.push(array);
      for (let i = 0; i < array.length; i += 1) {
        array[i] = (i + 5) & 0xff;
      }
      return array;
    },
  };

  Object.defineProperty(globalThis, 'crypto', {
    value: cryptoMock,
    configurable: true,
  });

  try {
    const result = secureRandomBytes(4);

    expect(result).toEqual(new Uint8Array([5, 6, 7, 8]));
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBeInstanceOf(Uint8Array);
    expect(calls[0]).toHaveLength(4);
  } finally {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
    });
  }
});

test('randomInt uses rejection sampling to avoid modulo bias', () => {
  const requests: number[] = [];
  const rng = (length: number) => {
    requests.push(length);
    if (requests.length === 1) return new Uint8Array([255, 255, 255, 255]);
    return new Uint8Array([0, 0, 0, 20]);
  };

  const value = randomInt(10, rng);

  expect(value).toBe(0);
  expect(requests).toEqual([4, 4]);
});

test('randomInt returns 0 when maxExclusive is 1', () => {
  const rng = (length: number) => new Uint8Array(length);
  const value = randomInt(1, rng);
  expect(value).toBe(0);
});

test('randomInt validates maxExclusive', () => {
  const rng = (length: number) => new Uint8Array(length);
  expect(() => randomInt(0, rng)).toThrow();
  expect(() => randomInt(-1, rng)).toThrow();
  expect(() => randomInt(3.5, rng)).toThrow();
});

test('randomInt rejects maxExclusive exceeding 2^32', () => {
  const rng = (length: number) => new Uint8Array(length);
  const UINT32_SPAN = 0xffffffff + 1;
  expect(() => randomInt(UINT32_SPAN + 1, rng)).toThrow('must not exceed 2^32');
});
