/// <reference lib="deno.ns" />
import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';

const test = Deno.test;

// Mock navigator properties required by Leaflet
Object.defineProperty(navigator, 'platform', {
  value: 'MacIntel',
  writable: true,
  configurable: true,
});

Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});

// Mock window.matchMedia for Leaflet
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock URL.createObjectURL and revokeObjectURL
Object.assign(URL, {
  createObjectURL: () => 'blob:mock-url',
  revokeObjectURL: () => {},
});

// Setup L on global before importing leaflet-draw
async function setupLeafletMocks() {
  const L = (await import('leaflet')).default;
  (globalThis as unknown as { L: typeof L }).L = L;
}

test('GPXDrawTool renders initial state with heading and description', async () => {
  await setupLeafletMocks();
  const { default: GPXDrawTool } = await import('./GPXDrawTool.tsx');
  render(<GPXDrawTool />);

  expect(screen.getByRole('heading', { name: /GPX Draw Tool/i })).toBeTruthy();
  expect(
    screen.getByText(/Draw GPX markers and tracks/i),
  ).toBeTruthy();

  cleanup();
});

test('GPXDrawTool shows the unified list heading initially', async () => {
  await setupLeafletMocks();
  const { default: GPXDrawTool } = await import('./GPXDrawTool.tsx');
  render(<GPXDrawTool />);

  expect(screen.getByText(/Markers & tracks/i)).toBeTruthy();
  expect(screen.getByText(/No items yet/i)).toBeTruthy();
  expect(screen.queryByText(/waypoints/i)).toBeNull();

  cleanup();
});

test('shows finish track button in track mode and keeps it disabled without points', async () => {
  await setupLeafletMocks();
  const { default: GPXDrawTool } = await import('./GPXDrawTool.tsx');
  render(<GPXDrawTool />);

  expect(
    screen.queryByRole('button', { name: /finish track/i }),
  ).toBeNull();

  const trackButton = screen.getByRole('button', { name: /track/i });
  fireEvent.click(trackButton);

  const finishButton = screen.getByRole('button', { name: /finish track/i });
  expect(finishButton).toBeTruthy();
  expect(finishButton.hasAttribute('disabled')).toBe(true);

  cleanup();
});

test('GPXDrawTool has disabled buttons when no content', async () => {
  await setupLeafletMocks();
  const { default: GPXDrawTool } = await import('./GPXDrawTool.tsx');
  render(<GPXDrawTool />);

  const clearButton = screen.getByRole('button', { name: /Clear All/i });
  const downloadButton = screen.getByRole('button', { name: /Download GPX/i });

  expect(clearButton).toBeTruthy();
  expect(downloadButton).toBeTruthy();
  expect(clearButton.hasAttribute('disabled')).toBe(true);
  expect(downloadButton.hasAttribute('disabled')).toBe(true);

  cleanup();
});
