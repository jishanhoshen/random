import { describe, it, expect } from 'vitest';
import { formatOutput } from './formatOutput';

describe('formatOutput', () => {
  const testStrings = ['abc123', 'xyz789', 'test'];

  it('should format with line breaks (default)', () => {
    const result = formatOutput(testStrings, { format: 'linebreak' });
    expect(result).toBe('abc123\nxyz789\ntest');
  });

  it('should format with commas', () => {
    const result = formatOutput(testStrings, { format: 'comma' });
    expect(result).toBe('abc123, xyz789, test');
  });

  it('should format as CSV without array wrapper', () => {
    const result = formatOutput(testStrings, { format: 'csv', wrapArray: false });
    expect(result).toBe('"abc123", "xyz789", "test"');
  });

  it('should format as CSV with array wrapper', () => {
    const result = formatOutput(testStrings, { format: 'csv', wrapArray: true });
    expect(result).toBe('["abc123", "xyz789", "test"]');
  });

  it('should handle empty array', () => {
    const result = formatOutput([], { format: 'linebreak' });
    expect(result).toBe('');
  });

  it('should handle single string', () => {
    const result = formatOutput(['single'], { format: 'linebreak' });
    expect(result).toBe('single');
  });

  it('should handle CSV with special characters in strings', () => {
    const strings = ['test"quote', 'test,comma', 'normal'];
    const result = formatOutput(strings, { format: 'csv', wrapArray: true });
    expect(result).toBe('["test\\"quote", "test,comma", "normal"]');
  });
});
