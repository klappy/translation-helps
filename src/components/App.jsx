/**
 * App.jsx
 * Root shell and provider wiring for clean-slate rewrite.
 */

import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ReferenceProvider } from "../context/ReferenceContext";
import { ResourcesProvider } from "../context/ResourcesContext";
import { ChatProvider } from "../context/ChatContext";
import SvelteNavBar from "./SvelteNavBar";
import { MainView } from "./MainView";
import { SplashScreen } from "./SplashScreen";
import { ShowcaseLayout } from "./showcase/ShowcaseLayout";
import { DevelopmentReminder } from "./DevelopmentReminder";
import SvelteGreeterDemo from "./SvelteGreeterDemo";

// Main app component with ResourcesProvider managing all translation resources
function AppContent() {
  return (
    <div style={{ 
      backgroundColor: "var(--color-background)", 
      minHeight: "100vh",
      color: "var(--color-text)"
    }}>
      <SvelteNavBar />
      <Routes>
        <Route path='/' element={<MainView />} />
        <Route path='/showcase/*' element={<ShowcaseLayout />} />
        <Route path='/svelte' element={<SvelteGreeterDemo />} />
        <Route path='*' element={<div style={{ padding: "20px" }}>Page Not Found</div>} />
      </Routes>
      <DevelopmentReminder />
    </div>
  );
}

export function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if user has seen splash before
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    // Show splash only on first visit or if explicitly requested
    return !hasSeenSplash || window.location.search.includes('splash=true');
  });

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleSplashComplete = () => {
    // Mark that user has seen splash
    localStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <ReferenceProvider>
      <ResourcesProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </ResourcesProvider>
    </ReferenceProvider>
  );
}
