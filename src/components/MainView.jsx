/**
 * MainView.jsx
 * Orchestrates the main content area including scripture text, navigation tabs, and helps panels.
 */

import React, { useContext, useState, createContext, useRef } from "react";
import { ReferenceContext } from "../context/ReferenceContext";
import { useResourcesContext } from "../context/ResourcesContext";
// Simple Verse-Loading Pattern: ResourcesProvider handles all resource loading
// Panels self-activate via ResourcesContext - no refs needed

import { ScripturePanel } from "./ScripturePanel";
import { HelpsTabs } from "./HelpsTabs";
import { convertRcUriToUrl } from "../utils/rcLinkUtils.jsx";
import { getArticle } from "../services/twService";
import { getArticle as getTaArticle } from "../services/taService";
import styles from "./MainView.module.css";


// Context for rc:// link handling
export const RcLinkContext = createContext();

export function MainView() {
  const { reference, organization, languageId, updateContext, updateResourceInArray } = useContext(ReferenceContext);
  const { activateResource } = useResourcesContext();
  // ANTI-FRAGILE: No global loading state - each panel handles its own loading
  // Simple Verse-Loading Pattern: No refs needed - ResourcesContext handles everything
  const [activeHelpsTab, setActiveHelpsTab] = useState("tn");
  const [activeMobileTab, setActiveMobileTab] = useState("scripture");
  const helpsTabsRef = useRef(null);

  const handleVerseClick = (verseNum) => {
    // Verse clicks are now pure CSS highlighting operations
    // No global state updates needed - prevents unnecessary re-renders
    console.log("Verse clicked:", verseNum, "(highlighting handled locally)");
  };

  // Handle rc:// link clicks to open article tabs or switch to appropriate internal tabs
  const handleRcLinkClick = async (rcUri, contextLanguageId, contextOrganization) => {
    if (!rcUri || !rcUri.startsWith("rc://")) {
      console.warn("Invalid rc:// URI:", rcUri);
      return;
    }

    // Use provided context or fall back to default context
    const effectiveLanguageId = contextLanguageId || languageId || "en";
    const effectiveOrganization = contextOrganization || organization || "unfoldingWord";

    // Parse the rc:// URI to determine the appropriate tab
    const uriParts = rcUri.split("/");
    if (uriParts.length < 4) {
      console.warn("Malformed rc:// URI:", rcUri);
      return;
    }

    const rcLanguageId = uriParts[2]; // Language from RC link
    const resourceType = uriParts[3]; // tw, tn, tq, etc.
    const rcPath = uriParts[4]; // help, kt, etc.

    // Check if this is a resource selection RC link (has /help/ path)
    // These come from our InlineHelpsNavigation component
    const isResourceSelection = rcPath === 'help' && uriParts.length >= 7;
    
    if (isResourceSelection) {
      console.log('🔗 Handling resource selection RC link:', rcUri);
      
      // Map external resource IDs to internal resource types
      const resourceTypeMap = {
        'tn': 'notes',
        'tq': 'questions', 
        'tw': 'words',
        'twl': 'links',
        'ta': 'ta'
      };
      
      const internalResourceType = resourceTypeMap[resourceType] || resourceType;
      
      console.log('📍 Setting mixed resource:', {
        externalType: resourceType,
        internalType: internalResourceType,
        languageId: rcLanguageId,
        organization: effectiveOrganization
      });
      
      // This is a resource selection from navigation - update resources array
      if (updateResourceInArray) {
        // Update resources array to use the selected language/organization for this resource type
        updateResourceInArray(internalResourceType, {
          languageId: rcLanguageId,
          organization: effectiveOrganization,
          resourceId: resourceType // Keep original resourceId for API calls
        });
      } else if (updateContext) {
        // Fallback to legacy mixed resources format
        updateContext({
          mixedResources: {
            [internalResourceType]: {
              languageId: rcLanguageId,
              organization: effectiveOrganization,
              resourceId: resourceType // Keep original resourceId for API calls
            }
          }
        });
      }
      
      // Trigger resource reload with new configuration
      activateResource(internalResourceType);
      console.log(`Resource ${internalResourceType} activated and will reload with new configuration`);
      
      return; // Don't continue with article loading logic
    }

    switch (resourceType) {
      case "tw":
        // For translation words, fetch the full article and open in new tab
        try {
          console.log("Fetching TW article for:", rcUri);
          const article = await getArticle(rcUri, effectiveLanguageId, effectiveOrganization);
          
          if (article && !article.error && helpsTabsRef.current) {
            console.log("Opening TW article in new tab:", article.title);
            helpsTabsRef.current.openArticleTab(article);
          } else if (article && article.error) {
            console.warn("Error loading article:", article.error);
            // Fallback to external URL if article fetch fails
          const externalUrl = convertRcUriToUrl(rcUri, effectiveLanguageId, effectiveOrganization);
          if (externalUrl) {
              console.log("Falling back to external URL:", externalUrl);
            window.open(externalUrl, "_blank", "noopener,noreferrer");
            }
          }
        } catch (error) {
          console.error("Error handling TW link:", error);
          // Fallback to external URL
          const externalUrl = convertRcUriToUrl(rcUri, effectiveLanguageId, effectiveOrganization);
          if (externalUrl) {
            window.open(externalUrl, "_blank", "noopener,noreferrer");
          }
        }
        break;
      case "tn":
        // Simple Verse-Loading Pattern: Resources self-activate, no manual switching needed
        console.log("Translation Notes resource will self-activate");
        break;
      case "tq":
        // Simple Verse-Loading Pattern: Resources self-activate, no manual switching needed
        console.log("Translation Questions resource will self-activate");
        break;
      case "ta":
        // For translation academy, fetch the full article and open in new tab
        try {
          console.log("Fetching TA article for:", rcUri);
          const article = await getTaArticle(rcUri, effectiveLanguageId, effectiveOrganization);
          
          if (article && !article.error && helpsTabsRef.current) {
            console.log("Opening TA article in new tab:", article.title);
            helpsTabsRef.current.openArticleTab(article);
          } else if (article && article.error) {
            console.warn("Error loading TA article:", article.error);
            // Fallback to external URL if article fetch fails
          const externalUrl = convertRcUriToUrl(rcUri, effectiveLanguageId, effectiveOrganization);
          if (externalUrl) {
              console.log("Falling back to external URL:", externalUrl);
            window.open(externalUrl, "_blank", "noopener,noreferrer");
            }
          }
        } catch (error) {
          console.error("Error handling Translation Academy link:", error);
          // Fallback to external URL
          const externalUrl = convertRcUriToUrl(rcUri, effectiveLanguageId, effectiveOrganization);
          if (externalUrl) {
            window.open(externalUrl, "_blank", "noopener,noreferrer");
          }
        }
        break;
      default:
        // For other external resources, open in new tab
        const externalUrl = convertRcUriToUrl(rcUri, effectiveLanguageId, effectiveOrganization);
        if (externalUrl) {
          console.log("Opening external resource:", externalUrl);
          window.open(externalUrl, "_blank", "noopener,noreferrer");
        } else {
          console.warn("Could not convert rc:// URI to external URL:", rcUri);
        }
        break;
    }
  };

  return (
    <main data-testid='main-view' className={styles.mainView}>
      
      {/* Mobile Tab Navigation */}
      <div className={styles.mobileTabNav}>
        <button
          className={`${styles.mobileTab} ${
            activeMobileTab === "scripture" ? styles.mobileTabActive : ""
          }`}
          onClick={() => setActiveMobileTab("scripture")}
        >
          Scripture
        </button>
        <button
          className={`${styles.mobileTab} ${
            activeMobileTab === "resources" ? styles.mobileTabActive : ""
          }`}
          onClick={() => setActiveMobileTab("resources")}
        >
          Resources
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className={styles.contentArea}>
        {/* Scripture Panel */}
        <div
          className={`${styles.scripturePanel} ${
            activeMobileTab === "scripture" ? styles.mobilePanelActive : ""
          }`}
        >
          <ScripturePanel reference={reference} onVerseClick={handleVerseClick} />
        </div>

        {/* Translation Helps */}
        <div
          className={`${styles.helpsPanel} ${
            activeMobileTab === "resources" ? styles.mobilePanelActive : ""
          }`}
        >
          <RcLinkContext.Provider value={{ handleRcLinkClick }}>
            <HelpsTabs ref={helpsTabsRef} reference={reference} />
          </RcLinkContext.Provider>
        </div>
      </div>
    </main>
  );
}
