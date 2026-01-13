import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import { cleanup, render, screen } from 'npm:@testing-library/react@16.3.1';
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

  // Mock L.Control.Draw with proper onAdd implementation
  class MockDraw extends L.Control {
    constructor(_options?: unknown) {
      super();
    }
    onAdd(_map: L.Map) {
      return document.createElement('div');
    }
    onRemove(_map: L.Map) {
      // no-op
    }
  }

  L.Control.Draw = MockDraw as unknown as typeof L.Control.Draw;
  L.Draw = {
    Event: {
      CREATED: 'draw:created',
      DELETED: 'draw:deleted',
    },
  } as unknown as typeof L.Draw;
}

test('GPXDrawTool renders initial state with heading and description', async () => {
  await setupLeafletMocks();
  const { default: GPXDrawTool } = await import('./GPXDrawTool.tsx');
  render(<GPXDrawTool />);

  expect(screen.getByRole('heading', { name: /GPX Draw Tool/i })).toBeTruthy();
  expect(
    screen.getByText(/Draw markers and polylines on the map/i),
  ).toBeTruthy();

  cleanup();
});

test('GPXDrawTool shows zero waypoints and tracks initially', async () => {
  await setupLeafletMocks();
  const { default: GPXDrawTool } = await import('./GPXDrawTool.tsx');
  render(<GPXDrawTool />);

  expect(screen.getByText(/0 waypoints, 0 tracks/i)).toBeTruthy();

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
