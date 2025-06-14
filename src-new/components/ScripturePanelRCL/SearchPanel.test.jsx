/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SearchPanel from "./SearchPanel";
import { ReferenceContext } from "../../context/ReferenceContext";

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
  manifest: {
    dublin_core: { title: "unfoldingWord Literal Text", rights: "CC BY-SA 4.0" },
    version: "1",
  },
  onResultClick: vi.fn(),
};

const renderWithContext = (component, contextValue = mockContextValue) => {
  return render(
    <ReferenceContext.Provider value={contextValue}>{component}</ReferenceContext.Provider>
  );
};

describe("SearchPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search form", () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    expect(screen.getByPlaceholderText("Search scripture text...")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("shows search context with resource info", () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    expect(screen.getByText("TIT Search")).toBeInTheDocument();
    expect(screen.getByText("unfoldingword")).toBeInTheDocument();
    expect(screen.getByText("unfoldingWord Literal Text v1")).toBeInTheDocument();
    expect(screen.getByText("CC BY-SA 4.0")).toBeInTheDocument();
  });

  it("updates search term on input change", () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    expect(searchInput.value).toBe("Paul");
  });

  it("disables search button when input is empty", () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    const searchButton = screen.getByText("Search");
    expect(searchButton).toHaveAttribute("disabled");
  });

  it("enables search button when input has text", () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    const searchButton = screen.getByText("Search");
    expect(searchButton).not.toHaveAttribute("disabled");
  });

  it("shows search results when search is performed", async () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    // Wait for debounced search to complete
    await waitFor(
      () => {
        expect(screen.getByText('Found 1 result(s) for "Paul"')).toBeInTheDocument();
        expect(screen.getByText("TIT 1:1")).toBeInTheDocument();
        expect(
          screen.getByText("Paul, a servant of God and an apostle of Jesus Christ")
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("shows no results message when search finds nothing", async () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    // Wait for debounced search to complete
    await waitFor(
      () => {
        expect(screen.getByText('No results found for "nonexistent"')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("calls onResultClick when search result is clicked", async () => {
    const onResultClick = vi.fn();
    renderWithContext(<SearchPanel {...defaultProps} onResultClick={onResultClick} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    // Wait for search results
    await waitFor(
      () => {
        expect(screen.getByText('Found 1 result(s) for "Paul"')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    const resultElement = screen.getByText("Paul, a servant of God and an apostle of Jesus Christ");
    fireEvent.click(resultElement);

    expect(onResultClick).toHaveBeenCalledWith(1, 1, expect.any(Object));
  });

  it("updates reference context when search result is clicked", async () => {
    const updateReference = vi.fn();
    renderWithContext(<SearchPanel {...defaultProps} />, { updateReference });

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    // Wait for search results
    await waitFor(
      () => {
        expect(screen.getByText('Found 1 result(s) for "Paul"')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    const resultElement = screen.getByText("Paul, a servant of God and an apostle of Jesus Christ");
    fireEvent.click(resultElement);

    expect(updateReference).toHaveBeenCalledWith({ chapter: 1, verse: 1 });
  });

  it("handles case-insensitive search", async () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "PAUL" } });

    // Wait for debounced search to complete
    await waitFor(
      () => {
        expect(screen.getByText('Found 1 result(s) for "PAUL"')).toBeInTheDocument();
        expect(
          screen.getByText("Paul, a servant of God and an apostle of Jesus Christ")
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("finds text in different verses", async () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "eternal" } });

    // Wait for debounced search to complete
    await waitFor(
      () => {
        expect(screen.getByText('Found 1 result(s) for "eternal"')).toBeInTheDocument();
        expect(screen.getByText("TIT 1:2")).toBeInTheDocument();
        expect(screen.getByText("in hope of eternal life")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("submits search on form submit", async () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    const form = searchInput.closest("form");
    fireEvent.submit(form);

    // Wait for search results
    await waitFor(
      () => {
        expect(screen.getByText('Found 1 result(s) for "Paul"')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("shows searching state during debounce", async () => {
    renderWithContext(<SearchPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search scripture text...");
    fireEvent.change(searchInput, { target: { value: "Paul" } });

    // Should show searching button text briefly
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });
});
