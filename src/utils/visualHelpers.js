export function getBookEmoji(bookId) { const icons = { gen: "🌅", exo: "🏔️", lev: "🕊️", num: "🔢", deu: "📜", jos: "⚔️", jdg: "⚖️", rut: "🌾", "1sa": "👑", "2sa": "👑", "1ki": "🏰", "2ki": "🏰", "1ch": "📊", "2ch": "📊", ezr: "🔨", neh: "🧱", est: "👸", job: "💭", psa: "🎵", pro: "💡", ecc: "🤔", sng: "💕", isa: "📢", jer: "😢", lam: "😭", ezk: "👁️", dan: "🦁", hos: "💔", jol: "🦗", amo: "⚖️", oba: "⚡", jon: "🐋", mic: "🎤", nam: "⚡", hab: "🤲", zep: "🔥", hag: "🏗️", zec: "🔮", mal: "💌", mat: "👤", mrk: "🦁", luk: "🐂", jhn: "��", act: "🔥", rom: "🏛️", "1co": "⛪", "2co": "⛪", gal: "⛓️", eph: "🏰", php: "😊", col: "👑", "1th": "⏰", "2th": "⏰", "1ti": "👨‍🏫", "2ti": "👨‍🏫", tit: "🏝️", phm: "🤝", heb: "⛪", jas: "⚖️", "1pe": "🗿", "2pe": "🗿", "1jn": "❤️", "2jn": "💝", "3jn": "💝", jud: "⚠️", rev: "🌟" }; return icons[bookId] || "📖"; }
export function getResourceIcon(resourceId) { const icons = { ult: "📖", ust: "📚", utn: "📝", utq: "❓", utw: "📋", uta: "🎓", obs: "📚", bible: "📖", tn: "📝", tq: "❓", tw: "📋", twl: "🔗", ta: "🎓" }; const id = resourceId?.toLowerCase() || ""; return icons[id] || "📄"; }
export function getOrganizationAvatar(organization) { if (!organization) return { type: "text", value: "?" }; if (organization.avatar_url) return { type: "image", value: organization.avatar_url, alt: organization.full_name || organization.login || "Organization" }; const name = organization.full_name || organization.login || organization.name || "Org"; const initials = name.split(" ").map(word => word.charAt(0).toUpperCase()).slice(0, 2).join(""); return { type: "text", value: initials || name.charAt(0).toUpperCase() }; }

export function getLanguageFlag(languageCode) {
  const flags = {
    // Major languages with country flags
    'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'pt': '🇵🇹', 'zh': '🇨🇳', 'ar': '🇸🇦', 'hi': '🇮🇳', 'ru': '🇷🇺', 'ja': '🇯🇵', 'ko': '🇰🇷', 'nl': '🇳🇱', 'pl': '🇵🇱', 'tr': '🇹🇷', 'vi': '🇻🇳', 'th': '🇹🇭', 'id': '🇮🇩', 'ms': '🇲🇾', 'sw': '🇰🇪', 'it': '🇮🇹', 'he': '🇮🇱', 'el': '🇬🇷',
    // Regional/Cultural languages
    'ur': '🇵🇰', 'bn': '🇧🇩', 'ta': '🇱🇰', 'te': '🇮🇳', 'ml': '🇮🇳', 'kn': '🇮🇳', 'gu': '🇮🇳', 'pa': '🇮🇳', 'or': '🇮🇳', 'as': '🇮🇳', 'mr': '🇮🇳', 'ne': '🇳🇵', 'si': '🇱🇰', 'my': '🇲🇲', 'km': '🇰🇭', 'lo': '🇱🇦', 'ka': '🇬🇪', 'am': '🇪🇹', 'ti': '🇪🇹', 'om': '🇪🇹', 'so': '🇸🇴', 'rw': '🇷🇼', 'rn': '🇧🇮', 'lg': '🇺🇬', 'zu': '🇿🇦', 'xh': '🇿🇦', 'af': '🇿🇦', 'st': '🇿🇦', 'tn': '🇧🇼', 've': '🇿🇦', 'ts': '🇿🇦', 'ss': '🇿🇦', 'nr': '🇿🇦', 'nso': '🇿🇦'
  };
  
  return flags[languageCode] || '🌐'; // Default to globe icon for unknown languages
}
