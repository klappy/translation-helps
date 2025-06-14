import { USFMSemanticParser } from "./src/components/ScripturePanelRCL/USFMSemanticParser.js";

const usfm = `\\id TIT
\\h Titus
\\ts
\\c 1
\\p
\\v 1 Verse 1 text.
\\*
\\c 2
\\p
\\v 1 Verse 1 text, chapter 2.`;

const parser = new USFMSemanticParser();
const html = parser.parse(usfm);
console.log(html);
