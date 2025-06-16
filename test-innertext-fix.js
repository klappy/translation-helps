/**
 * Test to verify that innerText properly excludes hidden elements
 * while textContent includes all text
 */

// Simulate the HTML structure from USFM parsing
const testHTML = `
<v>
  <marker class="v" style="display: none;">\\v 1</marker>
  <number>1</number>
  <zaln style="display: none;">
    <marker class="zaln-s" style="display: none;">\\zaln-s |x-strong="G39720"</marker>
    <attributes style="display: none;">|x-strong="G39720" x-lemma="Παῦλος"</attributes>
  </zaln>
  <word>
    <content>Paul</content>
    <attributes style="display: none;">|x-occurrence="1" x-occurrences="1"</attributes>
  </word>
  <marker class="w*" style="display: none;">\\w*</marker>
  <marker class="zaln-e" style="display: none;">\\zaln-e\\*</marker>
  , 
  <word>
    <content>a servant</content>
  </word>
  <word>
    <content>of God</content>
  </word>
  and 
  <word>
    <content>an apostle</content>
  </word>
  <word>
    <content>of Jesus</content>
  </word>
  <word>
    <content>Christ</content>
  </word>
</v>
`;

// Create a temporary div to test
const div = document.createElement("div");
div.innerHTML = testHTML;

// Apply display: none styles (simulating what CSS would do)
div.querySelectorAll('[style*="display: none"]').forEach((el) => {
  el.style.display = "none";
});

console.log("=== Testing innerText vs textContent ===\n");

console.log("Using textContent (includes hidden elements):");
console.log(JSON.stringify(div.textContent));
console.log("\nLength:", div.textContent.length);
console.log("Contains USFM markers?", div.textContent.includes("\\v"));
console.log("Contains attributes?", div.textContent.includes("x-strong"));

console.log("\n---\n");

console.log("Using innerText (excludes hidden elements):");
console.log(JSON.stringify(div.innerText));
console.log("\nLength:", div.innerText.length);
console.log("Contains USFM markers?", div.innerText.includes("\\v"));
console.log("Contains attributes?", div.innerText.includes("x-strong"));

console.log("\n---\n");

// Clean up the innerText output
const cleanText = div.innerText?.trim().replace(/\s+/g, " ");
console.log("Cleaned visible text:");
console.log(JSON.stringify(cleanText));

console.log("\n=== Expected Output ===");
console.log('The innerText should show: "1 Paul, a servant of God and an apostle of Jesus Christ"');
console.log("Without any USFM markers or alignment attributes");
