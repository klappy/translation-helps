/**
 * Test setup for Vitest
 */

// Mock browser APIs that aren't available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {},
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Console setup for cleaner test output
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out some expected warnings during tests
  if (args[0]?.includes && args[0].includes('USFM Extractor')) {
    return;
  }
  originalConsoleWarn(...args);
};