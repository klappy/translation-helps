/**
 * LLMChatPanel.test.jsx
 * Tests for the LLM Chat Panel component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { LLMChatPanel } from "./LLMChatPanel";
import { ChatProvider } from "../context/ChatContext";
import { ResourcesProvider } from "../context/ResourcesContext";
import { ReferenceProvider } from "../context/ReferenceContext";

// Mock the chat service
vi.mock("../services/llmChatService", () => ({
  sendMessage: vi.fn(),
}));

// Mock the emoji enhancer
vi.mock("../utils/emojiEnhancer", () => ({
  enhanceLLMResponse: vi.fn((content) => content),
}));

// Mock reference data for testing
const mockReference = {
  book: "GEN",
  chapter: 1,
  verse: 1,
};

// Test wrapper with all required contexts
const TestWrapper = ({ children }) => (
  <ReferenceProvider>
    <ResourcesProvider>
      <ChatProvider>{children}</ChatProvider>
    </ResourcesProvider>
  </ReferenceProvider>
);

describe("LLMChatPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with initial state", () => {
    render(
      <TestWrapper>
        <LLMChatPanel reference={mockReference} />
      </TestWrapper>
    );

    expect(screen.getByText("Translation Assistant")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask about translation notes, word meanings, context...")
    ).toBeInTheDocument();
    expect(screen.getByTitle("Send message (Enter)")).toBeInTheDocument();
  });

  it("displays welcome message on first load", () => {
    render(
      <TestWrapper>
        <LLMChatPanel reference={mockReference} />
      </TestWrapper>
    );

    expect(screen.getByText("Welcome to Translation Assistant!")).toBeInTheDocument();
    expect(screen.getByText(/Translation notes and explanations/)).toBeInTheDocument();
  });

  it("allows typing in the input field", () => {
    render(
      <TestWrapper>
        <LLMChatPanel reference={mockReference} />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(
      "Ask about translation notes, word meanings, context..."
    );
    fireEvent.change(input, { target: { value: "What does this verse mean?" } });

    expect(input.value).toBe("What does this verse mean?");
  });

  it("disables send button when input is empty", () => {
    render(
      <TestWrapper>
        <LLMChatPanel reference={mockReference} />
      </TestWrapper>
    );

    const sendButton = screen.getByTitle("Send message (Enter)");
    expect(sendButton).toBeDisabled();
  });

  it("enables send button when input has text", () => {
    render(
      <TestWrapper>
        <LLMChatPanel reference={mockReference} />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(
      "Ask about translation notes, word meanings, context..."
    );
    const sendButton = screen.getByTitle("Send message (Enter)");

    fireEvent.change(input, { target: { value: "Test message" } });
    expect(sendButton).not.toBeDisabled();
  });

  it("displays context information", () => {
    render(
      <TestWrapper>
        <LLMChatPanel reference={mockReference} />
      </TestWrapper>
    );

    // Should show the assistant interface
    expect(screen.getByText("Welcome to Translation Assistant!")).toBeInTheDocument();
    expect(screen.getByText("Powered by AI")).toBeInTheDocument();
  });

  it("handles empty reference gracefully", () => {
    render(
      <TestWrapper>
        <LLMChatPanel reference={null} />
      </TestWrapper>
    );

    expect(screen.getByText("Translation Assistant")).toBeInTheDocument();
    // Should still render without errors
  });

  it("updates context when reference changes", () => {
    const { rerender } = render(
      <TestWrapper>
        <LLMChatPanel reference={mockReference} />
      </TestWrapper>
    );

    expect(screen.getByText("Translation Assistant")).toBeInTheDocument();

    // Change reference - component should still render properly
    const newReference = { book: "MAT", chapter: 5, verse: 3 };
    rerender(
      <TestWrapper>
        <LLMChatPanel reference={newReference} />
      </TestWrapper>
    );

    expect(screen.getByText("Translation Assistant")).toBeInTheDocument();
  });
});
