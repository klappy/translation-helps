<script>
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { chatStore } from '$lib/stores/chat.js';
  import { resourcesStore } from '$lib/stores/resources.js';
  import { sendChatMessage } from '$lib/services/llmChatService.js';
  import { processMarkdownWithRcLinks } from '$lib/utils/markdownUtils.js';
  import { enhanceLLMResponse } from '$lib/utils/emojiEnhancer.js';
  import { extractVerseText, extractChapterText, validateCleanText, emergencyUSFMExtract } from '$lib/utils/usfmTextExtractor.js';
  import TabIcon from '$lib/components/shared/TabIcon.svelte';

  let userInput = '';
  let isSubmitting = false;
  let sessionCost = 0;
  let messagesEndRef;
  let textareaRef;

  // Subscribe to stores
  let resources = {};
  let messages = [];
  let reference = null;

  // Store subscriptions
  const unsubscribeResources = resourcesStore.subscribe((value) => {
    resources = value;
  });

  const unsubscribeMessages = chatStore.messages.subscribe((value) => {
    messages = value;
  });

  const unsubscribeReference = resourcesStore.reference.subscribe((value) => {
    reference = value;
  });

  // Ensure all resources are active for comprehensive AI context
  onMount(() => {
    // Self-activating ALL resources for comprehensive AI context
    ['scripture', 'notes', 'questions', 'words', 'links'].forEach(resource => {
      resourcesStore.activateResource(resource);
    });
    
    // Activate AI tab when component mounts
    chatStore.activateAITab();
  });

  // Auto-scroll to bottom when new messages arrive
  afterUpdate(() => {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Auto-resize textarea
  $: if (textareaRef) {
    textareaRef.style.height = 'auto';
    textareaRef.style.height = `${textareaRef.scrollHeight}px`;
  }

  // Enhanced clear messages that also resets session cost
  function clearMessages() {
    chatStore.clearMessages();
    sessionCost = 0;
  }

  // Get formatted context for LLM - ALWAYS ready and consistent
  function getFormattedContext() {
    // Extract clean scripture text for LLM at runtime from raw USFM (antifragile pattern)
    let scriptureForLLM = null;
    let scriptureMetadata = null;
    
    if (resources.scripture && reference) {
      // Raw USFM is the single source of truth - extract clean text at runtime
      const rawUsfm = resources.scripture;
      
      try {
        // Extract clean text - try chapter first for broader context, then specific verse
        let cleanText;
        let extractionMethod;
        
        try {
          // PRIMARY: Extract entire chapter with verse numbers for comprehensive LLM context
          cleanText = extractChapterText(rawUsfm, reference.chapter);
          extractionMethod = 'chapter';
        } catch (chapterError) {
          console.warn('🔍 LLM Context: Chapter extraction failed, trying single verse:', chapterError.message);
          // Fallback: Extract specific verse with verse number
          cleanText = extractVerseText(rawUsfm, reference.chapter, reference.verse);
          extractionMethod = 'verse';
        }
        
        const isClean = validateCleanText(cleanText);
        
        // If extraction returned empty or failed validation, log details
        if (!cleanText || cleanText.trim().length === 0) {
          throw new Error(`Extraction returned empty text for ${reference.citation}`);
        }
        
        if (!isClean) {
          console.warn('⚠️ LLM Context: Extracted text contains markup patterns!');
        }
        
        scriptureForLLM = cleanText;
        scriptureMetadata = {
          extractedAt: new Date().toISOString(),
          isClean,
          originalLength: rawUsfm.length,
          cleanLength: cleanText.length,
          reference: reference.citation,
          extractionMethod: extractionMethod
        };
        
      } catch (error) {
        console.error('❌ LLM Context: Failed to extract clean text from USFM:', error);
        console.error('❌ LLM Context: Error details:', error.message, error.stack);
        console.log('🚨 LLM Context: Attempting emergency fallback extraction');
        
        // EMERGENCY FALLBACK: Use simple string operations for aligned Bibles
        try {
          const emergencyText = emergencyUSFMExtract(rawUsfm, reference.chapter, reference.verse);
          if (emergencyText && emergencyText.trim().length > 0) {
            scriptureForLLM = emergencyText;
            scriptureMetadata = {
              extractedAt: new Date().toISOString(),
              isClean: false, // Emergency extraction may not be perfectly clean
              originalLength: rawUsfm.length,
              cleanLength: emergencyText.length,
              reference: reference.citation,
              extractionMethod: 'emergency',
              fallbackReason: error.message
            };
            console.log('✅ LLM Context: Emergency extraction successful');
          } else {
            throw new Error('Emergency extraction also failed');
          }
        } catch (emergencyError) {
          console.error('🚨 LLM Context: Emergency extraction failed:', emergencyError);
          
          // FINAL FALLBACK: Provide a helpful message instead of raw USFM
          scriptureForLLM = `[Scripture text for ${reference.citation} is temporarily unavailable due to formatting complexity. Translation resources are still available.]`;
          scriptureMetadata = {
            extractedAt: new Date().toISOString(),
            isClean: true,
            originalLength: rawUsfm.length,
            cleanLength: scriptureForLLM.length,
            reference: reference.citation,
            extractionMethod: 'fallback-message',
            fallbackReason: 'All extraction methods failed'
          };
          console.log('📝 LLM Context: Using fallback message for user-friendly experience');
        }
      }
    }
    
    const formattedContext = {
      reference: reference || null,
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
    
    return formattedContext;
  }

  async function handleSendMessage() {
    if (!userInput.trim() || isSubmitting) return;

    const message = userInput.trim();
    userInput = '';
    isSubmitting = true;

    // Reset textarea height
    if (textareaRef) {
      textareaRef.style.height = 'auto';
    }

    try {
      // Add user message
      chatStore.addMessage({ role: 'user', content: message });
      
      // Context is ALWAYS ready and consistent
      const formattedContext = getFormattedContext();
      
      // Send to LLM service with context
      const response = await sendChatMessage(message, formattedContext);
      
      // Handle response properly
      if (response.success) {
        // Add successful AI response
        chatStore.addMessage({ 
          role: 'assistant', 
          content: response.response,
          costEstimate: response.costEstimate,
          metadata: response.metadata
        });
        
        // Update session cost if available
        if (response.costEstimate?.totalCost) {
          sessionCost += response.costEstimate.totalCost;
        }
      } else {
        // Add error message
        chatStore.addMessage({ 
          role: 'error', 
          content: response.error || 'Unknown error occurred while processing your message.'
        });
      }
      
      // Activate AI tab to show the response
      chatStore.activateAITab();
      
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
      
      chatStore.addMessage({ 
        role: 'error', 
        content: errorMessage
      });
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatCostDisplay(cost) {
    if (cost < 0.0001) {
      return '<$0.0001';
    }
    return `$${cost.toFixed(4)}`;
  }

  function getSessionCostColor(total) {
    if (total < 0.01) return 'session-cost-low';
    if (total < 0.1) return 'session-cost-medium';
    return 'session-cost-high';
  }

  // Handle clicking on prompt suggestions
  async function handlePromptSuggestionClick(prompt) {
    if (isSubmitting) return;
    userInput = prompt;
    // Auto-send the message
    setTimeout(() => handleSendMessage(), 100);
  }

  // Get contextual prompt suggestions based on available resources
  function getPromptSuggestions() {
    const suggestions = [
      'What are the key translation challenges for this verse?',
      'Explain the cultural context of this passage',
      'What are the important words to understand in this verse?',
    ];

    // Add resource-specific suggestions
    if ((resources.notes || []).length > 0) {
      suggestions.push('Summarize the translation notes for this verse');
    }
    
    if ((resources.questions || []).length > 0) {
      suggestions.push('What questions should translators consider?');
    }
    
    if ((resources.words || []).length > 0) {
      suggestions.push('Define the key theological terms in this passage');
    }

    return suggestions.slice(0, 6);
  }

  // Get current context info for display
  $: contextInfo = {
    reference: reference?.citation || 'No reference',
    resourceCount: (resources.scripture ? 1 : 0) +
                  (resources.notes?.length || 0) +
                  (resources.questions?.length || 0) +
                  (resources.words?.length || 0) +
                  (resources.links?.length || 0)
  };

  onDestroy(() => {
    unsubscribeResources();
    unsubscribeMessages();
    unsubscribeReference();
  });
</script>

<div class="chat-panel" data-testid="llm-chat-panel">
  <!-- Chat Header -->
  <div class="chat-header">
    <div class="header-title">
      <h3>Translation Assistant</h3>
      <span class="subtitle">Powered by AI</span>
    </div>
    <div class="header-actions">
      <div class="context-indicator" title="Current context">
        <span class="context-icon">📚</span>
        <span class="context-text">
          {contextInfo.reference} ({contextInfo.resourceCount} sources)
        </span>
      </div>
      
      {#if sessionCost > 0}
        <div class="session-cost-indicator {getSessionCostColor(sessionCost)}" title="Total conversation cost: {formatCostDisplay(sessionCost)}">
          <span class="session-cost-icon">💰</span>
          <span class="session-cost-text">{formatCostDisplay(sessionCost)}</span>
        </div>
      {/if}
      
      <button on:click={clearMessages} class="clear-button" title="Clear conversation" disabled={messages.length === 0}>🗑️</button>
    </div>
  </div>

  <!-- Welcome Message -->
  {#if messages.length === 0}
    <div class="welcome-message">
      <div class="welcome-icon">
        <TabIcon type="chat" class="tab-icon" />
      </div>
      <h4>Welcome to Translation Assistant!</h4>
      <p>I can help with translation resources. Ask me anything about:</p>
      <ul>
        <li>Translation notes and explanations</li>
        <li>Key words and their meanings</li>
        <li>Cultural and historical context</li>
        <li>Translation questions and challenges</li>
      </ul>
      
      <!-- Show current resources -->
      {#if contextInfo.resourceCount > 0}
        <div class="available-resources">
          <p><strong>Currently Available:</strong></p>
          <div class="resources-list">
            {#if resources.scripture}
              <span class="resource-tag">Scripture ✓</span>
            {/if}
            {#if (resources.notes?.length || 0) > 0}
              <span class="resource-tag">Notes ({resources.notes.length}) ✓</span>
            {/if}
            {#if (resources.questions?.length || 0) > 0}
              <span class="resource-tag">Questions ({resources.questions.length}) ✓</span>
            {/if}
            {#if (resources.words?.length || 0) > 0}
              <span class="resource-tag">Words ({resources.words.length}) ✓</span>
            {/if}
            {#if (resources.links?.length || 0) > 0}
              <span class="resource-tag">Links ({resources.links.length}) ✓</span>
            {/if}
          </div>
        </div>
      {/if}
      
      <div class="prompt-suggestions">
        <p><strong>Try asking:</strong></p>
        <div class="suggestions-list">
          {#each getPromptSuggestions() as suggestion}
            <button
              class="suggestion-button"
              on:click={() => handlePromptSuggestionClick(suggestion)}
              disabled={isSubmitting}
            >
              {suggestion}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Messages - Only show when there are messages -->
  {#if messages.length > 0}
    <div class="messages-container">
      {#each messages as message}
        <div class="message {message.role === 'user' ? 'user-message' : 'assistant-message'} {message.role === 'error' ? 'error-message' : ''}">
          <div class="message-content">
            <div class="message-text">
              {#if message.role === 'assistant'}
                {@html processMarkdownWithRcLinks(enhanceLLMResponse(message.content, {
                  enabled: true,
                  maxEmojisPerResponse: 6,
                  excludeCategories: [],
                }), (rcLink) => {
                  // RC link clicked in chat
                })}
              {:else}
                {message.content}
              {/if}
            </div>
            <div class="message-time">
              {formatTimestamp(message.timestamp)}
              {#if message.role === 'assistant' && message.costEstimate}
                <div class="message-cost">
                  <span class="cost-badge">{formatCostDisplay(message.costEstimate.totalCost)}</span>
                </div>
              {/if}
              {#if message.metadata?.mock}
                <span class="mock-badge">MOCK</span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
      
      {#if isSubmitting}
        <div class="loading-message">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="loading-text">AI is thinking...</div>
          </div>
        </div>
      {/if}
      
      <div bind:this={messagesEndRef}></div>
    </div>
  {/if}

  <!-- Chat Input -->
  <div class="chat-input">
    <div class="input-container">
      <textarea
        bind:this={textareaRef}
        bind:value={userInput}
        on:keypress={handleKeyPress}
        placeholder="Ask about this verse..."
        class="message-input"
        disabled={isSubmitting}
        rows="1"
      />
      <button
        on:click={handleSendMessage}
        disabled={!userInput.trim() || isSubmitting}
        class="send-button"
      >
        {isSubmitting ? '⏳' : '➤'}
      </button>
    </div>
  </div>
</div>

<style>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-panel);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--color-header);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .header-title h3 {
    margin: 0;
    color: var(--color-text);
    font-size: 1.1rem;
  }

  .subtitle {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .context-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: var(--color-secondary-alpha);
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .context-icon {
    font-size: 1rem;
  }

  .context-text {
    color: var(--color-text-secondary);
  }

  .session-cost-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .session-cost-low {
    background: var(--color-success-alpha);
    color: var(--color-success);
  }

  .session-cost-medium {
    background: var(--color-warning-alpha);
    color: var(--color-warning);
  }

  .session-cost-high {
    background: var(--color-error-alpha);
    color: var(--color-error);
  }

  .clear-button {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  .clear-button:hover:not(:disabled) {
    background: var(--color-hover);
    color: var(--color-text);
  }

  .clear-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .welcome-message {
    flex: 1;
    padding: 2rem;
    text-align: center;
    overflow-y: auto;
  }

  .welcome-icon {
    margin-bottom: 1rem;
  }

  .welcome-message h4 {
    color: var(--color-primary);
    margin-bottom: 1rem;
  }

  .welcome-message p {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
  }

  .welcome-message ul {
    text-align: left;
    max-width: 400px;
    margin: 0 auto 2rem;
    color: var(--color-text-secondary);
  }

  .available-resources {
    margin: 2rem 0;
    padding: 1rem;
    background: var(--color-background);
    border-radius: 8px;
  }

  .resources-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .resource-tag {
    background: var(--color-success-alpha);
    color: var(--color-success);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .prompt-suggestions {
    margin-top: 2rem;
  }

  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .suggestion-button {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
  }

  .suggestion-button:hover:not(:disabled) {
    background: var(--color-hover);
    border-color: var(--color-primary);
  }

  .suggestion-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
  }

  .user-message {
    align-self: flex-end;
  }

  .assistant-message {
    align-self: flex-start;
  }

  .error-message {
    align-self: center;
    max-width: 90%;
  }

  .message-content {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.8rem;
  }

  .user-message .message-content {
    background: var(--color-primary-alpha);
    border-color: var(--color-primary);
  }

  .error-message .message-content {
    background: var(--color-error-alpha);
    border-color: var(--color-error);
    color: var(--color-error);
  }

  .message-text {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  .message-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }

  .cost-badge {
    background: var(--color-secondary-alpha);
    color: var(--color-secondary);
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .mock-badge {
    background: var(--color-warning-alpha);
    color: var(--color-warning);
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .loading-message {
    align-self: flex-start;
    max-width: 80%;
  }

  .loading-message .message-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .typing-indicator {
    display: flex;
    gap: 0.2rem;
  }

  .typing-indicator span {
    width: 6px;
    height: 6px;
    background: var(--color-text-secondary);
    border-radius: 50%;
    animation: typing 1.4s infinite;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }

  .loading-text {
    color: var(--color-text-secondary);
    font-style: italic;
    font-size: 0.9rem;
  }

  .chat-input {
    padding: 1rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-header);
    flex-shrink: 0;
  }

  .input-container {
    display: flex;
    gap: 0.5rem;
    align-items: end;
  }

  .message-input {
    flex: 1;
    padding: 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-background);
    color: var(--color-text);
    font-family: inherit;
    font-size: 0.9rem;
    resize: none;
    min-height: 44px;
    max-height: 120px;
    overflow-y: auto;
  }

  .message-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .message-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .send-button {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.8rem 1rem;
    cursor: pointer;
    font-size: 1rem;
    min-width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .send-button:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .chat-header {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .welcome-message {
      padding: 1rem;
    }

    .message {
      max-width: 95%;
    }

    .suggestions-list {
      max-width: 100%;
    }

    .resources-list {
      flex-direction: column;
    }
  }
</style>