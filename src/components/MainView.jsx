/**
 * MainView.jsx
 * Orchestrates the main content area including scripture text, navigation tabs, and helps panels.
 */

import React, { useContext, useState, createContext } from "react";
import { ReferenceContext } from "../context/ReferenceContext";
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
  // Simple Verse-Loading Pattern: No refs needed - ResourcesContext handles everything
  const [activeHelpsTab, setActiveHelpsTab] = useState("tn");
  const [activeMobileTab, setActiveMobileTab] = useState("scripture");

  const handleVerseClick = (verseNum) => {
    // When a verse is clicked, it automatically updates the reference context
    // which triggers the helps panels to update
    console.log("Verse clicked:", verseNum);
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
      console.log('📍 Setting mixed resource:', {
        resourceType,
        languageId: rcLanguageId,
        organization: effectiveOrganization
      });
      
      // This is a resource selection from navigation - update resources array
      if (updateResourceInArray) {
        // Update resources array to use the selected language/organization for this resource type
        updateResourceInArray(resourceType, {
          languageId: rcLanguageId,
          organization: effectiveOrganization,
          resourceId: resourceType
        });
      } else if (updateContext) {
        // Fallback to legacy mixed resources format
        updateContext({
          mixedResources: {
            [resourceType]: {
              languageId: rcLanguageId,
              organization: effectiveOrganization,
              resourceId: resourceType
            }
          }
        });
      }
      
      // Simple Verse-Loading Pattern: Resources self-activate, no manual tab switching needed
      console.log(`Resource ${resourceType} will self-activate when loaded`);
      
      return; // Don't continue with article loading logic
    }

    switch (resourceType) {
      case "tw":
        // For translation words, fetch the full article and open in new tab
        try {
          // Simple Verse-Loading Pattern: Open external link directly
          const externalUrl = convertRcUriToUrl(rcUri, effectiveLanguageId, effectiveOrganization);
          if (externalUrl) {
            console.log("Opening external TW article:", externalUrl);
            window.open(externalUrl, "_blank", "noopener,noreferrer");
          } else {
            console.warn("Could not convert rc:// URI to external URL:", rcUri);
          }
        } catch (error) {
          console.error("Error handling TW link:", error);
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
        // Simple Verse-Loading Pattern: Open Translation Academy externally
        try {
          const externalUrl = convertRcUriToUrl(rcUri, effectiveLanguageId, effectiveOrganization);
          if (externalUrl) {
            console.log("Opening external Translation Academy resource:", externalUrl);
            window.open(externalUrl, "_blank", "noopener,noreferrer");
          } else {
            console.warn("Could not convert rc:// URI to external URL:", rcUri);
          }
        } catch (error) {
          console.error("Error handling Translation Academy link:", error);
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
            <HelpsTabs reference={reference} />
          </RcLinkContext.Provider>
        </div>
      </div>
    </main>
  );
}
