/**
 * llmChatService.js
 * Service module for LLM chat functionality integrated with ResourcesContext
 * NOTE: Context packaging is now handled by ResourcesContext.getFormattedContext()
 */

/**
 * Formats system prompt with context for the LLM
 * @param {Object} contextData - Packaged context
 * @returns {string} Formatted system prompt
 */
export function formatSystemPrompt(contextData) {
  const { reference, resources } = contextData;

  // Log the resources used for the LLM system prompt
  console.log("[LLM System Prompt] Resources used for context:", resources);

  let prompt = `You are an expert Bible translation assistant. You have access to comprehensive translation resources for ${reference.citation} in ${reference.language}.

IMPORTANT: You are provided with scripture data for the current verse and chapter. This data is the DEFINITIVE translation and version to be used for quoting and displaying to the user. You MUST use this provided data exclusively and NOT rely on any memorized or external versions of the scripture text.

CURRENT CONTEXT:
- Reference: ${reference.citation}
- Organization: ${reference.organization}
- Language: ${reference.language}

AVAILABLE RESOURCES:`;

  if (resources.scriptureText) {
    const scriptureTitle = contextData.metadata?.manifestTitles?.scripture || "Scripture Text";
    console.log("[LLM System Prompt] Scripture title being used:", scriptureTitle);
    console.log(
      "[LLM System Prompt] Full metadata.manifestTitles:",
      contextData.metadata?.manifestTitles
    );

    // Enhanced debugging for scripture text
    console.log("🔴 CRITICAL DEBUG - Scripture being sent to LLM:");
    console.log("  - Full scriptureText:", resources.scriptureText);
    console.log("  - Length:", resources.scriptureText.length);
    console.log("  - First 200 chars:", resources.scriptureText.substring(0, 200));
    console.log(
      "  - Contains Greek/Hebrew?:",
      /[\u0370-\u03FF\u0590-\u05FF]/.test(resources.scriptureText)
    );

    prompt += `\n- ${scriptureTitle}: "${resources.scriptureText}"`;
  }
  // Include raw USFM to preserve annotations (e.g., curly brace content)
  if (resources.rawUSFM) {
    prompt += `\n- Raw USFM (preserves all annotations):\n${resources.rawUSFM}`;
  }
  if (resources.alignmentData && resources.alignmentData.length > 0) {
    // Enhanced debugging for alignment data
    console.log("⚠️ ALIGNMENT DATA being sent:");
    console.log("  - Full alignmentData:", JSON.stringify(resources.alignmentData, null, 2));
    console.log("  - Number of entries:", resources.alignmentData.length);
    console.log("  - First entry:", resources.alignmentData[0]);

    prompt += `\n- Alignment Data for this verse:\n${JSON.stringify(
      resources.alignmentData,
      null,
      2
    )}`;
  }
  console.log("for LLM RESOURCES:", resources);
  // (Raw USFM is not included in the LLM prompt. Only rendered scripture text and alignment data are provided.)

  if (resources.translationNotes?.length > 0) {
    prompt += `\n- Translation Notes (${resources.translationNotes.length} entries):`;
    resources.translationNotes.forEach((note, index) => {
      prompt += `\n  ${index + 1}. ${note.quote ? `"${note.quote}"` : ""} - ${note.text}`;
    });
  }

  if (resources.translationQuestions?.length > 0) {
    prompt += `\n- Translation Questions (${resources.translationQuestions.length} entries):`;
    resources.translationQuestions.forEach((question, index) => {
      prompt += `\n  ${index + 1}. ${question.question}`;
    });
  }

  if (resources.translationWords?.length > 0) {
    prompt += `\n- Translation Words (${resources.translationWords.length} entries):`;
    resources.translationWords.forEach((word, index) => {
      prompt += `\n  ${index + 1}. ${word.term || word.title}`;

      // Include full article content if available
      if (word.content) {
        prompt += `\n     Content: ${word.content}`;
      } else if (word.definition) {
        prompt += `\n     Definition: ${word.definition}`;
      } else if (word.snippet) {
        prompt += `\n     Snippet: ${word.snippet}`;
      } else {
        // Debug what fields are available when no content found
        console.log(`⚠️ No content found for word:`, word);
      }

      // Include additional fields that might contain detailed information
      if (word.facts) {
        prompt += `\n     Facts: ${word.facts}`;
      }
      if (word.references) {
        prompt += `\n     Bible References: ${word.references}`;
      }
      if (word.examples) {
        prompt += `\n     Examples: ${word.examples}`;
      }
    });
  }

  if (resources.translationWordLinks?.length > 0) {
    prompt += `\n- Translation Word Links (${resources.translationWordLinks.length} entries):`;
    resources.translationWordLinks.forEach((link, index) => {
      prompt += `\n  ${index + 1}. ${link.word || link.term}`;
    });
  }

  prompt += `

GUIDELINES:
1. Provide helpful, accurate responses about Bible translation for this specific verse and surrounding context
2. Reference the provided resources when relevant
3. Be concise but thorough in your explanations
4. Use the translation notes, questions, and word articles to inform your responses
5. When discussing translation choices, consider the original languages and cultural context
6. Always be respectful of different translation approaches
7. If you provide an incomplete list in your response, always inform the user that the list is incomplete and let them know they can request the remaining X of Y items if needed

Please answer the user's question using this contextual information.`;

  return prompt;
}

