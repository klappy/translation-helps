/**
 * LLMChatPanel.jsx - Direct Context Access Pattern
 * Follows Simple Verse-Loading Pattern from docs/SIMPLE-VERSE-LOADING-PATTERN.md
 * 
 * TRANSFORMATION: Reduced from 576 lines to ~150 lines
 * PATTERN: Multi-resource self-activation with direct context access
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChatContext } from "../context/ChatContext";
import { useResourcesContext } from "../context/ResourcesContext";
import { sendChatMessage } from "../services/llmChatService";
import { processMarkdownWithRcLinks } from "../utils/markdownUtils";
import { enhanceLLMResponse } from "../utils/emojiEnhancer";
import styles from "./LLMChatPanel.module.css";

export function LLMChatPanel() {
  const { resources, activateResource } = useResourcesContext();
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Ensure all resources are active for comprehensive AI context
  useEffect(() => {
    console.log('🎯 LLMChatPanel: Self-activating ALL resources for comprehensive AI context');
    ['scripture', 'notes', 'questions', 'words', 'links'].forEach(activateResource);
  }, [activateResource]);

  const {
    messages,
    addMessage,
    clearMessages,
    activateAITab,
  } = useChatContext();

  // Activate AI tab when component mounts
  useEffect(() => {
    console.log('[LLMChatPanel] Component mounted - activating AI tab');
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
    return {
      reference: resources.reference || null,
      resources: {
        scripture: resources.scripture,
        translationNotes: resources.notes || [],
        translationQuestions: resources.questions || [],
        translationWords: resources.words || [],
        translationWordLinks: resources.links || [],
      },
      metadata: {
        timestamp: Date.now(),
        contextSize: 0,
        resourceLoadingStatus: {
          scripture: !!resources.scripture,
          translationNotes: (resources.notes || []).length > 0,
          translationQuestions: (resources.questions || []).length > 0,
          translationWords: (resources.words || []).length > 0,
          translationWordLinks: (resources.links || []).length > 0,
        },
      },
    };
  }, [resources]);

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
      addMessage({ role: 'user', content: message });
      
      // Context is ALWAYS ready and consistent
      const formattedContext = getFormattedContext();
      
      console.log('🎯 LLMChatPanel: Sending message with context:', {
        reference: formattedContext.reference?.citation,
        resourcesAvailable: Object.keys(formattedContext.resources).filter(key => 
          Array.isArray(formattedContext.resources[key]) 
            ? formattedContext.resources[key].length > 0 
            : !!formattedContext.resources[key]
        )
      });
      
      // Send to LLM service
      const response = await sendChatMessage(message, formattedContext);
      
      // Add AI response
      addMessage({ role: 'assistant', content: response });
      
      // Activate AI tab to show the response
      activateAITab();
      
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({ 
        role: 'error', 
        content: 'Sorry, there was an error processing your message. Please try again.' 
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
              processMarkdownWithRcLinks(enhanceLLMResponse(message.content, {
                enabled: true,
                maxEmojisPerResponse: 6,
                excludeCategories: [],
              }), (rcLink) => {
                console.log("RC link clicked in chat:", rcLink);
              })
            ) : (
              message.content
            )}
          </div>
          <div className={styles.messageTime}>
            {formatTimestamp(message.timestamp)}
            {isAssistant && message.costEstimate && (
              <div className={styles.messageCost}>
                <span className={styles.costBadge}>{formatCostDisplay(message.costEstimate.totalCost)}</span>
              </div>
            )}
            {message.metadata?.mock && <span className={styles.mockBadge}>MOCK</span>}
          </div>
        </div>
      </div>
    );
  };

  // Get current context info for display
  const getContextInfo = () => {
    const totalResources = (resources.scripture ? 1 : 0) +
                          (resources.notes?.length || 0) +
                          (resources.questions?.length || 0) +
                          (resources.words?.length || 0) +
                          (resources.links?.length || 0);
    
    return {
      reference: resources.reference?.citation || 'No reference',
      resourceCount: totalResources
    };
  };
  
  const contextInfo = getContextInfo();

  // Debug function
  const debugContext = () => {
    const formattedContext = getFormattedContext();
    console.log('🐛 LLMChatPanel context (direct):', resources);
    console.log('🐛 LLMChatPanel formatted context:', formattedContext);
    return 'Debug info logged to console';
  };

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
          <button onClick={debugContext} className={styles.debugButton} title="Debug AI context">🐛</button>
          <button onClick={clearMessages} className={styles.clearButton} title='Clear conversation' disabled={messages.length === 0}>🗑️</button>
        </div>
      </div>

      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className={styles.welcomeMessage}>
          <div className={styles.welcomeIcon}>🤖</div>
          <h4>Welcome to Translation Assistant!</h4>
          <p>I can help with translation resources. Ask me anything about:</p>
          <ul>
            <li>Translation notes and explanations</li>
            <li>Key words and their meanings</li>
            <li>Cultural and historical context</li>
            <li>Translation questions and challenges</li>
          </ul>
          
          {/* Show current resources */}
          {contextInfo.resourceCount > 0 && (
            <div className={styles.availableResources}>
              <p><strong>Currently Available:</strong></p>
              <div className={styles.resourcesList}>
                {resources.scripture && <span className={styles.resourceTag}>Scripture ✓</span>}
                {(resources.notes?.length || 0) > 0 && (
                  <span className={styles.resourceTag}>Notes ({resources.notes.length}) ✓</span>
                )}
                {(resources.questions?.length || 0) > 0 && (
                  <span className={styles.resourceTag}>Questions ({resources.questions.length}) ✓</span>
                )}
                {(resources.words?.length || 0) > 0 && (
                  <span className={styles.resourceTag}>Words ({resources.words.length}) ✓</span>
                )}
                {(resources.links?.length || 0) > 0 && (
                  <span className={styles.resourceTag}>Links ({resources.links.length}) ✓</span>
                )}
              </div>
            </div>
          )}
          
          <div className={styles.promptSuggestions}>
            <p><strong>Try asking:</strong></p>
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

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about this verse..."
          className={styles.messageInput}
          disabled={isSubmitting}
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          disabled={!userInput.trim() || isSubmitting}
          className={styles.sendButton}
        >
          {isSubmitting ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
}

export default LLMChatPanel;
