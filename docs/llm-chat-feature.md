# LLM Chat Feature Documentation

## Version 2.4.0 Update (2025-06-16) - Reference History Bubble

The chat header now shows a running list of references used during the conversation.
As you navigate between verses, the badge expands to include each new reference
so you can easily track which passages have been discussed.

### Implementation Highlights

- `ChatContext` now maintains a `referenceHistory` array tracking each reference
  used in order.
- `LLMChatPanel` renders this list in the context indicator badge, joined by
  arrows (e.g., `TIT 1:1 → GEN 1:2`).
- Clearing the chat resets the history so a fresh conversation starts clean.

## Version 2.3.0 Update (2025-06-15) - Seamless Context Slipstreaming

### 🚀 **Revolutionary Chat Experience Enhancement**

Version 2.3.0 introduces **Seamless Context Slipstreaming** - a groundbreaking approach that eliminates chat crashes and conversation interruptions when users navigate between verses, chapters, books, resources, or languages while chatting.

#### **The Problem Solved**

Previously, changing any aspect of the biblical context (verse, chapter, book, resource, language) during an active chat session would:

- ❌ **Crash the chat interface** causing complete conversation loss
- ❌ **Force conversation resets** with blocking dialogs asking users to choose between old/new context
- ❌ **Interrupt the natural flow** of biblical study and translation work
- ❌ **Create user frustration** when trying to explore related passages while discussing with AI

#### **The Seamless Solution**

The new **Context Slipstreaming Architecture** provides:

- ✅ **Zero Chat Crashes** - Navigation never interrupts active conversations
- ✅ **Background Resource Loading** - New resources load silently while chat continues
- ✅ **Automatic Context Integration** - Next user message seamlessly includes updated context
- ✅ **Visual Context Feedback** - Subtle, non-blocking indicators show when context changes
- ✅ **Uninterrupted Conversations** - Natural flow between different biblical passages

#### **How Context Slipstreaming Works**

1. **User Changes Context**: Navigate to Genesis 1:2 while chatting about Titus 1:1
2. **Background Loading**: Resources for Genesis 1:2 begin loading silently
3. **Visual Feedback**: Subtle indicator appears: 📚 "Updated to Genesis 1:2"
4. **Seamless Integration**: Next chat message automatically includes Genesis 1:2 context
5. **AI Awareness**: AI assistant naturally acknowledges the context change and responds appropriately

#### **Technical Implementation**

**Enhanced ChatContext**:

```javascript
// Removed blocking reset logic
const sendMessage = useCallback(
  async (message) => {
    try {
      // Always use latest available context without blocking
      const currentContext = getFormattedContext();

      if (!currentContext) {
        // Graceful handling with helpful user guidance
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Please ensure resources are loaded before continuing...",
          },
        ]);
        return;
      }

      // Seamless message sending with updated context
      const response = await sendChatMessage(message, currentContext, chatHistory);

      // Context change detection and visual feedback
      if (contextHasChanged(lastContext, currentContext)) {
        showContextChangeIndicator(currentContext);
      }
    } catch (error) {
      // Enhanced error recovery without crashes
      handleErrorGracefully(error);
    }
  },
  [getFormattedContext, chatHistory]
);
```

**UI Enhancement**:

```javascript
// Non-blocking context change indicators
const showContextChangeIndicator = (newContext) => {
  setContextChangeNotification({
    message: `📚 Updated to ${newContext.reference.citation}`,
    timestamp: Date.now(),
    dismissible: true,
  });
};
```

#### **User Experience Benefits**

**For Bible Study Workflow**:

- **Explore Freely**: Navigate between related passages while maintaining AI conversation
- **Cross-Reference Discussions**: Ask about connections between different verses without losing context
- **Translation Comparison**: Switch between Bible versions mid-conversation seamlessly
- **Language Study**: Explore different language resources while discussing translation concepts

**For Translation Teams**:

- **Collaborative Context**: Team members can discuss different passages without conversation resets
- **Resource Comparison**: Switch between translation notes, questions, and words while chatting
- **Multi-Book Analysis**: Explore thematic connections across biblical books uninterrupted
- **Real-Time Adaptation**: AI assistant adapts to new context automatically

## Version 2.1.0 Update (2025-06-14)

- LLM context now always receives the exact raw USFM for the current chapter, matching what is rendered in the scripture pane.
- LLM prompt includes explicit instructions for extracting verse text from USFM (look for `\v {number}` markers).
- Reference/resources context always syncs with the URL and is fully initialized before rendering, preventing context/resource mismatch bugs.
- Chat interface auto-starts a new conversation with updated resources when the reference changes, removing the blocking "Reference Changed" dialog.
- Fixed bugs where the app was stuck on Titus 1:1 or an uninitialized context after navigation or refresh.
- Improved reliability of context/resource synchronization across navigation and chat.

