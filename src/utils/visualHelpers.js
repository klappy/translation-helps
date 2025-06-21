export function getBookEmoji(bookId) { const icons = { gen: "🌅", exo: "🏔️", lev: "🕊️", num: "🔢", deu: "📜", jos: "⚔️", jdg: "⚖️", rut: "🌾", "1sa": "👑", "2sa": "👑", "1ki": "🏰", "2ki": "🏰", "1ch": "📊", "2ch": "📊", ezr: "🔨", neh: "🧱", est: "👸", job: "💭", psa: "🎵", pro: "💡", ecc: "🤔", sng: "💕", isa: "📢", jer: "😢", lam: "😭", ezk: "👁️", dan: "🦁", hos: "💔", jol: "🦗", amo: "⚖️", oba: "⚡", jon: "🐋", mic: "🎤", nam: "⚡", hab: "🤲", zep: "🔥", hag: "🏗️", zec: "🔮", mal: "💌", mat: "👤", mrk: "🦁", luk: "🐂", jhn: "��", act: "🔥", rom: "🏛️", "1co": "⛪", "2co": "⛪", gal: "⛓️", eph: "🏰", php: "😊", col: "👑", "1th": "⏰", "2th": "⏰", "1ti": "👨‍🏫", "2ti": "👨‍🏫", tit: "🏝️", phm: "🤝", heb: "⛪", jas: "⚖️", "1pe": "🗿", "2pe": "🗿", "1jn": "❤️", "2jn": "💝", "3jn": "💝", jud: "⚠️", rev: "🌟" }; return icons[bookId] || "📖"; }
export function getResourceIcon(resourceId) { const icons = { ult: "📖", ust: "📚", utn: "📝", utq: "❓", utw: "📋", uta: "🎓", obs: "📚", bible: "📖", tn: "📝", tq: "❓", tw: "📋", twl: "🔗", ta: "🎓" }; const id = resourceId?.toLowerCase() || ""; return icons[id] || "📄"; }
export function getOrganizationAvatar(organization) { if (!organization) return { type: "text", value: "?" }; if (organization.avatar_url) return { type: "image", value: organization.avatar_url, alt: organization.full_name || organization.login || "Organization" }; const name = organization.full_name || organization.login || organization.name || "Org"; const initials = name.split(" ").map(word => word.charAt(0).toUpperCase()).slice(0, 2).join(""); return { type: "text", value: initials || name.charAt(0).toUpperCase() }; }

/**
 * Get language flag emoji from language code
 * Uses primary country mapping for better flag representation
 * @param {string} languageCode - Language code (e.g., 'en', 'fr', 'es')
 * @returns {string} Flag emoji
 */
