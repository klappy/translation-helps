/**
 * ResourcesContext.jsx
 * Unified context for managing all translation resources with anti-hallucination measures
 * Serves as single source of truth for scripture, translation notes, questions, words, and TWL
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useReferenceContext } from "./ReferenceContext";
import { useProskomma, useImport, usePassage } from "proskomma-react-hooks";

// Import existing services
import { fetchBook } from "../services/scriptureService";
import { getNotesForVerse } from "../services/tnService";
import { getQuestionsForVerse } from "../services/tqService";
import { getArticlesForLinks } from "../services/twService";
import { getLinksForVerse } from "../services/twlService";
import { fetchManifest } from "../services/dcsClient";

const ResourcesContext = createContext();

export const useResourcesContext = () => {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error("useResourcesContext must be used within a ResourcesProvider");
  }
  return context;
};

/**
 * Custom hook for parsing USFM to verses using Proskomma
 * Reuses the same logic as USFMRenderer for consistency
 */
function useUSFMParser(usfm, org, lang, abbr, chapter) {
  const proskommaHook = useProskomma({ verbose: false });

  // Create document configuration for import
  const document = useMemo(() => {
    if (!usfm || !org || !lang || !abbr) return null;
    return [
      {
        selectors: { org, lang, abbr },
        data: usfm,
        bookCode: abbr,
      },
    ];
  }, [usfm, org, lang, abbr]);

  // Import document
  const importHook = useImport({
    ...proskommaHook,
    documents: document || [],
    verbose: false,
  });

  // Parse verses for the specific chapter using usePassage
  const passageHook = usePassage({
    ...proskommaHook,
    reference: `${abbr?.toUpperCase()} ${chapter}`,
    verbose: false,
  });

  // Extract verses from passage data
  const verses = useMemo(() => {
    if (!passageHook.passages || passageHook.passages.length === 0) return {};

    const passage = passageHook.passages[0];
    if (!passage.text) return {};

    // Simple verse extraction - this could be enhanced
    const verseMap = {};
    const lines = passage.text.split("\n");

    lines.forEach((line) => {
      const verseMatch = line.match(/^(\d+)\s+(.+)/);
      if (verseMatch) {
        const [, verseNum, text] = verseMatch;
        verseMap[parseInt(verseNum)] = text.trim();
      }
    });

    return verseMap;
  }, [passageHook.passages]);

  return {
    verses,
    loading: importHook.importing || !importHook.done || !passageHook.passages,
    error: importHook.errors?.length > 0 ? importHook.errors[0] : null,
    ready: importHook.done && !importHook.importing && passageHook.passages?.length > 0,
  };
}

export function ResourcesProvider({ children }) {
  const { reference } = useReferenceContext();
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
  const {
    bookId,
    chapter,
    verse,
    organization = "unfoldingWord",
    languageId = "en",
  } = reference || {};

  // Load manifests for all resource types
  const loadManifests = useCallback(async () => {
    try {
      const manifestPromises = [
        fetchManifest(languageId, "ult", organization).catch(() => null),
        fetchManifest(languageId, "tn", organization).catch(() => null),
        fetchManifest(languageId, "tq", organization).catch(() => null),
        fetchManifest(languageId, "tw", organization).catch(() => null),
        fetchManifest(languageId, "twl", organization).catch(() => null),
      ];

      const [ultManifest, tnManifest, tqManifest, twManifest, twlManifest] = await Promise.all(
        manifestPromises
      );

      setManifests({
        ult: ultManifest,
        tn: tnManifest,
        tq: tqManifest,
        tw: twManifest,
        twl: twlManifest,
      });

      return {
        ult: ultManifest,
        tn: tnManifest,
        tq: tqManifest,
        tw: twManifest,
        twl: twlManifest,
      };
    } catch (err) {
      console.error("Error loading manifests:", err);
      return {};
    }
  }, [languageId, organization]);

  // Parse USFM to get verse text
  const {
    verses: scriptureVerses,
    loading: usfmLoading,
    ready: usfmReady,
  } = useUSFMParser(resources.scripture?.usfm, organization, languageId, bookId, chapter);

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
        currentManifests.ult
          ? fetchBook({
              languageId,
              resourceId: "ult",
              bookId,
              manifest: currentManifests.ult,
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

      // Update resources state
      setResources({
        scripture: usfmData
          ? {
              resourceId: "ult",
              title: currentManifests.ult?.dublin_core?.title || "unfoldingWord® Literal Text",
              languageId,
              usfm: usfmData,
              verses: {}, // Will be populated by useUSFMParser
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
  }, [bookId, chapter, verse, organization, languageId, loadManifests]);

  // Update scripture verses when USFM is parsed
  useEffect(() => {
    if (usfmReady && scriptureVerses && resources.scripture) {
      setResources((prev) => ({
        ...prev,
        scripture: {
          ...prev.scripture,
          verses: scriptureVerses,
        },
      }));
    }
  }, [usfmReady, scriptureVerses, resources.scripture?.usfm]);

  // Load resources when reference changes
  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Format context for LLM chat (replaces packageContext from llmChatService)
  const getFormattedContext = useCallback(() => {
    if (!metadata) return null;

    // Get the verse text for the specific verse requested
    const getVerseText = () => {
      if (!resources.scripture) return null;

      if (resources.scripture.verses && Object.keys(resources.scripture.verses).length > 0) {
        // Return the specific verse if available
        const verseText = resources.scripture.verses[verse];
        if (verseText) {
          return `[${verse}] ${verseText}`;
        }

        // If specific verse not found, return all verses in the chapter
        return Object.entries(resources.scripture.verses)
          .map(([v, text]) => `[${v}] ${text}`)
          .join("\n");
      }

      // Fallback to raw USFM if verses not parsed yet
      if (resources.scripture.usfm) {
        return `Raw USFM Data: ${resources.scripture.usfm.substring(0, 500)}... (truncated)`;
      }

      return null;
    };

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
        scripture: getVerseText(),
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
          scripture: !isLoading && !!resources.scripture && !usfmLoading,
          translationNotes: !isLoading && resources.translationNotes.length > 0,
          translationQuestions: !isLoading && resources.translationQuestions.length > 0,
          translationWords: !isLoading && resources.translationWords.length > 0,
          translationWordLinks: !isLoading && resources.translationWordLinks.length > 0,
        },
      },
    };
  }, [resources, metadata, usfmLoading, error, isLoading, manifests, verse]);

  const value = useMemo(
    () => ({
      resources,
      metadata,
      manifests,
      isLoading: isLoading || usfmLoading,
      error,
      getFormattedContext,
      // Expose loading states with more detailed information
      loadingStates: {
        manifests: Object.keys(manifests).length === 0 && isLoading,
        scripture: (!resources.scripture || usfmLoading) && isLoading,
        translationNotes: resources.translationNotes.length === 0 && isLoading,
        translationQuestions: resources.translationQuestions.length === 0 && isLoading,
        translationWords: resources.translationWords.length === 0 && isLoading,
        translationWordLinks: resources.translationWordLinks.length === 0 && isLoading,
      },
      // Add diagnostic information for debugging
      diagnostics: {
        manifestsAvailable: {
          ult: !!manifests.ult,
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
        usfmParsingStatus: {
          loading: usfmLoading,
          ready: usfmReady,
          versesCount: scriptureVerses ? Object.keys(scriptureVerses).length : 0,
        },
      },
    }),
    [
      resources,
      metadata,
      manifests,
      isLoading,
      usfmLoading,
      error,
      getFormattedContext,
      scriptureVerses,
      usfmReady,
    ]
  );

  return <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>;
}

export { ResourcesContext };
