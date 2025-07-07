/**
 * ShowcaseLayout.jsx
 * Main layout component for the documentation showcase site
 * Features navigation sidebar and main content area with markdown rendering
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ShowcaseNav } from './ShowcaseNav';
import { ShowcaseContent } from './ShowcaseContent';
import styles from './ShowcaseLayout.module.css';

export function ShowcaseLayout() {
  const [selectedSection, setSelectedSection] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Parse current section from URL (including subsections)
  useEffect(() => {
    const path = location.pathname.replace('/showcase/', '') || 'overview';
    setSelectedSection(path);
  }, [location.pathname]);

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    navigate(`/showcase/${section}`);
    setMobileNavOpen(false); // Close mobile nav after selection
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <div className={styles.showcaseContainer}>
      {/* Mobile nav toggle */}
      <button 
        className={styles.mobileNavToggle}
        onClick={toggleMobileNav}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ''}`}>
        <ShowcaseNav 
          selectedSection={selectedSection}
          onSectionSelect={handleSectionSelect}
        />
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<ShowcaseContent section="overview" />} />
          <Route path="/:section" element={<ShowcaseContent section={selectedSection} />} />
          <Route path="/:section/:subsection" element={<ShowcaseContent section={selectedSection} />} />
        </Routes>
      </main>

      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setMobileNavOpen(false)}
        />
      )}
    </div>
  );
} 