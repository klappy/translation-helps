/**
 * Netlify serverless function for LLM chat functionality
 * Handles OpenAI GPT-4o API communication with translation context
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Formats system prompt with context for the LLM
 * @param {Object} contextData - Packaged context
 * @returns {string} Formatted system prompt
 */
function formatSystemPrompt(contextData) {
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
 * Main handler for chat requests using traditional Netlify function format
 */
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    const { message, context: translationContext, chatHistory = [] } = JSON.parse(event.body);

    // Validate required fields
    if (!message || !translationContext) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Missing required fields: message and context",
        }),
      };
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable not set");
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Server configuration error: Missing API key",
        }),
      };
    }

    // Format the system prompt with translation context
    const systemPrompt = formatSystemPrompt(translationContext);

    // Prepare messages for OpenAI
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add chat history (last 10 messages to keep within token limits)
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach((msg) => {
      if (msg.type === "user") {
        messages.push({
          role: "user",
          content: msg.content,
        });
      } else if (msg.type === "assistant") {
        messages.push({
          role: "assistant",
          content: msg.content,
        });
      }
    });

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Prepare OpenAI request
    const openaiRequest = {
      model: "gpt-4o",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    // Log request details (without sensitive data)
    console.log("OpenAI Request:", {
      messageCount: messages.length,
      contextSize: JSON.stringify(translationContext).length,
      reference: translationContext.reference?.citation,
    });

    // Send request to OpenAI
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(openaiRequest),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI API Error:", {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorData,
      });

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Failed to get response from AI service",
          details: process.env.NODE_ENV === "development" ? errorData : undefined,
        }),
      };
    }

    const openaiData = await openaiResponse.json();

    // Extract response
    const aiResponse = openaiData.choices?.[0]?.message?.content;
    if (!aiResponse) {
      console.error("Unexpected OpenAI response format:", openaiData);
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Invalid response from AI service",
        }),
      };
    }

    // Log successful response
    console.log("Chat request completed successfully:", {
      reference: translationContext.reference?.citation,
      responseLength: aiResponse.length,
      tokensUsed: openaiData.usage?.total_tokens || "unknown",
    });

    // Return successful response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        response: aiResponse,
        metadata: {
          tokensUsed: openaiData.usage?.total_tokens,
          model: openaiRequest.model,
          contextReference: translationContext.reference?.citation,
          timestamp: new Date().toISOString(),
        },
      }),
    };
  } catch (error) {
    console.error("Chat function error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  }
};
