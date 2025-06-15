/**
 * Debug test for the hanging parser issue
 */

import { parseUSFM } from "./src/components/ScripturePanelRCL/USFMParser.js";

console.log("Testing simple USFM...");
const simpleTest = parseUSFM("\\p Hello world");
console.log("Simple test passed");

console.log("Testing verse with simple attributes...");
const simpleVerse = parseUSFM('\\v 1|x-strong="G1234"\\* text');
console.log("Simple verse test passed");

console.log("Testing problematic borked input...");
const problematicUSFM = `\\id TIT EN_ULT en_English_ltr Wed Aug 24 2022 09:32:57 GMT-0400 (Eastern Daylight Time) tc
\\usfm 3.0
\\ide UTF-8
\\h Titus
\\toc1 The Letter of Paul to Titus
\\toc2 Titus
\\toc3 Tit
\\mt Titus
\\c 1
\\v 1|x-strong="G39720" x-lemma="Παῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="Παῦλος"\\*\\w Paul|x-occurrence="1" x-occurrences="1"\\w*`;

// Set a timeout to catch hanging
const timeout = setTimeout(() => {
  console.error("PARSER HANGING! Exiting...");
  process.exit(1);
}, 5000);

try {
  const result = parseUSFM(problematicUSFM);
  clearTimeout(timeout);
  console.log("Problematic test completed successfully!");
  console.log("Result children count:", result.children.length);
} catch (error) {
  clearTimeout(timeout);
  console.error("Error parsing:", error);
}
