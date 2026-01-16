import wordlist from './wordlist_eff.json' with { type: 'json' };

/**
 * EFF Long Wordlist (7776 words)
 * Source: https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt
 *
 * Words are 3-9 characters, common English words chosen for:
 * - Easy spelling and typing
 * - No homophones or confusing pairs
 * - Prefix-free (no word is a prefix of another)
 */
export const EFF_WORDLIST: readonly string[] = wordlist;