export function getLanguageFlag(languageCode) {
  if (!languageCode) return '🌐';
  
  // Primary country mapping for languages
  // Maps language codes to their most representative country flags
  const languageToCountry = {
    'en': 'GB', // English -> United Kingdom (linguistically correct)
    'es': 'ES', // Spanish -> Spain
    'fr': 'FR', // French -> France
    'de': 'DE', // German -> Germany
    'pt': 'PT', // Portuguese -> Portugal (European Portuguese)
    'it': 'IT', // Italian -> Italy
    'ru': 'RU', // Russian -> Russia
    'zh': 'CN', // Chinese -> China
    'ja': 'JP', // Japanese -> Japan
    'ko': 'KR', // Korean -> South Korea
    'ar': 'SA', // Arabic -> Saudi Arabia
    'hi': 'IN', // Hindi -> India
    'bn': 'BD', // Bengali -> Bangladesh
    'ur': 'PK', // Urdu -> Pakistan
    'fa': 'IR', // Persian/Farsi -> Iran
    'tr': 'TR', // Turkish -> Turkey
    'he': 'IL', // Hebrew -> Israel
    'th': 'TH', // Thai -> Thailand
    'vi': 'VN', // Vietnamese -> Vietnam
    'id': 'ID', // Indonesian -> Indonesia
    'ms': 'MY', // Malay -> Malaysia
    'tl': 'PH', // Tagalog -> Philippines
    'sw': 'TZ', // Swahili -> Tanzania
    'am': 'ET', // Amharic -> Ethiopia
    'ha': 'NG', // Hausa -> Nigeria
    'yo': 'NG', // Yoruba -> Nigeria
    'ig': 'NG', // Igbo -> Nigeria
    'zu': 'ZA', // Zulu -> South Africa
    'af': 'ZA', // Afrikaans -> South Africa
    'nl': 'NL', // Dutch -> Netherlands
    'sv': 'SE', // Swedish -> Sweden
    'no': 'NO', // Norwegian -> Norway
    'da': 'DK', // Danish -> Denmark
    'fi': 'FI', // Finnish -> Finland
    'pl': 'PL', // Polish -> Poland
    'cs': 'CZ', // Czech -> Czech Republic
    'sk': 'SK', // Slovak -> Slovakia
    'hu': 'HU', // Hungarian -> Hungary
    'ro': 'RO', // Romanian -> Romania
    'bg': 'BG', // Bulgarian -> Bulgaria
    'hr': 'HR', // Croatian -> Croatia
    'sr': 'RS', // Serbian -> Serbia
    'sl': 'SI', // Slovenian -> Slovenia
    'et': 'EE', // Estonian -> Estonia
    'lv': 'LV', // Latvian -> Latvia
    'lt': 'LT', // Lithuanian -> Lithuania
    'el': 'GR', // Greek -> Greece
    'mk': 'MK', // Macedonian -> North Macedonia
    'sq': 'AL', // Albanian -> Albania
    'mt': 'MT', // Maltese -> Malta
    'ga': 'IE', // Irish -> Ireland
    'cy': 'GB', // Welsh -> United Kingdom (Wales)
    'is': 'IS', // Icelandic -> Iceland
    'fo': 'FO', // Faroese -> Faroe Islands
    'eu': 'ES', // Basque -> Spain
    'ca': 'ES', // Catalan -> Spain
    'gl': 'ES', // Galician -> Spain
    'pt-br': 'BR', // Brazilian Portuguese -> Brazil
    'es-419': 'MX', // Latin American Spanish -> Mexico
    'zh-cn': 'CN', // Simplified Chinese -> China
    'zh-tw': 'TW', // Traditional Chinese -> Taiwan
  };
  
  const countryCode = languageToCountry[languageCode.toLowerCase()];
  if (countryCode) {
    return getCountryFlag(countryCode);
  }
  
  // Fallback to globe icon for unknown languages
  return '🌐';
}

/**
 * Get country flag emoji from country code
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'FR', 'DE')
 * @returns {string} Flag emoji or empty string if not found
 */
export function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  
  // Convert country code to flag emoji using Unicode regional indicator symbols
  // Each letter A-Z maps to Unicode code points U+1F1E6 to U+1F1FF
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}

/**
 * Get multiple country flags from an array of country codes
 * @param {string[]} countryCodes - Array of ISO 3166-1 alpha-2 country codes
 * @param {number} maxFlags - Maximum number of flags to show (default: 10)
 * @returns {string} Space-separated flag emojis
 */
