import { v1, v3, v4, v5, v6, v7, validate } from 'uuid';

export const NULL_UUID = '00000000-0000-0000-0000-000000000000';
export const MAX_UUID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

export const STANDARD_NAMESPACES = {
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
} as const;

export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7';

export type GenerateUuidOptions = {
  version: UuidVersion;
  namespace?: string;
  name?: string;
};

const requiresNamespaceAndName = (
  version: UuidVersion,
): version is 'v3' | 'v5' => {
  return version === 'v3' || version === 'v5';
};

const validateNamespace = (namespace: string): void => {
  if (!validate(namespace)) {
    throw new Error('Invalid namespace UUID');
  }
};

export const generateUuid = (options: GenerateUuidOptions): string => {
  const { version, namespace, name } = options;

  if (requiresNamespaceAndName(version)) {
    if (!namespace || !name) {
      throw new Error(`${version} requires namespace and name`);
    }
    validateNamespace(namespace);

    return version === 'v3' ? v3(name, namespace) : v5(name, namespace);
  }

  switch (version) {
    case 'v1':
      return v1();
    case 'v4':
      return v4();
    case 'v6':
      return v6();
    case 'v7':
      return v7();
  }
};
