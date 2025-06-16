# Scripture Quoting Approaches for LLM Chat

## Current Situation

The LLM chat system has comprehensive constraints for verbatim scripture quoting (see `docs/llm-system-prompt-specification.md`), but in practice, the LLM occasionally rewords scripture text slightly despite explicit instructions. This is frustrating for users who expect exact scripture quotations.

### Current Implementation

- Scripture text is extracted using the semantic USFM parser
- Text is passed to LLM as `scriptureText` field
- System prompt has **#1 ABSOLUTE PRIORITY** rule for character-for-character accuracy
- Multiple verification steps and warnings in the prompt

## Approach 1: Placeholder/Template System

### How It Works

Instead of relying on the LLM to quote scripture correctly, use a placeholder system:

1. **Pre-processing**: Extract exact scripture text before sending to LLM
2. **Placeholder Injection**: Replace scripture references with placeholders like `[[VERSE_TEXT]]`
3. **LLM Response**: LLM uses placeholders instead of trying to quote
4. **Post-processing**: Replace placeholders with actual scripture text

### Implementation Example

```javascript
// Pre-process
const scriptureText = "Paul, a servant of God and an apostle of Jesus Christ";
const prompt = `The verse text is: [[VERSE_TEXT]]. Please analyze this verse.`;

// LLM responds with:
("The verse [[VERSE_TEXT]] shows Paul introducing himself...");

// Post-process
const finalResponse = llmResponse.replace("[[VERSE_TEXT]]", `"${scriptureText}" [SCRIPTURE]`);
```

### Pros

1. **100% Accuracy Guaranteed**: Scripture text is never processed by the LLM, eliminating any chance of rewording
2. **Consistency**: Every scripture quote will be exactly as provided
3. **Simpler Prompt**: Can remove complex scripture quoting rules from system prompt
4. **Reduced Token Usage**: Shorter system prompt without extensive quoting rules
5. **Error Prevention**: Completely eliminates scripture misquoting errors
6. **Easier Validation**: Simple regex to verify all placeholders were replaced

### Cons

1. **Implementation Complexity**: Requires pre/post-processing pipeline
2. **Context Loss**: LLM can't analyze the actual words in the scripture while forming response
3. **Flexibility Reduction**: LLM can't do partial quotes or integrate scripture naturally into sentences
4. **Maintenance**: Another layer of code to maintain and test
5. **Edge Cases**: Need to handle multiple verse references, partial quotes, etc.
6. **Debugging**: Harder to debug when LLM response doesn't make sense without seeing actual text

## Approach 2: Enhanced System Prompt Engineering

### How It Works

Strengthen the existing system prompt approach with additional techniques:

1. **Repetition**: Repeat the verbatim rule multiple times throughout the prompt
2. **Examples**: Provide more positive and negative examples
3. **Verification Step**: Add explicit "STOP AND VERIFY" instruction
4. **Consequences**: Frame misquoting as a "critical error" or "violation"
5. **Structured Format**: Require specific formatting that makes paraphrasing harder

### Implementation Example

```javascript
const enhancedPrompt = `
CRITICAL SCRIPTURE RULE - READ THIS FIRST:
═══════════════════════════════════════════
⚠️ SCRIPTURE MUST BE QUOTED EXACTLY CHARACTER-FOR-CHARACTER ⚠️
ANY PARAPHRASING IS A CRITICAL VIOLATION
═══════════════════════════════════════════

[SCRIPTURE]: "Paul, a servant of God and an apostle of Jesus Christ"

BEFORE RESPONDING, YOU MUST:
1. Copy scripture EXACTLY as shown above
2. Include EVERY punctuation mark
3. Preserve EXACT capitalization
4. Use quotation marks around ALL scripture

VERIFICATION CHECKPOINT: Did you copy scripture EXACTLY? 
If you paraphrased even ONE WORD, START OVER.
`;
```

### Pros

1. **Natural Integration**: LLM can analyze and discuss scripture content directly
2. **Flexibility**: Can handle partial quotes, multiple verses, complex references
3. **No Additional Infrastructure**: Works within existing system
4. **Contextual Understanding**: LLM understands the scripture while responding
5. **Simpler Codebase**: No pre/post-processing needed
6. **Industry Standard**: Follows common LLM prompt engineering practices

