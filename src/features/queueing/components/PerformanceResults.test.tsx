/// <reference lib="deno.ns" />
import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import '../../../test/setup.ts';
import { cleanup, render, screen } from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import {
  PerformanceResults,
  type PerformanceResultsProps,
} from './PerformanceResults.tsx';

const test = Deno.test;

const defaultProps: PerformanceResultsProps = {
  utilization: 0.667,
  Wq: 0.0133,
  W: 0.0333,
  Lq: 1.333,
  throughput: 50,
  model: 'MM1',
  blockingProbability: 0,
};

test('PerformanceResults shows utilization as percentage', () => {
  cleanup();
  render(<PerformanceResults {...defaultProps} />);
  expect(screen.getByText('66.7%')).toBeTruthy();
  cleanup();
});

test('PerformanceResults shows queue wait in ms', () => {
  cleanup();
  render(<PerformanceResults {...defaultProps} />);
  expect(screen.getByText('13.3 ms')).toBeTruthy();
  cleanup();
});

test('PerformanceResults shows total time in ms', () => {
  cleanup();
  render(<PerformanceResults {...defaultProps} />);
  expect(screen.getByText('33.3 ms')).toBeTruthy();
  cleanup();
});

test('PerformanceResults shows throughput in req/s', () => {
  cleanup();
  render(<PerformanceResults {...defaultProps} />);
  expect(screen.getByText('50.0 req/s')).toBeTruthy();
  cleanup();
});

test('PerformanceResults shows queue depth', () => {
  cleanup();
  render(<PerformanceResults {...defaultProps} />);
  expect(screen.getByText('1.33')).toBeTruthy();
  cleanup();
});

test('PerformanceResults shows blocking rate for finite capacity models', () => {
  cleanup();
  render(
    <PerformanceResults
      {...defaultProps}
      model='MM1K'
      blockingProbability={0.05}
    />,
  );
  expect(screen.getByText(/5\.0%/)).toBeTruthy();
  expect(screen.getByText(/blocked/i)).toBeTruthy();
  cleanup();
});

test('PerformanceResults hides blocking rate for infinite queue models', () => {
  cleanup();
  render(<PerformanceResults {...defaultProps} model='MM1' />);
  expect(screen.queryByText(/blocked/i)).toBeNull();
  cleanup();
});
