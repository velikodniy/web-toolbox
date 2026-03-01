/// <reference lib="deno.ns" />
import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import '../../../test/setup.ts';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import {
  DetailedMetrics,
  type DetailedMetricsProps,
} from './DetailedMetrics.tsx';
import type { QueueingResult } from '../lib/queueing.ts';

const test = Deno.test;

const sampleResult: QueueingResult = {
  utilization: 0.667,
  L: 2,
  Lq: 1.333,
  W: 1,
  Wq: 0.667,
  P0: 0.333,
  Pn: undefined,
  throughput: 2,
  effectiveArrivalRate: 2,
  blockingProbability: 0,
  probabilityOfWait: 0.667,
};

const defaultProps: DetailedMetricsProps = {
  result: sampleResult,
  model: 'MM1',
};

test('DetailedMetrics is collapsed by default', () => {
  cleanup();
  render(<DetailedMetrics {...defaultProps} />);
  const details = document.querySelector('details');
  expect(details).toBeTruthy();
  expect(details?.open).toBe(false);
  cleanup();
});

test('DetailedMetrics expands when clicked', () => {
  cleanup();
  render(<DetailedMetrics {...defaultProps} />);
  const summary = screen.getByText(/Detailed metrics/i);
  fireEvent.click(summary);
  const details = document.querySelector('details');
  expect(details?.open).toBe(true);
  cleanup();
});

test('DetailedMetrics shows mathematical notation when expanded', () => {
  cleanup();
  render(<DetailedMetrics {...defaultProps} />);
  const summary = screen.getByText(/Detailed metrics/i);
  fireEvent.click(summary);
  expect(screen.getByText('\u03C1')).toBeTruthy();
  expect(screen.getAllByText(/^L/).length).toBeGreaterThanOrEqual(1);
  cleanup();
});

test('DetailedMetrics shows blocking metrics for finite capacity models', () => {
  cleanup();
  const finiteResult = {
    ...sampleResult,
    blockingProbability: 0.05,
    effectiveArrivalRate: 1.9,
  };
  render(<DetailedMetrics result={finiteResult} model='MM1K' />);
  const summary = screen.getByText(/Detailed metrics/i);
  fireEvent.click(summary);
  const content = document.body.textContent ?? '';
  expect(content).toMatch(/block/i);
  cleanup();
});
