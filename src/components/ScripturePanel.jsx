/**
 * ScripturePanel.jsx
 * Responsible for displaying scripture text using the enhanced RCL component.
 */
import React, { forwardRef } from "react";
import { useResourcesContext } from "../context/ResourcesContext";
import { LoadingOverlay } from "./shared";
import ScripturePanelRCL from "./ScripturePanelRCL";

/**
 * @param {object} props
 * @param {object} props.reference - Reference object { bookId, chapter, verse }
 * @param {function} props.onVerseClick - Callback when a verse is clicked
 */
export const ScripturePanel = React.memo(forwardRef(function ScripturePanel({ reference, onVerseClick }, ref) {
  const { resources, loadingResources } = useResourcesContext();
  const isScriptureLoading = loadingResources.has('scripture');
  
  return (
    <LoadingOverlay 
      isVisible={isScriptureLoading}
      text={`Loading ${reference?.bookId || 'Scripture'}...`}
    >
      <ScripturePanelRCL ref={ref} reference={reference} onVerseClick={onVerseClick} />
    </LoadingOverlay>
  );
}));
