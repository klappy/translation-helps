/**
 * FIA Images Panel - Modern image gallery for Bible study context
 * Features: Masonry grid, lightbox viewing, zoom, metadata overlays
 * 2025 design with smooth animations and interactions
 */

import React, { useEffect, useState } from 'react';
import { useResourcesContext } from '../context/ResourcesContext';
import { LoadingCard, AvailableBooksShowcase } from './shared';
import styles from './FiaImagesPanel.module.css';

export function FiaImagesPanel() {
  const { resources, activateResource } = useResourcesContext();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageStates, setImageStates] = useState({});
  
  // Self-activate FIA resources
  useEffect(() => {
    activateResource('fia');
  }, [activateResource]);

  const fiaData = resources.fia;
  const images = fiaData?.images || [];

  // Track image loading states
  const handleImageLoad = (index) => {
    setImageStates(prev => ({ ...prev, [index]: 'loaded' }));
  };

  const handleImageError = (index) => {
    setImageStates(prev => ({ ...prev, [index]: 'error' }));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;
      
      const currentIndex = images.findIndex(img => img === selectedImage);
      
      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedImage(images[currentIndex - 1]);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        setSelectedImage(images[currentIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, images]);

  if (!fiaData) {
    return <LoadingCard text="Loading images..." />;
  }

  if (!images.length) {
    return (
      <div className={styles.emptyState}>
        <AvailableBooksShowcase
          resourceType="fia"
          icon="images"
          title="FIA Images Available"
          description="These books have FIA image content available:"
        />
      </div>
    );
  }

  return (
    <>
      <div className={styles.imagesPanel}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span className={styles.icon}>📸</span>
            Biblical Context Images
          </h3>
          <span className={styles.count}>{images.length} images</span>
        </div>

        <div className={styles.masonryGrid}>
          {images.map((image, index) => {
            const mediaUrl = fiaData.resolveMediaUrl?.(image.HREF, 'images');
            const isLoaded = imageStates[index] === 'loaded';
            const hasError = imageStates[index] === 'error';

            return (
              <div
                key={`img-${index}`}
                className={`${styles.imageCard} ${isLoaded ? styles.loaded : ''}`}
                onClick={() => !hasError && setSelectedImage(image)}
              >
                {!hasError && mediaUrl ? (
                  <>
                    <img
                      src={mediaUrl}
                      alt={`Biblical context for ${image.REF}`}
                      className={styles.image}
                      loading="lazy"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />
                    <div className={styles.imageOverlay}>
                      <span className={styles.reference}>{image.REF}</span>
                      <span className={styles.viewIcon}>🔍</span>
                    </div>
                  </>
                ) : (
                  <div className={styles.errorCard}>
                    <span className={styles.errorIcon}>🖼️</span>
                    <p>Image unavailable</p>
                    <small>{image.REF}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedImage(null)}
              aria-label="Close lightbox"
            >
              ✕
            </button>

            <div className={styles.lightboxImageContainer}>
              <img
                src={fiaData.resolveMediaUrl?.(selectedImage.HREF, 'images')}
                alt={`Biblical context for ${selectedImage.REF}`}
                className={styles.lightboxImage}
              />
            </div>

            <div className={styles.lightboxInfo}>
              <h4>{selectedImage.REF}</h4>
              {selectedImage.TAGS && (
                <div className={styles.tags}>
                  {selectedImage.TAGS.split(',').map((tag, i) => (
                    <span key={i} className={styles.tag}>{tag.trim()}</span>
                  ))}
                </div>
              )}
              {selectedImage.SUPPORT && (
                <p className={styles.support}>{selectedImage.SUPPORT}</p>
              )}
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.findIndex(img => img === selectedImage);
                    if (currentIndex > 0) {
                      setSelectedImage(images[currentIndex - 1]);
                    }
                  }}
                  disabled={images.indexOf(selectedImage) === 0}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.findIndex(img => img === selectedImage);
                    if (currentIndex < images.length - 1) {
                      setSelectedImage(images[currentIndex + 1]);
                    }
                  }}
                  disabled={images.indexOf(selectedImage) === images.length - 1}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
