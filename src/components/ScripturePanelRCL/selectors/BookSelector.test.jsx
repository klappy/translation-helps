/**
 * BookSelector.test.jsx
 * Tests for BookSelector component with manifest integration
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BookSelector } from './BookSelector';
import { ReferenceContext } from '../../../context/ReferenceContext';
import { ManifestsContext } from '../../../context/MultiManifestsContext';
import { extractAvailableBooks, getBookChapterCount } from '../../../services/manifestService';

// Mock the services
vi.mock('../../../services/manifestService', () => ({
  extractAvailableBooks: vi.fn(),
  getBookChapterCount: vi.fn(),
}));

// Mock data
const mockManifest = {
  projects: [
    {
      identifier: 'gen',
      title: 'Genesis',
      sort: 1,
      chapters: 50,
      path: './01-GEN.usfm'
    },
    {
      identifier: 'exo',
      title: 'Exodus', 
      sort: 2,
      chapters: 40,
      path: './02-EXO.usfm'
    },
    {
      identifier: 'mat',
      title: 'Matthew',
      sort: 40,
      chapters: 28,
      path: './40-MAT.usfm'
    }
  ]
};

const mockReferenceContext = {
  languageId: 'en',
  getResourceId: vi.fn(() => 'ult'),
  getResourceOrganization: vi.fn(() => 'unfoldingWord'),
};

const mockManifestsContext = {
  manifests: {
    'ult': mockManifest,
    'unfoldingWord/ult': mockManifest
  },
  isLoading: false,
};

const mockProps = {
  onSelect: vi.fn(),
  onBack: vi.fn(),
};

describe('BookSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithContext = (manifestsContext = mockManifestsContext) => {
    return render(
      <ReferenceContext.Provider value={mockReferenceContext}>
        <ManifestsContext.Provider value={manifestsContext}>
          <BookSelector {...mockProps} />
        </ManifestsContext.Provider>
      </ReferenceContext.Provider>
    );
  };

  it('renders loading state when manifests are loading', () => {
    renderWithContext({ manifests: {}, isLoading: true });
    
    expect(screen.getByText('Loading available books...')).toBeInTheDocument();
    expect(screen.getByText('Select Book')).toBeInTheDocument();
  });

  it('shows manifest-based book count in header when manifest is available', () => {
    vi.mocked(extractAvailableBooks).mockReturnValue([
      { id: 'gen', title: 'Genesis', chapters: 50, sort: 1 },
      { id: 'exo', title: 'Exodus', chapters: 40, sort: 2 },
      { id: 'mat', title: 'Matthew', chapters: 28, sort: 40 }
    ]);

    renderWithContext();
    
    expect(screen.getByText('(3 available)')).toBeInTheDocument();
  });

  it('displays books from manifest when available', async () => {
    vi.mocked(extractAvailableBooks).mockReturnValue([
      { id: 'gen', title: 'Genesis', chapters: 50, sort: 1 },
      { id: 'mat', title: 'Matthew', chapters: 28, sort: 40 }
    ]);

    renderWithContext();
    
    await waitFor(() => {
      expect(screen.getByText('Genesis')).toBeInTheDocument();
      expect(screen.getByText('Matthew')).toBeInTheDocument();
    });

    // Should show chapter counts from manifest
    expect(screen.getByText('(50 chapters)')).toBeInTheDocument();
    expect(screen.getByText('(28 chapters)')).toBeInTheDocument();
  });

  it('falls back to all books when no manifest is available', () => {
    vi.mocked(extractAvailableBooks).mockReturnValue([]);

    renderWithContext({ manifests: {}, isLoading: false });
    
    // Should show standard books without manifest indicator
    expect(screen.queryByText('available)')).not.toBeInTheDocument();
    expect(screen.getByText('Genesis')).toBeInTheDocument();
  });

  it('expands book to show chapters when clicked', async () => {
    vi.mocked(extractAvailableBooks).mockReturnValue([
      { id: 'gen', title: 'Genesis', chapters: 3, sort: 1 }
    ]);
    vi.mocked(getBookChapterCount).mockReturnValue(3);

    renderWithContext();
    
    const genesisButton = screen.getByText('Genesis').closest('button');
    fireEvent.click(genesisButton);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('calls onSelect when chapter is clicked', async () => {
    vi.mocked(extractAvailableBooks).mockReturnValue([
      { id: 'gen', title: 'Genesis', chapters: 2, sort: 1 }
    ]);
    vi.mocked(getBookChapterCount).mockReturnValue(2);

    renderWithContext();
    
    // Expand Genesis
    const genesisButton = screen.getByText('Genesis').closest('button');
    fireEvent.click(genesisButton);
    
    // Click chapter 1
    await waitFor(() => {
      const chapter1Button = screen.getByText('1');
      fireEvent.click(chapter1Button);
    });
    
    expect(mockProps.onSelect).toHaveBeenCalledWith({
      bookId: 'gen',
      chapter: 1
    });
  });

  it('tries multiple manifest key formats', () => {
    const manifestsWithDifferentKey = {
      manifests: {
        'unfoldingWord/ult': mockManifest
      },
      isLoading: false
    };

    vi.mocked(extractAvailableBooks).mockReturnValue([
      { id: 'gen', title: 'Genesis', chapters: 50, sort: 1 }
    ]);

    renderWithContext(manifestsWithDifferentKey);
    
    expect(screen.getByText('(1 available)')).toBeInTheDocument();
  });

  it('filters books based on search term', async () => {
    vi.mocked(extractAvailableBooks).mockReturnValue([
      { id: 'gen', title: 'Genesis', chapters: 50, sort: 1 },
      { id: 'mat', title: 'Matthew', chapters: 28, sort: 40 }
    ]);

    renderWithContext();
    
    const searchInput = screen.getByPlaceholderText('Search books...');
    fireEvent.change(searchInput, { target: { value: 'gen' } });
    
    await waitFor(() => {
      expect(screen.getByText('Genesis')).toBeInTheDocument();
      expect(screen.queryByText('Matthew')).not.toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', () => {
    renderWithContext();
    
    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);
    
    expect(mockProps.onBack).toHaveBeenCalled();
  });
}); 