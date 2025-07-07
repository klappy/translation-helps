/**
 * LLMChatPanel.jsx - Direct Context Access Pattern
 * Follows Simple Verse-Loading Pattern from docs/SIMPLE-VERSE-LOADING-PATTERN.md
 *
 * TRANSFORMATION: Reduced from 576 lines to ~150 lines
 * PATTERN: Multi-resource self-activation with direct context access
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChatContext } from "../context/ChatContext";
import { useResourcesContext } from "../context/ResourcesContext";
import { sendChatMessage } from "../services/llmChatService";
import { processMarkdownWithRcLinks } from "../utils/markdownUtils";
import { enhanceLLMResponse } from "../utils/emojiEnhancer";
import {
  extractVerseText,
  extractChapterText,
  validateCleanText,
  emergencyUSFMExtract,
} from "../utils/usfmTextExtractor";
import { TabIcon, ToggleSwitch } from "./shared";
import styles from "./LLMChatPanel.module.css";

export function LLMChatPanel() {
  const { resources, activateResource } = useResourcesContext();
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCost, setSessionCost] = useState(0);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Session-only resource filters - like faucet handles, no persistence
  const [resourceFilters, setResourceFilters] = useState({
    scripture: true,
    notes: true,
    questions: true,
    words: true,
    links: true,
  });

  // Track when resources are changed mid-conversation for visual feedback
  const [lastResourceChange, setLastResourceChange] = useState(null);

  // Ensure all resources are active for comprehensive AI context
  useEffect(() => {
    // Self-activating ALL resources for comprehensive AI context
    ["scripture", "notes", "questions", "words", "links"].forEach(activateResource);
  }, []); // Empty dependency array - only run once on mount

  const {
    messages,
    addMessage,
    clearMessages: contextClearMessages,
    activateAITab,
  } = useChatContext();

  // Enhanced clear messages that also resets session cost
  const clearMessages = useCallback(() => {
    contextClearMessages();
    setSessionCost(0);
  }, [contextClearMessages]);

  // Activate AI tab when component mounts
  useEffect(() => {
    // Component mounted - activating AI tab
    activateAITab();
  }, [activateAITab]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  // Get formatted context for LLM - ALWAYS ready and consistent
  const getFormattedContext = useCallback(() => {
    // Extract clean scripture text for LLM at runtime from raw USFM (antifragile pattern)
    let scriptureForLLM = null;
    let scriptureMetadata = null;

    if (resources.scripture && resources.reference) {
      // Raw USFM is the single source of truth - extract clean text at runtime
      const rawUsfm = resources.scripture;
      // Extracting clean text from raw USFM at runtime

      try {
        // Extract clean text - try chapter first for broader context, then specific verse
        let cleanText;
        let extractionMethod;

        try {
          // PRIMARY: Extract entire chapter with verse numbers for comprehensive LLM context
          cleanText = extractChapterText(rawUsfm, resources.reference.chapter);
          extractionMethod = "chapter";
        } catch (chapterError) {
          console.warn(
            "🔍 LLM Context: Chapter extraction failed, trying single verse:",
            chapterError.message
          );
          // Fallback: Extract specific verse with verse number
          cleanText = extractVerseText(
            rawUsfm,
            resources.reference.chapter,
            resources.reference.verse
          );
          extractionMethod = "verse";
        }

        const isClean = validateCleanText(cleanText);

        // If extraction returned empty or failed validation, log details
        if (!cleanText || cleanText.trim().length === 0) {
          throw new Error(`Extraction returned empty text for ${resources.reference.citation}`);
        }

        if (!isClean) {
          console.warn("⚠️ LLM Context: Extracted text contains markup patterns!");
        }

        scriptureForLLM = cleanText;
        scriptureMetadata = {
          extractedAt: new Date().toISOString(),
          isClean,
          originalLength: rawUsfm.length,
          cleanLength: cleanText.length,
          reference: resources.reference.citation,
          extractionMethod: extractionMethod,
        };
      } catch (error) {
        console.error("❌ LLM Context: Failed to extract clean text from USFM:", error);
        console.error("❌ LLM Context: Error details:", error.message, error.stack);
        console.log("🚨 LLM Context: Attempting emergency fallback extraction");

        // EMERGENCY FALLBACK: Use simple string operations for aligned Bibles
        try {
          const emergencyText = emergencyUSFMExtract(
            rawUsfm,
            resources.reference.chapter,
            resources.reference.verse
          );
          if (emergencyText && emergencyText.trim().length > 0) {
            scriptureForLLM = emergencyText;
            scriptureMetadata = {
              extractedAt: new Date().toISOString(),
              isClean: false, // Emergency extraction may not be perfectly clean
              originalLength: rawUsfm.length,
              cleanLength: emergencyText.length,
              reference: resources.reference.citation,
              extractionMethod: "emergency",
              fallbackReason: error.message,
            };
            console.log("✅ LLM Context: Emergency extraction successful");
          } else {
            throw new Error("Emergency extraction also failed");
          }
        } catch (emergencyError) {
          console.error("🚨 LLM Context: Emergency extraction failed:", emergencyError);

          // FINAL FALLBACK: Provide a helpful message instead of raw USFM
          scriptureForLLM = `[Scripture text for ${resources.reference.citation} is temporarily unavailable due to formatting complexity. Translation resources are still available.]`;
          scriptureMetadata = {
            extractedAt: new Date().toISOString(),
            isClean: true,
            originalLength: rawUsfm.length,
            cleanLength: scriptureForLLM.length,
            reference: resources.reference.citation,
            extractionMethod: "fallback-message",
            fallbackReason: "All extraction methods failed",
          };
          console.log("📝 LLM Context: Using fallback message for user-friendly experience");
        }
      }
    } else {
      // No scripture data or reference available
    }

    const formattedContext = {
      reference: resources.reference || null,
      resources: {
        scripture: resourceFilters.scripture ? scriptureForLLM : null,
        translationNotes: resourceFilters.notes ? resources.notes || [] : [],
        translationQuestions: resourceFilters.questions ? resources.questions || [] : [],
        translationWords: resourceFilters.words ? resources.words || [] : [],
        translationWordLinks: resourceFilters.links ? resources.links || [] : [],
      },
      metadata: {
        timestamp: Date.now(),
        contextSize: 0,
        resourceLoadingStatus: {
          scripture: !!scriptureForLLM,
          translationNotes: (resources.notes || []).length > 0,
          translationQuestions: (resources.questions || []).length > 0,
          translationWords: (resources.words || []).length > 0,
          translationWordLinks: (resources.links || []).length > 0,
        },
        scriptureMetadata: scriptureMetadata,
      },
    };

    return formattedContext;
  }, [resources, resourceFilters]);

  // Enhanced resource filter setter that tracks changes during conversation
  const handleResourceFilterChange = useCallback(
    (resourceType, checked) => {
      setResourceFilters((prev) => {
        const newFilters = { ...prev, [resourceType]: checked };

        // If we're in the middle of a conversation, track this change
        if (messages.length > 0) {
          setLastResourceChange({
            timestamp: Date.now(),
            resourceType,
            enabled: checked,
            activeResources: Object.entries(newFilters)
              .filter(([, enabled]) => enabled)
              .map(([type]) => type),
          });

          // Clear the indicator after 3 seconds
          setTimeout(() => setLastResourceChange(null), 3000);
        }

        return newFilters;
      });
    },
    [messages.length]
  );

  const handleSendMessage = async () => {
    if (!userInput.trim() || isSubmitting) return;

    const message = userInput.trim();
    setUserInput("");
    setIsSubmitting(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      // Add user message
      addMessage({ role: "user", content: message });

      // Context is ALWAYS ready and consistent
      const formattedContext = getFormattedContext();

      // Send to LLM service with context
      const response = await sendChatMessage(message, formattedContext);

      // Handle response properly
      if (response.success) {
        // Add successful AI response with resource context snapshot
        addMessage({
          role: "assistant",
          content: response.response,
          costEstimate: response.costEstimate,
          metadata: response.metadata,
          resourceContext: {
            activeFilters: { ...resourceFilters },
            includedResources: {
              scripture: resourceFilters.scripture && !!resources.scripture,
              notes: resourceFilters.notes && (resources.notes?.length || 0) > 0,
              questions: resourceFilters.questions && (resources.questions?.length || 0) > 0,
              words: resourceFilters.words && (resources.words?.length || 0) > 0,
              links: resourceFilters.links && (resources.links?.length || 0) > 0,
            },
            resourceCounts: {
              notes: resourceFilters.notes ? resources.notes?.length || 0 : 0,
              questions: resourceFilters.questions ? resources.questions?.length || 0 : 0,
              words: resourceFilters.words ? resources.words?.length || 0 : 0,
              links: resourceFilters.links ? resources.links?.length || 0 : 0,
            },
            totalCount: [
              resourceFilters.scripture && !!resources.scripture,
              resourceFilters.notes && (resources.notes?.length || 0) > 0,
              resourceFilters.questions && (resources.questions?.length || 0) > 0,
              resourceFilters.words && (resources.words?.length || 0) > 0,
              resourceFilters.links && (resources.links?.length || 0) > 0,
            ].filter(Boolean).length,
            timestamp: Date.now(),
          },
        });

        // Update session cost if available
        if (response.costEstimate?.totalCost) {
          setSessionCost((prev) => prev + response.costEstimate.totalCost);
        }
      } else {
        // Add error message
        addMessage({
          role: "error",
          content: response.error || "Unknown error occurred while processing your message.",
        });
      }

      // Activate AI tab to show the response
      activateAITab();
    } catch (error) {
      console.error("Error sending message:", error);

      // Add user-friendly error message
      let errorMessage = "Sorry, there was an error processing your message. ";

      if (error.message?.includes("timeout")) {
        errorMessage += "The request timed out. Please try again with a shorter message.";
      } else if (error.message?.includes("network")) {
        errorMessage += "Network connection issue. Please check your connection and try again.";
      } else {
        errorMessage += "Please try again in a moment.";
      }

      addMessage({
        role: "error",
        content: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const getSessionCostColor = (total) => {
    if (total < 0.01) return styles.sessionCostLow;
    if (total < 0.1) return styles.sessionCostMedium;
    return styles.sessionCostHigh;
  };

  // Handle clicking on prompt suggestions
  const handlePromptSuggestionClick = async (prompt) => {
    if (isSubmitting) return;
    setUserInput(prompt);
    // Auto-send the message
    setTimeout(() => handleSendMessage(), 100);
  };

  // Get contextual prompt suggestions based on available resources
  const getPromptSuggestions = () => {
    const suggestions = [
      "What are the key translation challenges for this verse?",
      "Explain the cultural context of this passage",
      "What are the important words to understand in this verse?",
    ];

    // Add resource-specific suggestions
    if ((resources.notes || []).length > 0) {
      suggestions.push("Summarize the translation notes for this verse");
    }

    if ((resources.questions || []).length > 0) {
      suggestions.push("What questions should translators consider?");
    }

    if ((resources.words || []).length > 0) {
      suggestions.push("Define the key theological terms in this passage");
    }

    return suggestions.slice(0, 6);
  };

  const renderMessage = (message) => {
    const isUser = message.role === "user";
    const isError = message.role === "error";
    const isAssistant = message.role === "assistant";

    return (
      <div
        key={message.id}
        className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage} ${
          isError ? styles.errorMessage : ""
        }`}
      >
        <div className={styles.messageContent}>
          <div className={styles.messageText}>
            {isAssistant
              ? processMarkdownWithRcLinks(
                  enhanceLLMResponse(message.content, {
                    enabled: true,
                    maxEmojisPerResponse: 6,
                    excludeCategories: [],
                  }),
                  (rcLink) => {
                    // RC link clicked in chat
                  }
                )
              : message.content}
          </div>
          <div className={styles.messageTime}>
            {formatTimestamp(message.timestamp)}
            {isAssistant && message.costEstimate && (
              <div className={styles.messageCost}>
                <span className={styles.costBadge}>
                  {formatCostDisplay(message.costEstimate.totalCost)}
                </span>
              </div>
            )}
            {isAssistant && message.resourceContext && (
              <div
                className={styles.messageResources}
                title={`Resources used: ${
                  Object.entries(message.resourceContext.includedResources)
                    .filter(([, included]) => included)
                    .map(([type]) => {
                      if (type === "scripture") return "Scripture";
                      if (type === "notes")
                        return `Notes (${message.resourceContext.resourceCounts.notes})`;
                      if (type === "questions")
                        return `Questions (${message.resourceContext.resourceCounts.questions})`;
                      if (type === "words")
                        return `Words (${message.resourceContext.resourceCounts.words})`;
                      if (type === "links")
                        return `Links (${message.resourceContext.resourceCounts.links})`;
                      return type;
                    })
                    .join(", ") || "No resources"
                }`}
              >
                <span className={styles.resourceBadge}>
                  📚 {message.resourceContext.totalCount}
                </span>
              </div>
            )}
            {message.metadata?.mock && <span className={styles.mockBadge}>MOCK</span>}
          </div>
        </div>
      </div>
    );
  };

  // Get current context info for display - memoized to respond to verse changes
  const contextInfo = useMemo(() => {
    const totalResources =
      (resources.scripture ? 1 : 0) +
      (resources.notes?.length || 0) +
      (resources.questions?.length || 0) +
      (resources.words?.length || 0) +
      (resources.links?.length || 0);

    return {
      reference: resources.reference?.citation || "No reference",
      resourceCount: totalResources,
    };
  }, [
    resources.reference?.citation,
    resources.scripture,
    resources.notes?.length,
    resources.questions?.length,
    resources.words?.length,
    resources.links?.length,
  ]);

  return (
    <div className={styles.chatPanel} data-testid='llm-chat-panel'>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <h3>Translation Assistant</h3>
          <span className={styles.subtitle}>Powered by AI</span>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.contextIndicator} title='Current context'>
            <span className={styles.contextIcon}>📚</span>
            <span className={styles.contextText}>
              {contextInfo.reference} ({contextInfo.resourceCount} sources)
            </span>
          </div>

          {sessionCost > 0 && (
            <div
              className={`${styles.sessionCostIndicator} ${getSessionCostColor(sessionCost)}`}
              title={`Total conversation cost: ${formatCostDisplay(sessionCost)}`}
            >
              <span className={styles.sessionCostIcon}>💰</span>
              <span className={styles.sessionCostText}>{formatCostDisplay(sessionCost)}</span>
            </div>
          )}

          <button
            onClick={clearMessages}
            className={styles.clearButton}
            title='Clear conversation'
            disabled={messages.length === 0}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className={styles.welcomeMessage}>
          <div className={styles.welcomeIcon}>
            <TabIcon type='chat' className={styles.tabIcon} />
          </div>
          <h4>Welcome to Translation Assistant!</h4>
          <p>I can help with translation resources. Ask me anything about:</p>
          <ul>
            <li>Translation notes and explanations</li>
            <li>Key words and their meanings</li>
            <li>Cultural and historical context</li>
            <li>Translation questions and challenges</li>
          </ul>

          {/* Show current resources with toggles */}
          {contextInfo.resourceCount > 0 && (
            <div className={styles.availableResources}>
              <p>
                <strong>Include in AI Context:</strong>
              </p>
              <div className={styles.resourcesList}>
                {resources.scripture && (
                  <div
                    className={`${styles.resourceTag} ${
                      resourceFilters.scripture ? styles.enabled : styles.disabled
                    }`}
                  >
                    <span className={styles.resourceText}>Scripture ✓</span>
                    <ToggleSwitch
                      checked={resourceFilters.scripture}
                      onChange={(checked) =>
                        setResourceFilters((prev) => ({ ...prev, scripture: checked }))
                      }
                      size='small'
                    />
                  </div>
                )}
                {(resources.notes?.length || 0) > 0 && (
                  <div
                    className={`${styles.resourceTag} ${
                      resourceFilters.notes ? styles.enabled : styles.disabled
                    }`}
                  >
                    <span className={styles.resourceText}>Notes ({resources.notes.length}) ✓</span>
                    <ToggleSwitch
                      checked={resourceFilters.notes}
                      onChange={(checked) =>
                        setResourceFilters((prev) => ({ ...prev, notes: checked }))
                      }
                      size='small'
                    />
                  </div>
                )}
                {(resources.questions?.length || 0) > 0 && (
                  <div
                    className={`${styles.resourceTag} ${
                      resourceFilters.questions ? styles.enabled : styles.disabled
                    }`}
                  >
                    <span className={styles.resourceText}>
                      Questions ({resources.questions.length}) ✓
                    </span>
                    <ToggleSwitch
                      checked={resourceFilters.questions}
                      onChange={(checked) =>
                        setResourceFilters((prev) => ({ ...prev, questions: checked }))
                      }
                      size='small'
                    />
                  </div>
                )}
                {(resources.words?.length || 0) > 0 && (
                  <div
                    className={`${styles.resourceTag} ${
                      resourceFilters.words ? styles.enabled : styles.disabled
                    }`}
                  >
                    <span className={styles.resourceText}>Words ({resources.words.length}) ✓</span>
                    <ToggleSwitch
                      checked={resourceFilters.words}
                      onChange={(checked) =>
                        setResourceFilters((prev) => ({ ...prev, words: checked }))
                      }
                      size='small'
                    />
                  </div>
                )}
                {(resources.links?.length || 0) > 0 && (
                  <div
                    className={`${styles.resourceTag} ${
                      resourceFilters.links ? styles.enabled : styles.disabled
                    }`}
                  >
                    <span className={styles.resourceText}>Links ({resources.links.length}) ✓</span>
                    <ToggleSwitch
                      checked={resourceFilters.links}
                      onChange={(checked) =>
                        setResourceFilters((prev) => ({ ...prev, links: checked }))
                      }
                      size='small'
                    />
                  </div>
                )}
              </div>

              {/* Quick Presets for Testing */}
              <div className={styles.quickPresets}>
                <p>
                  <strong>Quick Presets:</strong>
                </p>
                <div className={styles.presetButtons}>
                  <button
                    className={styles.presetButton}
                    onClick={() =>
                      setResourceFilters({
                        scripture: true,
                        notes: true,
                        questions: true,
                        words: true,
                        links: true,
                      })
                    }
                  >
                    All On
                  </button>
                  <button
                    className={styles.presetButton}
                    onClick={() =>
                      setResourceFilters({
                        scripture: true,
                        notes: false,
                        questions: false,
                        words: false,
                        links: false,
                      })
                    }
                  >
                    Scripture Only
                  </button>
                  <button
                    className={styles.presetButton}
                    onClick={() =>
                      setResourceFilters({
                        scripture: false,
                        notes: true,
                        questions: false,
                        words: false,
                        links: false,
                      })
                    }
                  >
                    Notes Only
                  </button>
                  <button
                    className={styles.presetButton}
                    onClick={() =>
                      setResourceFilters({
                        scripture: false,
                        notes: false,
                        questions: false,
                        words: false,
                        links: false,
                      })
                    }
                  >
                    None
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.promptSuggestions}>
            <p>
              <strong>Try asking:</strong>
            </p>
            <div className={styles.suggestionsList}>
              {getPromptSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  className={styles.suggestionButton}
                  onClick={() => handlePromptSuggestionClick(suggestion)}
                  disabled={isSubmitting}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mid-Conversation Resource Toggles - Show when there are messages and resources available */}
      {messages.length > 0 && contextInfo.resourceCount > 0 && (
        <div className={styles.midConversationToggles}>
          <div className={styles.togglesHeader}>
            <span className={styles.togglesLabel}>🎛️ Adjust Context:</span>
            <div className={styles.compactResourcesList}>
              {resources.scripture && (
                <div
                  className={`${styles.compactResourceTag} ${
                    resourceFilters.scripture ? styles.enabled : styles.disabled
                  }`}
                >
                  <span className={styles.compactResourceText}>Scr</span>
                  <ToggleSwitch
                    checked={resourceFilters.scripture}
                    onChange={(checked) => handleResourceFilterChange("scripture", checked)}
                    size='small'
                  />
                </div>
              )}
              {(resources.notes?.length || 0) > 0 && (
                <div
                  className={`${styles.compactResourceTag} ${
                    resourceFilters.notes ? styles.enabled : styles.disabled
                  }`}
                >
                  <span className={styles.compactResourceText}>Notes</span>
                  <ToggleSwitch
                    checked={resourceFilters.notes}
                    onChange={(checked) => handleResourceFilterChange("notes", checked)}
                    size='small'
                  />
                </div>
              )}
              {(resources.questions?.length || 0) > 0 && (
                <div
                  className={`${styles.compactResourceTag} ${
                    resourceFilters.questions ? styles.enabled : styles.disabled
                  }`}
                >
                  <span className={styles.compactResourceText}>Q's</span>
                  <ToggleSwitch
                    checked={resourceFilters.questions}
                    onChange={(checked) => handleResourceFilterChange("questions", checked)}
                    size='small'
                  />
                </div>
              )}
              {(resources.words?.length || 0) > 0 && (
                <div
                  className={`${styles.compactResourceTag} ${
                    resourceFilters.words ? styles.enabled : styles.disabled
                  }`}
                >
                  <span className={styles.compactResourceText}>Words</span>
                  <ToggleSwitch
                    checked={resourceFilters.words}
                    onChange={(checked) => handleResourceFilterChange("words", checked)}
                    size='small'
                  />
                </div>
              )}
              {(resources.links?.length || 0) > 0 && (
                <div
                  className={`${styles.compactResourceTag} ${
                    resourceFilters.links ? styles.enabled : styles.disabled
                  }`}
                >
                  <span className={styles.compactResourceText}>Links</span>
                  <ToggleSwitch
                    checked={resourceFilters.links}
                    onChange={(checked) => handleResourceFilterChange("links", checked)}
                    size='small'
                  />
                </div>
              )}
            </div>
          </div>

          {/* Resource Change Notification */}
          {lastResourceChange && (
            <div className={styles.resourceChangeNotification}>
              <span className={styles.changeIcon}>⚡</span>
              <span className={styles.changeText}>
                Context updated: {lastResourceChange.resourceType}{" "}
                {lastResourceChange.enabled ? "enabled" : "disabled"}
              </span>
              <span className={styles.activeCount}>
                ({lastResourceChange.activeResources.length} active)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Messages - Only show when there are messages */}
      {messages.length > 0 && (
        <div className={styles.messagesContainer}>
          {messages.map(renderMessage)}
          {isSubmitting && (
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
      )}

      {/* Chat Input */}
      <div className={styles.chatInput}>
        <div className={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Ask about this verse...'
            className={styles.messageInput}
            disabled={isSubmitting}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isSubmitting}
            className={styles.sendButton}
          >
            {isSubmitting ? "⏳" : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LLMChatPanel;
