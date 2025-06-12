/**
 * LLMChatPanel.jsx
 * Main chat interface component for LLM translation assistance
 */

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { MarkdownWithRcLinks } from "../utils/markdownUtils";
import { enhanceLLMResponse } from "../utils/emojiEnhancer";
import styles from "./LLMChatPanel.module.css";

export function LLMChatPanel({ reference }) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { chatHistory, isLoading, error, sendMessage, clearChat, getContextInfo } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Check if scrollIntoView exists (not available in JSDOM test environment)
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message) => {
    const isUser = message.type === "user";
    const isError = message.type === "error";
    const isAssistant = message.type === "assistant";

    return (
      <div
        key={message.id}
        className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage} ${
          isError ? styles.errorMessage : ""
        }`}
      >
        <div className={styles.messageContent}>
          <div className={styles.messageText}>
            {isAssistant ? (
              <MarkdownWithRcLinks
                content={enhanceLLMResponse(message.content, {
                  enabled: true,
                  maxEmojisPerResponse: 6,
                  excludeCategories: [],
                })}
                onRcLinkClick={(rcLink) => {
                  // Handle RC link clicks in chat context if needed
                  console.log("RC link clicked in chat:", rcLink);
                }}
              />
            ) : (
              message.content
            )}
          </div>
          <div className={styles.messageTime}>
            {formatTimestamp(message.timestamp)}
            {message.metadata?.mock && <span className={styles.mockBadge}>MOCK</span>}
          </div>
        </div>
      </div>
    );
  };

  const contextInfo = getContextInfo();

  return (
    <div className={styles.chatPanel} data-testid='llm-chat-panel'>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <h3>Translation Assistant</h3>
          <span className={styles.subtitle}>Powered by AI</span>
        </div>
        <div className={styles.headerActions}>
          {contextInfo && (
            <div className={styles.contextIndicator} title='Current context loaded'>
              <span className={styles.contextIcon}>📚</span>
              <span className={styles.contextText}>
                {contextInfo.reference} ({contextInfo.resourceCount} resources)
              </span>
            </div>
          )}
          <button
            onClick={clearChat}
            className={styles.clearButton}
            title='Clear conversation'
            disabled={chatHistory.length === 0}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      {chatHistory.length === 0 && (
        <div className={styles.welcomeMessage}>
          <div className={styles.welcomeIcon}>🤖</div>
          <h4>Welcome to Translation Assistant!</h4>
          <p>
            I have access to all translation resources for the current verse. Ask me anything about:
          </p>
          <ul>
            <li>Translation notes and explanations</li>
            <li>Key words and their meanings</li>
            <li>Cultural and historical context</li>
            <li>Translation questions and challenges</li>
          </ul>
          <p className={styles.promptSuggestion}>
            Try asking: "What are the key translation challenges for this verse?"
          </p>
        </div>
      )}

      {/* Chat Messages */}
      <div className={styles.messagesContainer}>
        {chatHistory.map(renderMessage)}
        {isLoading && (
          <div className={styles.loadingMessage}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className={styles.loadingText}>AI is thinking...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorBanner}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>{error}</span>
        </div>
      )}

      {/* Chat Input */}
      <div className={styles.chatInput}>
        <div className={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Ask about translation notes, word meanings, context...'
            className={styles.messageInput}
            disabled={isLoading}
            rows={1}
            maxLength={4000}
          />
          <button
            onClick={handleSendMessage}
            className={styles.sendButton}
            disabled={!inputMessage.trim() || isLoading}
            title='Send message (Enter)'
          >
            {isLoading ? (
              <span className={styles.loadingSpinner}>⏳</span>
            ) : (
              <span className={styles.sendIcon}>➤</span>
            )}
          </button>
        </div>
        <div className={styles.inputFooter}>
          <span className={styles.charCount}>{inputMessage.length}/4000</span>
          {import.meta.env.VITE_USE_MOCK_CHAT === "true" && (
            <span className={styles.devIndicator}>Using Mock Responses</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default LLMChatPanel;
