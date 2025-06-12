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

  return {
    success: true,
    response: `${randomResponse}\n\n*This is a mock response demonstrating the new citation format. The actual feature will use OpenAI GPT-4o with strict source attribution.*`,
    timestamp: new Date().toISOString(),
    contextUsed: context,
    metadata: { mock: true, citationFormat: "enabled" },
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
