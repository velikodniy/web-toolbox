import { parse, validate, version as getVersion } from 'uuid';
import { type Result } from '../result.ts';

export type { Result };

export type UuidPart = {
  name: string;
  hex: string;
  startIndex: number;
  endIndex: number;
  description: string;
  decodedValue?: string;
};

export type UuidVariant = 'NCS' | 'RFC 4122' | 'Microsoft' | 'Future';

type UuidAnalysisBase = {
  uuid: string;
  variant: UuidVariant;
  parts: UuidPart[];
  isNil: boolean;
  isMax: boolean;
};

type UuidAnalysisV0 = UuidAnalysisBase & {
  version: 0;
};

type UuidAnalysisV1 = UuidAnalysisBase & {
  version: 1;
  timestampMs: number;
  timestampDate: Date;
  nodeId: string;
  clockSeq: number;
};

type UuidAnalysisV3 = UuidAnalysisBase & {
  version: 3;
  hashHex: string;
};

type UuidAnalysisV4 = UuidAnalysisBase & {
  version: 4;
  randomDataHex: string;
};

type UuidAnalysisV5 = UuidAnalysisBase & {
  version: 5;
  hashHex: string;
};

type UuidAnalysisV6 = UuidAnalysisBase & {
  version: 6;
  timestampMs: number;
  timestampDate: Date;
  nodeId: string;
  clockSeq: number;
};

type UuidAnalysisV7 = UuidAnalysisBase & {
  version: 7;
  timestampMs: number;
  timestampDate: Date;
  randomDataHex: string;
};

type UuidAnalysisV2 = UuidAnalysisBase & {
  version: 2;
};

type UuidAnalysisV8Plus = UuidAnalysisBase & {
  version: 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
};

export type UuidAnalysis =
  | UuidAnalysisV0
  | UuidAnalysisV1
  | UuidAnalysisV2
  | UuidAnalysisV3
  | UuidAnalysisV4
  | UuidAnalysisV5
  | UuidAnalysisV6
  | UuidAnalysisV7
  | UuidAnalysisV8Plus;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNHYPHENATED_REGEX = /^[0-9a-f]{32}$/i;

const stripHyphens = (uuid: string): string => uuid.replace(/-/g, '');

const extractPayloadHex = (hexOnly: string): string =>
  hexOnly.slice(0, 12) + hexOnly.slice(13, 16) + hexOnly.slice(17, 32);

