/// <reference lib="deno.ns" />
import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import '../../test/setup.ts';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import QueueingCalculator from './QueueingCalculator.tsx';

const test = Deno.test;

test('QueueingCalculator renders with title and description', () => {
  cleanup();
  render(<QueueingCalculator />);
  expect(screen.getByText('Queueing Calculator')).toBeTruthy();
  expect(screen.getByLabelText('Model')).toBeTruthy();
  cleanup();
});

test('QueueingCalculator shows performance results for default inputs', async () => {
  cleanup();
  render(<QueueingCalculator />);
  await waitFor(() => {
    expect(screen.getByText('Performance')).toBeTruthy();
  }, { timeout: 1000 });
  cleanup();
});

test('QueueingCalculator shows SLA analysis section', async () => {
  cleanup();
  render(<QueueingCalculator />);
  await waitFor(() => {
    expect(screen.getByText('SLA Analysis')).toBeTruthy();
  }, { timeout: 1000 });
  cleanup();
});

test('QueueingCalculator shows error for unstable system', async () => {
  cleanup();
  render(<QueueingCalculator />);
  const requestInput = screen.getByLabelText(/Request rate/i);
  const responseInput = screen.getByLabelText(/Avg response time/i);
  fireEvent.change(requestInput, { target: { value: '100' } });
  fireEvent.change(responseInput, { target: { value: '20' } });
  await waitFor(() => {
    expect(screen.getByText(/unstable/i)).toBeTruthy();
  }, { timeout: 1000 });
  cleanup();
});

test('QueueingCalculator shows lambda/mu equivalents', async () => {
  cleanup();
  render(<QueueingCalculator />);
  await waitFor(() => {
    expect(screen.getByText(/\u03BB = 50/)).toBeTruthy();
  }, { timeout: 500 });
  cleanup();
});

test('QueueingCalculator switches models and shows appropriate inputs', async () => {
  cleanup();
  render(<QueueingCalculator />);
  const modelSelect = screen.getByLabelText('Model');
  fireEvent.change(modelSelect, { target: { value: 'MMc' } });
  await waitFor(() => {
    expect(screen.getByLabelText(/Server count/i)).toBeTruthy();
  }, { timeout: 500 });
  cleanup();
});

test('QueueingCalculator has collapsible detailed metrics', async () => {
  cleanup();
  render(<QueueingCalculator />);
  await waitFor(() => {
    expect(screen.getByText(/Detailed metrics/i)).toBeTruthy();
  }, { timeout: 1000 });
  cleanup();
});
