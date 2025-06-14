/**
 * TranslationWordsPanel.jsx
 * Responsible for displaying linked translation words articles from TWL.
 */
import React, { useContext, useEffect, useState } from "react";
import { ManifestsContext } from "../context/MultiManifestsContext";
import { RcLinkContext } from "./MainView";
import { ReferenceContext } from "../context/ReferenceContext";
import { getLinksForVerse } from "../services/twlService";
import { getArticlesForLinks } from "../services/twService";
import { processRcLinks, RcLink } from "../utils/rcLinkUtils.jsx";
import styles from "./TranslationWordsPanel.module.css";

/**
 * Extracts a summary from article content (first sentence or paragraph)
 * @param {string} content - Article content
 * @returns {string} Summary text
 */
function extractSummary(content) {
  if (!content) return "";

  // Find first definition section or paragraph
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and headers
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Return first meaningful sentence/paragraph
    if (trimmed.length > 20) {
      return trimmed.split(".")[0] + ".";
    }
  }

  return content.substring(0, 150) + (content.length > 150 ? "..." : "");
}

/**
 * @param {object} props
 * @param {object} props.reference - Reference object { bookId, chapter, verse }
 * @param {function} props.onWordClick - Optional callback when a word is clicked for navigation
 */
export function TranslationWordsPanel({ reference, onWordClick }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [twlLinks, setTwlLinks] = useState([]);
  const { manifests } = useContext(ManifestsContext);
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};
  const { organization, languageId } = useContext(ReferenceContext);

  useEffect(() => {
    async function loadWords() {
      if (!reference?.bookId || !reference?.chapter || !reference?.verse) {
        setWords([]);
        setTwlLinks([]);
        setError(null); // Clear any previous errors
        return;
      }

      // Check if we have required context
      if (!organization || !languageId) {
        if (!organization) {
          setError(
            "Please select an organization from the dropdown above to view translation words."
          );
        } else if (!languageId) {
          setError("Please select a language from the dropdown above to view translation words.");
        }
        setWords([]);
        setTwlLinks([]);
        return;
      }

      const twlManifest = manifests.twl;
      if (!twlManifest) {
        console.log("TWL manifest not loaded yet");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Step 1: Get TWL links for this verse
        const links = await getLinksForVerse(
          reference.bookId,
          reference.chapter,
          reference.verse,
          twlManifest,
          organization,
          languageId
        );

        setTwlLinks(links);

        if (links && links.length > 0) {
          // Step 2: Fetch tW articles for the links
          const articles = await getArticlesForLinks(links, languageId, organization);

          // Step 3: Transform articles into display format and deduplicate by rcUri
          const articlesMap = new Map();
          articles.forEach((article, index) => {
            const key = article.rcUri || `article-${index}`;
            // Only add if we haven't seen this rcUri before, or if it's a fallback key
            if (!articlesMap.has(key) || key.startsWith("article-")) {
              articlesMap.set(key, {
                id: key,
                title: article.title,
                content: article.content,
                rcUri: article.rcUri,
                summary: extractSummary(article.content),
                error: article.error,
              });
            }
          });

          const wordsData = Array.from(articlesMap.values());

          setWords(wordsData);
        } else {
          setWords([]);
        }
      } catch (err) {
        console.error("Error loading translation words:", err);
        // Provide more user-friendly error messages
        if (err.message.includes("Not Found") || err.message.includes("404")) {
          setError(
            `Translation words are not available for ${reference.bookId.toUpperCase()} ${
              reference.chapter
            }:${
              reference.verse
            } in the selected language/organization. Try selecting a different verse or language.`
          );
        } else {
          setError("Failed to load translation words");
        }
        setWords([]);
      } finally {
        setLoading(false);
      }
    }

    loadWords();
  }, [reference, manifests.twl, organization, languageId]);

  const handleWordClick = (word) => {
    // First try the provided callback
    if (onWordClick) {
      onWordClick(word);
      return;
    }

    // If no callback provided, and we have the rc link context, open as new tab
    if (handleRcLinkClick && word.rcUri) {
      handleRcLinkClick(word.rcUri, languageId, organization);
    }
  };

  if (!reference?.verse) {
    return (
      <section data-testid='translation-words-panel' className={styles.translationWordsPanel}>
        <p className={styles.emptyState}>Select a verse to view translation words.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section data-testid='translation-words-panel' className={styles.translationWordsPanel}>
        <p className={styles.loadingState}>Loading translation words...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section data-testid='translation-words-panel' className={styles.translationWordsPanel}>
        <p className={styles.errorState}>{error}</p>
        {twlLinks.length > 0 && (
          <details className={styles.debugInfo}>
            <summary className={styles.debugSummary}>Debug Info</summary>
            <p>Found {twlLinks.length} TWL link(s) for this verse:</p>
            <ul className={styles.debugList}>
              {twlLinks.map((link, index) => (
                <li key={index} className={styles.debugItem}>
                  {link}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    );
  }

  return (
    <section data-testid='translation-words-panel' className={styles.translationWordsPanel}>
      <h3 className={styles.panelHeader}>Translation Words</h3>
      {words.length === 0 ? (
        <div>
          <p className={styles.emptyState}>No translation words available for this verse.</p>
          {twlLinks.length > 0 && (
            <details className={styles.debugInfo}>
              <summary className={styles.debugSummary}>Debug Info</summary>
              <p>Found {twlLinks.length} TWL link(s) but no articles loaded.</p>
            </details>
          )}
        </div>
      ) : (
        <div className={styles.wordsList}>
          {words.map((word) => {
            const isClickable = onWordClick || (handleRcLinkClick && word.rcUri);
            return (
              <div
                key={word.id}
                className={`${styles.wordCard} ${!isClickable ? styles.nonClickable : ""}`}
                onClick={() => handleWordClick(word)}
              >
                <h4 className={styles.wordTitle}>
                  {word.title}
                  {isClickable && (
                    <span className={styles.clickIndicator}>Click to view full article →</span>
                  )}
                </h4>

                <p className={styles.wordSummary}>
                  {processRcLinks(word.summary, (rcUri) => {
                    if (handleRcLinkClick) {
                      handleRcLinkClick(rcUri, languageId, organization);
                    }
                  })}
                </p>

                {/* Hidden full content for chat context extraction */}
                {word.content && (
                  <div className={styles.visuallyHidden} aria-hidden='true'>
                    {word.content}
                  </div>
                )}

                {word.rcUri && (
                  <p
                    className={styles.rcLink}
                    onClick={(e) => e.stopPropagation()} // Prevent triggering parent onClick
                  >
                    <RcLink
                      rcUri={word.rcUri}
                      onRcLinkClick={(rcUri) => {
                        if (handleRcLinkClick) {
                          handleRcLinkClick(rcUri, languageId, organization);
                        }
                      }}
                    >
                      {word.rcUri}
                    </RcLink>
                  </p>
                )}
              </div>
            );
          })}

          <div className={styles.tipSection}>
            <p className={styles.tipText}>
              <span className={styles.tipIcon}>💡</span>
              <span className={styles.tipBold}>Tip:</span> These words are linked to this verse
              through Translation Words Links (TWL).
              {(onWordClick || handleRcLinkClick) &&
                " Click any word above to view the complete article."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