const insertHyphens = (hex: string): string => {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${
    hex.slice(16, 20)
  }-${hex.slice(20)}`;
};

export const normalizeUuidInput = (input: string): Result<string> => {
  if (!input || input.trim() === '') {
    return { success: false, error: 'UUID cannot be empty' };
  }

  let normalized = input.trim().toLowerCase();

  if (normalized.startsWith('urn:uuid:')) {
    normalized = normalized.slice(9);
  }

  if (normalized.startsWith('{') && normalized.endsWith('}')) {
    normalized = normalized.slice(1, -1);
  }

  if (UNHYPHENATED_REGEX.test(normalized)) {
    normalized = insertHyphens(normalized);
  }

  const hexOnly = stripHyphens(normalized);
  if (hexOnly.length !== 32) {
    return { success: false, error: 'Invalid UUID length' };
  }

  if (!/^[0-9a-f]+$/.test(hexOnly)) {
    return { success: false, error: 'UUID contains invalid characters' };
  }

  if (!UUID_REGEX.test(normalized)) {
    return { success: false, error: 'Invalid UUID format' };
  }

  return { success: true, data: normalized };
};

const getVariant = (bytes: Uint8Array): UuidVariant => {
  const variantByte = bytes[8];

  if ((variantByte & 0x80) === 0) {
    return 'NCS';
  }
  if ((variantByte & 0xc0) === 0x80) {
    return 'RFC 4122';
  }
  if ((variantByte & 0xe0) === 0xc0) {
    return 'Microsoft';
  }
  return 'Future';
};

const extractV1TimestampMs = (bytes: Uint8Array): number => {
  const timeLow =
    ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  const timeMid = (bytes[4] << 8) | bytes[5];
  const timeHi = ((bytes[6] & 0x0f) << 8) | bytes[7];

  const timestamp100Ns = BigInt(timeLow) | (BigInt(timeMid) << 32n) |
    (BigInt(timeHi) << 48n);

  const GREGORIAN_OFFSET_100NS = 122192928000000000n;
  const NS_PER_MS = 10000n;
  return Number((timestamp100Ns - GREGORIAN_OFFSET_100NS) / NS_PER_MS);
};

const extractV6TimestampMs = (bytes: Uint8Array): number => {
  const timeHigh =
    ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  const timeMid = (bytes[4] << 8) | bytes[5];
  const timeLow = ((bytes[6] & 0x0f) << 8) | bytes[7];

  const timestamp100Ns = (BigInt(timeHigh) << 28n) | (BigInt(timeMid) << 12n) |
    BigInt(timeLow);

  const GREGORIAN_OFFSET_100NS = 122192928000000000n;
  const NS_PER_MS = 10000n;
  return Number((timestamp100Ns - GREGORIAN_OFFSET_100NS) / NS_PER_MS);
};

const extractV7TimestampMs = (uuid: string): number => {
  const hex = stripHyphens(uuid).substring(0, 12);
  return Number.parseInt(hex, 16);
};

const extractNodeId = (bytes: Uint8Array): string => {
  return Array.from(bytes.slice(10, 16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(':');
};

const extractClockSeq = (bytes: Uint8Array): number => {
  return ((bytes[8] & 0x3f) << 8) | bytes[9];
};

const getPartsForVersion = (
  uuid: string,
  version: number,
  bytes: Uint8Array,
): UuidPart[] => {
  const parts: UuidPart[] = [];
  const hexOnly = stripHyphens(uuid);

  if (version === 4) {
    parts.push({
      name: 'random_a',
      hex: hexOnly.slice(0, 8),
      startIndex: 0,
      endIndex: 8,
      description: 'Random data',
    });
    parts.push({
      name: 'random_b',
      hex: hexOnly.slice(8, 12),
      startIndex: 8,
      endIndex: 12,
      description: 'Random data',
    });
    parts.push({
      name: 'version',
      hex: hexOnly.slice(12, 13),
      startIndex: 12,
      endIndex: 13,
      description: 'Version (4)',
      decodedValue: '4',
    });
    parts.push({
      name: 'random_c',
      hex: hexOnly.slice(13, 16),
      startIndex: 13,
      endIndex: 16,
      description: 'Random data',
    });
    parts.push({
      name: 'variant',
      hex: hexOnly.slice(16, 17),
      startIndex: 16,
      endIndex: 17,
      description: 'Variant',
    });
    parts.push({
      name: 'random_d',
      hex: hexOnly.slice(17, 32),
      startIndex: 17,
      endIndex: 32,
      description: 'Random data',
    });
  } else if (version === 1 || version === 6) {
    parts.push({
      name: 'time_low',
      hex: hexOnly.slice(0, 8),
      startIndex: 0,
      endIndex: 8,
      description: version === 1 ? 'Time low' : 'Time high',
    });
    parts.push({
      name: 'time_mid',
      hex: hexOnly.slice(8, 12),
      startIndex: 8,
      endIndex: 12,
      description: 'Time mid',
    });
    parts.push({
      name: 'version',
      hex: hexOnly.slice(12, 13),
      startIndex: 12,
      endIndex: 13,
      description: `Version (${version})`,
      decodedValue: String(version),
    });
    parts.push({
      name: 'time_hi',
      hex: hexOnly.slice(13, 16),
      startIndex: 13,
      endIndex: 16,
      description: version === 1 ? 'Time high' : 'Time low',
    });
    parts.push({
      name: 'variant',
      hex: hexOnly.slice(16, 17),
      startIndex: 16,
      endIndex: 17,
      description: 'Variant',
    });
    parts.push({
      name: 'clock_seq',
      hex: hexOnly.slice(17, 20),
      startIndex: 17,
      endIndex: 20,
      description: 'Clock sequence',
      decodedValue: String(extractClockSeq(bytes)),
    });
    parts.push({
      name: 'node',
      hex: hexOnly.slice(20, 32),
      startIndex: 20,
      endIndex: 32,
      description: 'Node ID (MAC address)',
      decodedValue: extractNodeId(bytes),
    });
  } else if (version === 7) {
    parts.push({
      name: 'unix_ts_ms',
      hex: hexOnly.slice(0, 12),
      startIndex: 0,
      endIndex: 12,
      description: 'Unix timestamp (milliseconds)',
      decodedValue: new Date(extractV7TimestampMs(uuid)).toISOString(),
    });
    parts.push({
      name: 'version',
      hex: hexOnly.slice(12, 13),
      startIndex: 12,
      endIndex: 13,
      description: 'Version (7)',
      decodedValue: '7',
    });
    parts.push({
      name: 'rand_a',
      hex: hexOnly.slice(13, 16),
      startIndex: 13,
      endIndex: 16,
      description: 'Random data',
    });
    parts.push({
      name: 'variant',
      hex: hexOnly.slice(16, 17),
      startIndex: 16,
      endIndex: 17,
      description: 'Variant',
    });
    parts.push({
      name: 'rand_b',
      hex: hexOnly.slice(17, 32),
      startIndex: 17,
      endIndex: 32,
      description: 'Random data',
    });
  } else if (version === 3 || version === 5) {
    const hashType = version === 3 ? 'MD5' : 'SHA-1';
    parts.push({
      name: 'hash_a',
      hex: hexOnly.slice(0, 8),
      startIndex: 0,
      endIndex: 8,
      description: `${hashType} hash`,
    });
    parts.push({
      name: 'hash_b',
      hex: hexOnly.slice(8, 12),
      startIndex: 8,
      endIndex: 12,
      description: `${hashType} hash`,
    });
    parts.push({
      name: 'version',
      hex: hexOnly.slice(12, 13),
      startIndex: 12,
      endIndex: 13,
      description: `Version (${version})`,
      decodedValue: String(version),
    });
    parts.push({
      name: 'hash_c',
      hex: hexOnly.slice(13, 16),
      startIndex: 13,
      endIndex: 16,
      description: `${hashType} hash`,
    });
    parts.push({
      name: 'variant',
      hex: hexOnly.slice(16, 17),
      startIndex: 16,
      endIndex: 17,
      description: 'Variant',
    });
    parts.push({
      name: 'hash_d',
      hex: hexOnly.slice(17, 32),
      startIndex: 17,
      endIndex: 32,
      description: `${hashType} hash`,
    });
  } else {
    parts.push({
      name: 'data',
      hex: hexOnly,
      startIndex: 0,
      endIndex: 32,
      description: 'UUID data',
    });
  }

  return parts;
};

export const analyzeUuid = (input: string): Result<UuidAnalysis> => {
  const normalizeResult = normalizeUuidInput(input);
  if (!normalizeResult.success) {
    return normalizeResult;
  }

  const uuid = normalizeResult.data;

  if (!validate(uuid)) {
    return { success: false, error: 'Invalid UUID' };
  }

  const bytes = parse(uuid);
  const version = getVersion(uuid);
  const variant = getVariant(bytes);
  const parts = getPartsForVersion(uuid, version, bytes);

  const isNil = uuid === '00000000-0000-0000-0000-000000000000';
  const isMax = uuid === 'ffffffff-ffff-ffff-ffff-ffffffffffff';

  const base = { uuid, variant, parts, isNil, isMax };

  switch (version) {
    case 0: {
      return { success: true, data: { ...base, version: 0 } };
    }
    case 1: {
      const timestampMs = extractV1TimestampMs(bytes);
      return {
        success: true,
        data: {
          ...base,
          version: 1,
          timestampMs,
          timestampDate: new Date(timestampMs),
          nodeId: extractNodeId(bytes),
          clockSeq: extractClockSeq(bytes),
        },
      };
    }
    case 3: {
      return {
        success: true,
        data: {
          ...base,
          version: 3,
          hashHex: extractPayloadHex(stripHyphens(uuid)),
        },
      };
    }
    case 4: {
      return {
        success: true,
        data: {
          ...base,
          version: 4,
          randomDataHex: extractPayloadHex(stripHyphens(uuid)),
        },
      };
    }
    case 5: {
      return {
        success: true,
        data: {
          ...base,
          version: 5,
          hashHex: extractPayloadHex(stripHyphens(uuid)),
        },
      };
    }
    case 6: {
      const timestampMs = extractV6TimestampMs(bytes);
      return {
        success: true,
        data: {
          ...base,
          version: 6,
          timestampMs,
          timestampDate: new Date(timestampMs),
          nodeId: extractNodeId(bytes),
          clockSeq: extractClockSeq(bytes),
        },
      };
    }
    case 7: {
      const timestampMs = extractV7TimestampMs(uuid);
      const hexOnly = stripHyphens(uuid);
      return {
        success: true,
        data: {
          ...base,
          version: 7,
          timestampMs,
          timestampDate: new Date(timestampMs),
          randomDataHex: hexOnly.slice(13, 16) + hexOnly.slice(17, 32),
        },
      };
    }
    case 2: {
      return { success: true, data: { ...base, version: 2 } };
    }
    default: {
      return {
        success: true,
        data: {
          ...base,
          version: version as 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
        },
      };
    }
  }
};
