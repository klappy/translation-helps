/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SearchPanel from "./SearchPanel";
import { ReferenceContext } from "../../context/ReferenceContext";

// Mock proskomma-react-hooks to prevent hanging
import * as proskommaHooks from "proskomma-react-hooks";
vi.mock("proskomma-react-hooks", () => ({
  useProskomma: vi.fn(),
  useImport: vi.fn(),
  useSearchForPassages: vi.fn(),
}));

const mockContextValue = {
  updateReference: vi.fn(),
};

const defaultProps = {
  org: "unfoldingword",
  lang: "en",
  abbr: "TIT",
  usfm: `\\id TIT
\\c 1
\\v 1 Paul, a servant of God and an apostle of Jesus Christ
\\v 2 in hope of eternal life`,
  onResultClick: vi.fn(),
  proskommaHook: mockUseProskomma(),
  importHook: mockUseImport({ shouldComplete: true }),
};

// Mock implementations
const mockUseProskomma = () => ({
  state: { docSetIds: ["test-docset"] },
  verbose: true,
});

const mockUseImport = (options = {}) => ({
  done: options.shouldComplete !== false,
});

const mockUseSearchForPassages = (options = {}) => ({
  loading: options.loading || false,
  passages: options.passages || [],
  errors: options.errors || [],
});

const renderWithContext = (component, contextValue = mockContextValue) => {
  return render(
    <ReferenceContext.Provider value={contextValue}>{component}</ReferenceContext.Provider>
  );
};

// Helper to merge props with required proskommaHook/importHook defaults
const withRequiredHooks = (props = {}) => ({
  ...defaultProps,
  ...props,
  proskommaHook: props.proskommaHook || mockUseProskomma(),
  importHook: props.importHook || mockUseImport({ shouldComplete: true }),
});

describe("SearchPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mocks
    proskommaHooks.useProskomma.mockImplementation(mockUseProskomma);
    proskommaHooks.useImport.mockImplementation(() => mockUseImport({ shouldComplete: true }));
    proskommaHooks.useSearchForPassages.mockImplementation(() => mockUseSearchForPassages());
  });

  it("renders search form", () => {
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);

    expect(screen.getByPlaceholderText("Search scripture text...")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("shows preparing search when import is not done", async () => {
    proskommaHooks.useImport.mockImplementation(() => mockUseImport({ shouldComplete: false }));

    renderWithContext(
      <SearchPanel
        {...withRequiredHooks({
          importHook: mockUseImport({ shouldComplete: false }),
        })}
      />
    );

    expect(screen.getByText("Preparing search...")).toBeInTheDocument();
  });

  it("updates search term on input change", () => {
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    expect(searchInput.value).toBe("Paul");
  });

  it("disables search button when input is empty", () => {
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);

    const searchButton = screen.getByText("Search");
    expect(searchButton).toHaveAttribute("disabled");
  });

  it("enables search button when input has text", () => {
    renderWithContext(<SearchPanel {...withRequiredHooks()} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    const searchButton = screen.getByText("Search");
    expect(searchButton).not.toHaveAttribute("disabled");
  });

  it("shows search results when search is performed", async () => {
    const mockResults = [
      {
        text: "Paul, a servant of God and an apostle of Jesus Christ",
        scopeLabels: ["chapter/1", "verse/1"],
      },
    ];
    proskommaHooks.useSearchForPassages.mockImplementation(() =>
      mockUseSearchForPassages({ passages: mockResults })
    );

    renderWithContext(<SearchPanel {...withRequiredHooks()} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(
      () => {
        expect(screen.getByText('Found 1 result(s) for "Paul"')).toBeInTheDocument();
        expect(screen.getByText("TIT 1:1")).toBeInTheDocument();
        expect(
          screen.getByText("Paul, a servant of God and an apostle of Jesus Christ")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("shows no results message when search finds nothing", async () => {
    proskommaHooks.useSearchForPassages.mockImplementation(() =>
      mockUseSearchForPassages({ passages: [] })
    );

    renderWithContext(<SearchPanel {...withRequiredHooks()} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(
      () => {
        expect(screen.getByText('No results found for "nonexistent"')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("calls onResultClick when search result is clicked", async () => {
    const mockResults = [
      {
        text: "Paul, a servant of God and an apostle of Jesus Christ",
        scopeLabels: ["chapter/1", "verse/1"],
      },
    ];
    proskommaHooks.useSearchForPassages.mockImplementation(() =>
      mockUseSearchForPassages({ passages: mockResults })
    );

    const onResultClick = vi.fn();
    renderWithContext(<SearchPanel {...defaultProps} onResultClick={onResultClick} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(
      () => {
        const resultElement = screen.getByText(
          "Paul, a servant of God and an apostle of Jesus Christ"
        );
        fireEvent.click(resultElement);
        expect(onResultClick).toHaveBeenCalledWith(1, 1, expect.any(Object));
      },
      { timeout: 3000 }
    );
  });

  it("updates reference context when search result is clicked", async () => {
    const mockResults = [
      {
        text: "Paul, a servant of God and an apostle of Jesus Christ",
        scopeLabels: ["chapter/1", "verse/1"],
      },
    ];
    proskommaHooks.useSearchForPassages.mockImplementation(() =>
      mockUseSearchForPassages({ passages: mockResults })
    );

    const updateReference = vi.fn();
    renderWithContext(<SearchPanel {...defaultProps} />, { updateReference });

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(
      () => {
        const resultElement = screen.getByText(
          "Paul, a servant of God and an apostle of Jesus Christ"
        );
        fireEvent.click(resultElement);
        expect(updateReference).toHaveBeenCalledWith({ chapter: 1, verse: 1 });
      },
      { timeout: 3000 }
    );
  });

  it("submits search on form submit", async () => {
    const mockResults = [
      {
        text: "Paul, a servant of God and an apostle of Jesus Christ",
        scopeLabels: ["chapter/1", "verse/1"],
      },
    ];
    proskommaHooks.useSearchForPassages.mockImplementation(() =>
      mockUseSearchForPassages({ passages: mockResults })
    );

    renderWithContext(<SearchPanel {...withRequiredHooks()} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    const form = searchInput.closest("form");
    fireEvent.submit(form);

    await waitFor(
      () => {
        expect(screen.getByText('Found 1 result(s) for "Paul"')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it.skip("shows timeout error after 5 seconds", async () => {
    // Mock a loading search that never completes
    proskommaHooks.useSearchForPassages.mockImplementation(() =>
      mockUseSearchForPassages({ loading: true })
    );

    renderWithContext(<SearchPanel {...withRequiredHooks()} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    // Submit the search form to trigger the search
    const form = searchInput.closest("form");
    fireEvent.submit(form);

    // Should show searching initially
    await waitFor(() => {
      expect(screen.getByText("Searching...")).toBeInTheDocument();
    });

    // Wait for timeout message to appear
    await waitFor(
      () => {
        expect(
          screen.getByText("Search timed out. Please try a different search term.")
        ).toBeInTheDocument();
      },
      { timeout: 6000 }
    );
  });
});
