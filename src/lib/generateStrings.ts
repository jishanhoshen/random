import { CHARSETS, filterAmbiguousChars } from './charsets';

export interface CharsetOptions {
  letters: boolean;
  numbers: boolean;
  special: boolean;
  letterCase: 'uppercase' | 'lowercase' | 'both';
}

export interface GenerateOptions {
  count: number;
  length: number;
  charsetOptions: CharsetOptions;
  readable: boolean;
}

function buildCharset(options: CharsetOptions, readable: boolean): string {
  let charset = '';

  if (options.letters) {
    if (options.letterCase === 'uppercase') {
      charset += CHARSETS.uppercase;
    } else if (options.letterCase === 'lowercase') {
      charset += CHARSETS.lowercase;
    } else {
      charset += CHARSETS.letters;
    }
  }

  if (options.numbers) {
    charset += CHARSETS.numbers;
  }

  if (options.special) {
    charset += CHARSETS.special;
  }

  if (readable) {
    charset = filterAmbiguousChars(charset);
  }

  return charset;
}

function getRandomIndex(max: number): number {
  const array = new Uint32Array(1);
  const range = 0x100000000;

  let randomValue: number;
  do {
    crypto.getRandomValues(array);
    randomValue = array[0];
  } while (randomValue >= range - (range % max));

  return randomValue % max;
}

function generateString(length: number, charset: string): string {
  const charsetLength = charset.length;
  const result = new Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = charset[getRandomIndex(charsetLength)];
  }

  return result.join('');
}

export function generateStrings(options: GenerateOptions): string[] {
  const charset = buildCharset(options.charsetOptions, options.readable);

  if (charset.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  const results: string[] = [];

  for (let i = 0; i < options.count; i++) {
    results.push(generateString(options.length, charset));
  }

  return results;
}