### Cons

1. **Not 100% Reliable**: Even the best prompts can't guarantee perfect compliance
2. **Model Dependent**: Different models may respond differently to instructions
3. **Token Cost**: Longer, more detailed prompts use more tokens
4. **Inconsistency**: May work 95% of the time but still fail occasionally
5. **Temperature Sensitivity**: Higher temperature settings increase paraphrasing risk
6. **Prompt Fatigue**: Too many rules can sometimes cause the model to ignore some

## Approach 3: Hybrid Solution

### How It Works

Combine both approaches for maximum reliability:

1. Use enhanced prompt for general guidance
2. Implement placeholder system for critical verses
3. Allow natural quoting for less critical references
4. Post-process to verify and correct any misquotes

### Implementation

```javascript
// For critical verses (e.g., the main verse being studied)
const criticalText = "Paul, a servant of God...";
prompt += `\nMain verse (USE EXACTLY): [[MAIN_VERSE]]`;

// For supporting verses (less critical)
prompt += `\nSupporting scriptures may be quoted naturally following verbatim rules`;

// Post-process to ensure accuracy
const response = postProcessScriptureQuotes(llmResponse, {
  "[[MAIN_VERSE]]": criticalText,
  verifyNaturalQuotes: true,
});
```

## Recommendation

**For maximum scripture accuracy, implement Approach 1 (Placeholder System) for the following reasons:**

1. **User Trust**: Even one misquoted scripture undermines user confidence
2. **Theological Sensitivity**: Scripture accuracy is non-negotiable in Bible translation work
3. **Predictability**: Translators need consistent, reliable tools
4. **Simplicity**: Once implemented, it "just works" without tweaking prompts

### Implementation Strategy

1. **Phase 1**: Implement basic placeholder replacement for single verse quotes
2. **Phase 2**: Add support for partial quotes and verse ranges
3. **Phase 3**: Handle complex scenarios (multiple verses, inline references)
4. **Phase 4**: Add configuration option to toggle between approaches

### Example Implementation Structure

```javascript
// In ResourcesContext.jsx
const getFormattedContext = useCallback(() => {
  // ... existing code ...

  return {
    reference: {
      /* ... */
    },
    resources: {
      scriptureText,
      scripturePlaceholder: "[[SCRIPTURE_TEXT]]", // New field
      // ... other resources
    },
    // ... rest of context
  };
});

// In llmChatService.js
export function formatSystemPrompt(contextData) {
  // Use placeholder instead of actual text
  prompt += `\n- Scripture Text: ${resources.scripturePlaceholder}`;
  // Store actual text for post-processing
  contextData._scriptureText = resources.scriptureText;
}

// New post-processing function
export function postProcessResponse(response, contextData) {
  return response.replace(/\[\[SCRIPTURE_TEXT\]\]/g, `"${contextData._scriptureText}" [SCRIPTURE]`);
}
```

## Configuration Options

Add user preferences for scripture quoting:

```javascript
const scriptureQuotingModes = {
  STRICT_PLACEHOLDER: "placeholder", // Always use placeholders
  ENHANCED_PROMPT: "prompt", // Rely on prompt engineering
  HYBRID: "hybrid", // Mix based on context
  VERIFY_AND_CORRECT: "verify", // Natural quoting with post-verification
};
```

## Testing Strategy

1. **Unit Tests**: Verify placeholder replacement logic
2. **Integration Tests**: Test full pipeline with various verse formats
3. **Regression Tests**: Ensure no scripture misquotes in test suite
4. **User Acceptance**: A/B test with users to verify improved accuracy

## Conclusion

While prompt engineering (Approach 2) is simpler to implement, the placeholder system (Approach 1) is the only way to guarantee 100% scripture quoting accuracy. Given the critical nature of scripture accuracy in Bible translation, the additional implementation complexity is justified.

The hybrid approach (Approach 3) could serve as a good migration strategy, allowing gradual implementation while maintaining system functionality.
