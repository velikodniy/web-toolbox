import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import { renderHook } from 'npm:@testing-library/react@16.0.0';
import { expect } from 'npm:expect@29.7.0';
import { useDebounce } from './useDebounce.ts';

Deno.test('useDebounce should return initial value', async () => {
  const { result, unmount } = renderHook(() => useDebounce('test', 500));
  expect(result.current).toBe('test');
  unmount();
});

Deno.test('useDebounce should update value after delay', async () => {
  const { result, rerender, unmount } = renderHook(
    ({ value, delay }: { value: string; delay: number }) =>
      useDebounce(value, delay),
    {
      initialProps: { value: 'initial', delay: 100 },
    },
  );

  expect(result.current).toBe('initial');

  rerender({ value: 'updated', delay: 100 });

  expect(result.current).toBe('initial');

  await new Promise((r) => setTimeout(r, 150));

  expect(result.current).toBe('updated');
  unmount();
});
