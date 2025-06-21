/**
 * tnService.js
 * Service module for loading Translation Notes (tN) data.
 * UPDATED: No longer uses manifests - uses standard file naming convention
 */

import { fetchResourceFile } from "./dcsClient";
import { parseTsv } from "../utils/parseTsv";

const RESOURCE_ID = "tn";

/**
 * Parses a Reference field to extract chapter and verse.
 * Handles formats like "1:1" or "gen/1/1"
 * @param {string} reference
 * @returns {{chapter: string, verse: string} | null}
 */
function parseReference(reference) {
  if (!reference) return null;

  let chapterVerse;
  if (reference.includes("/")) {
    // Format: "gen/1/1" - extract chapter:verse part
    const parts = reference.split("/");
    if (parts.length >= 3) {
      chapterVerse = `${parts[1]}:${parts[2]}`;
    }
  } else {
    // Format: "1:1" - use as is
    chapterVerse = reference;
  }

  if (!chapterVerse || !chapterVerse.includes(":")) return null;

  const [chapter, verse] = chapterVerse.split(":");
  return { chapter, verse };
}

/**
 * Retrieves tN entries for a given verse reference.
 * @param {string} bookId Bible book identifier (e.g., 'gen')
 * @param {string|number} chapter Chapter number
 * @param {string|number} verse Verse number
 * @param {string} [organization="unfoldingWord"] Organization name
 * @param {string} [languageId="en"] Language code
 * @returns {Promise<Array<Object>>} Array of parsed tN entries
 */
export async function getNotesForVerse(
  bookId,
  chapter,
  verse,
  organization = "unfoldingWord",
  languageId = "en"
) {
  try {
    // Use standard TN file naming convention: tn_{BOOK_ID}.tsv
    const filePath = `tn_${bookId.toUpperCase()}.tsv`;

    // Fetch and parse the TSV content
    const tsvContent = await fetchResourceFile(languageId, RESOURCE_ID, filePath, organization);
    const allNotes = parseTsv(tsvContent);

    // Filter notes for the specific chapter and verse along with chapter
    // introduction and book introduction notes. Chapter intro notes have a
    // reference like "1:intro" and book intro notes use "front:intro".
    const expectedRef = `${chapter}:${verse}`;
    const verseNotes = [];
    const chapterIntroNotes = [];
    const bookIntroNotes = [];

    allNotes.forEach((note) => {
      const parsed = parseReference(note.Reference);
      if (!parsed) return;
      const refString = `${parsed.chapter}:${parsed.verse}`;
      if (refString === expectedRef) {
        verseNotes.push(note);
      } else if (
        parsed.verse === "intro" &&
        parsed.chapter.toString() === chapter.toString()
      ) {
        chapterIntroNotes.push(note);
      } else if (parsed.verse === "intro" && parsed.chapter === "front") {
        bookIntroNotes.push(note);
      }
    });

    // Combine intros first then verse notes
    const combinedNotes = [...bookIntroNotes, ...chapterIntroNotes, ...verseNotes];

    // Transform to consistent format
    return combinedNotes.map((note, index) => ({
      id: index,
      text: note.Note || "",
      quote: note.Quote || "",
      occurrence: note.Occurrence || "1",
      tags: note.Tags || "",
      supportReference: note.SupportReference || "",
      reference: note.Reference || "",
    }));
  } catch (error) {
    console.error(
      `Error fetching translation notes for ${organization}/${languageId}_tn ${bookId} ${chapter}:${verse}:`,
      error
    );
    throw error;
  }
}

/**
 * Retrieves all tN entries for a given book.
 * @param {string} bookId Bible book identifier (e.g., 'gen')
 * @param {string} [organization="unfoldingWord"] Organization name
 * @param {string} [languageId="en"] Language code
 * @returns {Promise<Array<Object>>} Array of all parsed tN entries for the book
 */
