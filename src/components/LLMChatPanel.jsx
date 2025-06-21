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
import { extractVerseText, extractChapterText, validateCleanText } from "../utils/usfmTextExtractor";
import styles from "./LLMChatPanel.module.css";

export function LLMChatPanel() {
  const { resources, activateResource } = useResourcesContext();
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCost, setSessionCost] = useState(0);
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
    // Extract clean scripture text for LLM at runtime from raw USFM (antifragile pattern)
    let scriptureForLLM = null;
    let scriptureMetadata = null;
    
    if (resources.scripture && resources.reference) {
      // Raw USFM is the single source of truth - extract clean text at runtime
      const rawUsfm = resources.scripture;
      console.log('🔍 LLM Context: Extracting clean text from raw USFM at runtime');
      console.log('🔍 LLM Context: Raw USFM length:', rawUsfm.length);
      
      try {
        // Debug the extraction parameters
        console.log('🔍 LLM Context: Extraction parameters:', {
          reference: resources.reference,
          chapter: resources.reference.chapter,
          verse: resources.reference.verse,
          usfmLength: rawUsfm.length,
          usfmPreview: rawUsfm.substring(0, 200) + '...'
        });
        
        // Extract clean text - try chapter first for broader context, then specific verse
        let cleanText;
        let extractionMethod;
        
        try {
          // PRIMARY: Extract entire chapter with verse numbers for comprehensive LLM context
          cleanText = extractChapterText(rawUsfm, resources.reference.chapter);
          extractionMethod = 'chapter';
          console.log('🔍 LLM Context: Successfully extracted FULL CHAPTER with verse numbers for optimal LLM context');
        } catch (chapterError) {
          console.warn('🔍 LLM Context: Chapter extraction failed, trying single verse:', chapterError.message);
          // Fallback: Extract specific verse with verse number
          cleanText = extractVerseText(rawUsfm, resources.reference.chapter, resources.reference.verse);
          extractionMethod = 'verse';
          console.log('🔍 LLM Context: Successfully extracted single verse with verse number');
        }
        
        console.log('🔍 LLM Context: Raw extraction result:', {
          extractedLength: cleanText?.length || 0,
          extractedPreview: cleanText?.substring(0, 200) + '...'
        });
        
        const isClean = validateCleanText(cleanText);
        
        // If extraction returned empty or failed validation, log details
        if (!cleanText || cleanText.trim().length === 0) {
          throw new Error(`Extraction returned empty text for ${resources.reference.citation}`);
        }
        
        if (!isClean) {
          console.warn('⚠️ LLM Context: Extracted text contains markup patterns!');
          console.warn('⚠️ LLM Context: Extracted text preview:', cleanText.substring(0, 500));
        }
        
        scriptureForLLM = cleanText;
        scriptureMetadata = {
          extractedAt: new Date().toISOString(),
          isClean,
          originalLength: rawUsfm.length,
          cleanLength: cleanText.length,
          reference: resources.reference.citation,
          extractionMethod: extractionMethod
        };
        
        console.log('🔍 LLM Context: Extracted clean text successfully');
        console.log('🔍 LLM Context: Clean text preview:', cleanText.substring(0, 100) + '...');
        console.log('🔍 LLM Context: Text is clean:', isClean);
        
      } catch (error) {
        console.error('❌ LLM Context: Failed to extract clean text from USFM:', error);
        console.error('❌ LLM Context: Error details:', error.message, error.stack);
        console.error('❌ LLM Context: Falling back to raw USFM');
        
        // Fallback: use raw USFM (better than nothing, but will cause issues)
        scriptureForLLM = rawUsfm;
        console.warn('⚠️ LLM Context: Using raw USFM as fallback - AI may be confused by markup');
        console.warn('⚠️ LLM Context: Raw USFM length:', rawUsfm.length);
      }
    } else {
      console.log('🔍 LLM Context: No scripture data or reference available');
    }
    
    const formattedContext = {
      reference: resources.reference || null,
      resources: {
        scripture: scriptureForLLM,
        translationNotes: resources.notes || [],
        translationQuestions: resources.questions || [],
        translationWords: resources.words || [],
        translationWordLinks: resources.links || [],
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
    
    // Log context size for auditing
    const contextSizeBytes = JSON.stringify(formattedContext).length;
    console.log(`🔍 LLM Context: Total context size: ${(contextSizeBytes / 1024).toFixed(1)}KB`);
    
    return formattedContext;
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
      
      console.log('🎯 LLMChatPanel: Received response:', response);
      
      // Handle response properly
      if (response.success) {
        // Add successful AI response
        addMessage({ 
          role: 'assistant', 
          content: response.response,
          costEstimate: response.costEstimate,
          metadata: response.metadata
        });
        
        // Update session cost if available
        if (response.costEstimate?.totalCost) {
          setSessionCost(prev => prev + response.costEstimate.totalCost);
        }
      } else {
        // Add error message
        addMessage({ 
          role: 'error', 
          content: response.error || 'Unknown error occurred while processing your message.'
        });
      }
      
      // Activate AI tab to show the response
      activateAITab();
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add user-friendly error message
      let errorMessage = 'Sorry, there was an error processing your message. ';
      
      if (error.message?.includes('timeout')) {
        errorMessage += 'The request timed out. Please try again with a shorter message.';
      } else if (error.message?.includes('network')) {
        errorMessage += 'Network connection issue. Please check your connection and try again.';
      } else {
        errorMessage += 'Please try again in a moment.';
      }
      
      addMessage({ 
        role: 'error', 
        content: errorMessage
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
            <div className={`${styles.sessionCostIndicator} ${getSessionCostColor(sessionCost)}`} title={`Total conversation cost: ${formatCostDisplay(sessionCost)}`}>
              <span className={styles.sessionCostIcon}>💰</span>
              <span className={styles.sessionCostText}>{formatCostDisplay(sessionCost)}</span>
            </div>
          )}
          
          <button onClick={() => {
            const context = getFormattedContext();
            console.log('🔍 SCRIPTURE AUDIT - Full Context:', context);
            console.log('🔍 SCRIPTURE AUDIT - Scripture Text for LLM:', context.resources.scripture);
            console.log('🔍 SCRIPTURE AUDIT - Raw Context Size:', JSON.stringify(context).length);
            
            // Audit the antifragile pattern: raw USFM in context vs clean text for LLM
            if (resources.scripture) {
              console.log('🔍 SCRIPTURE AUDIT - ANTIFRAGILE PATTERN CHECK:');
              console.log('🔍 SCRIPTURE AUDIT - Context stores raw USFM:', typeof resources.scripture === 'string');
              console.log('🔍 SCRIPTURE AUDIT - Raw USFM Length:', resources.scripture.length);
              console.log('🔍 SCRIPTURE AUDIT - Raw USFM Preview:', resources.scripture.substring(0, 500) + '...');
              
              // Show what LLM actually receives
              console.log('🔍 SCRIPTURE AUDIT - LLM receives clean text:', typeof context.resources.scripture === 'string');
              console.log('🔍 SCRIPTURE AUDIT - Clean Text Length:', context.resources.scripture?.length || 0);
              console.log('🔍 SCRIPTURE AUDIT - Clean Text Preview:', context.resources.scripture?.substring(0, 500) + '...');
              
              // Metadata audit
              if (context.metadata?.scriptureMetadata) {
                console.log('🔍 SCRIPTURE AUDIT - Extraction Metadata:', context.metadata.scriptureMetadata);
                console.log('🔍 SCRIPTURE AUDIT - Text cleanliness verified:', context.metadata.scriptureMetadata.isClean);
              }
              
              // Validate the separation of concerns
              const rawHasMarkup = resources.scripture.includes('\\zaln-s') || resources.scripture.includes('\\w ');
              const cleanHasMarkup = context.resources.scripture?.includes('\\zaln-s') || context.resources.scripture?.includes('\\w ');
              
              console.log('🔍 SCRIPTURE AUDIT - Raw USFM contains markup (expected):', rawHasMarkup);
              console.log('🔍 SCRIPTURE AUDIT - Clean text contains markup (should be false):', cleanHasMarkup);
              
              if (rawHasMarkup && !cleanHasMarkup) {
                console.log('✅ SCRIPTURE AUDIT - ANTIFRAGILE PATTERN WORKING CORRECTLY');
              } else {
                console.warn('⚠️ SCRIPTURE AUDIT - PATTERN MAY HAVE ISSUES');
              }
            } else {
              console.log('🔍 SCRIPTURE AUDIT - No Scripture Data Available');
            }
            
            alert('Scripture audit complete! Check console for antifragile pattern analysis - raw USFM in context vs clean text for LLM.');
          }} className={styles.debugButton} title="Audit scripture context">📖</button>
          
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

      {/* Chat Input */}
      <div className={styles.chatInput}>
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
    </div>
  );
}

export default LLMChatPanel;
