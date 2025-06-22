/**
 * FIA Maps Panel - Interactive biblical maps with pan/zoom
 * Enhanced: Shows all chapter maps with deduplication and proper titles
 * 2025 design with modern map interactions
 */

import React, { useEffect, useState, useRef } from 'react';
import { useResourcesContext } from '../context/ResourcesContext';
import { useReferenceContext } from '../context/ReferenceContext';
import { getChapterFiaMaps } from '../services/fiaService';
import { LoadingCard, AvailableBooksShowcase } from './shared';
import styles from './FiaMapsPanel.module.css';

export function FiaMapsPanel() {
  const { activateResource } = useResourcesContext();
  const { reference } = useReferenceContext();
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);
  const [mapStates, setMapStates] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const mapContainerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  // Self-activate FIA resources
  useEffect(() => {
    activateResource('fia');
  }, [activateResource]);

  // Load chapter maps when reference changes
  useEffect(() => {
    async function loadChapterMaps() {
      if (!reference?.bookId || !reference?.chapter) {
        setMaps([]);
        return;
      }

      setLoading(true);
      try {
        const chapterMaps = await getChapterFiaMaps(
          reference.bookId,
          reference.chapter,
          'en' // TODO: Use actual language from context
        );
        
        setMaps(chapterMaps || []);
        console.log(`📍 FIA Maps: Loaded ${chapterMaps?.length || 0} maps for ${reference.bookId} chapter ${reference.chapter}`);
      } catch (error) {
        console.error('Failed to load chapter maps:', error);
        setMaps([]);
      } finally {
        setLoading(false);
      }
    }

    loadChapterMaps();
  }, [reference?.bookId, reference?.chapter]);

  // Track map loading states
  const handleMapLoad = (index) => {
    setMapStates(prev => ({ ...prev, [index]: 'loaded' }));
  };

  const handleMapError = (index) => {
    setMapStates(prev => ({ ...prev, [index]: 'error' }));
  };

  // Pan and zoom handlers
  const handleWheel = (e) => {
    if (!selectedMap) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(5, zoomLevel * delta));
    setZoomLevel(newZoom);
  };

  const handleMouseDown = (e) => {
    if (!selectedMap) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedMap) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) {
    return <LoadingCard text="Loading chapter maps..." />;
  }

  if (!maps.length) {
    // Check if current book has FIA content at all
    const currentBookId = reference?.bookId?.toLowerCase();
    const booksWithFiaContent = ['gen', 'exo', 'num', 'job', 'mat', 'mrk', 'luk', 'jhn', 'act', 'eph'];
    const currentBookHasFiaContent = booksWithFiaContent.includes(currentBookId);

    if (currentBookHasFiaContent) {
      // Book has FIA content but not for this verse
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🗺️</div>
          <h3>No Maps for This Chapter</h3>
          <p>
            {reference?.bookId} has FIA map content, but none available for{' '}
            {reference?.bookId} {reference?.chapter}
          </p>
          <div className={styles.suggestion}>
            <span className={styles.suggestionIcon}>💡</span>
            Try browsing other chapters in {reference?.bookId} to find available maps
          </div>
        </div>
      );
    } else {
      // Book has no FIA content - show available books
      return (
        <div className={styles.emptyStateFullScreen}>
          <AvailableBooksShowcase
            resourceType="fia"
            icon="maps"
            title="FIA Maps Available"
            description="These books have FIA map content available:"
          />
        </div>
      );
    }
  }

  return (
    <>
      <div className={styles.mapsPanel}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span className={styles.icon}>🗺️</span>
            Biblical Maps - {reference?.bookId} Chapter {reference?.chapter}
          </h3>
          <span className={styles.count}>{maps.length} maps</span>
        </div>

        <div className={styles.mapsGrid}>
          {maps.map((map, index) => {
            const mediaUrl = map.resolveMediaUrl();
            const isLoaded = mapStates[index] === 'loaded';
            const hasError = mapStates[index] === 'error';

            return (
              <div
                key={`map-${index}`}
                className={`${styles.mapCard} ${isLoaded ? styles.loaded : ''}`}
                onClick={() => !hasError && setSelectedMap(map)}
              >
                {!hasError && mediaUrl ? (
                  <>
                    <div className={styles.mapPreview}>
                      <img
                        src={mediaUrl}
                        alt={`Biblical map: ${map.title}`}
                        className={styles.mapImage}
                        loading="lazy"
                        onLoad={() => handleMapLoad(index)}
                        onError={() => handleMapError(index)}
                      />
                    </div>
                    <div className={styles.mapInfo}>
                      <h4 className={styles.mapTitle}>{map.title}</h4>
                      <div className={styles.mapMeta}>
                        <span className={styles.verseCount}>
                          {map.verses.length} verse{map.verses.length !== 1 ? 's' : ''}
                        </span>
                        <span className={styles.verseList}>
                          {map.versesFormatted || map.verses.join(', ')}
                        </span>
                      </div>
                      {map.TAGS && (
                        <p className={styles.mapTags}>{map.TAGS}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={styles.errorCard}>
                    <span className={styles.errorIcon}>🗺️</span>
                    <p>Map unavailable</p>
                    <small>{map.title}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Map Viewer */}
      {selectedMap && (
        <div className={styles.mapViewer}>
          <div className={styles.viewerHeader}>
            <div className={styles.mapTitleSection}>
              <h3>{selectedMap.title}</h3>
              <div className={styles.mapMetadata}>
                <span className={styles.verseRefs}>
                  Verses: {selectedMap.versesFormatted || selectedMap.verses.join(', ')}
                </span>
                {selectedMap.TAGS && (
                  <span className={styles.tags}>{selectedMap.TAGS}</span>
                )}
              </div>
            </div>
            <div className={styles.viewerControls}>
              <button
                className={styles.controlButton}
                onClick={resetView}
                title="Reset view"
              >
                ⟲
              </button>
              <button
                className={styles.controlButton}
                onClick={() => setZoomLevel(Math.min(5, zoomLevel * 1.2))}
                title="Zoom in"
              >
                +
              </button>
              <button
                className={styles.controlButton}
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel * 0.8))}
                title="Zoom out"
              >
                −
              </button>
              <button
                className={styles.controlButton}
                onClick={toggleFullscreen}
                title="Fullscreen"
              >
                ⛶
              </button>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedMap(null)}
                aria-label="Close map viewer"
              >
                ✕
              </button>
            </div>
          </div>

          <div 
            ref={mapContainerRef}
            className={styles.mapContainer}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div
              className={styles.mapWrapper}
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
              }}
            >
              <img
                src={selectedMap.resolveMediaUrl()}
                alt={`Biblical map: ${selectedMap.title}`}
                className={styles.interactiveMap}
                draggable={false}
              />
            </div>
          </div>

          {selectedMap.SUPPORT && (
            <div className={styles.mapDetails}>
              <p>{selectedMap.SUPPORT}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
