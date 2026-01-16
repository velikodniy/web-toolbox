import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import JSONFormatter from './JSONFormatter.tsx';

const test = Deno.test;

Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});

test('JSONFormatter validates real-time', async () => {
  cleanup();
  render(<JSONFormatter />);
  const input = screen.getByPlaceholderText(/Enter JSON/i);

  fireEvent.change(input, { target: { value: '{ invalid' } });

  await waitFor(() => {
    expect(screen.getByText(/Invalid JSON/i)).toBeTruthy();
  });

  fireEvent.change(input, { target: { value: '{}' } });

  await waitFor(() => {
    expect(screen.queryByText(/Invalid JSON/i)).toBeNull();
    expect(screen.getByText(/Valid JSON/i)).toBeTruthy();
  });
  cleanup();
});
