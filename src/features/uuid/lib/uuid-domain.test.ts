import { expect } from 'npm:expect@30.2.0';
import {
  generateUuid,
  type GenerateUuidOptions,
  MAX_UUID,
  NULL_UUID,
  STANDARD_NAMESPACES,
} from './uuid-domain.ts';
import { validate, version } from 'uuid';

const test = Deno.test;

test('NULL_UUID is all zeros', () => {
  expect(NULL_UUID).toBe('00000000-0000-0000-0000-000000000000');
});

test('MAX_UUID is all ones (f)', () => {
  expect(MAX_UUID).toBe('ffffffff-ffff-ffff-ffff-ffffffffffff');
});

test('generateUuid with version v4 returns valid UUID v4', () => {
  const uuid = generateUuid({ version: 'v4' });
  expect(validate(uuid)).toBe(true);
  expect(version(uuid)).toBe(4);
});

test('generateUuid with version v4 produces different UUIDs each call', () => {
  const uuid1 = generateUuid({ version: 'v4' });
  const uuid2 = generateUuid({ version: 'v4' });
  expect(uuid1).not.toBe(uuid2);
});

test('generateUuid with version v1 returns valid UUID v1', () => {
  const uuid = generateUuid({ version: 'v1' });
  expect(validate(uuid)).toBe(true);
  expect(version(uuid)).toBe(1);
});

test('generateUuid with version v6 returns valid UUID v6', () => {
  const uuid = generateUuid({ version: 'v6' });
  expect(validate(uuid)).toBe(true);
  expect(version(uuid)).toBe(6);
});

test('generateUuid with version v7 returns valid UUID v7', () => {
  const uuid = generateUuid({ version: 'v7' });
  expect(validate(uuid)).toBe(true);
  expect(version(uuid)).toBe(7);
});

test('generateUuid with version v3 requires namespace and name', () => {
  expect(() => generateUuid({ version: 'v3' })).toThrow(
    'v3 requires namespace and name',
  );
});

test('generateUuid with version v3 with namespace and name returns valid UUID v3', () => {
  const uuid = generateUuid({
    version: 'v3',
    namespace: STANDARD_NAMESPACES.DNS,
    name: 'example.com',
  });
  expect(validate(uuid)).toBe(true);
  expect(version(uuid)).toBe(3);
});

test('generateUuid with version v3 is deterministic for same inputs', () => {
  const options: GenerateUuidOptions = {
    version: 'v3',
    namespace: STANDARD_NAMESPACES.URL,
    name: 'https://example.com',
  };
  const uuid1 = generateUuid(options);
  const uuid2 = generateUuid(options);
  expect(uuid1).toBe(uuid2);
});

test('generateUuid with version v5 requires namespace and name', () => {
  expect(() => generateUuid({ version: 'v5' })).toThrow(
    'v5 requires namespace and name',
  );
});

test('generateUuid with version v5 with namespace and name returns valid UUID v5', () => {
  const uuid = generateUuid({
    version: 'v5',
    namespace: STANDARD_NAMESPACES.DNS,
    name: 'example.com',
  });
  expect(validate(uuid)).toBe(true);
  expect(version(uuid)).toBe(5);
});

test('generateUuid with version v5 is deterministic for same inputs', () => {
  const options: GenerateUuidOptions = {
    version: 'v5',
    namespace: STANDARD_NAMESPACES.URL,
    name: 'https://example.com',
  };
  const uuid1 = generateUuid(options);
  const uuid2 = generateUuid(options);
  expect(uuid1).toBe(uuid2);
});

test('STANDARD_NAMESPACES.DNS is a valid UUID', () => {
  expect(validate(STANDARD_NAMESPACES.DNS)).toBe(true);
});

test('STANDARD_NAMESPACES.URL is a valid UUID', () => {
  expect(validate(STANDARD_NAMESPACES.URL)).toBe(true);
});

test('STANDARD_NAMESPACES.OID is a valid UUID', () => {
  expect(validate(STANDARD_NAMESPACES.OID)).toBe(true);
});

test('STANDARD_NAMESPACES.X500 is a valid UUID', () => {
  expect(validate(STANDARD_NAMESPACES.X500)).toBe(true);
});

test('generateUuid with v5 accepts custom namespace UUID', () => {
  const customNamespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const uuid = generateUuid({
    version: 'v5',
    namespace: customNamespace,
    name: 'test',
  });
  expect(validate(uuid)).toBe(true);
  expect(version(uuid)).toBe(5);
});

test('generateUuid with v3 throws for invalid namespace', () => {
  expect(() =>
    generateUuid({
      version: 'v3',
      namespace: 'not-a-valid-uuid',
      name: 'test',
    })
  ).toThrow('Invalid namespace UUID');
});
