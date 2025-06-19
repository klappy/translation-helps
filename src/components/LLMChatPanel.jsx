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

  const {
    chatHistory,
    isLoading,
    error,
    sendMessage,
    clearChat,
    getContextInfo,
    areResourcesReady,
    getResourceStatus,
    resourceChangeNotification,
    referenceHistory,
    dismissResourceChangeNotification,
    startNewConversation,
    sessionCost,
    getSessionCostInfo,
  } = useChat();

  // Get resource status for UI display
  const resourceStatus = getResourceStatus();

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
    if (!inputMessage.trim() || isLoading || !areResourcesReady()) return;

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

  const formatCostDisplay = (cost) => {
    if (cost < 0.0001) {
      return "<$0.0001";
    }
    return `$${cost.toFixed(4)}`;
  };

  const getCostColor = (cost) => {
    if (cost < 0.01) return styles.costLow;
    if (cost < 0.1) return styles.costMedium;
    return styles.costHigh;
  };

  const getSessionCostColor = (total) => {
    if (total < 0.01) return styles.sessionCostLow;
    if (total < 0.1) return styles.sessionCostMedium;
    return styles.sessionCostHigh;
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
            {isAssistant && message.costEstimate && (
              <div
                className={`${styles.messageCost} ${getCostColor(message.costEstimate.totalCost)}`}
                title={`Message Cost Breakdown
Context: ${message.costEstimate.contextSize}
Input: ${
                  message.costEstimate.actualInputTokens
                    ? `${message.costEstimate.actualInputTokens.toLocaleString()} tokens (actual)`
                    : `${message.costEstimate.estimatedInputTokens.toLocaleString()} tokens (estimated)`
                } ($${message.costEstimate.inputCost.toFixed(4)})
Output: ${
                  message.costEstimate.actualOutputTokens
                    ? `${message.costEstimate.actualOutputTokens.toLocaleString()} tokens (actual)`
                    : `${message.costEstimate.estimatedOutputTokens.toLocaleString()} tokens (estimated)`
                } ($${message.costEstimate.outputCost.toFixed(4)})
Total: ${formatCostDisplay(message.costEstimate.totalCost)}

Resources Used:
${message.costEstimate.resources.scripture === "✓" ? "✓" : "✗"} Scripture
${message.costEstimate.resources.translationNotes ? "✓" : "✗"} Notes (${
                  message.costEstimate.resources.translationNotes
                })
${message.costEstimate.resources.translationQuestions ? "✓" : "✗"} Questions (${
                  message.costEstimate.resources.translationQuestions
                })
${message.costEstimate.resources.translationWords ? "✓" : "✗"} Words (${
                  message.costEstimate.resources.translationWords
                })
${message.costEstimate.resources.translationWordLinks ? "✓" : "✗"} Links (${
                  message.costEstimate.resources.translationWordLinks
                })

Model: ${message.costEstimate.model}`}
              >
                <span className={styles.costBadge}>{formatCostDisplay(message.costEstimate.totalCost)}</span>
              </div>
            )}
            {message.metadata?.mock && <span className={styles.mockBadge}>MOCK</span>}
          </div>
        </div>
      </div>
    );
  };

  const contextInfo = getContextInfo();
  const referenceDisplay =
    referenceHistory && referenceHistory.length > 0
      ? referenceHistory.join(" \u2192 ")
      : contextInfo?.reference;

  return (
    <div className={styles.chatPanel} data-testid='llm-chat-panel'>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <h3>Translation Assistant</h3>
          <span className={styles.subtitle}>Powered by AI</span>
        </div>
        <div className={styles.headerActions}>
          {resourceStatus?.ready && contextInfo && (
            <div className={styles.contextIndicator} title='Current context loaded'>
              <span className={styles.contextIcon}>📚</span>
              <span className={styles.contextText}>
                {referenceDisplay} ({contextInfo.resourceCount} resources)
              </span>
            </div>
          )}
          {resourceStatus?.loading && (
            <div className={styles.loadingIndicator} title='Loading translation resources...'>
              <span className={styles.loadingIcon}>⏳</span>
              <span className={styles.loadingText}>Loading resources...</span>
            </div>
          )}
          {sessionCost.total > 0 && (
            <div
              className={`${styles.sessionCostIndicator} ${getSessionCostColor(sessionCost.total)}`}
              title={`Session Cost Summary
Messages: ${sessionCost.messageCount} AI responses
Total Input: ${sessionCost.totalTokens.input.toLocaleString()} tokens
Total Output: ${sessionCost.totalTokens.output.toLocaleString()} tokens
Total Cost: ${formatCostDisplay(sessionCost.total)}
Average/Message: ${formatCostDisplay(
                sessionCost.messageCount > 0 ? sessionCost.total / sessionCost.messageCount : 0
              )}

Model: GPT-4o-mini`}
            >
              <span className={styles.sessionCostIcon}>💰</span>
              <span className={styles.sessionCostText}>{formatCostDisplay(sessionCost.total)}</span>
            </div>
          )}
          <button
            onClick={() => {
              const contextInfo = getContextInfo();
              console.log("🐛 DEBUG: Current Chat Context");
              console.log("  - Context Info:", contextInfo);
              console.log("  - Resources Ready:", areResourcesReady());
              console.log("  - Resource Status:", resourceStatus);
              console.log("  - Reference History:", referenceHistory);
              console.log("  - Chat History Length:", chatHistory.length);

              // Get the full formatted context from ResourcesContext
              if (window._resourcesContext && window._resourcesContext.getFormattedContext) {
                const formattedContext = window._resourcesContext.getFormattedContext();
                console.log("📋 DEBUG: Formatted Context for LLM");
                console.log("  - Reference:", formattedContext?.reference);
                console.log("  - Scripture Text:", formattedContext?.resources?.scriptureText);
                console.log("  - Alignment Data:", formattedContext?.resources?.alignmentData);
                console.log("  - Full Context:", formattedContext);
              } else {
                console.log("⚠️ ResourcesContext not available in window._resourcesContext");
              }
            }}
            className={styles.clearButton}
            title='Debug: Log current context'
            style={{ marginRight: "8px" }}
          >
            🐛
          </button>
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

      {/* Context Change Indicator - Non-blocking visual feedback */}
      {resourceChangeNotification && (
        <div className={styles.contextChangeIndicator}>
          <div className={styles.contextChangeContent}>
            <span className={styles.contextChangeIcon}>📚</span>
            <div className={styles.contextChangeText}>
              <strong>Context Updated</strong>
              <p>
                Switched from {resourceChangeNotification.previousReference} to{" "}
                {resourceChangeNotification.newReference}
              </p>
              <p className={styles.contextChangeNote}>
                Your next message will use the new reference and resources.
              </p>
            </div>
            <button
              onClick={dismissResourceChangeNotification}
              className={styles.dismissButton}
              title='Dismiss notification'
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Resource Loading Status */}
      {!resourceStatus?.ready && resourceStatus?.loading && (
        <div className={styles.resourceLoadingStatus}>
          <div className={styles.loadingHeader}>
            <span className={styles.loadingIcon}>📚</span>
            <span>Loading Translation Resources...</span>
          </div>
          <div className={styles.resourceDetails}>
            <div className={styles.resourceItem}>
              <span className={resourceStatus.details.scripture ? styles.ready : styles.loading}>
                {resourceStatus.details.scripture ? "✓" : "⏳"}
              </span>
              <span>Scripture Text</span>
              {resourceStatus.resourceCounts?.scripture > 0 && (
                <span className={styles.count}>({resourceStatus.resourceCounts.scripture})</span>
              )}
            </div>
            <div className={styles.resourceItem}>
              <span
                className={resourceStatus.details.translationNotes ? styles.ready : styles.loading}
              >
                {resourceStatus.details.translationNotes ? "✓" : "⏳"}
              </span>
              <span>Translation Notes</span>
              {resourceStatus.resourceCounts?.translationNotes > 0 && (
                <span className={styles.count}>
                  ({resourceStatus.resourceCounts.translationNotes})
                </span>
              )}
            </div>
            <div className={styles.resourceItem}>
              <span
                className={
                  resourceStatus.details.translationQuestions ? styles.ready : styles.loading
                }
              >
                {resourceStatus.details.translationQuestions ? "✓" : "⏳"}
              </span>
              <span>Translation Questions</span>
              {resourceStatus.resourceCounts?.translationQuestions > 0 && (
                <span className={styles.count}>
                  ({resourceStatus.resourceCounts.translationQuestions})
                </span>
              )}
            </div>
            <div className={styles.resourceItem}>
              <span
                className={resourceStatus.details.translationWords ? styles.ready : styles.loading}
              >
                {resourceStatus.details.translationWords ? "✓" : "⏳"}
              </span>
              <span>Translation Words</span>
              {resourceStatus.resourceCounts?.translationWords > 0 && (
                <span className={styles.count}>
                  ({resourceStatus.resourceCounts.translationWords})
                </span>
              )}
            </div>
            <div className={styles.resourceItem}>
              <span
                className={
                  resourceStatus.details.translationWordLinks ? styles.ready : styles.loading
                }
              >
                {resourceStatus.details.translationWordLinks ? "✓" : "⏳"}
              </span>
              <span>Translation Word Links</span>
              {resourceStatus.resourceCounts?.translationWordLinks > 0 && (
                <span className={styles.count}>
                  ({resourceStatus.resourceCounts.translationWordLinks})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Message */}
      {chatHistory.length === 0 && resourceStatus?.ready && (
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
          <div className={styles.availableResources}>
            <p>
              <strong>Available Resources:</strong>
            </p>
            <div className={styles.resourcesList}>
              {resourceStatus.resourceCounts?.scripture > 0 && (
                <span className={styles.resourceTag}>Scripture ✓</span>
              )}
              {resourceStatus.resourceCounts?.translationNotes > 0 && (
                <span className={styles.resourceTag}>
                  Notes ({resourceStatus.resourceCounts.translationNotes}) ✓
                </span>
              )}
              {resourceStatus.resourceCounts?.translationQuestions > 0 && (
                <span className={styles.resourceTag}>
                  Questions ({resourceStatus.resourceCounts.translationQuestions}) ✓
                </span>
              )}
              {resourceStatus.resourceCounts?.translationWords > 0 && (
                <span className={styles.resourceTag}>
                  Words ({resourceStatus.resourceCounts.translationWords}) ✓
                </span>
              )}
              {resourceStatus.resourceCounts?.translationWordLinks > 0 && (
                <span className={styles.resourceTag}>
                  Links ({resourceStatus.resourceCounts.translationWordLinks}) ✓
                </span>
              )}
            </div>
          </div>
          <p className={styles.promptSuggestion}>
            Try asking: "What are the key translation challenges for this verse?"
          </p>
        </div>
      )}

      {/* Resources Not Ready Message */}
      {chatHistory.length === 0 && !resourceStatus?.ready && !resourceStatus?.loading && (
        <div className={styles.notReadyMessage}>
          <div className={styles.notReadyIcon}>⚠️</div>
          <h4>Resources Not Available</h4>
          <p>
            Translation resources are not currently available for this verse. Please check your
            connection or try a different verse.
          </p>
          {resourceStatus?.error && (
            <div className={styles.errorDetails}>
              <strong>Error:</strong> {resourceStatus.error}
            </div>
          )}
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
            placeholder={
              !areResourcesReady()
                ? "Waiting for translation resources to load..."
                : "Ask about translation notes, word meanings, context..."
            }
            className={styles.messageInput}
            disabled={isLoading || !areResourcesReady()}
            rows={1}
            maxLength={4000}
          />
          <button
            onClick={handleSendMessage}
            className={styles.sendButton}
            disabled={!inputMessage.trim() || isLoading || !areResourcesReady()}
            title={
              !areResourcesReady() ? "Waiting for resources to load..." : "Send message (Enter)"
            }
          >
            {isLoading ? (
              <span className={styles.loadingSpinner}>⏳</span>
            ) : !areResourcesReady() ? (
              <span className={styles.waitingSpinner}>⏳</span>
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
