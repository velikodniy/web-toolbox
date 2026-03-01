/// <reference lib="deno.ns" />
import "data:text/javascript,import 'npm:global-jsdom@24.0.0/register';";
import '../../../test/setup.ts';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import { InputPanel, type InputPanelProps } from './InputPanel.tsx';

const test = Deno.test;

const defaultProps: InputPanelProps = {
  model: 'MM1',
  requestRate: '50',
  responseTime: '20',
  servers: '2',
  capacity: '10',
  varianceMs: '100',
  onRequestRateChange: () => {},
  onResponseTimeChange: () => {},
  onServersChange: () => {},
  onCapacityChange: () => {},
  onVarianceMsChange: () => {},
};

test('InputPanel shows request rate and response time for all models', () => {
  cleanup();
  render(<InputPanel {...defaultProps} />);
  expect(screen.getByLabelText(/Request rate/i)).toBeTruthy();
  expect(screen.getByLabelText(/Avg response time/i)).toBeTruthy();
  cleanup();
});

test('InputPanel shows λ equivalent next to request rate', () => {
  cleanup();
  render(<InputPanel {...defaultProps} />);
  expect(screen.getByText(/λ = 50/)).toBeTruthy();
  cleanup();
});

test('InputPanel shows μ equivalent next to response time', () => {
  cleanup();
  render(<InputPanel {...defaultProps} />);
  expect(screen.getByText(/μ = 50/)).toBeTruthy();
  cleanup();
});

test('InputPanel shows servers input for M/M/c model', () => {
  cleanup();
  render(<InputPanel {...defaultProps} model='MMc' />);
  expect(screen.getByLabelText(/Server count/i)).toBeTruthy();
  cleanup();
});

test('InputPanel hides servers input for M/M/1 model', () => {
  cleanup();
  render(<InputPanel {...defaultProps} model='MM1' />);
  expect(screen.queryByLabelText(/Server count/i)).toBeNull();
  cleanup();
});

test('InputPanel shows capacity input for M/M/1/K model', () => {
  cleanup();
  render(<InputPanel {...defaultProps} model='MM1K' />);
  expect(screen.getByLabelText(/Max capacity/i)).toBeTruthy();
  cleanup();
});

test('InputPanel shows variance input for M/G/1 model', () => {
  cleanup();
  render(<InputPanel {...defaultProps} model='MG1' />);
  expect(screen.getByLabelText(/Response time variance/i)).toBeTruthy();
  cleanup();
});

test('InputPanel calls onChange handlers when inputs change', () => {
  cleanup();
  let capturedValue = '';
  render(
    <InputPanel
      {...defaultProps}
      onRequestRateChange={(v) => {
        capturedValue = v;
      }}
    />,
  );
  const input = screen.getByLabelText(/Request rate/i);
  fireEvent.change(input, { target: { value: '100' } });
  expect(capturedValue).toBe('100');
  cleanup();
});
