/**
 * Emoji Enhancement Utility
 * Adds contextually relevant emojis to LLM responses to make them more visually appealing
 */

/**
 * Maps of keywords/phrases to their corresponding emojis
 */
const EMOJI_MAPPINGS = {
  // Translation-specific content
  translation: {
    patterns: [
      { regex: /\b(translat(e|ion|ing|ed))\b/gi, emoji: "🔄" },
      { regex: /\b(interpret(ation|ing|ed)?)\b/gi, emoji: "🔍" },
      { regex: /\b(meaning|means)\b/gi, emoji: "💡" },
      { regex: /\b(context|contextual)\b/gi, emoji: "🎯" },
      { regex: /\b(original|source)\s+(text|language)\b/gi, emoji: "📜" },
      { regex: /\b(greek|hebrew|aramaic)\b/gi, emoji: "🏛️" },
      { regex: /\b(manuscript|manuscripts)\b/gi, emoji: "📋" },
      { regex: /\b(variant|variants)\b/gi, emoji: "🔀" },
    ],
  },

  // Biblical content
  biblical: {
    patterns: [
      { regex: /\b(god|lord|yahweh|jehovah)\b/gi, emoji: "✨" },
      { regex: /\b(jesus|christ|messiah)\b/gi, emoji: "✝️" },
      { regex: /\b(holy spirit|spirit)\b/gi, emoji: "🕊️" },
      { regex: /\b(scripture|bible|biblical)\b/gi, emoji: "📖" },
      { regex: /\b(verse|verses)\b/gi, emoji: "📝" },
      { regex: /\b(chapter|chapters)\b/gi, emoji: "📄" },
      { regex: /\b(psalm|psalms)\b/gi, emoji: "🎵" },
      { regex: /\b(prophet|prophetic|prophecy)\b/gi, emoji: "🔮" },
      { regex: /\b(temple|sanctuary)\b/gi, emoji: "🏛️" },
      { regex: /\b(covenant|promise)\b/gi, emoji: "🤝" },
      { regex: /\b(kingdom|reign)\b/gi, emoji: "👑" },
      { regex: /\b(shepherd|flock)\b/gi, emoji: "🐑" },
      { regex: /\b(light|darkness)\b/gi, emoji: "💡" },
      { regex: /\b(water|river|sea)\b/gi, emoji: "🌊" },
      { regex: /\b(mountain|hill)\b/gi, emoji: "⛰️" },
      { regex: /\b(desert|wilderness)\b/gi, emoji: "🏜️" },
      { regex: /\b(harvest|grain|wheat)\b/gi, emoji: "🌾" },
      { regex: /\b(vine|vineyard|grapes)\b/gi, emoji: "🍇" },
      { regex: /\b(olive|oil)\b/gi, emoji: "🫒" },
    ],
  },

  // Cultural and historical
  cultural: {
    patterns: [
      { regex: /\b(culture|cultural|custom)\b/gi, emoji: "🏺" },
      { regex: /\b(historical|history|ancient)\b/gi, emoji: "⏳" },
      { regex: /\b(tradition|traditional)\b/gi, emoji: "🎭" },
      { regex: /\b(jewish|judaism)\b/gi, emoji: "✡️" },
      { regex: /\b(roman|rome)\b/gi, emoji: "🏛️" },
      { regex: /\b(israel|israelite)\b/gi, emoji: "🇮🇱" },
      { regex: /\b(egypt|egyptian)\b/gi, emoji: "🐪" },
      { regex: /\b(babylon|babylonian)\b/gi, emoji: "🏗️" },
      { regex: /\b(gentile|nations)\b/gi, emoji: "🌍" },
      { regex: /\b(feast|festival|celebration)\b/gi, emoji: "🎉" },
      { regex: /\b(sacrifice|offering)\b/gi, emoji: "🔥" },
      { regex: /\b(priest|priesthood)\b/gi, emoji: "👨‍💼" },
      { regex: /\b(king|royal|throne)\b/gi, emoji: "👑" },
    ],
  },

  // Literary and linguistic
  literary: {
    patterns: [
      { regex: /\b(metaphor|metaphorical)\b/gi, emoji: "🎨" },
      { regex: /\b(symbol|symbolic|symbolism)\b/gi, emoji: "🔣" },
      { regex: /\b(parable|allegory)\b/gi, emoji: "📚" },
      { regex: /\b(poetry|poetic)\b/gi, emoji: "🎭" },
      { regex: /\b(parallel|parallelism)\b/gi, emoji: "↔️" },
      { regex: /\b(emphasis|emphasize)\b/gi, emoji: "❗" },
      { regex: /\b(contrast|compare|comparison)\b/gi, emoji: "⚖️" },
      { regex: /\b(chiasm|chiastic)\b/gi, emoji: "🔄" },
      { regex: /\b(repetition|repeated)\b/gi, emoji: "🔁" },
    ],
  },

  // Actions and emotions
  actions: {
    patterns: [
      { regex: /\b(love|beloved|loving)\b/gi, emoji: "❤️" },
      { regex: /\b(joy|joyful|rejoice)\b/gi, emoji: "😊" },
      { regex: /\b(peace|peaceful)\b/gi, emoji: "☮️" },
      { regex: /\b(hope|hopeful)\b/gi, emoji: "🌟" },
      { regex: /\b(faith|faithful|believe)\b/gi, emoji: "🙏" },
      { regex: /\b(worship|praise|glorify)\b/gi, emoji: "🙌" },
      { regex: /\b(pray|prayer|praying)\b/gi, emoji: "🙏" },
      { regex: /\b(blessing|blessed|bless)\b/gi, emoji: "✨" },
      { regex: /\b(forgive|forgiveness)\b/gi, emoji: "🤗" },
      { regex: /\b(repent|repentance)\b/gi, emoji: "💔" },
      { regex: /\b(sin|sinful|evil)\b/gi, emoji: "⚠️" },
      { regex: /\b(righteous|righteousness)\b/gi, emoji: "⚖️" },
      { regex: /\b(wise|wisdom)\b/gi, emoji: "🦉" },
      { regex: /\b(teach|teaching|learn)\b/gi, emoji: "📚" },
      { regex: /\b(journey|travel|walk)\b/gi, emoji: "🚶" },
      { regex: /\b(fight|battle|war)\b/gi, emoji: "⚔️" },
      { regex: /\b(victory|triumph)\b/gi, emoji: "🏆" },
      { regex: /\b(servant|serve|service)\b/gi, emoji: "🤲" },
    ],
  },

  // Question and answer patterns
  discourse: {
    patterns: [
      { regex: /^#{1,6}\s*(.+)$/gm, emoji: "📍", position: "before" }, // Headers
      { regex: /\?\s*$/gm, emoji: "❓", position: "after" }, // Questions
      { regex: /!\s*$/gm, emoji: "❗", position: "after" }, // Exclamations
      { regex: /\b(important|crucial|key|essential)\b/gi, emoji: "🔑" },
      { regex: /\b(note|notice|observe)\b/gi, emoji: "👁️" },
      { regex: /\b(consider|think about|reflect)\b/gi, emoji: "🤔" },
      { regex: /\b(remember|recall)\b/gi, emoji: "💭" },
      { regex: /\b(challenge|difficult|complexity)\b/gi, emoji: "🧩" },
      { regex: /\b(solution|answer|resolve)\b/gi, emoji: "💡" },
      { regex: /\b(example|instance|illustration)\b/gi, emoji: "📋" },
      { regex: /\b(summary|conclusion|in summary)\b/gi, emoji: "📊" },
    ],
  },
};

/**
 * Enhances text with contextually relevant emojis
 * @param {string} text - The original text to enhance
 * @param {object} options - Enhancement options
 * @param {boolean} options.enabled - Whether emoji enhancement is enabled
 * @param {number} options.maxEmojisPerResponse - Maximum emojis to add per response
 * @param {array} options.excludeCategories - Categories to exclude
 * @returns {string} Enhanced text with emojis
 */
export function enhanceWithEmojis(text, options = {}) {
  const { enabled = true, maxEmojisPerResponse = 8, excludeCategories = [] } = options;

  if (!enabled || !text || typeof text !== 'string') {
    return text || '';
  }

  let enhancedText = text;
  let emojiCount = 0;
  const usedEmojis = new Set(); // Prevent emoji repetition

  // Apply enhancements from each category
  Object.entries(EMOJI_MAPPINGS).forEach(([category, { patterns }]) => {
    if (excludeCategories.includes(category) || emojiCount >= maxEmojisPerResponse) {
      return;
    }

    patterns.forEach(({ regex, emoji, position = "after" }) => {
      if (emojiCount >= maxEmojisPerResponse) return;

      // Skip if we've already used this emoji
      if (usedEmojis.has(emoji)) return;

      const matches = enhancedText.match(regex);
      if (matches && matches.length > 0) {
        // Only add emoji to the first match to avoid overuse
        const firstMatch = matches[0];
        const matchIndex = enhancedText.indexOf(firstMatch);

        if (matchIndex !== -1) {
          const beforeText = enhancedText.substring(0, matchIndex);
          const afterText = enhancedText.substring(matchIndex + firstMatch.length);

          if (position === "before") {
            enhancedText = beforeText + emoji + " " + firstMatch + afterText;
          } else {
            enhancedText = beforeText + firstMatch + " " + emoji + afterText;
          }

          usedEmojis.add(emoji);
          emojiCount++;
        }
      }
    });
  });

  return enhancedText;
}

/**
 * Adds section emojis to markdown headings and lists
 * @param {string} text - The markdown text
 * @returns {string} Text with section emojis
 */
export function addSectionEmojis(text) {
  if (!text || typeof text !== 'string') return text || '';

  let enhancedText = text;

  // Add emojis to markdown headings based on content
  const headingPatterns = [
    { regex: /^(#{1,6}\s*)(.*translation.*)/gim, emoji: "🔄" },
    { regex: /^(#{1,6}\s*)(.*meaning.*|.*definition.*)/gim, emoji: "💡" },
    { regex: /^(#{1,6}\s*)(.*context.*|.*background.*)/gim, emoji: "🎯" },
    { regex: /^(#{1,6}\s*)(.*challenge.*|.*difficult.*)/gim, emoji: "🧩" },
    { regex: /^(#{1,6}\s*)(.*example.*|.*illustration.*)/gim, emoji: "📋" },
    { regex: /^(#{1,6}\s*)(.*summary.*|.*conclusion.*)/gim, emoji: "📊" },
    { regex: /^(#{1,6}\s*)(.*key.*|.*important.*)/gim, emoji: "🔑" },
    { regex: /^(#{1,6}\s*)(.*note.*|.*observation.*)/gim, emoji: "📝" },
  ];

  headingPatterns.forEach(({ regex, emoji }) => {
    if (enhancedText && typeof enhancedText === 'string') {
      enhancedText = enhancedText.replace(regex, `$1${emoji} $2`);
    }
  });

  // Add emojis to list items based on content
  const listPatterns = [
    { regex: /^(\s*[-*+]\s*)(.*translation.*)/gim, emoji: "🔄" },
    { regex: /^(\s*[-*+]\s*)(.*meaning.*)/gim, emoji: "💡" },
    { regex: /^(\s*[-*+]\s*)(.*context.*)/gim, emoji: "🎯" },
    { regex: /^(\s*[-*+]\s*)(.*key.*|.*important.*)/gim, emoji: "🔑" },
    { regex: /^(\s*[-*+]\s*)(.*challenge.*)/gim, emoji: "🧩" },
    { regex: /^(\s*[-*+]\s*)(.*example.*)/gim, emoji: "📋" },
  ];

  listPatterns.forEach(({ regex, emoji }) => {
    if (enhancedText && typeof enhancedText === 'string') {
      enhancedText = enhancedText.replace(regex, `$1${emoji} $2`);
    }
  });

  return enhancedText || '';
}

/**
 * Main function to enhance LLM responses with emojis
 * @param {string} response - The LLM response text
 * @param {object} options - Enhancement options
 * @returns {string} Enhanced response with emojis
 */
export function enhanceLLMResponse(response, options = {}) {
  if (!response || typeof response !== 'string') return response || '';

  // First add section emojis to structure
  let enhanced = addSectionEmojis(response);

  // Then add contextual emojis to content (but exclude already enhanced sections)
  enhanced = enhanceWithEmojis(enhanced, {
    ...options,
    excludeCategories: [...(options.excludeCategories || []), "discourse"], // Skip general discourse patterns that overlap with section emojis
  });

  return enhanced || '';
}

// Default export
export default {
  enhanceWithEmojis,
  addSectionEmojis,
  enhanceLLMResponse,
};
