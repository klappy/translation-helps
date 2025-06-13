/**
 * ChatContext.jsx
 * React context for managing LLM chat state and conversation history
 * Updated to use ResourcesContext for anti-hallucination measures
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
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
  const [conversationReference, setConversationReference] = useState(null);
  const [resourceChangeNotification, setResourceChangeNotification] = useState(null);
  const [sessionCost, setSessionCost] = useState({
    total: 0,
    messageCount: 0,
    totalTokens: { input: 0, output: 0 },
    messages: [], // Store individual message costs
  });

  // Get current reference from ReferenceContext
  const referenceContext = useReferenceContext();
  const { reference } = referenceContext;

  // Get current resources from ResourcesContext
  const {
    getFormattedContext,
    isLoading: resourcesLoading,
    loadingStates,
    error: resourcesError,
  } = useResourcesContext();

  /**
   * Check if resources are ready for chat
   */
  const areResourcesReady = useCallback(() => {
    // Resources are ready if they're not loading and we have a valid context
    const context = getFormattedContext();
    if (!context) return false;

    // Check if any critical resources are still loading
    const criticalLoading = resourcesLoading || loadingStates.manifests;

    return !criticalLoading;
  }, [getFormattedContext, resourcesLoading, loadingStates]);

  /**
   * Get resource readiness status for UI
   */
  const getResourceStatus = useCallback(() => {
    const context = getFormattedContext();

    return {
      ready: areResourcesReady(),
      loading: resourcesLoading,
      error: resourcesError,
      details: {
        manifests: !loadingStates.manifests,
        scripture: !loadingStates.scripture,
        translationNotes: !loadingStates.translationNotes,
        translationQuestions: !loadingStates.translationQuestions,
        translationWords: !loadingStates.translationWords,
        translationWordLinks: !loadingStates.translationWordLinks,
      },
      contextAvailable: !!context,
      resourceCounts: context
        ? {
            scripture: context.resources.scripture ? 1 : 0,
            translationNotes: context.resources.translationNotes.length,
            translationQuestions: context.resources.translationQuestions.length,
            translationWords: context.resources.translationWords.length,
            translationWordLinks: context.resources.translationWordLinks.length,
          }
        : null,
    };
  }, [areResourcesReady, getFormattedContext, resourcesLoading, resourcesError, loadingStates]);

  /**
   * Sends a message to the LLM with current context from ResourcesContext
   * Now includes resource readiness checks and enhanced logging
   */
  const sendMessage = useCallback(
    async (message) => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if resources are ready before sending
        if (!areResourcesReady()) {
          throw new Error(
            "Translation resources are still loading. Please wait for all resources to load before sending a message."
          );
        }

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

        // Track reference for this conversation
        if (!conversationReference) {
          setConversationReference(context.reference.citation);
        }

        setCurrentContext(context);

        // Add user message to history immediately
        const userMessage = {
          id: Date.now().toString(),
          type: "user",
          content: message,
          timestamp: new Date().toISOString(),
          contextUsed: context.reference.citation,
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
            costEstimate: response.costEstimate,
            metadata: {
              ...response.metadata,
              contextUsed: context.reference.citation,
              resourceCounts: {
                scripture: context.resources.scripture ? 1 : 0,
                translationNotes: context.resources.translationNotes.length,
                translationQuestions: context.resources.translationQuestions.length,
                translationWords: context.resources.translationWords.length,
                translationWordLinks: context.resources.translationWordLinks.length,
              },
            },
          };

          setChatHistory((prev) => [...prev, aiMessage]);

          // Update session cost tracking
          if (response.costEstimate) {
            setSessionCost((prev) => ({
              total: prev.total + response.costEstimate.totalCost,
              messageCount: prev.messageCount + 1,
              totalTokens: {
                input: prev.totalTokens.input + response.costEstimate.estimatedInputTokens,
                output: prev.totalTokens.output + response.costEstimate.estimatedOutputTokens,
              },
              messages: [
                ...prev.messages,
                {
                  id: aiMessage.id,
                  cost: response.costEstimate.totalCost,
                  tokens: {
                    input: response.costEstimate.estimatedInputTokens,
                    output: response.costEstimate.estimatedOutputTokens,
                  },
                  timestamp: response.timestamp,
                },
              ],
            }));
          }
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
    [getFormattedContext, chatHistory, areResourcesReady, conversationReference]
  );

  /**
   * Clears the chat history and resets conversation state
   */
  const clearChat = useCallback(() => {
    setChatHistory([]);
    setCurrentContext(null);
    setError(null);
    setConversationReference(null);
    setResourceChangeNotification(null);
    setSessionCost({
      total: 0,
      messageCount: 0,
      totalTokens: { input: 0, output: 0 },
      messages: [],
    });
  }, []);

  /**
   * Dismisses resource change notification
   */
  const dismissResourceChangeNotification = useCallback(() => {
    setResourceChangeNotification(null);
  }, []);

  /**
   * Starts a new conversation with current resources
   */
  const startNewConversation = useCallback(() => {
    clearChat();
    // The new reference will be set when the next message is sent
  }, [clearChat]);

  /**
   * Gets session cost information for display
   */
  const getSessionCostInfo = useCallback(() => {
    return {
      total: sessionCost.total,
      messageCount: sessionCost.messageCount,
      totalTokens: sessionCost.totalTokens,
      averageCostPerMessage:
        sessionCost.messageCount > 0 ? sessionCost.total / sessionCost.messageCount : 0,
      formatted: {
        total: `$${sessionCost.total.toFixed(4)}`,
        averagePerMessage:
          sessionCost.messageCount > 0
            ? `$${(sessionCost.total / sessionCost.messageCount).toFixed(4)}`
            : "$0.0000",
      },
    };
  }, [sessionCost]);

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

  // Detect reference changes during active conversations
  useEffect(() => {
    if (conversationReference && reference && chatHistory.length > 0) {
      const currentRef = `${reference.bookId} ${reference.chapter}:${reference.verse}`;
      if (conversationReference !== currentRef) {
        setResourceChangeNotification({
          previousReference: conversationReference,
          newReference: currentRef,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [reference, conversationReference, chatHistory.length]);

  const value = useMemo(
    () => ({
      chatHistory,
      isLoading,
      error,
      currentContext,
      conversationReference,
      resourceChangeNotification,
      sendMessage,
      clearChat,
      removeMessage,
      getContextInfo,
      areResourcesReady,
      getResourceStatus,
      dismissResourceChangeNotification,
      startNewConversation,
      sessionCost,
      getSessionCostInfo,
    }),
    [
      chatHistory,
      isLoading,
      error,
      currentContext,
      conversationReference,
      resourceChangeNotification,
      sendMessage,
      clearChat,
      removeMessage,
      getContextInfo,
      areResourcesReady,
      getResourceStatus,
      dismissResourceChangeNotification,
      startNewConversation,
      sessionCost,
      getSessionCostInfo,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export { ChatContext };
