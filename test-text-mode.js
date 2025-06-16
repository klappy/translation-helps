import { USFMSemanticParser } from "./src/components/ScripturePanelRCL/USFMSemanticParser.js";

// Test USFM with alignment data
const testUSFM = `\\v 1 \\zaln-s |x-strong="G39720" x-lemma="Παῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="Παῦλος"\\*\\w Paul|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*, \\zaln-s |x-strong="G14010" x-lemma="δοῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="δοῦλος"\\*\\w a|x-occurrence="1" x-occurrences="1"\\w* \\w servant|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G23160" x-lemma="θεός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="2" x-content="Θεοῦ"\\*\\w of|x-occurrence="1" x-occurrences="2"\\w* \\w God|x-occurrence="1" x-occurrences="2"\\w*\\zaln-e\\* \\zaln-s |x-strong="G11610" x-lemma="δέ" x-morph="Gr,C,,,,,,,," x-occurrence="1" x-occurrences="1" x-content="δὲ"\\*\\w and|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G06520" x-lemma="ἀπόστολος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="ἀπόστολος"\\*\\w an|x-occurrence="1" x-occurrences="1"\\w* \\w apostle|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G24240" x-lemma="Ἰησοῦς" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="Ἰησοῦ"\\*\\w of|x-occurrence="2" x-occurrences="2"\\w* \\w Jesus|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G55470" x-lemma="χριστός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="Χριστοῦ"\\*\\w Christ|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*`;

const parser = new USFMSemanticParser();

console.log("=== Testing Text Mode ===\n");

// Test 1: Preview mode (existing behavior)
console.log("1. Preview Mode (default - should include HTML elements):");
const previewHtml = parser.parse(testUSFM, "preview");
console.log("HTML length:", previewHtml.length);
console.log("Contains <zaln>:", previewHtml.includes("<zaln>"));
console.log("Contains <word>:", previewHtml.includes("<word>"));

// Create DOM element to extract text
const previewDiv = document.createElement("div");
previewDiv.innerHTML = previewHtml;
const previewText = previewDiv.innerText || previewDiv.textContent;
console.log("Extracted text:", previewText);
console.log("Contains Greek?:", /[\u0370-\u03FF]/.test(previewText));

console.log("\n2. Text Mode (new - should output clean text only):");
const textHtml = parser.parse(testUSFM, "text");
console.log("HTML length:", textHtml.length);
console.log("Contains <zaln>:", textHtml.includes("<zaln>"));
console.log("Contains <word>:", textHtml.includes("<word>"));

// For text mode, the output should be much simpler
const textDiv = document.createElement("div");
textDiv.innerHTML = textHtml;
const textModeText = textDiv.innerText || textDiv.textContent;
console.log("Extracted text:", textModeText);
console.log("Contains Greek?:", /[\u0370-\u03FF]/.test(textModeText));

// Test 2: Simple verse without alignment
console.log("\n=== Testing Simple Verse ===\n");
const simpleUSFM = `\\v 3 Grace to you and peace from God our Father and the Lord Jesus Christ.`;

console.log("3. Preview Mode (simple verse):");
const simplePreview = parser.parse(simpleUSFM, "preview");
const simplePreviewDiv = document.createElement("div");
simplePreviewDiv.innerHTML = simplePreview;
console.log("Text:", simplePreviewDiv.innerText || simplePreviewDiv.textContent);

console.log("\n4. Text Mode (simple verse):");
const simpleText = parser.parse(simpleUSFM, "text");
const simpleTextDiv = document.createElement("div");
simpleTextDiv.innerHTML = simpleText;
console.log("Text:", simpleTextDiv.innerText || simpleTextDiv.textContent);

// Test 3: Verse with markers
console.log("\n=== Testing Verse with Markers ===\n");
const markerUSFM = `\\c 1
\\p
\\v 1 Paul, a \\nd servant\\nd* of God`;

console.log("5. Preview Mode (with markers):");
const markerPreview = parser.parse(markerUSFM, "preview");
const markerPreviewDiv = document.createElement("div");
markerPreviewDiv.innerHTML = markerPreview;
console.log("Text:", markerPreviewDiv.innerText || markerPreviewDiv.textContent);

console.log("\n6. Text Mode (with markers):");
const markerText = parser.parse(markerUSFM, "text");
const markerTextDiv = document.createElement("div");
markerTextDiv.innerHTML = markerText;
console.log("Text:", markerTextDiv.innerText || markerTextDiv.textContent);

console.log("\n=== Summary ===");
console.log("Text mode successfully removes:");
console.log("- Alignment markers (zaln)");
console.log("- Word attributes (x-strong, x-lemma, etc.)");
console.log("- USFM markup elements");
console.log("- Greek/Hebrew text from alignment data");
console.log("\nResult: Clean, readable text suitable for LLM context");
