/**
 * HelpsTabs.jsx
 * Tabbed interface for translation helps with accessible count badges
 * Updated with monochrome icons for professional appearance
 */

import React, { useState, useImperativeHandle, forwardRef } from "react";
import { useResourcesContext } from "../context/ResourcesContext";
import { LoadingOverlay, LoadingSpinner, TabIcon } from "./shared";
import { TranslationNotesPanel } from "./TranslationNotesPanel";
import { TranslationQuestionsPanel } from "./TranslationQuestionsPanel";
import { TranslationWordsPanel } from "./TranslationWordsPanel";
import { ArticlePanel } from "./ArticlePanel";
import { LLMChatPanel } from "./LLMChatPanel";
import { FiaImagesPanel } from "./FiaImagesPanel";
import { FiaMapsPanel } from "./FiaMapsPanel";
import styles from "./HelpsTabs.module.css";

const STATIC_TABS = [
  { id: "tn", label: "Notes", mobileLabel: "Notes", icon: "notes", component: TranslationNotesPanel, isStatic: true },
  { id: "tq", label: "Questions", mobileLabel: "Q&A", icon: "questions", component: TranslationQuestionsPanel, isStatic: true },
  { id: "tw", label: "Words", mobileLabel: "Words", icon: "words", component: TranslationWordsPanel, isStatic: true },
  { id: "fia-images", label: "Images", mobileLabel: "Pics", icon: "images", component: FiaImagesPanel, isStatic: true },
  { id: "fia-maps", label: "Maps", mobileLabel: "Maps", icon: "maps", component: FiaMapsPanel, isStatic: true },
  { id: "chat", label: "AI Assistant", mobileLabel: "AI", icon: "chat", component: LLMChatPanel, isStatic: true },
];

