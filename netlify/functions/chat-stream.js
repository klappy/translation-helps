/**
 * Netlify serverless function for streaming LLM chat functionality
 * Handles OpenAI GPT-4o API communication with real-time streaming responses
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Formats system prompt with context for the LLM
 * @param {Object} contextData - Packaged context
 * @returns {string} Formatted system prompt
 */
function formatSystemPrompt(contextData) {
  const { reference, resources } = contextData;

  let prompt = `You are a Bible translation assistant for ${reference.citation} in ${reference.language}.

⚠️ CRITICAL FIELD DISTINCTION - READ THIS FIRST ⚠️
This context contains TWO DIFFERENT types of data that MUST NOT be confused:

1. **[SCRIPTURE]** = ENGLISH TRANSLATION (the ONLY source for quoting scripture)
2. **[ALIGNMENT DATA]** = GREEK/HEBREW TEXT (NEVER quote this as scripture except for linguistic analysis and alignment/interlinear work)

COMMON MISTAKE TO AVOID:
❌ WRONG: Quoting "Παῦλος, δοῦλος Θεοῦ..." as scripture
✅ RIGHT: Quoting "Paul, a servant of God..." as scripture

The [SCRIPTURE] field below contains the English text.
The [ALIGNMENT DATA] field contains Greek/Hebrew - NEVER quote from it!

CRITICAL CONSTRAINTS:

**#1 ABSOLUTE PRIORITY - SCRIPTURE ACCURACY:**
- Scripture MUST be quoted EXACTLY character-for-character from the [SCRIPTURE] field ONLY
- NEVER quote Greek or Hebrew text as scripture
- Character-for-character precision is MANDATORY - even one word change is a VIOLATION  
- Paraphrasing, rewording, or summarizing scripture is STRICTLY FORBIDDEN
- This rule OVERRIDES ALL other instructions and conversational flow
- ALWAYS use double quotation marks around scripture quotes

**Other Critical Constraints:**
- You MUST ONLY use information explicitly provided in the resources below
- You MUST cite every piece of information using the specified format
- You MUST NOT use any external knowledge beyond what is provided
- If information is not available in the resources, you MUST state this clearly
- You MUST NOT make assumptions or add interpretations not found in the resources

CURRENT CONTEXT:
- Reference: ${reference.citation}
- Organization: ${reference.organization}
- Language: ${reference.language}

AVAILABLE RESOURCES WITH CITATION IDS:`;

  // Add Scripture with citation format AND clear labeling
  if (resources.scripture) {
    const scriptureTitle = contextData.metadata?.manifestTitles?.scripture || "Scripture Text";
    prompt += `\n\n📖 [SCRIPTURE] ${scriptureTitle} - THIS IS THE ENGLISH TEXT TO QUOTE FROM:
"${resources.scripture}"
⬆️ ONLY QUOTE FROM THE TEXT ABOVE ⬆️`;
  } else {
    prompt += `\n\n⚠️ NO SCRIPTURE TEXT AVAILABLE - You cannot quote scripture for this reference.`;
  }

  // Add other resources (simplified for streaming)
  if (resources.translationNotes?.length > 0) {
    prompt += `\n\nTRANSLATION NOTES (${resources.translationNotes.length} entries):`;
    resources.translationNotes.forEach((note, index) => {
      const noteId = `TN-${index + 1}`;
      prompt += `\n[${noteId}] Quote: "${note.quote || "N/A"}"`;
      prompt += `\n      Text: "${note.text || "N/A"}"`;
    });
  }

  if (resources.translationQuestions?.length > 0) {
    prompt += `\n\nTRANSLATION QUESTIONS (${resources.translationQuestions.length} entries):`;
    resources.translationQuestions.forEach((question, index) => {
      const questionId = `TQ-${index + 1}`;
      prompt += `\n[${questionId}] Question: "${question.question || "N/A"}"`;
      if (question.answer) prompt += `\n      Answer: "${question.answer}"`;
    });
  }

  if (resources.translationWords?.length > 0) {
    prompt += `\n\nTRANSLATION WORDS (${resources.translationWords.length} entries):`;
    resources.translationWords.forEach((word, index) => {
      const wordId = `TW-${index + 1}`;
      const term = word.term || word.title || "N/A";
      const content = word.content || word.definition || word.snippet || "N/A";
      prompt += `\n[${wordId}] Term: "${term}"`;
      prompt += `\n      Content: "${content}"`;
    });
  }

  prompt += `\n\nPlease provide a helpful response with proper citations. Keep it conversational and informative.`;

  return prompt;
}

/**
 * Main handler for streaming chat requests
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
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    const { message, context: translationContext, chatHistory = [] } = JSON.parse(event.body);

    console.log("🚀 Streaming LLM Request:", {
      message: message?.substring(0, 100) + "...",
      reference: translationContext?.reference?.citation,
    });

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

    // Add recent chat history (last 5 messages for streaming efficiency)
    const recentHistory = chatHistory.slice(-5);
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

    // Prepare OpenAI streaming request
    const openaiRequest = {
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500,
      temperature: 0.2,
      top_p: 0.2,
      frequency_penalty: 0.4,
      presence_penalty: 0.4,
      stream: true, // Enable streaming
    };

    console.log("📡 Starting OpenAI stream...");

    // Send streaming request to OpenAI
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
      console.error("OpenAI API Error:", errorData);

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "AI service error",
          message:
            "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        }),
      };
    }

    // Set up Server-Sent Events response
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // For Netlify functions, we need to return the complete response
    // So we'll collect the stream and return it all at once
    // This is a limitation of Netlify functions - true streaming requires edge functions

    let fullResponse = "";
    let totalTokens = 0;

    const reader = openaiResponse.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                fullResponse += content;
              }

              // Track usage if available
              if (parsed.usage) {
                totalTokens = parsed.usage.total_tokens;
              }
            } catch (parseError) {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    console.log("✅ Stream completed:", {
      reference: translationContext.reference?.citation,
      responseLength: fullResponse.length,
      tokensUsed: totalTokens,
    });

    // Return the complete response (simulating streaming effect on client)
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        response: fullResponse,
        streaming: true, // Flag to indicate this came from streaming
        metadata: {
          tokensUsed: totalTokens,
          model: openaiRequest.model,
          contextReference: translationContext.reference?.citation,
          timestamp: new Date().toISOString(),
        },
      }),
    };
  } catch (error) {
    console.error("Streaming chat function error:", error);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "server_error",
        message:
          "I'm having trouble processing your request right now. Please try again in a moment.",
        metadata: {
          errorType: error.name || "unknown",
          timestamp: new Date().toISOString(),
        },
      }),
    };
  }
};
