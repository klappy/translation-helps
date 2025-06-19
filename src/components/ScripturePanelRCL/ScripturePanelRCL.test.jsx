/**
 * ScripturePanelRCL.test.jsx
 * Tests for the enhanced scripture panel with custom USFM parsing
 */
import { vi } from "vitest";
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import ScripturePanelRCL from "./ScripturePanelRCL";
import { ReferenceContext } from "../../context/ReferenceContext";
import { ManifestsContext } from "../../context/MultiManifestsContext";
import * as scriptureService from "../../services/scriptureService";

// Mock the scriptureService
vi.mock("../../services/scriptureService", () => ({
  fetchBook: vi.fn(),
}));

describe("ScripturePanelRCL", () => {
  const mockReference = {
    bookId: "gen",
    chapter: 1,
    verse: 1,
  };

  const mockReferenceContext = {
    organization: "unfoldingWord",
    languageId: "en",
    resourceId: "ult",
    reference: mockReference,
    updateContext: vi.fn(),
    updateReference: vi.fn(),
    // Add the missing helper functions
    getResourceId: vi.fn((resourceType = 'scripture') => 'ult'),
    getResourceOrganization: vi.fn((resourceType = 'scripture') => 'unfoldingWord'),
    isUsingMixedOrganizations: vi.fn(() => false),
    advancedMode: false,
    resourceOrganization: null,
    mixedResources: {
      scripture: null,
      tn: null,
      tq: null,
      tw: null,
      twl: null
    },
  };

  const mockManifest = {
    projects: [
      {
        identifier: "gen",
        path: "./01-GEN.usfm",
      },
    ],
  };

  const mockManifestsContext = {
    manifests: {
      ult: mockManifest,
    },
    isLoading: false,
  };

  const mockUSFMContent = `\\id GEN
\\c 1
\\v 1 In the beginning God created the heavens and the earth.
\\v 2 The earth was without form and void, and darkness was over the face of the deep.`;

  beforeEach(() => {
    vi.clearAllMocks();
    scriptureService.fetchBook.mockResolvedValue(mockUSFMContent);
  });

  const renderWithContext = (props = {}) => {
    return render(
      <ReferenceContext.Provider value={mockReferenceContext}>
        <ManifestsContext.Provider value={mockManifestsContext}>
          <ScripturePanelRCL reference={mockReference} {...props} />
        </ManifestsContext.Provider>
      </ReferenceContext.Provider>
    );
  };

  it("renders with loading state initially", () => {
    renderWithContext();
    expect(screen.getByText("Loading scripture...")).toBeInTheDocument();
  });

  it("renders USFM content when loaded", async () => {
    renderWithContext();

    await waitFor(
      () => {
        expect(screen.getByTestId("usfm-renderer")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Check for the verse text in the DOM
    await waitFor(
      () => {
        expect(
          screen.getByText(/In the beginning God created the heavens and the earth\./)
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // The component now passes an AbortSignal, so we need to check for it
    expect(scriptureService.fetchBook).toHaveBeenCalledWith(
      expect.objectContaining({
        languageId: "en",
        resourceId: "ult",
        bookId: "gen",
        manifest: mockManifest,
        organization: "unfoldingWord",
        signal: expect.any(AbortSignal),
      })
    );
  });

  it("renders chapter title", async () => {
    renderWithContext();

    await waitFor(
      () => {
        expect(screen.getByTestId("usfm-renderer")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    
    // Check for breadcrumb navigation showing the book and chapter
    await waitFor(
      () => {
        expect(screen.getByText("Genesis")).toBeInTheDocument();
        expect(screen.getByText("1:1")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("shows guidance when no reference is selected", () => {
    renderWithContext({ reference: null });
    expect(
      screen.getByText("Please complete the selections above to view scripture.")
    ).toBeInTheDocument();
  });

  it("shows guidance when organization is missing", () => {
    const contextWithoutOrg = {
      ...mockReferenceContext,
      organization: null,
      getResourceOrganization: vi.fn(() => null),
    };

    render(
      <ReferenceContext.Provider value={contextWithoutOrg}>
        <ManifestsContext.Provider value={mockManifestsContext}>
          <ScripturePanelRCL reference={mockReference} />
        </ManifestsContext.Provider>
      </ReferenceContext.Provider>
    );

    expect(
      screen.getByText("Please select an organization from the dropdown above to view scripture.")
    ).toBeInTheDocument();
  });

  it("shows guidance when language is missing", () => {
    const contextWithoutLang = {
      ...mockReferenceContext,
      languageId: null,
    };

    render(
      <ReferenceContext.Provider value={contextWithoutLang}>
        <ManifestsContext.Provider value={mockManifestsContext}>
          <ScripturePanelRCL reference={mockReference} />
        </ManifestsContext.Provider>
      </ReferenceContext.Provider>
    );

    expect(
      screen.getByText("Please select a language from the dropdown above to view scripture.")
    ).toBeInTheDocument();
  });

  it("shows guidance when resource manifest is not available", () => {
    const contextWithoutManifest = {
      manifests: {},
      isLoading: false,
    };

    render(
      <ReferenceContext.Provider value={mockReferenceContext}>
        <ManifestsContext.Provider value={contextWithoutManifest}>
          <ScripturePanelRCL reference={mockReference} />
        </ManifestsContext.Provider>
      </ReferenceContext.Provider>
    );

    expect(
      screen.getByText(/The selected Bible resource \(ULT\) is not available/)
    ).toBeInTheDocument();
  });

  it("shows error when USFM fetch fails", async () => {
    scriptureService.fetchBook.mockRejectedValue(new Error("Network error"));

    renderWithContext();

    await waitFor(
      () => {
        expect(screen.getByText("Failed to load chapter: Network error")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("calls onVerseClick when verse is clicked", async () => {
    const mockOnVerseClick = vi.fn();
    renderWithContext({ onVerseClick: mockOnVerseClick });

    await waitFor(
      () => {
        expect(screen.getByTestId("usfm-renderer")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Wait for the first v element to appear (semantic USFM uses <v> not .verse), then simulate clicking it
    await waitFor(
      () => {
        const verseElement = document.querySelector("v");
        expect(verseElement).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    await act(async () => {
      const verseElement = document.querySelector("v");
      verseElement.click();
    });

    expect(mockOnVerseClick).toHaveBeenCalledWith(1, 1);
  });

  it("handles manifests loading state", () => {
    const loadingManifestsContext = {
      manifests: {},
      isLoading: true,
    };

    render(
      <ReferenceContext.Provider value={mockReferenceContext}>
        <ManifestsContext.Provider value={loadingManifestsContext}>
          <ScripturePanelRCL reference={mockReference} />
        </ManifestsContext.Provider>
      </ReferenceContext.Provider>
    );

    expect(screen.getByText("Loading scripture...")).toBeInTheDocument();
  });

  it("extracts chapter USFM correctly", async () => {
    const multiChapterUSFM = `\\id GEN
\\c 1
\\v 1 Chapter 1 verse 1
\\c 2
\\v 1 Chapter 2 verse 1`;

    scriptureService.fetchBook.mockResolvedValue(multiChapterUSFM);

    renderWithContext();

    await waitFor(
      () => {
        expect(screen.getByTestId("usfm-renderer")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Verify that only chapter 1 content is rendered
    await waitFor(
      () => {
        expect(screen.getByText("Chapter 1 verse 1")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.queryByText("Chapter 2 verse 1")).not.toBeInTheDocument();
  });
});
