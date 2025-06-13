import { describe, it, expect } from 'vitest';
import { parseNaturalReference } from './parseNaturalReference';

describe('parseNaturalReference', () => {
  it('parses 3-letter book code', () => {
    expect(parseNaturalReference('JHN 3:16')).toEqual({ bookId: 'jhn', chapter: '3', verse: '16' });
  });

  it('parses full book name', () => {
    expect(parseNaturalReference('John 3:16')).toEqual({ bookId: 'jhn', chapter: '3', verse: '16' });
  });

  it('parses with verse range', () => {
    expect(parseNaturalReference('3JN 1:1-2')).toEqual({ bookId: '3jn', chapter: '1', verse: '1' });
  });

  it('returns null for invalid input', () => {
    expect(parseNaturalReference('nonsense')).toBeNull();
  });
});
