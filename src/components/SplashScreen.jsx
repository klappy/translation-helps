/**
 * SplashScreen.jsx
 * An interactive slideshow splash screen showcasing Translation Helps innovations
 * Self-contained, antifragile component with theme support
 */

import React, { useEffect, useState } from 'react';
import styles from './SplashScreen.module.css';

// Slide content - proving "overlooked" concepts
const slides = [
  {
    id: 'welcome',
    type: 'hero',
    content: {
      logo: 'TH',
      title: 'Translation Helps',
      subtitle: 'ETEN Innovation Lab',
      tagline: 'Proving "Overlooked" Concepts in Bible Translation Technology',
      cta: 'Begin Journey'
    }
  },
  {
    id: 'proof-of-concept',
    type: 'feature',
    content: {
      icon: '🚀',
      title: 'Aquifer Reference Implementation',
      points: [
        'Proof of concept for Aquifer content on GitHub',
        'Showcasing future architecture possibilities',
        'Reference implementation for the Lab\'s vision',
        'Breaking barriers others said couldn\'t be broken'
      ],
      quote: 'What if flat files could be as powerful as databases?'
    }
  },
  {
    id: 'flat-files',
    type: 'breakthrough',
    content: {
      icon: '��',
      title: 'They Said Flat Files Were Dead',
      subtitle: 'We Proved Them Wrong',
      achievements: [
        { icon: '⚡', text: 'Lightning-fast performance' },
        { icon: '🔗', text: 'Fully interlinkable content' },
        { icon: '🌐', text: 'Dynamic cross-references' },
        { icon: '📊', text: 'Real-time data access' }
      ],
      impact: 'Flat files can be fast, dynamic, and interconnected!'
    }
  },
  {
    id: 'multi-org',
    type: 'feature',
    content: {
      icon: '🤝',
      title: 'Cross-Organization Magic',
      points: [
        'Mix resources from unfoldingWord, Door43, and more',
        'Seamless integration across organizational boundaries',
        'Unified experience from distributed sources',
        'Breaking down silos in Bible translation'
      ],
      visual: 'orgLogos'
    }
  },
  {
    id: 'ai-revolution',
    type: 'showcase',
    content: {
      icon: '🤖',
      title: 'AI That Actually Works',
      subtitle: 'On a Shoestring Budget!',
      features: [
        { emoji: '🎯', title: 'Accurate Quotes', desc: 'AI quotes scripture precisely' },
        { emoji: '🤔', title: 'Honest Limitations', desc: 'Admits when it doesn\'t know' },
        { emoji: '💰', title: 'Budget-Friendly', desc: 'No expensive retraining needed' },
        { emoji: '📚', title: 'Dynamic Learning', desc: 'Reads flat files on-the-fly' }
      ]
    }
  },
  {
    id: 'no-servers',
    type: 'breakthrough',
    content: {
      icon: '☁️',
      title: 'Serverless Architecture',
      subtitle: 'They Said We Needed Complex Infrastructure',
      achievements: [
        { icon: '🚫', text: 'No extra servers running' },
        { icon: '💸', text: 'Minimal operational costs' },
        { icon: '🔧', text: 'Simple deployment' },
        { icon: '♾️', text: 'Infinite scalability' }
      ],
      impact: 'All powered by static files and edge functions!'
    }
  },
  {
    id: 'multimedia',
    type: 'showcase',
    content: {
      icon: '🎨',
      title: 'Rich Multimedia Experience',
      features: [
        { emoji: '🗺️', title: 'FIA Maps', desc: 'Interactive biblical geography' },
        { emoji: '🖼️', title: 'FIA Images', desc: 'Visual context for scripture' },
        { emoji: '📖', title: 'Scripture Text', desc: 'Multiple translations side-by-side' },
        { emoji: '💬', title: 'AI Context', desc: 'Intelligent assistance on demand' }
      ],
      highlight: 'Bringing the Bible to life with rich media!'
    }
  },
  {
    id: 'limitations',
    type: 'honest',
    content: {
      icon: '⚖️',
      title: 'Honest About Limitations',
      subtitle: 'This Won\'t Solve Everything, But...',
      points: [
        'Not for every use case - and that\'s okay',
        'Proves architectural approaches work',
        'Opens doors for future innovation',
        'Shows what\'s possible with creativity'
      ],
      message: 'Sometimes proving it\'s possible is the first step to making it practical.'
    }
  },
  {
    id: 'get-started',
    type: 'cta',
    content: {
      icon: '🎯',
      title: 'Ready to Explore?',
      subtitle: 'See These Innovations in Action',
      features: [
        '📖 Browse Scripture',
        '📝 Access Translation Notes',
        '❓ Explore Translation Questions',
        '🔤 Study Translation Words',
        '🗺️ View Biblical Maps',
        '💬 Chat with AI Assistant'
      ],
      cta: 'Start Exploring',
      skip: 'Skip to App'
    }
  }
];

