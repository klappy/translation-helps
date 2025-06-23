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
    
    // Separate notes by type for clarity
    const bookIntroNotes = [];
    const chapterIntroNotes = [];
    const verseNotes = [];
    
    resources.translationNotes.forEach((note, index) => {
      const noteId = `TN-${index + 1}`;
      const noteEntry = {
        id: noteId,
        quote: note.quote || "N/A",
        text: note.text || "N/A",
        occurrence: note.occurrence,
        tags: note.tags,
        supportReference: note.supportReference,
        reference: note.reference
      };
      
      // Categorize notes based on reference
      if (note.reference && note.reference.includes("front:intro")) {
        bookIntroNotes.push(noteEntry);
      } else if (note.reference && note.reference.includes(":intro")) {
        chapterIntroNotes.push(noteEntry);
      } else {
        verseNotes.push(noteEntry);
      }
    });
    
    // Add book introduction notes
    if (bookIntroNotes.length > 0) {
      prompt += `\n\n📚 BOOK INTRODUCTION NOTES (broader context for the entire book):`;
      bookIntroNotes.forEach(note => {
        prompt += `\n[${note.id}] [BOOK INTRO]`;
        prompt += `\n      Text: "${note.text}"`;
        if (note.tags) prompt += `\n      Tags: ${note.tags}`;
      });
    }
    
    // Add chapter introduction notes
    if (chapterIntroNotes.length > 0) {
      prompt += `\n\n📖 CHAPTER INTRODUCTION NOTES (broader context for chapter ${reference.chapter}):`;
      chapterIntroNotes.forEach(note => {
        prompt += `\n[${note.id}] [CHAPTER INTRO]`;
        prompt += `\n      Text: "${note.text}"`;
        if (note.tags) prompt += `\n      Tags: ${note.tags}`;
      });
    }
    
    // Add verse-specific notes
    if (verseNotes.length > 0) {
      prompt += `\n\n📝 VERSE-SPECIFIC NOTES (for ${reference.citation}):`;
      verseNotes.forEach(note => {
        prompt += `\n[${note.id}] Quote: "${note.quote}"`;
        prompt += `\n      Text: "${note.text}"`;
        if (note.occurrence) prompt += `\n      Occurrence: ${note.occurrence}`;
        if (note.tags) prompt += `\n      Tags: ${note.tags}`;
        if (note.supportReference) prompt += `\n      See also: ${note.supportReference}`;
      });
    }
  }

  // Add Translation Questions with individual citation IDs
  if (resources.translationQuestions?.length > 0) {
    prompt += `\n\nTRANSLATION QUESTIONS (${resources.translationQuestions.length} entries):`;
    
    // Separate questions by type for clarity
    const bookIntroQuestions = [];
    const chapterIntroQuestions = [];
    const verseQuestions = [];
    
    resources.translationQuestions.forEach((question, index) => {
      const questionId = `TQ-${index + 1}`;
      const questionEntry = {
        id: questionId,
        question: question.question || "N/A",
        answer: question.answer || "",
        reference: question.reference
      };
      
      // Categorize questions based on reference
      if (question.reference && question.reference.includes("front:intro")) {
        bookIntroQuestions.push(questionEntry);
      } else if (question.reference && question.reference.includes(":intro")) {
        chapterIntroQuestions.push(questionEntry);
      } else {
        verseQuestions.push(questionEntry);
      }
    });
    
    // Add book introduction questions
    if (bookIntroQuestions.length > 0) {
      prompt += `\n\n📚 BOOK INTRODUCTION QUESTIONS (broader context for the entire book):`;
      bookIntroQuestions.forEach(q => {
        prompt += `\n[${q.id}] [BOOK INTRO] Question: "${q.question}"`;
        if (q.answer) prompt += `\n      Answer: "${q.answer}"`;
      });
    }
    
    // Add chapter introduction questions
    if (chapterIntroQuestions.length > 0) {
      prompt += `\n\n📖 CHAPTER INTRODUCTION QUESTIONS (broader context for chapter ${reference.chapter}):`;
      chapterIntroQuestions.forEach(q => {
        prompt += `\n[${q.id}] [CHAPTER INTRO] Question: "${q.question}"`;
        if (q.answer) prompt += `\n      Answer: "${q.answer}"`;
      });
    }
    
    // Add verse-specific questions
    if (verseQuestions.length > 0) {
      prompt += `\n\n📝 VERSE-SPECIFIC QUESTIONS (for ${reference.citation}):`;
      verseQuestions.forEach(q => {
        prompt += `\n[${q.id}] Question: "${q.question}"`;
        if (q.answer) prompt += `\n      Answer: "${q.answer}"`;
      });
    }
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
- **[TN-2]**: unfoldingWord® Translation Notes [BOOK INTRO] - Text: "book introduction content"
- **[TN-3]**: unfoldingWord® Translation Notes [CHAPTER INTRO] - Text: "chapter introduction content"
- **[TQ-1]**: unfoldingWord® Translation Questions - Question: "*actual question text*" - Answer: "actual answer text"
- **[TQ-2]**: unfoldingWord® Translation Questions [BOOK INTRO] - Question: "book introduction question" - Answer: "answer"
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
- NO references to other Bible verses unless provided in resources

## USING BROADER CONTEXT NOTES - IMPORTANT:

When answering questions about topics like cultural context, historical background, literary structure, or themes that may not be covered in verse-specific notes, you SHOULD:

1. **Check Book Introduction Notes** (marked as [BOOK INTRO]) for:
   - Overall book themes and purpose
   - Historical and cultural background
   - Author and audience information
   - Literary structure and genre
   - Key theological themes

2. **Check Chapter Introduction Notes** (marked as [CHAPTER INTRO]) for:
   - Chapter-specific context
   - Flow of thought within the chapter
   - Connections to surrounding chapters
   - Key themes in this section

3. **Combine Resources Appropriately**:
   - Use verse-specific notes for detailed word/phrase explanations
   - Use chapter intros for immediate context
   - Use book intros for broader themes and background
   - ALWAYS cite which level of note you're using

4. **Citation Examples for Broader Context**:
   - "The book introduction explains the cultural context... [TN-1] [BOOK INTRO]"
   - "According to the chapter introduction... [TN-5] [CHAPTER INTRO]"
   - "While this specific verse doesn't address cultural context, the book introduction provides relevant background... [TN-1] [BOOK INTRO]"

5. **When to Use Broader Notes**:
   - When asked about themes, context, or background not in verse notes
   - When verse-specific information would benefit from broader context
   - When explaining connections between verses or passages
   - ALWAYS indicate when using broader context vs verse-specific information

6. **Response Strategy for Missing Verse-Specific Information**:
   - If a question cannot be answered from verse-specific notes, check broader context
   - State clearly: "While there are no verse-specific notes on this topic, the [book/chapter] introduction provides relevant information..."
   - Use broader context to provide helpful background while being transparent about the source level`;

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

    // 🚨 EMERGENCY TOKEN SIZE CHECK - Prevent 500 errors
    const contextSize = JSON.stringify(translationContext).length;
    const estimatedTokens = Math.ceil(contextSize / 4); // Rough estimation: 4 chars per token
    const maxSafeTokens = 100000; // Safety margin (GPT-4o-mini limit is 128k)
    
    console.log(`🔍 Token estimation: ${estimatedTokens} tokens (${(contextSize/1000).toFixed(1)}KB context)`);
    
    if (estimatedTokens > maxSafeTokens) {
      console.error(`🚨 CONTEXT TOO LARGE: ${estimatedTokens} tokens exceeds safe limit of ${maxSafeTokens}`);
      
      // Remove alignment data if present (most common cause of oversized context)
      if (translationContext.resources?.alignmentData) {
        console.log("🔧 Removing alignment data to reduce context size");
        delete translationContext.resources.alignmentData;
        
        // Recalculate size
        const newContextSize = JSON.stringify(translationContext).length;
        const newEstimatedTokens = Math.ceil(newContextSize / 4);
        console.log(`✅ Reduced to ${newEstimatedTokens} tokens (${(newContextSize/1000).toFixed(1)}KB)`);
        
        if (newEstimatedTokens > maxSafeTokens) {
          // Still too large - return graceful error
          return {
            statusCode: 200, // Don't return 500 - return success with error message
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              response: "I'm sorry, but the context for this verse is too large for me to process right now. This sometimes happens with resources that have extensive alignment data. Please try asking a more specific question, or the development team can optimize this in a future update.",
              metadata: {
                error: "context_too_large",
                estimatedTokens: newEstimatedTokens,
                maxTokens: maxSafeTokens,
                contextReference: translationContext.reference?.citation,
                timestamp: new Date().toISOString(),
              },
            }),
          };
        }
      } else {
        // Large context without alignment data - return graceful error
        return {
          statusCode: 200, // Don't return 500 - return success with error message
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            response: "I'm sorry, but there's too much context information for this verse for me to process right now. Please try asking a more specific question about a particular aspect of the verse.",
            metadata: {
              error: "context_too_large",
              estimatedTokens: estimatedTokens,
              maxTokens: maxSafeTokens,
              contextReference: translationContext.reference?.citation,
              timestamp: new Date().toISOString(),
            },
          }),
        };
      }
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
      temperature: 0.2, // Reduced to 0.2 for more literal responses but have some flexibility
      top_p: 0.2, // 0.2 to minimize creativity but not too much
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

      // Parse the error to provide meaningful feedback
      let userFriendlyMessage = "I'm having trouble connecting to the AI service right now.";
      
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error?.code === "context_length_exceeded") {
          userFriendlyMessage = "The context for this verse is too complex for me to process. This can happen with resources that have extensive alignment data. Please try asking a more specific question.";
        } else if (errorJson.error?.code === "rate_limit_exceeded") {
          userFriendlyMessage = "I'm receiving too many requests right now. Please wait a moment and try again.";
        } else if (errorJson.error?.code === "insufficient_quota") {
          userFriendlyMessage = "The AI service quota has been exceeded. Please contact support or try again later.";
        }
      } catch (parseError) {
        // Use default message if we can't parse the error
      }

      return {
        statusCode: 200, // Return 200 to avoid triggering error boundaries
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          response: userFriendlyMessage + " Please try again in a moment.",
          metadata: {
            error: "api_error",
            openaiStatus: openaiResponse.status,
            contextReference: translationContext.reference?.citation,
            timestamp: new Date().toISOString(),
          },
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

    // Provide graceful error messages based on error type
    let userMessage = "I'm having trouble processing your request right now.";
    
    if (error.message?.includes('timeout')) {
      userMessage = "The request took too long to process. Please try asking a shorter or more specific question.";
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = "I'm having trouble connecting to the AI service. Please check your connection and try again.";
    } else if (error.message?.includes('JSON')) {
      userMessage = "There was a problem with the request format. Please try again.";
    }

    return {
      statusCode: 200, // Return 200 to avoid error boundaries - let the app handle gracefully
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        response: userMessage + " If this continues, please contact support.",
        metadata: {
          error: "server_error",
          errorType: error.name || "unknown",
          contextReference: translationContext?.reference?.citation || "unknown",
          timestamp: new Date().toISOString(),
        },
      }),
    };
  }
};
