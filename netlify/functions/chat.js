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

  let prompt = `You are a Bible translation assistant for ${reference.citation} in ${reference.language}. You have access to specific translation resources listed below.

CRITICAL CONSTRAINTS:
- You MUST ONLY use information explicitly provided in the resources below
- You MUST cite every piece of information using the specified format
- You MUST NOT use any external knowledge beyond what is provided
- If information is not available in the resources, you MUST state this clearly
- You MUST NOT make assumptions or add interpretations not found in the resources

CURRENT CONTEXT:
- Reference: ${reference.citation}
- Organization: ${reference.organization}
- Language: ${reference.language}

AVAILABLE RESOURCES WITH CITATION IDs:`;

  // Add Scripture with citation format
  if (resources.scripture) {
    prompt += `\n\n[SCRIPTURE] Scripture Text:
"${resources.scripture}"`;
  }

  // Add Translation Notes with individual citation IDs
  if (resources.translationNotes?.length > 0) {
    prompt += `\n\nTRANSLATION NOTES (${resources.translationNotes.length} entries):`;
    resources.translationNotes.forEach((note, index) => {
      const noteId = `TN-${index + 1}`;
      prompt += `\n[${noteId}] Quote: "${note.quote || "N/A"}"`;
      prompt += `\n      Text: "${note.text || "N/A"}"`;
      if (note.occurrence) prompt += `\n      Occurrence: ${note.occurrence}`;
      if (note.tags) prompt += `\n      Tags: ${note.tags}`;
      if (note.supportReference) prompt += `\n      See also: ${note.supportReference}`;
    });
  }

  // Add Translation Questions with individual citation IDs
  if (resources.translationQuestions?.length > 0) {
    prompt += `\n\nTRANSLATION QUESTIONS (${resources.translationQuestions.length} entries):`;
    resources.translationQuestions.forEach((question, index) => {
      const questionId = `TQ-${index + 1}`;
      prompt += `\n[${questionId}] Question: "${question.question || "N/A"}"`;
      if (question.answer) {
        prompt += `\n      Answer: "${question.answer}"`;
      }
    });
  }

  // Add Translation Words with individual citation IDs
  if (resources.translationWords?.length > 0) {
    prompt += `\n\nTRANSLATION WORDS (${resources.translationWords.length} entries):`;
    resources.translationWords.forEach((word, index) => {
      const wordId = `TW-${index + 1}`;
      const term = word.term || word.title || "N/A";
      const definition = word.definition || word.snippet || "N/A";
      prompt += `\n[${wordId}] Term: "${term}"`;
      prompt += `\n      Definition: "${definition}"`;
    });
  }

  // Add Translation Word Links with individual citation IDs
  if (resources.translationWordLinks?.length > 0) {
    prompt += `\n\nTRANSLATION WORD LINKS (${resources.translationWordLinks.length} entries):`;
    resources.translationWordLinks.forEach((link, index) => {
      const linkId = `TWL-${index + 1}`;
      const word = link.word || link.term || "N/A";
      prompt += `\n[${linkId}] Word: "${word}"`;
      if (link.occurrence) prompt += ` (occurrence ${link.occurrence})`;
    });
  }

  prompt += `

MANDATORY CITATION FORMAT:
- Use inline citations like [TN-1], [TQ-2], [TW-3], [TWL-1], [SCRIPTURE]
- Every statement MUST include a citation
- End responses with a "Sources:" section listing all citations used

RESPONSE STRUCTURE REQUIRED:
1. Answer the question using ONLY provided information
2. Include inline citations for every claim: [TN-1], [TQ-2], etc.
3. End with "Sources:" section listing each citation with its content

EXAMPLE RESPONSE FORMAT:
"According to the translation notes, this phrase means... [TN-1]. The scripture text states '...' [SCRIPTURE]. 

Sources:
- [TN-1]: Quote about X - explanation about Y
- [SCRIPTURE]: Full verse text"

WHAT TO DO IF INFORMATION IS MISSING:
- State: "This information is not available in the provided translation resources"
- Do NOT make up information or use external knowledge
- Suggest what resources might be helpful if they were available

STRICT PROHIBITIONS:
- NO external Bible knowledge beyond provided resources
- NO theological interpretations not found in the resources
- NO historical or cultural context not explicitly provided
- NO assumptions about word meanings beyond provided definitions
- NO references to other Bible verses unless provided in resources

Please answer the user's question following these strict guidelines.`;

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
