/// <reference lib="deno.ns" />
import { expect } from 'npm:expect@30.2.0';
import {
  AMBIGUOUS_CHARACTERS,
  generatePassword,
  type PasswordGenerationOptions,
} from './password.ts';
import type { RandomSource } from './random.ts';

const test = Deno.test;

const zeroRng: RandomSource = (length) => new Uint8Array(length);

const baseOptions: PasswordGenerationOptions = {
  length: 10,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
};

test('generates a password containing all selected character groups', () => {
  const result = generatePassword(
    { ...baseOptions, length: 12, excludeAmbiguous: false },
    zeroRng,
  );

  expect(result.success).toBe(true);
  if (!result.success) return;

  const value = result.data;
  expect(value).toHaveLength(12);
  expect(/[a-z]/.test(value)).toBe(true);
  expect(/[A-Z]/.test(value)).toBe(true);
  expect(/[0-9]/.test(value)).toBe(true);
  expect(/[^A-Za-z0-9]/.test(value)).toBe(true);
});

test('filters ambiguous characters when requested', () => {
  const result = generatePassword(
    { ...baseOptions, excludeAmbiguous: true, length: 14 },
    zeroRng,
  );

  expect(result.success).toBe(true);
  if (!result.success) return;

  const characters = Array.from(result.data);
  const hasAmbiguous = characters.some((char) =>
    AMBIGUOUS_CHARACTERS.has(char)
  );
  expect(hasAmbiguous).toBe(false);
});

test('fails when no character sets are selected', () => {
  const result = generatePassword(
    {
      ...baseOptions,
      includeLowercase: false,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false,
    },
    zeroRng,
  );

  expect(result.success).toBe(false);
});

test('fails when length is smaller than required character sets', () => {
  const result = generatePassword(
    {
      ...baseOptions,
      length: 2,
      includeSymbols: false,
    },
    zeroRng,
  );

  expect(result.success).toBe(false);
});
