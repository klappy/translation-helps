/**
 * llmChatService.js
 * Service module for LLM chat functionality with context packaging
 */

/**
 * Packages all current translation resources into context for LLM
 * @param {Object} reference - Current verse reference
 * @param {Object} resources - All loaded resources
 * @returns {Object} Packaged context object
 */
export function packageContext(reference, resources = {}) {
  const { bookId, chapter, verse, organization, languageId } = reference;

  const context = {
    reference: {
      book: bookId,
      chapter: parseInt(chapter),
      verse: parseInt(verse),
      organization,
      language: languageId,
      citation: `${bookId} ${chapter}:${verse}`,
    },
    resources: {
      scripture: resources.scripture || null,
      translationNotes: resources.translationNotes || [],
      translationQuestions: resources.translationQuestions || [],
      translationWords: resources.translationWords || [],
      translationWordLinks: resources.translationWordLinks || [],
    },
    metadata: {
      timestamp: new Date().toISOString(),
      contextSize: 0, // Will be calculated after stringification
    },
  };

  // Calculate context size for monitoring
  context.metadata.contextSize = JSON.stringify(context).length;

  return context;
}

/**
 * Formats system prompt with context for the LLM
 * @param {Object} contextData - Packaged context
 * @returns {string} Formatted system prompt
 */
export function formatSystemPrompt(contextData) {
  const { reference, resources } = contextData;

  let prompt = `You are an expert Bible translation assistant. You have access to comprehensive translation resources for ${reference.citation} in ${reference.language}.

CURRENT CONTEXT:
- Reference: ${reference.citation}
- Organization: ${reference.organization}
- Language: ${reference.language}

AVAILABLE RESOURCES:`;

  if (resources.scripture) {
    prompt += `\n- Scripture Text: "${resources.scripture}"`;
  }

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
      prompt += `\n  ${index + 1}. ${word.term || word.title} - ${
        word.definition || word.snippet || ""
      }`;
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
1. Provide helpful, accurate responses about Bible translation for this specific verse
2. Reference the provided resources when relevant
3. Be concise but thorough in your explanations
4. Use the translation notes and questions to inform your responses
5. When discussing translation choices, consider the original languages and cultural context
6. Always be respectful of different translation approaches

Please answer the user's question using this contextual information.`;

  return prompt;
}

/**
 * Sends a chat message to the LLM with packaged context
 * @param {string} message - User's message
 * @param {Object} context - Packaged context
 * @param {Array} chatHistory - Previous messages in conversation
 * @returns {Promise<Object>} Response from LLM
 */
export async function sendChatMessage(message, context, chatHistory = []) {
  try {
    const endpoint = import.meta.env.VITE_CHAT_API_ENDPOINT || "/.netlify/functions/chat";

    const requestBody = {
      message,
      context,
      chatHistory,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      response: data.response,
      timestamp: new Date().toISOString(),
      contextUsed: context,
      metadata: data.metadata || {},
    };
  } catch (error) {
    console.error("Error sending chat message:", error);

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Creates a mock response for development/testing
 * @param {string} message - User's message
 * @param {Object} context - Packaged context
 * @returns {Object} Mock response
 */
export function createMockResponse(message, context) {
  const responses = [
    `Based on the translation resources for ${context.reference.citation}, I can help explain this verse. The translation notes provide valuable insight into the original text and cultural context.`,
    `Looking at the translation questions for this verse, there are several important considerations for translators to keep in mind.`,
    `The translation words linked to this passage offer important background on key terms and concepts.`,
    `This verse has several translation challenges that the notes and questions help address.`,
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return {
    success: true,
    response: `${randomResponse}\n\n*This is a mock response for development. The actual feature will use OpenAI GPT-4o.*`,
    timestamp: new Date().toISOString(),
    contextUsed: context,
    metadata: { mock: true },
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
  if (contextSize > 50000) {
    errors.push("Context too large for processing");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  packageContext,
  formatSystemPrompt,
  sendChatMessage,
  createMockResponse,
  validateChatRequest,
};
