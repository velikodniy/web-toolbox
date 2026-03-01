// Shared test setup for component tests
// Provides common browser API mocks needed by JSDOM

Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});
