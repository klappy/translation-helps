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

AVAILABLE RESOURCES WITH CITATION IDs:`;

  // Add Scripture with citation format AND clear labeling
  if (resources.scripture) {
    const scriptureTitle = contextData.metadata?.manifestTitles?.scripture || "Scripture Text";
    prompt += `\n\n📖 [SCRIPTURE] ${scriptureTitle} - THIS IS THE ENGLISH TEXT TO QUOTE FROM:
"${resources.scripture}"
⬆️ ONLY QUOTE FROM THE TEXT ABOVE ⬆️`;
  } else {
    prompt += `\n\n⚠️ NO SCRIPTURE TEXT AVAILABLE - You cannot quote scripture for this reference.`;
  }

  prompt += `

## SCRIPTURE QUOTING REQUIREMENTS - CRITICAL:

**Scripture text MUST be quoted EXACTLY character-for-character from the provided resources.**

### Specific Rules:

1. **Exact Text Matching**
   - Copy scripture text character-for-character from provided resources
   - Never paraphrase, summarize, or reword scripture
   - Preserve original punctuation, capitalization, and formatting

2. **Quotation Formatting**
   - Always enclose scripture quotes in double quotation marks
   - Include [SCRIPTURE] citation immediately after quotes
   - For partial quotes, use ellipsis (...) to indicate omitted portions

3. **Examples of Correct Quoting**
   
   ✅ CORRECT:
   "In the beginning God created the heavens and the earth." [SCRIPTURE]
   
   ❌ INCORRECT:
   God made the heavens and earth at the start. [SCRIPTURE]
   In the beginning, God created the heavens and the earth [SCRIPTURE]

4. **Partial Quote Handling**
   "In the beginning God created..." [SCRIPTURE]
   "...the heavens and the earth." [SCRIPTURE]

5. **Multi-Verse Quotes**
   - Quote each verse exactly as provided
   - Include inline verse numbers unless asked not to
   - Maintain original verse boundaries

## COMMON SCRIPTURE QUOTING VIOLATIONS TO AVOID:
❌ "God made..." instead of "God created..."
❌ Missing quotation marks around scripture
❌ Adding words not in the original
❌ Changing word order
❌ Modernizing or simplifying language
❌ Using synonyms (e.g., "made" for "created", "started" for "beginning")
❌ Omitting punctuation or capitalization
❌ Paraphrasing for clarity - NEVER do this!

