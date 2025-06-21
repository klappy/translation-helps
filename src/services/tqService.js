/**
 * tqService.js
 * Service module for loading Translation Questions (tQ) data.
 */

import { fetchResourceFile } from "./dcsClient";
import { parseTsv } from "../utils/parseTsv";

const RESOURCE_ID = "tq";

/**
 * Retrieves tQ entries for a given verse reference.
 * Includes book introduction, chapter introduction, and verse-specific questions.
 * Handles both Reference format ("gen/1/1") and Chapter/Verse format.
 * @param {string} bookId
 * @param {string|number} chapter
 * @param {string|number} verse
 * @param {string} [organization="unfoldingWord"] Organization name
 * @param {string} [languageId="en"] Language code
 * @param {string} [customFilePath] - Optional custom file path from manifest
 * @returns {Promise<Array<Object>>}
 */
export async function getQuestionsForVerse(
  bookId,
  chapter,
  verse,
  organization = "unfoldingWord",
  languageId = "en",
  customFilePath = null
) {
  try {
    console.log(`Loading tQ for ${organization}/${languageId}_tq ${bookId} ${chapter}:${verse}`);

    // Use custom file path if provided, otherwise use tq_ prefix with uppercase book ID
    const fileName = customFilePath || `tq_${bookId.toUpperCase()}.tsv`;
    const text = await fetchResourceFile(languageId, RESOURCE_ID, fileName, organization);

    if (!text || text.trim() === "") {
      console.warn(`Empty tQ file content for ${fileName}`);
      return [];
    }

    const entries = parseTsv(text);
    console.log(`Parsed ${entries.length} tQ entries from ${fileName}`);

    // Debug: Log first few entries to understand data structure
    if (entries.length > 0) {
      console.log("Sample tQ entries:", JSON.stringify(entries.slice(0, 3), null, 2));
      console.log("Available fields:", JSON.stringify(Object.keys(entries[0] || {})));
      console.log("Looking for reference:", `${bookId}/${chapter}/${verse}`);
    }

    if (entries.length === 0) {
      return [];
    }

    // Collect verse-specific questions
    let verseQuestions = [];

    // Approach 1: Reference field format "bookId/chapter/verse" (e.g., "gen/1/1")
    const fullRef = `${bookId}/${chapter}/${verse}`;
    verseQuestions = entries.filter((entry) => entry.Reference === fullRef);

    // Approach 2: Reference field format "chapter:verse" (e.g., "1:1")
    if (verseQuestions.length === 0) {
      const shortRef = `${chapter}:${verse}`;
      verseQuestions = entries.filter((entry) => entry.Reference === shortRef);
      console.log(`Trying short reference format: ${shortRef}`);
    }

    // Approach 3: Separate Chapter/Verse fields
    if (verseQuestions.length === 0) {
      verseQuestions = entries.filter((entry) => {
        const entryChapter = String(entry.Chapter).trim();
        const entryVerse = String(entry.Verse).trim();
        const targetChapter = String(chapter).trim();
        const targetVerse = String(verse).trim();
        return entryChapter === targetChapter && entryVerse === targetVerse;
      });
      console.log(`Trying Chapter/Verse fields: ${chapter}/${verse}`);
    }

    // Collect book and chapter introduction questions
    const bookIntroQuestions = [];
    const chapterIntroQuestions = [];

    // Look for introduction questions following the same pattern as translation notes
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

    // Combine all questions: book intro, chapter intro, then verse-specific
    const allQuestions = [...bookIntroQuestions, ...chapterIntroQuestions, ...verseQuestions];

    console.log(`Found ${allQuestions.length} tQ entries for ${bookId} ${chapter}:${verse} (including ${bookIntroQuestions.length} book intros and ${chapterIntroQuestions.length} chapter intros)`);

    // Normalize the output format
    return allQuestions
      .map((entry, index) => ({
        id: index,
        question: entry.Question || "",
        answer: entry.Response || entry.Answer || "",
        reference: entry.Reference || "",
        // Keep original fields for debugging
        _original: entry,
      }))
      .filter((q) => q.question);
  } catch (error) {
    console.error(
      `Error loading tQ for ${organization}/${languageId}_tq ${bookId} ${chapter}:${verse}:`,
      error
    );
    throw new Error(`Failed to load translation questions: ${error.message}`);
  }
}

