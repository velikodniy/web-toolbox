/// <reference lib="deno.ns" />
import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import PasswordGenerator from './PasswordGenerator.tsx';

const test = Deno.test;

const mockCrypto = () => {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: (array: Uint8Array) => {
        array.fill(0);
        return array;
      },
    },
    configurable: true,
  });
};

test('generates a password on mount with defaults', () => {
  mockCrypto();
  cleanup();
  render(<PasswordGenerator />);

  // Password is auto-generated on mount
  const output = screen.getByTestId('generator-output');
  expect(output.textContent).toHaveLength(16);
  expect(/[a-z]/.test(output.textContent ?? '')).toBe(true);
  expect(/[A-Z]/.test(output.textContent ?? '')).toBe(true);
  expect(/[0-9]/.test(output.textContent ?? '')).toBe(true);
  expect(/[^A-Za-z0-9]/.test(output.textContent ?? '')).toBe(true);
});

test('switches to passphrase mode and applies options', () => {
  mockCrypto();
  cleanup();
  render(<PasswordGenerator />);

  fireEvent.click(screen.getByText('Passphrase'));

  const wordCount = screen.getByLabelText('Words');
  fireEvent.change(wordCount, { target: { value: '3' } });

  const separator = screen.getByLabelText('Separator');
  fireEvent.change(separator, { target: { value: ' ' } });

  fireEvent.click(screen.getByText('Capitalize'));
  fireEvent.click(screen.getByText('Add number'));
  fireEvent.click(screen.getByText('Add symbol'));

  // Click refresh button to regenerate
  fireEvent.click(screen.getByLabelText('Generate new'));

  const output = screen.getByTestId('generator-output');
  expect(output.textContent).toBe('Abacus Abacus Abacus 0 !');
});
