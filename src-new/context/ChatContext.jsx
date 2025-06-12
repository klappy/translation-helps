/**
 * ChatContext.jsx
 * React context for managing LLM chat state and conversation history
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  packageContext,
  sendChatMessage,
  createMockResponse,
  validateChatRequest,
} from "../services/llmChatService";
import { useReferenceContext } from "./ReferenceContext";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export function ChatProvider({ children }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentContext, setCurrentContext] = useState(null);

  // Get current reference from ReferenceContext
  const referenceContext = useReferenceContext();

  /**
   * Parses translation notes text content into structured data
   */
  const parseTranslationNotes = useCallback(
    (textContent) => {
      if (!textContent || textContent.includes("No translation notes available")) {
        return [];
      }

      const notes = [];
      const lines = textContent.split("\n").filter((line) => line.trim());

      let currentNote = null;
      let noteId = 1;

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip headers and empty lines
        if (!trimmed || trimmed === "Translation Notes") continue;

        // Check if this line looks like a quote (starts with quotes)
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          // Save previous note if exists
          if (currentNote) {
            notes.push(currentNote);
          }

          // Start new note
          currentNote = {
            id: noteId++,
            quote: trimmed.slice(1, -1), // Remove quotes
            text: "",
            occurrence: "1",
            tags: "",
            supportReference: "",
            reference: referenceContext?.reference
              ? `${referenceContext.reference.chapter}:${referenceContext.reference.verse}`
              : "",
          };
        } else if (currentNote && trimmed.startsWith("(occurrence")) {
          // Extract occurrence number
          const occurrenceMatch = trimmed.match(/occurrence\s+(\d+)/);
          if (occurrenceMatch) {
            currentNote.occurrence = occurrenceMatch[1];
          }
        } else if (currentNote && trimmed.startsWith("Tags:")) {
          currentNote.tags = trimmed.replace("Tags:", "").trim();
        } else if (currentNote && trimmed.startsWith("See also:")) {
          currentNote.supportReference = trimmed.replace("See also:", "").trim();
        } else if (currentNote && trimmed.length > 10) {
          // This is likely the note text
          if (currentNote.text) {
            currentNote.text += " " + trimmed;
          } else {
            currentNote.text = trimmed;
          }
        }
      }

      // Don't forget the last note
      if (currentNote) {
        notes.push(currentNote);
      }

      return notes;
    },
    [referenceContext?.reference]
  );

  /**
   * Parses translation questions text content into structured data
   */
  const parseTranslationQuestions = useCallback((textContent) => {
    if (!textContent || textContent.includes("No translation questions available")) {
      return [];
    }

    const questions = [];
    const lines = textContent.split("\n").filter((line) => line.trim());

    let questionId = 1;
    let currentQuestion = "";
    let currentAnswer = "";
    let isReadingAnswer = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip headers and empty lines
      if (!trimmed || trimmed === "Translation Questions") continue;

      if (trimmed.startsWith("Q:")) {
        // Save previous Q&A if exists
        if (currentQuestion && currentAnswer) {
          questions.push({
            id: questionId++,
            question: currentQuestion,
            answer: currentAnswer,
          });
        }

        // Start new question
        currentQuestion = trimmed.substring(2).trim();
        currentAnswer = "";
        isReadingAnswer = false;
      } else if (trimmed.startsWith("A:")) {
        currentAnswer = trimmed.substring(2).trim();
        isReadingAnswer = true;
      } else if (isReadingAnswer && trimmed.length > 0) {
        // Continue reading answer
        currentAnswer += " " + trimmed;
      } else if (currentQuestion && !isReadingAnswer && trimmed.length > 0) {
        // Continue reading question
        currentQuestion += " " + trimmed;
      }
    }

    // Don't forget the last Q&A
    if (currentQuestion && currentAnswer) {
      questions.push({
        id: questionId++,
        question: currentQuestion,
        answer: currentAnswer,
      });
    }

    return questions;
  }, []);

  /**
   * Parses translation words text content into structured data
   */
  const parseTranslationWords = useCallback((textContent) => {
    if (!textContent || textContent.includes("No translation words available")) {
      return [];
    }

    const words = [];
    const lines = textContent.split("\n").filter((line) => line.trim());

    let wordId = 1;
    let currentWord = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip headers and tips
      if (
        !trimmed ||
        trimmed === "Translation Words" ||
        trimmed.startsWith("💡") ||
        trimmed.startsWith("Tip:")
      )
        continue;

      // Check if this looks like a word title
      if (trimmed.endsWith("Click to view full article →")) {
        // Save previous word if exists
        if (currentWord) {
          words.push(currentWord);
        }

        // Start new word
        const title = trimmed.replace("Click to view full article →", "").trim();
        currentWord = {
          id: wordId++,
          term: title,
          title: title,
          definition: "",
        };
      } else if (currentWord && trimmed.startsWith("rc://")) {
        // This is an RC link - we can skip it for the definition
        continue;
      } else if (currentWord && trimmed.length > 10) {
        // This is likely the definition text
        if (currentWord.definition) {
          currentWord.definition += " " + trimmed;
        } else {
          currentWord.definition = trimmed;
        }
      }
    }

    // Don't forget the last word
    if (currentWord) {
      words.push(currentWord);
    }

    return words;
  }, []);

  /**
   * Parses TWL text content into structured data
   */
  const parseTranslationWordLinks = useCallback((textContent) => {
    if (!textContent || textContent.includes("No Translation Word Links available")) {
      return [];
    }

    const links = [];
    const lines = textContent.split("\n").filter((line) => line.trim());

    let linkId = 1;
    let currentWord = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip headers and empty lines
      if (!trimmed || trimmed === "Translation Word Links") continue;

      // Check if this line contains an occurrence pattern
      const occurrenceMatch = trimmed.match(/^(.+?)\s+\(occurrence\s+(\d+)\)$/);
      if (occurrenceMatch) {
        currentWord = occurrenceMatch[1];
        links.push({
          id: linkId++,
          word: currentWord,
          term: currentWord,
          occurrence: occurrenceMatch[2],
        });
      } else if (trimmed.length > 2 && !trimmed.includes("View Translation Word Article")) {
        // This might be a word without explicit occurrence
        currentWord = trimmed;
        links.push({
          id: linkId++,
          word: currentWord,
          term: currentWord,
          occurrence: "1",
        });
      }
    }

    return links;
  }, []);

  /**
   * Collects current resources from all loaded panels by extracting DOM content
   */
  const collectCurrentResources = useCallback(() => {
    const resources = {
      scripture: "",
      translationNotes: [],
      translationQuestions: [],
      translationWords: [],
      translationWordLinks: [],
    };

    try {
      // Extract Scripture content
      const scriptureEl = document.querySelector('[data-testid="scripture-panel-rcl"]');
      if (scriptureEl) {
        // Get text content but filter out UI elements like buttons and headers
        const scriptureContent = scriptureEl.textContent || "";
        // Remove common UI text and clean up the content
        const cleanedScripture = scriptureContent
          .replace(/Scripture/g, "")
          .replace(/Hide Search|Search Scripture/g, "")
          .replace(/Loading scripture\.\.\./g, "")
          .replace(/Please select a book and chapter to view scripture\./g, "")
          .trim();

        if (cleanedScripture && cleanedScripture.length > 10) {
          resources.scripture = cleanedScripture;
        }
      }

      // Extract Translation Notes content
      const tnEl = document.querySelector('[data-testid="translation-notes-panel"]');
      if (tnEl) {
        const tnContent = tnEl.textContent || "";
        resources.translationNotes = parseTranslationNotes(tnContent);
      }

      // Extract Translation Questions content
      const tqEl = document.querySelector('[data-testid="translation-questions-panel"]');
      if (tqEl) {
        const tqContent = tqEl.textContent || "";
        resources.translationQuestions = parseTranslationQuestions(tqContent);
      }

      // Extract Translation Words content
      const twEl = document.querySelector('[data-testid="translation-words-panel"]');
      if (twEl) {
        const twContent = twEl.textContent || "";
        resources.translationWords = parseTranslationWords(twContent);
      }

      // Extract TWL content
      const twlEl = document.querySelector('[data-testid="twl-panel"]');
      if (twlEl) {
        const twlContent = twlEl.textContent || "";
        resources.translationWordLinks = parseTranslationWordLinks(twlContent);
      }

      console.log("Collected resources from DOM:", {
        scriptureLength: resources.scripture.length,
        notesCount: resources.translationNotes.length,
        questionsCount: resources.translationQuestions.length,
        wordsCount: resources.translationWords.length,
        linksCount: resources.translationWordLinks.length,
      });
    } catch (error) {
      console.error("Error collecting resources from DOM:", error);
      // Return empty structure on error
    }

    return resources;
  }, [
    referenceContext?.reference,
    parseTranslationNotes,
    parseTranslationQuestions,
    parseTranslationWords,
    parseTranslationWordLinks,
  ]);

  /**
   * Sends a message to the LLM with current context
   */
  const sendMessage = useCallback(
    async (message) => {
      setIsLoading(true);
      setError(null);

      try {
        // Get current reference and resources
        const reference = referenceContext?.reference || {
          bookId: "gen",
          chapter: 1,
          verse: 1,
          organization: "unfoldingWord",
          languageId: "en",
        };

        const resources = collectCurrentResources();
        const context = packageContext(reference, resources);

        // Validate the request
        const validation = validateChatRequest(message, context);
        if (!validation.valid) {
          throw new Error(validation.errors.join(", "));
        }

        setCurrentContext(context);

        // Add user message to history immediately
        const userMessage = {
          id: Date.now().toString(),
          type: "user",
          content: message,
          timestamp: new Date().toISOString(),
        };

        setChatHistory((prev) => [...prev, userMessage]);

        // Determine if we should use mock response
        const useMock = import.meta.env.VITE_USE_MOCK_CHAT === "true";

        let response;
        if (useMock) {
          // Use mock response for development
          response = createMockResponse(message, context);
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          // Send to actual LLM
          response = await sendChatMessage(message, context, chatHistory);
        }

        if (response.success) {
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            content: response.response,
            timestamp: response.timestamp,
            metadata: response.metadata,
          };

          setChatHistory((prev) => [...prev, aiMessage]);
        } else {
          throw new Error(response.error || "Failed to get response");
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err.message);

        // Add error message to chat
        const errorMessage = {
          id: (Date.now() + 2).toString(),
          type: "error",
          content: `Sorry, I encountered an error: ${err.message}`,
          timestamp: new Date().toISOString(),
        };

        setChatHistory((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [referenceContext?.reference, collectCurrentResources, chatHistory]
  );

  /**
   * Clears the chat history
   */
  const clearChat = useCallback(() => {
    setChatHistory([]);
    setCurrentContext(null);
    setError(null);
  }, []);

  /**
   * Removes a specific message from chat history
   */
  const removeMessage = useCallback((messageId) => {
    setChatHistory((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  /**
   * Gets the current context information for display
   */
  const getContextInfo = useCallback(() => {
    if (!currentContext) return null;

    const { reference, resources, metadata } = currentContext;
    return {
      reference: reference.citation,
      organization: reference.organization,
      language: reference.language,
      resourceCount: Object.values(resources).filter(Boolean).length,
      contextSize: metadata.contextSize,
      timestamp: metadata.timestamp,
    };
  }, [currentContext]);

  const value = {
    chatHistory,
    isLoading,
    error,
    currentContext,
    sendMessage,
    clearChat,
    removeMessage,
    getContextInfo,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export { ChatContext };