## Status: ✅ COMPLETED & ENHANCED WITH SEAMLESS CONTEXT SLIPSTREAMING

✅ **Fully Implemented, Tested, and Enhanced with Professional Citation System** - Feature is production-ready

### System Prompt Specification

**📋 [LLM System Prompt Specification](./llm-system-prompt-specification.md)** - Comprehensive specification document defining all requirements for LLM behavior, scripture quoting accuracy, citation requirements, and response formatting standards.

### Implementation Status - ENHANCED v0.13.4

- ✅ Chat UI Component (LLMChatPanel)
- ✅ Context Integration (ChatContext)
- ✅ Serverless Backend (Netlify Function)
- ✅ OpenAI GPT-4.1-nano Integration
- ✅ Comprehensive Testing Suite
- ✅ Tab Integration with HelpsTabs
- ✅ Context-aware responses
- ✅ Development and production configurations
- ✅ **REAL DATA IMPLEMENTATION VERIFIED** - Chat uses live content from all translation resource panels
- ✅ **RESOURCESCONTEXT INTEGRATION CONFIRMED** - `getFormattedContext()` provides complete resource data through shared context
- ✅ **INTELLIGENT PARSING VERIFIED** - All resource types parsed into structured AI context
- ✅ **PRODUCTION READY CONFIRMED** - Real OpenAI responses when deployed to Netlify
- ✅ **ENHANCED CITATION SYSTEM** - Professional resource titles and RC link support (v0.13.3)
- ✅ **TRANSLATION WORDS FIX** - Fixed content access for complete article text (v0.13.3)
- ✅ **CONTEXT OPTIMIZATION** - Resolved context too large issues with proper field access (v0.13.3)
- ✅ **RESOURCE LOADING FIXES** - Enhanced resource readiness checks and loading state management (v0.13.4)
- ✅ **SCRIPTURE & TQ AVAILABILITY** - Fixed scripture parsing and translation questions loading issues (v0.13.4)
- ✅ **UI IMPROVEMENTS** - Added resource loading indicators and better user feedback (v0.13.4)

## Overview

The LLM Chat feature adds an AI Assistant tab to the translation helps interface, providing users with an intelligent chat companion that can answer questions about Bible verses, translation notes, and provide contextual assistance based on the current scripture reference.

## Architecture

### Components

- **LLMChatPanel**: Main chat interface component with message history and input field
- **ChatContext**: React context for managing chat state and messages
- **llmChatService**: Service layer for communicating with OpenAI API
- **Netlify Function**: Serverless backend endpoint for secure API communication

### Files Created

```
src-new/
├── components/
│   ├── LLMChatPanel.jsx              # Main chat UI component
│   ├── LLMChatPanel.module.css       # Styles for chat interface
│   └── LLMChatPanel.test.jsx         # Component tests
├── context/
│   └── ChatContext.jsx               # Chat state management
├── services/
│   └── llmChatService.js             # API communication service
netlify/
└── functions/
    └── chat.js                       # Serverless function for OpenAI API
netlify.toml                          # Netlify configuration
```

## Features

### Chat Interface

- **Clean, modern UI**: Following generic chat window design patterns
- **Message history**: Persistent conversation within session
- **Context awareness**: Automatically includes current verse reference
- **Typing indicators**: Visual feedback during API calls
- **Error handling**: Graceful degradation when API is unavailable

### Context Integration

- **Scripture reference**: Current book, chapter, and verse automatically included in chat context
- **Resource packaging**: Translation notes, questions, and other resources can be included in context
- **Dynamic updates**: Context updates when user navigates to different verses

### AI Capabilities - **ENHANCED WITH CITATION SYSTEM**

- **OpenAI GPT-4o-mini**: Powered by OpenAI's model optimized for improved output consistency and alignment with expectations, despite slightly higher cost
- **Strict Source Attribution**: Every response includes mandatory citations
- **No Hallucination**: AI restricted to ONLY information provided in context
- **Contextual responses**: Answers tailored to current scripture passage with citations
- **Translation assistance**: Helps with understanding translation notes and questions with proper attribution
- **Citation Format**: All responses include inline citations [TN-1], [TQ-2], [TW-3], [TWL-1], [SCRIPTURE]

### Citation System - **NEW FEATURE**

The LLM Chat now includes a comprehensive citation system to prevent hallucination and ensure all responses are grounded in the provided translation resources.

