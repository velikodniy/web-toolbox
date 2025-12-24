import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import HashGenerator from './HashGenerator.tsx';
import React from 'npm:react';

const test = Deno.test;

globalThis.TextEncoder = class {
  encode(input: string) {
    return new Uint8Array([...input].map((c) => c.charCodeAt(0)));
  }
} as any;

Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      digest: async (_algo: string, _data: Uint8Array) => {
        return new Uint8Array([1, 2, 3]).buffer;
      },
    },
  },
});

Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});

test('HashGenerator generates hashes in real-time', async () => {
  cleanup();
  render(<HashGenerator />);
  const input = screen.getByPlaceholderText(/Enter text/i);

  fireEvent.change(input, { target: { value: 'test' } });

  await waitFor(() => {
    expect(screen.getByText(/SHA-1:/i)).toBeTruthy();
    expect(screen.getByText(/SHA-256:/i)).toBeTruthy();
  }, { timeout: 1000 });
  cleanup();
});
