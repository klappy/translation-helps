/**
 * tnService.js
 * Service module for loading Translation Notes (tN) data.
 */

import { fetchResourceFile, fetchManifest } from "./dcsClient";
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
    // Get the manifest to find the correct TSV file path
    const manifest = await fetchManifest(languageId, RESOURCE_ID, organization);

    // Find the project for this book in the manifest
    const project = manifest.projects?.find((p) => p.identifier === bookId);
    if (!project) {
      throw new Error(`Book ${bookId} not found in tN manifest`);
    }

    // Get the TSV file path from the manifest
    const filePath = project.path?.replace("./", "");
    if (!filePath) {
      throw new Error(`No file path found for ${bookId} in manifest`);
    }

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
    // Get the manifest to find the correct TSV file path
    const manifest = await fetchManifest(languageId, RESOURCE_ID, organization);

    // Find the project for this book in the manifest
    const project = manifest.projects?.find((p) => p.identifier === bookId);
    if (!project) {
      throw new Error(`Book ${bookId} not found in tN manifest`);
    }

    // Get the TSV file path from the manifest
    const filePath = project.path?.replace("./", "");
    if (!filePath) {
      throw new Error(`No file path found for ${bookId} in manifest`);
    }

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

export default { getNotesForVerse, getNotesForBook };
