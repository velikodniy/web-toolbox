import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import { render, screen, fireEvent, waitFor, cleanup } from 'npm:@testing-library/react@14.2.0';
import { expect } from 'npm:expect@29.7.0';
import React from 'npm:react';

const test = Deno.test;

Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});

test('PostcodeLookup renders initial state', async () => {
  const { default: PostcodeLookup } = await import('./PostcodeLookup.tsx');
  render(<PostcodeLookup />);
  expect(screen.getByRole('heading', { name: /Postcode Lookup/i })).toBeTruthy();
  expect(screen.getByPlaceholderText(/SW1A 1AA/i)).toBeTruthy();
  cleanup();
});

test('PostcodeLookup shows error for short postcode', async () => {
  const { default: PostcodeLookup } = await import('./PostcodeLookup.tsx');
  render(<PostcodeLookup />);
  
  const input = screen.getByPlaceholderText(/SW1A 1AA/i);
  fireEvent.change(input, { target: { value: 'SW1' } });
  
  await waitFor(() => {
    expect(screen.getByText(/too short/i)).toBeTruthy();
  }, { timeout: 1000 });
  cleanup();
});

test('PostcodeLookup fetches and displays postcode data', async () => {
  const mockData = {
    status: 200,
    result: {
      postcode: 'SW1A 1AA',
      latitude: 51.501,
      longitude: -0.142,
      admin_district: 'Westminster',
      region: 'London',
      country: 'England',
    },
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData),
  } as Response);

  const { default: PostcodeLookup } = await import('./PostcodeLookup.tsx');
  render(<PostcodeLookup />);
  
  const input = screen.getByPlaceholderText(/SW1A 1AA/i);
  fireEvent.change(input, { target: { value: 'SW1A 1AA' } });
  
  await waitFor(() => {
    expect(screen.getByText('Westminster')).toBeTruthy();
  }, { timeout: 2000 });
  
  expect(screen.getByText('London')).toBeTruthy();
  expect(screen.getByText('England')).toBeTruthy();
  
  globalThis.fetch = originalFetch;
  cleanup();
});

test('PostcodeLookup handles API errors', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.reject(new Error('Network error'));

  const { default: PostcodeLookup } = await import('./PostcodeLookup.tsx');
  render(<PostcodeLookup />);
  
  const input = screen.getByPlaceholderText(/SW1A 1AA/i);
  fireEvent.change(input, { target: { value: 'SW1A 1AA' } });
  
  await waitFor(() => {
    expect(screen.getByText(/Failed to connect/i)).toBeTruthy();
  }, { timeout: 2000 });
  
  globalThis.fetch = originalFetch;
  cleanup();
});
