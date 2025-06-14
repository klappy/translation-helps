/**
 * Simple test to debug JSX parsing issues
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Simple test component
function TestComponent({ text }) {
  return React.createElement("div", null, text);
}

describe("Simple JSX Test", () => {
  it("should render a simple component", () => {
    const { container } = render(React.createElement(TestComponent, { text: "Hello" }));
    expect(container.textContent).toBe("Hello");
  });
});
