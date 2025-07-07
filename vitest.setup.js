import { vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/svelte";

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock common services
vi.mock("js-yaml", () => ({ load: () => ({}) }));
vi.mock("./src/lib/services/dcsClient", () => ({
  fetchManifest: async () => ({}),
  fetchResourceFile: async () => "",
}));

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});
