import React from "react";
import styles from "./ToggleSwitch.module.css";

export function ToggleSwitch({ checked, onChange, disabled = false, size = "small" }) {
  return (
    <label className={`${styles.toggleSwitch} ${styles[size]} ${disabled ? styles.disabled : ""}`}>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.toggleInput}
      />
      <span className={styles.toggleSlider}></span>
    </label>
  );
}
