/**
 * Reference Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { referenceStore } from './reference.js';

describe('Reference Store', () => {
  beforeEach(() => {
    // Reset stores to default state
    referenceStore.reference.set({
      bookId: 'gen',
      chapter: 1,
      verse: 1
    });
    referenceStore.organization.set('unfoldingWord');
    referenceStore.languageId.set('en');
    referenceStore.resourceId.set('ult');
  });

  it('should have default values', () => {
    const reference = get(referenceStore.reference);
    const organization = get(referenceStore.organization);
    const languageId = get(referenceStore.languageId);
    const resourceId = get(referenceStore.resourceId);
    
    expect(reference).toEqual({
      bookId: 'gen',
      chapter: 1,
      verse: 1
    });
    expect(organization).toBe('unfoldingWord');
    expect(languageId).toBe('en');
    expect(resourceId).toBe('ult');
  });

  it('should update reference correctly', () => {
    const newReference = {
      bookId: 'jhn',
      chapter: 3,
      verse: 16
    };
    
    referenceStore.updateContext({
      reference: newReference
    });
    
    const updatedReference = get(referenceStore.reference);
    expect(updatedReference).toEqual(newReference);
  });

  it('should update organization correctly', () => {
    referenceStore.updateContext({
      organization: 'door43'
    });
    
    const updatedOrganization = get(referenceStore.organization);
    expect(updatedOrganization).toBe('door43');
  });

  it('should generate correct scripture path', () => {
    const currentScripture = get(referenceStore.currentScripture);
    expect(currentScripture).toContain('/unfoldingWord/en/ult/gen/1/1');
  });
});