#### Citation Format

**Inline Citations:**

- `[SCRIPTURE]` - Direct quotes from the scripture text
- `[TN-1]`, `[TN-2]`, etc. - Translation Notes (numbered sequentially)
- `[TQ-1]`, `[TQ-2]`, etc. - Translation Questions (numbered sequentially)
- `[TW-1]`, `[TW-2]`, etc. - Translation Words (numbered sequentially)
- `[TWL-1]`, `[TWL-2]`, etc. - Translation Word Links (numbered sequentially)

#### Response Structure

All AI responses follow this mandatory structure:

```
[Answer with inline citations]

Sources:
- [TN-1]: Quote: "quoted text" - Text: "explanation text"
- [TQ-1]: Question: "question text" Answer: "answer text"
- [TW-1]: Term: "term name" Definition: "definition text"
- [SCRIPTURE]: "quoted scripture text"
```

#### Example Response

**User Question:** "What does this verse mean?"

**AI Response:**

```
According to the scripture text, "In the beginning God created the heavens and the earth" [SCRIPTURE]. The translation notes explain that "created" has specific theological significance [TN-1]. Translation teams should consider how to convey the completeness of God's creative act [TQ-1].

Sources:
- [SCRIPTURE]: "In the beginning God created the heavens and the earth"
- [TN-1]: Quote: "created" - Text: "The Hebrew word 'bara' indicates creation from nothing"
- [TQ-1]: Question: "How can you show that God created everything?" Answer: "Emphasize the totality of 'heavens and the earth'"
```

#### System Constraints

The AI is programmed with strict constraints:

1. **No External Knowledge**: Cannot use Bible knowledge beyond provided resources
2. **Mandatory Citations**: Every statement must include a citation
3. **Missing Information Protocol**: Must state when information is unavailable
4. **No Assumptions**: Cannot make interpretations not found in resources
5. **Source Verification**: All claims must trace back to specific resources

#### Benefits

- **Transparency**: Users can verify every claim against source materials
- **Accuracy**: Eliminates hallucinated information
- **Educational**: Helps users understand how to use translation resources
- **Trust**: Builds confidence in AI responses through verifiable sources
- **Consistency**: Ensures all responses follow the same attribution standards

## Real Data Implementation Details - UPDATED v0.13.3

### How Real Data Collection Works

The LLM Chat feature uses a **shared ResourcesContext architecture** to provide complete translation resource data directly to the chat without DOM extraction. This ensures the AI assistant has access to comprehensive resource data through the same context system used by UI panels.

#### ResourcesContext Integration

The `ChatContext.sendMessage()` function accesses complete resource data through the ResourcesContext:

```javascript
// From ChatContext.jsx - Current ResourcesContext Implementation
export function ChatProvider({ children }) {
  // Get current resources from ResourcesContext
  const { getFormattedContext } = useResourcesContext();

  const sendMessage = useCallback(
    async (message) => {
      try {
        // Get context from ResourcesContext (replaces DOM parsing and packageContext)
        const context = getFormattedContext();

        if (!context) {
          throw new Error("No context available. Please ensure resources are loaded.");
        }

        // Send to actual LLM with complete resource data
        response = await sendChatMessage(message, context, chatHistory);

        // Handle response...
      } catch (err) {
        console.error("Error sending message:", err);
      }
    },
    [getFormattedContext, chatHistory]
  );
}

// From ResourcesContext.jsx - Context Formatting
const getFormattedContext = useCallback(() => {
  if (!metadata) return null;

  return {
    reference: {
      book: metadata.bookId,
      chapter: metadata.chapter,
      verse: metadata.verse,
      organization: metadata.organization,
      language: metadata.languageId,
      citation: `${metadata.bookId} ${metadata.chapter}:${metadata.verse}`,
    },
    resources: {
      scripture: resources.scripture?.verses
        ? Object.entries(resources.scripture.verses)
            .map(([v, text]) => `[${v}] ${text}`)
            .join("\n")
        : null,
      translationNotes: resources.translationNotes,
      translationQuestions: resources.translationQuestions,
      translationWords: resources.translationWords,
      translationWordLinks: resources.translationWordLinks,
    },
    metadata: {
      timestamp: metadata.timestamp,
      manifestTitles: {
        scripture: resources.scripture?.title,
        translationNotes: resources.translationNotes[0]?.title,
        translationQuestions: resources.translationQuestions[0]?.title,
        translationWords: resources.translationWords[0]?.title,
        translationWordLinks: resources.translationWordLinks[0]?.title,
      },
    },
  };
}, [resources, metadata]);
```

