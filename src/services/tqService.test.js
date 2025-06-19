import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getQuestionsForVerse } from "./tqService";
import * as dcsClient from "./dcsClient";

beforeEach(() => {
  vi.spyOn(dcsClient, "fetchResourceFile");
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getQuestionsForVerse", () => {
  const sampleTsvWithReference = [
    "Reference\tQuestion\tResponse",
    "gen/1/1\tWhy was...\tBecause...",
    "gen/1/2\tWhat did...\tIt did...",
  ].join("\n");

  const sampleTsvWithChapterVerse = [
    "Chapter\tVerse\tQuestion\tAnswer",
    "1\t1\tWhy was...\tBecause...",
    "1\t2\tWhat did...\tIt did...",
  ].join("\n");

  const sampleTsvWithIntroQuestions = [
    "Reference\tQuestion\tResponse",
    "front:intro\tWhat is the purpose of this book?\tTo explain creation and early history",
    "1:intro\tWhat is the theme of chapter 1?\tGod's creation of the world",
    "gen/1/1\tWhy was...\tBecause...",
    "gen/1/2\tWhat did...\tIt did...",
  ].join("\n");

  it("fetches and filters questions correctly with Reference format", async () => {
    dcsClient.fetchResourceFile.mockResolvedValue(sampleTsvWithReference);
    const questions = await getQuestionsForVerse("gen", 1, 1);
    expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
      "en",
      "tq",
      "gen.tsv",
      "unfoldingWord"
    );
    expect(questions).toEqual([
      {
        id: 0,
        question: "Why was...",
        answer: "Because...",
        reference: "gen/1/1",
        _original: { Reference: "gen/1/1", Question: "Why was...", Response: "Because..." },
      },
    ]);
  });

  it("fetches and filters questions correctly with Chapter/Verse format", async () => {
    dcsClient.fetchResourceFile.mockResolvedValue(sampleTsvWithChapterVerse);
    const questions = await getQuestionsForVerse("gen", 1, 1);
    expect(questions).toEqual([
      {
        id: 0,
        question: "Why was...",
        answer: "Because...",
        reference: "",
        _original: { Chapter: "1", Verse: "1", Question: "Why was...", Answer: "Because..." },
      },
    ]);
  });

  it("includes book and chapter introduction questions with verse-specific questions", async () => {
    dcsClient.fetchResourceFile.mockResolvedValue(sampleTsvWithIntroQuestions);
    const questions = await getQuestionsForVerse("gen", 1, 1);
    
    // Should return book intro, chapter intro, then verse-specific questions in that order
    expect(questions).toHaveLength(3);
    
    // Book introduction question should be first
    expect(questions[0]).toEqual({
      id: 0,
      question: "What is the purpose of this book?",
      answer: "To explain creation and early history",
      reference: "front:intro",
      _original: { Reference: "front:intro", Question: "What is the purpose of this book?", Response: "To explain creation and early history" },
    });
    
    // Chapter introduction question should be second
    expect(questions[1]).toEqual({
      id: 1,
      question: "What is the theme of chapter 1?",
      answer: "God's creation of the world",
      reference: "1:intro",
      _original: { Reference: "1:intro", Question: "What is the theme of chapter 1?", Response: "God's creation of the world" },
    });
    
    // Verse-specific question should be last
    expect(questions[2]).toEqual({
      id: 2,
      question: "Why was...",
      answer: "Because...",
      reference: "gen/1/1",
      _original: { Reference: "gen/1/1", Question: "Why was...", Response: "Because..." },
    });
  });

  it("uses custom file path when provided", async () => {
    dcsClient.fetchResourceFile.mockResolvedValue(sampleTsvWithReference);
    await getQuestionsForVerse("gen", 1, 1, "unfoldingWord", "en", "custom_gen.tsv");
    expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
      "en",
      "tq",
      "custom_gen.tsv",
      "unfoldingWord"
    );
  });

  it("handles empty content gracefully", async () => {
    dcsClient.fetchResourceFile.mockResolvedValue("");
    const questions = await getQuestionsForVerse("gen", 1, 1);
    expect(questions).toEqual([]);
  });

  it("throws error when fetch fails", async () => {
    dcsClient.fetchResourceFile.mockRejectedValue(new Error("Network error"));
    await expect(getQuestionsForVerse("gen", 1, 1)).rejects.toThrow(
      "Failed to load translation questions: Network error"
    );
  });

  it("filters out questions without text", async () => {
    const tsvWithEmpty = [
      "Reference\tQuestion\tResponse",
      "gen/1/1\tWhy was...\tBecause...",
      "gen/1/2\t\tIt did...", // Empty question
      "gen/1/3\tWhat happened?\t", // Empty answer is OK
    ].join("\n");

    dcsClient.fetchResourceFile.mockResolvedValue(tsvWithEmpty);
    const questions = await getQuestionsForVerse("gen", 1, 1);
    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe("Why was...");
  });
});
