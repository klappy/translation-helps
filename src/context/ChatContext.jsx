/**
 * ChatContext.jsx
 * Simplified React context for managing LLM chat state
 * Works with the new antifragile event-driven AI architecture
 */

import React, { createContext, useContext, useState, useCallback } from "react";

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isReady, setIsReady] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Add a message to the chat history
   */
  const addMessage = useCallback((message) => {
    const newMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...message
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    console.log(`💬 ChatContext: Added ${message.role} message`, newMessage);
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    console.log(`💬 ChatContext: Cleared all messages`);
  }, []);

  /**
   * Activate AI tab (placeholder for compatibility)
   */
  const activateAITab = useCallback(() => {
    console.log(`💬 ChatContext: AI tab activated`);
  }, []);

  /**
   * Set error state
   */
  const setErrorState = useCallback((errorMsg) => {
    setError(errorMsg);
    console.log(`💬 ChatContext: Error set - ${errorMsg}`);
  }, []);

  const value = {
    messages,
    addMessage,
    clearMessages,
    isReady,
    error,
    activateAITab,
    setError: setErrorState,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export { ChatContext };
