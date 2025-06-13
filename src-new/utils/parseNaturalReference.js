export function parseNaturalReference(input) {
  if (!input) return null;
  const regex = /^(?<book>[\d]?\w+)\s+(?<chapter>\d+)(?::(?<verse>[\d-]+))?/i;
  const match = input.trim().match(regex);
  if (!match || !match.groups) return null;
  let { book, chapter, verse } = match.groups;
  book = book.toLowerCase();

  // Normalize spaces in book name
  const normalizedBook = book.replace(/\s+/g, "");
  const { AVAILABLE_BOOKS } = require("./defaultReference.js");
  let found = AVAILABLE_BOOKS.find(
    (b) =>
      b.id === normalizedBook ||
      b.name.toLowerCase().replace(/\s+/g, "") === normalizedBook
  );
  if (!found) {
    // try ignoring numeric prefix for name match
    const bookNoNum = normalizedBook.replace(/^[1-3]/, "");
    found = AVAILABLE_BOOKS.find(
      (b) =>
        b.name.toLowerCase().replace(/\s+/g, "") === bookNoNum ||
        b.id.replace(/^[1-3]/, "") === bookNoNum
    );
  }
  const bookId = found ? found.id : normalizedBook.slice(0, 3);
  const firstVerse = verse ? verse.split("-")[0] : "1";
  return { bookId, chapter, verse: firstVerse };
}
