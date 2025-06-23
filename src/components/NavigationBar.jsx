/**
 * NavigationBar.jsx
 * Enhanced application header with professional ETEN Lab styling
 */

import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./NavigationBar.module.css";

export function NavigationBar() {
  return (
    <nav className={styles.navigationBar}>
      {/* Logo Section */}
      <div className={styles.logoContainer}>
        <img 
          src="/eten-lab-icon.png" 
          alt="ETEN Innovation Lab" 
          className={styles.logoIcon}
        />
        <div>
          <h1 className={styles.logoText}>
            Translation Helps
          </h1>
          <p className={styles.logoSubtext}>
            ETEN Innovation Lab
          </p>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className={styles.navigationActions}>
        <ThemeToggle />
      </div>
    </nav>
  );
}
