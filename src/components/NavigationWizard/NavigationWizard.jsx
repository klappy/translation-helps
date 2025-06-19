  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button
          title="Close Navigation Wizard"
          className={styles.closeButton}
          onClick={onClose}
        >
          ×
        </button>
        {/* Rest of the modal content */}
      </div>
    </div>
  ); 