/**
 * Sends a chat message to the LLM with packaged context
 * @param {string} message - User's message
 * @param {Object} context - Packaged context
 * @param {Array} chatHistory - Previous messages in conversation
 * @param {Object} options - Additional options like streaming
 * @returns {Promise<Object>} Response from LLM
 */
export async function sendChatMessage(message, context, chatHistory = [], options = {}) {
  const { streaming = false, onStreamChunk = null } = options;
  // Check if we should use mock responses proactively in development
  const useMockChat = import.meta.env.VITE_USE_MOCK_CHAT === "true";

  if (useMockChat) {
    console.log("🎭 Using mock response (VITE_USE_MOCK_CHAT=true)");
    const mockResponse = createMockResponse(message, context);
    console.log("🎭 Mock response created:", mockResponse);
    return mockResponse;
  }

  try {
    // Estimate cost for this request
    const contextSize = JSON.stringify(context).length;
    const messageSize = message.length;
    const historySize = JSON.stringify(chatHistory).length;

    // Rough token estimation: 1 token ≈ 4 characters for English text
    const estimatedInputTokens = Math.ceil((contextSize + messageSize + historySize) / 4);
    const estimatedOutputTokens = 500; // Assume average response length

    // GPT-4o-mini pricing: $0.15/million input, $0.60/million output (updated June 2025)
    const inputCost = (estimatedInputTokens / 1000000) * 0.15;
    const outputCost = (estimatedOutputTokens / 1000000) * 0.6;
    const totalCost = inputCost + outputCost;
    // Token limit for GPT-4o-mini (128k context window)
    const tokenLimit = 128000;
    const inputPercentage = ((estimatedInputTokens / tokenLimit) * 100).toFixed(2);
    const outputPercentage = ((estimatedOutputTokens / tokenLimit) * 100).toFixed(2);

    // Analyze resources being sent
    const resources = context?.resources || {};
    const resourceSummary = {
      scripture: resources.scripture ? "✓" : "✗",
      translationNotes: resources.translationNotes?.length || 0,
      translationQuestions: resources.translationQuestions?.length || 0,
      translationWords: resources.translationWords?.length || 0,
      translationWordLinks: resources.translationWordLinks?.length || 0,
    };

    // Create cost estimate object for UI display
    const costEstimate = {
      contextSize: `${(contextSize / 1000).toFixed(1)}KB`,
      estimatedInputTokens: estimatedInputTokens,
      estimatedOutputTokens: estimatedOutputTokens,
      inputCost: inputCost,
      outputCost: outputCost,
      totalCost: totalCost,
      inputPercentage: parseFloat(inputPercentage),
      outputPercentage: parseFloat(outputPercentage),
      reference: context?.reference?.citation || "Unknown",
      resources: resourceSummary,
      model: "GPT-4o-mini",
      timestamp: new Date().toISOString(),
    };

    // Choose endpoint based on streaming preference (streaming overrides env)
    const endpoint = streaming
      ? "/.netlify/functions/chat-stream"
      : import.meta.env.VITE_CHAT_API_ENDPOINT || "/.netlify/functions/chat";

    console.log("🎯 LLM Service Debug:", {
      streaming,
      endpoint,
      envEndpoint: import.meta.env.VITE_CHAT_API_ENDPOINT,
    });

    const requestBody = {
      message,
      context,
      chatHistory,
      timestamp: new Date().toISOString(),
    };

    // Create AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle streaming simulation if requested
      if (streaming && onStreamChunk && data.response) {
        try {
          await simulateStreamingResponse(data.response, onStreamChunk);
        } catch (streamError) {
          console.error("Streaming simulation failed:", streamError);
          // Continue with the response even if streaming fails
        }
      }

      // Update cost estimate with actual token counts if available
      let finalCostEstimate = { ...costEstimate };
      if (data.metadata?.actualOutputTokens) {
        finalCostEstimate = {
          ...costEstimate,
          estimatedOutputTokens: data.metadata.actualOutputTokens,
          actualOutputTokens: data.metadata.actualOutputTokens,
          actualInputTokens: data.metadata.actualInputTokens,
          // Recalculate costs with actual output tokens
          outputCost: (data.metadata.actualOutputTokens / 1000000) * 0.6,
        };
        finalCostEstimate.totalCost = finalCostEstimate.inputCost + finalCostEstimate.outputCost;
        finalCostEstimate.outputPercentage = (
          (data.metadata.actualOutputTokens / 128000) *
          100
        ).toFixed(2);
      }

      return {
        success: true,
        response: data.response,
        timestamp: new Date().toISOString(),
        contextUsed: context,
        metadata: data.metadata || {},
        costEstimate: finalCostEstimate,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle AbortError specifically
      if (fetchError.name === "AbortError") {
        throw new Error("Request timed out after 30 seconds");
      }

      // Re-throw other fetch errors
      throw fetchError;
    }
  } catch (error) {
    console.error("Error sending chat message:", error);

    // Fallback to mock response if there's an API error and we haven't already used mock
    // (This provides resilience even when trying to use real API)
    const shouldFallbackToMock = import.meta.env.VITE_USE_MOCK_CHAT !== "false";
    if (shouldFallbackToMock) {
      console.log("🎭 Falling back to mock response due to API error:", error.message);
      const mockResponse = createMockResponse(message, context);
      console.log("🎭 Mock response created:", mockResponse);
      return mockResponse;
    }

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      costEstimate: null,
    };
  }
}