export function getCountryFlags(countryCodes, maxFlags = 10) {
  if (!countryCodes || !Array.isArray(countryCodes)) return '';
  
  // Smart prioritization for major languages
  const priorityCountries = {
    'en': ['US', 'GB', 'CA', 'AU', 'IN', 'ZA', 'IE', 'NZ', 'SG', 'PH'], // English-speaking priority
    'es': ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU'], // Spanish-speaking priority
    'fr': ['FR', 'CA', 'BE', 'CH', 'CD', 'CI', 'CM', 'MG', 'SN', 'MA'], // French-speaking priority
    'pt': ['PT', 'BR', 'AO', 'MZ', 'GW', 'CV', 'ST', 'TL', 'MO', 'GQ'], // Portuguese-speaking priority
    'ar': ['SA', 'EG', 'AE', 'JO', 'LB', 'SY', 'IQ', 'KW', 'QA', 'BH'], // Arabic-speaking priority
    'zh': ['CN', 'TW', 'HK', 'SG', 'MY', 'MO', 'US', 'CA', 'AU', 'TH'], // Chinese-speaking priority
    'hi': ['IN', 'NP', 'FJ', 'US', 'CA', 'GB', 'AU', 'ZA', 'MU', 'SR'], // Hindi-speaking priority
    'ru': ['RU', 'BY', 'KZ', 'KG', 'TJ', 'UZ', 'MD', 'UA', 'GE', 'AM'], // Russian-speaking priority
  };
  
  // Determine language from context (this is a bit hacky but works for our use case)
  // We'll try to infer the language from common country patterns
  let priorityList = null;
  
  // Check if this looks like English (has common English-speaking countries)
  if (countryCodes.includes('US') && countryCodes.includes('GB') && countryCodes.includes('AU')) {
    priorityList = priorityCountries.en;
  }
  // Check if this looks like Spanish (has Spain and Latin American countries)
  else if (countryCodes.includes('ES') && countryCodes.includes('MX')) {
    priorityList = priorityCountries.es;
  }
  // Check if this looks like French (has France and francophone countries)
  else if (countryCodes.includes('FR') && countryCodes.includes('CA')) {
    priorityList = priorityCountries.fr;
  }
  // Check if this looks like Portuguese (has Portugal and Brazil)
  else if (countryCodes.includes('PT') && countryCodes.includes('BR')) {
    priorityList = priorityCountries.pt;
  }
  // Check if this looks like Arabic (has Saudi Arabia and other Arab countries)
  else if (countryCodes.includes('SA') && countryCodes.includes('EG')) {
    priorityList = priorityCountries.ar;
  }
  // Check if this looks like Chinese (has China and Taiwan)
  else if (countryCodes.includes('CN') && (countryCodes.includes('TW') || countryCodes.includes('HK'))) {
    priorityList = priorityCountries.zh;
  }
  // Check if this looks like Hindi (has India)
  else if (countryCodes.includes('IN') && countryCodes.includes('NP')) {
    priorityList = priorityCountries.hi;
  }
  // Check if this looks like Russian (has Russia and former Soviet states)
  else if (countryCodes.includes('RU') && (countryCodes.includes('BY') || countryCodes.includes('KZ'))) {
    priorityList = priorityCountries.ru;
  }
  
  let sortedCodes;
  if (priorityList) {
    // Prioritize countries, then add the rest
    const prioritized = priorityList.filter(code => countryCodes.includes(code));
    const remaining = countryCodes.filter(code => !priorityList.includes(code));
    sortedCodes = [...prioritized, ...remaining];
  } else {
    // No prioritization, use original order
    sortedCodes = countryCodes;
  }
  
  const flags = sortedCodes
    .slice(0, maxFlags)
    .map(code => getCountryFlag(code))
    .filter(flag => flag); // Remove empty flags
  
  const result = flags.join(' ');
  
  // Add ellipsis if there are more countries than shown
  if (countryCodes.length > maxFlags) {
    return result + ' …';
  }
  
  return result;
}

/**
 * Get language tags (Gateway, RTL, etc.) for display
 * @param {Object} language - Language object with metadata
 * @returns {Array} Array of tag objects with text and style
 */
export function getLanguageTags(language) {
  const tags = [];
  
  // Gateway language tag
  if (language.isGateway) {
    tags.push({
      text: 'Gateway',
      emoji: '🌐',
      className: 'gateway-tag',
      title: 'Gateway language - widely used for translation'
    });
  }
  
  // RTL (Right-to-Left) tag
  if (language.direction === 'rtl') {
    tags.push({
      text: 'RTL',
      emoji: '⬅️',
      className: 'rtl-tag',
      title: 'Right-to-left writing system'
    });
  }
  
  // Regional tag if we have country information
  if (language.region && language.region !== 'Unknown') {
    tags.push({
      text: language.region,
      emoji: '🌍',
      className: 'region-tag',
      title: `Primary region: ${language.region}`
    });
  }
  
  return tags;
}

/**
 * Get enhanced language display name with flags and metadata
 * @param {Object} language - Language object with metadata
 * @returns {Object} Enhanced display information
 */
export function getEnhancedLanguageDisplay(language) {
  const flags = getCountryFlags(language.countryCodes, 10);
  const tags = getLanguageTags(language);
  const primaryFlag = language.homeCountry ? getCountryFlag(language.homeCountry) : '';
  
  return {
    primaryName: language.name,
    nativeName: language.name !== language.anglicizedName ? language.anglicizedName : null,
    code: language.code.toUpperCase(),
    primaryFlag,
    countryFlags: flags,
    tags,
    direction: language.direction,
    hasRichMetadata: !!(flags || tags.length || primaryFlag)
  };
}
