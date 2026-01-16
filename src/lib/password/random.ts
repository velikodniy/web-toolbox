const UINT32_MAX = 0xffffffff;
const UINT32_SPAN = UINT32_MAX + 1;

export type RandomSource = (length: number) => Uint8Array;

export function secureRandomBytes(length: number): Uint8Array {
  if (!Number.isInteger(length)) {
    throw new Error('length must be an integer');
  }
  if (length < 0) {
    throw new Error('length must be non-negative');
  }

  const array = new Uint8Array(length);
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== 'function') {
    throw new Error('Secure random generator is unavailable');
  }
  cryptoApi.getRandomValues(array);
  return array;
}

export function randomInt(
  maxExclusive: number,
  randomSource: RandomSource = secureRandomBytes,
): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('maxExclusive must be a positive integer');
  }
  if (maxExclusive > UINT32_SPAN) {
    throw new Error('maxExclusive must not exceed 2^32');
  }

  const maxAcceptable =
    (Math.floor(UINT32_SPAN / maxExclusive) * maxExclusive) -
    1;

  while (true) {
    const bytes = randomSource(4);
    if (bytes.length < 4) {
      throw new Error('Random source must provide at least 4 bytes');
    }

    const view = new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    );
    const value = view.getUint32(0, false);

    if (value <= maxAcceptable) {
      return value % maxExclusive;
    }
  }
}
