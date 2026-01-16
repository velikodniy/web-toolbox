import { Result } from '../../../lib/result.ts';
import { randomInt, type RandomSource, secureRandomBytes } from './random.ts';
import { EFF_WORDLIST } from './wordlist_eff.ts';

const SYMBOL_POOL = ['!', '@', '#', '$', '%', '&', '?'];

export type PassphraseOptions = {
  wordCount: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
  includeSymbol: boolean;
  customWordlist?: readonly string[];
};

const capitalizeWord = (word: string): string => {
  if (word.length === 0) return word;
  return word[0].toUpperCase() + word.slice(1);
};

const sanitizeWordlist = (words: readonly string[]): string[] => {
  return words
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
};

export function generatePassphrase(
  options: PassphraseOptions,
  randomSource: RandomSource = secureRandomBytes,
): Result<string> {
  try {
    if (!Number.isInteger(options.wordCount) || options.wordCount <= 0) {
      return { success: false, error: 'wordCount must be a positive integer' };
    }

    const usingCustomList = Array.isArray(options.customWordlist);
    const baseWordlist = usingCustomList
      ? options.customWordlist
      : EFF_WORDLIST;
    const wordlist = sanitizeWordlist(baseWordlist);

    if (usingCustomList && wordlist.length === 0) {
      return { success: false, error: 'Custom wordlist cannot be empty' };
    }
    if (wordlist.length === 0) {
      return { success: false, error: 'Wordlist cannot be empty' };
    }

    const pickInt = (max: number) => randomInt(max, randomSource);
    const tokens: string[] = [];

    for (let i = 0; i < options.wordCount; i += 1) {
      const word = wordlist[pickInt(wordlist.length)];
      tokens.push(options.capitalize ? capitalizeWord(word) : word);
    }

    if (options.includeNumber) {
      const number = pickInt(10000);
      tokens.push(String(number));
    }

    if (options.includeSymbol) {
      const symbol = SYMBOL_POOL[pickInt(SYMBOL_POOL.length)];
      tokens.push(symbol);
    }

    return { success: true, data: tokens.join(options.separator) };
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Failed to generate passphrase';
    return { success: false, error: message };
  }
}
