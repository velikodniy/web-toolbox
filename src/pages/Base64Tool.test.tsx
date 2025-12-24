import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import { render, screen, fireEvent, waitFor, cleanup } from 'npm:@testing-library/react@16.0.0';
import { expect } from 'npm:expect@29.7.0';
import Base64Tool from './Base64Tool.tsx';
import React from 'npm:react';

const test = Deno.test;

Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});

test('Base64Tool renders bidirectional inputs', () => {
  render(<Base64Tool />);
  expect(screen.getByPlaceholderText(/Type text here/i)).toBeTruthy();
  expect(screen.getByPlaceholderText(/Type Base64 here/i)).toBeTruthy();
  cleanup();
});

test('Base64Tool encodes text to base64 in real-time', async () => {
  render(<Base64Tool />);
  const textInput = screen.getByPlaceholderText(/Type text here/i);
  const base64Input = screen.getByPlaceholderText(/Type Base64 here/i);

  fireEvent.change(textInput, { target: { value: 'hello' } });

  await waitFor(() => {
     expect((base64Input as HTMLTextAreaElement).value).toBe(btoa('hello'));
  }, { timeout: 1000 });
  cleanup();
});

test('Base64Tool decodes base64 to text in real-time', async () => {
  render(<Base64Tool />);
  const textInput = screen.getByPlaceholderText(/Type text here/i);
  const base64Input = screen.getByPlaceholderText(/Type Base64 here/i);

  const encoded = btoa('world');
  fireEvent.change(base64Input, { target: { value: encoded } });

  await waitFor(() => {
     expect((textInput as HTMLTextAreaElement).value).toBe('world');
  }, { timeout: 1000 });
  cleanup();
});
