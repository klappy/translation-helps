/**
 * ThemeSystemDemo.jsx
 * Live demonstration of the theme system
 * Used in showcase and for isolated Playwright testing
 */

import React, { useState } from 'react';
import styles from './ThemeSystemDemo.module.css';

export function ThemeSystemDemo() {
  const [currentTheme, setCurrentTheme] = useState('light');

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div 
      className={`${styles.demoContainer} ${styles[currentTheme]}`}
      data-testid="theme-system-demo"
    >
      <div className={styles.demoPanel}>
        <h3 className={styles.demoTitle}>Live Theme System Demo</h3>
        
        <div className={styles.themeControls}>
          <button 
            onClick={toggleTheme}
            className={styles.themeToggle}
            data-testid="theme-toggle-button"
          >
            Switch to {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          
          <div className={styles.currentTheme} data-testid="current-theme">
            Current Theme: <strong>{currentTheme}</strong>
          </div>
        </div>

        <div className={styles.demoContent}>
          <div className={styles.sampleCard}>
            <h4>Sample Content Card</h4>
            <p>This card demonstrates how our theme system affects all UI elements seamlessly.</p>
            
            <div className={styles.sampleElements}>
              <button className={styles.primaryButton} data-testid="primary-button">
                Primary Action
              </button>
              <button className={styles.secondaryButton} data-testid="secondary-button">
                Secondary Action  
              </button>
            </div>
          </div>

          <div className={styles.colorPalette}>
            <h4>Active Color Palette</h4>
            <div className={styles.colorSwatch}>
              <div className={styles.colorItem}>
                <div className={styles.colorBox} style={{backgroundColor: 'var(--primary-color)'}}></div>
                <span>Primary</span>
              </div>
              <div className={styles.colorItem}>
                <div className={styles.colorBox} style={{backgroundColor: 'var(--background-color)'}}></div>
                <span>Background</span>
              </div>
              <div className={styles.colorItem}>
                <div className={styles.colorBox} style={{backgroundColor: 'var(--text-color)'}}></div>
                <span>Text</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 