export const HelpsTabs = forwardRef(function HelpsTabs({ reference }, ref) {
  const [activeTab, setActiveTab] = useState("tn");
  const [dynamicTabs, setDynamicTabs] = useState([]);
  const { resources, isLoading, loadingResources } = useResourcesContext();

  // Helper function to check if a specific resource is loading
  const isResourceLoading = (tabId) => {
    const resourceMap = {
      'tn': 'notes',
      'tq': 'questions', 
      'tw': 'words',
      'fia-images': 'fia',
      'fia-maps': 'fia'
    };
    const resourceType = resourceMap[tabId];
    return resourceType && loadingResources.has(resourceType);
  };

  // Helper function to get count for each resource type
  const getResourceCount = (tabId) => {
    // Show loading spinner in badge if resource is loading
    if (isResourceLoading(tabId)) {
      return 'loading';
    }

    switch (tabId) {
      case 'tn':
        return Array.isArray(resources.notes) ? resources.notes.length : 0;
      case 'tq':
        return Array.isArray(resources.questions) ? resources.questions.length : 0;
      case 'tw':
        // Count both words and links
        const wordsCount = Array.isArray(resources.words) ? resources.words.length : 0;
        const linksCount = Array.isArray(resources.links) ? resources.links.length : 0;
        return Math.max(wordsCount, linksCount); // Use the higher count
      case 'fia-images':
        if (resources.fia?.hasContent) {
          return Array.isArray(resources.fia.images) ? resources.fia.images.length : 0;
        }
        return 0;
      case 'fia-maps':
        if (resources.fia?.hasContent) {
          return Array.isArray(resources.fia.maps) ? resources.fia.maps.length : 0;
        }
        return 0;
      case 'chat':
        // Return total items loaded across all resources
        const totalItems = (
          (Array.isArray(resources.notes) ? resources.notes.length : 0) +
          (Array.isArray(resources.questions) ? resources.questions.length : 0) +
          (Array.isArray(resources.words) ? resources.words.length : 0) +
          (resources.fia?.hasContent ? (
            (Array.isArray(resources.fia.images) ? resources.fia.images.length : 0) +
            (Array.isArray(resources.fia.maps) ? resources.fia.maps.length : 0)
          ) : 0)
        );
        return totalItems > 0 ? totalItems : null;
      default:
        return null;
    }
  };

  // Combine static and dynamic tabs
  const allTabs = [...STATIC_TABS, ...dynamicTabs];

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    switchToTab: (tabId) => {
      if (allTabs.find((tab) => tab.id === tabId)) {
        setActiveTab(tabId);
      }
    },
    getActiveTab: () => activeTab,
    openArticleTab: (article) => {
      // Check if tab already exists by rcUri
      const existingTab = dynamicTabs.find((tab) => tab.articleData?.rcUri === article.rcUri);
      if (existingTab) {
        setActiveTab(existingTab.id);
        return;
      }

      // Use provided id or generate one from rcUri
      const tabId = article.id || article.rcUri.replace(/[^a-zA-Z0-9]/g, "_");

      // Create new dynamic tab
      const newTab = {
        id: tabId,
        label: article.title || "Article",
        component: ArticlePanel,
        isStatic: false,
        articleData: article,
      };

      setDynamicTabs((prev) => [...prev, newTab]);
      setActiveTab(tabId);
    },
    closeTab: (tabId) => {
      // Only allow closing dynamic tabs
      const tabToClose = dynamicTabs.find((tab) => tab.id === tabId);
      if (tabToClose) {
        setDynamicTabs((prev) => prev.filter((tab) => tab.id !== tabId));

        // If closing active tab, switch to first available tab
        if (activeTab === tabId) {
          const remainingTabs = allTabs.filter((tab) => tab.id !== tabId);
          if (remainingTabs.length > 0) {
            setActiveTab(remainingTabs[0].id);
          }
        }
      }
    },
  }));

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleCloseTab = (tabId, event) => {
    event.stopPropagation();
    const tabToClose = dynamicTabs.find((tab) => tab.id === tabId);
    if (tabToClose) {
      setDynamicTabs((prev) => prev.filter((tab) => tab.id !== tabId));

      // If closing active tab, switch to first available tab
      if (activeTab === tabId) {
        const remainingTabs = allTabs.filter((tab) => tab.id !== tabId);
        if (remainingTabs.length > 0) {
          setActiveTab(remainingTabs[0].id);
        }
      }
    }
  };

  return (
    <div className={styles.helpsTabs} data-testid='helps-tabs'>
      <div className={styles.tabsHeader} role="tablist" aria-label="Translation helps tabs">
        {allTabs.map((tab) => {
          const count = getResourceCount(tab.id);
          const isActive = activeTab === tab.id;
          const tabIsLoading = isResourceLoading(tab.id);
          
          return (
            <div key={tab.id} className={styles.tabContainer}>
              <button
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`${styles.tabButton} ${isActive ? styles.active : ''} ${tabIsLoading ? styles.loading : ''}`}
                tabIndex={isActive ? 0 : -1}
              >
                <span className={styles.tabLabel}>
                  <span className={styles.iconTextContent}>
                    {tab.icon && <TabIcon type={tab.icon} />}
                    <span className={styles.desktopLabel}>{tab.label}</span>
                    <span className={styles.mobileLabel}>{tab.mobileLabel || tab.label}</span>
                  </span>
                  {count !== null && (
                    <span 
                      className={`${styles.countBadge} ${count === 0 ? styles.zero : ''} ${count === 'loading' ? styles.loadingBadge : ''}`}
                      aria-label={count === 'loading' ? 'Loading...' : `${count} items`}
                    >
                      {count === 'loading' ? (
                        <LoadingSpinner size="small" variant="white" />
                      ) : (
                        count
                      )}
                    </span>
                  )}
                </span>
              </button>
              {!tab.isStatic && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className={styles.closeButton}
                  aria-label={`Close ${tab.label} tab`}
                  tabIndex={isActive ? 0 : -1}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      <div className={styles.mainTabContent}>
        {/* Always render all static panels but only show the active one */}
        
        <LoadingOverlay 
          isVisible={activeTab === 'tn' && isResourceLoading('tn')}
          text="Loading Notes..."
        >
          <div 
            role="tabpanel"
            id="tabpanel-tn"
            aria-labelledby="tab-tn"
            data-testid="tab-content-tn"
            className={styles.tabPanel}
            style={{ display: activeTab === 'tn' ? 'block' : 'none' }}
            tabIndex={activeTab === 'tn' ? 0 : -1}
          >
            <TranslationNotesPanel reference={reference} />
          </div>
        </LoadingOverlay>
        
        <LoadingOverlay 
          isVisible={activeTab === 'tq' && isResourceLoading('tq')}
          text="Loading Questions..."
        >
          <div 
            role="tabpanel"
            id="tabpanel-tq"
            aria-labelledby="tab-tq"
            data-testid="tab-content-tq"
            className={styles.tabPanel}
            style={{ display: activeTab === 'tq' ? 'block' : 'none' }}
            tabIndex={activeTab === 'tq' ? 0 : -1}
          >
            <TranslationQuestionsPanel reference={reference} />
          </div>
        </LoadingOverlay>
        
        <LoadingOverlay 
          isVisible={activeTab === 'tw' && isResourceLoading('tw')}
          text="Loading Words..."
        >
          <div 
            role="tabpanel"
            id="tabpanel-tw"
            aria-labelledby="tab-tw"
            data-testid="tab-content-tw"
            className={styles.tabPanel}
            style={{ display: activeTab === 'tw' ? 'block' : 'none' }}
            tabIndex={activeTab === 'tw' ? 0 : -1}
          >
            <TranslationWordsPanel reference={reference} />
          </div>
        </LoadingOverlay>
        
        <LoadingOverlay 
          isVisible={activeTab === 'fia-images' && isResourceLoading('fia-images')}
          text="Loading FIA Images..."
        >
          <div 
            role="tabpanel"
            id="tabpanel-fia-images"
            aria-labelledby="tab-fia-images"
            data-testid="tab-content-fia-images"
            className={styles.tabPanel}
            style={{ display: activeTab === 'fia-images' ? 'block' : 'none' }}
            tabIndex={activeTab === 'fia-images' ? 0 : -1}
          >
            <FiaImagesPanel reference={reference} />
          </div>
        </LoadingOverlay>
        
        <LoadingOverlay 
          isVisible={activeTab === 'fia-maps' && isResourceLoading('fia-maps')}
          text="Loading FIA Maps..."
        >
          <div 
            role="tabpanel"
            id="tabpanel-fia-maps"
            aria-labelledby="tab-fia-maps"
            data-testid="tab-content-fia-maps"
            className={styles.tabPanel}
            style={{ display: activeTab === 'fia-maps' ? 'block' : 'none' }}
            tabIndex={activeTab === 'fia-maps' ? 0 : -1}
          >
            <FiaMapsPanel reference={reference} />
          </div>
        </LoadingOverlay>
        
        <div 
          role="tabpanel"
          id="tabpanel-chat"
          aria-labelledby="tab-chat"
          data-testid="tab-content-chat"
          className={styles.tabPanel}
          style={{ display: activeTab === 'chat' ? 'block' : 'none' }}
          tabIndex={activeTab === 'chat' ? 0 : -1}
        >
          <LLMChatPanel reference={reference} />
        </div>
        
        {/* Dynamic tabs (articles) - only render when active */}
        {dynamicTabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            data-testid={`tab-content-${tab.id}`}
            className={styles.tabPanel}
            style={{ display: activeTab === tab.id ? 'block' : 'none' }}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            <ArticlePanel reference={reference} article={tab.articleData} />
          </div>
        ))}
      </div>
    </div>
  );
});
