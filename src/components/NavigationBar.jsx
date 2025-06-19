/**
 * NavigationBar.jsx
 * Application header with title and clickable navigation breadcrumbs
 */

import React, { useContext } from "react";
import { ReferenceContext } from "../context/ReferenceContext";
import { NavigationBreadcrumbs } from "./NavigationBreadcrumbs";
import { ThemeToggle } from "./ThemeToggle";

export function NavigationBar({ onOpenWizard }) {
  const { reference } = useContext(ReferenceContext);

  return (
    <nav
      style={{
        backgroundColor: "var(--color-primary)",
        color: "white",
        padding: "var(--spacing-4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)",
        flexWrap: "wrap",
        gap: "var(--spacing-4)",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "var(--font-size-2xl)", flexShrink: 0 }}>
        ETEN Innovation Lab
      </h1>

      {/* Navigation Breadcrumbs */}
      <div style={{ flex: 1, minWidth: "300px" }}>
        <NavigationBreadcrumbs onOpenWizard={onOpenWizard} />
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />
    </nav>
  );
}
