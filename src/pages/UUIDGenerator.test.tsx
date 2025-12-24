import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import { render, screen, fireEvent, waitFor, cleanup } from 'npm:@testing-library/react@16.0.0';
import { expect } from 'npm:expect@29.7.0';
import UUIDGenerator from './UUIDGenerator.tsx';
import React from 'npm:react';

const test = Deno.test;

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (buffer: Uint8Array) => {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = i % 256;
      }
      return buffer;
    }
  }
});

Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});

test('UUIDGenerator generates UUIDs on mount', async () => {
  cleanup();
  render(<UUIDGenerator />);
  await waitFor(() => {
    expect(screen.getByText(/Generated UUID/i)).toBeTruthy();
  });
  cleanup();
});

test('UUIDGenerator regenerates when count changes', async () => {
  cleanup();
  render(<UUIDGenerator />);
  const input = screen.getByLabelText(/Number of UUIDs/i);
  fireEvent.change(input, { target: { value: '2' } });
  
  await waitFor(() => {
    const outputs = screen.getAllByText(/^[0-9a-f]{8}-/); 
    expect(outputs.length).toBe(2);
  });
  cleanup();
});
