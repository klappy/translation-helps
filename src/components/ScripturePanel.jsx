/**
 * ScripturePanel.jsx
 * Responsible for displaying scripture text using the enhanced RCL component.
 */
import React, { forwardRef } from "react";
import ScripturePanelRCL from "./ScripturePanelRCL";

/**
 * @param {object} props
 * @param {object} props.reference - Reference object { bookId, chapter, verse }
 * @param {function} props.onVerseClick - Callback when a verse is clicked
 */
export const ScripturePanel = React.memo(forwardRef(function ScripturePanel({ reference, onVerseClick }, ref) {
  return <ScripturePanelRCL ref={ref} reference={reference} onVerseClick={onVerseClick} />;
}));