#### Key Benefits of ResourcesContext Architecture

**Shared Data Source:**

- Both UI panels and chat system access the same underlying resource data
- Eliminates data inconsistencies between what users see and what AI receives
- Automatic synchronization when resources load or update

**Complete Resource Access:**

- Scripture: Full chapter content with verse-by-verse breakdown via custom USFM parsing
- Translation Notes: Complete structured notes with quotes, explanations, and metadata
- Translation Questions: Full question-answer pairs with contextual information
- Translation Words: Complete articles with definitions, facts, and examples (fixed in v0.13.3)
- Translation Word Links: RC link URIs for proper resource attribution

**Enhanced Data Quality:**

- Professional resource titles with unfoldingWord® branding
- RC link support for proper citation format (`rc://en/tw/dict/bible/kt/god`)
- Manifest-based resource loading ensures authentic content
- Custom USFM parsing provides accurate verse structure

#### System Prompt Integration

The structured context is integrated into the OpenAI system prompt:

```javascript
// From netlify/functions/chat.mjs
const buildSystemPrompt = (context) => {
  let prompt = `You are a biblical translation assistant helping with ${context.reference.display}.`;

  if (context.scripture) {
    prompt += `\n\nScripture Text: "${context.scripture.text}"`;
  }

  if (context.translationNotes.length > 0) {
    prompt += `\n\nTranslation Notes:\n${context.translationNotes
      .map((note) => `- "${note.quote}": ${note.explanation}`)
      .join("\n")}`;
  }

  if (context.translationQuestions.length > 0) {
    prompt += `\n\nTranslation Questions:\n${context.translationQuestions
      .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
      .join("\n\n")}`;
  }

  // Include other resources as available...

  return prompt;
};
```

### Production vs Development Behavior

**Production (Netlify Deployment):**

- Real OpenAI API calls with live resource context
- Full context packaging from all available panels
- Intelligent responses based on actual content

**Development (Local):**

- Mock responses when `VITE_USE_MOCK_CHAT=true` or API calls fail
- ResourcesContext data loading still occurs for testing
- Context structure identical to production for testing

### Resource Context Scope

**The chat context includes complete chapter content with verse-by-verse breakdown.**

When viewing Titus 1:1, the AI receives through ResourcesContext:

- **Complete Chapter**: Titus 1:1-16 (all verses parsed by Proskomma)
- **Rich Context**: Full passage context for comprehensive responses
- **Structured Data**: Verse-by-verse breakdown with proper formatting
- **Resource Metadata**: Professional titles and attribution information

This provides superior AI assistance because:

- **Contextual Understanding**: AI sees the full passage flow and themes
- **Cross-Verse References**: Can connect ideas across the chapter
- **Comprehensive Responses**: Not limited to single-verse explanations
- **User Convenience**: No need to navigate to ask about nearby verses
- **Data Integrity**: Direct access to the same data used by UI panels

The ResourcesContext ensures the AI assistant has reliable access to complete translation resources that are synchronized with what users see in the interface, providing contextually accurate responses with proper attribution.

## Configuration

### Environment Variables

For local development, add to `.env.development`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

For production deployment on Netlify:

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your OpenAI API key

### Netlify Configuration

The `netlify.toml` file includes:

- Build settings for Vite
- Function directory configuration
- Environment variable settings

## Usage

### For Users

1. **Access the Chat**: Click on the "AI Assistant" tab in the translation helps panel
2. **Ask Questions**: Type questions about the current verse, translation notes, or biblical context
3. **Context Awareness**: The AI automatically knows what verse you're viewing
4. **Conversation Flow**: Maintain ongoing conversations about scripture passages

### Example Interactions

```
User: "What is the meaning of this verse?"
AI: "In Genesis 1:1, 'In the beginning God created the heavens and the earth,' we see..."

User: "How should I translate 'bara' in this context?"
AI: "The Hebrew word 'bara' (בָּרָא) in Genesis 1:1 specifically means to create from nothing..."
```

### For Developers

#### Adding New Context Data

To include additional resources in the chat context, modify the ResourcesContext:

```javascript
// In ResourcesContext.jsx - Extend getFormattedContext()
const getFormattedContext = useCallback(() => {
  if (!metadata) return null;

  return {
    reference: {
      /* reference data */
    },
    resources: {
      scripture: resources.scripture?.verses,
      translationNotes: resources.translationNotes,
      translationQuestions: resources.translationQuestions,
      translationWords: resources.translationWords,
      translationWordLinks: resources.translationWordLinks,
      // Add new resource types here
    },
    metadata: {
      /* metadata */
    },
  };
}, [resources, metadata]);
```