/**
 * Enhanced version that uses resource data with ingredients for correct file paths
 * @param {string} bookId Bible book identifier (e.g., 'gen')
 * @param {string|number} chapter Chapter number  
 * @param {string|number} verse Verse number
 * @param {Object} resourceData Resource data object with ingredients array
 * @param {string} [languageId="en"] Language code
 * @returns {Promise<Array<Object>>} Array of parsed tQ entries
 */
export async function getQuestionsForVerseWithResourceData(
  bookId,
  chapter,
  verse,
  resourceData,
  languageId = "en"
) {
  try {
    if (!resourceData) {
      throw new Error(`No resource data provided for Translation Questions`);
    }

    console.log(`🔄 TQ Service: Loading with resource data for ${bookId} ${chapter}:${verse}`);

    let filePath;
    
    // Try to get file path from ingredients array
    if (resourceData.ingredients && Array.isArray(resourceData.ingredients)) {
      const ingredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
      if (ingredient && ingredient.path) {
        filePath = ingredient.path;
        console.log(`✅ TQ Service: Found file path in ingredients: ${filePath}`);
      } else {
        console.warn(`TQ Service: Book ${bookId} not found in ingredients, falling back to naming convention`);
        filePath = `tq_${bookId.toUpperCase()}.tsv`;
      }
    } else {
      console.warn(`TQ Service: No ingredients array, using naming convention`);
      filePath = `tq_${bookId.toUpperCase()}.tsv`;
    }

    // Extract organization from resource data
    const organization = resourceData.owner?.login || resourceData.organization || "unfoldingWord";

    // Fetch and parse the TSV content using the correct file path
    const text = await fetchResourceFile(languageId, RESOURCE_ID, filePath, organization);

    if (!text || text.trim() === "") {
      console.warn(`Empty tQ file content for ${filePath}`);
      return [];
    }

    const entries = parseTsv(text);
    console.log(`✅ TQ Service: Loaded ${entries.length} questions using ${filePath}`);

    if (entries.length === 0) {
      return [];
    }

    // Collect verse-specific questions
    let verseQuestions = [];

    // Approach 1: Reference field format "bookId/chapter/verse" (e.g., "gen/1/1")
    const fullRef = `${bookId}/${chapter}/${verse}`;
    verseQuestions = entries.filter((entry) => entry.Reference === fullRef);

    // Approach 2: Reference field format "chapter:verse" (e.g., "1:1")
    if (verseQuestions.length === 0) {
      const shortRef = `${chapter}:${verse}`;
      verseQuestions = entries.filter((entry) => entry.Reference === shortRef);
    }

    // Approach 3: Separate Chapter/Verse fields
    if (verseQuestions.length === 0) {
      verseQuestions = entries.filter((entry) => {
        const entryChapter = String(entry.Chapter).trim();
        const entryVerse = String(entry.Verse).trim();
        const targetChapter = String(chapter).trim();
        const targetVerse = String(verse).trim();
        return entryChapter === targetChapter && entryVerse === targetVerse;
      });
    }

    // Collect book and chapter introduction questions
    const bookIntroQuestions = [];
    const chapterIntroQuestions = [];

    // Look for introduction questions following the same pattern as translation notes
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

    // Combine all questions: book intro, chapter intro, then verse-specific
    const allQuestions = [...bookIntroQuestions, ...chapterIntroQuestions, ...verseQuestions];

    console.log(`✅ TQ Service: Found ${allQuestions.length} questions for ${bookId} ${chapter}:${verse}`);

    // Normalize the output format
    return allQuestions
      .map((entry, index) => ({
        id: index,
        question: entry.Question || "",
        answer: entry.Response || entry.Answer || "",
        reference: entry.Reference || "",
        // Keep original fields for debugging
        _original: entry,
      }))
      .filter((q) => q.question);
  } catch (error) {
    console.error(
      `Error loading tQ with resource data for ${bookId} ${chapter}:${verse}:`,
      error
    );
    throw new Error(`Failed to load translation questions: ${error.message}`);
  }
}

export default { getQuestionsForVerse, getQuestionsForVerseWithResourceData };
