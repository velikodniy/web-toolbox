import type { UuidVersion } from './lib/uuid-domain.ts';

export type NamespaceOption = 'DNS' | 'URL' | 'OID' | 'X500' | 'custom';

export const VERSION_OPTIONS: { value: UuidVersion; label: string }[] = [
  { value: 'v1', label: 'v1 (Timestamp + MAC)' },
  { value: 'v3', label: 'v3 (MD5 hash)' },
  { value: 'v4', label: 'v4 (Random)' },
  { value: 'v5', label: 'v5 (SHA-1 hash)' },
  { value: 'v6', label: 'v6 (Timestamp, reordered)' },
  { value: 'v7', label: 'v7 (Unix timestamp)' },
];

export const NAMESPACE_OPTIONS: { value: NamespaceOption; label: string }[] = [
  { value: 'DNS', label: 'DNS' },
  { value: 'URL', label: 'URL' },
  { value: 'OID', label: 'OID' },
  { value: 'X500', label: 'X.500' },
  { value: 'custom', label: 'Custom' },
];

export const PART_LEGEND: { name: string; label: string }[] = [
  { name: 'time_low', label: 'Time Low' },
  { name: 'time_mid', label: 'Time Mid' },
  { name: 'time_hi', label: 'Time High' },
  { name: 'clock_seq', label: 'Clock Seq' },
  { name: 'node', label: 'Node' },
  { name: 'unix_ts_ms', label: 'Timestamp' },
  { name: 'rand_a', label: 'Random A' },
  { name: 'rand_b', label: 'Random B' },
  { name: 'random_a', label: 'Random A' },
  { name: 'random_b', label: 'Random B' },
  { name: 'random_c', label: 'Random C' },
  { name: 'random_d', label: 'Random D' },
  { name: 'hash_a', label: 'Hash A' },
  { name: 'hash_b', label: 'Hash B' },
  { name: 'hash_c', label: 'Hash C' },
  { name: 'hash_d', label: 'Hash D' },
  { name: 'version', label: 'Version' },
  { name: 'variant', label: 'Variant' },
];
