# Broader Context Notes Enhancement

## Overview

This enhancement addresses the issue where the LLM chat assistant would respond with "information not available" when asked about topics like cultural context, historical background, or themes that are covered in book or chapter introduction notes but not in verse-specific information.

## Problem

Previously, when users asked the LLM about broader topics (e.g., "What is the cultural context of this verse?"), the AI would only look at verse-specific translation notes and questions. If those didn't contain the requested information, it would respond that the information wasn't available, even though relevant context might exist in:

- **Book introduction notes** (`front:intro`) - containing overall book themes, historical background, author information, etc.
- **Chapter introduction notes** (e.g., `1:intro`) - containing chapter-specific context, themes, and connections

## Solution

### 1. Enhanced Translation Questions Service

**File**: `src/services/tqService.js`

- Updated `getQuestionsForVerse()` to include book and chapter introduction questions along with verse-specific questions
- Questions are returned in priority order: book intro → chapter intro → verse-specific
- Added support for multiple reference formats:
  - `front:intro` (book introduction)
  - `1:intro` (chapter introduction)
  - `gen/front/intro` (alternative book intro format)
  - `gen/1/intro` (alternative chapter intro format)

### 2. Enhanced LLM Prompt System

**File**: `netlify/functions/chat.js`

- **Clear categorization**: Notes and questions are now organized into distinct sections:
  - 📚 **BOOK INTRODUCTION NOTES/QUESTIONS** (broader context for the entire book)
  - 📖 **CHAPTER INTRODUCTION NOTES/QUESTIONS** (broader context for the chapter)
  - 📝 **VERSE-SPECIFIC NOTES/QUESTIONS** (for the specific verse)

- **Explicit permissions**: Added comprehensive instructions telling the LLM when and how to use broader context:
  - Check book intros for overall themes, historical background, author info
  - Check chapter intros for immediate context and flow
  - Use appropriate citation format indicating the scope level

- **Enhanced citation system**: Updated examples to show proper citation of broader context:
  - `[TN-1] [BOOK INTRO]` for book introduction notes
  - `[TN-2] [CHAPTER INTRO]` for chapter introduction notes
  - Clear guidance on when to use each level

### 3. Translation Notes Service (Already Supported)

**File**: `src/services/tnService.js`

- The translation notes service already included book and chapter introduction notes
- No changes were needed as it was already following the correct pattern

## Implementation Details

### Service Layer Changes

```javascript
// Translation Questions Service Enhancement
const bookIntroQuestions = [];
const chapterIntroQuestions = [];

entries.forEach((entry) => {
  // Check for book introduction (front:intro)
  if (entry.Reference === "front:intro" || 
      entry.Reference === `${bookId}/front/intro` ||
      (entry.Chapter === "front" && entry.Verse === "intro")) {
    bookIntroQuestions.push(entry);
  }
  // Check for chapter introduction (e.g., "1:intro")
  else if (entry.Reference === `${chapter}:intro` || 
           entry.Reference === `${bookId}/${chapter}/intro` ||
           (String(entry.Chapter).trim() === String(chapter).trim() && entry.Verse === "intro")) {
    chapterIntroQuestions.push(entry);
  }
});

// Combine: book intro, chapter intro, then verse-specific
const allQuestions = [...bookIntroQuestions, ...chapterIntroQuestions, ...verseQuestions];
```

### LLM Prompt Enhancement

```javascript
// Categorize notes/questions by scope
if (note.reference && note.reference.includes("front:intro")) {
  bookIntroNotes.push(noteEntry);
} else if (note.reference && note.reference.includes(":intro")) {
  chapterIntroNotes.push(noteEntry);
} else {
  verseNotes.push(noteEntry);
}

// Present in organized sections with clear labels
prompt += `\n\n📚 BOOK INTRODUCTION NOTES (broader context for the entire book):`;
prompt += `\n\n📖 CHAPTER INTRODUCTION NOTES (broader context for chapter ${reference.chapter}):`;
prompt += `\n\n📝 VERSE-SPECIFIC NOTES (for ${reference.citation}):`;
```

### Guidance for LLM Usage

The enhanced prompt includes specific instructions:

1. **When to use broader notes**:
   - Cultural context, historical background, literary structure
   - When verse-specific information is insufficient
   - For explaining connections between passages

2. **How to cite broader context**:
   - `"The book introduction explains... [TN-1] [BOOK INTRO]"`
   - `"According to the chapter introduction... [TN-5] [CHAPTER INTRO]"`
   - `"While there are no verse-specific notes on this topic, the book introduction provides... [TN-1] [BOOK INTRO]"`

3. **Response strategy**:
   - Always be transparent about the source level
   - Clearly indicate when using broader vs. verse-specific information
   - Combine resources appropriately for comprehensive answers

## Testing

### New Test Coverage

Added comprehensive test in `src/services/tqService.test.js`:

```javascript
it("includes book and chapter introduction questions with verse-specific questions", async () => {
  // Tests that book intro, chapter intro, and verse-specific questions
  // are all returned in the correct order with proper reference fields
});
```

### Verification

- ✅ All translation notes service tests pass
- ✅ All translation questions service tests pass  
- ✅ New functionality properly includes book/chapter intros
- ✅ Questions returned in correct priority order
- ✅ Proper reference field preservation

## User Experience Benefits

### Before Enhancement
- **User**: "What is the cultural context of Acts 1:1?"
- **LLM**: "This information is not available in the provided translation resources"
- **Reality**: Cultural context was available in Acts book introduction notes

### After Enhancement
- **User**: "What is the cultural context of Acts 1:1?"
- **LLM**: "While there are no verse-specific notes on cultural context, the book introduction provides relevant background. According to the Acts introduction, this book was written to provide an orderly account of early Christian history... [TN-1] [BOOK INTRO]"

### Key Improvements

1. **Comprehensive answers**: LLM can now provide helpful context even when verse-specific notes are limited
2. **Transparent sourcing**: Users understand whether information comes from verse, chapter, or book level
3. **Better resource utilization**: All available translation helps content is accessible to the AI
4. **Educational value**: Users learn about the different levels of context available in translation resources

## Compatibility

- **Backward compatible**: Existing functionality unchanged
- **No breaking changes**: All existing APIs and responses work as before
- **Progressive enhancement**: New features activate automatically when broader context notes are available
- **Graceful degradation**: Works normally when only verse-specific notes exist

## Future Enhancements

This foundation enables future improvements:

1. **Smart context selection**: AI could automatically choose the most relevant context level
2. **Cross-reference integration**: Connect related passages using broader context
3. **Theme tracking**: Use book-level themes to enhance verse understanding
4. **Study guides**: Generate comprehensive study materials using all context levels 