import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import { act, renderHook } from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import { useDebounceEffect } from './useDebounceEffect.ts';

const test = Deno.test;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('useDebounceEffect calls effect immediately with initial value', () => {
  const calls: string[] = [];
  const { unmount } = renderHook(
    ({ value }) =>
      useDebounceEffect(value, 50, (v) => {
        calls.push(v);
      }),
    { initialProps: { value: 'hello' } },
  );

  // Effect fires on initial render since useDebounce returns initial value immediately
  expect(calls).toEqual(['hello']);
  unmount();
});

test('useDebounceEffect calls effect after delay when value changes', async () => {
  const calls: string[] = [];
  const { rerender, unmount } = renderHook(
    ({ value }) =>
      useDebounceEffect(value, 50, (v) => {
        calls.push(v);
      }),
    { initialProps: { value: 'hello' } },
  );

  expect(calls).toEqual(['hello']);

  rerender({ value: 'world' });

  // Not yet called with new value (still debouncing)
  expect(calls).toEqual(['hello']);

  await act(async () => {
    await delay(100);
  });

  expect(calls).toEqual(['hello', 'world']);
  unmount();
});

test('useDebounceEffect does not re-call effect if value unchanged', async () => {
  const calls: string[] = [];
  const { rerender, unmount } = renderHook(
    ({ value }) =>
      useDebounceEffect(value, 50, (v) => {
        calls.push(v);
      }),
    { initialProps: { value: 'same' } },
  );

  expect(calls).toEqual(['same']);

  rerender({ value: 'same' });

  await act(async () => {
    await delay(100);
  });

  // Called only once — no duplicate for unchanged value
  expect(calls).toEqual(['same']);
  unmount();
});
