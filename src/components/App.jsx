/**
 * App.jsx
 * Root shell and provider wiring for clean-slate rewrite.
 */

import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ReferenceProvider } from "../context/ReferenceContext";
import { MultiManifestsProvider } from "../context/MultiManifestsContext";
import { ResourcesProvider } from "../context/ResourcesContext";
import { ChatProvider } from "../context/ChatContext";
import { NavigationBar } from "./NavigationBar";
import { MainView } from "./MainView";
import { NavigationWizard } from "./NavigationWizard/index.jsx";

export function App() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardInitialStep, setWizardInitialStep] = useState(1);

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleOpenWizard = (initialStep = 1) => {
    setWizardInitialStep(initialStep);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handleWizardComplete = (selectedContext) => {
    console.log("Navigation wizard completed with:", selectedContext);
    setIsWizardOpen(false);
    // The context is automatically updated by the wizard via ReferenceContext
  };

  return (
    <ReferenceProvider>
      <MultiManifestsProvider>
        <ResourcesProvider>
          <ChatProvider>
            <div style={{ 
              backgroundColor: "var(--color-background)", 
              minHeight: "100vh",
              color: "var(--color-text)"
            }}>
              <NavigationBar onOpenWizard={handleOpenWizard} />
              <Routes>
                <Route path='/' element={<MainView />} />
                <Route path='*' element={<div style={{ padding: "20px" }}>Page Not Found</div>} />
              </Routes>

              {/* Navigation Wizard Modal */}
              {isWizardOpen && (
                <NavigationWizard
                  onComplete={handleWizardComplete}
                  onClose={handleCloseWizard}
                  initialStep={wizardInitialStep}
                />
              )}
            </div>
          </ChatProvider>
        </ResourcesProvider>
      </MultiManifestsProvider>
    </ReferenceProvider>
  );
}
