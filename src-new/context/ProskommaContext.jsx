/**
 * ProskommaContext.jsx
 * Shared proskomma instance and content caching to prevent duplicate imports and parsing
 */
import React, { createContext, useContext, useCallback, useRef, useState, useMemo } from "react";
import { CustomProskomma } from "../utils/CustomProskomma";

const ProskommaContext = createContext(null);

// Cache structure: Map<cacheKey, { proskomma, docSetId, importTimestamp }>
const proskommaCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Generate cache key for USFM content
function generateCacheKey(org, lang, abbr, usfmContent) {
  // Use content hash for cache key to detect content changes
  const contentHash = usfmContent ? usfmContent.length + usfmContent.substring(0, 100) : "";
  return `${org}/${lang}/${abbr}/${contentHash}`;
}

// Clean expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of proskommaCache.entries()) {
    if (now - entry.importTimestamp > CACHE_EXPIRY) {
      proskommaCache.delete(key);
      console.log("🧹 Cleaned expired proskomma cache entry:", key);
    }
  }
}

export function ProskommaProvider({ children }) {
  const [importingKeys, setImportingKeys] = useState(new Set());

  // Clean cache periodically
  const cleanupInterval = useRef(null);
  React.useEffect(() => {
    cleanupInterval.current = setInterval(cleanExpiredCache, 60000); // Clean every minute
    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
    };
  }, []);

  // Get or create proskomma instance for specific content
  const getProskommaInstance = useCallback(async (org, lang, abbr, usfmContent) => {
    if (!org || !lang || !abbr || !usfmContent) {
      console.warn("🚫 Missing required parameters for proskomma instance");
      return null;
    }

    const cacheKey = generateCacheKey(org, lang, abbr, usfmContent);

    // Return cached instance if available and not expired
    const cachedEntry = proskommaCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.importTimestamp < CACHE_EXPIRY) {
      console.log("✅ Using cached proskomma instance:", cacheKey);
      return {
        proskomma: cachedEntry.proskomma,
        docSetId: cachedEntry.docSetId,
        cached: true,
      };
    }

    // Check if import is already in progress
    if (importingKeys.has(cacheKey)) {
      console.log("⏳ Import already in progress for:", cacheKey);
      return null;
    }

    try {
      // Mark as importing
      setImportingKeys((prev) => new Set(prev).add(cacheKey));

      console.log("📄 Creating new proskomma instance and importing:", cacheKey);
      console.log("📄 USFM content length:", usfmContent.length);
      console.log("📄 First 500 chars:", usfmContent.substring(0, 500));

      // Create new instance
      const proskomma = new CustomProskomma();

      // Define selectors
      const selectors = { org, lang, abbr };

      // Import document
      const importResult = proskomma.importDocument(selectors, "usfm", usfmContent);

      if (!importResult.isSuccessful) {
        throw new Error(
          `Failed to import USFM: ${importResult.errors?.join(", ") || "Unknown error"}`
        );
      }

      // Get the docSet ID
      const docSetId = proskomma.selectorString(selectors);

      // Verify the import worked
      const docSets = proskomma.docSetList();
      const ourDocSet = docSets.find((ds) => ds.id === docSetId);

      if (!ourDocSet || ourDocSet.nDocuments === 0) {
        throw new Error(`Import appeared successful but no documents found in docSet: ${docSetId}`);
      }

      console.log("✅ Successfully imported USFM into proskomma:", {
        docSetId,
        nDocuments: ourDocSet.nDocuments,
        cacheKey,
      });

      // Cache the instance
      const cacheEntry = {
        proskomma,
        docSetId,
        importTimestamp: Date.now(),
      };
      proskommaCache.set(cacheKey, cacheEntry);

      return {
        proskomma,
        docSetId,
        cached: false,
      };
    } catch (error) {
      console.error("❌ Failed to create proskomma instance:", error);
      throw error;
    } finally {
      // Remove from importing set
      setImportingKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    }
  }, []);

  // Query passage using cached proskomma instance
  const queryPassage = useCallback(
    async (org, lang, abbr, usfmContent, reference) => {
      try {
        const instance = await getProskommaInstance(org, lang, abbr, usfmContent);
        if (!instance) return null;

        const { proskomma, docSetId } = instance;

        // Build GraphQL query for the passage
        const query = `
        query {
          docSet(id: "${docSetId}") {
            document(bookCode: "${abbr.toUpperCase()}") {
              sequences {
                blocks(withScriptureCV: "${reference}") {
                  text
                  bs {
                    payload
                  }
                  items {
                    type
                    payload
                  }
                }
              }
            }
          }
        }
      `;

        console.log("🔍 Querying passage:", reference, "with query:", query);

        const result = proskomma.gqlQuerySync(query);

        if (result.errors?.length > 0) {
          throw new Error(
            `GraphQL query failed: ${result.errors.map((e) => e.message).join(", ")}`
          );
        }

        return result.data;
      } catch (error) {
        console.error("❌ Failed to query passage:", error);
        throw error;
      }
    },
    [getProskommaInstance]
  );

  // Query entire chapter efficiently
  const queryChapter = useCallback(
    async (org, lang, abbr, usfmContent, bookCode, chapter) => {
      try {
        console.log("🔍 Querying chapter", chapter, "for book", abbr);

        const instance = await getProskommaInstance(org, lang, abbr, usfmContent);
        if (!instance) return null;

        const { proskomma, docSetId } = instance;

        // Build GraphQL query for the specific chapter
        const query = `
        query {
          docSet(id: "${docSetId}") {
            document(bookCode: "${abbr.toUpperCase()}") {
              sequences {
                blocks(withScriptureCV: "${chapter}") {
                  text
                  bs {
                    payload
                  }
                  items {
                    type
                    payload
                  }
                }
              }
            }
          }
        }
      `;

        console.log("🔍 Executing GraphQL query for chapter", chapter);

        const result = proskomma.gqlQuerySync(query);

        if (result.errors?.length > 0) {
          throw new Error(
            `GraphQL query failed: ${result.errors.map((e) => e.message).join(", ")}`
          );
        }

        console.log("✅ Chapter query successful, returning data");

        return result.data;
      } catch (error) {
        console.error("❌ Failed to query chapter:", error);
        throw error;
      }
    },
    [getProskommaInstance]
  );

  // Search within document
  const searchText = useCallback(
    async (org, lang, abbr, usfmContent, searchTerm) => {
      try {
        const instance = await getProskommaInstance(org, lang, abbr, usfmContent);
        if (!instance) return [];

        const { proskomma, docSetId } = instance;

        // Simple text search through the document
        const query = `
        query {
          docSet(id: "${docSetId}") {
            document(bookCode: "${abbr.toUpperCase()}") {
              sequences {
                blocks {
                  text
                  bs {
                    payload
                  }
                }
              }
            }
          }
        }
      `;

        const result = proskomma.gqlQuerySync(query);

        if (result.errors?.length > 0) {
          throw new Error(
            `GraphQL query failed: ${result.errors.map((e) => e.message).join(", ")}`
          );
        }

        // Process blocks to find matches
        const blocks = result.data?.docSet?.document?.sequences?.[0]?.blocks || [];
        const matches = [];

        for (const block of blocks) {
          if (block.text && block.text.toLowerCase().includes(searchTerm.toLowerCase())) {
            // Extract chapter/verse from block scopes
            const chapterScope = block.bs?.find((b) => b.payload?.startsWith("chapter/"));
            const verseScope = block.bs?.find((b) => b.payload?.startsWith("verse/"));

            if (chapterScope && verseScope) {
              const chapter = parseInt(chapterScope.payload.split("/")[1]);
              const verse = parseInt(verseScope.payload.split("/")[1]);

              matches.push({
                text: block.text,
                chapter,
                verse,
                reference: `${abbr.toUpperCase()} ${chapter}:${verse}`,
                scopeLabels: [chapterScope.payload, verseScope.payload],
              });
            }
          }
        }

        return matches;
      } catch (error) {
        console.error("❌ Failed to search text:", error);
        throw error;
      }
    },
    [getProskommaInstance]
  );

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return {
      size: proskommaCache.size,
      keys: Array.from(proskommaCache.keys()),
      importing: Array.from(importingKeys),
    };
  }, [importingKeys]);

  const contextValue = useMemo(
    () => ({
      getProskommaInstance,
      queryPassage,
      queryChapter,
      searchText,
      getCacheStats,
      isImporting: (org, lang, abbr, usfmContent) => {
        const cacheKey = generateCacheKey(org, lang, abbr, usfmContent);
        return importingKeys.has(cacheKey);
      },
    }),
    [getProskommaInstance, queryPassage, queryChapter, searchText, getCacheStats, importingKeys]
  );

  return <ProskommaContext.Provider value={contextValue}>{children}</ProskommaContext.Provider>;
}

// Custom hook to use proskomma context
export function useProskommaContext() {
  const context = useContext(ProskommaContext);
  if (!context) {
    throw new Error("useProskommaContext must be used within a ProskommaProvider");
  }
  return context;
}

export default ProskommaContext;
