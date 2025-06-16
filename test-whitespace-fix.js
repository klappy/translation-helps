// Test for whitespace fix in ResourcesContext
import { parseUSFMToHTML } from "./src/components/ScripturePanelRCL/USFMSemanticParser.js";

// Test USFM data - Titus 1:1 with word markers
const testUSFM = `\\c 1
\\p
\\v 1 \\w Paul|x-strong="G3972"\\w*, \\w a|x-strong="G1401"\\w* \\w servant|x-strong="G1401"\\w* \\w of|x-strong="G2316"\\w* \\w God|x-strong="G2316"\\w* \\w and|x-strong="G2532"\\w* \\w an|x-strong="G652"\\w* \\w apostle|x-strong="G652"\\w* \\w of|x-strong="G2424"\\w* \\w Jesus|x-strong="G2424"\\w* \\w Christ|x-strong="G5547"\\w*, \\w for|x-strong="G2596"\\w* \\w the|x-strong="G4102"\\w* \\w faith|x-strong="G4102"\\w* \\w of|x-strong="G1588"\\w* \\w the|x-strong="G1588"\\w* \\w chosen|x-strong="G1588"\\w* \\w people|x-strong="G1588"\\w* \\w of|x-strong="G2316"\\w* \\w God|x-strong="G2316"\\w* \\w and|x-strong="G2532"\\w* \\w knowledge|x-strong="G1922"\\w* \\w of|x-strong="G225"\\w* \\w the|x-strong="G225"\\w* \\w truth|x-strong="G225"\\w* \\w that|x-strong="G3588"\\w* \\w agrees|x-strong="G2596"\\w* \\w with|x-strong="G2596"\\w* \\w godliness|x-strong="G2150"\\w*,`;

// Function to extract plain text (mimicking ResourcesContext logic)
function extractPlainText(usfmText, chapter, verse) {
  try {
    const html = parseUSFMToHTML(usfmText, "preview");

    // Create temporary DOM element
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Find the specific verse element
    const verseNum = String(verse);
    let verseElement = null;

    const vElements = tempDiv.querySelectorAll("v");
    for (const vEl of vElements) {
      const numberEl = vEl.querySelector("number");
      if (numberEl && numberEl.textContent.trim() === verseNum) {
        verseElement = vEl;
        break;
      }
    }

    if (verseElement) {
      let verseText = "";

      // Get all word elements within this verse
      const wordElements = verseElement.querySelectorAll("word");
      for (let i = 0; i < wordElements.length; i++) {
        const wordEl = wordElements[i];
        const contentEl = wordEl.querySelector("content");
        if (contentEl) {
          verseText += contentEl.textContent;
          // Add space after word unless it's the last word
          if (i < wordElements.length - 1) {
            verseText += " ";
          }
        }
      }

      // Also get any direct text nodes that aren't in word elements
      const walker = document.createTreeWalker(verseElement, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          const parent = node.parentElement;
          if (
            parent.tagName === "MARKER" ||
            parent.tagName === "NUMBER" ||
            parent.tagName === "ATTRIBUTES" ||
            parent.tagName === "ZALN"
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });

      let textNode;
      while ((textNode = walker.nextNode())) {
        // If we already have text and this isn't just whitespace, add a space
        if (verseText && textNode.textContent.trim()) {
          verseText += " ";
        }
        verseText += textNode.textContent;
      }

      return verseText.trim();
    }

    return "";
  } catch (err) {
    console.error("Error extracting verse text:", err);
    return "";
  }
}

// Run the test
console.log("🧪 Testing whitespace fix for USFM text extraction...\n");

const extractedText = extractPlainText(testUSFM, 1, 1);

console.log("📝 Extracted text:");
console.log(`"${extractedText}"\n`);

console.log("📊 Analysis:");
console.log(`- Length: ${extractedText.length} characters`);
console.log(`- Has spaces: ${extractedText.includes(" ")}`);
console.log(`- Word count: ${extractedText.split(" ").length}`);

// Expected text with proper spacing
const expectedText =
  "Paul, a servant of God and an apostle of Jesus Christ, for the faith of the chosen people of God and knowledge of the truth that agrees with godliness,";

console.log("\n✅ Expected text:");
console.log(`"${expectedText}"\n`);

// Compare
if (extractedText === expectedText) {
  console.log("✅ SUCCESS: Text extraction is working correctly with proper spacing!");
} else {
  console.log("❌ FAIL: Text extraction does not match expected output");
  console.log("\n🔍 Differences:");
  console.log(`- Expected length: ${expectedText.length}`);
  console.log(`- Actual length: ${extractedText.length}`);

  // Show character-by-character comparison for first difference
  for (let i = 0; i < Math.max(expectedText.length, extractedText.length); i++) {
    if (expectedText[i] !== extractedText[i]) {
      console.log(`\n- First difference at position ${i}:`);
      console.log(`  Expected: "${expectedText[i]}" (char code: ${expectedText.charCodeAt(i)})`);
      console.log(`  Actual: "${extractedText[i]}" (char code: ${extractedText.charCodeAt(i)})`);
      console.log(`  Context: "${expectedText.substring(i - 10, i + 10)}"`);
      break;
    }
  }
}

// Also test the parsed HTML structure
console.log("\n📋 HTML Structure (first 500 chars):");
const html = parseUSFMToHTML(testUSFM, "preview");
console.log(html.substring(0, 500) + "...");
