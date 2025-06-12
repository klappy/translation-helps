/**
 * ChatContext.jsx
 * React context for managing LLM chat state and conversation history
 * Updated to use ResourcesContext for anti-hallucination measures
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  sendChatMessage,
  createMockResponse,
  validateChatRequest,
} from "../services/llmChatService";
import { useReferenceContext } from "./ReferenceContext";
import { useResourcesContext } from "./ResourcesContext";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export function ChatProvider({ children }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentContext, setCurrentContext] = useState(null);

  // Get current reference from ReferenceContext
  const referenceContext = useReferenceContext();

  // Get current resources from ResourcesContext
  const { getFormattedContext } = useResourcesContext();

  /**
   * Sends a message to the LLM with current context from ResourcesContext
   */
  const sendMessage = useCallback(
    async (message) => {
      setIsLoading(true);
      setError(null);

      try {
        // Get context from ResourcesContext (replaces DOM parsing and packageContext)
        const context = getFormattedContext();

        if (!context) {
          throw new Error("No context available. Please ensure resources are loaded.");
        }

        // Validate the request
        const validation = validateChatRequest(message, context);
        if (!validation.valid) {
          throw new Error(validation.errors.join(", "));
        }

        setCurrentContext(context);

        // Add user message to history immediately
        const userMessage = {
          id: Date.now().toString(),
          type: "user",
          content: message,
          timestamp: new Date().toISOString(),
        };

        setChatHistory((prev) => [...prev, userMessage]);

        // Determine if we should use mock response
        const useMock = import.meta.env.VITE_USE_MOCK_CHAT === "true";

        let response;
        if (useMock) {
          // Use mock response for development
          response = createMockResponse(message, context);
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          // Send to actual LLM
          response = await sendChatMessage(message, context, chatHistory);
        }

        if (response.success) {
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            content: response.response,
            timestamp: response.timestamp,
            metadata: response.metadata,
          };

          setChatHistory((prev) => [...prev, aiMessage]);
        } else {
          throw new Error(response.error || "Failed to get response");
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err.message);

        // Add error message to chat
        const errorMessage = {
          id: (Date.now() + 2).toString(),
          type: "error",
          content: `Sorry, I encountered an error: ${err.message}`,
          timestamp: new Date().toISOString(),
        };

        setChatHistory((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [getFormattedContext, chatHistory]
  );

  /**
   * Clears the chat history
   */
  const clearChat = useCallback(() => {
    setChatHistory([]);
    setCurrentContext(null);
    setError(null);
  }, []);

  /**
   * Removes a specific message from chat history
   */
  const removeMessage = useCallback((messageId) => {
    setChatHistory((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  /**
   * Gets the current context information for display
   */
  const getContextInfo = useCallback(() => {
    if (!currentContext) return null;

    const { reference, resources, metadata } = currentContext;
    return {
      reference: reference.citation,
      organization: reference.organization,
      language: reference.language,
      resourceCount: Object.values(resources).reduce((count, resource) => {
        if (Array.isArray(resource)) {
          return count + (resource.length > 0 ? 1 : 0);
        }
        return count + (resource ? 1 : 0);
      }, 0),
      contextSize: JSON.stringify(currentContext).length,
      timestamp: metadata.timestamp,
    };
  }, [currentContext]);

  const value = {
    chatHistory,
    isLoading,
    error,
    currentContext,
    sendMessage,
    clearChat,
    removeMessage,
    getContextInfo,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export { ChatContext };
