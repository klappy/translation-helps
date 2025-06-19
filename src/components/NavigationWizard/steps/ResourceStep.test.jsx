/**
 * ResourceStep.test.jsx
 * Tests for the enhanced ResourceStep component with cross-organization support
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ResourceStep } from './ResourceStep';

// Mock the services
vi.mock('../../../services/catalogService', () => ({
  searchResourcesAcrossOrgs: vi.fn(),
  analyzeResourceCompatibility: vi.fn(),
}));

vi.mock('../../../hooks/useResources', () => ({
  useResources: vi.fn(),
}));

// Mock the components
vi.mock('../SearchableGrid', () => ({
  SearchableGrid: ({ items, onItemSelect, isLoading, error }) => (
    <div data-testid="searchable-grid">
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {items?.map(item => (
        <button
          key={item.id}
          onClick={() => onItemSelect(item)}
          data-testid={`resource-${item.id}`}
        >
          {item.title}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../components/ResourceCard', () => ({
  ResourceCard: ({ title, onClick, selected }) => (
    <button
      onClick={onClick}
      data-testid={`resource-card-${title}`}
      data-selected={selected}
    >
      {title}
    </button>
  ),
}));

vi.mock('../components/CompatibilityWarnings', () => ({
  CompatibilityWarnings: ({ analysis }) => (
    <div data-testid="compatibility-warnings">
      Compatibility Score: {analysis?.score || 0}%
    </div>
  ),
}));

vi.mock('../components/OrganizationResourceGroup', () => ({
  OrganizationResourceGroup: ({ organization, resources, onResourceSelect }) => (
    <div data-testid={`org-group-${organization}`}>
      <h3>{organization}</h3>
      {resources.map(resource => (
        <button
          key={resource.id}
          onClick={() => onResourceSelect(resource)}
          data-testid={`org-resource-${resource.id}`}
        >
          {resource.title}
        </button>
      ))}
    </div>
  ),
}));

// Mock imports
import { searchResourcesAcrossOrgs, analyzeResourceCompatibility } from '../../../services/catalogService';
import { useResources } from '../../../hooks/useResources';

describe('ResourceStep', () => {
  const mockProps = {
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    onStepChange: vi.fn(),
    isDesktop: false,
    wizardData: {
      organization: 'unfoldingWord',
      languageId: 'en',
      resourceId: null,
      mixedResources: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Mode', () => {
    beforeEach(() => {
      useResources.mockReturnValue({
        resources: [
          {
            id: 'ult',
            name: 'unfoldingWord Literal Text',
            description: 'A literal Bible translation',
            subject: 'Bible',
          },
          {
            id: 'ust',
            name: 'unfoldingWord Simplified Text',
            description: 'A simplified Bible translation',
            subject: 'Bible',
          },
        ],
        loading: false,
        error: null,
      });
    });

    it('renders basic mode correctly', () => {
      render(<ResourceStep {...mockProps} advancedMode={false} />);

      expect(screen.getByText('Choose Resource')).toBeInTheDocument();
      expect(screen.getByText('Select the Bible translation resource you want to access.')).toBeInTheDocument();
      expect(screen.getByTestId('searchable-grid')).toBeInTheDocument();
    });

    it('handles resource selection in basic mode', () => {
      render(<ResourceStep {...mockProps} advancedMode={false} />);

      const resourceButton = screen.getByTestId('resource-ult');
      fireEvent.click(resourceButton);

      expect(mockProps.onStepChange).toHaveBeenCalledWith(3, { resourceId: 'ult' });
    });

    it('disables continue button when no resource selected', () => {
      render(<ResourceStep {...mockProps} advancedMode={false} />);

      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeDisabled();
    });

    it('enables continue button when resource selected', () => {
      const propsWithResource = {
        ...mockProps,
        wizardData: { ...mockProps.wizardData, resourceId: 'ult' },
      };

      render(<ResourceStep {...propsWithResource} advancedMode={false} />);

      const continueButton = screen.getByText('Continue');
      expect(continueButton).not.toBeDisabled();
    });
  });

  describe('Advanced Mode', () => {
    beforeEach(() => {
      searchResourcesAcrossOrgs.mockImplementation((languageId, resourceType) => {
        const mockResources = {
          'unfoldingWord': [
            {
              id: 'ult',
              combinedId: 'unfoldingWord/ult',
              name: 'unfoldingWord Literal Text',
              description: 'A literal Bible translation',
              subject: 'Bible',
            },
          ],
          'Door43-Catalog': [
            {
              id: 'ulb',
              combinedId: 'Door43-Catalog/ulb',
              name: 'unfoldingWord Literal Bible',
              description: 'Another literal translation',
              subject: 'Bible',
            },
          ],
        };
        return Promise.resolve(mockResources);
      });

      analyzeResourceCompatibility.mockReturnValue({
        score: 85,
        warnings: [],
        recommendations: ['These resources work well together'],
        organizations: ['unfoldingWord', 'Door43-Catalog'],
        resourceTypes: ['Bible Translation'],
      });
    });

    it('renders advanced mode correctly', async () => {
      render(<ResourceStep {...mockProps} advancedMode={true} />);

      expect(screen.getByText('Choose Mixed Resources')).toBeInTheDocument();
      expect(screen.getByText('Select resources from different organizations to create your custom resource collection.')).toBeInTheDocument();

      // Wait for cross-org resources to load
      await waitFor(() => {
        expect(screen.getByTestId('org-group-unfoldingWord')).toBeInTheDocument();
        expect(screen.getByTestId('org-group-Door43-Catalog')).toBeInTheDocument();
      });
    });

    it('shows search input in advanced mode', () => {
      render(<ResourceStep {...mockProps} advancedMode={true} />);

      const searchInput = screen.getByPlaceholderText('Search resources across organizations...');
      expect(searchInput).toBeInTheDocument();
    });

    it('handles resource selection in advanced mode', async () => {
      render(<ResourceStep {...mockProps} advancedMode={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('org-resource-unfoldingWord/ult')).toBeInTheDocument();
      });

      const resourceButton = screen.getByTestId('org-resource-unfoldingWord/ult');
      fireEvent.click(resourceButton);

      expect(mockProps.onStepChange).toHaveBeenCalledWith(2, expect.objectContaining({
        mixedResources: expect.objectContaining({
          scripture: expect.objectContaining({
            organization: 'unfoldingWord',
            resourceId: 'ult',
            name: 'unfoldingWord Literal Text',
            combinedId: 'unfoldingWord/ult',
          }),
        }),
        resourceOrganization: 'unfoldingWord',
      }));
    });

    it('shows selected resources summary', async () => {
      const propsWithMixedResources = {
        ...mockProps,
        wizardData: {
          ...mockProps.wizardData,
          mixedResources: {
            scripture: {
              organization: 'unfoldingWord',
              resourceId: 'ult',
              name: 'unfoldingWord Literal Text',
              combinedId: 'unfoldingWord/ult',
            },
          },
        },
      };

      render(<ResourceStep {...propsWithMixedResources} advancedMode={true} />);

      await waitFor(() => {
        expect(screen.getByText('Selected Resources')).toBeInTheDocument();
        expect(screen.getByText('unfoldingWord Literal Text')).toBeInTheDocument();
        expect(screen.getByText('(unfoldingWord)')).toBeInTheDocument();
      });
    });

    it('shows compatibility warnings when resources selected', async () => {
      const propsWithMixedResources = {
        ...mockProps,
        wizardData: {
          ...mockProps.wizardData,
          mixedResources: {
            scripture: {
              organization: 'unfoldingWord',
              resourceId: 'ult',
              name: 'unfoldingWord Literal Text',
              combinedId: 'unfoldingWord/ult',
            },
            tn: {
              organization: 'Door43-Catalog',
              resourceId: 'tn',
              name: 'Translation Notes',
              combinedId: 'Door43-Catalog/tn',
            },
          },
        },
      };

      render(<ResourceStep {...propsWithMixedResources} advancedMode={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('compatibility-warnings')).toBeInTheDocument();
        expect(screen.getByText('Compatibility Score: 85%')).toBeInTheDocument();
      });
    });

    it('enables continue button when mixed resources selected', () => {
      const propsWithMixedResources = {
        ...mockProps,
        wizardData: {
          ...mockProps.wizardData,
          mixedResources: {
            scripture: {
              organization: 'unfoldingWord',
              resourceId: 'ult',
              name: 'unfoldingWord Literal Text',
              combinedId: 'unfoldingWord/ult',
            },
          },
        },
      };

      render(<ResourceStep {...propsWithMixedResources} advancedMode={true} />);

      const continueButton = screen.getByText('Continue');
      expect(continueButton).not.toBeDisabled();
    });

    it('handles resource deselection', async () => {
      const propsWithMixedResources = {
        ...mockProps,
        wizardData: {
          ...mockProps.wizardData,
          mixedResources: {
            scripture: {
              organization: 'unfoldingWord',
              resourceId: 'ult',
              name: 'unfoldingWord Literal Text',
              combinedId: 'unfoldingWord/ult',
            },
          },
        },
      };

      render(<ResourceStep {...propsWithMixedResources} advancedMode={true} />);

      await waitFor(() => {
        expect(screen.getByText('Selected Resources')).toBeInTheDocument();
      });

      const deselectButton = screen.getByTitle('Remove this resource');
      fireEvent.click(deselectButton);

      expect(mockProps.onStepChange).toHaveBeenCalledWith(2, expect.objectContaining({
        mixedResources: expect.objectContaining({
          scripture: null,
        }),
      }));
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state in basic mode', () => {
      useResources.mockReturnValue({
        resources: [],
        loading: true,
        error: null,
      });

      render(<ResourceStep {...mockProps} advancedMode={false} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows error state in basic mode', () => {
      useResources.mockReturnValue({
        resources: [],
        loading: false,
        error: 'Failed to load resources',
      });

      render(<ResourceStep {...mockProps} advancedMode={false} />);

      expect(screen.getByText('Error: Failed to load resources')).toBeInTheDocument();
    });

    it('shows loading state in advanced mode', () => {
      render(<ResourceStep {...mockProps} advancedMode={true} />);

      expect(screen.getByText('Loading resources from all organizations...')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('calls onPrevious when back button clicked', () => {
      render(<ResourceStep {...mockProps} advancedMode={false} />);

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(mockProps.onPrevious).toHaveBeenCalled();
    });

    it('calls onNext when continue button clicked and resource selected', () => {
      const propsWithResource = {
        ...mockProps,
        wizardData: { ...mockProps.wizardData, resourceId: 'ult' },
      };

      render(<ResourceStep {...propsWithResource} advancedMode={false} />);

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      expect(mockProps.onNext).toHaveBeenCalled();
    });
  });
}); 