## FINAL VERIFICATION BEFORE RESPONDING - MANDATORY:
**STOP! Before sending your response, you MUST:**
1. REVIEW every scripture quote in your response
2. VERIFY each quote is EXACTLY character-for-character from [SCRIPTURE] above
3. CONFIRM quotation marks are present around ALL scripture quotes
4. CHECK that [SCRIPTURE] citation follows immediately after each quote
5. If ANY scripture is paraphrased or reworded, you MUST revise it before responding
6. This verification step is MANDATORY and cannot be skipped
`;

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

      // Use full content if available, fallback to other fields
      const content = word.content || word.definition || word.snippet || "N/A";

      prompt += `\n[${wordId}] Term: "${term}"`;
      prompt += `\n      Content: "${content}"`;

      // Include rc:// link if available
      if (word.rcLink || word.rcUri) {
        prompt += `\n      RC Link: ${word.rcLink || word.rcUri}`;
      }
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

## MANDATORY CITATION FORMAT WITH RESOURCE TITLES:
- Use formal resource titles when introducing information
- Include inline citations like [TN-1], [TQ-2], [TW-3], [TWL-1], [SCRIPTURE]
- Every statement MUST include a citation
- End responses with a "Sources:" section listing all citations used

### CITATION EXAMPLES WITH RESOURCE TITLES:
- **Scripture**: "According to the scripture resource provided above (use the EXACT title shown after [SCRIPTURE]), verse 1 states... [SCRIPTURE]"
- **Translation Notes**: "The unfoldingWord® Translation Notes explain that... [TN-1]"
- **Translation Questions**: "The unfoldingWord® Translation Questions ask... [TQ-1]"
- **Translation Words**: "The term 'Paul' is defined in unfoldingWord® Translation Words as... [TW-1]"
- **Translation Word Links**: "The unfoldingWord® Translation Word Links connect... [TWL-1]"

## RESPONSE FORMATTING REQUIREMENTS:

### Visual Structure:
- **Use clear headings** with ## for main sections and ### for subsections
- **Use bullet points** for lists and key information
- **Use bold text** for important terms, resource titles, and emphasis
- **Use italic text** for biblical terms, quotes, and references
- **Organize content logically** with clear paragraph breaks

### Response Structure Required:
1. **Introduction**: Brief overview using formal resource titles
2. **Main Content**: Detailed answer with proper formatting and citations
3. **Sources Section**: Complete citation list with substantial excerpts

### Enhanced Example Response Format:

## Analysis of [Reference]

According to the **unfoldingWord® Translation Notes**, this phrase means... [TN-1]. The *actual scripture resource title* states '...' [SCRIPTURE]. 

### Key Terms and Definitions

The **unfoldingWord® Translation Words** define this term as... [TW-1]:
- **Primary meaning**: [definition]
- **Context**: [contextual information]
- **Usage**: [how it's used]

### Translation Considerations

The **unfoldingWord® Translation Questions** highlight important considerations [TQ-1]:
- What does this phrase mean?
- How should it be translated?
- What cultural context is important?

## Sources:
- **[TN-1]**: unfoldingWord® Translation Notes - Quote: "*actual quoted text*" - Text: "actual explanation text"
- **[TQ-1]**: unfoldingWord® Translation Questions - Question: "*actual question text*" - Answer: "actual answer text"  
- **[TW-1]**: unfoldingWord® Translation Words - Term: "*actual term name*" - Content: "key facts and definition from article"
- **[TWL-1]**: unfoldingWord® Translation Word Links - Word: "*actual word*" - Link reference
- **[SCRIPTURE]**: *actual scripture resource title* - "*actual scripture text quoted*"

### IMPORTANT FORMATTING GUIDELINES:
1. **Always use formal resource titles** when introducing information in your response
2. **Use markdown formatting** for headers (##, ###), bold (**text**), and italics (*text*)
3. **Structure responses with clear sections** and subsections for better readability
4. **Use bullet points** for lists, key points, and organized information
5. **In the Sources section**, include the resource title and substantial excerpts from the actual content
6. **For Translation Words**, include rc:// links when available: [rc://en/tw/dict/bible/kt/god]

WHAT TO DO IF INFORMATION IS MISSING:
- State: "This information is not available in the provided translation resources"
- Do NOT make up information or use external knowledge
- Suggest what resources might be helpful if they were available

STRICT PROHIBITIONS:
- NO external Bible knowledge beyond provided resources
- NO theological interpretations not found in the resources
- NO historical or cultural context not explicitly provided
- NO assumptions about word meanings beyond provided definitions
- NO references to other Bible verses unless provided in resources`;

  // Add alignment data at the very end with strong warnings
  if (resources.alignmentData && resources.alignmentData.length > 0) {
    prompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ALIGNMENT DATA - DO NOT QUOTE AS SCRIPTURE ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following is GREEK/HEBREW text for linguistic reference ONLY.
NEVER quote this as scripture. Scripture quotes MUST come from [SCRIPTURE] above.

[ALIGNMENT DATA]:
${resources.alignmentData.join("\n")}

REMINDER: This Greek/Hebrew text is NOT scripture - it's linguistic data only!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }

  prompt += `\n\nPlease answer the user's question following these strict guidelines.`;

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

    // Enhanced debugging for LLM request
    console.log("🚀 LLM Request Debug:");
    console.log("  - Message:", message);
    console.log("  - Scripture in context:", translationContext?.resources?.scripture);
    console.log("  - Scripture text:", translationContext?.resources?.scriptureText);
    console.log("  - Alignment data present?", !!translationContext?.resources?.alignmentData);
    console.log("  - Reference:", translationContext?.reference?.citation);

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
      model: "gpt-4o-mini", // Updated to GPT-4o-mini for improved output consistency
      messages: messages,
      max_tokens: 500,
      temperature: 0.1, // Reduced from 0.2 for even more literal responses
      top_p: 0.1, // Reduced from 0.2 to minimize creativity
      frequency_penalty: 0.4,
      presence_penalty: 0.4,
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
          actualInputTokens: openaiData.usage?.prompt_tokens,
          actualOutputTokens: openaiData.usage?.completion_tokens,
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
