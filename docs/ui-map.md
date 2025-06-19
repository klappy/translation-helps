# 🗺️ UI Map: ETEN Innovation Lab Translation Helps

This document explains the layout and function of each major area of the user interface.

---

## 🧭 Screen Regions and Roles

| Area                          | Description                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Navigation Bar**            | Compact header with ETEN Lab logo button, collapsible breadcrumbs, and theme toggle                         |
| **Logo Button**               | Clickable ETEN Lab logo that toggles breadcrumb navigation visibility                                        |
| **Navigation Breadcrumbs**    | Collapsible breadcrumb display showing organization, language, resource, book, and chapter:verse (hidden by default) |
| **Theme Toggle**              | Button to switch between dark/light themes with green icons                                                   |
| **Navigation Wizard**         | Modal step-by-step wizard for guided selection of organization, language, resource, book, and chapter/verse   |
| **Scripture Panel**           | Main area showing selected scripture content                                                                  |
| **Helps Panel**               | Side or bottom panel with tabs for Notes, Words, Questions                                                    |
| **Translation Notes Table**   | Structured view showing filtered tN rows for the verse                                                        |
| **Translation Words**         | Displays articles linked by TWL via `rc://` references                                                        |
| **Translation Questions**     | Questions table linked to verse from tQ                                                                       |
| **Verse Tabs / Panels**       | Each verse expands into an area showing all applicable helps                                                  |

---

## 📌 User Actions and Their Effects

| Action                      | Result                                           |
| --------------------------- | ------------------------------------------------ |
| Click ETEN Lab logo         | Toggles breadcrumb navigation visibility         |
| Click theme toggle          | Switches between dark and light themes           |
| Select book/chapter/verse   | Loads scripture and fetches relevant tN, tQ, TWL |
| Click on a translation word | Loads tW article content in side panel           |
| Toggle between tabs         | Switches between notes, questions, words, etc.   |
| Open navigation wizard      | Launches step-by-step guided selection process   |
| Click breadcrumb element    | Opens wizard at specific step for quick editing  |
| Reset session               | Clears context and reinitializes app state       |

---

## 🔗 Component Overview (Frontend)

- `App` → top-level application shell with context providers
- `MainView` → main layout orchestrating all panels
- `NavigationBar` → Compact header with ETEN Lab logo button, collapsible breadcrumbs, and theme toggle
- `NavigationBreadcrumbs` → Collapsible breadcrumb navigation display (hidden by default)
- `ThemeToggle` → Theme switching component with green icons and localStorage persistence
- `NavigationWizard` → modal step-by-step selection wizard
- `ScripturePanel` → displays selected scripture text
- `HelpsTabs` → tabbed interface for translation helps
- `TranslationNotesPanel`, `TranslationWordsPanel`, `TranslationQuestionsPanel`, `TWLPanel` → individual help type displays
- `VerseTabs` → verse-specific navigation
- `VerseView` → individual verse display component
- `ReferenceContext`, `ManifestsContext`, `ResourcesContext` → React context providers for state management

The application is built with React 18, React Context + Hooks, and follows modern component patterns with comprehensive test coverage.