#### Customizing the Chat Interface

Modify `LLMChatPanel.module.css` to adjust:

- Color scheme
- Typography
- Layout and spacing
- Animation effects

#### API Configuration

Update `netlify/functions/chat.js` to:

- Change OpenAI model parameters
- Modify system prompts
- Add additional processing logic
- Implement rate limiting

## Integration Points

### HelpsTabs Component

The chat panel is integrated as a static tab alongside:

- Translation Notes
- Translation Questions
- Translation Words

### App Context Providers

ChatProvider is wrapped around the app in the provider hierarchy:

```jsx
<ReferenceProvider>
  <MultiManifestsProvider>
    <ResourcesProvider>
      <ChatProvider>{/* App content */}</ChatProvider>
    </ResourcesProvider>
  </MultiManifestsProvider>
</ReferenceProvider>
```

## API Costs and Considerations

### OpenAI API Usage

- **Model**: GPT-4o-mini (optimized for improved output consistency)
- **Token Usage**: Estimated 500-2000 tokens per conversation
- **Cost**: Approximately $0.0003-0.0012 per conversation (slightly higher cost for better performance)
- **Rate Limits**: 500 requests per minute (depending on API tier)
- **Context Window**: 128K tokens with max output of 16K tokens
- **Speed**: ~120.0 tokens/second for reliable performance

### Optimization Strategies

- Context trimming for long conversations
- Message history limits (currently 50 messages)
- Efficient prompt engineering
- Local caching of similar queries

## Security

### API Key Protection

- API key stored securely in Netlify environment variables
- Never exposed to client-side code
- Serverless function acts as proxy to OpenAI API

### Input Validation

- Message length limits (4000 characters)
- Content filtering for inappropriate requests
- Rate limiting per session

### CORS and Headers

- Proper CORS configuration in Netlify function
- Security headers for API responses

## Testing

### Unit Tests

- Component rendering tests
- Context provider tests
- Service layer tests
- Mock API responses

### Integration Tests

- End-to-end chat functionality
- Context updates with navigation
- Error handling scenarios

### Manual Testing Checklist

- [ ] Chat interface loads correctly
- [ ] Messages send and receive properly
- [ ] Context updates with verse navigation
- [ ] Error states display appropriately
- [ ] UI is responsive on different screen sizes

## Future Enhancements

### Planned Features

1. **Voice Input/Output**: Speech-to-text and text-to-speech capabilities
2. **Custom Prompts**: User-defined system prompts for specialized use cases
3. **Chat History Persistence**: Save conversations across sessions
4. **Multi-language Support**: Responses in user's preferred language
5. **Resource Integration**: Direct integration with translation resources

### Technical Improvements

1. **Streaming Responses**: Real-time message streaming from OpenAI
2. **Advanced Context**: Include more resource data automatically
3. **Performance Optimization**: Reduce API call latency
4. **Offline Mode**: Basic responses when API is unavailable

## Troubleshooting

### Common Issues

**Chat not loading**

- Check OpenAI API key is set correctly
- Verify Netlify function is deployed
- Check browser console for errors

**API errors**

- Verify API key has sufficient credits
- Check OpenAI service status
- Review rate limit quotas

**Context not updating**

- Ensure ReferenceContext is working properly
- Check navigation between verses
- Verify ChatProvider is properly wrapped

### Error Messages

| Error                    | Cause                  | Solution                            |
| ------------------------ | ---------------------- | ----------------------------------- |
| "API key not configured" | Missing OPENAI_API_KEY | Set environment variable            |
| "Rate limit exceeded"    | Too many API calls     | Wait and retry, or upgrade API plan |
| "Failed to send message" | Network or API error   | Check connection and retry          |

## Recent Fixes

### v0.13.9 - ResourcesContext Synchronization Issue

**Fixed**: Translation questions showing in UI but missing from LLM chat context

- **Issue**: Cost estimates showed `translationQuestions: 0` even when questions were available
- **Root Cause**: Synchronization mismatch between UI panels and chat context loading logic
- **Solution**: Added manifest-based custom file path extraction to ResourcesContext
- **Documentation**: See [ResourcesContext Synchronization Fix](./resourcescontext-synchronization-fix.md)

## Support and Maintenance

### Monitoring

- Track API usage and costs
- Monitor error rates
- User feedback collection

### Updates

- OpenAI API version updates
- Security patches
- Feature enhancements based on user feedback

### Documentation

- Keep this documentation updated with changes
- Update component documentation
- Maintain API reference guide
