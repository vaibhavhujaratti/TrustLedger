import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement scrollIntoView; stub for UI tests
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  value: () => {},
  writable: true,
});

