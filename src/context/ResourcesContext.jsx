/**
 * ResourcesContext.jsx
 * Unified context for managing all translation resources with anti-hallucination measures
 * Enhanced with cross-organization resource support for advanced mode
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
  const { 
    reference, 
    organization, 
    languageId, 
    resourceId,
    advancedMode,
    mixedResources,
    getResourceOrganization,
    getResourceId
  } = useReferenceContext();
  
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

  // Track loading states for different resource types
  const [resourceLoadingStates, setResourceLoadingStates] = useState({
    scripture: false,
    tn: false,
    tq: false,
    tw: false,
    twl: false,
  });

  // Extract current reference values
  const { bookId, chapter, verse } = reference || {};

  // Get effective resource configuration based on mode
  const getResourceConfig = useCallback((resourceType) => {
    if (advancedMode && mixedResources[resourceType]) {
      return {
        organization: mixedResources[resourceType].organization,
        resourceId: mixedResources[resourceType].resourceId,
        isFromMixedResources: true
      };
    }
    
    // Fallback to basic mode configuration
    const typeToResourceIdMap = {
      scripture: resourceId,
      tn: 'tn',
      tq: 'tq',
      tw: 'tw',
      twl: 'twl'
    };
    
    return {
      organization: organization,
      resourceId: typeToResourceIdMap[resourceType] || resourceId,
      isFromMixedResources: false
    };
  }, [advancedMode, mixedResources, organization, resourceId]);

  // Load manifests for all resource types (supporting cross-organization)
  const loadManifests = useCallback(async () => {
    try {
      console.log('🔄 ResourcesContext: Loading manifests for', advancedMode ? 'advanced' : 'basic', 'mode');
      
      // Get configurations for each resource type
      const scriptureConfig = getResourceConfig('scripture');
      const tnConfig = getResourceConfig('tn');
      const tqConfig = getResourceConfig('tq');
      const twConfig = getResourceConfig('tw');
      const twlConfig = getResourceConfig('twl');

      console.log('📋 Resource configurations:', {
        scripture: scriptureConfig,
        tn: tnConfig,
        tq: tqConfig,
        tw: twConfig,
        twl: twlConfig
      });

      const manifestPromises = [
        fetchManifest(languageId, scriptureConfig.resourceId, scriptureConfig.organization).catch((err) => {
          console.warn(`Failed to load scripture manifest (${scriptureConfig.organization}/${scriptureConfig.resourceId}):`, err);
          return null;
        }),
        fetchManifest(languageId, tnConfig.resourceId, tnConfig.organization).catch((err) => {
          console.warn(`Failed to load TN manifest (${tnConfig.organization}/${tnConfig.resourceId}):`, err);
          return null;
        }),
        fetchManifest(languageId, tqConfig.resourceId, tqConfig.organization).catch((err) => {
          console.warn(`Failed to load TQ manifest (${tqConfig.organization}/${tqConfig.resourceId}):`, err);
          return null;
        }),
        fetchManifest(languageId, twConfig.resourceId, twConfig.organization).catch((err) => {
          console.warn(`Failed to load TW manifest (${twConfig.organization}/${twConfig.resourceId}):`, err);
          return null;
        }),
        fetchManifest(languageId, twlConfig.resourceId, twlConfig.organization).catch((err) => {
          console.warn(`Failed to load TWL manifest (${twlConfig.organization}/${twlConfig.resourceId}):`, err);
          return null;
        }),
      ];

      const [scriptureManifest, tnManifest, tqManifest, twManifest, twlManifest] =
        await Promise.all(manifestPromises);

      const manifestsObj = {
        // Use combined keys for cross-org tracking
        [`${scriptureConfig.organization}/${scriptureConfig.resourceId}`]: scriptureManifest,
        [`${tnConfig.organization}/${tnConfig.resourceId}`]: tnManifest,
        [`${tqConfig.organization}/${tqConfig.resourceId}`]: tqManifest,
        [`${twConfig.organization}/${twConfig.resourceId}`]: twManifest,
        [`${twlConfig.organization}/${twlConfig.resourceId}`]: twlManifest,
        
        // Keep legacy keys for backward compatibility
        [scriptureConfig.resourceId]: scriptureManifest,
        tn: tnManifest,
        tq: tqManifest,
        tw: twManifest,
        twl: twlManifest,
      };

      setManifests(manifestsObj);
      console.log('✅ ResourcesContext: Loaded manifests:', Object.keys(manifestsObj).filter(key => manifestsObj[key]));
      return manifestsObj;
    } catch (err) {
      console.error("Error loading manifests:", err);
      return {};
    }
  }, [languageId, getResourceConfig, advancedMode]);

  // Enhanced resource loading with cross-organization support
  const loadResources = useCallback(async () => {
    if (!bookId || !chapter || !verse) return;

    setIsLoading(true);
    setError(null);
    
    // Reset individual loading states
    setResourceLoadingStates({
      scripture: true,
      tn: true,
      tq: true,
      tw: true,
      twl: true,
    });

    try {
      // Load manifests first
      const currentManifests = await loadManifests();
      
      // Get resource configurations
      const scriptureConfig = getResourceConfig('scripture');
      const tnConfig = getResourceConfig('tn');
      const tqConfig = getResourceConfig('tq');
      const twConfig = getResourceConfig('tw');
      const twlConfig = getResourceConfig('twl');

      console.log('🔄 ResourcesContext: Loading resources with configurations:', {
        scripture: scriptureConfig,
        tn: tnConfig,
        tq: tqConfig,
        tw: twConfig,
        twl: twlConfig
      });

      // Load resources in parallel with individual error handling
      const resourcePromises = [
        // Scripture (USFM)
        (async () => {
          try {
            const scriptureKey = `${scriptureConfig.organization}/${scriptureConfig.resourceId}`;
            const manifest = currentManifests[scriptureKey];
            if (manifest) {
              const result = await fetchBook({
                languageId,
                resourceId: scriptureConfig.resourceId,
                bookId,
                manifest,
                organization: scriptureConfig.organization,
              });
              setResourceLoadingStates(prev => ({ ...prev, scripture: false }));
              return { type: 'scripture', data: result, config: scriptureConfig };
            }
            setResourceLoadingStates(prev => ({ ...prev, scripture: false }));
            return { type: 'scripture', data: null, config: scriptureConfig };
          } catch (err) {
            console.error('Failed to load scripture:', err);
            setResourceLoadingStates(prev => ({ ...prev, scripture: false }));
            return { type: 'scripture', data: null, config: scriptureConfig, error: err };
          }
        })(),

        // Translation Notes
        (async () => {
          try {
            const result = await getNotesForVerse(
              bookId, 
              chapter, 
              verse, 
              tnConfig.organization, 
              languageId
            );
            setResourceLoadingStates(prev => ({ ...prev, tn: false }));
            return { type: 'tn', data: result, config: tnConfig };
          } catch (err) {
            console.error('Failed to load translation notes:', err);
            setResourceLoadingStates(prev => ({ ...prev, tn: false }));
            return { type: 'tn', data: [], config: tnConfig, error: err };
          }
        })(),

        // Translation Questions
        (async () => {
          try {
            const tqKey = `${tqConfig.organization}/${tqConfig.resourceId}`;
            const manifest = currentManifests[tqKey];
            
            let customFilePath = null;
            if (manifest) {
              const project = manifest.projects?.find((p) => p.identifier === bookId);
              if (project && project.path) {
                customFilePath = project.path.replace("./", "");
              }
            }

            const result = await getQuestionsForVerse(
              bookId,
              chapter,
              verse,
              tqConfig.organization,
              languageId,
              customFilePath
            );
            setResourceLoadingStates(prev => ({ ...prev, tq: false }));
            return { type: 'tq', data: result, config: tqConfig };
          } catch (err) {
            console.error('Failed to load translation questions:', err);
            setResourceLoadingStates(prev => ({ ...prev, tq: false }));
            return { type: 'tq', data: [], config: tqConfig, error: err };
          }
        })(),

        // Translation Word Links
        (async () => {
          try {
            const twlKey = `${twlConfig.organization}/${twlConfig.resourceId}`;
            const manifest = currentManifests[twlKey];
            
            const result = manifest 
              ? await getLinksForVerse(
                  bookId,
                  chapter,
                  verse,
                  manifest,
                  twlConfig.organization,
                  languageId
                )
              : [];
            setResourceLoadingStates(prev => ({ ...prev, twl: false }));
            return { type: 'twl', data: result, config: twlConfig };
          } catch (err) {
            console.error('Failed to load translation word links:', err);
            setResourceLoadingStates(prev => ({ ...prev, twl: false }));
            return { type: 'twl', data: [], config: twlConfig, error: err };
          }
        })(),
      ];

      const resourceResults = await Promise.all(resourcePromises);
      
      // Process results
      const processedResults = {};
      resourceResults.forEach(result => {
        processedResults[result.type] = result;
      });

      // Load Translation Words based on TWL links
      let twResult;
      try {
        const twlLinks = processedResults.twl?.data || [];
        const twData = twlLinks.length > 0
          ? await getArticlesForLinks(twlLinks, languageId, twConfig.organization)
          : [];
        setResourceLoadingStates(prev => ({ ...prev, tw: false }));
        twResult = { type: 'tw', data: twData, config: twConfig };
      } catch (err) {
        console.error('Failed to load translation words:', err);
        setResourceLoadingStates(prev => ({ ...prev, tw: false }));
        twResult = { type: 'tw', data: [], config: twConfig, error: err };
      }

      // Process scripture data
      const usfmData = processedResults.scripture?.data;
      let chapterUsfm = null;
      let versesByChapter = {};
      
      if (usfmData) {
        // Extract raw USFM for the current chapter
        if (process.env.NODE_ENV === "development") {
          console.log("[ResourcesContext] usfmData (first 200 chars):", usfmData.substring(0, 200));
        }
        const chapterKey = String(chapter);
        const chapterRegex = /\\c\s+(\d+)([\s\S]*?)(?=(\r?\n)\\c\s+\d+|$)/g;
        let match;
        while ((match = chapterRegex.exec(usfmData)) !== null) {
          if (match[1] === chapterKey) {
            chapterUsfm = (`\\c ${chapterKey}` + match[2]).trim();
            break;
          }
        }

        // Parse verses
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

      // Build enhanced resource metadata with organization attribution
      const buildResourceMetadata = (result, resourceType) => {
        const baseMetadata = {
          resourceId: result.config.resourceId,
          organization: result.config.organization,
          isFromMixedResources: result.config.isFromMixedResources,
          languageId,
          loadingError: result.error?.message || null,
        };

        // Get manifest for title
        const manifestKey = `${result.config.organization}/${result.config.resourceId}`;
        const manifest = currentManifests[manifestKey];
        
        if (manifest?.dublin_core?.title) {
          baseMetadata.title = manifest.dublin_core.title;
        } else {
          // Fallback titles
          const fallbackTitles = {
            tn: "Translation Notes",
            tq: "Translation Questions", 
            tw: "Translation Words",
            twl: "Translation Word Links"
          };
          baseMetadata.title = fallbackTitles[resourceType] || `${result.config.resourceId.toUpperCase()}`;
        }

        return baseMetadata;
      };

      // Update resources state with cross-organization attribution
      setResources({
        scripture: usfmData ? {
          ...buildResourceMetadata(processedResults.scripture, 'scripture'),
          usfm: usfmData,
          verses: versesByChapter,
          chapterUsfm: chapterUsfm,
        } : null,
        
        translationNotes: (processedResults.tn?.data || []).map((note, index) => ({
          ...note,
          ...buildResourceMetadata(processedResults.tn, 'tn'),
          id: index + 1,
        })),
        
        translationQuestions: (processedResults.tq?.data || []).map((question, index) => ({
          ...question,
          ...buildResourceMetadata(processedResults.tq, 'tq'),
          id: index + 1,
        })),
        
        translationWords: (twResult?.data || []).map((article, index) => ({
          ...article,
          ...buildResourceMetadata(twResult, 'tw'),
          id: index + 1,
          term: article.title,
          content: article.content,
          rcLink: article.rcUri,
        })),
        
        translationWordLinks: (processedResults.twl?.data || []).map((link, index) => ({
          rcLink: link,
          ...buildResourceMetadata(processedResults.twl, 'twl'),
          id: index + 1,
        })),
      });

      // Update metadata with cross-organization information
      setMetadata({
        organization,
        languageId,
        bookId,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        manifestInfo: currentManifests,
        timestamp: new Date().toISOString(),
        
        // Enhanced metadata for cross-organization support
        advancedMode,
        resourceConfigurations: {
          scripture: processedResults.scripture?.config,
          tn: processedResults.tn?.config,
          tq: processedResults.tq?.config,
          tw: twResult?.config,
          twl: processedResults.twl?.config,
        },
        crossOrganizationUsage: advancedMode && Object.values({
          scripture: processedResults.scripture?.config,
          tn: processedResults.tn?.config,
          tq: processedResults.tq?.config,
          tw: twResult?.config,
          twl: processedResults.twl?.config,
        }).some(config => config?.isFromMixedResources),
      });

      console.log('✅ ResourcesContext: Successfully loaded all resources');
      
    } catch (err) {
      console.error("Error loading resources:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setResourceLoadingStates({
        scripture: false,
        tn: false,
        tq: false,
        tw: false,
        twl: false,
      });
    }
  }, [bookId, chapter, verse, languageId, loadManifests, getResourceConfig, advancedMode, organization]);

  // Load resources when reference or resource configuration changes
  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Enhanced context formatting with cross-organization attribution
  const getFormattedContext = useCallback(() => {
    if (!metadata) return null;

    // Debug logging for development
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

    // Enhanced scripture text preprocessing
    const preprocessUSFMToPlainText = (usfmText, chapter, verse) => {
      if (!usfmText) return "";

      try {
        const verseMarker = `\\v ${verse}`;
        const verseIndex = usfmText.indexOf(verseMarker);
        
        if (verseIndex === -1) return "";

        let verseText = usfmText.substring(verseIndex + verseMarker.length);
        const nextVerseIndex = verseText.indexOf("\\v ");
        if (nextVerseIndex !== -1) {
          verseText = verseText.substring(0, nextVerseIndex);
        }

        verseText = verseText
          .replace(/\\zaln-s[^\\]*?\\?\*/g, "")
          .replace(/\\zaln-e\\?\*/g, "")
          .replace(/\\w\s+([^|]+)\|[^\\]*?\\w\*/g, "$1")
          .replace(/\\[a-z]+[-\w]*\s*[^\\]*?\*/g, "")
          .replace(/\\[a-z]+[-\w]*\s*/g, "")
          .replace(/\|[^|]*?\*/g, "")
          .replace(/\s*,\s*/g, ", ")
          .replace(/\s+/g, " ")
          .trim();

        return verseText;
      } catch (err) {
        console.error("Error extracting verse text from USFM:", err);
        return "";
      }
    };

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

        // Enhanced scripture text with organization attribution
        if (resources.scripture.organization !== organization) {
          scriptureText += ` (from ${resources.scripture.organization})`;
        }

        // Parse for alignment data
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
        scripture: scriptureText,
        translationNotes: resources.translationNotes,
        translationQuestions: resources.translationQuestions,
        translationWords: resources.translationWords,
        translationWordLinks: resources.translationWordLinks,
      },
      metadata: {
        timestamp: metadata.timestamp,
        contextSize: 0,
        
        // Enhanced metadata with cross-organization information
        advancedMode: metadata.advancedMode,
        crossOrganizationUsage: metadata.crossOrganizationUsage,
        resourceOrganizations: {
          scripture: resources.scripture?.organization,
          translationNotes: resources.translationNotes[0]?.organization,
          translationQuestions: resources.translationQuestions[0]?.organization,
          translationWords: resources.translationWords[0]?.organization,
          translationWordLinks: resources.translationWordLinks[0]?.organization,
        },
        
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
  }, [resources, metadata, isLoading, verse, organization]);

  // Enhanced debugging exposure
  useEffect(() => {
    if (typeof window !== "undefined") {
      window._resourcesContext = {
        getFormattedContext,
        resources,
        metadata,
        manifests,
        isLoading,
        error,
        resourceLoadingStates,
        advancedMode,
        mixedResources,
      };
    }
  }, [getFormattedContext, resources, metadata, manifests, isLoading, error, resourceLoadingStates, advancedMode, mixedResources]);

  const value = {
    resources,
    metadata,
    manifests,
    isLoading,
    error,
    getFormattedContext,
    
    // Enhanced loading states with per-resource granularity
    loadingStates: {
      manifests: Object.keys(manifests).length === 0 && isLoading,
      scripture: resourceLoadingStates.scripture,
      translationNotes: resourceLoadingStates.tn,
      translationQuestions: resourceLoadingStates.tq,
      translationWords: resourceLoadingStates.tw,
      translationWordLinks: resourceLoadingStates.twl,
    },
    
    // Enhanced diagnostics with cross-organization information
    diagnostics: {
      manifestsAvailable: {
        [resourceId]: !!manifests[resourceId],
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
      currentResourceId: resourceId,
      
      // New cross-organization diagnostics
      advancedMode,
      crossOrganizationUsage: metadata?.crossOrganizationUsage || false,
      resourceConfigurations: metadata?.resourceConfigurations || {},
      organizationBreakdown: {
        scripture: resources.scripture?.organization,
        translationNotes: resources.translationNotes[0]?.organization,
        translationQuestions: resources.translationQuestions[0]?.organization,
        translationWords: resources.translationWords[0]?.organization,
        translationWordLinks: resources.translationWordLinks[0]?.organization,
      },
    },
  };

  return <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>;
}

export { ResourcesContext };
