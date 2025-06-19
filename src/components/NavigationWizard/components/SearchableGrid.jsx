/**
 * SearchableGrid.jsx
 * Reusable component for displaying searchable grid of selectable items
 */

import React from "react";
import { SelectionCard } from "./SelectionCard";
import styles from "./SearchableGrid.module.css";

export function SearchableGrid({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  items = [],
  onSelect,
  selectedId,
  isDesktop = false,
  emptyMessage = "No items found.",
  columns = 2,
}) {
  const gridClass = isDesktop ? `${styles.grid} ${styles.gridDesktop}` : `${styles.grid} ${styles.gridMobile}`;
  const gridStyle = isDesktop ? { '--columns': columns } : {};

  return (
    <div className={styles.container}>
      <input
        type='text'
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className={styles.searchInput}
        data-testid='search-input'
      />

      {items.length === 0 ? (
        <div className={styles.empty} data-testid='empty-message'>
          <div className={styles.emptyIcon}>🔍</div>
          {searchTerm ? `No results found for "${searchTerm}"` : emptyMessage}
        </div>
      ) : (
        <div className={gridClass} style={gridStyle} data-testid='items-grid'>
          {items.map((item) => (
            <SelectionCard
              key={item.id}
              id={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              badge={item.badge}
              isSelected={selectedId === item.id}
              onClick={() => onSelect(item.id)}
              isDesktop={isDesktop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
