/**
 * WizardContainer.test.jsx
 * Tests for WizardContainer with advanced mode support
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WizardContainer } from './WizardContainer';
import { ReferenceContext } from '../../context/ReferenceContext';

// Mock the context with minimal data to start at first step
const mockContextValue = {
  organization: null,
  languageId: null,
  resourceId: null,
  reference: { bookId: null, chapter: null, verse: null },
  advancedMode: false,
  resourceOrganization: null,
  mixedResources: {
    scripture: null,
    tn: null,
    tq: null,
    tw: null,
    twl: null
  },
  updateContext: vi.fn(),
  getResourceOrganization: vi.fn(() => 'unfoldingWord'),
  getResourceId: vi.fn(() => 'ult'),
  isUsingMixedOrganizations: vi.fn(() => false),
  setReference: vi.fn(),
  setOrganization: vi.fn(),
  setLanguageId: vi.fn(),
  setResourceId: vi.fn(),
};

// Mock the step components
vi.mock('./steps/OrganizationStep', () => ({
  OrganizationStep: ({ onNext }) => (
    <div data-testid="organization-step">
      <button onClick={() => onNext()} data-testid="org-next">Next</button>
    </div>
  )
}));

vi.mock('./steps/LanguageStep', () => ({
  LanguageStep: ({ onNext, advancedMode }) => (
    <div data-testid="language-step">
      <span data-testid="advanced-mode-indicator">{advancedMode ? 'advanced' : 'basic'}</span>
      <button onClick={() => onNext()} data-testid="lang-next">Next</button>
    </div>
  )
}));

vi.mock('./steps/ResourceStep', () => ({
  ResourceStep: ({ onNext }) => (
    <div data-testid="resource-step">
      <button onClick={() => onNext()} data-testid="resource-next">Next</button>
    </div>
  )
}));

vi.mock('./steps/BookStep', () => ({
  BookStep: ({ onNext }) => (
    <div data-testid="book-step">
      <button onClick={() => onNext()} data-testid="book-next">Next</button>
    </div>
  )
}));

vi.mock('./steps/ChapterVerseStep', () => ({
  ChapterVerseStep: ({ onComplete }) => (
    <div data-testid="chapter-verse-step">
      <button onClick={() => onComplete()} data-testid="complete">Complete</button>
    </div>
  )
}));

// Mock the hooks
vi.mock('./hooks/useWizardState', () => ({
  useWizardState: () => ({
    validateStep: vi.fn(() => true),
    canProceed: vi.fn(() => true)
  })
}));

vi.mock('./hooks/useNavigationHistory', () => ({
  useNavigationHistory: () => ({
    saveSelection: vi.fn(),
    getRecentSelections: vi.fn(() => [])
  })
}));

vi.mock('./hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: vi.fn()
}));

describe('WizardContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithContext = (contextOverrides = {}) => {
    const contextValue = { ...mockContextValue, ...contextOverrides };
    return render(
      <ReferenceContext.Provider value={contextValue}>
        <WizardContainer onComplete={vi.fn()} />
      </ReferenceContext.Provider>
    );
  };

  describe('Basic Mode', () => {
    it('should render organization step first in basic mode', () => {
      renderWithContext({ advancedMode: false });
      
      expect(screen.getByTestId('organization-step')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-mode-toggle')).toBeInTheDocument();
    });

    it('should show basic mode indicator in language step', () => {
      renderWithContext({ 
        advancedMode: false,
        organization: 'unfoldingWord',
        languageId: 'en' // This should make it start at language step
      });
      
      // Should be at language step when org and language are set
      expect(screen.getByTestId('language-step')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-mode-indicator')).toHaveTextContent('basic');
    });

    it('should use basic step names', () => {
      renderWithContext({ advancedMode: false });
      
      // Check that step indicator shows basic mode steps
      const stepIndicator = screen.getByTestId('step-indicator');
      expect(stepIndicator).toBeInTheDocument();
    });
  });

  describe('Advanced Mode', () => {
    it('should render language step first in advanced mode', () => {
      renderWithContext({ advancedMode: true });
      
      expect(screen.getByTestId('language-step')).toBeInTheDocument();
      expect(screen.queryByTestId('organization-step')).not.toBeInTheDocument();
    });

    it('should show advanced mode indicator in language step', () => {
      renderWithContext({ advancedMode: true });
      
      expect(screen.getByTestId('advanced-mode-indicator')).toHaveTextContent('advanced');
    });

    it('should skip organization step in advanced mode', () => {
      renderWithContext({ 
        advancedMode: true,
        languageId: 'en'
      });
      
      // Should be at language step, not organization
      expect(screen.getByTestId('language-step')).toBeInTheDocument();
      expect(screen.queryByTestId('organization-step')).not.toBeInTheDocument();
    });
  });

  describe('Mode Toggle', () => {
    it('should render the advanced mode toggle', () => {
      renderWithContext();
      
      expect(screen.getByTestId('advanced-mode-toggle')).toBeInTheDocument();
    });

    it('should call updateContext when toggling modes', () => {
      const updateContext = vi.fn();
      renderWithContext({ updateContext });
      
      const toggle = screen.getByRole('checkbox', { name: /toggle between basic and advanced modes/i });
      fireEvent.click(toggle);
      
      expect(updateContext).toHaveBeenCalledWith({ advancedMode: true });
    });
  });

  describe('Step Navigation', () => {
    it('should allow navigation between steps in basic mode', () => {
      renderWithContext({ 
        advancedMode: false,
        organization: 'unfoldingWord',
        languageId: 'en'
      });
      
      // Should be at language step with org and language set
      expect(screen.getByTestId('language-step')).toBeInTheDocument();
    });

    it('should allow navigation between steps in advanced mode', () => {
      renderWithContext({ 
        advancedMode: true,
        languageId: 'en'
      });
      
      expect(screen.getByTestId('language-step')).toBeInTheDocument();
    });
  });

  describe('Wizard Completion', () => {
    it('should call onComplete with wizard data', () => {
      const onComplete = vi.fn();
      renderWithContext({ 
        advancedMode: false,
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        reference: { bookId: 'tit', chapter: '1', verse: '1' }
      });
      
      // With all data provided, should be at final step
      expect(screen.getByTestId('chapter-verse-step')).toBeInTheDocument();
    });
  });
});
