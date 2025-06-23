/**
 * SplashScreen.jsx
 * An awesome, clean splash screen that introduces the Translation Helps app
 * Self-contained, antifragile component with theme support
 */

import React, { useEffect, useState } from 'react';
import styles from './SplashScreen.module.css';

// Animation sequences for staggered reveals
const ANIMATION_DELAYS = {
  logo: 0,
  title: 200,
  tagline: 400,
  features: 600,
  cta: 1200
};

export function SplashScreen({ onComplete }) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [splashContent, setSplashContent] = useState(null);
  const [animationPhase, setAnimationPhase] = useState('entering');

  // Load splash content from markdown
  useEffect(() => {
    fetch('/docs/splash-content.md')
      .then(res => res.text())
      .then(text => {
        // Parse markdown sections
        const sections = {};
        const lines = text.split('\n');
        let currentSection = null;
        let currentContent = [];

        lines.forEach(line => {
          if (line.startsWith('## ')) {
            if (currentSection) {
              sections[currentSection] = currentContent.join('\n').trim();
            }
            currentSection = line.substring(3).toLowerCase().replace(/\s+/g, '-');
            currentContent = [];
          } else if (line.startsWith('### ')) {
            if (currentSection) {
              sections[currentSection] = currentContent.join('\n').trim();
            }
            currentSection = line.substring(4).toLowerCase().replace(/\s+/g, '-');
            currentContent = [];
          } else {
            currentContent.push(line);
          }
        });

        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }

        setSplashContent(sections);
      })
      .catch(err => {
        console.error('Failed to load splash content:', err);
        // Fallback content
        setSplashContent({
          'welcome-to-the-future-of-bible-translation': 'Empowering translators worldwide with instant access to comprehensive Bible translation resources.',
          'key-features': '📖 Scripture Panel\n📝 Translation Notes\n❓ Translation Questions\n🔤 Translation Words\n🔗 Translation Word Links\n💬 AI Assistant'
        });
      });
  }, []);

  // Start animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle skip/continue
  const handleContinue = () => {
    setAnimationPhase('exiting');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };

  // Parse feature list from markdown
  const parseFeatures = (featuresText) => {
    if (!featuresText) return [];
    
    return featuresText
      .split('\n')
      .filter(line => line.trim().startsWith('####'))
      .map(line => {
        const match = line.match(/####\s*(.+?)\s*(.+)/);
        if (match) {
          const [, emoji, text] = match;
          return { emoji, text };
        }
        return null;
      })
      .filter(Boolean);
  };

  if (!splashContent) {
    return <div className={styles.splashLoading}>Loading...</div>;
  }

  const features = parseFeatures(splashContent['key-features']);

  return (
    <div className={`${styles.splashContainer} ${styles[animationPhase]}`}>
      <div className={styles.backgroundPattern}>
        {/* Animated background elements */}
        <div className={styles.floatingElement1}></div>
        <div className={styles.floatingElement2}></div>
        <div className={styles.floatingElement3}></div>
      </div>

      <div className={styles.content}>
        {/* Logo and Title Section */}
        <div 
          className={`${styles.header} ${showContent ? styles.visible : ''}`}
          style={{ animationDelay: `${ANIMATION_DELAYS.logo}ms` }}
        >
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <span className={styles.logoText}>TH</span>
            </div>
          </div>
          <h1 className={styles.title}>Translation Helps</h1>
          <div className={styles.brandLine}>
            <span className={styles.brandText}>ETEN Innovation Lab</span>
          </div>
        </div>

        {/* Tagline */}
        <p 
          className={`${styles.tagline} ${showContent ? styles.visible : ''}`}
          style={{ animationDelay: `${ANIMATION_DELAYS.tagline}ms` }}
        >
          {splashContent['welcome-to-the-future-of-bible-translation']}
        </p>

        {/* Features Grid */}
        <div 
          className={`${styles.featuresGrid} ${showContent ? styles.visible : ''}`}
          style={{ animationDelay: `${ANIMATION_DELAYS.features}ms` }}
        >
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={styles.featureCard}
              style={{ animationDelay: `${ANIMATION_DELAYS.features + (index * 100)}ms` }}
            >
              <span className={styles.featureEmoji}>{feature.emoji}</span>
              <span className={styles.featureText}>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* AI Badge */}
        <div 
          className={`${styles.aiBadge} ${showContent ? styles.visible : ''}`}
          style={{ animationDelay: `${ANIMATION_DELAYS.features + 600}ms` }}
        >
          <span className={styles.aiBadgeIcon}>🤖</span>
          <span className={styles.aiBadgeText}>100% AI-Built • 100% Human-Guided</span>
        </div>

        {/* CTA Button */}
        <button 
          className={`${styles.ctaButton} ${showContent ? styles.visible : ''}`}
          style={{ animationDelay: `${ANIMATION_DELAYS.cta}ms` }}
          onClick={handleContinue}
        >
          <span>Begin Exploring</span>
          <svg className={styles.ctaArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Skip link for accessibility */}
        <button 
          className={styles.skipButton}
          onClick={handleContinue}
          aria-label="Skip splash screen"
        >
          Skip intro
        </button>
      </div>

      {/* Quote footer */}
      <div 
        className={`${styles.footer} ${showContent ? styles.visible : ''}`}
        style={{ animationDelay: `${ANIMATION_DELAYS.cta + 200}ms` }}
      >
        <p className={styles.quote}>
          "Making disciples of all nations starts with His Word in every language"
        </p>
      </div>
    </div>
  );
}
