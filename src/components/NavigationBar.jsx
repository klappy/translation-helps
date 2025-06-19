/**
 * NavigationBar.jsx
 * Application header with logo and theme toggle
 */

import React from "react";
import { ThemeToggle } from "./ThemeToggle";

export function NavigationBar() {
  return (
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
      {/* Logo */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        flexShrink: 0,
      }}>
        <img 
          src="/eten-lab-icon.png" 
          alt="ETEN Innovation Lab" 
          style={{ 
            height: "32px", 
            width: "auto",
            objectFit: "contain"
          }} 
        />
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />
    </nav>
  );
}
