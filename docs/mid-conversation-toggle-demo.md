# Mid-Conversation Resource Toggling Demo

## 🎛️ New Feature: Dynamic Context Control

You can now adjust AI context **during** conversations! This transforms the chat from a static tool into a dynamic experimental platform.

## How It Works

### 1. **Start a Conversation**

- Navigate to any verse (e.g., John 3:16)
- Ask the AI a question: "What are the key translation challenges here?"

### 2. **Mid-Conversation Controls Appear**

Once you have messages, a compact toggle bar appears with:

- 🎛️ **Adjust Context:** label
- **Compact toggles** for each resource type:
  - **Scr** (Scripture)
  - **Notes** (Translation Notes)
  - **Q's** (Translation Questions)
  - **Words** (Translation Words)
  - **Links** (Translation Word Links)

### 3. **Toggle Resources Live**

- Click any toggle to enable/disable that resource
- **⚡ Visual feedback** shows what changed
- **Real-time updates** - next AI response uses new context

## Example Workflow

```
1. Ask: "What are the key translation challenges?"
   → AI responds with ALL resources

2. Toggle OFF "Translation Notes"
   → See notification: "Context updated: notes disabled (4 active)"

3. Ask: "What about now?"
   → AI responds WITHOUT translation notes

4. Toggle ON "Notes", Toggle OFF "Scripture"
   → AI now has notes but no scripture text

5. Ask same question again
   → Completely different perspective!
```

## Key Benefits

### 🔬 **A/B Testing Made Easy**

- Compare AI responses with different resource combinations
- Understand how each resource type affects reasoning
- Find optimal resource combinations for different use cases

### 🎯 **Focused Context**

- Remove noise when you need specific insights
- "Scripture Only" mode for text-focused analysis
- "Notes Only" mode for scholarly commentary

### 🚀 **Real-Time Experimentation**

- No need to restart conversations
- Instant feedback on context changes
- Visual indicators prevent confusion

## Technical Features

- **Sticky positioning** - toggles always visible during conversation
- **Visual feedback** - animated notifications for changes
- **Compact design** - doesn't interfere with chat flow
- **Session-only** - no persistence, pure experimentation
- **Real-time updates** - immediate effect on next AI response

## Use Cases

1. **Translation Team Training**: Show how different resources affect AI reasoning
2. **Resource Quality Assessment**: Test AI responses with/without specific resources
3. **Context Optimization**: Find best resource combinations for specific questions
4. **Educational Demos**: Show the value of different translation resources

---

**Try it now at:** https://dev--translation-helps.netlify.app

_Navigate to any verse, start chatting, and watch the magic happen!_ ✨
