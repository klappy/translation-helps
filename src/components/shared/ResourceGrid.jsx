/**
 * ResourceGrid.jsx
 * Shared resource selection grid component used by both Scripture and Helps navigation
 * Provides consistent UI/UX across all resource selection interfaces
 * Updated with decluttered design and avatar-first approach
 */
import React, { useState, useMemo } from 'react';
import { getResourceIcon, getOrganizationAvatar } from '../../utils/visualHelpers';
import { 
  sortOrganizationsByMetrics, 
  getTierDisplayInfo, 
  getRecommendationText,
  createMetricBadges 
} from '../../utils/organizationMetrics';
import styles from './ResourceGrid.module.css';

export function ResourceGrid({ 
  resources = {}, // { organization: [resources] }
  onSelect,
  onBack,
  title = 'Select Resource',
  searchPlaceholder = 'Search resources...',
  loading = false,
  error = null,
  emptyMessage = 'No resources available',
  resourceType = 'generic' // 'bible', 'helps', etc. for specific styling
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Group resources by organization and sort by metrics
  const groupedResources = useMemo(() => {
    const grouped = Object.entries(resources)
      .filter(([org, orgResources]) => orgResources && orgResources.length > 0)
      .map(([org, orgResources]) => {
        // Get organization metadata from the first resource in the group
        const firstResource = orgResources[0];
        const organizationData = firstResource?.organizationData || null;
        
        return {
          organization: { 
            id: org, 
            name: org,
            avatar_url: organizationData?.avatar_url,
            full_name: organizationData?.full_name || org,
            login: organizationData?.login || org
          },
          resources: orgResources.map(resource => ({
            ...resource,
            organization: org,
            organizationName: org
          }))
        };
      });

    // Sort by community engagement metrics
    return sortOrganizationsByMetrics(grouped);
  }, [resources]);

  // Auto-expand first group by default
  useMemo(() => {
    if (groupedResources.length > 0 && expandedGroups.size === 0) {
      setExpandedGroups(new Set([groupedResources[0].organization.id]));
    }
  }, [groupedResources, expandedGroups.size]);

  // Filter resources based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedResources;
    
    const term = searchTerm.toLowerCase();
    return groupedResources.map(group => ({
      ...group,
      resources: group.resources.filter(resource =>
        resource.name?.toLowerCase().includes(term) ||
        resource.id?.toLowerCase().includes(term) ||
        resource.title?.toLowerCase().includes(term) ||
        resource.description?.toLowerCase().includes(term)
      )
    })).filter(group => group.resources.length > 0);
  }, [groupedResources, searchTerm]);

  const toggleGroup = (orgId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleResourceSelect = (resource) => {
    if (onSelect) {
      onSelect(resource);
    }
  };

  const getResourceDisplayName = (resource) => {
    return resource.title || resource.name || resource.id?.toUpperCase() || 'Unknown Resource';
  };

  const getResourceDescription = (resource) => {
    if (resource.description) return resource.description;
    
    // Default descriptions based on resource type
    if (resource.subject === 'Bible' || resource.subject === 'Aligned Bible') {
      return `${resource.subject} Translation`;
    }
    
    // For helps resources, show version if available
    if (resource.version) {
      return `Version ${resource.version}`;
    }
    
    return 'Translation Resource';
  };

  const getBookCount = (resource) => {
    // Get book count from various possible fields
    if (resource.books && Array.isArray(resource.books)) {
      return resource.books.length;
    }
    if (resource.books && typeof resource.books === 'number') {
      return resource.books;
    }
    if (resource.bookCount && typeof resource.bookCount === 'number') {
      return resource.bookCount;
    }
    if (resource.book_count && typeof resource.book_count === 'number') {
      return resource.book_count;
    }
    
    // For Translation Words and TWL resources, check alternative fields
    if (resource.subject === 'Translation Words' || 
             resource.subject === 'TSV Translation Words Links' ||
             resource.id === 'tw' || resource.id === 'twl' ||
             resource.name?.toLowerCase().includes('translation words') ||
             resource.title?.toLowerCase().includes('translation words')) {
      // Try content array
      if (resource.content && Array.isArray(resource.content)) {
        return resource.content.length;
      }
      // Try coverage array
      else if (resource.coverage && Array.isArray(resource.coverage)) {
        return resource.coverage.length;
      }
      // Try manifest projects
      else if (resource.manifest && resource.manifest.projects && Array.isArray(resource.manifest.projects)) {
        return resource.manifest.projects.length;
      }
    }
    
    return null;
  };

  const getBookCountDisplay = (resource) => {
    const count = getBookCount(resource);
    if (count === null || count === undefined) return null;
    if (count === 0) return 'No books';
    if (count === 1) return '1 book';
    return `${count} books`;
  };

  // Enhanced book count analysis for Bible resources
  const getDetailedBookCount = (resource) => {
    let bookIds = [];
    
    // Standard books array (for Bible resources)
    if (resource.books && Array.isArray(resource.books)) {
      bookIds = resource.books.map(book => 
        typeof book === 'string' ? book.toLowerCase() : book.id?.toLowerCase()
      ).filter(Boolean);
    }
    // For Translation Words and TWL resources, check alternative fields
    else if (resource.subject === 'Translation Words' || 
             resource.subject === 'TSV Translation Words Links' ||
             resource.id === 'tw' || resource.id === 'twl' ||
             resource.name?.toLowerCase().includes('translation words') ||
             resource.title?.toLowerCase().includes('translation words')) {
      // Try content array
      if (resource.content && Array.isArray(resource.content)) {
        bookIds = resource.content.map(item => 
          typeof item === 'string' ? item.toLowerCase() : 
          item.id?.toLowerCase() || item.book?.toLowerCase() || item.bookId?.toLowerCase()
        ).filter(Boolean);
      }
      // Try coverage array
      else if (resource.coverage && Array.isArray(resource.coverage)) {
        bookIds = resource.coverage.map(item => 
          typeof item === 'string' ? item.toLowerCase() : 
          item.id?.toLowerCase() || item.book?.toLowerCase() || item.bookId?.toLowerCase()
        ).filter(Boolean);
      }
      // Try manifest projects
      else if (resource.manifest && resource.manifest.projects && Array.isArray(resource.manifest.projects)) {
        bookIds = resource.manifest.projects.map(project => 
          project.identifier?.toLowerCase() || project.id?.toLowerCase() || project.path?.toLowerCase()
        ).filter(Boolean);
      }
    }

    // If no books found, return null
    if (bookIds.length === 0) {
      return null;
    }

    // Old Testament books (39 books)
    const otBooks = [
      'gen', 'exo', 'lev', 'num', 'deu', 'jos', 'jdg', 'rut', '1sa', '2sa',
      '1ki', '2ki', '1ch', '2ch', 'ezr', 'neh', 'est', 'job', 'psa', 'pro',
      'ecc', 'sng', 'isa', 'jer', 'lam', 'ezk', 'dan', 'hos', 'jol', 'amo',
      'oba', 'jon', 'mic', 'nam', 'hab', 'zep', 'hag', 'zec', 'mal'
    ];

    // New Testament books (27 books)
    const ntBooks = [
      'mat', 'mrk', 'luk', 'jhn', 'act', 'rom', '1co', '2co', 'gal', 'eph',
      'php', 'col', '1th', '2th', '1ti', '2ti', 'tit', 'phm', 'heb', 'jas',
      '1pe', '2pe', '1jn', '2jn', '3jn', 'jud', 'rev'
    ];

    const otCount = bookIds.filter(id => otBooks.includes(id)).length;
    const ntCount = bookIds.filter(id => ntBooks.includes(id)).length;
    const totalCount = bookIds.length;

    // Get actual book IDs for each testament
    const otBookIds = bookIds.filter(id => otBooks.includes(id));
    const ntBookIds = bookIds.filter(id => ntBooks.includes(id));

    return {
      total: totalCount,
      ot: otCount,
      nt: ntCount,
      hasOT: otCount > 0,
      hasNT: ntCount > 0,
      isCompleteOT: otCount === 39,
      isCompleteNT: ntCount === 27,
      isCompleteBible: otCount === 39 && ntCount === 27,
      otBookIds,
      ntBookIds,
      allBookIds: bookIds
    };
  };

  // Component for displaying book count with hover tooltips
  const BookCountDisplay = ({ resource }) => {
    const detailed = getDetailedBookCount(resource);
    
    if (!detailed) {
      // Fallback to simple count
      const fallbackDisplay = getBookCountDisplay(resource);
      if (!fallbackDisplay) {
        // For tW/TWL resources, try to show some indication they have content
        if (resource.subject === 'Translation Words' || 
            resource.subject === 'TSV Translation Words Links' ||
            resource.id === 'tw' || resource.id === 'twl' ||
            resource.name?.toLowerCase().includes('translation words') ||
            resource.title?.toLowerCase().includes('translation words')) {
          return <span style={{ cursor: 'help' }} title="Translation resource - book coverage information not available">📚 Content available</span>;
        }
        return null;
      }
      return <span>{fallbackDisplay}</span>;
    }

    if (detailed.total === 0) return <span>No books</span>;
    if (detailed.total === 1) return <span>1 book</span>;

    // Format book IDs for display in tooltips
    const formatBookIds = (bookIds) => {
      return bookIds.join(', ').toUpperCase();
    };

    // If it's a complete Bible
    if (detailed.isCompleteBible) {
      return (
        <span 
          title={`All books included:\nOT: ${formatBookIds(detailed.otBookIds)}\nNT: ${formatBookIds(detailed.ntBookIds)}`}
          style={{ cursor: 'help' }}
        >
          📖 Complete Bible (66 books)
        </span>
      );
    }

    // If it has both OT and NT
    if (detailed.hasOT && detailed.hasNT) {
      return (
        <span style={{ cursor: 'help' }}>
          <span 
            title={`Old Testament books (${detailed.ot}):\n${formatBookIds(detailed.otBookIds)}`}
            style={{ cursor: 'help' }}
          >
            📜 OT: {detailed.ot}
          </span>
          {' • '}
          <span 
            title={`New Testament books (${detailed.nt}):\n${formatBookIds(detailed.ntBookIds)}`}
            style={{ cursor: 'help' }}
          >
            ✝️ NT: {detailed.nt}
          </span>
        </span>
      );
    }

    // If it's only OT
    if (detailed.hasOT && !detailed.hasNT) {
      const displayText = detailed.isCompleteOT 
        ? '📜 Complete Old Testament (39 books)'
        : `📜 Old Testament (${detailed.ot} books)`;
      
      return (
        <span 
          title={`Old Testament books (${detailed.ot}):\n${formatBookIds(detailed.otBookIds)}`}
          style={{ cursor: 'help' }}
        >
          {displayText}
        </span>
      );
    }

    // If it's only NT
    if (detailed.hasNT && !detailed.hasOT) {
      const displayText = detailed.isCompleteNT 
        ? '✝️ Complete New Testament (27 books)'
        : `✝️ New Testament (${detailed.nt} books)`;
      
      return (
        <span 
          title={`New Testament books (${detailed.nt}):\n${formatBookIds(detailed.ntBookIds)}`}
          style={{ cursor: 'help' }}
        >
          {displayText}
        </span>
      );
    }

    // Fallback for edge cases
    return (
      <span 
        title={`Books included (${detailed.total}):\n${formatBookIds(detailed.allBookIds)}`}
        style={{ cursor: 'help' }}
      >
        📚 {detailed.total} books
      </span>
    );
  };

  const getEnhancedBookCountDisplay = (resource) => {
    const detailed = getDetailedBookCount(resource);
    if (!detailed) {
      // Fallback to simple count
      return getBookCountDisplay(resource);
    }

    if (detailed.total === 0) return 'No books';
    if (detailed.total === 1) return '1 book';

    // If it's a complete Bible
    if (detailed.isCompleteBible) {
      return '📖 Complete Bible (66 books)';
    }

    // If it has both OT and NT
    if (detailed.hasOT && detailed.hasNT) {
      return `📜 OT: ${detailed.ot} • ✝️ NT: ${detailed.nt}`;
    }

    // If it's only OT
    if (detailed.hasOT && !detailed.hasNT) {
      if (detailed.isCompleteOT) {
        return '📜 Complete Old Testament (39 books)';
      }
      return `📜 Old Testament (${detailed.ot} books)`;
    }

    // If it's only NT
    if (detailed.hasNT && !detailed.hasOT) {
      if (detailed.isCompleteNT) {
        return '✝️ Complete New Testament (27 books)';
      }
      return `✝️ New Testament (${detailed.nt} books)`;
    }

    // Fallback for edge cases
    return `📚 ${detailed.total} books`;
  };

  // Get the appropriate icon for the resource based on book content
  const getResourceBookIcon = (resource) => {
    const detailed = getDetailedBookCount(resource);
    if (!detailed) {
      // Fallback to general resource icon
      return getResourceIcon(resource.id);
    }

    // Complete Bible gets the full Bible icon
    if (detailed.isCompleteBible) {
      return '📖';
    }

    // Mixed OT/NT gets Bible icon
    if (detailed.hasOT && detailed.hasNT) {
      return '📖';
    }

    // Old Testament only
    if (detailed.hasOT && !detailed.hasNT) {
      return '📜';
    }

    // New Testament only
    if (detailed.hasNT && !detailed.hasOT) {
      return '✝️';
    }

    // Fallback to general resource icon
    return getResourceIcon(resource.id);
  };

  const getResourceTypeLabel = (resource) => {
    // Use subject field or derive from resource metadata
    if (resource.subject) return resource.subject;
    if (resource.type) return resource.type;
    
    // Fallback to resource type prop
    return resourceType === 'bible' ? 'Bible' : 'Resource';
  };

  const getResourceBadges = (resource) => {
    // For Bible resources, return array of badges for separate display
    if (resourceType === 'bible') {
      const description = (resource.description || '').toLowerCase();
      const name = (resource.name || '').toLowerCase();
      const id = (resource.id || '').toLowerCase();
      const subject = (resource.subject || '').toLowerCase();
      
      let badges = [];
      
      // Check for Aligned Bible first
      if (subject === 'aligned bible' || subject.includes('aligned') || description.includes('aligned') || name.includes('aligned')) {
        badges.push('Aligned');
      }
      
      // Check for specific translation types
      if (description.includes('literal') || name.includes('literal') || id === 'ult') {
        badges.push('Literal');
      } else if (description.includes('simplified') || name.includes('simplified') || id === 'ust') {
        badges.push('Simplified');
      } else if (description.includes('dynamic') || name.includes('dynamic') || id === 'udb') {
        badges.push('Dynamic');
      } else if (description.includes('gateway') || name.includes('gateway') || id === 'glt') {
        badges.push('Gateway');
      } else if (description.includes('interlinear') || name.includes('interlinear')) {
        badges.push('Interlinear');
      } else if (description.includes('original') || name.includes('original') || id.includes('ugnt') || id.includes('uhb')) {
        badges.push('Original');
      }
      
      return badges;
    }
    
    return [];
  };

  // Get resource avatar with priority: direct avatar > biblical icons > organization avatar > general icon
  const getResourceAvatar = (resource) => {
    // Priority 1: Direct resource avatar (if explicitly set)
    if (resource.avatarUrl || resource.avatar_url) {
      return {
        type: 'image',
        src: resource.avatarUrl || resource.avatar_url,
        alt: getResourceDisplayName(resource)
      };
    }
    
    // Priority 2: Biblical icons for Bible resources (higher priority than org avatar)
    if (resourceType === 'bible' || resource.subject === 'Bible' || resource.subject === 'Aligned Bible') {
      return {
        type: 'emoji',
        value: getResourceBookIcon(resource)
      };
    }
    
    // Priority 3: Organization avatar from metadata
    if (resource.organizationData?.avatar_url) {
      return {
        type: 'image', 
        src: resource.organizationData.avatar_url,
        alt: resource.organization
      };
    }
    
    // Priority 4: General resource icon emoji
    return {
      type: 'emoji',
      value: getResourceIcon(resource.id)
    };
  };

  // Get resource metrics for display
  const getResourceMetrics = (resource) => {
    const metrics = {
      stars: resource.stars_count || resource.stargazers_count || 0,
      watchers: resource.watchers_count || 0,
      forks: resource.forks_count || 0
    };
    
    // Only return metrics if at least one has a value > 0
    if (metrics.stars > 0 || metrics.watchers > 0 || metrics.forks > 0) {
      return metrics;
    }
    
    return null;
  };

  const createResourceMetricBadges = (metrics) => {
    if (!metrics) return [];
    
    // Convert resource metrics to organization metrics format for consistency
    const organizationMetricsFormat = {
      totalStars: metrics.stars,
      totalWatchers: metrics.watchers,
      totalForks: metrics.forks,
      resourceCount: 1 // Single resource
    };
    
    // Use the same createMetricBadges function for consistency
    return createMetricBadges(organizationMetricsFormat);
  };

  return (
    <div className={styles.selectorContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.spacer} />
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          autoFocus
        />
      </div>

      {/* Resource Groups - Decluttered Design */}
      <div className={styles.listContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading resources...</div>
        ) : error ? (
          <div className={styles.emptyState}>{error}</div>
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map(group => {
            const isExpanded = expandedGroups.has(group.organization.id);
            const resourceCount = group.resources.length;
            
            return (
              <div key={group.organization.id} className={styles.resourceGroup}>
                {/* Organization Header - Avatar First Design */}
                <div 
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(group.organization.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGroup(group.organization.id);
                    }
                  }}
                >
                  {/* Organization Avatar */}
                  <div className={styles.organizationAvatar}>
                    {group.organization.avatar_url ? (
                      <img 
                        src={group.organization.avatar_url} 
                        alt={group.organization.full_name || group.organization.name}
                        className={styles.avatarImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={styles.avatarFallback}
                      style={{ display: group.organization.avatar_url ? 'none' : 'flex' }}
                    >
                      {getOrganizationAvatar(group.organization).value}
                    </div>
                  </div>

                  <div className={styles.organizationInfo}>
                    <h4 className={styles.organizationName}>{group.organization.name}</h4>
                    <div className={styles.organizationStats}>
                      <span className={styles.resourceCount}>
                        {resourceCount} {resourceCount === 1 ? 'resource' : 'resources'}
                      </span>
                      {group.metrics && group.metrics.score >= 0 && (
                        <span className={styles.tierBadge}>
                          {getTierDisplayInfo(group.metrics.tier).icon}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Organization Metrics - Compact */}
                  {group.metrics && group.metrics.score >= 0 && (
                    <div className={styles.organizationMetrics}>
                      {createMetricBadges(group.metrics).slice(0, 3).map(badge => (
                        <div 
                          key={badge.type} 
                          className={styles.metricBadge}
                          title={badge.tooltip}
                        >
                          <span className={styles.metricIcon}>{badge.icon}</span>
                          <span className={styles.metricValue}>{badge.displayValue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={styles.expandButton}>
                    <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
                      ▶
                    </span>
                  </div>
                </div>
                
                {/* Resources List - Clean Layout */}
                {isExpanded && (
                  <div className={styles.resourcesList}>
                    {group.resources.map(resource => {
                      const avatar = getResourceAvatar(resource);
                      const metrics = getResourceMetrics(resource);
                      
                      return (
                        <button
                          key={`${resource.organization}-${resource.id}`}
                          onClick={() => handleResourceSelect(resource)}
                          className={styles.resourceItem}
                        >
                          {/* Resource Avatar/Icon */}
                          <div className={styles.resourceIcon}>
                            {avatar.type === 'image' ? (
                              <img 
                                src={avatar.src} 
                                alt={avatar.alt}
                                className={styles.resourceAvatarImage}
                                onError={(e) => {
                                  // Fallback to emoji on error
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={styles.resourceIconFallback}
                              style={{ display: avatar.type === 'image' ? 'none' : 'flex' }}
                            >
                              {avatar.value}
                            </div>
                          </div>

                          <div className={styles.resourceContent}>
                            <div className={styles.resourceName}>
                              {getResourceDisplayName(resource)}
                            </div>
                            
                            {/* Resource Type Badges - Multiple Separate Badges */}
                            {getResourceBadges(resource).length > 0 && (
                              <div className={styles.resourceBadges}>
                                {getResourceBadges(resource).map((badge, index) => (
                                  <span key={index} className={styles.resourceBadge}>
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Book Count - Only show if meaningful */}
                            {(getBookCount(resource) !== null && getBookCount(resource) > 0) && (
                              <div className={styles.bookCount}>
                                <BookCountDisplay resource={resource} />
                              </div>
                            )}
                          </div>

                          {/* Resource Metrics - Compact */}
                          {metrics && (
                            <div className={styles.resourceMetrics}>
                              {createResourceMetricBadges(metrics).map(badge => (
                                <div 
                                  key={badge.type} 
                                  className={styles.resourceMetricBadge}
                                  title={badge.tooltip}
                                >
                                  <span className={styles.resourceMetricIcon}>{badge.icon}</span>
                                  <span className={styles.resourceMetricValue}>{badge.displayValue}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            {searchTerm ? 'No resources found' : emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
