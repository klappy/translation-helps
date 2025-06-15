/**
 * ResourcesContext.jsx
 * Unified context for managing all translation resources with anti-hallucination measures
 * Serves as single source of truth for scripture, translation notes, questions, words, and TWL
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useReferenceContext } from "./ReferenceContext";

// Import existing services
import { fetchBook } from "../services/scriptureService";
import { getNotesForVerse } from "../services/tnService";
import { getQuestionsForVerse } from "../services/tqService";
import { getArticlesForLinks } from "../services/twService";
import { getLinksForVerse } from "../services/twlService";
import { fetchManifest } from "../services/dcsClient";
import {
  USFMSemanticParser,
  parseUSFMToHTML,
} from "../components/ScripturePanelRCL/USFMSemanticParser.js";

const ResourcesContext = createContext();

export const useResourcesContext = () => {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error("useResourcesContext must be used within a ResourcesProvider");
  }
  return context;
};

export function ResourcesProvider({ children }) {
  const { reference, organization, languageId, resourceId } = useReferenceContext();
  const [resources, setResources] = useState({
    scripture: null,
    translationNotes: [],
    translationQuestions: [],
    translationWords: [],
    translationWordLinks: [],
  });
  const [metadata, setMetadata] = useState(null);
  const [manifests, setManifests] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract current reference values
  const { bookId, chapter, verse } = reference || {};

  // Use resourceId from ReferenceContext
  const scriptureResourceId = resourceId;

  // Load manifests for all resource types
  const loadManifests = useCallback(async () => {
    try {
      const manifestPromises = [
        fetchManifest(languageId, scriptureResourceId, organization).catch(() => null),
        fetchManifest(languageId, "tn", organization).catch(() => null),
        fetchManifest(languageId, "tq", organization).catch(() => null),
        fetchManifest(languageId, "tw", organization).catch(() => null),
        fetchManifest(languageId, "twl", organization).catch(() => null),
      ];

      const [scriptureManifest, tnManifest, tqManifest, twManifest, twlManifest] =
        await Promise.all(manifestPromises);

      const manifestsObj = {
        [scriptureResourceId]: scriptureManifest,
        tn: tnManifest,
        tq: tqManifest,
        tw: twManifest,
        twl: twlManifest,
      };

      setManifests(manifestsObj);
      return manifestsObj;
    } catch (err) {
      console.error("Error loading manifests:", err);
      return {};
    }
  }, [languageId, organization, scriptureResourceId]);

  // Load all resources for the current reference
  const loadResources = useCallback(async () => {
    if (!bookId || !chapter || !verse) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load manifests first
      const currentManifests = await loadManifests();

      // First, load resources that don't depend on other resources
      const initialPromises = [
        // Scripture (USFM)
        currentManifests[scriptureResourceId]
          ? fetchBook({
              languageId,
              resourceId: scriptureResourceId,
              bookId,
              manifest: currentManifests[scriptureResourceId],
              organization,
            })
          : Promise.resolve(null),

        // Translation Notes
        getNotesForVerse(bookId, chapter, verse, organization, languageId).catch(() => []),

        // Translation Questions (with custom file path from manifest)
        currentManifests.tq
          ? (async () => {
              // Extract custom file path from manifest (same logic as TranslationQuestionsPanel)
              let customFilePath = null;
              const tqManifest = currentManifests.tq;

              if (tqManifest) {
                const project = tqManifest.projects?.find((p) => p.identifier === bookId);
                if (project && project.path) {
                  customFilePath = project.path.replace("./", "");
                }
              }

              return getQuestionsForVerse(
                bookId,
                chapter,
                verse,
                organization,
                languageId,
                customFilePath
              );
            })().catch(() => [])
          : Promise.resolve([]),

        // Translation Word Links (get rc:// URIs)
        currentManifests.twl
          ? getLinksForVerse(
              bookId,
              chapter,
              verse,
              currentManifests.twl,
              organization,
              languageId
            ).catch(() => [])
          : Promise.resolve([]),
      ];

      const [usfmData, tnData, tqData, twlLinks] = await Promise.all(initialPromises);

      // Then fetch Translation Words articles based on TWL links
      const twArticles =
        twlLinks.length > 0
          ? await getArticlesForLinks(twlLinks, languageId, organization).catch(() => [])
          : [];

      // Extract raw USFM for the current chapter using regex (no parser needed for LLM context)
      let chapterUsfm = null;
      if (usfmData) {
        // Only log the first 200 chars once for diagnostics, not every render
        if (process.env.NODE_ENV === "development") {
          console.log("[ResourcesContext] usfmData (first 200 chars):", usfmData.substring(0, 200));
        }
        const chapterKey = String(chapter);
        // Global regex to find all chapters and their content
        const chapterRegex = /\\c\s+(\d+)([\s\S]*?)(?=(\r?\n)\\c\s+\d+|$)/g;
        let match;
        while ((match = chapterRegex.exec(usfmData)) !== null) {
          if (match[1] === chapterKey) {
            chapterUsfm = (`\\c ${chapterKey}` + match[2]).trim();
            break;
          }
        }
      }
      // (Parser/verse logic for rendering and notes can remain as before)
      let versesByChapter = {};
      if (usfmData) {
        try {
          const parser = new USFMSemanticParser();
          parser.parse(usfmData);
          const chapterKey = String(chapter);
          if (parser.chapters && parser.chapters[chapterKey]) {
            versesByChapter = parser.chapters[chapterKey];
          }
        } catch (err) {
          console.error("Error parsing USFM for verses:", err);
        }
      }

      // Update resources state
      setResources({
        scripture: usfmData
          ? {
              resourceId: scriptureResourceId,
              title: currentManifests[scriptureResourceId]?.dublin_core?.title,
              languageId,
              usfm: usfmData,
              verses: versesByChapter,
              chapterUsfm: chapterUsfm, // Raw USFM for the current chapter (for LLM context)
            }
          : null,
        translationNotes: tnData.map((note, index) => ({
          ...note,
          resourceId: "tn",
          title: currentManifests.tn?.dublin_core?.title || "unfoldingWord® Translation Notes",
          id: index + 1,
        })),
        translationQuestions: tqData.map((question, index) => ({
          ...question,
          resourceId: "tq",
          title: currentManifests.tq?.dublin_core?.title || "unfoldingWord® Translation Questions",
          id: index + 1,
        })),
        translationWords: twArticles.map((article, index) => ({
          ...article,
          resourceId: "tw",
          title: currentManifests.tw?.dublin_core?.title || "unfoldingWord® Translation Words",
          id: index + 1,
          term: article.title,
          content: article.content,
          rcLink: article.rcUri,
        })),
        translationWordLinks: twlLinks.map((link, index) => ({
          rcLink: link,
          resourceId: "twl",
          title: currentManifests.twl?.dublin_core?.title || "Translation Word Links",
          id: index + 1,
        })),
      });

      // Update metadata
      setMetadata({
        organization,
        languageId,
        bookId,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        manifestInfo: currentManifests,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error loading resources:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [bookId, chapter, verse, organization, languageId, scriptureResourceId, loadManifests]);

  // Load resources when reference changes
  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Format context for LLM chat (replaces packageContext from llmChatService)
  const getFormattedContext = useCallback(() => {
    if (!metadata) return null;

    // Debug: log current reference and first 100 chars of chapter USFM, throttled to prevent spam
    if (resources.scripture?.chapterUsfm) {
      const logKey = `${metadata.bookId}-${metadata.chapter}-${metadata.verse}`;
      if (!window._logCache) window._logCache = {};
      if (!window._logCache[logKey] || Date.now() - window._logCache[logKey] > 1000) {
        console.log(
          "[ResourcesContext] getFormattedContext: reference",
          metadata.bookId,
          metadata.chapter,
          metadata.verse,
          "| chapterUsfm:",
          resources.scripture.chapterUsfm.substring(0, 100)
        );
        window._logCache[logKey] = Date.now();
      }
    }

    // Debug: log scriptureText and alignmentData for the current verse, throttled to prevent spam
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const logKey = `verse-${metadata.verse}`;
        if (!window._logCacheVerse) window._logCacheVerse = {};
        if (!window._logCacheVerse[logKey] || Date.now() - window._logCacheVerse[logKey] > 1000) {
          console.log(
            "[ResourcesContext] scriptureText for verse",
            metadata.verse,
            ":",
            scriptureText
          );
          console.log(
            "[ResourcesContext] alignmentData for verse",
            metadata.verse,
            ":",
            alignmentDataFormatted
          );
          window._logCacheVerse[logKey] = Date.now();
        }
      }, 0);
    }

    // Function to extract plain text for a specific verse using the robust semantic rendering system
    const preprocessUSFMToPlainText = (usfmText, chapter, verse) => {
      if (!usfmText) return "";

      try {
        // Use the existing semantic parser in preview mode (same as UI)
        const html = parseUSFMToHTML(usfmText, "preview");

        // Create temporary DOM element to parse the HTML
        if (typeof window !== "undefined" && typeof document !== "undefined") {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;

          // Find the specific verse element
          const verseNum = String(verse);
          let verseElement = null;

          // Look for verse elements with matching number
          const vElements = tempDiv.querySelectorAll("v");
          for (const vEl of vElements) {
            const numberEl = vEl.querySelector("number");
            if (numberEl) {
              const numberText = numberEl.textContent.trim();
              // Handle exact match or verse bridge (e.g., "4-5" includes verse 4)
              if (numberText === verseNum) {
                verseElement = vEl;
                break;
              } else if (numberText.includes("-")) {
                const [start, end] = numberText.split("-").map((n) => parseInt(n.trim()));
                const targetVerse = parseInt(verse);
                if (targetVerse >= start && targetVerse <= end) {
                  verseElement = vEl;
                  break;
                }
              }
            }
          }

          if (verseElement) {
            // Extract clean text content (this automatically handles all USFM markup)
            return verseElement.textContent.trim();
          }
        }

        // Fallback: if DOM parsing isn't available, return empty string
        return "";
      } catch (err) {
        console.error("Error extracting verse text using semantic parser:", err);
        return "";
      }
    };

    // Extract scriptureText and alignmentData for the current verse
    let scriptureText = "";
    let alignmentDataFormatted = [];
    if (resources.scripture?.chapterUsfm && metadata) {
      try {
        scriptureText = preprocessUSFMToPlainText(
          resources.scripture.chapterUsfm,
          metadata.chapter,
          metadata.verse
        );
        scriptureText = `${metadata.bookId} ${metadata.chapter}:${metadata.verse}: ${scriptureText}`;

        // Parse chapter USFM to semantic HTML for alignment data
        const html = parseUSFMToHTML(resources.scripture.chapterUsfm, "preview");
        if (typeof window !== "undefined" && typeof document !== "undefined") {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;
          const verseNum = String(metadata.verse);
          let verseElem = null;
          const vElems = tempDiv.querySelectorAll("v");
          for (const v of vElems) {
            const numberElem = v.querySelector("number");
            if (numberElem && numberElem.textContent.trim() === verseNum) {
              verseElem = v;
              break;
            }
          }
          if (verseElem) {
            // Format alignment data in a simplified, readable way
            alignmentDataFormatted = Array.from(verseElem.querySelectorAll("word, zaln")).map(
              (el) => {
                const attrs = el.getAttributeNames().reduce((acc, name) => {
                  acc[name] = el.getAttribute(name);
                  return acc;
                }, {});
                let formattedAttrs = "";
                if (attrs["x-strong"]) formattedAttrs += `Strong's: ${attrs["x-strong"]}, `;
                if (attrs["x-lemma"]) formattedAttrs += `Lemma: ${attrs["x-lemma"]}, `;
                if (attrs["x-occurrence"])
                  formattedAttrs += `Occurrence: ${attrs["x-occurrence"]}/${attrs["x-occurrences"]}, `;
                if (attrs["x-content"]) formattedAttrs += `Content: ${attrs["x-content"]}, `;
                formattedAttrs = formattedAttrs.trim().replace(/,$/, "");
                return `Word: "${el.textContent}"${formattedAttrs ? ` (${formattedAttrs})` : ""}`;
              }
            );
          }
        }
      } catch (err) {
        console.error("Error preprocessing USFM for LLM context:", err);
        scriptureText = `Error preprocessing Scripture text for ${metadata.bookId} ${metadata.chapter}:${metadata.verse}`;
      }
    }

    return {
      reference: {
        book: metadata.bookId,
        chapter: metadata.chapter,
        verse: metadata.verse,
        organization: metadata.organization,
        language: metadata.languageId,
        citation: `${metadata.bookId} ${metadata.chapter}:${metadata.verse}`,
      },
      resources: {
        scriptureText,
        alignmentData: alignmentDataFormatted,
        scripture: scriptureText, // Set scripture to the preprocessed plain text
        translationNotes: resources.translationNotes,
        translationQuestions: resources.translationQuestions,
        translationWords: resources.translationWords,
        translationWordLinks: resources.translationWordLinks,
      },
      metadata: {
        timestamp: metadata.timestamp,
        contextSize: 0, // Will be calculated when stringified
        manifestTitles: {
          scripture: resources.scripture?.title,
          translationNotes: resources.translationNotes[0]?.title,
          translationQuestions: resources.translationQuestions[0]?.title,
          translationWords: resources.translationWords[0]?.title,
          translationWordLinks: resources.translationWordLinks[0]?.title,
        },
        resourceLoadingStatus: {
          scripture: !isLoading && !!resources.scripture,
          translationNotes: !isLoading && resources.translationNotes.length > 0,
          translationQuestions: !isLoading && resources.translationQuestions.length > 0,
          translationWords: !isLoading && resources.translationWords.length > 0,
          translationWordLinks: !isLoading && resources.translationWordLinks.length > 0,
        },
      },
    };
  }, [resources, metadata, isLoading, verse]);

  const value = {
    resources,
    metadata,
    manifests,
    isLoading,
    error,
    getFormattedContext,
    // Expose loading states with more detailed information
    loadingStates: {
      manifests: Object.keys(manifests).length === 0 && isLoading,
      scripture: !resources.scripture && isLoading,
      translationNotes: resources.translationNotes.length === 0 && isLoading,
      translationQuestions: resources.translationQuestions.length === 0 && isLoading,
      translationWords: resources.translationWords.length === 0 && isLoading,
      translationWordLinks: resources.translationWordLinks.length === 0 && isLoading,
    },
    // Add diagnostic information for debugging
    diagnostics: {
      manifestsAvailable: {
        [reference?.resourceId]: !!manifests[reference?.resourceId],
        tn: !!manifests.tn,
        tq: !!manifests.tq,
        tw: !!manifests.tw,
        twl: !!manifests.twl,
      },
      resourceCounts: {
        scripture: resources.scripture ? 1 : 0,
        translationNotes: resources.translationNotes.length,
        translationQuestions: resources.translationQuestions.length,
        translationWords: resources.translationWords.length,
        translationWordLinks: resources.translationWordLinks.length,
      },
      currentReference: metadata
        ? `${metadata.bookId} ${metadata.chapter}:${metadata.verse}`
        : null,
      currentResourceId: reference?.resourceId,
    },
  };

  return <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>;
}

export { ResourcesContext };
