import { parseUSFMToHTML } from './src/components/ScripturePanelRCL/USFMSemanticParser.js';

// Test USFM from Titus 1:1
const testUSFM = `\\c 1
\\p
\\v 1 \\zaln-s |x-strong="G39720" x-lemma="Παῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="Παῦλος"\\*\\w Paul|x-occurrence="1" x-occurrences="1" x-strong="G39720" x-lemma="Παῦλος" x-morph="Gr,N,,,,,NMS," x-content="Παῦλος"\\w*\\zaln-e\\*,
\\zaln-s |x-strong="G14010" x-lemma="δοῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="δοῦλος"\\*\\w a|x-occurrence="1" x-occurrences="2"\\w*
\\w servant|x-occurrence="1" x-occurrences="1" x-strong="G14010" x-lemma="δοῦλος" x-morph="Gr,N,,,,,NMS," x-content="δοῦλος"\\w*\\zaln-e\\*
\\zaln-s |x-strong="G23160" x-lemma="θεός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="Θεοῦ"\\*\\w of|x-occurrence="1" x-occurrences="2"\\w*
\\w God|x-occurrence="1" x-occurrences="1" x-strong="G23160" x-lemma="θεός" x-morph="Gr,N,,,,,GMS," x-content="Θεοῦ"\\w*\\zaln-e\\*
\\zaln-s |x-strong="G11610" x-lemma="δέ" x-morph="Gr,CC,,,,,,,," x-occurrence="1" x-occurrences="1" x-content="δὲ"\\*\\w and|x-occurrence="1" x-occurrences="2"\\w*\\zaln-e\\*
\\zaln-s |x-strong="G06520" x-lemma="ἀπόστολος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="ἀπόστολος"\\*\\w an|x-occurrence="1" x-occurrences="1"\\w*
\\w apostle|x-occurrence="1" x-occurrences="1" x-strong="G06520" x-lemma="ἀπόστολος" x-morph="Gr,N,,,,,NMS," x-content="ἀπόστολος"\\w*\\zaln-e\\*
\\zaln-s |x-strong="G55470" x-lemma="χριστός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="Χριστοῦ"\\*\\w of|x-occurrence="2" x-occurrences="2"\\w*\\zaln-e\\*
\\zaln-s |x-strong="G24240" x-lemma="Ἰησοῦς" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="Ἰησοῦ"\\*\\w Jesus|x-occurrence="1" x-occurrences="1" x-strong="G24240" x-lemma="Ἰησοῦς" x-morph="Gr,N,,,,,GMS," x-content="Ἰησοῦ"\\w*\\zaln-e\\*
\\zaln-s |x-strong="G55470" x-lemma="χριστός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="Χριστοῦ"\\*\\w Christ|x-occurrence="1" x-occurrences="1" x-strong="G55470" x-lemma="χριστός" x-morph="Gr,N,,,,,GMS," x-content="Χριστοῦ"\\w*\\zaln-e\\*,`;

console.log("Testing USFM parsing modes:");
console.log("===========================");

// Test preview mode
const previewHTML = parseUSFMToHTML(testUSFM, "preview");
console.log("\nPREVIEW MODE HTML (first 500 chars):");
console.log(previewHTML.substring(0, 500));

// Test text mode
const textOutput = parseUSFMToHTML(testUSFM, "text");
console.log("\nTEXT MODE OUTPUT:");
console.log(textOutput);

// Create DOM element to test extraction
if (typeof window !== 'undefined') {
  // For preview mode
  const previewDiv = document.createElement('div');
  previewDiv.innerHTML = previewHTML;
  
  const vElements = previewDiv.querySelectorAll('v');
  console.log("\nVerse elements found in preview mode:", vElements.length);
  
  if (vElements.length > 0) {
    const verseElement = vElements[0];
    console.log("First verse innerText:", verseElement.innerText
