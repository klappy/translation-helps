/**
 * DevelopmentReminder.jsx
 * A persistent reminder banner for active development tasks
 * Only shows in development mode
 */

import React, { useState, useEffect } from 'react';
import styles from './DevelopmentReminder.module.css';

export function DevelopmentReminder() {
  const [isVisible, setIsVisible] = useState(true);
  const showcaseProgress = 100; // 🎉 COMPLETE! 
  const currentTask = "🎉 SHOWCASE COMPLETE! Translation Helps documentation showcase is live!";

  // Only show in development  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Uncomment the line below to disable the reminder completely:
  // return null;

  // Load dismissed state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('showcase-reminder-dismissed');
    const dismissedDate = localStorage.getItem('showcase-reminder-dismissed-date');
    const today = new Date().toDateString();
    
    // Reset visibility each day
    if (dismissedDate !== today) {
      setIsVisible(true);
      localStorage.removeItem('showcase-reminder-dismissed');
    } else if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('showcase-reminder-dismissed', 'true');
    localStorage.setItem('showcase-reminder-dismissed-date', new Date().toDateString());
  };

  if (!isVisible) return null;

  return (
    <div className={styles.developmentReminder}>
      <div className={styles.header}>
        <span className={styles.icon}>🎉</span>
        <h4>Showcase Complete!</h4>
        <span className={styles.progress}>{showcaseProgress}%</span>
      </div>
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${showcaseProgress}%` }}
        ></div>
      </div>
      
      <div className={styles.details}>
        <p className={styles.taskDescription}>
          {currentTask}
        </p>
        
        <div className={styles.completedMilestones}>
          <span className={styles.milestone}>✅ Phase 1: Foundation</span>
          <span className={styles.milestone}>✅ Phase 2: Technical Content</span>
          <span className={styles.milestone}>✅ Innovation: FIA, LLM, RC Links</span>
          <span className={styles.milestone}>✅ Metrics: Complete dashboard</span>
        </div>
        
        <div className={styles.actions}>
          <a href="/showcase" className={styles.viewLink}>
            View Showcase
          </a>
          <button 
            onClick={handleDismiss}
            className={styles.dismissButton}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
