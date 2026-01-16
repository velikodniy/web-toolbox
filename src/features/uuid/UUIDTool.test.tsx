import 'data:text/javascript,import "npm:global-jsdom@24.0.0/register";';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'npm:@testing-library/react@16.3.1';
import { expect } from 'npm:expect@30.2.0';
import UUIDTool from './UUIDTool.tsx';

const test = Deno.test;

const mockRandomUuid = () => {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${
    hex.slice(16, 20)
  }-${hex.slice(20)}`;
};

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (buffer: Uint8Array) => {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      return buffer;
    },
    randomUUID: mockRandomUuid,
  },
});

Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});

test('UUIDTool generates UUID on mount', async () => {
  cleanup();
  render(<UUIDTool />);
  await waitFor(() => {
    expect(screen.getByText(/Generated UUID/i)).toBeTruthy();
  });
  const output = screen.getByText(/^[0-9a-f]{8}-[0-9a-f]{4}-4/i);
  expect(output).toBeTruthy();
  cleanup();
});

test('UUIDTool shows version selector with v4 as default', () => {
  cleanup();
  render(<UUIDTool />);
  const versionSelect = screen.getByLabelText(/Version/i) as HTMLSelectElement;
  expect(versionSelect.value).toBe('v4');
  cleanup();
});

test('UUIDTool generates v1 UUID when v1 selected', async () => {
  cleanup();
  render(<UUIDTool />);
  const versionSelect = screen.getByLabelText(/Version/i);
  fireEvent.change(versionSelect, { target: { value: 'v1' } });

  await waitFor(() => {
    const outputs = screen.getAllByText(/^[0-9a-f]{8}-[0-9a-f]{4}-1/i);
    expect(outputs.length).toBeGreaterThan(0);
  });
  cleanup();
});

test('UUIDTool shows namespace and name inputs for v3', async () => {
  cleanup();
  render(<UUIDTool />);
  const versionSelect = screen.getByLabelText(/Version/i);
  fireEvent.change(versionSelect, { target: { value: 'v3' } });

  await waitFor(() => {
    expect(screen.getByLabelText(/^Namespace:/i)).toBeTruthy();
    expect(screen.getByLabelText(/^Name:/i)).toBeTruthy();
  });
  cleanup();
});

test('UUIDTool shows namespace and name inputs for v5', async () => {
  cleanup();
  render(<UUIDTool />);
  const versionSelect = screen.getByLabelText(/Version/i);
  fireEvent.change(versionSelect, { target: { value: 'v5' } });

  await waitFor(() => {
    expect(screen.getByLabelText(/^Namespace:/i)).toBeTruthy();
    expect(screen.getByLabelText(/^Name:/i)).toBeTruthy();
  });
  cleanup();
});

test('UUIDTool generates v5 UUID with namespace and name', async () => {
  cleanup();
  render(<UUIDTool />);
  const versionSelect = screen.getByLabelText(/Version/i);
  fireEvent.change(versionSelect, { target: { value: 'v5' } });

  await waitFor(() => {
    expect(screen.getByLabelText(/^Name:/i)).toBeTruthy();
  });

  const nameInput = screen.getByLabelText(/^Name:/i);
  fireEvent.change(nameInput, { target: { value: 'example.com' } });

  const generateBtn = screen.getByRole('button', { name: /Generate/i });
  fireEvent.click(generateBtn);

  await waitFor(() => {
    const outputs = screen.getAllByText(/^[0-9a-f]{8}-[0-9a-f]{4}-5/i);
    expect(outputs.length).toBeGreaterThan(0);
  });
  cleanup();
});

test('UUIDTool sets NULL UUID when NULL button clicked', async () => {
  cleanup();
  render(<UUIDTool />);

  const nullBtn = screen.getByRole('button', { name: /NULL UUID/i });
  fireEvent.click(nullBtn);

  await waitFor(() => {
    expect(
      screen.getByText('00000000-0000-0000-0000-000000000000'),
    ).toBeTruthy();
  });
  cleanup();
});

test('UUIDTool sets MAX UUID when MAX button clicked', async () => {
  cleanup();
  render(<UUIDTool />);

  const maxBtn = screen.getByRole('button', { name: /MAX UUID/i });
  fireEvent.click(maxBtn);

  await waitFor(() => {
    expect(
      screen.getByText('ffffffff-ffff-ffff-ffff-ffffffffffff'),
    ).toBeTruthy();
  });
  cleanup();
});

test('UUIDTool analyzer shows error for invalid UUID', async () => {
  cleanup();
  render(<UUIDTool />);

  const analyzeInput = screen.getByLabelText(/UUID to analyze/i);
  fireEvent.change(analyzeInput, { target: { value: 'not-a-uuid' } });

  await waitFor(() => {
    expect(screen.getByText(/Invalid UUID/i)).toBeTruthy();
  });
  cleanup();
});

test('UUIDTool analyzer shows version for valid UUID', async () => {
  cleanup();
  render(<UUIDTool />);

  const analyzeInput = screen.getByLabelText(/UUID to analyze/i);
  fireEvent.change(analyzeInput, {
    target: { value: '550e8400-e29b-41d4-a716-446655440000' },
  });

  await waitFor(() => {
    expect(screen.getByText('v4')).toBeTruthy();
    expect(screen.getByText('RFC 4122')).toBeTruthy();
  });
  cleanup();
});

test('UUIDTool analyzer shows timestamp for v7 UUID', async () => {
  cleanup();
  render(<UUIDTool />);

  const analyzeInput = screen.getByLabelText(/UUID to analyze/i);
  fireEvent.change(analyzeInput, {
    target: { value: '019763e4-31c2-7def-8000-000000000001' },
  });

  await waitFor(() => {
    expect(screen.getByText('v7')).toBeTruthy();
    expect(screen.getByText(/Timestamp \(UTC\)/i)).toBeTruthy();
  });
  cleanup();
});

test('UUIDTool Analyze button populates analyzer input', async () => {
  cleanup();
  render(<UUIDTool />);

  await waitFor(() => {
    expect(screen.getByText(/Generated UUID/i)).toBeTruthy();
  });

  const analyzeBtn = screen.getByRole('button', { name: /^Analyze$/i });
  fireEvent.click(analyzeBtn);

  await waitFor(() => {
    const analyzeInput = screen.getByLabelText(
      /UUID to analyze/i,
    ) as HTMLInputElement;
    expect(analyzeInput.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
  cleanup();
});