/**
 * Simulates streaming response by sending chunks of text
 * @param {string} fullResponse - Complete response text
 * @param {Function} onStreamChunk - Callback for each chunk
 */
async function simulateStreamingResponse(fullResponse, onStreamChunk) {
  try {
    const words = fullResponse.split(" ");
    let currentChunk = "";

    console.log("🎬 Starting streaming simulation with", words.length, "words");

    for (let i = 0; i < words.length; i++) {
      currentChunk += (i > 0 ? " " : "") + words[i];

      // Send chunk every word for more obvious streaming effect
      try {
        onStreamChunk(currentChunk);
        console.log("📡 Streaming chunk:", currentChunk.length, "chars");
      } catch (chunkError) {
        console.error("Error in streaming chunk callback:", chunkError);
        break; // Stop streaming if callback fails
      }

      // Add realistic streaming delay (much faster)
      if (i < words.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 30));
      }
    }

    console.log("✅ Streaming simulation complete");
  } catch (error) {
    console.error("Error in streaming simulation:", error);
    throw error;
  }
}

/**
 * Creates a mock response for development/testing
 * @param {string} message - User's message
 * @param {Object} context - Packaged context
 * @returns {Object} Mock response
 */
export function createMockResponse(message, context) {
  const { resources } = context;

  // Create example responses with proper citation format
  const responses = [];

  if (resources.scripture) {
    responses.push(
      `According to the scripture text, "${resources.scripture.substring(
        0,
        50
      )}..." [SCRIPTURE]. ` +
        `This passage shows important themes for translation.\n\n` +
        `Sources:\n- [SCRIPTURE]: ${resources.scripture.substring(0, 100)}...`
    );
  }

  if (resources.translationNotes?.length > 0) {
    const firstNote = resources.translationNotes[0];
    responses.push(
      `The translation notes explain that "${
        firstNote.quote || "this phrase"
      }" has specific meaning [TN-1]. ` +
        `This guidance helps translators understand the original intent.\n\n` +
        `Sources:\n- [TN-1]: Quote: "${firstNote.quote || "N/A"}" - Text: "${
          firstNote.text || "N/A"
        }"`
    );
  }

  if (resources.translationQuestions?.length > 0) {
    const firstQuestion = resources.translationQuestions[0];
    responses.push(
      `Translation teams should consider: "${firstQuestion.question}" [TQ-1]. ` +
        `This question helps ensure accurate meaning transfer.\n\n` +
        `Sources:\n- [TQ-1]: Question: "${firstQuestion.question}" Answer: "${
          firstQuestion.answer || "See context"
        }"`
    );
  }

  if (resources.translationWords?.length > 0) {
    const firstWord = resources.translationWords[0];
    responses.push(
      `The key term "${firstWord.term || firstWord.title}" means "${firstWord.definition?.substring(
        0,
        50
      )}..." [TW-1]. ` +
        `Understanding this concept is crucial for accurate translation.\n\n` +
        `Sources:\n- [TW-1]: Term: "${firstWord.term || firstWord.title}" Definition: "${
          firstWord.definition || "N/A"
        }"`
    );
  }

  // Fallback response if no resources available
  if (responses.length === 0) {
    responses.push(
      `This information is not available in the provided translation resources for ${context.reference.citation}. ` +
        `To answer your question, I would need access to translation notes, questions, or word definitions for this verse.`
    );
  }

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  // Create mock cost estimate with actual output tokens simulation
  const mockActualOutputTokens = Math.floor(randomResponse.length / 4); // Simulate actual token count based on response length
  const mockActualInputTokens = Math.floor(Math.random() * 5000) + 10000;

  const mockCostEstimate = {
    contextSize: `${(JSON.stringify(context).length / 1000).toFixed(1)}KB`,
    estimatedInputTokens: mockActualInputTokens,
    estimatedOutputTokens: mockActualOutputTokens, // Use actual instead of hardcoded 500
    actualOutputTokens: mockActualOutputTokens, // Include actual output tokens
    actualInputTokens: mockActualInputTokens, // Include actual input tokens
    inputCost: (mockActualInputTokens / 1000000) * 0.15,
    outputCost: (mockActualOutputTokens / 1000000) * 0.6,
    totalCost: 0,
    inputPercentage: ((mockActualInputTokens / 128000) * 100).toFixed(2),
    outputPercentage: ((mockActualOutputTokens / 128000) * 100).toFixed(2),
    reference: context?.reference?.citation || "Unknown",
    resources: {
      scripture: resources.scripture ? "✓" : "✗",
      translationNotes: resources.translationNotes?.length || 0,
      translationQuestions: resources.translationQuestions?.length || 0,
      translationWords: resources.translationWords?.length || 0,
      translationWordLinks: resources.translationWordLinks?.length || 0,
    },
    model: "GPT-4o-mini (Mock)",
    timestamp: new Date().toISOString(),
  };

  mockCostEstimate.totalCost = mockCostEstimate.inputCost + mockCostEstimate.outputCost;

  return {
    success: true,
    response: `${randomResponse}\n\n*This is a mock response demonstrating the new citation format. The actual feature will use OpenAI GPT-4o with strict source attribution.*`,
    timestamp: new Date().toISOString(),
    contextUsed: context,
    metadata: { mock: true, citationFormat: "enabled" },
    costEstimate: mockCostEstimate,
  };
}

/**
 * Validates chat request before sending
 * @param {string} message - User's message
 * @param {Object} context - Packaged context
 * @returns {Object} Validation result
 */
export function validateChatRequest(message, context) {
  const errors = [];

  if (!message || message.trim().length === 0) {
    errors.push("Message cannot be empty");
  }

  if (message.length > 4000) {
    errors.push("Message too long (max 4000 characters)");
  }

  if (!context || !context.reference) {
    errors.push("Context is required");
  }

  const contextSize = JSON.stringify(context).length;
  if (contextSize > 300000) {
    errors.push("Context too large for processing");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  formatSystemPrompt,
  sendChatMessage,
  createMockResponse,
  validateChatRequest,
};
