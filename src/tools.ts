import { type ComponentType, lazy } from 'react';
import type { ReactNode } from 'react';
import {
  FiActivity,
  FiAlignLeft,
  FiCode,
  FiKey,
  FiLink,
  FiLock,
  FiMap,
  FiMapPin,
  FiShield,
} from 'react-icons/fi';

export type ToolDefinition = {
  path: string;
  name: string;
  description: string;
  icon: ReactNode;
  component: ComponentType;
};

export const tools: ToolDefinition[] = [
  {
    path: '/uuid',
    name: 'UUID Tool',
    description: 'Generate and analyze UUIDs',
    icon: FiKey({}),
    component: lazy(() => import('./features/uuid/UUIDTool.tsx')),
  },
  {
    path: '/base64-tool',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode text to/from Base64 format',
    icon: FiCode({}),
    component: lazy(() => import('./features/base64/Base64Tool.tsx')),
  },
  {
    path: '/json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data',
    icon: FiAlignLeft({}),
    component: lazy(() => import('./features/json/JSONFormatter.tsx')),
  },
  {
    path: '/url-encoder',
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs for safe transmission',
    icon: FiLink({}),
    component: lazy(() => import('./features/url-encoder/URLEncoder.tsx')),
  },
  {
    path: '/hash-generator',
    name: 'Hash Generator',
    description: 'Generate SHA-1 and SHA-256 hashes from text',
    icon: FiShield({}),
    component: lazy(() => import('./features/hash/HashGenerator.tsx')),
  },
  {
    path: '/password-generator',
    name: 'Password Generator',
    description: 'Create secure passwords and passphrases',
    icon: FiLock({}),
    component: lazy(() => import('./features/password/PasswordGenerator.tsx')),
  },
  {
    path: '/postcode-lookup',
    name: 'Postcode Lookup',
    description: 'Lookup UK postcodes, coordinates and administrative data',
    icon: FiMapPin({}),
    component: lazy(() => import('./features/postcode/PostcodeLookup.tsx')),
  },
  {
    path: '/gpx-draw',
    name: 'GPX Draw Tool',
    description: 'Draw markers and polylines on a map and export as GPX',
    icon: FiMap({}),
    component: lazy(() => import('./features/gpx/GPXDrawTool.tsx')),
  },
  {
    path: '/queueing',
    name: 'Queueing Calculator',
    description:
      'Model server capacity, predict wait times, and check SLA targets',
    icon: FiActivity({}),
    component: lazy(
      () => import('./features/queueing/QueueingCalculator.tsx'),
    ),
  },
];