export function SplashScreen({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('entering');
  const [slideDirection, setSlideDirection] = useState('forward');

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setSlideDirection('forward');
      setAnimationPhase('exiting');
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setAnimationPhase('entering');
      }, 300);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setSlideDirection('backward');
      setAnimationPhase('exiting');
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setAnimationPhase('entering');
      }, 300);
    }
  };

  const handleComplete = () => {
    setAnimationPhase('exiting');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };

  const renderSlide = (slide) => {
    switch (slide.type) {
      case 'hero':
        return (
          <div className={styles.heroSlide}>
            <div className={styles.logoContainer}>
              <div className={styles.logo}>
                <span className={styles.logoText}>{slide.content.logo}</span>
              </div>
            </div>
            <h1 className={styles.title}>{slide.content.title}</h1>
            <div className={styles.subtitle}>{slide.content.subtitle}</div>
            <p className={styles.tagline}>{slide.content.tagline}</p>
            <button className={styles.ctaButton} onClick={handleNext}>
              {slide.content.cta}
              <svg className={styles.ctaArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        );

      case 'feature':
        return (
          <div className={styles.featureSlide}>
            <div className={styles.featureIcon}>{slide.content.icon}</div>
            <h2 className={styles.featureTitle}>{slide.content.title}</h2>
            <ul className={styles.featurePoints}>
              {slide.content.points.map((point, index) => (
                <li key={index} className={styles.featurePoint}>
                  <span className={styles.checkmark}>✓</span>
                  {point}
                </li>
              ))}
            </ul>
            {slide.content.quote && (
              <p className={styles.featureQuote}>"{slide.content.quote}"</p>
            )}
          </div>
        );

      case 'breakthrough':
        return (
          <div className={styles.breakthroughSlide}>
            <div className={styles.breakthroughIcon}>{slide.content.icon}</div>
            <h2 className={styles.breakthroughTitle}>{slide.content.title}</h2>
            {slide.content.subtitle && (
              <p className={styles.breakthroughSubtitle}>{slide.content.subtitle}</p>
            )}
            <div className={styles.achievementsGrid}>
              {slide.content.achievements.map((achievement, index) => (
                <div key={index} className={styles.achievementCard}>
                  <span className={styles.achievementIcon}>{achievement.icon}</span>
                  <span className={styles.achievementText}>{achievement.text}</span>
                </div>
              ))}
            </div>
            {slide.content.impact && (
              <p className={styles.impactStatement}>{slide.content.impact}</p>
            )}
          </div>
        );

      case 'showcase':
        return (
          <div className={styles.showcaseSlide}>
            <div className={styles.showcaseIcon}>{slide.content.icon}</div>
            <h2 className={styles.showcaseTitle}>{slide.content.title}</h2>
            {slide.content.subtitle && (
              <p className={styles.showcaseSubtitle}>{slide.content.subtitle}</p>
            )}
            <div className={styles.showcaseGrid}>
              {slide.content.features.map((feature, index) => (
                <div key={index} className={styles.showcaseCard}>
                  <div className={styles.showcaseEmoji}>{feature.emoji}</div>
                  <h3 className={styles.showcaseFeatureTitle}>{feature.title}</h3>
                  <p className={styles.showcaseFeatureDesc}>{feature.desc}</p>
                </div>
              ))}
            </div>
            {slide.content.highlight && (
              <p className={styles.highlightText}>{slide.content.highlight}</p>
            )}
          </div>
        );

      case 'honest':
        return (
          <div className={styles.honestSlide}>
            <div className={styles.honestIcon}>{slide.content.icon}</div>
            <h2 className={styles.honestTitle}>{slide.content.title}</h2>
            <p className={styles.honestSubtitle}>{slide.content.subtitle}</p>
            <ul className={styles.honestPoints}>
              {slide.content.points.map((point, index) => (
                <li key={index} className={styles.honestPoint}>{point}</li>
              ))}
            </ul>
            <p className={styles.honestMessage}>{slide.content.message}</p>
          </div>
        );

      case 'cta':
        return (
          <div className={styles.ctaSlide}>
            <div className={styles.ctaIcon}>{slide.content.icon}</div>
            <h2 className={styles.ctaTitle}>{slide.content.title}</h2>
            <p className={styles.ctaSubtitle}>{slide.content.subtitle}</p>
            <div className={styles.ctaFeatures}>
              {slide.content.features.map((feature, index) => (
                <div key={index} className={styles.ctaFeature}>{feature}</div>
              ))}
            </div>
            <div className={styles.ctaButtons}>
              <button className={styles.primaryCta} onClick={handleComplete}>
                {slide.content.cta}
              </button>
              <button className={styles.secondaryCta} onClick={handleComplete}>
                {slide.content.skip}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${styles.splashContainer} ${styles[animationPhase]}`}>
      {/* Background animation */}
      <div className={styles.backgroundPattern}>
        <div className={styles.floatingElement1}></div>
        <div className={styles.floatingElement2}></div>
        <div className={styles.floatingElement3}></div>
      </div>

      {/* Slide content */}
      <div className={`${styles.slideContainer} ${styles[slideDirection]}`}>
        {renderSlide(slides[currentSlide])}
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        {currentSlide > 0 && (
          <button className={styles.navButton} onClick={handlePrevious} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div className={styles.slideIndicators}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
              onClick={() => {
                setSlideDirection(index > currentSlide ? 'forward' : 'backward');
                setAnimationPhase('exiting');
                setTimeout(() => {
                  setCurrentSlide(index);
                  setAnimationPhase('entering');
                }, 300);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {currentSlide < slides.length - 1 && (
          <button className={styles.navButton} onClick={handleNext} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Skip button */}
      <button 
        className={styles.skipButton}
        onClick={handleComplete}
        aria-label="Skip presentation"
      >
        Skip presentation
      </button>

      {/* Keyboard hints */}
      <div className={styles.keyboardHints}>
        <span>←→ Navigate</span>
        <span>Space Next</span>
        <span>Esc Skip</span>
      </div>
    </div>
  );
}
