/**
 * DevelopmentReminder.jsx
 * A persistent reminder banner for active development tasks
 * Only shows in development mode
 */

import React, { useState, useEffect } from 'react';

export function DevelopmentReminder() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(10); // Update this as you make progress!

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

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
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
        🚧 Showcase Development Active!
      </div>
      <div style={{ fontSize: '14px', marginBottom: '10px' }}>
        Progress: {progress}% Complete
      </div>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.3)', 
        borderRadius: '4px', 
        height: '8px',
        marginBottom: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'white',
          height: '100%',
          width: `${progress}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
      <div style={{ fontSize: '12px', marginBottom: '10px' }}>
        📋 Today's task: Set up routing infrastructure
      </div>
      <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
        <a 
          href="/docs/showcase-implementation-plan.md" 
          style={{ color: 'white', textDecoration: 'underline' }}
          target="_blank"
        >
          View Plan
        </a>
        <button 
          onClick={handleDismiss}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Dismiss Today
        </button>
      </div>
    </div>
  );
}
