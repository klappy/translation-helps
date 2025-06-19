/**
 * Accessibility Enhancements
 * Utilities for improving accessibility in cross-organization resource discovery
 */

/**
 * Accessible announcement system for screen readers
 */
export class AccessibilityAnnouncer {
  constructor() {
    this.announcer = null;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    // Create live region for announcements
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.setAttribute('class', 'sr-only');
    this.announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    
    document.body.appendChild(this.announcer);
  }

  announce(message, priority = 'polite') {
    if (!this.announcer) return;

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }

  announceResourceSelection(resourceName, organization, isFromMixedOrgs) {
    const mixedMessage = isFromMixedOrgs ? ' from a different organization' : '';
    this.announce(`Selected ${resourceName} from ${organization}${mixedMessage}`);
  }

  announceAdvancedModeToggle(isAdvanced) {
    const mode = isAdvanced ? 'advanced' : 'basic';
    this.announce(`Switched to ${mode} mode. ${isAdvanced ? 'You can now select resources from multiple organizations.' : 'You will select resources from a single organization.'}`);
  }

  announceCompatibilityWarning(warningCount) {
    if (warningCount > 0) {
      this.announce(`${warningCount} compatibility warning${warningCount > 1 ? 's' : ''} detected. Please review before proceeding.`, 'assertive');
    }
  }

  announceResourcesLoaded(count, organizationCount) {
    if (organizationCount > 1) {
      this.announce(`Loaded ${count} resources from ${organizationCount} organizations`);
    } else {
      this.announce(`Loaded ${count} resources`);
    }
  }
}

// Global announcer instance
export const accessibilityAnnouncer = new AccessibilityAnnouncer();

/**
 * Keyboard navigation helpers
 */
export class KeyboardNavigationManager {
  constructor() {
    this.focusableSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="option"]',
      '[role="tab"]',
      '[role="menuitem"]'
    ].join(', ');
  }

  getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(this.focusableSelectors))
      .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
  }

  trapFocus(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  createRovingTabIndex(container, itemSelector) {
    const items = Array.from(container.querySelectorAll(itemSelector));
    if (items.length === 0) return;

    let currentIndex = 0;

    // Set initial tab indices
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });

    const handleKeyDown = (e) => {
      const { key } = e;
      
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
        e.preventDefault();
        
        items[currentIndex].setAttribute('tabindex', '-1');
        
        switch (key) {
          case 'ArrowDown':
          case 'ArrowRight':
            currentIndex = (currentIndex + 1) % items.length;
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            break;
          case 'Home':
            currentIndex = 0;
            break;
          case 'End':
            currentIndex = items.length - 1;
            break;
        }
        
        items[currentIndex].setAttribute('tabindex', '0');
        items[currentIndex].focus();
      }
    };

    const handleClick = (e) => {
      const clickedItem = e.target.closest(itemSelector);
      if (clickedItem) {
        const newIndex = items.indexOf(clickedItem);
        if (newIndex !== -1) {
          items[currentIndex].setAttribute('tabindex', '-1');
          currentIndex = newIndex;
          items[currentIndex].setAttribute('tabindex', '0');
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('click', handleClick);
    };
  }
}

// Global keyboard navigation manager
export const keyboardNavigationManager = new KeyboardNavigationManager();

/**
 * Screen reader optimized content formatting
 */
export class ScreenReaderOptimizer {
  static formatResourceList(resources, includeOrganizations = true) {
    if (!resources || resources.length === 0) {
      return 'No resources available';
    }

    const resourceDescriptions = resources.map(resource => {
      const orgInfo = includeOrganizations && resource.organization 
        ? ` from ${resource.organization}` 
        : '';
      const description = resource.description 
        ? `. ${resource.description}` 
        : '';
      
      return `${resource.name}${orgInfo}${description}`;
    });

    const totalCount = resources.length;
    const orgCount = includeOrganizations 
      ? new Set(resources.map(r => r.organization)).size 
      : 1;

    const summary = includeOrganizations && orgCount > 1
      ? `${totalCount} resources from ${orgCount} organizations. `
      : `${totalCount} resources. `;

    return summary + resourceDescriptions.join('. ');
  }

  static formatCompatibilityWarnings(warnings) {
    if (!warnings || warnings.length === 0) {
      return 'No compatibility warnings';
    }

    const warningTexts = warnings.map(warning => {
      const severity = warning.severity === 'error' ? 'Error' : 
                      warning.severity === 'warning' ? 'Warning' : 'Information';
      return `${severity}: ${warning.message}. ${warning.recommendation || ''}`;
    });

    return `${warnings.length} compatibility warning${warnings.length > 1 ? 's' : ''}. ${warningTexts.join(' ')}`;
  }

  static formatStepProgress(currentStep, totalSteps, stepName) {
    return `Step ${currentStep} of ${totalSteps}: ${stepName}`;
  }
}

/**
 * Initialize all accessibility enhancements
 */
export function initializeAccessibilityEnhancements() {
  console.log('♿ Initializing accessibility enhancements');

  // Add global keyboard shortcuts
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
      // Skip to main content (Alt+1)
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        const main = document.querySelector('main, [role="main"], #main-content');
        if (main) {
          main.focus();
          main.scrollIntoView();
        }
      }

      // Skip to navigation (Alt+2)
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        const nav = document.querySelector('nav, [role="navigation"], #navigation');
        if (nav) {
          nav.focus();
          nav.scrollIntoView();
        }
      }
    });

    // Expose accessibility tools in development
    if (process.env.NODE_ENV === 'development') {
      window._accessibilityTools = {
        announcer: accessibilityAnnouncer,
        keyboardManager: keyboardNavigationManager,
        screenReader: ScreenReaderOptimizer,
        announce: (message) => accessibilityAnnouncer.announce(message),
        testKeyboardNav: (selector) => {
          const element = document.querySelector(selector);
          if (element) {
            return keyboardNavigationManager.trapFocus(element);
          }
        }
      };
    }
  }

  console.log('✅ Accessibility enhancements initialized');
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAccessibilityEnhancements);
  } else {
    initializeAccessibilityEnhancements();
  }
} 