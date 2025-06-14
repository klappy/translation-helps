/**
 * ReferenceSelector.jsx
 * Enhanced component for hierarchical navigation: Organization → Language → Resource → Book → Chapter → Verse
 */

import React, { useContext, useState, useEffect } from "react";
import { ReferenceContext } from "../context/ReferenceContext";
import { AVAILABLE_BOOKS } from "../utils/defaultReference";
import { useOrganizations } from "../hooks/useOrganizations";
import { useLanguages } from "../hooks/useLanguages";
import { useResources } from "../hooks/useResources";
import { getChapterCount } from "../utils/contextHelpers";

export function ReferenceSelector() {
  const { organization, languageId, resourceId, reference, updateContext } =
    useContext(ReferenceContext);

  const [chapters, setChapters] = useState([]);

  // Use hooks for dynamic data fetching
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { languages, loading: langsLoading } = useLanguages(organization);
  const { resources, loading: resourcesLoading } = useResources(organization, languageId);

  // Clear downstream options when upstream selections change
  const availableLanguages = organization ? languages : [];
  const availableResources = organization && languageId ? resources : [];
  const availableBooks = resourceId ? AVAILABLE_BOOKS : [];
  const availableChapters = reference.bookId ? chapters : [];

  // Debug logging with actual values
  const dropdownDisabled = !organization || !languageId || resourcesLoading;
  console.log("🎯 Organization:", organization);
  console.log("🎯 LanguageId:", languageId);
  console.log("🎯 ResourceId:", resourceId);
  console.log("🎯 Resources count:", resources?.length || 0);
  console.log("🎯 Resources loading:", resourcesLoading);
  console.log("🎯 Dropdown disabled:", dropdownDisabled);
  console.log("🎯 Org check (!organization):", !organization);
  console.log("🎯 Lang check (!languageId):", !languageId);
  console.log("🎯 Loading check (resourcesLoading):", resourcesLoading);

  if (resources?.length > 0) {
    console.log(
      "📋 Available resources:",
      resources.map((r) => `${r.id}: ${r.name} - ${r.description}`)
    );
    // Log the actual structure
    console.log("🔍 Resource structure:", JSON.stringify(resources[0], null, 2));
  }

  // Update chapters when book changes
  useEffect(() => {
    if (reference.bookId) {
      const chapterCount = getChapterCount(reference.bookId);
      if (chapterCount > 0) {
        const chapterList = Array.from({ length: chapterCount }, (_, i) => i + 1);
        setChapters(chapterList);
      } else {
        setChapters([]);
      }
    } else {
      setChapters([]);
    }
  }, [reference.bookId]);

  // Verse selection removed

  // Event handlers with cascading logic
  const handleOrganizationChange = (e) => {
    const newOrganization = e.target.value;
    // Organization change resets all downstream selections
    updateContext({
      organization: newOrganization,
      languageId: null,
      resourceId: null,
      reference: {
        bookId: null,
        chapter: null,
        verse: null,
      },
    });
  };

  const handleLanguageChange = (e) => {
    const newLanguageId = e.target.value;
    // Language change resets resource and reference selections
    updateContext({
      languageId: newLanguageId,
      resourceId: null,
      reference: {
        bookId: null,
        chapter: null,
        verse: null,
      },
    });
  };

  const handleResourceChange = (e) => {
    const newResourceId = e.target.value;
    // Resource change resets reference selections
    updateContext({
      resourceId: newResourceId,
      reference: {
        bookId: null,
        chapter: null,
        verse: null,
      },
    });
  };

  const handleBookChange = (e) => {
    const bookId = e.target.value;
    if (bookId) {
      updateContext({
        reference: {
          ...reference,
          bookId,
          chapter: "1",
        },
      });
    } else {
      updateContext({
        reference: {
          ...reference,
          bookId: null,
          chapter: null,
        },
      });
    }
  };

  const handleChapterChange = (e) => {
    const chapter = e.target.value;
    updateContext({
      reference: {
        ...reference,
        chapter,
      },
    });
  };

  // Common select styles
  const selectStyle = {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    fontSize: "14px",
    minWidth: "120px",
  };

  const labelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const labelTextStyle = {
    fontSize: "12px",
    color: "#666",
    fontWeight: "500",
  };

  return (
    <div
      className='reference-selector'
      data-testid='reference-selector'
      style={{
        display: "flex",
        gap: "12px",
        padding: "16px",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Organization Dropdown */}
      <label style={labelStyle}>
        <span style={labelTextStyle}>Organization</span>
        <select
          value={organization || ""}
          onChange={handleOrganizationChange}
          data-testid='organization-selector'
          style={selectStyle}
          disabled={orgsLoading}
        >
          {orgsLoading ? (
            <option>Loading...</option>
          ) : (
            organizations.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))
          )}
        </select>
      </label>

      {/* Language Dropdown */}
      <label style={labelStyle}>
        <span style={labelTextStyle}>Language</span>
        <select
          value={languageId || ""}
          onChange={handleLanguageChange}
          data-testid='language-selector'
          style={selectStyle}
          disabled={!organization || langsLoading}
        >
          {!organization ? (
            <option value=''>Select Organization</option>
          ) : langsLoading ? (
            <option>Loading...</option>
          ) : (
            <>
              <option value=''>Select Language</option>
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.code.toUpperCase()} - {lang.name}
                </option>
              ))}
            </>
          )}
        </select>
      </label>

      {/* Bible Resource Dropdown */}
      <label style={labelStyle}>
        <span style={labelTextStyle}>Bible Resource</span>
        <select
          value={resourceId || ""}
          onChange={handleResourceChange}
          data-testid='resource-selector'
          style={selectStyle}
          disabled={!organization || !languageId || resourcesLoading}
        >
          {!organization || !languageId ? (
            <option value=''>Select Language</option>
          ) : resourcesLoading ? (
            <option>Loading...</option>
          ) : (
            <>
              <option value=''>Select Bible Resource</option>
              {availableResources.map((resource) => {
                console.log("🎨 Mapping resource:", resource);
                return (
                  <option key={resource.id} value={resource.id}>
                    {resource.id.toUpperCase()} - {resource.description}
                  </option>
                );
              })}
            </>
          )}
        </select>
      </label>

      {/* Book Dropdown */}
      <label style={labelStyle}>
        <span style={labelTextStyle}>Book</span>
        <select
          value={reference.bookId || ""}
          onChange={handleBookChange}
          data-testid='book-selector'
          style={selectStyle}
          disabled={!resourceId}
        >
          {!resourceId ? (
            <option value=''>Select Resource</option>
          ) : (
            <>
              <option value=''>Select Book</option>
              {availableBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </>
          )}
        </select>
      </label>

      {/* Chapter Dropdown */}
      <label style={labelStyle}>
        <span style={labelTextStyle}>Chapter</span>
        <select
          value={reference.chapter || ""}
          onChange={handleChapterChange}
          data-testid='chapter-selector'
          style={{ ...selectStyle, minWidth: "80px" }}
          disabled={!reference.bookId}
        >
          {!reference.bookId ? (
            <option value=''>Select Book</option>
          ) : chapters.length === 0 ? (
            <option value=''>Loading...</option>
          ) : (
            availableChapters.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))
          )}
        </select>
      </label>

      {/* Verse Dropdown removed */}

      {/* Current Context Display */}
      <div
        style={{
          marginLeft: "auto",
          fontSize: "14px",
          color: "#666",
          padding: "8px 12px",
          backgroundColor: "white",
          borderRadius: "4px",
          border: "1px solid #e0e0e0",
        }}
      >
        {organization && languageId && resourceId && reference.bookId && reference.chapter
          ? `${organization}/${languageId}/${resourceId}/${reference.bookId.toUpperCase()} ${
              reference.chapter
            }`
          : "Select complete context..."}
      </div>
    </div>
  );
}
