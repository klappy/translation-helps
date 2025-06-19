/**
 * NavigationBar.jsx
 * Application header with title and clickable navigation breadcrumbs
 */

import React, { useContext, useState } from "react";
import { ReferenceContext } from "../context/ReferenceContext";
import { NavigationBreadcrumbs } from "./NavigationBreadcrumbs";
import { ThemeToggle } from "./ThemeToggle";

export function NavigationBar({ onOpenWizard }) {
  const { reference } = useContext(ReferenceContext);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);

  return (
    <>
      <style>
        {`
          .nav-logo-button {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
          }
          
          .nav-logo-button:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: var(--color-border) !important;
            transform: translateY(-1px) !important;
            box-shadow: var(--shadow-sm) !important;
          }
          
          .nav-logo-button:focus-visible {
            box-shadow: 0 0 0 2px var(--color-primary-light), 0 1px 2px rgba(0, 0, 0, 0.1) !important;
            outline: none !important;
          }
          
          .nav-logo-button:active {
            transform: translateY(0) !important;
          }
        `}
      </style>
      <nav
      style={{
        backgroundColor: "var(--color-footer)",
        color: "var(--color-primary)",
        padding: "var(--spacing-2) var(--spacing-3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)",
        flexWrap: "wrap",
        gap: "var(--spacing-2)",
      }}
    >
      <button 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          flexShrink: 0, 
          cursor: "pointer",
          padding: "var(--spacing-1)",
          borderRadius: "var(--radius-md)",
          transition: "all var(--transition-fast)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
          outline: "none"
        }}
        onClick={() => setShowBreadcrumbs(!showBreadcrumbs)}
        className="nav-logo-button"
        title={showBreadcrumbs ? "Hide navigation" : "Show navigation"}
      >
        <img 
          src="/eten-lab-icon.png" 
          alt="ETEN Innovation Lab" 
          style={{ 
            height: "32px", 
            width: "auto",
            objectFit: "contain"
          }} 
        />
      </button>

      {/* Navigation Breadcrumbs - Hidden by default, shown when logo is clicked */}
      {showBreadcrumbs && (
        <div style={{ flex: 1, minWidth: "300px" }}>
          <NavigationBreadcrumbs onOpenWizard={onOpenWizard} />
        </div>
      )}

      {/* Theme Toggle */}
      <ThemeToggle />
    </nav>
    </>
  );
}
