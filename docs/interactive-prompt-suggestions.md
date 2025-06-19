# Interactive Prompt Suggestions Feature

## Overview

The Interactive Prompt Suggestions feature transforms the AI chat panel's welcome experience from a static text suggestion to an engaging, clickable interface that helps users discover the AI assistant's capabilities and quickly start meaningful conversations about Bible translation.

## Feature Description

### Smart Suggestion System
- **Dynamic Prompt Generation**: 3-6 contextual suggestions based on available translation resources
- **Resource-Aware**: Suggestions adapt to loaded notes, questions, words, and links
- **Click-to-Send**: Users can click any suggestion to automatically send that message
- **Professional UI**: ETEN Lab themed buttons with hover effects and accessibility support

### User Experience
- **Improved Discovery**: Users can explore AI capabilities without typing
- **Better Onboarding**: Clear visual hierarchy guides new users
- **Instant Engagement**: One-click access to helpful translation discussions
- **Contextual Relevance**: Suggestions match available resources for current verse

## Technical Implementation

### Core Components

#### 1. Smart Prompt Generation Function
```javascript
const getPromptSuggestions = () => {
  const suggestions = [
    "What are the key translation challenges for this verse?",
    "Explain the cultural context of this passage",
    "What are the important words to understand in this verse?",
  ];

  // Add resource-specific suggestions
  if (resourceStatus.resourceCounts?.translationNotes > 0) {
    suggestions.push("Summarize the translation notes for this verse");
  }
  
  if (resourceStatus.resourceCounts?.translationQuestions > 0) {
    suggestions.push("What questions should translators consider?");
  }
  
  if (resourceStatus.resourceCounts?.translationWords > 0) {
    suggestions.push("Define the key theological terms in this passage");
  }

  return suggestions.slice(0, 6); // Limit to 6 suggestions
};
```

#### 2. Click Handler Implementation
```javascript
const handlePromptSuggestionClick = async (prompt) => {
  if (!areResourcesReady() || isLoading) return;
  
  setInputMessage(prompt);
  
  // Auto-send the message
  await sendMessage(prompt);
};
```

### UI Components

#### 1. Suggestion Container
```jsx
<div className={styles.promptSuggestions}>
  <p><strong>Try asking:</strong></p>
  <div className={styles.suggestionsList}>
    {getPromptSuggestions().map((suggestion, index) => (
      <button
        key={index}
        className={styles.suggestionButton}
        onClick={() => handlePromptSuggestionClick(suggestion)}
        disabled={isLoading || !areResourcesReady()}
        title={`Click to ask: "${suggestion}"`}
      >
        {suggestion}
      </button>
    ))}
  </div>
</div>
```

#### 2. Professional Styling
```css
.suggestionButton {
  background-color: var(--help-quote-background);
  color: var(--help-quote-color);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: var(--line-height-relaxed);
  font-family: var(--font-family-primary);
}

.suggestionButton:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## Suggestion Categories

### 1. Core Suggestions (Always Available)
- **Translation Challenges**: "What are the key translation challenges for this verse?"
- **Cultural Context**: "Explain the cultural context of this passage"
- **Important Words**: "What are the important words to understand in this verse?"

### 2. Resource-Specific Suggestions (Conditional)
- **Translation Notes**: "Summarize the translation notes for this verse" (if notes available)
- **Translation Questions**: "What questions should translators consider?" (if questions available)
- **Translation Words**: "Define the key theological terms in this passage" (if words available)

## Theme Integration

### ETEN Lab Branding
- **Default State**: Grey background with dark text for readability
- **Hover State**: ETEN Lab green background with black text
- **Consistent Styling**: Matches overall application design system
- **Accessibility**: Proper focus states and keyboard navigation

### Cross-Theme Support
- **Light Theme**: Dark text on light grey background
- **Dark Theme**: Light text on dark grey background
- **Hover Consistency**: Green background with black text in both themes

## Accessibility Features

### Keyboard Navigation
- **Tab Support**: All buttons are keyboard accessible
- **Focus Indicators**: Clear visual focus states
- **Screen Reader**: Proper ARIA labels and semantic markup

### Disabled States
- **Loading Protection**: Buttons disabled when AI is processing
- **Resource Dependency**: Buttons disabled when resources aren't ready
- **Visual Feedback**: Clear disabled styling with reduced opacity

## User Benefits

### Improved Discovery
- **Capability Awareness**: Users learn what the AI can help with
- **Quick Start**: No need to think of questions from scratch
- **Contextual Guidance**: Suggestions match available resources

### Enhanced Onboarding
- **Visual Hierarchy**: Clear "Try asking:" header
- **Interactive Elements**: Buttons look clickable and inviting
- **Immediate Value**: Users can start productive conversations instantly

### Professional Experience
- **Polished UI**: Consistent with ETEN Lab design standards
- **Smooth Interactions**: Hover effects and transitions
- **Reliable Functionality**: Proper error handling and loading states

## Future Enhancements

### Potential Improvements
1. **Personalized Suggestions**: Learn from user interaction patterns
2. **Verse-Specific Prompts**: Tailor suggestions to specific biblical content
3. **Multi-Language Support**: Suggestions in different languages
4. **Advanced Categorization**: Group suggestions by topic or complexity
5. **Suggestion History**: Remember and suggest previously effective prompts

### Implementation Considerations
- **Performance**: Efficient suggestion generation
- **Scalability**: Support for additional resource types
- **Customization**: User preference for suggestion types
- **Analytics**: Track which suggestions are most effective

## Testing Strategy

### Unit Tests
- Suggestion generation logic
- Click handler functionality
- Resource-aware filtering

### Integration Tests
- AI chat integration
- Theme switching behavior
- Accessibility compliance

### User Experience Tests
- Suggestion relevance
- Click-to-send reliability
- Visual design consistency

## Conclusion

The Interactive Prompt Suggestions feature significantly enhances the AI chat panel by transforming passive text into an engaging, discoverable interface. It reduces friction for new users while providing quick access to relevant translation assistance for experienced users. The implementation maintains ETEN Lab branding standards while ensuring accessibility and cross-theme compatibility. 