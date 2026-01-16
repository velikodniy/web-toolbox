/// <reference lib="deno.ns" />
import { expect } from 'npm:expect@30.2.0';
import { generatePassphrase, type PassphraseOptions } from './passphrase.ts';
import type { RandomSource } from './random.ts';

const test = Deno.test;

const zeroRng: RandomSource = (length) => new Uint8Array(length);

const baseOptions: PassphraseOptions = {
  wordCount: 4,
  separator: '-',
  capitalize: false,
  includeNumber: false,
  includeSymbol: false,
};

test('generates passphrase with default wordlist and separator', () => {
  const result = generatePassphrase(baseOptions, zeroRng);

  expect(result.success).toBe(true);
  if (!result.success) return;

  // EFF long wordlist starts with "abacus"
  expect(result.data).toBe('abacus-abacus-abacus-abacus');
});

test('applies capitalization and custom separator', () => {
  const result = generatePassphrase(
    { ...baseOptions, capitalize: true, separator: ' ' },
    zeroRng,
  );

  expect(result.success).toBe(true);
  if (!result.success) return;

  expect(result.data).toBe('Abacus Abacus Abacus Abacus');
});

test('can append number and symbol tokens', () => {
  const result = generatePassphrase(
    {
      ...baseOptions,
      wordCount: 3,
      includeNumber: true,
      includeSymbol: true,
    },
    zeroRng,
  );

  expect(result.success).toBe(true);
  if (!result.success) return;

  expect(result.data).toBe('abacus-abacus-abacus-0-!');
});

test('fails when wordCount is invalid', () => {
  const result = generatePassphrase(
    { ...baseOptions, wordCount: 0 },
    zeroRng,
  );

  expect(result.success).toBe(false);
});

test('fails when custom wordlist is empty', () => {
  const result = generatePassphrase(
    { ...baseOptions, customWordlist: [] },
    zeroRng,
  );

  expect(result.success).toBe(false);
});
