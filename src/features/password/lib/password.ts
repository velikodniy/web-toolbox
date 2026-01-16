import { Result } from '../../../lib/result.ts';
import { randomInt, type RandomSource, secureRandomBytes } from './random.ts';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/\\|~`';

export const AMBIGUOUS_CHARACTERS = new Set([
  '0',
  'O',
  'o',
  '1',
  'I',
  'l',
  '|',
]);

export type PasswordGenerationOptions = {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
};

type CharSet = {
  name: string;
  characters: string[];
};

const buildCharSet = (
  name: string,
  characters: string,
  excludeAmbiguous: boolean,
): CharSet => {
  const filtered = excludeAmbiguous
    ? Array.from(characters).filter((char) => !AMBIGUOUS_CHARACTERS.has(char))
    : Array.from(characters);

  return { name, characters: filtered };
};

const pickRandom = (
  pool: string[],
  pickInt: (max: number) => number,
): string => {
  if (pool.length === 0) {
    throw new Error('Character pool cannot be empty');
  }
  const index = pickInt(pool.length);
  return pool[index];
};

const shuffleInPlace = (
  items: string[],
  pickInt: (max: number) => number,
): void => {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = pickInt(i + 1);
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }
};

export function generatePassword(
  options: PasswordGenerationOptions,
  randomSource: RandomSource = secureRandomBytes,
): Result<string> {
  try {
    if (!Number.isInteger(options.length) || options.length <= 0) {
      return { success: false, error: 'Length must be a positive integer' };
    }

    const sets: CharSet[] = [];

    if (options.includeLowercase) {
      sets.push(buildCharSet('lowercase', LOWERCASE, options.excludeAmbiguous));
    }
    if (options.includeUppercase) {
      sets.push(buildCharSet('uppercase', UPPERCASE, options.excludeAmbiguous));
    }
    if (options.includeNumbers) {
      sets.push(buildCharSet('numbers', NUMBERS, options.excludeAmbiguous));
    }
    if (options.includeSymbols) {
      sets.push(buildCharSet('symbols', SYMBOLS, options.excludeAmbiguous));
    }

    if (sets.length === 0) {
      return { success: false, error: 'Select at least one character set' };
    }

    const emptySet = sets.find((set) => set.characters.length === 0);
    if (emptySet) {
      return {
        success: false,
        error:
          `${emptySet.name} set is empty after filtering ambiguous characters`,
      };
    }

    if (options.length < sets.length) {
      return {
        success: false,
        error: 'Length must be at least the number of required character sets',
      };
    }

    const pickInt = (max: number) => randomInt(max, randomSource);
    const pool = sets.flatMap((set) => set.characters);

    const characters: string[] = sets.map((set) =>
      pickRandom(set.characters, pickInt)
    );

    while (characters.length < options.length) {
      characters.push(pickRandom(pool, pickInt));
    }

    shuffleInPlace(characters, pickInt);

    return { success: true, data: characters.join('') };
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Failed to generate password';
    return { success: false, error: message };
  }
}