export async function getNotesForBook(bookId, organization = "unfoldingWord", languageId = "en") {
  try {
    // Use standard TN file naming convention: tn_{BOOK_ID}.tsv
    const filePath = `tn_${bookId.toUpperCase()}.tsv`;

    // Fetch and parse the TSV content
    const tsvContent = await fetchResourceFile(languageId, RESOURCE_ID, filePath, organization);
    const allNotes = parseTsv(tsvContent);

    // Transform to consistent format
    return allNotes.map((note, index) => ({
      id: index,
      text: note.Note || "",
      quote: note.Quote || "",
      occurrence: note.Occurrence || "1",
      tags: note.Tags || "",
      supportReference: note.SupportReference || "",
      reference: note.Reference || "",
      ...parseReference(note.Reference), // adds chapter and verse fields
    }));
  } catch (error) {
    console.error(
      `Error fetching translation notes for ${organization}/${languageId}_tn book ${bookId}:`,
      error
    );
    throw error;
  }
}

/**
 * Enhanced version that uses resource data with ingredients for correct file paths
 * @param {string} bookId Bible book identifier (e.g., 'gen')
 * @param {string|number} chapter Chapter number
 * @param {string|number} verse Verse number
 * @param {Object} resourceData Resource data object with ingredients array
 * @param {string} [languageId="en"] Language code
 * @returns {Promise<Array<Object>>} Array of parsed tN entries
 */
export async function getNotesForVerseWithResourceData(
  bookId,
  chapter,
  verse,
  resourceData,
  languageId = "en"
) {
  try {
    if (!resourceData) {
      throw new Error(`No resource data provided for Translation Notes`);
    }

    console.log(`🔄 TN Service: Loading with resource data for ${bookId} ${chapter}:${verse}`);

    let filePath;
    
    // Try to get file path from ingredients array
    if (resourceData.ingredients && Array.isArray(resourceData.ingredients)) {
      const ingredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
      if (ingredient && ingredient.path) {
        filePath = ingredient.path;
        console.log(`✅ TN Service: Found file path in ingredients: ${filePath}`);
      } else {
        console.warn(`TN Service: Book ${bookId} not found in ingredients, falling back to naming convention`);
        filePath = `tn_${bookId.toUpperCase()}.tsv`;
      }
    } else {
      console.warn(`TN Service: No ingredients array, using naming convention`);
      filePath = `tn_${bookId.toUpperCase()}.tsv`;
    }

    // Extract organization from resource data
    const organization = resourceData.owner?.login || resourceData.organization || "unfoldingWord";

    // Fetch and parse the TSV content using the correct file path
    const tsvContent = await fetchResourceFile(languageId, RESOURCE_ID, filePath, organization);
    const allNotes = parseTsv(tsvContent);

    // Filter notes for the specific chapter and verse along with chapter
    // introduction and book introduction notes. Chapter intro notes have a
    // reference like "1:intro" and book intro notes use "front:intro".
    const expectedRef = `${chapter}:${verse}`;
    const verseNotes = [];
    const chapterIntroNotes = [];
    const bookIntroNotes = [];

    allNotes.forEach((note) => {
      const parsed = parseReference(note.Reference);
      if (!parsed) return;
      const refString = `${parsed.chapter}:${parsed.verse}`;
      if (refString === expectedRef) {
        verseNotes.push(note);
      } else if (
        parsed.verse === "intro" &&
        parsed.chapter.toString() === chapter.toString()
      ) {
        chapterIntroNotes.push(note);
      } else if (parsed.verse === "intro" && parsed.chapter === "front") {
        bookIntroNotes.push(note);
      }
    });

    // Combine intros first then verse notes
    const combinedNotes = [...bookIntroNotes, ...chapterIntroNotes, ...verseNotes];

    console.log(`✅ TN Service: Loaded ${combinedNotes.length} notes using ${filePath}`);

    // Transform to consistent format
    return combinedNotes.map((note, index) => ({
      id: index,
      text: note.Note || "",
      quote: note.Quote || "",
      occurrence: note.Occurrence || "1",
      tags: note.Tags || "",
      supportReference: note.SupportReference || "",
      reference: note.Reference || "",
    }));
  } catch (error) {
    console.error(
      `Error fetching translation notes with resource data for ${bookId} ${chapter}:${verse}:`,
      error
    );
    throw error;
  }
}

export default { getNotesForVerse, getNotesForBook, getNotesForVerseWithResourceData };
