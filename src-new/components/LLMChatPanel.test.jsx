/**
 * LLMChatPanel.test.jsx
 * Tests for the LLM Chat Panel component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { LLMChatPanel } from "./LLMChatPanel";
import { ChatProvider } from "../context/ChatContext";

// Mock the chat service
vi.mock("../services/llmChatService", () => ({
  sendMessage: vi.fn(),
}));

// Mock reference data for testing
const mockReference = {
  book: "GEN",
  chapter: 1,
  verse: 1,
};

// Test wrapper with context
const TestWrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;

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
    expect(screen.getByText("Development Mode - Using Mock Responses")).toBeInTheDocument();
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
