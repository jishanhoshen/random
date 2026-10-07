import { describe, it, expect } from 'vitest';
import { generateStrings } from './generateStrings';

describe('generateStrings', () => {
  it('should generate the correct number of strings', () => {
    const result = generateStrings({
      count: 5,
      length: 10,
      charsetOptions: {
        letters: true,
        numbers: false,
        special: false,
        letterCase: 'both',
      },
      readable: false,
    });

    expect(result).toHaveLength(5);
  });

  it('should generate strings of the correct length', () => {
    const result = generateStrings({
      count: 3,
      length: 15,
      charsetOptions: {
        letters: true,
        numbers: false,
        special: false,
        letterCase: 'both',
      },
      readable: false,
    });

    result.forEach((str) => {
      expect(str).toHaveLength(15);
    });
  });

  it('should handle max length', () => {
    const result = generateStrings({
      count: 2,
      length: 64,
      charsetOptions: {
        letters: true,
        numbers: true,
        special: false,
        letterCase: 'both',
      },
      readable: false,
    });

    result.forEach((str) => {
      expect(str).toHaveLength(64);
    });
  });

  it('should only use letters when letters only is selected', () => {
    const result = generateStrings({
      count: 10,
      length: 20,
      charsetOptions: {
        letters: true,
        numbers: false,
        special: false,
        letterCase: 'both',
      },
      readable: false,
    });

    const allChars = result.join('');
    expect(allChars).toMatch(/^[a-zA-Z]+$/);
  });

  it('should only use numbers when numbers only is selected', () => {
    const result = generateStrings({
      count: 10,
      length: 20,
      charsetOptions: {
        letters: false,
        numbers: true,
        special: false,
        letterCase: 'both',
      },
      readable: false,
    });

    const allChars = result.join('');
    expect(allChars).toMatch(/^[0-9]+$/);
  });

  it('should only use special characters when special only is selected', () => {
    const result = generateStrings({
      count: 10,
      length: 20,
      charsetOptions: {
        letters: false,
        numbers: false,
        special: true,
        letterCase: 'both',
      },
      readable: false,
    });

    const allChars = result.join('');
    const specialCharset = '!@#$%^&*()-_=+[]{};:,.<>?';
    const uniqueChars = new Set(allChars);
    uniqueChars.forEach((char) => {
      expect(specialCharset).toContain(char);
    });
  });

  it('should use uppercase only when letterCase is uppercase', () => {
    const result = generateStrings({
      count: 10,
      length: 20,
      charsetOptions: {
        letters: true,
        numbers: false,
        special: false,
        letterCase: 'uppercase',
      },
      readable: false,
    });

    const allChars = result.join('');
    expect(allChars).toMatch(/^[A-Z]+$/);
  });

  it('should use lowercase only when letterCase is lowercase', () => {
    const result = generateStrings({
      count: 10,
      length: 20,
      charsetOptions: {
        letters: true,
        numbers: false,
        special: false,
        letterCase: 'lowercase',
      },
      readable: false,
    });

    const allChars = result.join('');
    expect(allChars).toMatch(/^[a-z]+$/);
  });

  it('should exclude ambiguous characters in readable mode', () => {
    const result = generateStrings({
      count: 50,
      length: 10,
      charsetOptions: {
        letters: true,
        numbers: true,
        special: false,
        letterCase: 'both',
      },
      readable: true,
    });

    const allChars = result.join('');
    expect(allChars).not.toMatch(/[1lIi0Oo]/);
  });

  it('should throw error when no character types are selected', () => {
    expect(() =>
      generateStrings({
        count: 5,
        length: 10,
        charsetOptions: {
          letters: false,
          numbers: false,
          special: false,
          letterCase: 'both',
        },
        readable: false,
      }),
    ).toThrow('At least one character type must be selected');
  });

  it('should handle mixed character types', () => {
    const result = generateStrings({
      count: 10,
      length: 20,
      charsetOptions: {
        letters: true,
        numbers: true,
        special: true,
        letterCase: 'both',
      },
      readable: false,
    });

    const mixedCharset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>?';
    result.forEach((str) => {
      expect(str).toHaveLength(20);
      const uniqueChars = new Set(str);
      uniqueChars.forEach((char) => {
        expect(mixedCharset).toContain(char);
      });
    });
  });
});
