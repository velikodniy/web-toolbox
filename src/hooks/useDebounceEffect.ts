import { useEffect } from 'react';
import { useDebounce } from './useDebounce.ts';

export function useDebounceEffect<T>(
  value: T,
  delayMs: number,
  effect: (value: T) => void | (() => void),
): void {
  const debouncedValue = useDebounce(value, delayMs);

  useEffect(() => {
    return effect(debouncedValue);
  }, [debouncedValue]);
}
