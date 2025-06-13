import { parseTsv } from './parseTsv';

describe('parseTsv', () => {
  const sampleTsv = [
    'A\tB\tC',
    '1\t2\t3',
    '4\t5',
    '# comment should be ignored',
    '6\t7\t8',
  ].join('\n');

  it('parses header and rows into objects', () => {
    const result = parseTsv(sampleTsv);
    expect(result).toEqual([
      { A: '1', B: '2', C: '3' },
      { A: '4', B: '5', C: '' },
      { A: '6', B: '7', C: '8' },
    ]);
  });

  it('returns empty array for empty or comment-only text', () => {
    expect(parseTsv('')).toEqual([]);
    expect(parseTsv('# no data')).toEqual([]);
  });

  it('converts literal "\\n" sequences to newlines', () => {
    const tsvWithNewlines = ['A\tB', '1\tline1\\nline2'].join('\n');
    const result = parseTsv(tsvWithNewlines);
    expect(result[0].B).toBe('line1\nline2');
  });
});