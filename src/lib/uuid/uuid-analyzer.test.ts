import { expect } from 'npm:expect@30.2.0';
import { analyzeUuid, normalizeUuidInput } from './uuid-analyzer.ts';

const test = Deno.test;

const KNOWN_V1_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const KNOWN_V4_UUID = '550e8400-e29b-41d4-a716-446655440000';
const KNOWN_V7_UUID = '019763e4-31c2-7def-8000-000000000001';

test('normalizeUuidInput removes urn:uuid: prefix', () => {
  const result = normalizeUuidInput(
    'urn:uuid:550e8400-e29b-41d4-a716-446655440000',
  );
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toBe('550e8400-e29b-41d4-a716-446655440000');
  }
});

test('normalizeUuidInput removes curly braces', () => {
  const result = normalizeUuidInput('{550e8400-e29b-41d4-a716-446655440000}');
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toBe('550e8400-e29b-41d4-a716-446655440000');
  }
});

test('normalizeUuidInput converts uppercase to lowercase', () => {
  const result = normalizeUuidInput('550E8400-E29B-41D4-A716-446655440000');
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toBe('550e8400-e29b-41d4-a716-446655440000');
  }
});

test('normalizeUuidInput adds hyphens to unhyphenated UUID', () => {
  const result = normalizeUuidInput('550e8400e29b41d4a716446655440000');
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toBe('550e8400-e29b-41d4-a716-446655440000');
  }
});

test('normalizeUuidInput returns error for empty string', () => {
  const result = normalizeUuidInput('');
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe('UUID cannot be empty');
  }
});

test('normalizeUuidInput returns error for invalid characters', () => {
  const result = normalizeUuidInput('550e8400-e29b-41d4-a716-44665544000g');
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe('UUID contains invalid characters');
  }
});

test('normalizeUuidInput returns error for wrong length', () => {
  const result = normalizeUuidInput('550e8400-e29b-41d4-a716');
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe('Invalid UUID length');
  }
});

test('analyzeUuid returns version 4 for v4 UUID', () => {
  const result = analyzeUuid(KNOWN_V4_UUID);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.version).toBe(4);
  }
});

test('analyzeUuid returns version 1 for v1 UUID', () => {
  const result = analyzeUuid(KNOWN_V1_UUID);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.version).toBe(1);
  }
});

test('analyzeUuid returns version 7 for v7 UUID', () => {
  const result = analyzeUuid(KNOWN_V7_UUID);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.version).toBe(7);
  }
});

test('analyzeUuid returns variant RFC4122 for standard UUIDs', () => {
  const result = analyzeUuid(KNOWN_V4_UUID);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.variant).toBe('RFC 4122');
  }
});

test('analyzeUuid extracts timestamp from v7 UUID', () => {
  const result = analyzeUuid(KNOWN_V7_UUID);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.version).toBe(7);
    expect('timestampMs' in result.data).toBe(true);
  }
});

test('analyzeUuid extracts timestamp from v1 UUID', () => {
  const result = analyzeUuid(KNOWN_V1_UUID);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.version).toBe(1);
    expect('timestampMs' in result.data).toBe(true);
  }
});

test('analyzeUuid extracts exact timestamp from known v1 UUID', () => {
  const result = analyzeUuid(KNOWN_V1_UUID);
  expect(result.success).toBe(true);
  if (!result.success) return;
  expect(result.data.version).toBe(1);
  if (result.data.version !== 1) return;
  expect(result.data.timestampDate.toISOString()).toBe('1998-02-04T22:13:53.151Z');
});

test('analyzeUuid v4 UUID has no timestamp property', () => {
  const result = analyzeUuid(KNOWN_V4_UUID);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.version).toBe(4);
    expect('timestampMs' in result.data).toBe(false);
  }
});

test('analyzeUuid returns parts array with correct structure', () => {
  const result = analyzeUuid(KNOWN_V4_UUID);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(Array.isArray(result.data.parts)).toBe(true);
    expect(result.data.parts.length).toBeGreaterThan(0);
    const firstPart = result.data.parts[0];
    expect(firstPart).toHaveProperty('name');
    expect(firstPart).toHaveProperty('hex');
    expect(firstPart).toHaveProperty('startIndex');
    expect(firstPart).toHaveProperty('endIndex');
  }
});

test('analyzeUuid returns node ID for v1 UUID', () => {
  const result = analyzeUuid(KNOWN_V1_UUID);
  expect(result.success).toBe(true);
  if (!result.success) return;
  expect(result.data.version).toBe(1);
  if (result.data.version !== 1) return;
  expect(result.data.nodeId).toBe('00:c0:4f:d4:30:c8');
});

test('analyzeUuid returns clock sequence for v1 UUID', () => {
  const result = analyzeUuid(KNOWN_V1_UUID);
  expect(result.success).toBe(true);
  if (!result.success) return;
  expect(result.data.version).toBe(1);
  if (result.data.version !== 1) return;
  expect(result.data.clockSeq).toBeDefined();
});

test('analyzeUuid v4 UUID has no nodeId property', () => {
  const result = analyzeUuid(KNOWN_V4_UUID);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.version).toBe(4);
    expect('nodeId' in result.data).toBe(false);
  }
});

test('analyzeUuid handles NULL UUID', () => {
  const result = analyzeUuid('00000000-0000-0000-0000-000000000000');
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.version).toBe(0);
    expect(result.data.isNil).toBe(true);
  }
});

test('analyzeUuid handles MAX UUID', () => {
  const result = analyzeUuid('ffffffff-ffff-ffff-ffff-ffffffffffff');
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.isMax).toBe(true);
  }
});

test('analyzeUuid returns error for invalid UUID', () => {
  const result = analyzeUuid('not-a-valid-uuid');
  expect(result.success).toBe(false);
});
