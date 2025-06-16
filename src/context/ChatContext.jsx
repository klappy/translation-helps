/**
 * ChatContext.jsx
 * React context for managing LLM chat state and conversation history
 * Updated to use ResourcesContext for anti-hallucination measures
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
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
  // Keep a running history of references used during the conversation
  const [referenceHistory, setReferenceHistory] = useState([]);
  const [resourceChangeNotification, setResourceChangeNotification] = useState(null);
  const [sessionCost, setSessionCost] = useState({
    total: 0,
    messageCount: 0,
    totalTokens: { input: 0, output: 0 },
    messages: [], // Store individual message costs
  });

  /**
   * Updates the active reference and records it in the history array
   */
  const updateConversationReference = useCallback((newRef) => {
    setConversationReference((prevRef) => {
      if (prevRef !== newRef) {
        setReferenceHistory((hist) =>
          hist[hist.length - 1] !== newRef ? [...hist, newRef] : hist
        );
      }
      return newRef;
    });
  }, []);

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
   * Uses seamless context slipstreaming - no blocking behavior on context changes
   */
  const sendMessage = useCallback(
    async (message) => {
      setIsLoading(true);
      setError(null);

      try {
        // Get the latest context from ResourcesContext - always use current context
        const context = getFormattedContext();

        // Track context changes for seamless slipstreaming
        const previousRef = conversationReference;
        const currentRef = context?.reference?.citation;
        const contextChanged = previousRef && currentRef && previousRef !== currentRef;

        // Add user message to history immediately with context info
        const userMessage = {
          id: Date.now().toString(),
          type: "user",
          content: message,
          timestamp: new Date().toISOString(),
          contextUsed: currentRef || "Loading...",
          contextChanged: contextChanged,
        };

        setChatHistory((prev) => [...prev, userMessage]);

        // If context is not available, provide helpful error without crashing
        if (!context) {
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            content:
              "I don't have access to translation resources for the current reference yet. Please wait a moment for the resources to load, or try a different verse.",
            timestamp: new Date().toISOString(),
            metadata: {
              mock: false,
              noContext: true,
              contextUsed: "No context available",
            },
          };

          setChatHistory((prev) => [...prev, errorMessage]);
          return;
        }

        // Validate the request (but don't block on loading states)
        const validation = validateChatRequest(message, context);
        if (!validation.valid) {
          throw new Error(validation.errors.join(", "));
        }

        // Update conversation reference and context
        updateConversationReference(currentRef);
        setCurrentContext(context);

        // Determine if we should use mock response
        const useMock = import.meta.env.VITE_USE_MOCK_CHAT === "true";

        let response;
        if (useMock) {
          // Use mock response for development
          response = createMockResponse(message, context);
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          // Send to actual LLM with current context
          response = await sendChatMessage(message, context, chatHistory);
        }

        if (response.success) {
          // Prepare context change notification for AI response
          let contextChangeNote = "";
          if (contextChanged) {
            contextChangeNote = `\n\n📚 *Context updated to ${currentRef}* - I now have access to resources for this new reference.`;
          }

          const aiMessage = {
            id: (Date.now() + 2).toString(),
            type: "assistant",
            content: response.response + contextChangeNote,
            timestamp: response.timestamp,
            costEstimate: response.costEstimate,
            metadata: {
              ...response.metadata,
              contextUsed: currentRef,
              contextChanged: contextChanged,
              previousContext: previousRef,
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

        // Add error message to chat without crashing
        const errorMessage = {
          id: (Date.now() + 3).toString(),
          type: "assistant",
          content: `I encountered an issue: ${err.message}. Please try again or wait for resources to finish loading.`,
          timestamp: new Date().toISOString(),
          metadata: {
            error: true,
            errorType: err.name || "ChatError",
          },
        };

        setChatHistory((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [getFormattedContext, chatHistory, conversationReference]
  );

  /**
   * Clears the chat history and resets conversation state
   */
  const clearChat = useCallback(() => {
    setChatHistory([]);
    setCurrentContext(null);
    setError(null);
    setConversationReference(null);
    setReferenceHistory([]);
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

  // Track reference changes for seamless context updates (no blocking notifications)
  useEffect(() => {
    if (conversationReference && reference && chatHistory.length > 0) {
      const currentRef = `${reference.bookId} ${reference.chapter}:${reference.verse}`;
      if (conversationReference !== currentRef) {
        // Just update the conversation reference silently - no blocking notifications
        updateConversationReference(currentRef);
        console.log(`[ChatContext] Context updated from ${conversationReference} to ${currentRef}`);
      }
    }
  }, [reference, conversationReference, chatHistory.length, updateConversationReference]);

  const value = {
    chatHistory,
    isLoading,
    error,
    currentContext,
    conversationReference,
    referenceHistory,
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
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export { ChatContext };
