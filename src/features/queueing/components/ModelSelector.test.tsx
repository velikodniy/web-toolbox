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
import { ModelSelector } from './ModelSelector.tsx';

const test = Deno.test;

test('ModelSelector renders model dropdown', () => {
  cleanup();
  render(<ModelSelector model='MM1' onModelChange={() => {}} />);
  expect(screen.getByLabelText('Model')).toBeTruthy();
  cleanup();
});

test('ModelSelector shows all 6 models', () => {
  cleanup();
  render(<ModelSelector model='MM1' onModelChange={() => {}} />);
  const select = screen.getByLabelText('Model') as HTMLSelectElement;
  expect(select.options.length).toBe(6);
  cleanup();
});

test('ModelSelector shows SVG diagram', () => {
  cleanup();
  render(<ModelSelector model='MM1' onModelChange={() => {}} />);
  const diagram = document.querySelector('[role="img"]');
  expect(diagram).toBeTruthy();
  cleanup();
});

test('ModelSelector calls onModelChange when selection changes', () => {
  cleanup();
  let captured = '';
  render(
    <ModelSelector
      model='MM1'
      onModelChange={(v) => {
        captured = v;
      }}
    />,
  );
  const select = screen.getByLabelText('Model');
  fireEvent.change(select, { target: { value: 'MMc' } });
  expect(captured).toBe('MMc');
  cleanup();
});
