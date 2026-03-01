/// <reference lib="deno.ns" />
import "data:text/javascript,import 'npm:global-jsdom@24.0.0/register';";
import '../../../test/setup.ts';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import { SLAAnalysis, type SLAAnalysisProps } from './SLAAnalysis.tsx';

const test = Deno.test;

const defaultProps: SLAAnalysisProps = {
  model: 'MM1',
  utilization: 0.8,
  serviceRate: 50,
  Wq: 0.08,
  servers: 1,
  probabilityOfWait: 0.8,
};

test('SLAAnalysis shows percentile table with P50, P90, P95, P99', () => {
  cleanup();
  render(<SLAAnalysis {...defaultProps} />);
  expect(screen.getByText('P50')).toBeTruthy();
  expect(screen.getByText('P90')).toBeTruthy();
  expect(screen.getByText('P95')).toBeTruthy();
  expect(screen.getByText('P99')).toBeTruthy();
  cleanup();
});

test('SLAAnalysis shows approximate badge for M/G/1 model', () => {
  cleanup();
  render(<SLAAnalysis {...defaultProps} model='MG1' />);
  expect(screen.getByText(/approximate/i)).toBeTruthy();
  cleanup();
});

test('SLAAnalysis does not show approximate badge for M/M/1 model', () => {
  cleanup();
  render(<SLAAnalysis {...defaultProps} model='MM1' />);
  expect(screen.queryByText(/approximate/i)).toBeNull();
  cleanup();
});

test('SLAAnalysis shows target threshold input', () => {
  cleanup();
  render(<SLAAnalysis {...defaultProps} />);
  expect(screen.getByLabelText(/target/i)).toBeTruthy();
  cleanup();
});

test('SLAAnalysis shows pass/fail result for target', async () => {
  cleanup();
  render(<SLAAnalysis {...defaultProps} />);
  const targetInput = screen.getByLabelText(/target/i);
  fireEvent.change(targetInput, { target: { value: '100' } });
  await waitFor(
    () => {
      const content = document.body.textContent ?? '';
      expect(content).toMatch(/\d+\.\d+%/);
    },
    { timeout: 1000 },
  );
  cleanup();
});
