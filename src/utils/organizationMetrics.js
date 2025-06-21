/**
 * organizationMetrics.js
 * Utility functions for calculating organization priority based on repository metrics
 * Used consistently across both Scripture and Translation Helps resource selection
 */

/**
 * Calculate organization score based on repository metrics
 * @param {Array} resources - Array of resources for an organization
 * @returns {Object} Aggregated metrics and score
 */
export function calculateOrganizationMetrics(resources) {
  if (!resources || !Array.isArray(resources) || resources.length === 0) {
    return {
      totalStars: 0,
      totalForks: 0,
      totalWatchers: 0,
      totalSize: 0,
      resourceCount: 0,
      averageStars: 0,
      averageForks: 0,
      averageWatchers: 0,
      score: 0,
      tier: 'unknown'
    };
  }

  const metrics = resources.reduce((acc, resource) => {
    return {
      totalStars: acc.totalStars + (resource.stars_count || 0),
      totalForks: acc.totalForks + (resource.forks_count || 0),
      totalWatchers: acc.totalWatchers + (resource.watchers_count || 0),
      totalSize: acc.totalSize + (resource.size || 0),
      resourceCount: acc.resourceCount + 1
    };
  }, {
    totalStars: 0,
    totalForks: 0,
    totalWatchers: 0,
    totalSize: 0,
    resourceCount: 0
  });

  // Calculate averages
  const averageStars = metrics.resourceCount > 0 ? metrics.totalStars / metrics.resourceCount : 0;
  const averageForks = metrics.resourceCount > 0 ? metrics.totalForks / metrics.resourceCount : 0;
  const averageWatchers = metrics.resourceCount > 0 ? metrics.totalWatchers / metrics.resourceCount : 0;

  // Calculate weighted score (stars have highest weight, then watchers, then forks)
  const score = (metrics.totalStars * 3) + (metrics.totalWatchers * 2) + (metrics.totalForks * 1);

  // Determine tier based on score
  let tier = 'unknown';
  if (score >= 100) tier = 'premier';
  else if (score >= 50) tier = 'established';
  else if (score >= 20) tier = 'emerging';
  else if (score >= 5) tier = 'community';
  else tier = 'experimental';

  return {
    ...metrics,
    averageStars,
    averageForks,
    averageWatchers,
    score,
    tier
  };
}

/**
 * Sort organizations by their community engagement metrics
 * @param {Array} organizations - Array of organization objects with resources
 * @returns {Array} Sorted organizations (highest engagement first)
 */
export function sortOrganizationsByMetrics(organizations) {
  return organizations.map(org => ({
    ...org,
    metrics: calculateOrganizationMetrics(org.resources)
  })).sort((a, b) => {
    // Primary sort: by score (descending)
    if (b.metrics.score !== a.metrics.score) {
      return b.metrics.score - a.metrics.score;
    }
    
    // Secondary sort: by resource count (more resources = more established)
    if (b.metrics.resourceCount !== a.metrics.resourceCount) {
      return b.metrics.resourceCount - a.metrics.resourceCount;
    }
    
    // Tertiary sort: alphabetical by name
    return a.organization.name.localeCompare(b.organization.name);
  });
}

/**
 * Get tier display information
 * @param {string} tier - The tier level
 * @returns {Object} Display information for the tier
 */
export function getTierDisplayInfo(tier) {
  const tierInfo = {
    premier: {
      label: 'Premier',
      description: 'Highly trusted with extensive community engagement',
      color: '#10b981', // green
      icon: '🏆',
      badge: 'Premier'
    },
    established: {
      label: 'Established',
      description: 'Well-established with strong community support',
      color: '#3b82f6', // blue
      icon: '⭐',
      badge: 'Established'
    },
    emerging: {
      label: 'Emerging',
      description: 'Growing community engagement',
      color: '#8b5cf6', // purple
      icon: '🌟',
      badge: 'Emerging'
    },
    community: {
      label: 'Community',
      description: 'Community-driven project',
      color: '#f59e0b', // amber
      icon: '👥',
      badge: 'Community'
    },
    experimental: {
      label: 'Experimental',
      description: 'New or experimental project',
      color: '#6b7280', // gray
      icon: '🧪',
      badge: 'Experimental'
    },
    unknown: {
      label: 'Unknown',
      description: 'Metrics not available',
      color: '#9ca3af', // gray
      icon: '❓',
      badge: null
    }
  };

  return tierInfo[tier] || tierInfo.unknown;
}

/**
 * Format metric numbers for display
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatMetricNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return num.toString();
  }
}

/**
 * Get recommendation text based on metrics
 * @param {Object} metrics - Organization metrics
 * @returns {string} Recommendation text
 */
export function getRecommendationText(metrics) {
  if (metrics.score >= 100) {
    return `Highly recommended (${formatMetricNumber(metrics.totalStars)} stars, ${formatMetricNumber(metrics.totalWatchers)} watchers)`;
  } else if (metrics.score >= 50) {
    return `Recommended (${formatMetricNumber(metrics.totalStars)} stars, ${formatMetricNumber(metrics.totalWatchers)} watchers)`;
  } else if (metrics.score >= 20) {
    return `Good choice (${formatMetricNumber(metrics.totalStars)} stars, ${formatMetricNumber(metrics.totalWatchers)} watchers)`;
  } else if (metrics.score >= 5) {
    return `Community project (${formatMetricNumber(metrics.totalStars)} stars, ${formatMetricNumber(metrics.totalWatchers)} watchers)`;
  } else {
    return `Experimental (${formatMetricNumber(metrics.totalStars)} stars, ${formatMetricNumber(metrics.totalWatchers)} watchers)`;
  }
}

/**
 * Create metric badges data for display
 * @param {Object} metrics - Organization metrics
 * @returns {Array} Array of badge objects
 */
export function createMetricBadges(metrics) {
  return [
    {
      type: 'stars',
      icon: '⭐',
      value: metrics.totalStars,
      displayValue: formatMetricNumber(metrics.totalStars),
      tooltip: `${metrics.totalStars} stars across ${metrics.resourceCount} repositories`
    },
    {
      type: 'watchers',
      icon: '👁',
      value: metrics.totalWatchers,
      displayValue: formatMetricNumber(metrics.totalWatchers),
      tooltip: `${metrics.totalWatchers} watchers across ${metrics.resourceCount} repositories`
    },
    {
      type: 'forks',
      icon: '🍴',
      value: metrics.totalForks,
      displayValue: formatMetricNumber(metrics.totalForks),
      tooltip: `${metrics.totalForks} forks across ${metrics.resourceCount} repositories`
    }
  ].filter(badge => badge.value > 0); // Only show badges with non-zero values
} 