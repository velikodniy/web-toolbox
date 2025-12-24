import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import { render, screen, fireEvent, waitFor, cleanup } from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import URLEncoder from './URLEncoder.tsx';
import React from 'npm:react';

const test = Deno.test;

Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});

test('URLEncoder renders bidirectional inputs', () => {
  render(<URLEncoder />);
  expect(screen.getByPlaceholderText(/Type decoded URL here/i)).toBeTruthy();
  expect(screen.getByPlaceholderText(/Type encoded URL here/i)).toBeTruthy();
  cleanup();
});

test('URLEncoder encodes URL in real-time', async () => {
  cleanup();
  render(<URLEncoder />);
  const decodedInput = screen.getByPlaceholderText(/Type decoded URL here/i);
  const encodedInput = screen.getByPlaceholderText(/Type encoded URL here/i);

  fireEvent.change(decodedInput, { target: { value: 'https://example.com/foo bar' } });

  await waitFor(() => {
     expect((encodedInput as HTMLTextAreaElement).value).toBe(encodeURIComponent('https://example.com/foo bar'));
  }, { timeout: 1000 });
  cleanup();
});

test('URLEncoder decodes URL in real-time', async () => {
  cleanup();
  render(<URLEncoder />);
  const decodedInput = screen.getByPlaceholderText(/Type decoded URL here/i);
  const encodedInput = screen.getByPlaceholderText(/Type encoded URL here/i);

  const encoded = encodeURIComponent('https://example.com/foo bar');
  fireEvent.change(encodedInput, { target: { value: encoded } });

  await waitFor(() => {
     expect((decodedInput as HTMLTextAreaElement).value).toBe('https://example.com/foo bar');
  }, { timeout: 1000 });
  cleanup();
});
