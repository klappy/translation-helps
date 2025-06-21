/**
 * Tests for organizationMetrics utility functions
 */

import { describe, it, expect } from 'vitest';
import { 
  calculateOrganizationMetrics, 
  sortOrganizationsByMetrics,
  getTierDisplayInfo,
  formatMetricNumber,
  getRecommendationText,
  createMetricBadges
} from './organizationMetrics';

describe('organizationMetrics', () => {
  describe('calculateOrganizationMetrics', () => {
    it('should calculate metrics correctly for valid resources', () => {
      const resources = [
        { stars_count: 10, forks_count: 5, watchers_count: 8, size: 1000 },
        { stars_count: 20, forks_count: 3, watchers_count: 12, size: 2000 },
        { stars_count: 5, forks_count: 2, watchers_count: 6, size: 500 }
      ];

      const metrics = calculateOrganizationMetrics(resources);

      expect(metrics).toEqual({
        totalStars: 35,
        totalForks: 10,
        totalWatchers: 26,
        totalSize: 3500,
        resourceCount: 3,
        averageStars: 35/3,
        averageForks: 10/3,
        averageWatchers: 26/3,
        score: (35 * 3) + (26 * 2) + (10 * 1), // 105 + 52 + 10 = 167
        tier: 'premier'
      });
    });

    it('should handle empty or invalid resources', () => {
      const metrics = calculateOrganizationMetrics([]);

      expect(metrics).toEqual({
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
      });
    });

    it('should handle resources with missing metrics', () => {
      const resources = [
        { stars_count: 10 }, // missing forks_count, watchers_count, size
        { forks_count: 5 }, // missing stars_count, watchers_count, size
        {} // missing all metrics
      ];

      const metrics = calculateOrganizationMetrics(resources);

      expect(metrics.totalStars).toBe(10);
      expect(metrics.totalForks).toBe(5);
      expect(metrics.totalWatchers).toBe(0);
      expect(metrics.resourceCount).toBe(3);
    });
  });

  describe('sortOrganizationsByMetrics', () => {
    it('should sort organizations by score (highest first)', () => {
      const organizations = [
        {
          organization: { name: 'Low Score Org' },
          resources: [{ stars_count: 1, forks_count: 1, watchers_count: 1 }] // score = 6
        },
        {
          organization: { name: 'High Score Org' },
          resources: [{ stars_count: 50, forks_count: 10, watchers_count: 30 }] // score = 220
        },
        {
          organization: { name: 'Medium Score Org' },
          resources: [{ stars_count: 10, forks_count: 5, watchers_count: 8 }] // score = 51
        }
      ];

      const sorted = sortOrganizationsByMetrics(organizations);

      expect(sorted[0].organization.name).toBe('High Score Org');
      expect(sorted[1].organization.name).toBe('Medium Score Org');
      expect(sorted[2].organization.name).toBe('Low Score Org');
    });
  });

  describe('getTierDisplayInfo', () => {
    it('should return correct tier info for each tier', () => {
      expect(getTierDisplayInfo('premier').label).toBe('Premier');
      expect(getTierDisplayInfo('premier').icon).toBe('🏆');
      
      expect(getTierDisplayInfo('established').label).toBe('Established');
      expect(getTierDisplayInfo('established').icon).toBe('⭐');
      
      expect(getTierDisplayInfo('unknown').label).toBe('Unknown');
      expect(getTierDisplayInfo('invalid-tier').label).toBe('Unknown');
    });
  });

  describe('formatMetricNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatMetricNumber(999)).toBe('999');
      expect(formatMetricNumber(1000)).toBe('1.0k');
      expect(formatMetricNumber(1500)).toBe('1.5k');
      expect(formatMetricNumber(1000000)).toBe('1.0M');
      expect(formatMetricNumber(2500000)).toBe('2.5M');
    });
  });

  describe('getRecommendationText', () => {
    it('should return appropriate recommendation based on score', () => {
      const highScore = { score: 150, totalStars: 50, totalWatchers: 30 };
      const lowScore = { score: 3, totalStars: 1, totalWatchers: 1 };

      expect(getRecommendationText(highScore)).toContain('Highly recommended');
      expect(getRecommendationText(lowScore)).toContain('Experimental');
    });
  });

  describe('createMetricBadges', () => {
    it('should create badges for non-zero metrics', () => {
      const metrics = {
        totalStars: 100,
        totalWatchers: 50,
        totalForks: 0, // should be filtered out
        resourceCount: 5
      };

      const badges = createMetricBadges(metrics);

      expect(badges).toHaveLength(2); // stars and watchers only
      expect(badges[0].type).toBe('stars');
      expect(badges[0].icon).toBe('⭐');
      expect(badges[0].displayValue).toBe('100');
      expect(badges[1].type).toBe('watchers');
    });
  });
}); 